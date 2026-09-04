import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, BookOpen, HelpCircle, AlertCircle } from 'lucide-react';
import { getPresets } from '../data/presets';
import { PresetExample } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { saveFormDraft, loadFormDraft, clearFormDraft } from '../utils/storage';

interface DecisionFormProps {
  onSubmit: (option1: string, option2: string, context?: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
}

export const DecisionForm: React.FC<DecisionFormProps> = ({ onSubmit, isLoading, onCancel }) => {
  const { language, t } = useLanguage();
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Restore draft from LocalStorage on mount
  useEffect(() => {
    const draft = loadFormDraft();
    if (draft && (draft.option1 || draft.option2 || draft.context)) {
      setOption1(draft.option1 || '');
      setOption2(draft.option2 || '');
      setContext(draft.context || '');
      if (draft.context) {
        setShowContext(true);
      }
    }
  }, []);

  const presets = getPresets(language);

  const handleApplyPreset = (preset: PresetExample) => {
    setOption1(preset.option1);
    setOption2(preset.option2);
    setContext(preset.context);
    setShowContext(true);
    setValidationError(null);
    saveFormDraft({ option1: preset.option1, option2: preset.option2, context: preset.context });
  };

  const handleOption1Change = (val: string) => {
    setOption1(val);
    if (validationError) setValidationError(null);
    saveFormDraft({ option1: val, option2, context });
  };

  const handleOption2Change = (val: string) => {
    setOption2(val);
    if (validationError) setValidationError(null);
    saveFormDraft({ option1, option2: val, context });
  };

  const handleContextChange = (val: string) => {
    setContext(val);
    saveFormDraft({ option1, option2, context: val });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const opt1 = option1.trim();
    const opt2 = option2.trim();

    if (!opt1 || !opt2) {
      setValidationError(
        language === 'en'
          ? 'Please provide both options before running the analysis.'
          : 'Пожалуйста, заполните оба варианта перед запуском анализа.'
      );
      return;
    }

    setValidationError(null);
    clearFormDraft();
    onSubmit(opt1, opt2, context.trim() || undefined);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            {t.form.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.form.subtitle}
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-md self-start sm:self-auto">
          {t.form.step1}
        </span>
      </div>

      <div className="p-4 sm:p-7 space-y-5 sm:space-y-6">
        {/* Preset Pills */}
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t.form.presetsTitle}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                id={`preset-${preset.id}`}
                onClick={() => handleApplyPreset(preset)}
                className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-all font-semibold text-left shadow-2xs cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Option 1 Box */}
            <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="option-1-input" className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">A</span>
                  <span>{t.form.option1Label}</span>
                </label>
              </div>
              <textarea
                id="option-1-input"
                rows={3}
                value={option1}
                onChange={(e) => handleOption1Change(e.target.value)}
                placeholder={t.form.option1Placeholder}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none shadow-2xs"
              />
            </div>

            {/* Option 2 Box */}
            <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="option-2-input" className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">B</span>
                  <span>{t.form.option2Label}</span>
                </label>
              </div>
              <textarea
                id="option-2-input"
                rows={3}
                value={option2}
                onChange={(e) => handleOption2Change(e.target.value)}
                placeholder={t.form.option2Placeholder}
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
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1.5 py-1 cursor-pointer"
              >
                <span>{t.form.addContext}</span>
              </button>
            ) : (
              <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="context-input" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.form.contextLabel}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowContext(false);
                      handleContextChange('');
                    }}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {t.form.hideContext}
                  </button>
                </div>
                <input
                  id="context-input"
                  type="text"
                  value={context}
                  onChange={(e) => handleContextChange(e.target.value)}
                  placeholder={t.form.contextPlaceholder}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>
            )}
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            {isLoading && onCancel && (
              <button
                type="button"
                id="cancel-analysis-btn"
                onClick={onCancel}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition-all cursor-pointer border border-slate-200"
              >
                <span>{language === 'en' ? 'Cancel' : 'Отмена'}</span>
              </button>
            )}
            <button
              type="submit"
              id="start-analysis-btn"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-lg shadow-md shadow-indigo-100 transition-all disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.form.submitting}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{t.form.submit}</span>
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
