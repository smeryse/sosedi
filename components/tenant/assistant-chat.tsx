"use client";

import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

const answers: Record<string, string> = {
  бюджет: "Для вашей группы безопасный ориентир — до 90 000 ₽ в месяц. Оставьте ещё 10% на коммунальные расходы и интернет.",
  заявк: "Лучше отправить заявку на два объекта: так вы сохраните выбор и не будете ждать один ответ в пустоте.",
  сосед: "Начните с трёх тем: режим сна, гости и уборка. Потом обсудите правила, которые важны именно вам.",
};

export function AssistantChat() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([{ role: "assistant", text: "Привет! Я помогу сравнить варианты, подготовить заявку или обсудить правила группы." }]); const [value, setValue] = useState("");
  const send = (event: React.FormEvent) => { event.preventDefault(); const text = value.trim(); if (!text) return; const lower = text.toLocaleLowerCase("ru"); const key = Object.keys(answers).find((item) => lower.includes(item)); const reply = key ? answers[key] : "Соберу это в понятный следующий шаг. Проверьте группу, бюджет и выбранный объект — там уже есть нужные данные."; setMessages((current) => [...current, { role: "user", text }, { role: "assistant", text: reply }]); setValue(""); };
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]"><section className="surface-card flex min-h-[520px] flex-col p-4 sm:p-6"><div className="flex items-center gap-3 border-b pb-4"><div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent))]"><Bot className="size-5" /></div><div><p className="text-sm font-extrabold">Соседи AI</p><p className="text-[10px] text-muted-foreground">Подсказывает по вашим данным</p></div></div><div className="flex-1 space-y-3 py-5">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-[16px] px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-foreground text-background" : "bg-surface-muted"}`}>{message.text}</div></div>)}</div><form onSubmit={send} className="flex items-center gap-2 border-t pt-4"><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Например: как распределить бюджет?" className="h-11 min-w-0 flex-1 rounded-full bg-surface-muted px-4 text-sm outline-none" /><button type="submit" aria-label="Отправить сообщение" className="grid size-11 place-items-center rounded-full bg-[hsl(var(--accent))]"><Send className="size-4" /></button></form></section><aside className="space-y-4"><div className="rounded-[20px] bg-foreground p-5 text-background"><Sparkles className="size-5 text-[hsl(var(--accent))]" /><p className="mt-4 text-sm font-extrabold">Попробуйте спросить</p><div className="mt-3 space-y-2 text-xs text-background/70"><p>«Какой бюджет заложить?»</p><p>«Как подготовить заявку?»</p><p>«Что обсудить с соседом?»</p></div></div><div className="surface-card p-5 text-xs leading-5 text-muted-foreground">AI использует только данные вашего профиля и группы. Проверяйте важные решения с участниками.</div></aside></div>;
}
