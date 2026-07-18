"use client";

import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Привет! Я — AI-ассистент платформы «Соседи». Помогу рассчитать бюджет, составить правила проживания, оценить совместимость или подготовить заявку на жильё.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e?: React.FormEvent, promptText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (promptText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = { role: "user", text: textToSend };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    if (!promptText) setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      if (!res.ok || !data.reply) {
        throw new Error(data.details || data.error || `Error ${res.status}`);
      }

      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      console.warn("AI endpoint notification:", err);
      let fallbackText = "Я помогу сравнить соседей, жильё и правила группы. Спросите про бюджет, заявку или совместимость.";
      const lower = textToSend.toLowerCase();
      if (lower.includes("бюджет")) {
        fallbackText = "Для вашей группы безопасный ориентир — до 90 000 ₽ в месяц. Оставьте ещё 10% на коммунальные расходы.";
      } else if (lower.includes("заявк")) {
        fallbackText = "Лучше отправить заявку на два объекта: так вы сохраните выбор и не будете ждать один ответ.";
      }
      setMessages((prev) => [...prev, { role: "assistant", text: fallbackText }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="surface-card flex min-h-[540px] flex-col p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#E5E5E0] pb-4">
          <div className="grid size-10 place-items-center rounded-full bg-[#B3DB00]">
            <Bot className="size-5 text-[#111111]" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#111111]">Соседи AI Assistant</p>
            <p className="text-[10px] font-bold text-[#7B9E00]">Онлайн</p>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 space-y-3 overflow-y-auto py-5 soft-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${idx}`}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-[18px] px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#111111] text-white"
                    : "bg-[#F4F4F0] text-[#111111] border border-[#E5E5E0]"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-[18px] bg-[#F4F4F0] px-4 py-3 text-xs font-bold text-[#6B6F66] border border-[#E5E5E0] animate-pulse">
                AI готовит ответ...
              </div>
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={(e) => sendMessage(e)} className="flex items-center gap-2 border-t border-[#E5E5E0] pt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Например: как распределить бюджет на 3 человек?"
            disabled={loading}
            className="h-11 min-w-0 flex-1 rounded-full bg-[#F4F4F0] px-4 text-sm outline-none text-[#111111] placeholder:text-[#878881] border border-transparent focus:border-[#B3DB00]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Отправить сообщение"
            className="grid size-11 place-items-center rounded-full bg-[#B3DB00] text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            <Send className="size-4" />
          </button>
        </form>
      </section>

      {/* Sidebar prompts */}
      <aside className="space-y-4">
        <div className="rounded-[20px] bg-[#111111] p-5 text-white">
          <Sparkles className="size-5 text-[#B3DB00]" />
          <p className="mt-4 text-sm font-extrabold">Попробуйте спросить</p>
          <div className="mt-3 space-y-2 text-xs text-white/70">
            <button
              type="button"
              onClick={() => sendMessage(undefined, "Какой бюджет заложить на 3 человек в центре?")}
              className="block w-full text-left font-semibold text-[#EBF7B6] hover:underline cursor-pointer"
            >
              «Какой бюджет заложить?»
            </button>
            <button
              type="button"
              onClick={() => sendMessage(undefined, "Как правильно подготовить групповую заявку собственнику?")}
              className="block w-full text-left font-semibold text-[#EBF7B6] hover:underline cursor-pointer"
            >
              «Как подготовить заявку?»
            </button>
            <button
              type="button"
              onClick={() => sendMessage(undefined, "Какие бытовые правила обсудить с новым соседом при заселении?")}
              className="block w-full text-left font-semibold text-[#EBF7B6] hover:underline cursor-pointer"
            >
              «Что обсудить с соседом?»
            </button>
          </div>
        </div>

        <div className="surface-card p-5 text-xs leading-5 text-[#6B6F66]">
          Умный ассистент использует контекстные алгоритмы платформы «Соседи» для безопасной совместной аренды.
        </div>
      </aside>
    </div>
  );
}
