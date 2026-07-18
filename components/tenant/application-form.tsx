"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, FileCheck2 } from "lucide-react";
import { DemoRepository } from "@/lib/repositories/demo-repository";
import { demoProperties } from "@/data/demo";
import { applicationInputSchema } from "@/lib/validation";

export function ApplicationForm() {
  const router = useRouter(); const params = useSearchParams(); const propertyId = params.get("property") ?? "center-loft"; const property = demoProperties.find((item) => item.id === propertyId) ?? demoProperties[0];
  const [message, setMessage] = useState("Мы — группа из трёх человек, готовы приехать на просмотр и предоставить документы."); const [saving, setSaving] = useState(false); const [sent, setSent] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); const parsed = applicationInputSchema.safeParse({ propertyId: property.id, groupId: "demo-group", message }); if (!parsed.success) return; setSaving(true); await new DemoRepository().submitApplication({ propertyId: property.id, groupId: "demo-group" }); setSaving(false); setSent(true); };
  if (sent) return <div className="surface-card max-w-xl p-6"><div className="grid size-12 place-items-center rounded-full bg-[hsl(var(--accent))]"><FileCheck2 className="size-6" /></div><h2 className="mt-5 text-xl font-extrabold">Заявка отправлена</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Собственник увидит заявку на «{property.title}». Следить за ответом можно в разделе заявок.</p><button type="button" onClick={() => router.push("/app/applications")} className="lime-button mt-5 inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold">К моим заявкам <ArrowRight className="size-4" /></button></div>;
  return <form action="/app/applications" method="get" onSubmit={submit} className="max-w-2xl space-y-5"><input type="hidden" name="submitted" value="1" /><div className="surface-card p-5"><p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">Объект</p><h2 className="mt-2 text-lg font-extrabold">{property.title}</h2><p className="mt-1 text-xs text-muted-foreground">{property.district} · 45 000 ₽ / месяц · группа «Квартира в центре»</p></div><label className="surface-card block p-5 text-xs font-extrabold">Сообщение собственнику<textarea name="message" value={message} onChange={(event) => setMessage(event.target.value)} rows={6} required className="mt-2 w-full resize-none rounded-[14px] border bg-background p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]" /></label><div className="surface-card space-y-3 p-5 text-xs text-muted-foreground"><p className="font-extrabold text-foreground">Что отправится</p><p>Имена участников группы, бюджет, дата въезда и ваше сообщение. Контакты откроются только после ответа собственника.</p></div><button type="submit" disabled={saving} className="lime-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-extrabold">{saving ? "Отправляем…" : "Отправить заявку"}<ArrowRight className="size-4" /></button></form>;
}
