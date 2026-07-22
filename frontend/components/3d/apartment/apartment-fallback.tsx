"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ApartmentFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
}

export function ApartmentFallback({ error, onRetry }: ApartmentFallbackProps) {
  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center z-20">
      <div className="size-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="text-lg font-bold mb-1">Сбой 3D WebGL контекста</h3>
      <p className="text-xs text-gray-400 max-w-sm mb-4">
        {error?.message || "Ваше устройство или браузер временно не поддерживает 3D рендеринг. Использован 2D-режим просмотра."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="py-2 px-4 bg-[#CCFF00] text-gray-900 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-[#b8e600] transition-colors"
        >
          <RefreshCw className="size-3.5" />
          <span>Перезапустить 3D</span>
        </button>
      )}
    </div>
  );
}
