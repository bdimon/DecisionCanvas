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
  try {
    const { option1, option2, context } = req.body;

    if (!option1 || !option2) {
      return res.status(400).json({ error: 'Пожалуйста, укажите оба варианта решения.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback if no API key
      const localData = generateLocalAnalysis(option1, option2, context);
      return res.json({
        usingAI: false,
        data: localData,
        message: 'Использован встроенный экспертный генератор анализа.'
      });
    }

    const systemInstruction = `Ты — ведущий международный эксперт по теории принятия решений (Decision Intelligence), стратегическому консалтингу и когнитивной психологии.
Твоя цель: провести глубокий, объективный, беспристрастный и практичный сравнительный анализ двух вариантов решений, предложенных пользователем.

Обязательно предоставь структурированный результат на русском языке, включающий 3 формата представления:
1. Подробный список "За" (Pros) и "Против" (Cons) для каждого из вариантов с оценкой веса влияния от 1 (незначительно) до 5 (критически важно) и категорией.
2. Детализированную таблицу сравнения по ключевым универсальным критериям (финансы, риски, временные затраты, долгосрочная отдача, сложность реализации, психологический комфорт) с оценкой каждого варианта от 1 до 10 и аргументацией.
3. Полный SWOT-анализ (Сильные стороны, Слабые стороны, Возможности, Угрозы) отдельно для Варианта 1 и Варианта 2.
4. Окончательный обоснованный вердикт (Verdict): рекомендация победителя ('option1' или 'option2' или 'tie'), процент уверенности, главные решающие факторы (keyDrivers), компромисс (tradeOffSummary) и 3-4 конкретных первых шага для реализации.`;

    const prompt = `Проведи детальный всесторонний сравнительный анализ для выбора между двумя следующими вариантами:

ВАРИАНТ 1: ${option1}
ВАРИАНТ 2: ${option2}
${context ? `ДОПОЛНИТЕЛЬНЫЙ КОНТЕКСТ И ОГРАНИЧЕНИЯ: ${context}` : ''}

Сформируй анализ строго в соответствии со схемой JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
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
      }
    });

    const rawText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(rawText);

    return res.json({
      usingAI: true,
      data: {
        id: 'analysis-' + Date.now(),
        createdAt: new Date().toISOString(),
        context: context || undefined,
        ...parsedData
      }
    });
  } catch (error: any) {
    console.warn('Gemini analysis error, utilizing fallback analytical generator:', error?.message || error);
    const { option1, option2, context } = req.body || {};
    const fallbackData = generateLocalAnalysis(option1 || 'Вариант 1', option2 || 'Вариант 2', context);
    return res.json({
      usingAI: false,
      data: fallbackData,
      note: 'Сгенерировано встроенным модулем экспертного анализа'
    });
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
