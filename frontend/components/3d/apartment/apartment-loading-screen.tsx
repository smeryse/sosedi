"use client";

import { Loader2 } from "lucide-react";

export function ApartmentLoadingScreen() {
  return (
    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20 pointer-events-none">
      <Loader2 className="size-8 text-[#CCFF00] animate-spin mb-2" />
      <span className="text-xs font-bold tracking-wide">Инициализация WebGL 3D Сцены...</span>
    </div>
  );
}
