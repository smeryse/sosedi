"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn, hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [repeat, setRepeat] = useState(""); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false); const router = useRouter();
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(null); if (password !== repeat) { setError("Пароли не совпадают"); return; } if (password.length < 8) { setError("Пароль должен быть не короче 8 символов"); return; } setLoading(true); if (!hasEnvVars) { router.push("/app"); return; } try { const { error: authError } = await createClient().auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/app` } }); if (authError) throw authError; router.push("/auth/sign-up-success"); } catch (cause) { setError(cause instanceof Error ? "Не удалось создать аккаунт." : "Не удалось создать аккаунт."); } finally { setLoading(false); } };
  return <div className={cn("flex flex-col gap-6", className)} {...props}><Card><CardHeader><CardTitle className="text-2xl">Создайте аккаунт</CardTitle><CardDescription>Заполните профиль, чтобы найти подходящих соседей.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="password">Пароль</Label><Input id="password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="repeat-password">Повторите пароль</Label><Input id="repeat-password" type="password" minLength={8} required value={repeat} onChange={(event) => setRepeat(event.target.value)} /></div>{error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}<Button type="submit" className="w-full" disabled={loading}>{loading ? "Создаём…" : "Создать аккаунт"}</Button><p className="text-center text-sm text-muted-foreground">Уже есть аккаунт? <Link href="/auth/login" className="font-bold text-foreground underline-offset-4 hover:underline">Войти</Link></p></form></CardContent></Card></div>;
}
