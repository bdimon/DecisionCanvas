import React, { useState, useMemo } from 'react';
import {
  Trophy,
  CheckCircle,
  Copy,
  Check,
  Printer,
  Download,
  Scale,
  Edit3,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { AnalysisResult, DecisionVerdict } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { synthesizeVerdict } from '../utils/verdictSynthesizer';

interface VerdictCardProps {
  analysis: AnalysisResult;
  calculatedWinner: {
    winner: 'option1' | 'option2' | 'tie';
    winnerTitle: string;
    score1: number;
    score2: number;
  };
  onUpdateVerdict?: (updatedVerdict: DecisionVerdict) => void;
  onResetVerdict?: () => void;
}

// Clean helper to prevent circular or deeply nested originalVerdict references
function getCleanBaseVerdict(v: DecisionVerdict): DecisionVerdict {
  const source = v.originalVerdict ? getCleanBaseVerdict(v.originalVerdict) : v;
  return {
    winner: source.winner,
    winnerTitle: source.winnerTitle,
    confidenceScore: source.confidenceScore,
    summary: source.summary,
    keyDrivers: [...source.keyDrivers],
    tradeOffSummary: source.tradeOffSummary,
    recommendedNextSteps: [...source.recommendedNextSteps],
    customizedLanguage: source.customizedLanguage
  };
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  analysis,
  calculatedWinner,
  onUpdateVerdict,
  onResetVerdict
}) => {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { verdict, option1Title, option2Title, prosCons, comparisonTable, swot } = analysis;

  // Real-time synthesized verdict from current comparison table & pros/cons
  const synthesized = useMemo(() => {
    return synthesizeVerdict(analysis, language);
  }, [analysis, language]);

  // Determine active winner: prioritize calculated from comparison table unless user explicitly edited
  const activeWinner = calculatedWinner.winner !== 'tie'
    ? calculatedWinner.winner
    : verdict.winner;

  const activeWinnerTitle = activeWinner === 'option1'
    ? option1Title
    : activeWinner === 'option2'
    ? option2Title
    : t.verdict.tie;

  // Detect if criteria scoring contradicts the original AI winner
  const isWinnerOverridden = activeWinner !== verdict.winner && activeWinner !== 'tie';

  // If user has manually edited the verdict, respect their custom edits;
  // otherwise, if the winner was overridden by table scoring, use synthesized narrative to avoid contradictions!
  const effectiveVerdict: DecisionVerdict = useMemo(() => {
    if (verdict.isCustomized) {
      return verdict;
    }
    if (isWinnerOverridden) {
      const baseOriginal = verdict.originalVerdict
        ? getCleanBaseVerdict(verdict.originalVerdict)
        : getCleanBaseVerdict(verdict);
      return {
        ...synthesized,
        originalVerdict: baseOriginal
      };
    }
    return verdict;
  }, [verdict, isWinnerOverridden, synthesized]);

  // Check if custom verdict was authored in a different language
  const hasLanguageMismatch =
    verdict.isCustomized &&
    verdict.customizedLanguage &&
    verdict.customizedLanguage !== language;

  // Editing state
  const [editForm, setEditForm] = useState<DecisionVerdict>({
    winner: effectiveVerdict.winner,
    winnerTitle: effectiveVerdict.winnerTitle,
    confidenceScore: effectiveVerdict.confidenceScore,
    summary: effectiveVerdict.summary,
    keyDrivers: [...effectiveVerdict.keyDrivers],
    tradeOffSummary: effectiveVerdict.tradeOffSummary,
    recommendedNextSteps: [...effectiveVerdict.recommendedNextSteps]
  });

  const handleStartEdit = () => {
    setEditForm({
      winner: effectiveVerdict.winner,
      winnerTitle: effectiveVerdict.winnerTitle,
      confidenceScore: effectiveVerdict.confidenceScore,
      summary: effectiveVerdict.summary,
      keyDrivers: [...effectiveVerdict.keyDrivers],
      tradeOffSummary: effectiveVerdict.tradeOffSummary,
      recommendedNextSteps: [...effectiveVerdict.recommendedNextSteps]
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!onUpdateVerdict) return;
    const baseOriginal = verdict.originalVerdict
      ? getCleanBaseVerdict(verdict.originalVerdict)
      : getCleanBaseVerdict(verdict);

    const updated: DecisionVerdict = {
      ...editForm,
      isCustomized: true,
      customizedLanguage: language,
      originalVerdict: baseOriginal
    };
    onUpdateVerdict(updated);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleApplySynthesis = () => {
    if (!onUpdateVerdict) return;
    const baseOriginal = verdict.originalVerdict
      ? getCleanBaseVerdict(verdict.originalVerdict)
      : getCleanBaseVerdict(verdict);

    const updated: DecisionVerdict = {
      ...synthesized,
      isCustomized: true,
      customizedLanguage: language,
      originalVerdict: baseOriginal
    };
    onUpdateVerdict(updated);
    setIsEditing(false);
  };

  const handleDriverChange = (index: number, val: string) => {
    const next = [...editForm.keyDrivers];
    next[index] = val;
    setEditForm({ ...editForm, keyDrivers: next });
  };

  const handleAddDriver = () => {
    setEditForm({
      ...editForm,
      keyDrivers: [...editForm.keyDrivers, '']
    });
  };

  const handleRemoveDriver = (index: number) => {
    const next = editForm.keyDrivers.filter((_, i) => i !== index);
    setEditForm({ ...editForm, keyDrivers: next });
  };

  const handleStepChange = (index: number, val: string) => {
    const next = [...editForm.recommendedNextSteps];
    next[index] = val;
    setEditForm({ ...editForm, recommendedNextSteps: next });
  };

  const handleAddStep = () => {
    setEditForm({
      ...editForm,
      recommendedNextSteps: [...editForm.recommendedNextSteps, '']
    });
  };

  const handleRemoveStep = (index: number) => {
    const next = editForm.recommendedNextSteps.filter((_, i) => i !== index);
    setEditForm({ ...editForm, recommendedNextSteps: next });
  };

  const handleCopyMarkdown = () => {
    const md = `# ${language === 'en' ? 'Decision Analysis Report' : 'Отчет по выбору решения'}

## ${language === 'en' ? 'Options' : 'Варианты'}:
- **${language === 'en' ? 'Option A' : 'Вариант 1'}**: ${option1Title}
- **${language === 'en' ? 'Option B' : 'Вариант 2'}**: ${option2Title}
${analysis.context ? `- **${language === 'en' ? 'Context' : 'Контекст'}**: ${analysis.context}\n` : ''}

---

## 🏆 ${language === 'en' ? 'RECOMMENDED VERDICT' : 'ИТОГОВЫЙ ВЕРДИКТ'}: ${activeWinnerTitle} (${effectiveVerdict.confidenceScore}% ${t.verdict.confidence})
${effectiveVerdict.summary}

### ${t.verdict.keyFactors}:
${effectiveVerdict.keyDrivers.map(d => `- ${d}`).join('\n')}

### ${t.verdict.tradeoff}:
${effectiveVerdict.tradeOffSummary}

### ${t.verdict.nextSteps}:
${effectiveVerdict.recommendedNextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

## 1. ${language === 'en' ? 'PROS & CONS ANALYSIS' : 'АНАЛИЗ «ЗА» И «ПРОТИВ»'}
### ${option1Title}:
**${language === 'en' ? 'PROS' : 'ЗА'}:**
${prosCons.option1.pros.map(p => `- ${p.text} (${language === 'en' ? 'Weight' : 'Вес'}: ${p.weight}/5)`).join('\n')}
**${language === 'en' ? 'CONS' : 'ПРОТИВ'}:**
${prosCons.option1.cons.map(c => `- ${c.text} (${language === 'en' ? 'Weight' : 'Вес'}: ${c.weight}/5)`).join('\n')}

### ${option2Title}:
**${language === 'en' ? 'PROS' : 'ЗА'}:**
${prosCons.option2.pros.map(p => `- ${p.text} (${language === 'en' ? 'Weight' : 'Вес'}: ${p.weight}/5)`).join('\n')}
**${language === 'en' ? 'CONS' : 'ПРОТИВ'}:**
${prosCons.option2.cons.map(c => `- ${c.text} (${language === 'en' ? 'Weight' : 'Вес'}: ${c.weight}/5)`).join('\n')}

---

## 2. ${language === 'en' ? 'COMPARISON TABLE' : 'СРАВНИТЕЛЬНАЯ ТАБЛИЦА'}
| ${language === 'en' ? 'Criterion' : 'Критерий'} | ${language === 'en' ? 'Weight' : 'Вес'} | ${option1Title} | ${option2Title} |
|---|---|---|---|
${comparisonTable.map(c => `| ${c.title} | ${c.weight}x | ${c.option1Score}/10 (${c.option1Note}) | ${c.option2Score}/10 (${c.option2Note}) |`).join('\n')}

---

## 3. ${language === 'en' ? 'SWOT ANALYSIS' : 'SWOT-АНАЛИЗ'}
### ${option1Title}:
- **S**: ${swot.option1.strengths.join(', ')}
- **W**: ${swot.option1.weaknesses.join(', ')}
- **O**: ${swot.option1.opportunities.join(', ')}
- **T**: ${swot.option1.threats.join(', ')}

### ${option2Title}:
- **S**: ${swot.option2.strengths.join(', ')}
- **W**: ${swot.option2.weaknesses.join(', ')}
- **O**: ${swot.option2.opportunities.join(', ')}
- **T**: ${swot.option2.threats.join(', ')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const exportData = {
      ...analysis,
      verdict: effectiveVerdict
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decision-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-8">
        {/* Top Winner Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start space-x-3.5">
            <div
              className={`w-12 h-12 rounded-xl ${
                activeWinner === 'tie' ? 'bg-indigo-600' : 'bg-amber-500'
              } text-white flex items-center justify-center shrink-0 shadow-sm`}
            >
              {activeWinner === 'tie' ? (
                <Scale className="w-6 h-6 text-white" />
              ) : (
                <Trophy className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    activeWinner === 'tie'
                      ? 'text-indigo-700 bg-indigo-50 border-indigo-200/60'
                      : 'text-amber-700 bg-amber-50 border-amber-200/60'
                  }`}
                >
                  {activeWinner === 'tie' ? t.verdict.tieTitle : t.verdict.winnerTitle}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {t.verdict.confidence}: {effectiveVerdict.confidenceScore}%
                </span>
                {verdict.isCustomized ? (
                  <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                    {t.verdict.userEdited}
                  </span>
                ) : isWinnerOverridden ? (
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{t.verdict.dynamicallyGenerated}</span>
                  </span>
                ) : null}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                {activeWinnerTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
            {!isEditing && onUpdateVerdict && (
              <>
                <button
                  type="button"
                  id="recalc-verdict-btn"
                  onClick={handleApplySynthesis}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title={t.verdict.recalculateVerdict}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden md:inline">{t.verdict.recalculateVerdict}</span>
                </button>

                <button
                  type="button"
                  id="edit-verdict-btn"
                  onClick={handleStartEdit}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title={t.verdict.editVerdict}
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">{t.verdict.editVerdict}</span>
                </button>
              </>
            )}

            {verdict.originalVerdict && onResetVerdict && !isEditing && (
              <button
                type="button"
                id="reset-verdict-btn"
                onClick={onResetVerdict}
                className="inline-flex items-center space-x-1.5 px-2.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title={t.verdict.resetToAi}
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden lg:inline">{t.verdict.resetToAi}</span>
              </button>
            )}

            <button
              type="button"
              id="copy-markdown-btn"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Markdown report"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.verdict.copied : t.verdict.copyMarkdown}</span>
            </button>
            <button
              type="button"
              id="print-btn"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.verdict.printPdf}</span>
            </button>
            <button
              type="button"
              id="download-json-btn"
              onClick={handleDownloadJson}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title={t.verdict.downloadJson}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Language Mismatch Banner */}
        {hasLanguageMismatch && !isEditing && (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2 text-xs text-amber-900 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t.verdict.languageMismatchNotice}</span>
            </div>
            <button
              type="button"
              onClick={handleApplySynthesis}
              className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>{t.verdict.recalculateInLanguage}</span>
            </button>
          </div>
        )}

        {/* Editing Controls Header when isEditing */}
        {isEditing && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 my-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 flex items-center space-x-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.verdict.editVerdict}</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleApplySynthesis}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors cursor-pointer flex items-center space-x-1"
                title={t.verdict.recalculateVerdict}
              >
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>{language === 'en' ? 'Auto-Synthesize' : 'Авто-синтез'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>{t.verdict.cancelEdit}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer shadow-2xs flex items-center space-x-1"
              >
                <Save className="w-3 h-3" />
                <span>{t.verdict.saveVerdict}</span>
              </button>
            </div>
          </div>
        )}

        {/* Narrative Summary */}
        <div className="py-5 border-b border-slate-100">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {t.verdict.summary}
          </h4>
          {isEditing ? (
            <textarea
              rows={4}
              value={editForm.summary}
              onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
              className="w-full text-sm text-slate-800 border border-slate-300 rounded-lg p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-normal"
              placeholder={language === 'en' ? 'Write verdict summary...' : 'Введите резюме вердикта...'}
            />
          ) : (
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
              {effectiveVerdict.summary}
            </p>
          )}
        </div>

        {/* 2-Column Details: Key Drivers & Trade-off */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-5 border-b border-slate-100">
          {/* Key Drivers Column */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.verdict.keyFactors}:</span>
                </h5>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddDriver}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.verdict.addDriver}</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  {editForm.keyDrivers.map((driver, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <input
                        type="text"
                        value={driver}
                        onChange={(e) => handleDriverChange(idx, e.target.value)}
                        className="flex-1 text-xs bg-white text-slate-800 border border-emerald-200 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                        placeholder={language === 'en' ? 'Driver factor...' : 'Фактор в пользу выбора...'}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDriver(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                        title={t.verdict.remove}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {effectiveVerdict.keyDrivers.map((driver, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span className="leading-snug">{driver}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Trade-off Column */}
          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 flex flex-col justify-between">
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-2.5 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.verdict.tradeoff}:</span>
              </h5>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={editForm.tradeOffSummary}
                  onChange={(e) => setEditForm({ ...editForm, tradeOffSummary: e.target.value })}
                  className="w-full text-xs bg-white text-slate-800 border border-amber-200 rounded-md p-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 leading-relaxed"
                  placeholder={language === 'en' ? 'Describe main trade-off...' : 'Опишите главный компромисс...'}
                />
              ) : (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {effectiveVerdict.tradeOffSummary}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actionable Next Steps */}
        <div className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t.verdict.nextSteps}:
            </h4>
            {isEditing && (
              <button
                type="button"
                onClick={handleAddStep}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{t.verdict.addStep}</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2.5">
              {editForm.recommendedNextSteps.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    className="flex-1 text-xs bg-white text-slate-800 border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    placeholder={language === 'en' ? `Step ${idx + 1}...` : `Шаг ${idx + 1}...`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer shrink-0"
                    title={t.verdict.remove}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {effectiveVerdict.recommendedNextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-800 flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">
                      {language === 'en' ? `Step ${idx + 1}` : `Шаг ${idx + 1}`}
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-600 text-xs">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
