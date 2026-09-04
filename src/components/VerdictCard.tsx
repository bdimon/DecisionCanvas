import React, { useState } from 'react';
import { Trophy, CheckCircle, Copy, Check, Printer, Download, Scale } from 'lucide-react';
import { AnalysisResult } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface VerdictCardProps {
  analysis: AnalysisResult;
  calculatedWinner: {
    winner: 'option1' | 'option2' | 'tie';
    winnerTitle: string;
    score1: number;
    score2: number;
  };
}

export const VerdictCard: React.FC<VerdictCardProps> = ({ analysis, calculatedWinner }) => {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const { verdict, option1Title, option2Title, prosCons, comparisonTable, swot } = analysis;

  const activeWinner = calculatedWinner.winner !== 'tie'
    ? calculatedWinner.winner
    : verdict.winner;

  const activeWinnerTitle = activeWinner === 'option1'
    ? option1Title
    : activeWinner === 'option2'
    ? option2Title
    : t.verdict.tie;

  const isWinnerOverridden = activeWinner !== verdict.winner && activeWinner !== 'tie';
  const activeConfidence = isWinnerOverridden
    ? Math.min(92, Math.max(55, Math.round(50 + Math.abs(calculatedWinner.score1 - calculatedWinner.score2) * 1.6)))
    : verdict.confidenceScore;

  const handleCopyMarkdown = () => {
    const md = `# ${language === 'en' ? 'Decision Analysis Report' : 'Отчет по выбору решения'}

## ${language === 'en' ? 'Options' : 'Варианты'}:
- **${language === 'en' ? 'Option A' : 'Вариант 1'}**: ${option1Title}
- **${language === 'en' ? 'Option B' : 'Вариант 2'}**: ${option2Title}
${analysis.context ? `- **${language === 'en' ? 'Context' : 'Контекст'}**: ${analysis.context}\n` : ''}

---

## 🏆 ${language === 'en' ? 'RECOMMENDED VERDICT' : 'ИТОГОВЫЙ ВЕРДИКТ'}: ${activeWinnerTitle}
${verdict.summary}

### ${t.verdict.keyFactors}:
${verdict.keyDrivers.map(d => `- ${d}`).join('\n')}

### ${t.verdict.tradeoff}:
${verdict.tradeOffSummary}

### ${t.verdict.nextSteps}:
${verdict.recommendedNextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

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
- **S (${language === 'en' ? 'Strengths' : 'Сильные стороны'})**: ${swot.option1.strengths.join(', ')}
- **W (${language === 'en' ? 'Weaknesses' : 'Слабые стороны'})**: ${swot.option1.weaknesses.join(', ')}
- **O (${language === 'en' ? 'Opportunities' : 'Возможности'})**: ${swot.option1.opportunities.join(', ')}
- **T (${language === 'en' ? 'Threats' : 'Угрозы'})**: ${swot.option1.threats.join(', ')}

### ${option2Title}:
- **S (${language === 'en' ? 'Strengths' : 'Сильные стороны'})**: ${swot.option2.strengths.join(', ')}
- **W (${language === 'en' ? 'Weaknesses' : 'Слабые стороны'})**: ${swot.option2.weaknesses.join(', ')}
- **O (${language === 'en' ? 'Opportunities' : 'Возможности'})**: ${swot.option2.opportunities.join(', ')}
- **T (${language === 'en' ? 'Threats' : 'Угрозы'})**: ${swot.option2.threats.join(', ')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
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
            <div className={`w-12 h-12 rounded-xl ${activeWinner === 'tie' ? 'bg-indigo-600' : 'bg-amber-500'} text-white flex items-center justify-center shrink-0 shadow-sm`}>
              {activeWinner === 'tie' ? <Scale className="w-6 h-6 text-white" /> : <Trophy className="w-6 h-6 text-white" />}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  activeWinner === 'tie'
                    ? 'text-indigo-700 bg-indigo-50 border-indigo-200/60'
                    : 'text-amber-700 bg-amber-50 border-amber-200/60'
                }`}>
                  {activeWinner === 'tie' ? t.verdict.tieTitle : t.verdict.winnerTitle}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {t.verdict.confidence}: {activeConfidence}%
                </span>
                {isWinnerOverridden && (
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {language === 'en' ? 'Adjusted by custom weights' : 'Скорректировано весами'}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                {activeWinnerTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
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

        {/* Narrative Summary */}
        <div className="py-5 border-b border-slate-100">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {t.verdict.summary}
          </h4>
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
            {isWinnerOverridden ? (
              language === 'en'
                ? `Based on your custom weights and criterion scores, "${activeWinnerTitle}" currently leads with ${Math.round(calculatedWinner.score1)}% vs ${Math.round(calculatedWinner.score2)}%. ${verdict.summary}`
                : `С учетом скорректированных вами весов и оценок критериев лидирует «${activeWinnerTitle}» (${Math.round(calculatedWinner.score1)}% против ${Math.round(calculatedWinner.score2)}%). ${verdict.summary}`
            ) : (
              verdict.summary
            )}
          </p>
        </div>

        {/* 2-Column Details: Key Drivers & Trade-off */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-5 border-b border-slate-100">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 mb-2.5 flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.verdict.keyFactors}:</span>
            </h5>
            <ul className="space-y-2">
              {verdict.keyDrivers.map((driver, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span className="leading-snug">{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-2.5 flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.verdict.tradeoff}:</span>
            </h5>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {verdict.tradeOffSummary}
            </p>
          </div>
        </div>

        {/* Actionable Next Steps */}
        <div className="pt-5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            {t.verdict.nextSteps}:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {verdict.recommendedNextSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-800 flex flex-col justify-between shadow-2xs"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{language === 'en' ? `Step ${idx + 1}` : `Шаг ${idx + 1}`}</span>
                </div>
                <p className="leading-relaxed text-slate-600 text-xs">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
