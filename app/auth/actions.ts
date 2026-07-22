"use server";

import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, getCurrentUser, revokeCurrentSession } from "@/lib/auth/session";
import { query, withTransaction } from "@/lib/db";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function login(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Заполните все поля" };
  const result = await query<{ id: string; password_hash: string; disabled_at: Date | null }>(
    `select id, password_hash, disabled_at from users where email = $1 limit 1`,
    [email],
  );
  const user = result.rows[0];
  if (!user || user.disabled_at || !(await verifyPassword(password, user.password_hash))) {
    return { error: "Не удалось войти. Проверьте email и пароль." };
  }
  await createSession(user.id, { rememberMe: formData.get("rememberMe") === "on" });
  redirect("/app");
}

export async function signup(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = text(formData, "name") || email.split("@")[0];
  const role = formData.get("role") === "landlord" ? "landlord" : "tenant";
  if (!email || password.length < 8 || displayName.length < 2) return { error: "Проверьте данные регистрации" };
  let userId: string;
  try {
    userId = await withTransaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `insert into users (email, password_hash) values ($1, $2) on conflict (email) do nothing returning id`,
        [email, await hashPassword(password)],
      );
      if (!result.rows[0]) throw new Error("ACCOUNT_EXISTS");
      const id = result.rows[0].id;
      await client.query(`insert into profiles (id, display_name) values ($1, $2)`, [id, displayName]);
      await client.query(`insert into user_roles (user_id, role) values ($1, $2::user_role)`, [id, role]);
      await client.query(`insert into user_settings (user_id) values ($1)`, [id]);
      await client.query(`insert into notification_settings (user_id) values ($1)`, [id]);
      return id;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ACCOUNT_EXISTS") return { error: "Аккаунт с таким email уже существует" };
    return { error: "Не удалось создать аккаунт. Попробуйте ещё раз." };
  }
  await createSession(userId);
  redirect(`/onboarding?role=${role}`);
}

export async function logout() {
  await revokeCurrentSession();
  redirect("/auth/login");
}

export async function currentUser() {
  return getCurrentUser();
}
