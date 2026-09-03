import React from 'react';
import { CheckCircle, SlidersHorizontal, Sparkles, Printer } from 'lucide-react';

interface HeaderProps {
  hasResult: boolean;
  onReset?: () => void;
  onPrint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasResult, onReset, onPrint }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center shrink-0 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg text-white">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">
              DecisionCanvas <span className="text-indigo-600 font-semibold text-sm">v2.4</span>
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider">
              Strategic Pro
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Strategic Analysis Framework
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasResult && onPrint && (
          <button
            type="button"
            id="header-export-pdf-btn"
            onClick={onPrint}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Export PDF</span>
          </button>
        )}

        {hasResult && onReset && (
          <button
            type="button"
            id="new-comparison-btn"
            onClick={onReset}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Новое решение</span>
          </button>
        )}

        {!hasResult && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI & Multi-Criteria Engine</span>
          </div>
        )}
      </div>
    </header>
  );
};
