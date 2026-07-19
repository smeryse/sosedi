"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Ruler, Sun, Moon, Check, Compass, Eye, Maximize2, RotateCcw } from "lucide-react";
import { useCommercial3DStore } from "@/lib/application/3d/store";
import { RoomId } from "@/lib/domain/housing/types";
import manifest from "@/public/models/apartments/demo-apartment/manifest.json";
import { cn } from "@/lib/utils";

// Canvas Count Global Dev Tracker
let globalCanvasCount = 0;

const ApartmentCanvas = dynamic(
  () => import("./apartment/apartment-canvas").then((mod) => mod.ApartmentCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs text-white font-bold">
        Инициализация WebGL 3D Canvas...
      </div>
    ),
  }
);

interface ApartmentTourScreenProps {
  onBack: () => void;
  onSelectApartment: () => void;
  onSwitchTo2D?: () => void;
}

export function ApartmentTourScreen({ onBack, onSelectApartment, onSwitchTo2D }: ApartmentTourScreenProps) {
  const {
    activeRoomId,
    setActiveRoomId,
    isMeasuring,
    setIsMeasuring,
    isDay,
    setIsDay,
    graphicsTier,
    setGraphicsTier,
    roommates3B,
    rooms3B,
    totalApartmentRent,
    assignRoommateToRoom,
  } = useCommercial3DStore();

  const [sceneStatus, setSceneStatus] = useState<"loading" | "ready" | "error">("ready");

  // Track Canvas instances in dev mode
  useEffect(() => {
    globalCanvasCount += 1;
    if (process.env.NODE_ENV !== "production" && globalCanvasCount > 1) {
      console.warn(`[3D Warning] Multiple Three.js Canvas instances active simultaneously: ${globalCanvasCount}`);
    }
    return () => {
      globalCanvasCount -= 1;
    };
  }, []);

  const activeRoomData = manifest.rooms.find((r) => r.roomId === activeRoomId);
  const activeRoommate = roommates3B.find((rm) => rm.assignedRoomId === activeRoomId);
  const activeDomainRoom = rooms3B.find((r) => r.id === activeRoomId);

  return (
    <div
      className="relative w-full h-[100dvh] bg-slate-950 overflow-hidden flex flex-col font-sans select-none"
      data-scene-status={sceneStatus}
      data-active-room-id={activeRoomId || "none"}
      data-rent-total={totalApartmentRent}
      data-graphics-tier={graphicsTier}
    >
      {/* Real Three.js WebGL Canvas Container */}
      <div className="absolute inset-0 z-0 min-h-[300px] aspect-video">
        <ApartmentCanvas />
      </div>

      {/* Header Overlay */}
      <header className="relative z-30 pt-4 px-4 sm:px-8 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-200/80"
          >
            <ArrowLeft className="size-4 sm:size-5" />
          </button>
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-heading">
            соседи<span className="text-[#CCFF00]">.</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Graphics Tier Selector */}
          <div className="hidden sm:flex bg-white/80 backdrop-blur-md p-1 rounded-full text-[10px] font-bold text-gray-800 gap-1 border border-white">
            {(["auto", "low", "medium", "high"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setGraphicsTier(tier)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full uppercase transition-all",
                  graphicsTier === tier ? "bg-[#CCFF00] text-gray-900 shadow-sm" : "hover:bg-white/60"
                )}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md text-xs font-bold text-gray-900 border border-white flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#CCFF00] animate-pulse" />
            WebGL 3D • 3-комнатная квартира (78 м²)
          </div>
        </div>
      </header>

      {/* Main Responsive Grid Overlay */}
      <main className="relative z-30 flex-1 px-4 sm:px-8 pt-4 pb-6 flex flex-col justify-between pointer-events-none">
        {/* Right Toolbar Controls */}
        <div className="absolute right-4 sm:right-8 top-20 sm:top-24 flex flex-col gap-2.5 pointer-events-auto z-30">
          <button
            onClick={() => setActiveRoomId(null)}
            className="p-2.5 sm:p-3 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-xl border border-white/60 text-gray-800 shadow-xl flex flex-col items-center gap-1 text-[10px] sm:text-[11px] font-bold transition-all"
          >
            <Eye className="size-4 sm:size-5 text-emerald-600" />
            <span>Обзор</span>
          </button>

          <button
            onClick={() => setIsMeasuring((prev) => !prev)}
            className={cn(
              "p-2.5 sm:p-3 rounded-2xl backdrop-blur-xl border shadow-xl flex flex-col items-center gap-1 text-[10px] sm:text-[11px] font-bold transition-all",
              isMeasuring
                ? "bg-[#CCFF00] text-gray-900 border-[#CCFF00] shadow-[0_0_15px_#CCFF00]"
                : "bg-white/80 text-gray-800 border-white/60 hover:bg-white"
            )}
          >
            <Ruler className="size-4 sm:size-5" />
            <span>{isMeasuring ? "Замер ВКЛ" : "3D Замер"}</span>
          </button>

          <button
            onClick={() => setIsDay((prev) => !prev)}
            className="p-2.5 sm:p-3 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-xl border border-white/60 text-gray-800 shadow-xl flex flex-col items-center gap-1 text-[10px] sm:text-[11px] font-bold transition-all"
          >
            {isDay ? <Sun className="size-4 sm:size-5 text-amber-500" /> : <Moon className="size-4 sm:size-5 text-indigo-400" />}
            <span>{isDay ? "День" : "Ночь"}</span>
          </button>

          {onSwitchTo2D && (
            <button
              onClick={onSwitchTo2D}
              className="p-2.5 sm:p-3 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-xl border border-white/60 text-gray-800 shadow-xl flex flex-col items-center gap-1 text-[10px] sm:text-[11px] font-bold transition-all"
            >
              <Compass className="size-4 sm:size-5 text-blue-600" />
              <span>2D План</span>
            </button>
          )}
        </div>

        {/* Bottom Room Selector Pills */}
        <div className="sm:absolute sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 bg-white/90 backdrop-blur-xl p-1 sm:p-1.5 rounded-full border border-white/80 shadow-2xl pointer-events-auto flex items-center gap-1 overflow-x-auto max-w-full my-2 sm:my-0 z-30">
          {manifest.rooms.map((r) => (
            <button
              key={r.roomId}
              onClick={() => setActiveRoomId(r.roomId as RoomId)}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap",
                activeRoomId === r.roomId
                  ? "bg-[#CCFF00] text-gray-900 shadow-md scale-105"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Bottom Active Room Card Drawer */}
        <div className="w-full sm:w-80 sm:absolute sm:right-8 sm:bottom-8 bg-white/95 backdrop-blur-xl rounded-3xl p-4 border border-white/80 shadow-2xl pointer-events-auto space-y-3 z-30">
          {activeRoomData ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-900">{activeRoomData.name}</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-bold text-gray-700">
                  {activeRoomData.areaM2} м²
                </span>
              </div>

              {activeRoommate ? (
                <div className="p-2 rounded-2xl bg-[#CCFF00]/20 border border-[#CCFF00] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={activeRoommate.avatar} alt={activeRoommate.name} className="size-7 rounded-full object-cover ring-2 ring-white" />
                    <div>
                      <span className="text-xs font-bold text-gray-900">{activeRoommate.name}</span>
                      <span className="block text-[10px] text-gray-500 font-medium">{activeRoommate.role}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-900">{activeRoommate.calculatedPrice.toLocaleString()} ₽</span>
                </div>
              ) : (
                <div className="p-2 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                  <span className="text-xs text-gray-400 font-medium">Спальня не назначена</span>
                </div>
              )}

              {/* Roommate Assignment Buttons for Private Bedrooms */}
              {activeRoomData.accessType === "private" && (
                <div className="pt-1 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Назначить жильца (Swap):</span>
                  <div className="grid grid-cols-3 gap-1">
                    {roommates3B.map((rm) => (
                      <button
                        key={rm.id}
                        onClick={() => assignRoommateToRoom(rm.id, activeRoomData.roomId)}
                        className={cn(
                          "py-1 px-2 rounded-xl text-[10px] font-bold transition-all border",
                          rm.assignedRoomId === activeRoomData.roomId
                            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                        )}
                      >
                        {rm.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-900">Настоящий WebGL 3D Рендеринг</span>
              <p className="text-[11px] text-gray-500 leading-tight font-medium">
                Выберите любую комнату на 3D сцене для анимации камеры и замера расстояний.
              </p>
            </div>
          )}

          <button
            onClick={onSelectApartment}
            className="w-full py-3 px-4 bg-[#CCFF00] hover:bg-[#b8e600] text-gray-900 font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Check className="size-4" />
            <span>Выбрать эту квартиру</span>
          </button>
        </div>
      </main>
    </div>
  );
}
