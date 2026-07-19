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
  Bot,
  Zap,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { FormattedMarkdown } from "@/components/ui/formatted-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PropertyAttachmentModal } from "./property-attachment-modal";
import { ViewingModal } from "./viewing-modal";
import { PollCreateModal } from "./poll-create-modal";
import { ExpenseModal } from "./expense-modal";
import { demoProperties, formatRubles } from "@/data/demo";
import { createClientRepository } from "@/lib/repositories";
import { isDemoMode } from "@/lib/utils";
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

const EMOJIS = ["👍", "❤️", "🔥", "🤡", "😮", "🏠"];

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
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [isAdapting, setIsAdapting] = useState(false);

  // Custom reaction animations state
  const [particles, setParticles] = useState<{ id: string; x: number; y: number; emoji: string; style: React.CSSProperties }[]>([]);
  const [bounceMsgId, setBounceMsgId] = useState<string | null>(null);

  const spawnParticles = (emoji: string, clientX: number, clientY: number) => {
    const newParticles = Array.from({ length: 12 }).map((_, i) => {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const velocity = 35 + Math.random() * 70; // radius drift
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 45; // upwards drift bias
      const rotation = -45 + Math.random() * 90;
      const scale = 0.7 + Math.random() * 0.7;
      const duration = 500 + Math.random() * 350;

      return {
        id: `p-${Date.now()}-${i}-${Math.random()}`,
        x: clientX,
        y: clientY,
        emoji,
        style: {
          "--tx": `${tx}px`,
          "--ty": `${ty}px`,
          "--rot": `${rotation}deg`,
          "--scale": scale,
          animation: `emojiParticle ${duration}ms cubic-bezier(0.12, 0.89, 0.32, 0.94) forwards`,
        } as React.CSSProperties,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Cleanup expired particles
    setTimeout(() => {
      const ids = new Set(newParticles.map((p) => p.id));
      setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 1000);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const contextProperty = demoProperties.find(
    (p) => p.id === (thread.propertyId || "center-loft")
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    createClientRepository().markThreadAsRead(thread.id);
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

    const repo = createClientRepository();
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
    if (!isDemoMode()) return;
    setTimeout(() => setIsTyping(true), 800);
    setTimeout(async () => {
      let replyContent = "";
      let replySenderId = thread.id;
      let replySenderName = thread.name;
      let replySenderAvatar = thread.avatar || "";

      if (thread.id === "maria") {
        const replies = [
          "Отлично! Договорились, спасибо! Напишу перед выездом 👍",
          "Супер! Готова сходить на просмотр в четверг.",
          "Хорошо, записала! Если возникнут вопросы — я на связи.",
        ];
        replyContent = replies[Math.floor(Math.random() * replies.length)];
        replySenderId = "maria";
        replySenderName = "Мария";
        replySenderAvatar = "/demo/people/maria.jpg";
      } else if (thread.id === "owner") {
        const replies = [
          "Здравствуйте! Подтверждаю просмотр на указанное время.",
          "Понял вас. Наш риелтор свяжется с вашей группой за час до встречи.",
        ];
        replyContent = replies[Math.floor(Math.random() * replies.length)];
        replySenderId = "owner";
        replySenderName = "Собственник (АРЕАТОР)";
        replySenderAvatar = "/demo/people/owner.jpg";
      } else if (thread.id === "group") {
        const replies = [
          "Артём: Отлично, я тоже смогу подойти!",
          "Екатерина: Добавила в наш общий календарь 👍",
        ];
        const chosen = replies[Math.floor(Math.random() * replies.length)];
        if (chosen.startsWith("Артём:")) {
          replyContent = chosen.replace("Артём: ", "");
          replySenderId = "artem";
          replySenderName = "Артём";
          replySenderAvatar = "/demo/people/artem.jpg";
        } else {
          replyContent = chosen.replace("Екатерина: ", "");
          replySenderId = "ekaterina";
          replySenderName = "Екатерина";
          replySenderAvatar = "/demo/people/ekaterina.jpg";
        }
      }

      if (replyContent) {
        const replyMsg = await repo.sendMessage(thread.id, replyContent, "text", {
          senderId: replySenderId,
          senderName: replySenderName,
          senderAvatar: replySenderAvatar,
        });
        setMessages((prev) => [...prev, replyMsg]);
      }
      setIsTyping(false);
    }, 2200);
  };

  const handleVote = async (msgId: string, optId: string) => {
    const repo = createClientRepository();
    const updated = await repo.voteInPoll(thread.id, msgId, optId);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
  };

  const handleViewingStatus = async (msgId: string, status: ViewingBooking["status"]) => {
    const repo = createClientRepository();
    const updated = await repo.updateViewingStatus(thread.id, msgId, status);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
  };

  const handleTogglePaid = async (msgId: string, memberId: string) => {
    const repo = createClientRepository();
    const updated = await repo.toggleExpensePaid(thread.id, msgId, memberId);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
  };

  const handleReaction = async (msgId: string, emoji: string, e?: React.MouseEvent) => {
    if (e) {
      spawnParticles(emoji, e.clientX, e.clientY);
    }
    setBounceMsgId(msgId);
    setTimeout(() => setBounceMsgId(null), 450);

    const repo = createClientRepository();
    const updated = await repo.toggleMessageReaction(thread.id, msgId, emoji);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
  };

  const handleAdaptTone = () => {
    if (!input.trim()) return;
    setIsAdapting(true);
    // Simulate AI rewriting into optimized communication style
    setTimeout(() => {
      let rewritten = input;
      if (input.toLowerCase().includes("гряз") || input.toLowerCase().includes("посуд")) {
        rewritten = "Привет! Будет супер, если получится сполоснуть тарелки до вечера, чтобы нам всем было уютно готовить на кухне ☀️";
      } else if (input.toLowerCase().includes("деньг") || input.toLowerCase().includes("оплат")) {
        rewritten = "Привет! Напоминаю про оплату залога / аренды. Было бы здорово закрыть этот вопрос до выходных. Спасибо! 🙏";
      } else {
        rewritten = "Привет! Предлагаю обсудить этот вопрос вместе. Мне кажется, так мы быстрее договоримся и найдем удобный компромисс! ✨";
      }
      setInput(rewritten);
      setIsAdapting(false);
    }, 900);
  };

  // Anti-scam check
  const isScamRisk = messages.some((m) =>
    ["предоплата", "карту", "whatsapp", "телеграм"].some((word) =>
      m.content.toLowerCase().includes(word)
    )
  );

  return (
    <div className="flex h-full grid lg:grid-cols-[1fr_260px] bg-transparent">
      
      {/* Left Chat Stage */}
      <div className="flex h-full flex-col bg-transparent relative">
        
        {/* Active Thread Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E0]/60 bg-white/70 backdrop-blur-md p-3.5 sm:px-5">
          <div className="flex items-center gap-3">
            {onBackToList && (
              <button
                type="button"
                onClick={onBackToList}
                className="grid size-9 place-items-center rounded-full border border-[#E5E5E0] text-[#6B6F66] hover:bg-[#F4F4F0] sm:hidden cursor-pointer"
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
                <div className="relative size-10.5 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm">
                  <Image src={thread.avatar} alt={thread.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="grid size-10.5 place-items-center rounded-full bg-[#EBF7B6] text-xs font-black text-[#111111] border-2 border-white">
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
                  <span className="text-[9px] font-black uppercase text-[#7B9E00]">● В сети</span>
                )}
              </div>
              <p className="text-[10px] font-bold text-[#6B6F66]">{thread.sublabel}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className={`flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[10.5px] font-black border transition-all cursor-pointer ${
                aiPanelOpen
                  ? "bg-[#EBF7B6] border-[#B3DB00]/60 text-[#111111]"
                  : "bg-white border-[#E5E5E0] text-[#111111] hover:bg-[#F4F4F0]"
              }`}
            >
              <Bot className="size-3.5 text-[#7B9E00]" />
              {aiPanelOpen ? "Скрыть ИИ" : "ИИ Медиатор"}
            </button>
          </div>
        </div>

        {/* Anti-Scam Security Banner */}
        {isScamRisk && (
          <div className="flex items-center gap-2 bg-amber-50/90 backdrop-blur border-b border-amber-200/60 px-4 py-2 text-[10px] text-amber-900">
            <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
            <p className="font-bold">
              Безопасность: Никогда не отправляйте предоплату на карту без личного осмотра и договора.
            </p>
          </div>
        )}

        {/* Property Context Banner */}
        {contextProperty && (
          <div className="flex items-center justify-between border-b border-[#E5E5E0]/60 bg-white/50 px-4 py-2 text-[11px] font-semibold">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="size-3.5 shrink-0 text-[#7B9E00]" />
              <span className="font-extrabold text-[#111111] shrink-0">Объект:</span>
              <span className="truncate text-[#6B6F66]">
                {contextProperty.title} · {formatRubles(contextProperty.price)}/мес.
              </span>
            </div>
            <Link
              href={`/app/housing/${contextProperty.id}`}
              className="ml-2 flex shrink-0 items-center gap-0.5 font-black text-[#7B9E00] hover:underline text-[10px]"
            >
              Открыть <ExternalLink className="size-3" />
            </Link>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 soft-scrollbar">
          <div className="text-center">
            <span className="rounded-full bg-[#E5E5E0]/50 px-2.5 py-0.5 text-[9px] font-bold text-[#6B6F66]">
              Сегодня
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.senderId === "user";
            const isSystem = msg.type === "system_notice" || msg.senderId === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="mx-auto max-w-md text-center animate-in fade-in duration-250">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-[#7B9E00]/30 bg-[#EBF7B6]/40 p-3.5 text-[13px] font-bold text-[#111111] shadow-sm">
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
                className={`group relative flex items-end gap-2.5 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <Avatar className="size-8.5 shrink-0 border border-[#E5E5E0] bg-gray-200 shadow-sm">
                    <AvatarImage src={msg.senderAvatar} alt={msg.senderName} className="object-cover" />
                    <AvatarFallback className="text-[10px] font-black bg-[#EBF7B6] text-[#111111]">
                      {msg.senderName.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`relative max-w-[85%] sm:max-w-[70%] rounded-[20px] p-4 text-[14.5px] leading-relaxed shadow-[0_3px_14px_rgba(0,0,0,0.035)] border transition-all ${
                    bounceMsgId === msg.id ? "animate-bubble-bounce" : ""
                  } ${
                    isUser
                      ? "rounded-br-none bg-gradient-to-br from-[#222] to-[#0c0c0c] text-white border-transparent"
                      : msg.type === "ai_bot"
                      ? "rounded-bl-none border-[#7B9E00]/40 bg-[#EBF7B6]/30 text-[#111111] backdrop-blur-md"
                      : "rounded-bl-none border-white/60 bg-white/90 text-[#111111] backdrop-blur-md"
                  }`}
                >
                  {!isUser && (
                    <p className="mb-1 text-[11px] font-black text-[#7B9E00] flex items-center gap-1.5">
                      {msg.senderName}
                      {msg.type === "ai_bot" && (
                        <span className="rounded bg-[#7B9E00] px-1.5 py-0.5 text-[8.5px] text-white font-black">
                          ИИ
                        </span>
                      )}
                    </p>
                  )}

                  {/* Property Card Bubble */}
                  {attachedProp && (
                    <div className="mb-2.5 overflow-hidden rounded-xl border border-[#E5E5E0] bg-white p-2 text-[#111111] shadow-sm">
                      <div className="relative h-24 w-full overflow-hidden rounded-[8px]">
                        <Image
                          src={attachedProp.image}
                          alt={attachedProp.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="font-black text-[12px]">{attachedProp.title}</p>
                        <p className="text-[9.5px] text-[#6B6F66] font-medium">{attachedProp.address}</p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="font-black text-[11.5px] text-[#7B9E00]">
                            {formatRubles(attachedProp.price)}/мес.
                          </span>
                          <Link
                            href={`/app/housing/${attachedProp.id}`}
                            className="inline-flex items-center gap-1 rounded-full bg-[#EBF7B6] px-2.5 py-0.5 text-[9.5px] font-black text-[#111111] shadow-sm"
                          >
                            Перейти <ChevronRight className="size-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Viewing Booking Card */}
                  {msg.type === "viewing_request" && msg.viewingData && (
                    <div className="mb-2.5 rounded-xl border border-[#7B9E00]/30 bg-white p-3 text-[#111111] shadow-sm">
                      <p className="font-black text-[11px] flex items-center gap-1.5">
                        <Calendar className="size-4 text-[#7B9E00]" /> Запрос на просмотр объекта
                      </p>
                      <p className="mt-1 text-[10.5px] text-[#6B6F66] font-semibold">
                        Дата: <span className="font-black text-[#111111]">{msg.viewingData.date}</span> в{" "}
                        <span className="font-black text-[#111111]">{msg.viewingData.timeSlot}</span>
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        {msg.viewingData.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleViewingStatus(msg.id, "confirmed")}
                              className="rounded-full bg-[#7B9E00] px-3.5 py-1 text-[9.5px] font-black text-white shadow-sm cursor-pointer"
                            >
                              Подтвердить
                            </button>
                            <button
                              type="button"
                              onClick={() => handleViewingStatus(msg.id, "declined")}
                              className="rounded-full border border-[#E5E5E0] bg-white px-3.5 py-1 text-[9.5px] font-black text-[#6B6F66] cursor-pointer"
                            >
                              Отклонить
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#7B9E00] px-2.5 py-0.5 text-[9.5px] font-black text-white shadow-sm">
                            <Check className="size-3" /> Статус: {msg.viewingData.status === "confirmed" ? "Подтверждено" : "Отклонено"}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Group Poll Card */}
                  {msg.type === "poll" && msg.pollData && (
                    <div className="mb-2.5 rounded-xl border border-[#E5E5E0] bg-white p-3 text-[#111111] shadow-sm">
                      <p className="font-black text-[11.5px] flex items-center gap-1.5 text-[#111111]">
                        <BarChart3 className="size-4 text-[#7B9E00]" /> {msg.pollData.question}
                      </p>
                      <div className="mt-2.5 space-y-1.5">
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
                              className={`w-full rounded-xl border p-2 text-left transition-all relative overflow-hidden text-[10.5px] cursor-pointer ${
                                hasVoted
                                  ? "border-[#7B9E00] bg-[#EBF7B6]/30 font-bold"
                                  : "border-[#E5E5E0] bg-white hover:bg-[#F4F4F0]"
                              }`}
                            >
                              <div className="relative z-10 flex items-center justify-between">
                                <span>{opt.text}</span>
                                <span className="font-black">{count} ({pct}%)</span>
                              </div>
                              <div className="absolute inset-y-0 left-0 bg-[#EBF7B6] opacity-35" style={{ width: `${pct}%` }} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Expense Split Card */}
                  {msg.type === "expense_split" && msg.expenseData && (
                    <div className="mb-2.5 rounded-xl border border-[#E5E5E0] bg-white p-3 text-[#111111] shadow-sm">
                      <p className="font-black text-[11.5px] flex items-center gap-1.5">
                        <Wallet className="size-4 text-[#7B9E00]" /> Раздел расходов: {msg.expenseData.title}
                      </p>
                      <p className="mt-0.5 text-[13.5px] font-black text-[#7B9E00]">
                        {formatRubles(msg.expenseData.totalAmount)}
                      </p>
                      <div className="mt-2.5 space-y-1.5">
                        {msg.expenseData.shares.map((share) => (
                          <div
                            key={share.memberId}
                            className="flex items-center justify-between rounded-lg bg-[#F4F4F0]/60 p-2 text-[10px] font-bold"
                          >
                            <span className="text-[#111111]">{share.memberName} (доля: {formatRubles(share.amount)})</span>
                            <button
                              type="button"
                              onClick={() => handleTogglePaid(msg.id, share.memberId)}
                              className={`rounded-full px-2.5 py-0.5 text-[8.5px] font-black shadow-sm cursor-pointer ${
                                share.isPaid
                                  ? "bg-[#7B9E00] text-white"
                                  : "bg-white border border-[#E5E5E0] text-[#6B6F66] hover:border-[#111111]"
                              }`}
                            >
                              {share.isPaid ? "Оплачено" : "Отметить оплату"}
                            </button>
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
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-[#7B9E00] text-white cursor-pointer hover:scale-105"
                      >
                        <Play className="size-4 ml-0.5 fill-white" />
                      </button>
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full w-1/3 bg-[#7B9E00]" />
                        </div>
                        <span className="text-[11px] text-gray-400 font-bold">{msg.voiceDuration || "0:14"}</span>
                      </div>
                    </div>
                  )}

                  <FormattedMarkdown content={msg.content} />

                  {/* Emoji Reactions Badge */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={(e) => handleReaction(msg.id, emoji, e)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[13px] font-bold text-[#111111] cursor-pointer hover:bg-white transition-colors animate-reaction-badge"
                        >
                          <span className="text-[14px]">{emoji}</span>
                          <span className="text-[11px]">{count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`mt-1.5 flex items-center justify-end gap-1 text-[10.5px] font-bold ${
                      isUser ? "text-gray-400" : "text-[#878881]"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck className="size-3.5 text-[#7B9E00]" />}
                  </div>

                  {/* Quick Emoji Reaction Trigger */}
                  <div className="absolute -top-4 right-2 hidden group-hover:flex items-center gap-1.5 rounded-full border border-white/80 bg-white p-1.5 px-2 shadow-lg animate-in zoom-in-90 duration-100 z-10">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={(e) => handleReaction(msg.id, emoji, e)}
                        className="hover:scale-130 transition-transform text-[16px] cursor-pointer p-0.5"
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
              <div className="rounded-2xl bg-white border border-[#E5E5E0] px-4 py-2 shadow-sm text-xs text-[#6B6F66] flex items-center gap-1.5">
                <span className="size-1.5 animate-bounce rounded-full bg-[#7B9E00]" />
                <span className="size-1.5 animate-bounce rounded-full bg-[#7B9E00] delay-150" />
                <span className="size-1.5 animate-bounce rounded-full bg-[#7B9E00] delay-300" />
                <span className="ml-1 font-semibold">{thread.name} печатает...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Quick Action Prompt Chips */}
        <div className="px-4 py-2 border-t border-[#E5E5E0]/60 bg-white/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
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
              className="shrink-0 rounded-full border border-[#E5E5E0]/60 bg-white/80 px-3 py-1 text-[10px] font-black text-[#111111] hover:border-[#B3DB00] hover:bg-[#EBF7B6] transition-colors cursor-pointer"
            >
              {chip.text}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#E5E5E0]/60 bg-white/50 backdrop-blur">
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
              title="Прикрепить квартиру"
              aria-label="Прикрепить квартиру"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#6B6F66] hover:border-[#111111] hover:bg-[#F4F4F0] cursor-pointer"
            >
              <Plus className="size-5" />
            </button>

            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите сообщение..."
                className="h-10 w-full rounded-full border border-[#E5E5E0] bg-[#F4F4F0] pl-4 pr-24 text-[14.5px] text-[#111111] outline-none transition-all focus:border-[#111111] focus:bg-white placeholder:text-[#878881]"
              />

              {/* Adapt tone button */}
              {input.trim() && (
                <button
                  type="button"
                  onClick={handleAdaptTone}
                  disabled={isAdapting}
                  className="absolute right-2 h-7 px-3 rounded-full bg-[#111111] text-[#B3DB00] hover:bg-black text-[11px] font-black flex items-center gap-1 transition-transform hover:scale-105 cursor-pointer disabled:opacity-40"
                >
                  <Sparkles className={`size-3 ${isAdapting ? "animate-spin" : ""}`} />
                  {isAdapting ? "ИИ..." : "Тон ИИ ✨"}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Отправить сообщение"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-[#7B9E00] text-white disabled:opacity-40 transition-all hover:bg-[#688600] cursor-pointer shadow-sm"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: AI Mediation & DNA Insights Sidebar (Functional Core) */}
      {aiPanelOpen && (
        <div className="hidden lg:flex flex-col border-l border-[#E5E5E0]/60 bg-white/40 backdrop-blur-md p-4 space-y-4 overflow-y-auto soft-scrollbar">
          
          <div className="flex items-center gap-1.5 border-b border-[#E5E5E0]/60 pb-3">
            <span className="grid size-5 place-items-center rounded bg-[#7B9E00] text-white">
              <Bot className="size-3.5" />
            </span>
            <h4 className="text-[12.5px] font-black text-[#111111] uppercase tracking-wider">
              ИИ-Ассистент
            </h4>
          </div>

          {/* Conflict Probability Dashboard */}
          <div className="rounded-[18px] bg-white border border-[#E5E5E0]/70 p-3.5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#6B6F66] uppercase tracking-wider">Гармония чата</span>
              <span className="text-[11px] font-black text-[#7B9E00] flex items-center gap-1">
                <ShieldCheck className="size-3.5" /> 92%
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111111]">
                <span>Угроза трений</span>
                <span className="text-emerald-600 font-extrabold">Низкая (8%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F4F4F0] overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: "8%" }} />
              </div>
            </div>
          </div>

          {/* Real-time Mediation Intervention Suggestions */}
          <div className="space-y-2.5">
            <span className="text-[9.5px] font-black text-[#6B6F66] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="size-3 text-[#7B9E00]" /> Рекомендации ИИ
            </span>

            <div className="rounded-[18px] border border-[#EBF7B6] bg-[#EBF7B6]/30 p-3 text-[11px] leading-relaxed text-[#111111] space-y-2">
              <p className="font-semibold">
                <strong>Тема: Бытовой договор.</strong> ИИ заметил готовность Марии согласовать правила совместной жизни.
              </p>
              <button
                type="button"
                onClick={() => handleSend("Привет! Давай зафиксируем наше соглашение тихих часов. Отправила ссылку на симулятор быта!", "text")}
                className="w-full text-left rounded-lg bg-white border border-[#E5E5E0] p-2 hover:border-[#7B9E00] transition-colors text-[9.5px] font-bold text-[#4A4E44]"
              >
                📝 Отправить: «Давай зафиксируем наши тихие часы...»
              </button>
            </div>

            <div className="rounded-[18px] border border-[#E5E5E0] bg-white p-3 text-[11px] leading-relaxed text-[#111111] space-y-2">
              <p className="font-semibold text-[#6B6F66]">
                <strong>Тон сообщений:</strong> Вы общаетесь дружелюбно. Рекомендуемый тон для Марии: структурированный и ясный.
              </p>
              <div className="flex items-center gap-1.5 text-[9.5px] text-[#7B9E00] font-black bg-[#F3F9D2] rounded-lg p-1.5 justify-center">
                <Volume2 className="size-3.5" /> Включена автокоррекция
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Reaction Particles Floating Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "fixed",
              left: p.x,
              top: p.y,
              transform: "translate(-50%, -50%)",
              fontSize: "24px",
              ...p.style,
            }}
            className="select-none pointer-events-none"
          >
            {p.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
