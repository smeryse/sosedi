"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BarChart3, Plus, Trash2, X } from "lucide-react";
import type { GroupPoll } from "@/lib/repositories/types";

interface PollCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poll: GroupPoll) => void;
}

export function PollCreateModal({
  isOpen,
  onClose,
  onSubmit,
}: PollCreateModalProps) {
  const [question, setQuestion] = useState("Голосуем за 1-к квартиру на Северной (25 000 ₽)?");
  const [options, setOptions] = useState<string[]>([
    "Да, отличный вариант!",
    "Хочу посмотреть еще варианты",
    "Не подходит по бюджету",
  ]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const next = [...options];
    next[index] = val;
    setOptions(next);
  };

  const handleSubmit = () => {
    if (!question.trim()) return;
    const validOpts = options.filter((o) => o.trim().length > 0);
    if (validOpts.length < 2) return;

    const poll: GroupPoll = {
      id: `poll-${Date.now()}`,
      question: question.trim(),
      options: validOpts.map((text, idx) => ({
        id: `opt-${idx + 1}`,
        text,
        voterIds: [],
      })),
      totalVotes: 0,
    };

    onSubmit(poll);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-[24px] border border-[#E5E5E0] bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-full bg-[#EBF7B6] text-[#7B9E00]">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#111111]">
                Создать опрос для группы
              </h3>
              <p className="text-[11px] text-[#6B6F66]">
                Соберите мнения участников вашей группы
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-[#6B6F66] transition-colors hover:bg-[#F4F4F0] hover:text-[#111111]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Question */}
          <div>
            <label className="text-xs font-bold text-[#111111]">Вопрос опроса:</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Например: Голосуем за квартиру на Красной?"
              className="mt-1.5 w-full rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-4 py-2.5 text-xs text-[#111111] outline-none"
            />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs font-bold text-[#111111]">Варианты ответов:</label>
            <div className="mt-2 space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Вариант ${idx + 1}`}
                    className="w-full rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-4 py-2 text-xs text-[#111111] outline-none"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="grid size-8 shrink-0 place-items-center text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#7B9E00] hover:underline"
              >
                <Plus className="size-3.5" /> Добавить вариант
              </button>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="lime-button w-full flex items-center justify-center gap-2 rounded-full py-3 text-xs font-extrabold"
            >
              Опубликовать опрос в чат
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
