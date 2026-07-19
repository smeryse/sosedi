"use client";

import { useEffect, useState } from "react";
import { globalModerationQueueService, ModerationEventRecord } from "@/lib/services/moderation-queue-service";
import { Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminModerationPage() {
  const [events, setEvents] = useState<ModerationEventRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const queue = await globalModerationQueueService.getModerationQueue();
    setEvents(queue);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleResolve = async (id: string, status: "approved" | "rejected" | "escalated") => {
    await globalModerationQueueService.resolveModerationEvent(id, status);
    fetchEvents();
  };

  const filteredEvents = events.filter((e) => (filter === "all" ? true : e.status === filter));

  return (
    <div className="min-h-screen bg-[#F5F5F0] p-6 text-[#1A1A1A]">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#7B9E00]/10 text-[#7B9E00]">
              <Shield className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Очередь модерации контента (NVIDIA Safety Engine)</h1>
              <p className="text-xs text-[#878881]">
                Автоматическая проверка Nemotron 3.5 Content Safety + локальные правила защиты от мата и мошенничества
              </p>
            </div>
          </div>
          <button
            onClick={fetchEvents}
            className="flex items-center space-x-2 rounded-xl border border-[#E5E5E0] bg-[#F9F9F6] px-4 py-2 text-xs font-semibold hover:bg-white"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            <span>Обновить</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 border-b border-[#E5E5E0] pb-2">
          {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                filter === tab
                  ? "bg-[#7B9E00] text-white shadow-sm"
                  : "bg-white text-[#52524E] hover:bg-[#E5E5E0]/40"
              }`}
            >
              {tab === "pending"
                ? "Требуют проверки"
                : tab === "approved"
                ? "Одобренные"
                : tab === "rejected"
                ? "Отклонённые"
                : "Все записи"}
            </button>
          ))}
        </div>

        {/* Content Table */}
        <div className="rounded-2xl border border-white/60 bg-white shadow-sm overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#878881]">
              Записи модерации с выбранным фильтром отсутствуют.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E5E0] bg-[#F9F9F6] font-semibold text-[#52524E]">
                <tr>
                  <th className="p-4">Тип / ID</th>
                  <th className="p-4">Модель</th>
                  <th className="p-4">Результат</th>
                  <th className="p-4">Важность</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#F9F9F6]/50">
                    <td className="p-4 font-mono">
                      <span className="font-semibold text-[#1A1A1A]">{ev.entityType.toUpperCase()}</span>
                      <br />
                      <span className="text-[10px] text-[#878881]">{ev.entityId.slice(0, 8)}...</span>
                    </td>
                    <td className="p-4">{ev.model}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 font-medium ${
                          ev.result === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : ev.result === "blocked"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ev.result}
                      </span>
                    </td>
                    <td className="p-4 font-semibold uppercase">{ev.severity}</td>
                    <td className="p-4">{ev.status}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleResolve(ev.id, "approved")}
                        className="rounded-lg bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-600"
                      >
                        <CheckCircle className="inline size-3.5 mr-1" />
                        Одобрить
                      </button>
                      <button
                        onClick={() => handleResolve(ev.id, "rejected")}
                        className="rounded-lg bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      >
                        <XCircle className="inline size-3.5 mr-1" />
                        Отклонить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
