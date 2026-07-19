"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Gamepad2, X, Sparkles } from "lucide-react";

export function FloatingZhenya() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      
      {/* Popover Bubble */}
      {isOpen && (
        <div className="w-[290px] rounded-[24px] border border-white/60 bg-white/85 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative size-10 overflow-hidden rounded-full border-2 border-[#B3DB00] bg-white shadow-sm">
                <Image
                  src="/demo/people/zhenya.jpg"
                  alt="Zhenya Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-[13px] font-black text-[#111111] flex items-center gap-1">
                  Женя <span className="text-[9px] text-[#7B9E00] font-black bg-[#EBF7B6] px-1 rounded">ИИ</span>
                </h4>
                <p className="text-[9.5px] font-bold text-[#6B6F66]">Твой ИИ-Посредник</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-[#878881] hover:bg-[#F4F4F0] hover:text-[#111111] transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Description */}
          <p className="mt-3 text-[11.5px] leading-relaxed text-[#222222] font-medium">
            Привет! Я помогу сгладить углы в общении, составить бытовой договор или запустить симуляцию вашей совместной аренды. ✨
          </p>

          {/* Action Links */}
          <div className="mt-3.5 space-y-2">
            <Link
              href="/app/messages/ai-assistant"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 w-full rounded-xl bg-[#111111] hover:bg-black px-3.5 py-2 text-[11px] font-black text-white transition-all shadow-sm group cursor-pointer"
            >
              <MessageSquare className="size-3.5 text-[#B3DB00]" />
              <span>Задать вопрос Жене</span>
            </Link>

            <Link
              href="/app/simulator"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 w-full rounded-xl border border-[#E5E5E0] bg-white hover:bg-[#EBF7B6] hover:border-[#B3DB00] px-3.5 py-2 text-[11px] font-black text-[#111111] transition-all cursor-pointer"
            >
              <Gamepad2 className="size-3.5 text-[#7B9E00]" />
              <span>Симулятор быта</span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex size-14 items-center justify-center rounded-full bg-[#111111] text-white shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/10"
      >
        {/* Pulsing visual glow */}
        <span className="absolute inset-0 rounded-full bg-[#B3DB00] opacity-0 group-hover:animate-ping group-hover:opacity-15 duration-1000" />
        
        {/* Avatar Image */}
        <div className="relative size-12.5 overflow-hidden rounded-full border border-white/20">
          <Image
            src="/demo/people/zhenya.jpg"
            alt="Zhenya Chat Trigger"
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* Online Indicator Dot */}
        <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full border-2 border-[#111111] bg-[#7B9E00] flex items-center justify-center">
          <span className="size-1.5 rounded-full bg-white animate-pulse" />
        </span>

        {/* Sparkle decorative badge */}
        {!isOpen && (
          <span className="absolute -top-1.5 -left-1.5 bg-[#EBF7B6] border border-[#B3DB00]/60 text-[#7B9E00] rounded-full p-1 shadow-sm">
            <Sparkles className="size-3" />
          </span>
        )}
      </button>
      
    </div>
  );
}
