"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn, isDemoMode } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false); const router = useRouter();
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setLoading(true); setError(null); if (isDemoMode()) { router.push("/app"); return; } try { const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) }); if (!response.ok) throw new Error("invalid"); router.push("/app"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? "Не удалось войти. Проверьте email и пароль." : "Не удалось войти."); } finally { setLoading(false); } };
  return <div className={cn("flex flex-col gap-6", className)} {...props}><Card><CardHeader><CardTitle className="text-2xl">С возвращением</CardTitle><CardDescription>Войдите, чтобы продолжить поиск соседей и жилья.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} /></div><div className="grid gap-2"><div className="flex items-center justify-between"><Label htmlFor="password">Пароль</Label><Link href="/auth/forgot-password" className="text-xs font-bold text-muted-foreground hover:text-foreground">Забыли пароль?</Link></div><Input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>{error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}<Button type="submit" className="w-full" disabled={loading}>{loading ? "Входим…" : "Войти"}</Button><p className="text-center text-sm text-muted-foreground">Нет аккаунта? <Link href="/auth/sign-up" className="font-bold text-foreground underline-offset-4 hover:underline">Создать аккаунт</Link></p></form></CardContent></Card></div>;
}
