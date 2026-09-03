import React, { useState } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed standalone PWA, render a subtle indicator
  if (isInstalled) {
    return (
      <div
        id="pwa-installed-badge"
        className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-lg"
        title="Приложение установлено на устройство"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>PWA активно</span>
      </div>
    );
  }

  const handleButtonClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        id="pwa-install-btn"
        onClick={handleButtonClick}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-all shadow-2xs cursor-pointer"
        title="Установить как приложение на Android, iOS или рабочий стол"
      >
        <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden xs:inline">Установить</span>
        <span className="xs:hidden">PWA</span>
      </button>

      {/* Manual Installation Guide Modal (for iOS or browsers where prompt requires user action) */}
      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              id="close-pwa-guide-btn"
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Установка DecisionCanvas
                </h3>
                <p className="text-xs text-slate-500">
                  Работает как нативное приложение Android & iOS
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800">
                  Инструкция для iPhone и iPad (Safari):
                </p>
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="flex-1">
                    Нажмите кнопку <strong className="inline-flex items-center gap-1 text-indigo-600"><Share className="w-3 h-3 inline" /> «Поделиться»</strong> в нижней панели Safari.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="flex-1">
                    Прокрутите вниз и выберите <strong className="inline-flex items-center gap-1 text-slate-900"><PlusSquare className="w-3 h-3 inline" /> «На экран „Домой“»</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800">
                  Инструкция для Android (Chrome / Яндекс / Браузер):
                </p>
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="flex-1">
                    Откройте меню браузера (три точки <strong>⋮</strong> в правом верхнем углу).
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="flex-1">
                    Нажмите <strong className="text-indigo-700">«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="flex-1 text-slate-600">
                    Приложение появится среди остальных программ Android и будет запускаться в полноэкранном режиме офлайн.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                id="close-guide-action-btn"
                onClick={() => setShowGuide(false)}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
