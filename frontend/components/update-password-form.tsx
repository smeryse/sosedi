"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn, hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) { const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const router = useRouter(); const submit = async (event: React.FormEvent) => { event.preventDefault(); if (password.length < 8) { setError("Пароль должен быть не короче 8 символов"); return; } setLoading(true); if (!hasEnvVars) { router.push("/auth/login"); return; } try { const { error: authError } = await createClient().auth.updateUser({ password }); if (authError) throw authError; router.push("/app"); } catch { setError("Не удалось обновить пароль."); } finally { setLoading(false); } }; return <div className={cn("flex flex-col gap-6", className)} {...props}><Card><CardHeader><CardTitle className="text-2xl">Новый пароль</CardTitle><CardDescription>Придумайте новый пароль для аккаунта.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><div className="grid gap-2"><Label htmlFor="password">Новый пароль</Label><Input id="password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></div>{error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}<Button type="submit" className="w-full" disabled={loading}>{loading ? "Сохраняем…" : "Сохранить пароль"}</Button></form></CardContent></Card></div>; }
