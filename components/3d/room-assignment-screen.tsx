"use client";

import { useState } from "react";
import { ArrowLeft, Check, DollarSign } from "lucide-react";
import { useCommercial3DStore } from "@/lib/application/3d/store";
import { cn } from "@/lib/utils";

interface RoomAssignmentScreenProps {
  onBack: () => void;
  onConfirmAssignment: () => void;
}

export function RoomAssignmentScreen({ onBack, onConfirmAssignment }: RoomAssignmentScreenProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const {
    roommates3B,
    totalApartmentRent,
    assignRoommateToRoom,
    rentResult,
  } = useCommercial3DStore();

  const handleAssignToRoom = (personId: string, roomId: string) => {
    assignRoommateToRoom(personId, roomId);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#F4F6F1] overflow-hidden flex flex-col font-sans select-none">
      <div className="absolute inset-0 bg-[#EBF0E6] flex items-center justify-center p-2 sm:p-6">
        <div className="relative w-full max-w-5xl h-[65vh] sm:h-[550px] bg-white/70 rounded-3xl sm:rounded-[3rem] p-4 sm:p-6 shadow-2xl border-2 sm:border-4 border-white flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#C5D4BF_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

          <div className="relative w-full h-full grid grid-cols-12 grid-rows-6 gap-2.5 sm:gap-4 p-2 z-10">
            {/* Room 1: Master Bedroom */}
            <div
              onClick={() => draggedId && handleAssignToRoom(draggedId, "room-master")}
              className={cn(
                "col-span-6 sm:col-span-5 row-span-3 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 sm:border-4 transition-all duration-300 relative bg-[#CCFF00]/10 border-[#CCFF00] shadow-md flex flex-col justify-between cursor-pointer hover:scale-[1.01]"
              )}
            >
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/90 rounded-full text-[10px] sm:text-xs font-bold text-gray-800 shadow-sm border">
                  1. Спальня Мастер • 22 м²
                </span>
                <span className="text-[10px] sm:text-xs font-extrabold text-emerald-800">
                  {roommates3B.find((r) => r.assignedRoomId === "room-master")?.calculatedPrice.toLocaleString()} ₽
                </span>
              </div>

              <div className="flex items-center justify-center flex-1">
                {roommates3B.find((r) => r.assignedRoomId === "room-master") ? (
                  <div className="relative flex flex-col items-center gap-1">
                    <img
                      src={roommates3B.find((r) => r.assignedRoomId === "room-master")?.avatar}
                      alt="avatar"
                      className="size-10 sm:size-14 rounded-full object-cover ring-4 ring-[#CCFF00] shadow-xl"
                    />
                    <span className="px-2 py-0.5 bg-gray-900 text-white rounded-full text-[10px] sm:text-xs font-bold shadow-md">
                      {roommates3B.find((r) => r.assignedRoomId === "room-master")?.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Нажмите для выбора</span>
                )}
              </div>
            </div>

            {/* Room 2: Second Bedroom */}
            <div
              onClick={() => draggedId && handleAssignToRoom(draggedId, "room-second")}
              className={cn(
                "col-span-6 sm:col-span-4 row-span-3 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 sm:border-4 transition-all duration-300 relative bg-[#CCFF00]/10 border-[#CCFF00] shadow-md flex flex-col justify-between cursor-pointer hover:scale-[1.01]"
              )}
            >
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/90 rounded-full text-[10px] sm:text-xs font-bold text-gray-800 shadow-sm border">
                  2. Вторая спальня • 18 м²
                </span>
                <span className="text-[10px] sm:text-xs font-extrabold text-emerald-800">
                  {roommates3B.find((r) => r.assignedRoomId === "room-second")?.calculatedPrice.toLocaleString()} ₽
                </span>
              </div>

              <div className="flex items-center justify-center flex-1">
                {roommates3B.find((r) => r.assignedRoomId === "room-second") ? (
                  <div className="relative flex flex-col items-center gap-1">
                    <img
                      src={roommates3B.find((r) => r.assignedRoomId === "room-second")?.avatar}
                      alt="avatar"
                      className="size-10 sm:size-14 rounded-full object-cover ring-4 ring-[#CCFF00] shadow-xl"
                    />
                    <span className="px-2 py-0.5 bg-gray-900 text-white rounded-full text-[10px] sm:text-xs font-bold shadow-md">
                      {roommates3B.find((r) => r.assignedRoomId === "room-second")?.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Нажмите для выбора</span>
                )}
              </div>
            </div>

            {/* Room 3: Small Bedroom */}
            <div
              onClick={() => draggedId && handleAssignToRoom(draggedId, "room-third")}
              className={cn(
                "col-span-12 sm:col-span-3 row-span-3 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 sm:border-4 transition-all duration-300 relative bg-[#CCFF00]/10 border-[#CCFF00] shadow-md flex flex-col justify-between cursor-pointer hover:scale-[1.01]"
              )}
            >
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/90 rounded-full text-[10px] sm:text-xs font-bold text-gray-800 shadow-sm border">
                  3. Уютная спальня • 14 м²
                </span>
                <span className="text-[10px] sm:text-xs font-extrabold text-emerald-800">
                  {roommates3B.find((r) => r.assignedRoomId === "room-third")?.calculatedPrice.toLocaleString()} ₽
                </span>
              </div>

              <div className="flex items-center justify-center flex-1">
                {roommates3B.find((r) => r.assignedRoomId === "room-third") ? (
                  <div className="relative flex flex-col items-center gap-1">
                    <img
                      src={roommates3B.find((r) => r.assignedRoomId === "room-third")?.avatar}
                      alt="avatar"
                      className="size-10 sm:size-14 rounded-full object-cover ring-4 ring-[#CCFF00] shadow-xl"
                    />
                    <span className="px-2 py-0.5 bg-gray-900 text-white rounded-full text-[10px] sm:text-xs font-bold shadow-md">
                      {roommates3B.find((r) => r.assignedRoomId === "room-third")?.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Нажмите для выбора</span>
                )}
              </div>
            </div>

            {/* Common Shared Zones */}
            <div className="col-span-12 row-span-3 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-dashed border-gray-300 bg-white/80 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 bg-gray-100 rounded-full text-[10px] sm:text-xs font-bold text-gray-700">
                  Общие зоны: Гостиная (24 м²) • Кухня (14 м²) • Ванная (8 м²)
                </span>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-[10px] font-bold">
                  Общий быт
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <header className="relative z-30 pt-4 px-4 sm:px-8 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-200/80"
          >
            <ArrowLeft className="size-4 sm:size-5" />
          </button>
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 font-heading">
            соседи<span className="text-[#CCFF00]">.</span>
          </span>
        </div>

        <h1 className="text-lg sm:text-3xl font-black text-gray-900 tracking-tight font-heading">
          Распределите <span className="text-emerald-700">комнаты (3 жильца)</span>
        </h1>
      </header>

      <main className="relative z-30 flex-1 px-4 sm:px-8 pt-4 pb-6 flex flex-col sm:flex-row justify-between pointer-events-none gap-4">
        <div className="hidden sm:block flex-1" />

        <div className="w-full sm:w-96 bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-2xl pointer-events-auto flex flex-col justify-between z-30 space-y-3">
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center justify-between">
              <span>Распределение спален</span>
              <DollarSign className="size-5 text-emerald-600" />
            </h3>

            <div className="space-y-2">
              {roommates3B.map((rm) => (
                <div
                  key={rm.id}
                  draggable
                  onDragStart={() => setDraggedId(rm.id)}
                  onDragEnd={() => setDraggedId(null)}
                  className="p-2.5 sm:p-3 rounded-2xl border bg-gray-50/90 border-gray-200 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={rm.avatar} alt={rm.name} className="size-9 sm:size-10 rounded-full object-cover shadow-sm ring-2 ring-white" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">{rm.name}</h4>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {rm.assignedRoomId === "room-master"
                          ? "Спальня 1 (Мастер)"
                          : rm.assignedRoomId === "room-second"
                          ? "Спальня 2 (Рабочее место)"
                          : "Спальня 3 (Уютная)"}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                    {rm.calculatedPrice.toLocaleString()} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-gray-900">
              <span>Итого аренда</span>
              <span className="text-lg sm:text-xl text-emerald-700">{totalApartmentRent.toLocaleString()} ₽</span>
            </div>

            <div className="text-[10px] text-emerald-800 bg-[#CCFF00]/20 px-2.5 py-1 rounded-xl font-bold flex items-center justify-between">
              <span>Расчет математически точен</span>
              <span>✓ Sum = {rentResult.isValid ? "40 000 ₽" : "Ошибка"}</span>
            </div>

            <button
              onClick={onConfirmAssignment}
              className="w-full py-3 px-4 bg-[#CCFF00] hover:bg-[#b8e600] text-gray-900 font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
            >
              <Check className="size-4" />
              <span>Сохранить</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
