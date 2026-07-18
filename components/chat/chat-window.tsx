"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Building2,
  Calendar,
  Check,
  CheckCheck,
  ChevronRight,
  ExternalLink,
  Play,
  Plus,
  Send,
  Sparkles,
  Wallet,
} from "lucide-react";
import { PropertyAttachmentModal } from "./property-attachment-modal";
import { ViewingModal } from "./viewing-modal";
import { PollCreateModal } from "./poll-create-modal";
import { ExpenseModal } from "./expense-modal";
import { demoProperties, formatRubles } from "@/data/demo";
import { DemoRepository } from "@/lib/repositories/demo-repository";
import type {
  ChatMessage,
  ChatThread,
  ExpenseSplit,
  GroupPoll,
  ViewingBooking,
} from "@/lib/repositories/types";

interface ChatWindowProps {
  thread: ChatThread;
  initialMessages: ChatMessage[];
  onBackToList?: () => void;
}

const EMOJIS = ["👍", "❤️", "🔥", "🏠", "😮"];

export function ChatWindow({
  thread,
  initialMessages,
  onBackToList,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const contextProperty = demoProperties.find(
    (p) => p.id === (thread.propertyId || "center-loft")
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    new DemoRepository().markThreadAsRead(thread.id);
  }, [thread.id]);

  const handleSend = async (
    textToSend?: string,
    type: ChatMessage["type"] = "text",
    extraData?: {
      propertyId?: string;
      viewingData?: ViewingBooking;
      pollData?: GroupPoll;
      expenseData?: ExpenseSplit;
      voiceDuration?: string;
    }
  ) => {
    const text = (textToSend || input).trim();
    if (!text && type === "text") return;

    if (!textToSend) setInput("");

    const repo = new DemoRepository();
    const sentMsg = await repo.sendMessage(thread.id, text || "Смарт-карточка", type, extraData);
    setMessages((prev) => [...prev, sentMsg]);

    // Real AI Assistant Bot Call via /api/ai/chat
    if (thread.id === "ai-assistant") {
      setIsTyping(true);
      try {
        const history = [...messages, sentMsg].map((m) => ({
          role: m.senderId === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        let aiResponse = "Я с радостью отвечу на любой вопрос по поиску жилья, соседей и составлению договора!";
        if (res.ok) {
          const data = await res.json();
          if (data.reply) {
            aiResponse = data.reply;
          }
        }

        const botMsg = await repo.sendMessage("ai-assistant", aiResponse, "ai_bot");
        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.warn("AI endpoint notification:", err);
        const fallbackMsg = await repo.sendMessage(
          "ai-assistant",
          "Я с удовольствием отвечу на любые вопросы по быту, договорным условиям и совместимости сожителей!",
          "ai_bot",
        );
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Simulated Auto-Reply for Roommate / Group / Owner
    setTimeout(() => setIsTyping(true), 800);
    setTimeout(async () => {
      let replyContent = "";
      if (thread.id === "maria") {
        const replies = [
          "Отлично! Договорились, спасибо! Напишу перед выездом 👍",
          "Супер! Готова сходить на просмотр в четверг.",
          "Хорошо, записала! Если возникнут вопросы — я на связи.",
        ];
        replyContent = replies[Math.floor(Math.random() * replies.length)];
      } else if (thread.id === "owner") {
        const replies = [
          "Здравствуйте! Подтверждаю просмотр на указанное время.",
          "Понял вас. Наш риелтор свяжется с вашей группой за час до встречи.",
        ];
        replyContent = replies[Math.floor(Math.random() * replies.length)];
      } else if (thread.id === "group") {
        const replies = [
          "Артём: Отлично, я тоже смогу подойти!",
          "Екатерина: Добавила в наш общий календарь 👍",
        ];
        replyContent = replies[Math.floor(Math.random() * replies.length)];
      }

      if (replyContent) {
        const replyMsg = await repo.sendMessage(thread.id, replyContent);
        setMessages((prev) => [...prev, replyMsg]);
      }
      setIsTyping(false);
    }, 2200);
  };

  const handleVote = async (msgId: string, optId: string) => {
    const repo = new DemoRepository();
    const updated = await repo.voteInPoll(thread.id, msgId, optId);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
  };

  const handleViewingStatus = async (msgId: string, status: ViewingBooking["status"]) => {
    const repo = new DemoRepository();
    const updated = await repo.updateViewingStatus(thread.id, msgId, status);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
  };

  const handleTogglePaid = async (msgId: string, memberId: string) => {
    const repo = new DemoRepository();
    const updated = await repo.toggleExpensePaid(thread.id, msgId, memberId);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    const repo = new DemoRepository();
    const updated = await repo.toggleMessageReaction(thread.id, msgId, emoji);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
  };

  // Anti-scam check
  const isScamRisk = messages.some((m) =>
    ["предоплата", "карту", "whatsapp", "телеграм"].some((word) =>
      m.content.toLowerCase().includes(word)
    )
  );

  return (
    <div className="flex h-full flex-col bg-[#F9F9F6]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E0] bg-white p-3.5 shadow-sm sm:px-5">
        <div className="flex items-center gap-3">
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="grid size-9 place-items-center rounded-full border border-[#E5E5E0] text-[#6B6F66] hover:bg-[#F4F4F0] sm:hidden"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}

          <div className="relative shrink-0">
            {thread.avatars && thread.avatars.length > 0 ? (
              <div className="flex -space-x-2 overflow-hidden">
                {thread.avatars.slice(0, 3).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative size-8 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                  >
                    <Image src={img} alt="Avatar" fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : thread.avatar ? (
              <div className="relative size-10 overflow-hidden rounded-full border border-[#E5E5E0] bg-gray-100">
                <Image src={thread.avatar} alt={thread.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="grid size-10 place-items-center rounded-full bg-[#EBF7B6] text-xs font-black text-[#111111]">
                {thread.name.slice(0, 1)}
              </div>
            )}
            {thread.isOnline && (
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-[#7B9E00]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#111111]">{thread.name}</h3>
              {thread.isOnline && (
                <span className="text-[10px] font-bold text-[#7B9E00]">● В сети</span>
              )}
            </div>
            <p className="text-[11px] font-medium text-[#6B6F66]">{thread.sublabel}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsViewingModalOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-3 text-[11px] font-bold text-[#111111] hover:border-[#111111] hover:bg-[#F4F4F0]"
          >
            <Calendar className="size-3.5 text-[#7B9E00]" /> Запросить просмотр
          </button>
          {thread.type === "group" && (
            <button
              type="button"
              onClick={() => setIsPollModalOpen(true)}
              className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-3 text-[11px] font-bold text-[#111111] hover:border-[#111111] hover:bg-[#F4F4F0]"
            >
              <BarChart3 className="size-3.5 text-[#7B9E00]" /> Опрос
            </button>
          )}
        </div>
      </div>

      {/* Anti-Scam Security Banner */}
      {isScamRisk && (
        <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900">
          <AlertTriangle className="size-4 text-amber-600 shrink-0" />
          <p className="font-semibold">
            Безопасность: Никогда не переводите предоплату до личного просмотра объекта и проверки документов.
          </p>
        </div>
      )}

      {/* Property Context Banner */}
      {contextProperty && (
        <div className="flex items-center justify-between border-b border-[#E5E5E0] bg-[#FFF] px-4 py-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="size-4 shrink-0 text-[#7B9E00]" />
            <span className="font-extrabold text-[#111111] shrink-0">Объект:</span>
            <span className="truncate text-[#6B6F66]">
              {contextProperty.title} · {formatRubles(contextProperty.price)}/мес.
            </span>
          </div>
          <Link
            href={`/app/housing/${contextProperty.id}`}
            className="ml-2 flex shrink-0 items-center gap-1 font-bold text-[#7B9E00] hover:underline"
          >
            Открыть <ExternalLink className="size-3" />
          </Link>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <span className="rounded-full bg-[#E5E5E0]/60 px-3 py-1 text-[10px] font-bold text-[#6B6F66]">
            Сегодня
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.senderId === "user";
          const isSystem = msg.type === "system_notice" || msg.senderId === "system";

          if (isSystem) {
            return (
              <div key={msg.id} className="mx-auto max-w-md text-center">
                <div className="inline-flex items-center gap-2 rounded-[16px] border border-[#7B9E00]/30 bg-[#EBF7B6]/50 p-3 text-[11px] font-bold text-[#111111]">
                  <Sparkles className="size-4 shrink-0 text-[#7B9E00]" />
                  {msg.content}
                </div>
              </div>
            );
          }

          const attachedProp = msg.propertyId
            ? demoProperties.find((p) => p.id === msg.propertyId)
            : null;

          return (
            <div
              key={msg.id}
              className={`group relative flex items-end gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="relative size-7 shrink-0 overflow-hidden rounded-full border border-[#E5E5E0] bg-gray-200">
                  {msg.senderAvatar ? (
                    <Image src={msg.senderAvatar} alt={msg.senderName} fill className="object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-[10px] font-extrabold bg-[#EBF7B6]">
                      {msg.senderName.slice(0, 1)}
                    </div>
                  )}
                </div>
              )}

              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-[20px] p-3.5 text-xs leading-5 shadow-sm ${
                  isUser
                    ? "rounded-br-none bg-[#111111] text-white"
                    : msg.type === "ai_bot"
                    ? "rounded-bl-none border border-[#7B9E00]/40 bg-[#FFF] text-[#111111]"
                    : "rounded-bl-none border border-[#E5E5E0] bg-white text-[#111111]"
                }`}
              >
                {!isUser && (
                  <p className="mb-1 text-[10px] font-extrabold text-[#7B9E00] flex items-center gap-1">
                    {msg.senderName}
                    {msg.type === "ai_bot" && (
                      <span className="rounded bg-[#7B9E00] px-1 text-[8px] text-white font-bold">
                        ИИ
                      </span>
                    )}
                  </p>
                )}

                {/* Property Card Bubble */}
                {attachedProp && (
                  <div className="mb-2 overflow-hidden rounded-[14px] border border-[#E5E5E0] bg-[#F9F9F6] p-2 text-[#111111]">
                    <div className="relative h-28 w-full overflow-hidden rounded-[10px]">
                      <Image
                        src={attachedProp.image}
                        alt={attachedProp.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="font-black text-xs">{attachedProp.title}</p>
                      <p className="text-[10px] text-[#6B6F66]">{attachedProp.address}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-black text-xs text-[#7B9E00]">
                          {formatRubles(attachedProp.price)}/мес.
                        </span>
                        <Link
                          href={`/app/housing/${attachedProp.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-[#EBF7B6] px-2.5 py-0.5 text-[10px] font-extrabold text-[#111111]"
                        >
                          Перейти <ChevronRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Viewing Booking Card */}
                {msg.type === "viewing_request" && msg.viewingData && (
                  <div className="mb-2 rounded-[14px] border border-[#7B9E00]/30 bg-[#EBF7B6]/40 p-3 text-[#111111]">
                    <p className="font-extrabold text-xs flex items-center gap-1.5">
                      <Calendar className="size-4 text-[#7B9E00]" /> Запрос на просмотр объекта
                    </p>
                    <p className="mt-1 text-[11px] text-[#6B6F66]">
                      Дата: <span className="font-bold text-[#111111]">{msg.viewingData.date}</span> в{" "}
                      <span className="font-bold text-[#111111]">{msg.viewingData.timeSlot}</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {msg.viewingData.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleViewingStatus(msg.id, "confirmed")}
                            className="rounded-full bg-[#7B9E00] px-3 py-1 text-[10px] font-extrabold text-white"
                          >
                            Подтвердить
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewingStatus(msg.id, "declined")}
                            className="rounded-full border border-[#E5E5E0] bg-white px-3 py-1 text-[10px] font-bold text-[#6B6F66]"
                          >
                            Отклонить
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#7B9E00] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                          <Check className="size-3" /> Статус: {msg.viewingData.status === "confirmed" ? "Подтверждено" : "Отклонено"}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Group Poll Card */}
                {msg.type === "poll" && msg.pollData && (
                  <div className="mb-2 rounded-[14px] border border-[#E5E5E0] bg-[#FFF] p-3 text-[#111111]">
                    <p className="font-extrabold text-xs flex items-center gap-1.5">
                      <BarChart3 className="size-4 text-[#7B9E00]" /> {msg.pollData.question}
                    </p>
                    <div className="mt-2.5 space-y-2">
                      {msg.pollData.options.map((opt) => {
                        const count = opt.voterIds.length;
                        const pct = msg.pollData!.totalVotes
                          ? Math.round((count / msg.pollData!.totalVotes) * 100)
                          : 0;
                        const hasVoted = opt.voterIds.includes("user");

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleVote(msg.id, opt.id)}
                            className={`w-full rounded-[12px] border p-2 text-left transition-all relative overflow-hidden ${
                              hasVoted
                                ? "border-[#7B9E00] bg-[#EBF7B6]/30 font-bold"
                                : "border-[#E5E5E0] hover:border-[#111111]"
                            }`}
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-[#EBF7B6]/50 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between text-[11px]">
                              <span>{opt.text}</span>
                              <span className="font-extrabold text-[#7B9E00]">{pct}% ({count})</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expense Split Card */}
                {msg.type === "expense_split" && msg.expenseData && (
                  <div className="mb-2 rounded-[14px] border border-[#E5E5E0] bg-[#FFF] p-3 text-[#111111]">
                    <p className="font-extrabold text-xs flex items-center gap-1.5">
                      <Wallet className="size-4 text-[#7B9E00]" /> {msg.expenseData.title}
                    </p>
                    <p className="text-[11px] font-bold text-[#7B9E00] mt-0.5">
                      Итого: {msg.expenseData.totalAmount.toLocaleString("ru-RU")} ₽
                    </p>
                    <div className="mt-2 space-y-1.5 border-t border-[#E5E5E0] pt-2">
                      {msg.expenseData.shares.map((share) => (
                        <div
                          key={share.memberId}
                          className="flex items-center justify-between text-[10.5px]"
                        >
                          <span className="font-semibold">{share.memberName}:</span>
                          <div className="flex items-center gap-2">
                            <span>{share.amount.toLocaleString("ru-RU")} ₽</span>
                            <button
                              type="button"
                              onClick={() => handleTogglePaid(msg.id, share.memberId)}
                              className={`rounded-full px-2 py-0.5 font-bold text-[9.5px] ${
                                share.isPaid
                                  ? "bg-[#7B9E00] text-white"
                                  : "bg-gray-100 text-[#6B6F66]"
                              }`}
                            >
                              {share.isPaid ? "Оплачено" : "Ожидает"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Message Bubble */}
                {msg.type === "voice" && (
                  <div className="flex items-center gap-3 py-1">
                    <button
                      type="button"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#7B9E00] text-white"
                    >
                      <Play className="size-4 ml-0.5" />
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full w-1/3 bg-[#7B9E00]" />
                      </div>
                      <span className="text-[10px] text-gray-400">{msg.voiceDuration || "0:14"}</span>
                    </div>
                  </div>
                )}

                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Emoji Reactions Badge */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleReaction(msg.id, emoji)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#111111]"
                      >
                        <span>{emoji}</span>
                        <span>{count}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`mt-1.5 flex items-center justify-end gap-1 text-[9.5px] ${
                    isUser ? "text-gray-400" : "text-[#878881]"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="size-3 text-[#7B9E00]" />}
                </div>

                {/* Quick Emoji Reaction Trigger */}
                <div className="absolute -top-3 right-2 hidden group-hover:flex items-center gap-1 rounded-full border border-[#E5E5E0] bg-white p-1 shadow-md">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReaction(msg.id, emoji)}
                      className="hover:scale-125 transition-transform text-xs"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white border border-[#E5E5E0] px-4 py-2 shadow-sm text-xs text-[#6B6F66] flex items-center gap-1.5">
              <span className="size-1.5 animate-bounce rounded-full bg-[#7B9E00]" />
              <span className="size-1.5 animate-bounce rounded-full bg-[#7B9E00] delay-150" />
              <span className="size-1.5 animate-bounce rounded-full bg-[#7B9E00] delay-300" />
              <span className="ml-1 font-semibold">{thread.name} печатает...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-[#E5E5E0] bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          {
            text: "📅 Запросить просмотр",
            action: () => setIsViewingModalOpen(true),
          },
          {
            text: "📊 Создать опрос",
            action: () => setIsPollModalOpen(true),
          },
          {
            text: "💰 Разделить залог",
            action: () => setIsExpenseModalOpen(true),
          },
          {
            text: "🏠 Отправить квартиру",
            action: () => setIsPropertyModalOpen(true),
          },
        ].map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={chip.action}
            className="shrink-0 rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-3 py-1 text-[10.5px] font-bold text-[#111111] hover:border-[#111111] hover:bg-[#EBF7B6] transition-colors"
          >
            {chip.text}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-[#E5E5E0] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setIsPropertyModalOpen(true)}
            title="Прикрепить квартиру из каталога"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#E5E5E0] text-[#6B6F66] hover:border-[#111111] hover:bg-[#F4F4F0]"
          >
            <Plus className="size-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напишите сообщение..."
            className="h-10 min-w-0 flex-1 rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-4 text-xs text-[#111111] outline-none transition-all focus:border-[#111111] focus:bg-white placeholder:text-[#878881]"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#7B9E00] text-white disabled:opacity-40 transition-all hover:bg-[#688600]"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>

      {/* Modals */}
      <PropertyAttachmentModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSelectProperty={(propId) => {
          const prop = demoProperties.find((p) => p.id === propId);
          handleSend(`Посмотрите вариант: ${prop?.title || "Квартира"}`, "property_card", { propertyId: propId });
        }}
      />

      <ViewingModal
        isOpen={isViewingModalOpen}
        onClose={() => setIsViewingModalOpen(false)}
        onSubmit={(date, timeSlot, propertyId) => {
          handleSend("Запрос на просмотр квартиры", "viewing_request", {
            propertyId,
            viewingData: {
              id: `view-${Date.now()}`,
              propertyId,
              date,
              timeSlot,
              status: "pending",
              requestedBy: "user",
            },
          });
        }}
      />

      <PollCreateModal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        onSubmit={(pollData) => {
          handleSend(`Опрос: ${pollData.question}`, "poll", { pollData });
        }}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={(expenseData) => {
          handleSend(`Расчёт расходов: ${expenseData.title}`, "expense_split", { expenseData });
        }}
      />
    </div>
  );
}
