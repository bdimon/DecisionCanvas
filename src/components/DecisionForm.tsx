import React, { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen, HelpCircle } from 'lucide-react';
import { PRESET_EXAMPLES } from '../data/presets';
import { PresetExample } from '../types';

interface DecisionFormProps {
  onSubmit: (option1: string, option2: string, context?: string) => void;
  isLoading: boolean;
}

export const DecisionForm: React.FC<DecisionFormProps> = ({ onSubmit, isLoading }) => {
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);

  const handleApplyPreset = (preset: PresetExample) => {
    setOption1(preset.option1);
    setOption2(preset.option2);
    setContext(preset.context);
    setShowContext(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!option1.trim() || !option2.trim()) return;
    onSubmit(option1.trim(), option2.trim(), context.trim() || undefined);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Формулирование дилеммы и альтернатив
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Введите 2 альтернативных решения. Система построит «За / Против», шкалу взвешенного скоринга и матрицу SWOT.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-md self-start sm:self-auto">
          Шаг 1: Конфигурация
        </span>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* Preset Pills */}
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Готовые сценарии анализа:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_EXAMPLES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                id={`preset-${preset.id}`}
                onClick={() => handleApplyPreset(preset)}
                className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-all font-semibold text-left shadow-2xs"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Option 1 Box */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="option-1-input" className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">A</span>
                  <span>Option A (Вариант 1)</span>
                </label>
                <span className="text-[10px] font-semibold uppercase text-slate-400">Базовый выбор</span>
              </div>
              <textarea
                id="option-1-input"
                rows={3}
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
                placeholder="Например: Остаться на текущей работе с понятным доходом и графиком"
                required
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none shadow-2xs"
              />
            </div>

            {/* Option 2 Box */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="option-2-input" className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">B</span>
                  <span>Option B (Вариант 2)</span>
                </label>
                <span className="text-[10px] font-semibold uppercase text-slate-400">Альтернатива</span>
              </div>
              <textarea
                id="option-2-input"
                rows={3}
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
                placeholder="Например: Принять предложение стартапа с опционом и руководящей ролью"
                required
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none shadow-2xs"
              />
            </div>
          </div>

          {/* Context toggle */}
          <div className="pt-1">
            {!showContext ? (
              <button
                type="button"
                id="toggle-context-btn"
                onClick={() => setShowContext(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1.5 py-1"
              >
                <span>+ Добавить контекст или критерии (бюджет, сроки, приоритеты)</span>
              </button>
            ) : (
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="context-input" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Дополнительные условия и контекст (необязательно)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowContext(false);
                      setContext('');
                    }}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600"
                  >
                    Скрыть
                  </button>
                </div>
                <input
                  id="context-input"
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Например: Семья, ипотека, готов уделять до 15 часов в неделю, горизонт 2 года"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              id="start-analysis-btn"
              disabled={isLoading || !option1.trim() || !option2.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-sm rounded-lg shadow-md shadow-indigo-100 transition-all disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Анализируем варианты...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Запустить сравнительный анализ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
