import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DecisionForm } from './components/DecisionForm';
import { ProsConsView } from './components/ProsConsView';
import { ComparisonTableView } from './components/ComparisonTableView';
import { SwotMatrixView } from './components/SwotMatrixView';
import { VerdictCard } from './components/VerdictCard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AndroidVirtualDevice } from './components/AndroidVirtualDevice';
import { generateLocalAnalysis } from './data/fallbackGenerator';
import { getPresets } from './data/presets';
import { AnalysisResult, ActiveTab } from './types';
import { useLanguage } from './i18n/LanguageContext';
import {
  ListChecks,
  Table,
  Grid2X2,
  Trophy,
  Layers,
  ArrowLeftRight,
  Info
} from 'lucide-react';

export default function App() {
  const { language, t } = useLanguage();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [isUsingAi, setIsUsingAi] = useState<boolean | null>(null);
  const [isAndroidView, setIsAndroidView] = useState(false);

  // Initialize with the localized preset on mount and when language changes (if on default)
  useEffect(() => {
    const presets = getPresets(language);
    const defaultPreset = presets[0];
    const initialData = generateLocalAnalysis(
      defaultPreset.option1,
      defaultPreset.option2,
      defaultPreset.context,
      language
    );
    setAnalysis(initialData);
  }, [language]);

  const handleStartAnalysis = async (option1: string, option2: string, context?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option1, option2, context, language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resData = await response.json();

      if (resData.data) {
        setAnalysis(resData.data);
        setIsUsingAi(Boolean(resData.usingAI));
      } else {
        // Use intelligent local generator with current language
        const local = generateLocalAnalysis(option1, option2, context, language);
        setAnalysis(local);
        setIsUsingAi(false);
      }
    } catch {
      // Resilient fallback so app never hangs
      console.log('Notice: Fallback engine activated on client.');
      const local = generateLocalAnalysis(option1, option2, context, language);
      setAnalysis(local);
      setIsUsingAi(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const presets = getPresets(language);
    const defaultPreset = presets[0];
    const initialData = generateLocalAnalysis(
      defaultPreset.option1,
      defaultPreset.option2,
      defaultPreset.context,
      language
    );
    setAnalysis(initialData);
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
      winnerTitle: winner === 'option1' ? analysis.option1Title : winner === 'option2' ? analysis.option2Title : t.verdict.tie,
      score1,
      score2
    };
  }, [analysis, t.verdict.tie]);

  // Main application content
  const appContent = (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      <Header
        hasResult={Boolean(analysis)}
        onReset={handleReset}
        onPrint={() => window.print()}
        isAndroidView={isAndroidView}
        onToggleAndroidView={() => setIsAndroidView(!isAndroidView)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6">
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
              className="text-xs font-bold uppercase tracking-wider text-rose-700 hover:text-rose-900 cursor-pointer"
            >
              {language === 'en' ? 'Dismiss' : 'Закрыть'}
            </button>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
            {/* Options Header Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                      {language === 'en' ? 'Compared Alternatives' : 'Сравниваемые альтернативы'}
                    </span>
                    {isUsingAi !== null && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isUsingAi ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                        {isUsingAi ? 'Gemini 3.8 Flash' : (language === 'en' ? 'Local Scoring' : 'Экспертный скоринг')}
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
                      <span>{language === 'en' ? 'Context' : 'Контекст'}: {analysis.context}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Quick Score Pill */}
              <div className="flex items-center space-x-3 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200 self-start md:self-auto shadow-2xs">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                    {language === 'en' ? 'Engine Score' : 'Счет моделей'}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {calculatedWinner.score1.toFixed(0)}% vs {calculatedWinner.score2.toFixed(0)}%
                  </span>
                </div>
                <div className="h-7 w-[1px] bg-slate-200" />
                <div className="text-xs font-bold text-indigo-700">
                  {calculatedWinner.winner === 'option1'
                    ? (language === 'en' ? 'Option A Leads' : 'Перевес Варианта A')
                    : calculatedWinner.winner === 'option2'
                    ? (language === 'en' ? 'Option B Leads' : 'Перевес Варианта B')
                    : (language === 'en' ? 'Even Match' : 'Равный паритет')}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-200/60 p-1 rounded-xl inline-flex gap-1 w-full sm:w-auto overflow-x-auto border border-slate-200/80">
              <button
                type="button"
                id="tab-all"
                onClick={() => setActiveTab('all')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.tabs.all}</span>
              </button>

              <button
                type="button"
                id="tab-pros-cons"
                onClick={() => setActiveTab('pros-cons')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'pros-cons'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.tabs.prosCons}</span>
              </button>

              <button
                type="button"
                id="tab-comparison"
                onClick={() => setActiveTab('comparison')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'comparison'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.tabs.comparison}</span>
              </button>

              <button
                type="button"
                id="tab-swot"
                onClick={() => setActiveTab('swot')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'swot'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Grid2X2 className="w-3.5 h-3.5 text-sky-600" />
                <span>{t.tabs.swot}</span>
              </button>

              <button
                type="button"
                id="tab-verdict"
                onClick={() => setActiveTab('verdict')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'verdict'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.tabs.verdict}</span>
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
                          {t.prosCons.title}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        {t.prosCons.subtitle}
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
                          {t.comparison.title}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        {t.comparison.subtitle}
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
                          {t.swot.title}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        {t.swot.subtitle}
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
                      {t.prosCons.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t.prosCons.subtitle}
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
                      {t.comparison.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t.comparison.subtitle}
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
                      {t.swot.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t.swot.subtitle}
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
          <span>{t.footer.rights}</span>
          <span className="text-slate-400">{t.footer.tagline}</span>
        </div>
      </footer>

      <OfflineIndicator />
    </div>
  );

  // If Virtual Android Device is enabled, render the app inside the Android frame
  if (isAndroidView) {
    return (
      <AndroidVirtualDevice onExit={() => setIsAndroidView(false)}>
        {appContent}
      </AndroidVirtualDevice>
    );
  }

  return appContent;
}
