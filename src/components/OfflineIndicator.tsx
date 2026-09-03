import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      role="status"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center space-x-2.5 rounded-xl bg-slate-900/95 text-white px-4 py-2.5 text-xs shadow-lg border border-slate-700/80 backdrop-blur-xs"
    >
      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <p className="leading-tight text-slate-200">
        <strong className="text-white font-semibold">Офлайн-режим:</strong> Доступен локальный экспертный анализ и кэшированные данные.
      </p>
    </div>
  );
};
