"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { FormattedMarkdown } from "@/components/ui/formatted-markdown";
import { createClientRepository } from "@/lib/repositories";
import type { ChatMessage } from "@/lib/repositories/types";

const QUICK_PROMPTS = [
  { label: "💰 Рассчитать бюджет", text: "Как правильно рассчитать и разделить бюджет аренды и коммунальных счетов в группе?" },
  { label: "✉️ Написать собственнику", text: "Составь готовое короткое сообщение собственнику для первого контакта и запроса просмотра." },
  { label: "🤝 Правила проживания", text: "Подготовь чек-лист бытовых правил для группы (тихий час, уборка, гости)." },
  { label: "📊 Разобрать расходы", text: "Как разделить залог и случайные бытовые покупки между соседями?" },
  { label: "🏡 Чек-лист просмотра", text: "На что обратить внимание при просмотре квартиры и проверке документов?" },
];

export function AssistantChat() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasGroupContext, setHasGroupContext] = useState(false);

  const isLoadedRef = useRef(false);
  const processedQueryRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottomIfNear = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (isNearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottomIfNear();
  }, [messages, loading, scrollToBottomIfNear]);

  // Load Assistant Conversation & User Context from Repository on Mount
  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const repo = createClientRepository();
        const state = await repo.getState().catch(() => null);

        if (active && state?.group) {
          setHasGroupContext(true);
        }

        const history = await repo.getMessages("ai-assistant");

        if (active) {
          if (history.length > 0) {
            setMessages(history);
          } else {
            const welcomeMsg: ChatMessage = {
              id: "welcome-ai",
              senderId: "ai-assistant",
              senderName: "Соседи AI",
              senderAvatar: "/demo/people/zhenya.jpg",
              content: "Здравствуйте! Я — AI-ассистент платформы «Соседи». Помогу рассчитать бюджет, составить бытовые правила, подготовить сообщение собственнику или чек-лист просмотра.",
              timestamp: "Только что",
              type: "ai_bot",
              isRead: true,
            };
            setMessages([welcomeMsg]);
          }
          isLoadedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to load AI conversation history:", err);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const handleSend = useCallback(async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setErrorMessage(null);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setLoading(true);

    try {
      const repo = createClientRepository();

      // Save User Message to Repository
      const userMsg = await repo.sendMessage("ai-assistant", query, "text");
      setMessages((prev) => [...prev, userMsg]);

      // Prepare Messages Payload
      const apiPayload = messages
        .concat(userMsg)
        .filter((m) => m.type !== "system_notice")
        .map((m) => ({
          role: m.senderId === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content || m.body || "",
        }));

      // Post to Primary /api/ai/chat Endpoint
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiPayload }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Не удалось получить ответ сервера.");
      }

      const botReplyText = data.reply || "Сервис ИИ-помощника временно недоступен. Пожалуйста, попробуйте еще раз.";

      // Save AI Bot Response to Repository
      const botMsg = await repo.sendMessage("ai-assistant", botReplyText, "ai_bot", {
        senderId: "ai-assistant",
        senderName: "Соседи AI",
        senderAvatar: "/demo/people/zhenya.jpg",
      });

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("AI Assistant send error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Не удалось отправить сообщение. Проверьте подключение к сети."
      );
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  // Handle Search Query Auto-Send ONCE on mount
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search");
    if (q && isLoadedRef.current && !processedQueryRef.current && !loading) {
      processedQueryRef.current = true;
      handleSend(q);
    }
  }, [searchParams, loading, handleSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const retryLastSend = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.senderId === "user");
    if (lastUserMsg) {
      handleSend(lastUserMsg.content || lastUserMsg.body);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="surface-card flex min-h-[580px] flex-col p-4 sm:p-6 rounded-[24px] border border-[#E5E5E0] bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-[#B3DB00] text-[#111111] shadow-sm">
              <Bot className="size-5" />
            </div>
            <div>
              <p className="text-sm font-black text-[#111111]">Соседи AI</p>
              <p className="text-[10px] font-bold text-[#7B9E00]">
                {hasGroupContext ? "Онлайн · Данные вашей группы подключены" : "Онлайн · Эксперт по совместной аренде"}
              </p>
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div ref={scrollContainerRef} className="flex-1 space-y-4 overflow-y-auto py-5 soft-scrollbar max-h-[460px]">
          {messages.map((m) => {
            const isUser = m.senderId === "user";
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-[20px] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-[#111111] text-white rounded-br-none"
                      : "bg-[#F4F4F0] text-[#111111] border border-[#E5E5E0] rounded-bl-none"
                  }`}
                >
                  {!isUser && (
                    <p className="mb-1 text-[10.5px] font-black text-[#7B9E00] flex items-center gap-1">
                      Соседи AI
                    </p>
                  )}
                  <FormattedMarkdown content={m.content || m.body || ""} />
                  <span className={`mt-1.5 block text-right text-[9.5px] font-bold ${isUser ? "text-gray-400" : "text-[#878881]"}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-[20px] bg-[#EBF7B6]/40 border border-[#B3DB00]/50 px-4 py-3 text-xs font-bold text-[#4A6000] animate-pulse flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#7B9E00] animate-ping" />
                Соседи AI обдумывает ответ...
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-medium">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={retryLastSend}
                className="inline-flex items-center gap-1 font-black text-rose-800 hover:underline cursor-pointer"
              >
                <RefreshCw className="size-3.5" /> Повторить
              </button>
            </div>
          )}
        </div>

        {/* Quick Action Chips */}
        <div className="py-2.5 border-t border-[#E5E5E0] flex gap-2 overflow-x-auto soft-scrollbar">
          {QUICK_PROMPTS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSend(chip.text)}
              className="shrink-0 rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-3 py-1 text-[11px] font-bold text-[#111111] hover:border-[#B3DB00] hover:bg-[#EBF7B6] transition-colors cursor-pointer disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Form with Shift+Enter Support */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2 border-t border-[#E5E5E0] pt-3"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите вопрос (Enter — отправить, Shift+Enter — новая строка)..."
            disabled={loading}
            className="min-h-[44px] max-h-[120px] min-w-0 flex-1 resize-none rounded-[18px] bg-[#F4F4F0] px-4 py-2.5 text-sm outline-none text-[#111111] placeholder:text-[#878881] border border-transparent focus:border-[#B3DB00] transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Отправить сообщение"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-[#B3DB00] text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-sm mb-0.5"
          >
            <Send className="size-4" />
          </button>
        </form>
      </section>

      {/* Sidebar Info */}
      <aside className="space-y-4">
        <div className="rounded-[22px] bg-[#111111] p-5 text-white shadow-sm">
          <Sparkles className="size-5 text-[#B3DB00]" />
          <p className="mt-4 text-sm font-black">Специалист по аренде</p>
          <p className="mt-2 text-xs leading-relaxed text-white/70">
            Соседи AI даёт практичные подсказки по подбору соседей, бюджетированию, согласованию быта и общению с собственниками.
          </p>
        </div>

        <div className="rounded-[22px] border border-[#E5E5E0] bg-white p-5 text-xs leading-relaxed text-[#6B6F66] shadow-sm">
          <p className="font-bold text-[#111111] mb-1">💡 Правовая оговорка</p>
          Все расчеты и рекомендации являются справочными. Перед сделкой обязательно проверяйте договор и документы собственника.
        </div>
      </aside>
    </div>
  );
}
