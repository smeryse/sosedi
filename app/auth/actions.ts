"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return { error: "Заполните все поля" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Не удалось войти. Проверьте email и пароль." };
  }

  revalidatePath("/", "layout");
  redirect("/app");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!email || !password) {
    return { error: "Заполните все поля" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name || email.split("@")[0] },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return { error: "Не удалось создать аккаунт. Попробуйте ещё раз." };
  }

  revalidatePath("/", "layout");
  redirect("/auth/sign-up-success");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
