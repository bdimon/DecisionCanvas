import React from 'react';
import { SlidersHorizontal, Sparkles, Printer } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  hasResult: boolean;
  onReset?: () => void;
  onPrint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasResult, onReset, onPrint }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex justify-between items-center shrink-0 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-sm text-white overflow-hidden p-1.5">
          <img src="/icon.svg" alt="DecisionCanvas Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800">
              DecisionCanvas <span className="text-indigo-600 font-semibold text-xs sm:text-sm">PWA</span>
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider">
              Android Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">
            Выбор решения из двух вариантов
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PWAInstallButton />

        {hasResult && onPrint && (
          <button
            type="button"
            id="header-export-pdf-btn"
            onClick={onPrint}
            className="hidden sm:inline-flex px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Экспорт</span>
          </button>
        )}

        {hasResult && onReset && (
          <button
            type="button"
            id="new-comparison-btn"
            onClick={onReset}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold bg-indigo-600 rounded-lg text-white shadow-xs hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Новое сравнение</span>
          </button>
        )}

        {!hasResult && (
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Движок сравнения</span>
          </div>
        )}
      </div>
    </header>
  );
};
