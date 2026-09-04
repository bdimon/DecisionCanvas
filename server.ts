import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { generateLocalAnalysis } from './src/data/fallbackGenerator';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Analyze endpoint for comparing 2 options
app.post('/api/analyze', async (req, res) => {
  const { option1, option2, context, language = 'ru' } = req.body || {};
  const isEn = language === 'en';

  const opt1 = typeof option1 === 'string' ? option1.trim() : '';
  const opt2 = typeof option2 === 'string' ? option2.trim() : '';
  const ctx = typeof context === 'string' ? context.trim() || undefined : undefined;

  // Reject empty or whitespace-only inputs
  if (!opt1 || !opt2) {
    return res.status(400).json({
      error: isEn
        ? 'Both decision options are required and cannot be empty.'
        : 'Оба варианта решения обязательны для заполнения и не могут быть пустыми.'
    });
  }

  try {
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback if no API key
      const localData = generateLocalAnalysis(opt1, opt2, ctx, language);
      return res.json({
        usingAI: false,
        data: localData,
        message: isEn ? 'Generated using built-in decision intelligence engine.' : 'Использован встроенный экспертный генератор анализа.'
      });
    }

    const systemInstruction = isEn
      ? `You are an elite international authority in Decision Intelligence, strategic management, and applied cognitive psychology.
Your objective: deliver an in-depth, rigorous, objective, and actionable comparative analysis of two alternative decision options provided by the user.

You MUST provide a structured response strictly in English containing 4 core perspectives:
1. A comprehensive list of Pros and Cons for each option with impact weight ratings from 1 (minor) to 5 (critical) and categorized tags.
2. A detailed multi-criteria Direct Comparison matrix evaluating universal dimensions (financial viability, risk exposure, time investment, long-term ROI, execution complexity, psychological alignment) scored 1–10 with explanatory notes.
3. A complete 4-quadrant SWOT matrix (Strengths, Weaknesses, Opportunities, Threats) separately for Option 1 and Option 2.
4. An authoritative Verdict recommending the optimal winner ('option1', 'option2', or 'tie'), confidence score (0-100), key deciding drivers, primary trade-off summary, and 3-4 concrete next implementation steps.`
      : `Ты — ведущий международный эксперт по теории принятия решений (Decision Intelligence), стратегическому консалтингу и когнитивной психологии.
Твоя цель: провести глубокий, объективный, беспристрастный и практичный сравнительный анализ двух вариантов решений, предложенных пользователем.

Обязательно предоставь структурированный результат на русском языке, включающий 3 формата представления:
1. Подробный список "За" (Pros) и "Против" (Cons) для каждого из вариантов с оценкой веса влияния от 1 (незначительно) до 5 (критически важно) и категорией.
2. Детализированную таблицу сравнения по ключевым универсальным критериям (финансы, риски, временные затраты, долгосрочная отдача, сложность реализации, психологический комфорт) с оценкой каждого варианта от 1 до 10 и аргументацией.
3. Полный SWOT-анализ (Сильные стороны, Слабые стороны, Возможности, Угрозы) отдельно для Варианта 1 и Варианта 2.
4. Окончательный обоснованный вердикт (Verdict): рекомендация победителя ('option1' или 'option2' или 'tie'), процент уверенности, главные решающие факторы (keyDrivers), компромисс (tradeOffSummary) и 3-4 конкретных первых шага для реализации.`;

    const prompt = isEn
      ? `Perform a comprehensive multi-framework comparative analysis between these two choices:

OPTION 1: ${option1}
OPTION 2: ${option2}
${context ? `ADDITIONAL CONTEXT & CONSTRAINTS: ${context}` : ''}

Generate the response strictly compliant with the specified JSON schema in English.`
      : `Проведи детальный всесторонний сравнительный анализ для выбора между двумя следующими вариантами:

ВАРИАНТ 1: ${option1}
ВАРИАНТ 2: ${option2}
${context ? `ДОПОЛНИТЕЛЬНЫЙ КОНТЕКСТ И ОГРАНИЧЕНИЯ: ${context}` : ''}

Сформируй анализ строго в соответствии со схемой JSON.`;

    const contentConfig = {
      systemInstruction,
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          option1Title: { type: Type.STRING },
          option2Title: { type: Type.STRING },
          prosCons: {
            type: Type.OBJECT,
            properties: {
              option1: {
                type: Type.OBJECT,
                properties: {
                  pros: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        weight: { type: Type.INTEGER, description: '1 to 5' },
                        category: { type: Type.STRING }
                      },
                      required: ['id', 'text', 'weight', 'category']
                    }
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        weight: { type: Type.INTEGER, description: '1 to 5' },
                        category: { type: Type.STRING }
                      },
                      required: ['id', 'text', 'weight', 'category']
                    }
                  }
                },
                required: ['pros', 'cons']
              },
              option2: {
                type: Type.OBJECT,
                properties: {
                  pros: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        weight: { type: Type.INTEGER, description: '1 to 5' },
                        category: { type: Type.STRING }
                      },
                      required: ['id', 'text', 'weight', 'category']
                    }
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        weight: { type: Type.INTEGER, description: '1 to 5' },
                        category: { type: Type.STRING }
                      },
                      required: ['id', 'text', 'weight', 'category']
                    }
                  }
                },
                required: ['pros', 'cons']
              }
            },
            required: ['option1', 'option2']
          },
          comparisonTable: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                weight: { type: Type.INTEGER, description: '1 to 5' },
                option1Score: { type: Type.INTEGER, description: '1 to 10' },
                option1Note: { type: Type.STRING },
                option2Score: { type: Type.INTEGER, description: '1 to 10' },
                option2Note: { type: Type.STRING }
              },
              required: [
                'id', 'category', 'title', 'description', 'weight',
                'option1Score', 'option1Note', 'option2Score', 'option2Note'
              ]
            }
          },
          swot: {
            type: Type.OBJECT,
            properties: {
              option1: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['strengths', 'weaknesses', 'opportunities', 'threats']
              },
              option2: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['strengths', 'weaknesses', 'opportunities', 'threats']
              }
            },
            required: ['option1', 'option2']
          },
          verdict: {
            type: Type.OBJECT,
            properties: {
              winner: { type: Type.STRING, description: 'option1, option2 or tie' },
              winnerTitle: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER, description: '0 to 100' },
              summary: { type: Type.STRING },
              keyDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
              tradeOffSummary: { type: Type.STRING },
              recommendedNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['winner', 'winnerTitle', 'confidenceScore', 'summary', 'keyDrivers', 'tradeOffSummary', 'recommendedNextSteps']
          }
        },
        required: ['option1Title', 'option2Title', 'prosCons', 'comparisonTable', 'swot', 'verdict']
      }
    };

    // Candidate models to handle spikes in demand (503 / 429) seamlessly
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let parsedData: any = null;
    let successfulModel = '';

    // Per-model candidate timeout (18s) to prevent request hanging indefinitely
    const MODEL_TIMEOUT_MS = 18000;

    // Track client disconnection to abort AI calls if the client cancels or leaves
    let isClientDisconnected = false;
    req.on('close', () => {
      isClientDisconnected = true;
    });

    for (const modelName of candidateModels) {
      if (isClientDisconnected) {
        console.log('Client disconnected, aborting AI analysis loop.');
        break;
      }

      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
        controller.abort();
      }, MODEL_TIMEOUT_MS);

      // Also abort if the client drops connection mid-flight
      const onReqClose = () => {
        controller.abort();
      };
      req.on('close', onReqClose);

      try {
        const responsePromise = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            ...contentConfig,
            abortSignal: controller.signal,
          },
        });

        // Promise race guarantees we break out even if an underlying HTTP socket hangs
        const timeoutPromise = new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error(`Model ${modelName} request timed out after ${MODEL_TIMEOUT_MS}ms or was aborted`));
          }, { once: true });
        });

        const response = await Promise.race([responsePromise, timeoutPromise]);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        req.off('close', onReqClose);

        const rawText = response.text?.trim() || '{}';
        parsedData = JSON.parse(rawText);
        if (parsedData && parsedData.option1Title && parsedData.verdict) {
          successfulModel = modelName;
          break;
        }
      } catch (callErr: any) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        req.off('close', onReqClose);
        controller.abort();

        if (isClientDisconnected || req.destroyed || res.writableEnded) {
          console.log('Client connection closed, stopping candidate evaluation.');
          break;
        }

        const errMsg = String(callErr?.message || callErr);
        const isTimeout = errMsg.includes('timed out') || errMsg.includes('Timeout') || callErr?.name === 'AbortError';
        const isTemporary = isTimeout || errMsg.includes('503') || errMsg.includes('demand') || errMsg.includes('429') || errMsg.includes('UNAVAILABLE');

        if (isTimeout) {
          console.warn(`Model ${modelName} timed out after ${MODEL_TIMEOUT_MS}ms, attempting fallback model...`);
        } else if (isTemporary) {
          console.log(`Model ${modelName} temporarily busy (${errMsg}), attempting fallback model...`);
          // Brief pause before trying alternative model
          await new Promise((resolve) => setTimeout(resolve, 600));
        } else {
          console.log(`Notice: Model ${modelName} returned notice (${errMsg}), trying next candidate.`);
        }
      }
    }

    if (parsedData && parsedData.option1Title) {
      return res.json({
        usingAI: true,
        model: successfulModel,
        data: {
          id: 'analysis-' + Date.now(),
          createdAt: new Date().toISOString(),
          context: context || undefined,
          ...parsedData
        }
      });
    }

    // Fallback if all models are busy
    console.log('AI models temporarily unavailable due to demand spikes; engaging expert local fallback.');
    const fallbackData = generateLocalAnalysis(opt1, opt2, ctx, language);
    return res.json({
      usingAI: false,
      data: fallbackData,
      note: isEn ? 'Generated by built-in analytical engine' : 'Сгенерировано встроенным модулем аналитического анализа'
    });
  } catch (error: any) {
    console.log('Notice: Fallback engine activated for analysis due to error:', error?.message);
    try {
      const fallbackData = generateLocalAnalysis(opt1, opt2, ctx, language);
      return res.json({
        usingAI: false,
        data: fallbackData,
        note: isEn ? 'Generated by built-in expert engine' : 'Сгенерировано встроенным модулем экспертного анализа'
      });
    } catch (fallbackError: any) {
      return res.status(400).json({
        error: fallbackError.message || (isEn ? 'Failed to analyze options.' : 'Не удалось выполнить анализ вариантов.')
      });
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
