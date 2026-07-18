"use client";

import { useState } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { demoProperties } from "@/data/demo";

interface ViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string, timeSlot: string, propertyId: string) => void;
  defaultPropertyId?: string;
}

export function ViewingModal({
  isOpen,
  onClose,
  onSubmit,
  defaultPropertyId = "center-loft",
}: ViewingModalProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(defaultPropertyId);
  const [date, setDate] = useState("Четверг, 24 Июля");
  const [timeSlot, setTimeSlot] = useState("18:30");

  if (!isOpen) return null;

  const dates = [
    "Среда, 23 Июля",
    "Четверг, 24 Июля",
    "Пятница, 25 Июля",
    "Суббота, 26 Июля",
  ];

  const slots = ["12:00", "15:00", "17:30", "18:30", "19:30", "20:30"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[24px] border border-[#E5E5E0] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-[#7B9E00]" />
            <h3 className="text-base font-extrabold text-[#111111]">
              Запросить просмотр квартиры
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-[#6B6F66] hover:bg-[#F4F4F0]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Select Property */}
          <div>
            <label className="text-xs font-bold text-[#111111]">Объект:</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="mt-1 w-full rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-4 py-2 text-xs text-[#111111] outline-none"
            >
              {demoProperties.slice(0, 10).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.address})
                </option>
              ))}
            </select>
          </div>

          {/* Select Date */}
          <div>
            <label className="text-xs font-bold text-[#111111] flex items-center gap-1">
              <Calendar className="size-3.5 text-[#7B9E00]" /> Выберите дату:
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={`rounded-full border py-2 text-center text-xs font-bold transition-all ${
                    date === d
                      ? "border-[#7B9E00] bg-[#EBF7B6] text-[#111111]"
                      : "border-[#E5E5E0] bg-white text-[#6B6F66] hover:bg-[#F4F4F0]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Select Time Slot */}
          <div>
            <label className="text-xs font-bold text-[#111111] flex items-center gap-1">
              <Clock className="size-3.5 text-[#7B9E00]" /> Удобный слот времени:
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTimeSlot(s)}
                  className={`rounded-full border py-2 text-center text-xs font-bold transition-all ${
                    timeSlot === s
                      ? "border-[#7B9E00] bg-[#EBF7B6] text-[#111111]"
                      : "border-[#E5E5E0] bg-white text-[#6B6F66] hover:bg-[#F4F4F0]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onSubmit(date, timeSlot, selectedPropertyId);
                onClose();
              }}
              className="lime-button w-full flex items-center justify-center gap-2 rounded-full py-3 text-xs font-extrabold"
            >
              Отправить запрос на просмотр
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
