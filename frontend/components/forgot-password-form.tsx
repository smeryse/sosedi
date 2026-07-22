"use client";

import Link from "next/link";
import { useState } from "react";
import { cn, hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState(""); const [error, setError] = useState(""); const [success, setSuccess] = useState(false); const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setLoading(true); setError(""); if (!hasEnvVars) { setSuccess(true); setLoading(false); return; } try { const { error: authError } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/update-password` }); if (authError) throw authError; setSuccess(true); } catch { setError("Не удалось отправить письмо. Проверьте email."); } finally { setLoading(false); } };
  return <div className={cn("flex flex-col gap-6", className)} {...props}>{success ? <Card><CardHeader><CardTitle className="text-2xl">Проверьте почту</CardTitle><CardDescription>Инструкция для сброса пароля отправлена</CardDescription></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">Если аккаунт зарегистрирован по email, вы получите письмо со ссылкой для восстановления.</p><Link href="/auth/login" className="mt-5 inline-flex text-sm font-bold">Вернуться ко входу</Link></CardContent></Card> : <Card><CardHeader><CardTitle className="text-2xl">Сбросить пароль</CardTitle><CardDescription>Введите email — мы отправим ссылку для восстановления.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>{error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}<Button type="submit" className="w-full" disabled={loading}>{loading ? "Отправляем…" : "Отправить ссылку"}</Button><p className="text-center text-sm text-muted-foreground">Уже есть аккаунт? <Link href="/auth/login" className="font-bold text-foreground">Войти</Link></p></form></CardContent></Card>}</div>;
}
