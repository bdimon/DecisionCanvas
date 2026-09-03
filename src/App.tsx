import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DecisionForm } from './components/DecisionForm';
import { ProsConsView } from './components/ProsConsView';
import { ComparisonTableView } from './components/ComparisonTableView';
import { SwotMatrixView } from './components/SwotMatrixView';
import { VerdictCard } from './components/VerdictCard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { generateLocalAnalysis } from './data/fallbackGenerator';
import { PRESET_EXAMPLES } from './data/presets';
import { AnalysisResult, ActiveTab } from './types';
import {
  ListChecks,
  Table,
  Grid2X2,
  Trophy,
  Layers,
  ArrowLeftRight,
  Info,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [isUsingAi, setIsUsingAi] = useState<boolean | null>(null);

  // Initialize with the first realistic preset so the user sees a complete, rich interface right away!
  useEffect(() => {
    const defaultPreset = PRESET_EXAMPLES[0];
    const initialData = generateLocalAnalysis(
      defaultPreset.option1,
      defaultPreset.option2,
      defaultPreset.context
    );
    setAnalysis(initialData);
  }, []);

  const handleStartAnalysis = async (option1: string, option2: string, context?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option1, option2, context }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resData = await response.json();

      if (resData.data) {
        setAnalysis(resData.data);
        setIsUsingAi(Boolean(resData.usingAI));
      } else {
        // Use intelligent local generator
        const local = generateLocalAnalysis(option1, option2, context);
        setAnalysis(local);
        setIsUsingAi(false);
      }
    } catch {
      // Resilient fallback so app never hangs
      console.log('Notice: Fallback engine activated on client.');
      const local = generateLocalAnalysis(option1, option2, context);
      setAnalysis(local);
      setIsUsingAi(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
  };

  // Recompute overall winner dynamically if user changes criteria or pros/cons weights
  const calculatedWinner = useMemo(() => {
    if (!analysis) return { winner: 'tie' as const, winnerTitle: '', score1: 50, score2: 50 };

    const totalWeight = analysis.comparisonTable.reduce((sum, c) => sum + c.weight, 0) || 1;
    const weighted1 = analysis.comparisonTable.reduce((sum, c) => sum + (c.option1Score * c.weight), 0);
    const weighted2 = analysis.comparisonTable.reduce((sum, c) => sum + (c.option2Score * c.weight), 0);

    const score1 = (weighted1 / (totalWeight * 10)) * 100;
    const score2 = (weighted2 / (totalWeight * 10)) * 100;

    let winner: 'option1' | 'option2' | 'tie' = 'tie';
    if (score1 > score2 + 1) winner = 'option1';
    else if (score2 > score1 + 1) winner = 'option2';

    return {
      winner,
      winnerTitle: winner === 'option1' ? analysis.option1Title : winner === 'option2' ? analysis.option2Title : 'Паритет',
      score1,
      score2
    };
  }, [analysis]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      <Header hasResult={Boolean(analysis)} onReset={handleReset} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Input Form */}
        <DecisionForm
          onSubmit={handleStartAnalysis}
          isLoading={isLoading}
        />

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center justify-between shadow-2xs">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold uppercase tracking-wider text-rose-700 hover:text-rose-900"
            >
              Закрыть
            </button>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
            {/* Options Header Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                      Сравниваемые альтернативы
                    </span>
                    {isUsingAi !== null && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isUsingAi ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                        {isUsingAi ? 'Gemini 3.8 Flash' : 'Экспертный скоринг'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-800 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100/80">
                      A. {analysis.option1Title}
                    </span>
                    <span className="text-xs font-bold text-slate-400">vs</span>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100/80">
                      B. {analysis.option2Title}
                    </span>
                  </div>
                  {analysis.context && (
                    <p className="text-xs text-slate-500 mt-1.5 flex items-center space-x-1">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Контекст: {analysis.context}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Quick Score Pill */}
              <div className="flex items-center space-x-3 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200 self-start md:self-auto shadow-2xs">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                    Счет моделей
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {calculatedWinner.score1.toFixed(0)}% vs {calculatedWinner.score2.toFixed(0)}%
                  </span>
                </div>
                <div className="h-7 w-[1px] bg-slate-200" />
                <div className="text-xs font-bold text-indigo-700">
                  {calculatedWinner.winner === 'option1' ? 'Перевес Варианта A' : calculatedWinner.winner === 'option2' ? 'Перевес Варианта B' : 'Равный паритет'}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-200/60 p-1 rounded-xl inline-flex gap-1 w-full sm:w-auto overflow-x-auto border border-slate-200/80">
              <button
                type="button"
                id="tab-all"
                onClick={() => setActiveTab('all')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Полный обзор</span>
              </button>

              <button
                type="button"
                id="tab-pros-cons"
                onClick={() => setActiveTab('pros-cons')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'pros-cons'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
                <span>«За» и «Против»</span>
              </button>

              <button
                type="button"
                id="tab-comparison"
                onClick={() => setActiveTab('comparison')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'comparison'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-indigo-600" />
                <span>Таблица сравнения</span>
              </button>

              <button
                type="button"
                id="tab-swot"
                onClick={() => setActiveTab('swot')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'swot'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Grid2X2 className="w-3.5 h-3.5 text-sky-600" />
                <span>SWOT-анализ</span>
              </button>

              <button
                type="button"
                id="tab-verdict"
                onClick={() => setActiveTab('verdict')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'verdict'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Вердикт и рекомендации</span>
              </button>
            </div>

            {/* Tab Views */}
            <div className="space-y-8">
              {/* Tab: All (Combined comprehensive dashboard) */}
              {activeTab === 'all' && (
                <div className="space-y-8">
                  {/* Verdict on top */}
                  <VerdictCard
                    analysis={analysis}
                    calculatedWinner={calculatedWinner}
                  />

                  {/* Section 1: Pros & Cons */}
                  <section id="section-pros-cons" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">1</span>
                        <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                          Перечень «За» и «Против» (Pros & Cons)
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        Взвешенные аргументы с оценкой силы влияния
                      </span>
                    </div>
                    <ProsConsView
                      prosCons={analysis.prosCons}
                      option1Title={analysis.option1Title}
                      option2Title={analysis.option2Title}
                      onChange={(updated) => setAnalysis({ ...analysis, prosCons: updated })}
                    />
                  </section>

                  {/* Section 2: Comparison Table */}
                  <section id="section-comparison-table" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">2</span>
                        <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                          Таблица многокритериального сравнения (Direct Comparison)
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        Оценка параметров от 1 до 10 с весовыми коэффициентами
                      </span>
                    </div>
                    <ComparisonTableView
                      criteria={analysis.comparisonTable}
                      option1Title={analysis.option1Title}
                      option2Title={analysis.option2Title}
                      onChange={(updated) => setAnalysis({ ...analysis, comparisonTable: updated })}
                    />
                  </section>

                  {/* Section 3: SWOT Matrix */}
                  <section id="section-swot-matrix" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-white text-xs font-bold flex items-center justify-center shadow-2xs">3</span>
                        <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                          SWOT-анализ вариантов
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        Силы, слабости, возможности и угрозы каждого пути
                      </span>
                    </div>
                    <SwotMatrixView
                      swot={analysis.swot}
                      option1Title={analysis.option1Title}
                      option2Title={analysis.option2Title}
                      onChange={(updated) => setAnalysis({ ...analysis, swot: updated })}
                    />
                  </section>
                </div>
              )}

              {/* Tab: Pros & Cons only */}
              {activeTab === 'pros-cons' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 text-base mb-1">
                      Перечень аргументов «За» и «Против»
                    </h3>
                    <p className="text-xs text-slate-500">
                      Сравните баланс плюсов и минусов для каждого пути. Вы можете добавлять собственные аргументы или удалять существующие.
                    </p>
                  </div>
                  <ProsConsView
                    prosCons={analysis.prosCons}
                    option1Title={analysis.option1Title}
                    option2Title={analysis.option2Title}
                    onChange={(updated) => setAnalysis({ ...analysis, prosCons: updated })}
                  />
                </div>
              )}

              {/* Tab: Comparison Table only */}
              {activeTab === 'comparison' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 text-base mb-1">
                      Матричная таблица сравнения по ключевым факторам
                    </h3>
                    <p className="text-xs text-slate-500">
                      Настраивайте оценки и веса критериев, чтобы увидеть математический перевес одного варианта над другим.
                    </p>
                  </div>
                  <ComparisonTableView
                    criteria={analysis.comparisonTable}
                    option1Title={analysis.option1Title}
                    option2Title={analysis.option2Title}
                    onChange={(updated) => setAnalysis({ ...analysis, comparisonTable: updated })}
                  />
                </div>
              )}

              {/* Tab: SWOT only */}
              {activeTab === 'swot' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 text-base mb-1">
                      SWOT-анализ альтернатив
                    </h3>
                    <p className="text-xs text-slate-500">
                      Классический стратегический инструмент: выявление внутренних сильных/слабых сторон и внешних возможностей/угроз.
                    </p>
                  </div>
                  <SwotMatrixView
                    swot={analysis.swot}
                    option1Title={analysis.option1Title}
                    option2Title={analysis.option2Title}
                    onChange={(updated) => setAnalysis({ ...analysis, swot: updated })}
                  />
                </div>
              )}

              {/* Tab: Verdict only */}
              {activeTab === 'verdict' && (
                <div className="space-y-4">
                  <VerdictCard
                    analysis={analysis}
                    calculatedWinner={calculatedWinner}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>DecisionCanvas • Выбор решения из 2-х вариантов</span>
          <span className="text-slate-400">Форматы: «За» и «Против» • Сравнительная таблица • SWOT-матрица</span>
        </div>
      </footer>

      <OfflineIndicator />
    </div>
  );
}
