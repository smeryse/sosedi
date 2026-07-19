import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnvFile(filePath: string) {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // ignore
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  supabaseUrl && !supabaseUrl.includes("your-project-url") ? supabaseUrl : "https://dummy-project.supabase.co",
  serviceRoleKey || "dummy-service-role-key",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function resetDemoAccounts() {
  console.log("🧹 Starting reset of demo accounts and demo entities...");

  if (!serviceRoleKey || !supabaseUrl || supabaseUrl.includes("your-project-url")) {
    console.log("ℹ️ Skipping live reset because service role key or URL is missing.");
    return { success: false, reason: "No valid Supabase credentials provided." };
  }

  // 1. Find demo profiles
  const { data: demoProfiles } = await supabase
    .from("profiles")
    .select("id, seed_key")
    .or("is_demo.eq.true,seed_key.not.is.null");

  const demoUserIds = (demoProfiles ?? []).map((p) => p.id);
  console.log(`Found ${demoUserIds.length} demo profiles to clean up.`);

  // 2. Delete demo messages & reactions
  await supabase.from("message_reactions").delete().or("profile_id.in.(" + (demoUserIds.length ? demoUserIds.join(",") : "00000000-0000-0000-0000-000000000000") + ")");
  await supabase.from("messages").delete().or("is_demo.eq.true,seed_key.not.is.null");

  // 3. Delete demo conversation members & conversations
  if (demoUserIds.length > 0) {
    await supabase.from("conversation_members").delete().in("profile_id", demoUserIds);
  }
  await supabase.from("conversations").delete().or("is_demo.eq.true,seed_key.not.is.null");

  // 4. Delete demo applications & events
  await supabase.from("application_events").delete().or("actor_id.in.(" + (demoUserIds.length ? demoUserIds.join(",") : "00000000-0000-0000-0000-000000000000") + ")");
  await supabase.from("application_members").delete().or("profile_id.in.(" + (demoUserIds.length ? demoUserIds.join(",") : "00000000-0000-0000-0000-000000000000") + ")");
  await supabase.from("applications").delete().or("is_demo.eq.true,seed_key.not.is.null");

  // 5. Delete demo group members & groups
  if (demoUserIds.length > 0) {
    await supabase.from("group_members").delete().in("profile_id", demoUserIds);
  }
  await supabase.from("groups").delete().or("is_demo.eq.true,seed_key.not.is.null");

  // 6. Delete demo properties & images
  await supabase.from("properties").delete().or("is_demo.eq.true,seed_key.not.is.null");

  // 7. Delete demo notifications & favorites
  await supabase.from("notifications").delete().or("is_demo.eq.true,seed_key.not.is.null");
  if (demoUserIds.length > 0) {
    await supabase.from("favorites").delete().in("user_id", demoUserIds);
    await supabase.from("lifestyle_answers").delete().in("profile_id", demoUserIds);
    await supabase.from("profile_preferences").delete().in("profile_id", demoUserIds);
    await supabase.from("user_roles").delete().in("user_id", demoUserIds);
    await supabase.from("profiles").delete().in("id", demoUserIds);
  }

  // 8. Delete demo auth users
  for (const uid of demoUserIds) {
    try {
      await supabase.auth.admin.deleteUser(uid);
      console.log(`- Deleted demo auth user: ${uid.slice(0, 8)}...`);
    } catch (e: any) {
      console.warn(`Could not delete user ${uid}:`, e?.message);
    }
  }

  console.log("✨ Reset completed successfully! Only demo records were removed.");
  return { success: true, deletedCount: demoUserIds.length };
}

if (require.main === module) {
  resetDemoAccounts()
    .then((res) => {
      console.log("Reset result:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Reset failed:", err);
      process.exit(1);
    });
}
