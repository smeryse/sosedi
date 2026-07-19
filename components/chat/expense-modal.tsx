"use client";

import { useState } from "react";
import { Wallet, X } from "lucide-react";
import type { ExpenseSplit } from "@/lib/repositories/types";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: ExpenseSplit) => void;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
}: ExpenseModalProps) {
  const [title, setTitle] = useState("Залог 25 000 ₽ + Аренда 1 мес.");
  const [totalAmount, setTotalAmount] = useState(50000);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim() || totalAmount <= 0) return;

    const perPerson = Math.round(totalAmount / 3);

    const expense: ExpenseSplit = {
      id: `exp-${Date.now()}`,
      title: title.trim(),
      totalAmount,
      shares: [
        { memberId: "maria", memberName: "Мария", amount: perPerson, isPaid: true },
        { memberId: "artem", memberName: "Артём", amount: perPerson, isPaid: false },
        { memberId: "user", memberName: "Вы", amount: perPerson, isPaid: true },
      ],
    };

    onSubmit(expense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[24px] border border-[#E5E5E0] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
          <div className="flex items-center gap-2">
            <Wallet className="size-5 text-[#7B9E00]" />
            <h3 className="text-base font-extrabold text-[#111111]">
              Калькулятор расходов и залога
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
          <div>
            <label className="text-xs font-bold text-[#111111]">Название расхода:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Залог за квартиру"
              className="mt-1 w-full rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-4 py-2 text-xs text-[#111111] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#111111]">Общая сумма (₽):</label>
            <input
              type="number"
              value={totalAmount || ""}
              onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
              placeholder="50000"
              className="mt-1 w-full rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-4 py-2 text-xs text-[#111111] outline-none font-extrabold text-[#7B9E00]"
            />
          </div>

          <div className="rounded-[16px] bg-[#EBF7B6]/50 p-3.5 text-xs text-[#111111] space-y-1">
            <p className="font-extrabold flex items-center justify-between">
              <span>Доля каждого (на 3 уч.):</span>
              <span className="text-sm font-black text-[#7B9E00]">
                {Math.round(totalAmount / 3).toLocaleString("ru-RU")} ₽
              </span>
            </p>
            <p className="text-[10.5px] text-[#6B6F66]">
              Автоматически рассчитывается равными долями между участниками группы.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="lime-button w-full flex items-center justify-center gap-2 rounded-full py-3 text-xs font-extrabold"
            >
              Отправить расчёт в чат группы
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
