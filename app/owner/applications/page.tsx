"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock3, FileText, MessageCircle, X } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { createClientRepository } from "@/lib/repositories";

interface ApplicationItem {
  id: string;
  name: string;
  property: string;
  status: "Новая" | "На просмотре" | "Одобрена" | "Отклонена";
  date: string;
}

export default function OwnerApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([
    { id: "1", name: "Мария и группа из 3 человек", property: "Светлая квартира в центре", status: "Новая", date: "Сегодня, 10:30" },
    { id: "2", name: "Илья и Екатерина", property: "Квартира рядом с парком", status: "На просмотре", date: "Вчера" },
    { id: "3", name: "Артём", property: "Комната у Галицкого парка", status: "Одобрена", date: "12 мая" },
  ]);

  useEffect(() => {
    const loadRepoApps = async () => {
      try {
        const repo = createClientRepository();
        const state = await repo.getState();
        if (state.applications && state.applications.length > 0) {
          const mapped = state.applications.map(app => {
            const propName = app.propertyId === "center-loft" ? "Светлая квартира в центре" : "Апартаменты";
            const dateStr = new Date(app.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
            return {
              id: app.id,
              name: "Группа пользователей",
              property: propName,
              status: app.status === "submitted" ? "Новая" as const : "На просмотре" as const,
              date: dateStr
            };
          });
          setApplications(prev => {
            const ids = new Set(prev.map(p => p.id));
            const newApps = mapped.filter(m => !ids.has(m.id));
            return [...newApps, ...prev];
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadRepoApps();
  }, []);

  const handleUpdateStatus = (id: string, nextStatus: ApplicationItem["status"]) => {
    setApplications(prev =>
      prev.map(app => app.id === id ? { ...app, status: nextStatus } : app)
    );
  };

  return (
    <PageFrame title="Заявки собственника" description="Отвечайте группам сожителей и одобряйте заселение в один клик.">
      <div className="space-y-3">
        {applications.map((app) => {
          const isNew = app.status === "Новая";
          const isReviewing = app.status === "На просмотре";
          const isApproved = app.status === "Одобрена";
          const isDeclined = app.status === "Отклонена";

          return (
            <article key={app.id} className="surface-card p-5 transition-all hover:shadow-md">
              <div className="flex flex-wrap items-start gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                  <FileText className="size-4 text-[#7B9E00]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-extrabold">{app.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{app.property} · {app.date}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  isApproved 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : isDeclined 
                      ? "bg-rose-50 text-rose-700 border border-rose-200" 
                      : "bg-surface-muted text-muted-foreground border border-border"
                }`}>
                  <Clock3 className="size-3" /> {app.status}
                </span>
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!isApproved && !isDeclined && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => handleUpdateStatus(app.id, "Одобрена")}
                      className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-4 py-2.5 text-xs font-extrabold hover:bg-[hsl(var(--accent-hover))] transition-colors"
                    >
                      <Check className="size-4" /> Одобрить
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleUpdateStatus(app.id, "Отклонена")}
                      className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-xs font-extrabold hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
                    >
                      <X className="size-4" /> Отклонить
                    </button>
                  </>
                )}
                {isApproved && (
                  <span className="text-xs font-extrabold text-emerald-600">✓ Заявка одобрена. Договор подготовлен к подписанию.</span>
                )}
                {isDeclined && (
                  <span className="text-xs font-extrabold text-rose-500">✕ Заявка отклонена.</span>
                )}
                
                <Link href="/owner/messages" className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-extrabold bg-white hover:bg-slate-50 ml-auto">
                  <MessageCircle className="size-4" /> Написать в чат
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </PageFrame>
  );
}
