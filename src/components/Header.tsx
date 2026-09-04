import React from 'react';
import { SlidersHorizontal, Sparkles, Printer, Smartphone, Monitor, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  hasResult: boolean;
  onReset?: () => void;
  onPrint?: () => void;
  isAndroidView: boolean;
  onToggleAndroidView: () => void;
  historyCount?: number;
  onOpenHistory?: () => void;
  lastSavedText?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  hasResult,
  onReset,
  onPrint,
  isAndroidView,
  onToggleAndroidView,
  historyCount = 0,
  onOpenHistory,
  lastSavedText,
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-8 py-3 flex justify-between items-center shrink-0 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-sm text-white overflow-hidden p-1.5 shrink-0">
          <img src="/icon.svg" alt="DecisionCanvas Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800">
              {t.header.appTitle} <span className="text-indigo-600 font-semibold text-xs sm:text-sm">PWA</span>
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider">
              {t.header.versionBadge}
            </span>
            {hasResult && (
              <span
                className="hidden xl:inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70"
                title={lastSavedText || t.storage.savedLocally}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{t.storage.savedLocally}</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">
            {t.header.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Saved Analyses History Button */}
        {onOpenHistory && (
          <button
            type="button"
            id="header-history-btn"
            onClick={onOpenHistory}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title={t.storage.historyButton}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">{t.storage.historyButton}</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
                {historyCount}
              </span>
            )}
          </button>
        )}

        {/* Virtual Android View Toggle Button */}
        <button
          type="button"
          id="header-toggle-android-view-btn"
          onClick={onToggleAndroidView}
          className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-lg border transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs ${
            isAndroidView
              ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
              : 'bg-indigo-50/80 border-indigo-200/80 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
          }`}
          title={isAndroidView ? t.header.viewDesktop : t.header.viewAndroid}
        >
          {isAndroidView ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden md:inline">{t.header.viewDesktop}</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.header.viewAndroid}</span>
            </>
          )}
        </button>

        {/* Language Switcher Button */}
        <button
          type="button"
          id="header-lang-switch-btn"
          onClick={toggleLanguage}
          className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
          title={`Switch language / Сменить язык (${language.toUpperCase()})`}
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-mono font-bold text-[11px] uppercase tracking-wider">
            {language === 'ru' ? 'EN' : 'RU'}
          </span>
        </button>

        <PWAInstallButton />

        {hasResult && onPrint && (
          <button
            type="button"
            id="header-export-pdf-btn"
            onClick={onPrint}
            className="hidden lg:inline-flex px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.header.exportPdf}</span>
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
            <span className="hidden sm:inline">{t.header.newComparison}</span>
          </button>
        )}

        {!hasResult && (
          <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.header.engineBadge}</span>
          </div>
        )}
      </div>
    </header>
  );
};
