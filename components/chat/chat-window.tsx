"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCheck,
  ChevronRight,
  ExternalLink,
  Plus,
  Send,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { PropertyAttachmentModal } from "./property-attachment-modal";
import { demoProperties, formatRubles } from "@/data/demo";
import { DemoRepository } from "@/lib/repositories/demo-repository";
import type { ChatMessage, ChatThread } from "@/lib/repositories/types";

interface ChatWindowProps {
  thread: ChatThread;
  initialMessages: ChatMessage[];
  onBackToList?: () => void;
}

export function ChatWindow({
  thread,
  initialMessages,
  onBackToList,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Property associated with thread
  const contextProperty = demoProperties.find(
    (p) => p.id === (thread.propertyId || "center-loft")
  );

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Mark as read when thread opens
  useEffect(() => {
    new DemoRepository().markThreadAsRead(thread.id);
  }, [thread.id]);

  const handleSend = async (
    textToSend?: string,
    type: "text" | "property_card" | "attachment" = "text",
    propertyId?: string
  ) => {
    const text = (textToSend || input).trim();
    if (!text && type === "text") return;

    if (!textToSend) setInput("");

    const repo = new DemoRepository();
    const sentMsg = await repo.sendMessage(thread.id, text || "Прикреплённый объект", type, propertyId);
    setMessages((prev) => [...prev, sentMsg]);

    // Simulated Auto-Reply from roommate or owner after 1.8 seconds
    if (thread.id !== "system") {
      setTimeout(() => {
        setIsTyping(true);
      }, 600);

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
            "Здравствуйте! Сообщение принято. Подтверждаю просмотр на это время.",
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
    }
  };

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

        {/* Header Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSend("Здравствуйте! Подскажите, свободна ли квартира для просмотра на этой неделе?", "text")}
            className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-3 text-[11px] font-bold text-[#111111] hover:border-[#111111] hover:bg-[#F4F4F0]"
          >
            <Calendar className="size-3.5 text-[#7B9E00]" /> Просмотр
          </button>
          <Link
            href="/app/group"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#EBF7B6] px-3 text-[11px] font-extrabold text-[#111111] hover:bg-[#d9ea98]"
          >
            <UserCheck className="size-3.5" /> Анкета группы
          </Link>
        </div>
      </div>

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
              className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
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
                className={`max-w-[80%] sm:max-w-[70%] rounded-[20px] p-3.5 text-xs leading-5 shadow-sm ${
                  isUser
                    ? "rounded-br-none bg-[#111111] text-white"
                    : "rounded-bl-none border border-[#E5E5E0] bg-white text-[#111111]"
                }`}
              >
                {!isUser && (
                  <p className="mb-1 text-[10px] font-extrabold text-[#7B9E00]">
                    {msg.senderName}
                  </p>
                )}

                {/* Property Card Attachment */}
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

                <p className="whitespace-pre-wrap">{msg.content}</p>

                <div
                  className={`mt-1.5 flex items-center justify-end gap-1 text-[9.5px] ${
                    isUser ? "text-gray-400" : "text-[#878881]"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="size-3 text-[#7B9E00]" />}
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
            text: "📅 Предложить время просмотра в четверг после 18:00",
            action: () => handleSend("Привет! Мы готовы прийти на просмотр в четверг после 18:00. Вам будет удобно?"),
          },
          {
            text: "📄 Отправить состав нашей группы",
            action: () => handleSend("Наша группа состоит из 3 человек: Мария (маркетолог), Артём (разработчик) и Екатерина (дизайнер). Общий бюджет 90 000 ₽."),
          },
          {
            text: "🏠 Отправить вариант из избранного",
            action: () => setIsAttachmentModalOpen(true),
          },
          {
            text: "❓ Уточнить правила проживания и животных",
            action: () => handleSend("Подскажите, пожалуйста, какие в квартире правила относительно гостей и домашних животных?"),
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
            onClick={() => setIsAttachmentModalOpen(true)}
            title="Прикрепить квартиру"
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

      {/* Property Attachment Modal */}
      <PropertyAttachmentModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        onSelectProperty={(propId) => {
          const prop = demoProperties.find((p) => p.id === propId);
          handleSend(`Посмотрите вариант: ${prop?.title || "Квартира"}`, "property_card", propId);
        }}
      />
    </div>
  );
}
