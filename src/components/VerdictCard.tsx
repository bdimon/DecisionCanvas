import React, { useState } from 'react';
import { Trophy, CheckCircle, ArrowRight, Copy, Check, Printer, Download, Sparkles, Scale } from 'lucide-react';
import { AnalysisResult, DecisionVerdict } from '../types';

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
  const [copied, setCopied] = useState(false);
  const { verdict, option1Title, option2Title, prosCons, comparisonTable, swot } = analysis;

  const activeWinner = calculatedWinner.winner !== 'tie'
    ? calculatedWinner.winner
    : verdict.winner;

  const activeWinnerTitle = activeWinner === 'option1'
    ? option1Title
    : activeWinner === 'option2'
    ? option2Title
    : 'Паритет (Оба варианта равнозначны)';

  const handleCopyMarkdown = () => {
    const md = `# Отчет по выбору решения

## Варианты:
- **Вариант 1**: ${option1Title}
- **Вариант 2**: ${option2Title}
${analysis.context ? `- **Контекст**: ${analysis.context}\n` : ''}

---

## 🏆 ИТОГОВЫЙ ВЕРДИКТ: ${activeWinnerTitle}
${verdict.summary}

### Ключевые факторы в пользу выбора:
${verdict.keyDrivers.map(d => `- ${d}`).join('\n')}

### Главный компромисс (Trade-off):
${verdict.tradeOffSummary}

### Первые рекомендуемые шаги:
${verdict.recommendedNextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

## 1. АНАЛИЗ «ЗА» И «ПРОТИВ»
### ${option1Title}:
**ЗА:**
${prosCons.option1.pros.map(p => `- ${p.text} (Вес: ${p.weight}/5)`).join('\n')}
**ПРОТИВ:**
${prosCons.option1.cons.map(c => `- ${c.text} (Вес: ${c.weight}/5)`).join('\n')}

### ${option2Title}:
**ЗА:**
${prosCons.option2.pros.map(p => `- ${p.text} (Вес: ${p.weight}/5)`).join('\n')}
**ПРОТИВ:**
${prosCons.option2.cons.map(c => `- ${c.text} (Вес: ${c.weight}/5)`).join('\n')}

---

## 2. СРАВНИТЕЛЬНАЯ ТАБЛИЦА
| Критерий | Вес | ${option1Title} | ${option2Title} |
|---|---|---|---|
${comparisonTable.map(c => `| ${c.title} | ${c.weight}x | ${c.option1Score}/10 (${c.option1Note}) | ${c.option2Score}/10 (${c.option2Note}) |`).join('\n')}

---

## 3. SWOT-АНАЛИЗ
### ${option1Title}:
- **S (Сильные стороны)**: ${swot.option1.strengths.join(', ')}
- **W (Слабые стороны)**: ${swot.option1.weaknesses.join(', ')}
- **O (Возможности)**: ${swot.option1.opportunities.join(', ')}
- **T (Угрозы)**: ${swot.option1.threats.join(', ')}

### ${option2Title}:
- **S (Сильные стороны)**: ${swot.option2.strengths.join(', ')}
- **W (Слабые стороны)**: ${swot.option2.weaknesses.join(', ')}
- **O (Возможности)**: ${swot.option2.opportunities.join(', ')}
- **T (Угрозы)**: ${swot.option2.threats.join(', ')}
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Top Winner Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  Рекомендуемый выбор
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Уверенность модели: {verdict.confidenceScore}%
                </span>
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
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              title="Скопировать структурированный отчет"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Скопировать Markdown'}</span>
            </button>
            <button
              type="button"
              id="print-btn"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              title="Распечатать или сохранить в PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Печать / PDF</span>
            </button>
            <button
              type="button"
              id="download-json-btn"
              onClick={handleDownloadJson}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              title="Скачать данные в формате JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="py-5 border-b border-slate-100">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Стратегическое резюме
          </h4>
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
            {verdict.summary}
          </p>
        </div>

        {/* 2-Column Details: Key Drivers & Trade-off */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-5 border-b border-slate-100">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 mb-2.5 flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Главные факторы победы:</span>
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
              <span>Ключевой компромисс (Trade-off):</span>
            </h5>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {verdict.tradeOffSummary}
            </p>
          </div>
        </div>

        {/* Actionable Next Steps */}
        <div className="pt-5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            Рекомендуемые первые шаги для реализации:
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
                  <span className="font-bold text-slate-800">Шаг {idx + 1}</span>
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
