import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Signal,
  Battery,
  RotateCw,
  Maximize2,
  Minimize2,
  Smartphone,
  Globe,
  Lock,
  MoreVertical,
  Layers,
  ArrowLeft,
  X
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AndroidVirtualDeviceProps {
  children: React.ReactNode;
  onExit: () => void;
}

export const AndroidVirtualDevice: React.FC<AndroidVirtualDeviceProps> = ({ children, onExit }) => {
  const { t } = useLanguage();
  const [isLandscape, setIsLandscape] = useState(false);
  const [isChromeMode, setIsChromeMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'fit' | '100'>('fit');
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-slate-900/95 py-6 px-2 sm:px-6 flex flex-col items-center justify-start transition-all">
      {/* Top Device Controls Toolbar */}
      <div className="w-full max-w-4xl mb-5 flex flex-wrap items-center justify-between gap-3 bg-slate-800/90 border border-slate-700/80 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{t.androidDevice.title}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Android 15 PWA
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Google Pixel 9 Pro • 412 × 915 dp • 120Hz OLED
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Orientation Toggle */}
          <button
            type="button"
            id="android-rotate-btn"
            onClick={() => setIsLandscape(!isLandscape)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
            title={t.androidDevice.landscape}
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isLandscape ? t.androidDevice.portrait : t.androidDevice.landscape}</span>
          </button>

          {/* Browser vs Standalone Toggle */}
          <button
            type="button"
            id="android-mode-toggle-btn"
            onClick={() => setIsChromeMode(!isChromeMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              isChromeMode
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isChromeMode ? t.androidDevice.browserMode : t.androidDevice.standaloneMode}</span>
          </button>

          {/* Zoom Fit Toggle */}
          <button
            type="button"
            id="android-zoom-btn"
            onClick={() => setZoomLevel(zoomLevel === 'fit' ? '100' : 'fit')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
          >
            {zoomLevel === 'fit' ? <Maximize2 className="w-3.5 h-3.5 text-emerald-400" /> : <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{zoomLevel === 'fit' ? t.androidDevice.zoom100 : t.androidDevice.zoomFit}</span>
          </button>

          {/* Exit to Desktop */}
          <button
            type="button"
            id="android-exit-btn"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors font-medium cursor-pointer ml-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t.androidDevice.backToDesktop}</span>
          </button>
        </div>
      </div>

      {/* Realistic Android Hardware Chassis Frame */}
      <div
        className={`relative transition-all duration-300 ${
          isLandscape
            ? 'w-[880px] max-w-full h-[460px]'
            : 'w-[390px] sm:w-[412px] h-[830px] sm:h-[860px]'
        } ${zoomLevel === 'fit' ? 'max-h-[85vh]' : ''}`}
      >
        {/* Physical hardware volume rocker and power buttons */}
        {!isLandscape ? (
          <>
            {/* Volume Rocker (Left) */}
            <div className="absolute -left-[14px] top-28 w-[4px] h-20 bg-slate-700 rounded-l-md shadow-md"></div>
            {/* Power Button (Right) */}
            <div className="absolute -right-[14px] top-24 w-[4px] h-12 bg-slate-700 rounded-r-md shadow-md"></div>
          </>
        ) : (
          <>
            <div className="absolute -top-[14px] left-28 h-[4px] w-20 bg-slate-700 rounded-t-md shadow-md"></div>
            <div className="absolute -bottom-[14px] left-24 h-[4px] w-12 bg-slate-700 rounded-b-md shadow-md"></div>
          </>
        )}

        {/* Outer Phone Bezel */}
        <div className="w-full h-full bg-slate-950 border-[10px] sm:border-[12px] border-slate-800 rounded-[44px] sm:rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-slate-700/80 flex flex-col overflow-hidden relative">
          
          {/* Top Speaker Slit */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1 bg-slate-800 rounded-full z-40"></div>

          {/* Android Status Bar */}
          <div className="w-full bg-slate-950/95 text-slate-100 px-5 pt-3 pb-1.5 flex items-center justify-between z-30 shrink-0 select-none text-[11px] font-medium tracking-tight">
            {/* Time */}
            <div className="font-semibold text-slate-200 pl-1">{currentTime}</div>

            {/* Centered Camera Hole-Punch */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900/90 border border-slate-700/50"></div>
            </div>

            {/* System Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-300 pr-1">
              <span className="text-[10px] font-mono text-slate-400 mr-0.5">5G</span>
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-mono">98%</span>
                <Battery className="w-3.5 h-3.5 fill-current text-slate-200" />
              </div>
            </div>
          </div>

          {/* Optional Chrome Mobile Browser Bar (when in browser mode) */}
          {isChromeMode && (
            <div className="w-full bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center gap-2 shrink-0 z-20 select-none text-slate-300">
              <div className="flex-1 bg-slate-800/90 rounded-full px-3 py-1 flex items-center justify-between text-xs text-slate-300 border border-slate-700">
                <div className="flex items-center gap-1.5 truncate">
                  <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-slate-400 text-[11px]">https://</span>
                  <span className="text-slate-100 text-[11px] font-medium truncate">decisioncanvas.app</span>
                </div>
              </div>
              <div className="w-5 h-5 rounded border border-slate-700 text-[10px] font-bold flex items-center justify-center text-slate-300">
                1
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
          )}

          {/* Standalone PWA Top Accent Bar (when in PWA mode) */}
          {!isChromeMode && (
            <div className="w-full bg-indigo-700 text-white px-3 py-1 flex items-center justify-between text-[10px] font-semibold shrink-0 z-20 shadow-xs">
              <div className="flex items-center gap-1.5 truncate">
                <div className="w-3.5 h-3.5 rounded-sm bg-white/20 p-0.5 flex items-center justify-center">
                  <img src="/icon.svg" alt="PWA" className="w-full h-full object-contain invert" />
                </div>
                <span>DecisionCanvas PWA</span>
              </div>
              <span className="text-[9px] font-mono bg-white/15 px-1.5 py-0.5 rounded text-indigo-100">
                Standalone
              </span>
            </div>
          )}

          {/* The Live Interactive App Screen Viewport */}
          <div className="flex-1 w-full bg-slate-50 overflow-y-auto overflow-x-hidden relative scroll-smooth">
            {/* Child content (The full DecisionCanvas app) */}
            <div className="min-h-full">{children}</div>
          </div>

          {/* Bottom Android Gesture Navigation Bar */}
          <div className="w-full bg-slate-950 py-2.5 flex justify-center items-center shrink-0 z-30 select-none">
            <div className="w-32 h-1 bg-slate-400/90 rounded-full shadow-xs active:bg-indigo-400 transition-colors"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
