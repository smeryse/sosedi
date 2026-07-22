"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock3, FileText, MessageCircle, MessageSquareQuote, X } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { createClientRepository } from "@/lib/repositories";
import type { DemoApplication } from "@/lib/repositories/types";

interface ApplicationUIItem {
  id: string;
  name: string;
  property: string;
  tenantMessage?: string;
  status: "Новая" | "На просмотре" | "Одобрена" | "Отклонена";
  rawStatus: DemoApplication["status"];
  date: string;
}

const DEFAULT_DEMO_APPLICATIONS: ApplicationUIItem[] = [
  {
    id: "demo-app-1",
    name: "Мария и группа из 3 человек",
    property: "Светлая квартира в центре (ул. Северная, д. 426)",
    tenantMessage: "Здравствуйте! Наша группа готова арендовать квартиру на длительный срок. Все участники официально трудоустроены, животных нет. Будем рады договориться о просмотре!",
    status: "Новая",
    rawStatus: "submitted",
    date: "Сегодня, 10:30",
  },
  {
    id: "demo-app-2",
    name: "Илья и Екатерина",
    property: "Квартира рядом с парком Галицкого",
    tenantMessage: "Добрый день! Ищем 2-комнатную квартиру с удобным выездом в центр. Оплата без задержек.",
    status: "На просмотре",
    rawStatus: "reviewing",
    date: "Вчера",
  },
];

function mapRawStatus(raw: DemoApplication["status"]): ApplicationUIItem["status"] {
  switch (raw) {
    case "approved":
      return "Одобрена";
    case "needs_response":
    case "reviewing":
      return "На просмотре";
    case "draft":
    case "submitted":
    default:
      return "Новая";
  }
}

export default function OwnerApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationUIItem[]>(DEFAULT_DEMO_APPLICATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRepoApplications() {
      try {
        const repo = createClientRepository();
        const state = await repo.getState();

        if (state.applications && state.applications.length > 0) {
          const mappedRepoApps: ApplicationUIItem[] = state.applications.map((app) => {
            const propName = app.propertyId === "center-loft"
              ? "Светлая квартира в центре (ул. Северная)"
              : "Апартаменты для совместной аренды";

            const groupTitle = state.group?.name
              ? `Группа "${state.group.name}"`
              : "Заявка от сожителей";

            const dateStr = app.createdAt
              ? new Date(app.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
              : "Недавно";

            return {
              id: app.id,
              name: groupTitle,
              property: propName,
              tenantMessage: app.message,
              status: mapRawStatus(app.status),
              rawStatus: app.status,
              date: dateStr,
            };
          });

          setApplications((prev) => {
            const repoIds = new Set(mappedRepoApps.map((a) => a.id));
            const remainingDefaultApps = prev.filter((a) => !repoIds.has(a.id));
            return [...mappedRepoApps, ...remainingDefaultApps];
          });
        }
      } catch (err) {
        console.error("Failed to load owner applications:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRepoApplications();
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: "approved" | "needs_response") => {
    const uiStatus = nextStatus === "approved" ? "Одобрена" : "Отклонена";

    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: uiStatus, rawStatus: nextStatus } : app))
    );

    try {
      const repo = createClientRepository();
      await repo.updateApplicationStatus(id, nextStatus);
    } catch (err) {
      console.error("Failed to persist application status:", err);
    }
  };

  return (
    <PageFrame title="Заявки собственника" description="Отвечайте группам сожителей, изучайте сообщения арендаторов и одобряйте заселение.">
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-muted-foreground animate-pulse">
            Загрузка заявок собственника...
          </div>
        ) : applications.length === 0 ? (
          <div className="surface-card p-8 text-center text-sm font-bold text-muted-foreground">
            Пока нет поступавших заявок от групп сожителей.
          </div>
        ) : (
          applications.map((app) => {
            const isApproved = app.status === "Одобрена";
            const isDeclined = app.status === "Отклонена";

            return (
              <article key={app.id} className="surface-card p-5 transition-all hover:shadow-md rounded-[20px] border border-[#E5E5E0] bg-white">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-[#EBF7B6] text-[#111111] shrink-0">
                    <FileText className="size-5 text-[#7B9E00]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-black text-[#111111]">{app.name}</h2>
                    <p className="mt-1 text-xs text-[#6B6F66] font-medium">{app.property} · {app.date}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-extrabold ${
                      isApproved
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isDeclined
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-[#F4F4F0] text-[#111111] border border-[#E5E5E0]"
                    }`}
                  >
                    <Clock3 className="size-3" /> {app.status}
                  </span>
                </div>

                {/* Tenant Cover Message */}
                {app.tenantMessage && (
                  <div className="mt-3.5 rounded-2xl bg-[#F4F4F0] p-3.5 text-xs leading-relaxed text-[#111111] border border-[#E5E5E0]/70">
                    <p className="mb-1 flex items-center gap-1.5 font-black text-[#7B9E00] text-[10.5px] uppercase tracking-wider">
                      <MessageSquareQuote className="size-3.5" /> Сообщение от арендаторов:
                    </p>
                    <p className="font-medium text-[#222222]">«{app.tenantMessage}»</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 border-t border-[#E5E5E0]/60">
                  {!isApproved && !isDeclined && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "approved")}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#B3DB00] px-4 py-2 text-xs font-black text-[#111111] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                      >
                        <Check className="size-4" /> Одобрить заявку
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "needs_response")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-4 py-2 text-xs font-extrabold text-[#6B6F66] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors cursor-pointer"
                      >
                        <X className="size-4" /> Отклонить
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <span className="text-xs font-black text-emerald-700">
                      ✓ Заявка одобрена. Договор подготовлен к подписанию.
                    </span>
                  )}
                  {isDeclined && (
                    <span className="text-xs font-black text-rose-600">
                      ✕ Заявка отклонена.
                    </span>
                  )}

                  <Link
                    href="/owner/messages"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-4 py-2 text-xs font-black text-[#111111] hover:bg-[#F4F4F0] transition-colors ml-auto"
                  >
                    <MessageCircle className="size-4 text-[#7B9E00]" /> Открыть чат
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>
    </PageFrame>
  );
}
