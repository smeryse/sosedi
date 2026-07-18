"use client";

import { useEffect, useState } from "react";
import { CalendarCheck2, Check, Clock3, Plus, Sparkles, X } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { getRepository } from "@/lib/repositories";
import type { DemoChore } from "@/lib/repositories/types";

export default function ChoresPage() {
  const [chores, setChores] = useState<DemoChore[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("anna");
  const [newDueDate, setNewDueDate] = useState("до воскресенья");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChores() {
      const repo = getRepository();
      const list = await repo.listChores();
      setChores(list);
      setLoading(false);
    }
    loadChores();
  }, []);

  const handleToggleChore = async (id: string) => {
    const repo = getRepository();
    const updated = await repo.toggleChoreDone(id);
    setChores(updated);
  };

  const handleAddChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const repo = getRepository();
    const updated = await repo.createChore(newTitle, newAssignee, newDueDate);
    setChores(updated);
    setNewTitle("");
    setIsModalOpen(false);
  };

  const doneCount = chores.filter((c) => c.isDone).length;
  const totalCount = chores.length;
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const remainingCount = totalCount - doneCount;

  return (
    <PageFrame
      eyebrow="Дом"
      title="Уборка и задачи"
      description="Распределяйте заботу о доме по очереди, а не по настроению."
      actions={
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="lime-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold cursor-pointer"
        >
          <Plus className="size-4" /> Добавить задачу
        </button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold">Эта неделя</h2>
            <span className="text-xs text-muted-foreground">Текущие дежурства</span>
          </div>

          {loading ? (
            <div className="mt-5 text-center text-sm font-bold text-muted-foreground py-8 animate-pulse">
              Загрузка списка задач...
            </div>
          ) : chores.length === 0 ? (
            <div className="mt-5 text-center text-sm font-bold text-muted-foreground py-8 border border-dashed rounded-[15px]">
              Задач пока нет. Добавьте первую!
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {chores.map((chore) => {
                const done = chore.isDone;
                return (
                  <div key={chore.id} className="flex items-center gap-3 rounded-[15px] border bg-surface p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleChore(chore.id)}
                      aria-label={`Отметить задачу ${chore.title} как ${done ? "невыполненную" : "выполненную"}`}
                      className={`grid size-7 place-items-center rounded-full border transition-colors cursor-pointer ${
                        done
                          ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-foreground"
                          : "border-[#E5E5E0] bg-transparent hover:border-[#111111]"
                      }`}
                    >
                      {done ? <Check className="size-4" /> : null}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold ${done ? "line-through opacity-50" : ""}`}>
                        {chore.title}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {chore.assigneeName} · {chore.dueDate}
                      </p>
                    </div>
                    <Clock3 className="size-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <CalendarCheck2 className="size-5 text-[hsl(var(--accent-hover))]" />
            <p className="mt-4 text-sm font-extrabold">Ритм группы</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Каждый участник берёт задачи на неделю. AI напомнит, если что-то задержалось.
            </p>
          </div>

          <div className="rounded-[20px] bg-foreground p-5 text-background">
            <Sparkles className="size-5 text-[hsl(var(--accent))]" />
            <p className="mt-4 text-sm font-extrabold">Готово на {percent}%</p>
            <p className="mt-2 text-xs leading-5 text-background/65">
              {doneCount} {doneCount === 1 ? "задача закрыта" : doneCount > 1 && doneCount < 5 ? "задачи закрыты" : "задач закрыто"}. Осталось {remainingCount}.
            </p>
          </div>
        </aside>
      </div>

      {/* Add Chore Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-[24px] border border-[#E5E5E0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-[#111111]">Новая задача</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 hover:bg-[#F4F4F0] cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddChore} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-[#111111] uppercase tracking-wider mb-1.5">
                  Что нужно сделать
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Помыть холодильник"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-11 w-full rounded-[14px] border border-[#E2E2DC] bg-[#F4F4F0] px-4 text-sm outline-none focus:border-[#B3DB00] focus:bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#111111] uppercase tracking-wider mb-1.5">
                  Кто отвечает
                </label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="h-11 w-full rounded-[14px] border border-[#E2E2DC] bg-[#F4F4F0] px-4 text-sm outline-none focus:border-[#B3DB00] cursor-pointer text-black"
                >
                  <option value="anna">Анна (Вы)</option>
                  <option value="maria">Мария</option>
                  <option value="artem">Артём</option>
                  <option value="ekaterina">Екатерина</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#111111] uppercase tracking-wider mb-1.5">
                  Срок выполнения
                </label>
                <input
                  type="text"
                  placeholder="до воскресенья"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="h-11 w-full rounded-[14px] border border-[#E2E2DC] bg-[#F4F4F0] px-4 text-sm outline-none focus:border-[#B3DB00] focus:bg-white text-black"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="h-11 w-full rounded-full bg-[#B3DB00] text-sm font-extrabold text-[#111111] transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  Создать задачу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageFrame>
  );
}
