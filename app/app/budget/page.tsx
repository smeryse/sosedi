"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Plus, Receipt, WalletCards, X } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { createClientRepository } from "@/lib/repositories";
import type { ExpenseSplit, ExpenseShare } from "@/lib/repositories/types";
import { formatRubles } from "@/data/demo";

export default function BudgetPage() {
  const [expenses, setExpenses] = useState<ExpenseSplit[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const repo = createClientRepository();
        const [list, state] = await Promise.all([
          repo.listExpenses(),
          repo.getState()
        ]);
        setExpenses(list);
        if (state.group?.members) {
          setMembers(state.group.members);
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось загрузить данные.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTogglePaid = async (expenseId: string) => {
    setError("");
    try {
      setExpenses(await createClientRepository().toggleGlobalExpensePaid(expenseId, "anna"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось обновить оплату.");
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(amountVal) || amountVal <= 0) return;

    const repo = createClientRepository();
    
    const splitAmount = Math.round((amountVal / Math.max(members.length, 1)) * 100) / 100;
    const shares: ExpenseShare[] = members.map((m, index) => ({
      memberId: m.id,
      memberName: m.name,
      amount: splitAmount,
      isPaid: m.id === "anna" || index === 0, // Assume the current user (anna) or first member pays initially
    }));

    setError("");
    try {
      const updated = await repo.createExpense(newTitle, amountVal, shares);
      setExpenses(updated);
      setNewTitle("");
      setNewAmount("");
      setIsModalOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось создать расход.");
    }
  };

  // Calculations
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  
  const userShareTotal = expenses.reduce((sum, exp) => {
    const share = exp.shares.find((s) => s.memberId === "anna");
    return sum + (share ? share.amount : 0);
  }, 0);

  const userShareToPay = expenses.reduce((sum, exp) => {
    const share = exp.shares.find((s) => s.memberId === "anna");
    return sum + (share && !share.isPaid ? share.amount : 0);
  }, 0);

  return (
    <PageFrame
      title="Бюджет и расходы"
      description="Понимайте полную стоимость дома до переезда и делите общие расходы без неловкости."
      actions={
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="lime-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold cursor-pointer"
        >
          <Plus className="size-4" /> Добавить расход
        </button>
      }
    >
      {error ? <div role="alert" className="rounded-[16px] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[20px] bg-[hsl(var(--accent))] p-5 text-foreground animate-fade-in">
          <WalletCards className="size-5" />
          <p className="mt-5 text-xs font-bold">Ваша доля в месяц</p>
          <p className="mt-1 text-3xl font-extrabold">{formatRubles(Math.round(userShareTotal))}</p>
          <p className="mt-2 text-[10px] opacity-70">аренда + коммунальные</p>
        </div>

        <div className="surface-card p-5">
          <p className="text-xs font-bold text-muted-foreground">Общие расходы группы</p>
          <p className="mt-2 text-3xl font-extrabold">{formatRubles(Math.round(totalAmount))}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700 font-bold">
            <ArrowUpRight className="size-3" /> на 4% меньше прошлого месяца
          </p>
        </div>

        <div className="surface-card p-5">
          <p className="text-xs font-bold text-muted-foreground">К оплате вам</p>
          <p className="mt-2 text-3xl font-extrabold text-red-600">{formatRubles(Math.round(userShareToPay))}</p>
          <p className="mt-2 text-xs text-muted-foreground font-bold">желательно до 20 числа</p>
        </div>
      </div>

      <section className="surface-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold">Последние операции</h2>
          <span className="text-xs font-bold text-muted-foreground">Вся история</span>
        </div>

        {loading ? (
          <div className="mt-4 text-center text-sm font-bold text-muted-foreground py-8 animate-pulse">
            Загрузка операций...
          </div>
        ) : expenses.length === 0 ? (
          <div className="mt-4 text-center text-sm font-bold text-muted-foreground py-8 border border-dashed rounded-[15px]">
            Расходов пока нет. Добавьте первый!
          </div>
        ) : (
          <div className="mt-4 divide-y">
            {expenses.map((expense) => {
              const annaShare = expense.shares.find((s) => s.memberId === "anna");
              const isPaid = annaShare ? annaShare.isPaid : false;
              const shareAmount = annaShare ? annaShare.amount : 0;
              return (
                <div key={expense.id} className="flex items-center gap-3 py-3">
                  <button
                    type="button"
                    onClick={() => handleTogglePaid(expense.id)}
                    aria-label={`Отметить долю в ${expense.title} как ${isPaid ? "неоплаченную" : "оплаченную"}`}
                    className={`grid size-9 place-items-center rounded-full transition-colors cursor-pointer ${
                      isPaid ? "bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent-hover))]" : "bg-red-50 text-red-600"
                    }`}
                  >
                    <Receipt className="size-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{expense.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Всего: {formatRubles(expense.totalAmount)} · Ваша доля: {formatRubles(Math.round(shareAmount))} (
                      {isPaid ? "Оплачено" : "Не оплачено"})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePaid(expense.id)}
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                      isPaid ? "bg-surface-muted text-muted-foreground" : "bg-[hsl(var(--accent))] hover:opacity-90 text-foreground"
                    }`}
                  >
                    {isPaid ? "Оплачено" : "Оплатить"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="rounded-[18px] border border-dashed p-5 text-xs text-muted-foreground">
        Совет: добавляйте расходы сразу после покупки — так задолженность группы всегда будет актуальной.
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] border border-[#E5E5E0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-[#111111]">Добавить расход</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 hover:bg-[#F4F4F0] cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-[#111111] uppercase tracking-wider mb-1.5">
                  Название покупки / расхода
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Покупка средств для уборки"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-11 w-full rounded-[14px] border border-[#E2E2DC] bg-[#F4F4F0] px-4 text-sm outline-none focus:border-[#B3DB00] focus:bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#111111] uppercase tracking-wider mb-1.5">
                  Сумма (₽)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="1260"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="h-11 w-full rounded-[14px] border border-[#E2E2DC] bg-[#F4F4F0] px-4 text-sm outline-none focus:border-[#B3DB00] focus:bg-white text-black"
                />
              </div>

              <div className="rounded-[14px] bg-[#F4F4F0] p-4 text-xs text-muted-foreground space-y-1.5">
                <p className="font-bold text-[#111111]">Правило деления:</p>
                <p>Будет автоматически разделено поровну между {members.length} участниками группы ({members.map(m => m.name).join(", ")}).</p>
                <p>Ваша доля составит: <span className="font-extrabold text-[#111111]">{newAmount ? formatRubles(Math.round(parseFloat(newAmount) / Math.max(members.length, 1))) : "0 ₽"}</span></p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="h-11 w-full rounded-full bg-[#B3DB00] text-sm font-extrabold text-[#111111] transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  Разделить расход
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageFrame>
  );
}
