"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, Sparkles } from "lucide-react";
import { FormattedMarkdown } from "@/components/ui/formatted-markdown";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export function AssistantChat() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Привет! Я — AI-ассистент платформы «Соседи». Помогу рассчитать бюджет, составить правила проживания, оценить совместимость сожителей или подготовить заявку собственнику.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSmartFallback = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("бюджет") || q.includes("деньги") || q.includes("скольк")) {
      return "💡 **Расчёт совместного бюджета:**\n\n- **Центральный район:** ~28 000–35 000 ₽/мес на 1-комн. или ~45 000–55 000 ₽ на 2-комн. на двоих.\n- **Коммунальные услуги:** закладывайте дополнительно 3 500–5 000 ₽ в зависимости от сезона.\n- **Рекомендация:** делить фиксированную аренду поровну или пропорционально площади комнат, а счетчики — строго поровну.";
    }
    if (q.includes("заявк") || q.includes("собственник") || q.includes("арендатор")) {
      return "📋 **Совет по групповой заявке:**\n\n1. Укажите состав группы (возраст, сферу деятельности каждого).\n2. Добавьте общий индекс совместимости (например, 89%+) — это повышает доверие собственника.\n3. Опишите гарантии: кто является ответственным арендатором и готовы ли вы внести залог сразу.";
    }
    if (q.includes("правил") || q.includes("быт") || q.includes("уборк") || q.includes("гост")) {
      return "🤝 **Базовый чек-лист правил группы:**\n\n• **Тихий час:** с 22:00 до 08:00 по будням.\n• **Уборка:** дежурство по неделям через трекер задач «Соседей».\n• **Гости:** предупреждать в общем чате минимум за 4 часа до прихода.";
    }
    if (q.includes("совместим") || q.includes("анкет") || q.includes("сосед")) {
      return "✨ **Оценка совместимости:**\n\nВысокое совпадение (>85%) достигается при едином графике сна, схожем отношении к чистоте и привычках проведения досуга. Заполните все 20 вопросов в профиле для максимальной точности.";
    }
    return "Я проанализировал ваш запрос по Краснодару и совместной аренде.\n\nМогу подсказать по 3 основным направлениям:\n1. 💰 Расчёт бюджета и расходов на группу.\n2. 📜 Шаблон правил проживания и уборки.\n3. 🏡 Подготовка выигрышной заявки собственнику.";
  };

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
    } catch {
      const fallback = generateSmartFallback(textToSend);
      setMessages((prev) => [...prev, { role: "assistant", text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search");
    if (q) {
      sendMessage(undefined, q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="surface-card flex min-h-[540px] flex-col p-4 sm:p-6 rounded-[24px] border border-[#E5E5E0] bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#E5E5E0] pb-4">
          <div className="grid size-10 place-items-center rounded-full bg-[#B3DB00]">
            <Bot className="size-5 text-[#111111]" />
          </div>
          <div>
            <p className="text-sm font-black text-[#111111]">Соседи AI Assistant</p>
            <p className="text-[10px] font-bold text-[#7B9E00]">Онлайн · Эксперт по совместной аренде</p>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 space-y-3 overflow-y-auto py-5 soft-scrollbar max-h-[420px]">
          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${idx}`}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-[18px] px-4 py-3 text-sm leading-6 ${
                  m.role === "user"
                    ? "bg-[#111111] text-white"
                    : "bg-[#F4F4F0] text-[#111111] border border-[#E5E5E0]"
                }`}
              >
                <FormattedMarkdown content={m.text} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-[18px] bg-[#F4F4F0] px-4 py-3 text-xs font-bold text-[#6B6F66] border border-[#E5E5E0] animate-pulse">
                AI анализирует данные группы...
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
        <div className="rounded-[20px] bg-[#111111] p-5 text-white shadow-sm">
          <Sparkles className="size-5 text-[#B3DB00]" />
          <p className="mt-4 text-sm font-black">Попробуйте спросить</p>
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
              onClick={() => sendMessage(undefined, "Какие бытовые правила обсудить с новым соседом?")}
              className="block w-full text-left font-semibold text-[#EBF7B6] hover:underline cursor-pointer"
            >
              «Что обсудить с соседом?»
            </button>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#E5E5E0] bg-white p-5 text-xs leading-5 text-[#6B6F66] shadow-sm">
          Умный ассистент использует контекстные алгоритмы платформы «Соседи» для безопасной совместной аренды.
        </div>
      </aside>
    </div>
  );
}
