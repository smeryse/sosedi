import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const emailDomain = process.env.DEMO_EMAIL_DOMAIN ?? "demo.sosedi.local";

if (!url || !serviceRoleKey) {
  throw new Error(
    "Нужны SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY только на сервере для создания demo Auth-пользователей.",
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const names = [
  "maria",
  "artem",
  "ekaterina",
  "ilya",
  "alina",
  "dmitry",
  "yulia",
  "maxim",
  "lera",
  "nastya",
  "ivan",
  "olga",
  "nikita",
  "sofia",
  "roman",
  "polina",
  "mikhail",
  "daria",
  "kirill",
  "victoria",
];

const password = process.env.DEMO_USER_PASSWORD;
if (!password || password.length < 12) {
  throw new Error("DEMO_USER_PASSWORD должен быть задан и содержать минимум 12 символов.");
}

for (const name of names) {
  const { error } = await supabase.auth.admin.createUser({
    email: `${name}@${emailDomain}`,
    password,
    email_confirm: true,
    user_metadata: { demo: true, display_name: name },
  });
  if (error && !error.message.toLowerCase().includes("already registered")) {
    throw error;
  }
}

console.log(`Созданы или уже существуют ${names.length} demo-пользователей.`);
