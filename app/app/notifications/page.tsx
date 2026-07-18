import Link from "next/link";
import { Bell, Check, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import type { LucideIcon } from "lucide-react";

const notifications: { title: string; detail: string; Icon: LucideIcon; unread: boolean }[] = [
  { title: "Собственник ответил на заявку", detail: "Квартира в центре · 10 минут назад", Icon: MessageCircle, unread: true },
  { title: "Мария пригласила вас в чат", detail: "Группа «Квартира в центре» · 2 часа назад", Icon: Bell, unread: true },
  { title: "Профиль заполнен на 82%", detail: "Добавьте ответы про гостей и шум · вчера", Icon: Sparkles, unread: false },
  { title: "Задача по уборке закрыта", detail: "Кухня и плита · вчера", Icon: Check, unread: false },
];

export default function NotificationsPage() { return <PageFrame eyebrow="События" title="Уведомления" description="Ничего важного не потеряется: ответы, приглашения и подсказки группы."><div className="space-y-3">{notifications.map(({ title, detail, Icon, unread }) => <Link href="/app/messages" key={title} className={`flex items-start gap-3 rounded-[18px] border p-4 ${unread ? "bg-surface" : "bg-surface-muted/60"}`}><div className="grid size-10 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent-soft))]"><Icon className="size-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p></div><ChevronRight className="mt-1 size-4 text-muted-foreground" /></Link>)}</div></PageFrame>; }
