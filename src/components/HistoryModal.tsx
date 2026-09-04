import React from 'react';
import { Clock, Trash2, ArrowRight, X, Sparkles, Scale, Trophy, HardDrive, CheckCircle2 } from 'lucide-react';
import { SavedHistoryItem } from '../utils/storage';
import { useLanguage } from '../i18n/LanguageContext';
import { AnalysisResult } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: SavedHistoryItem[];
  currentAnalysisId?: string;
  onSelectAnalysis: (analysis: AnalysisResult, isUsingAi: boolean | null) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  historyItems,
  currentAnalysisId,
  onSelectAnalysis,
  onDeleteHistoryItem,
  onClearAllHistory,
}) => {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {t.storage.historyTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.storage.historySubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-history-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {historyItems.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <HardDrive className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-700 text-base">
                {t.storage.emptyHistory}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                {t.storage.emptyHistoryDesc}
              </p>
            </div>
          ) : (
            historyItems.map((item) => {
              const isCurrent = item.id === currentAnalysisId;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Meta badges */}
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(item.savedAt)}</span>
                        </span>

                        {isCurrent && (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                            <span>{t.storage.activeSession}</span>
                          </span>
                        )}

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                          {item.isUsingAi ? 'Gemini 3.8' : (language === 'en' ? 'Local Engine' : 'Экспертный')}
                        </span>

                        <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          item.winner === 'tie'
                            ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                            : 'text-amber-800 bg-amber-50 border-amber-200'
                        }`}>
                          {item.winner === 'tie' ? <Scale className="w-3 h-3" /> : <Trophy className="w-3 h-3 text-amber-600" />}
                          <span>{item.confidenceScore}%</span>
                        </span>
                      </div>

                      {/* Dilemma Title */}
                      <div className="font-bold text-sm text-slate-900 truncate">
                        <span className="text-indigo-700">{item.option1Title}</span>
                        <span className="text-slate-400 mx-1.5 font-normal">vs</span>
                        <span className="text-emerald-700">{item.option2Title}</span>
                      </div>

                      {/* Winner preview */}
                      <div className="text-xs text-slate-600 flex items-center space-x-1">
                        <span className="text-slate-400">{t.verdict.winner}:</span>
                        <span className="font-semibold text-slate-800">{item.winnerTitle}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectAnalysis(item.data, item.isUsingAi);
                          onClose();
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>{t.storage.loadComparison}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={t.storage.deleteItem}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        {historyItems.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>
              {historyItems.length} {t.storage.itemsCount}
            </span>
            <button
              type="button"
              id="clear-all-history-btn"
              onClick={() => {
                if (window.confirm(t.storage.clearAllConfirm)) {
                  onClearAllHistory();
                }
              }}
              className="text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.storage.clearAll}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
