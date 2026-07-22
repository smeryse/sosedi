"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, UsersRound, WalletCards } from "lucide-react";
import { createClientRepository } from "@/lib/repositories";
import { groupInputSchema } from "@/lib/validation";

export function GroupCreator() {
  const router = useRouter();
  const [name, setName] = useState("Квартира в центре");
  const [budget, setBudget] = useState("90000");
  const [moveInDate, setMoveInDate] = useState("2026-08-15");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async () => { setError(""); const parsed = groupInputSchema.safeParse({ name, targetBudget: Number(budget), moveInDate }); if (!parsed.success) { setError("Проверьте название, бюджет и дату въезда."); return; } setSaving(true); try { await createClientRepository().createGroup(parsed.data); router.push("/app/group"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось создать группу"); } finally { setSaving(false); } };
  return <form action="/app/group" method="get" onSubmit={(event) => { event.preventDefault(); void submit(); }} className="max-w-2xl space-y-5"><div className="surface-card p-5"><label className="block text-xs font-extrabold">Название группы<input name="name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 h-12 w-full rounded-[14px] border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]" /></label><p className="mt-2 text-xs text-muted-foreground">Например, «Тихий дом на троих».</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="surface-card block p-5 text-xs font-extrabold"><span className="flex items-center gap-2"><WalletCards className="size-4" /> Бюджет группы</span><input name="targetBudget" type="number" min="1" value={budget} onChange={(event) => setBudget(event.target.value)} required className="mt-3 h-12 w-full rounded-[14px] border bg-background px-4 text-sm outline-none" /><span className="mt-2 block font-normal text-muted-foreground">₽ в месяц на всю квартиру</span></label><label className="surface-card block p-5 text-xs font-extrabold"><span className="flex items-center gap-2"><CalendarDays className="size-4" /> Дата въезда</span><input name="moveInDate" type="date" value={moveInDate} onChange={(event) => setMoveInDate(event.target.value)} required className="mt-3 h-12 w-full rounded-[14px] border bg-background px-4 text-sm outline-none" /></label></div><div className="surface-card flex items-start gap-3 p-5"><UsersRound className="mt-0.5 size-5 text-[hsl(var(--accent-hover))]" /><p className="text-xs leading-5 text-muted-foreground">После создания пригласите до трёх человек. Совместимость пересчитается автоматически, когда участники заполнят анкеты.</p></div>{error ? <p className="text-sm text-red-600">{error}</p> : null}<button type="submit" disabled={saving} className="lime-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-extrabold">{saving ? "Создаём…" : "Создать группу"}<ArrowRight className="size-4" /></button></form>;
}
