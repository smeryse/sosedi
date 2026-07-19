import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import {
  buildRoommateEmbeddingDocument,
  buildPropertyEmbeddingDocument,
} from "../lib/services/canonical-document-service";
import { globalEmbeddingClient } from "../lib/infrastructure/nvidia/embedding-client";

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

const isDryRun = process.argv.includes("--dry-run");
const isProduction = process.env.NODE_ENV === "production";
const confirmProd = process.argv.includes("--confirm-production");

if (isProduction && !confirmProd) {
  console.error("❌ ERROR: Production backfill requires --confirm-production flag.");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function backfillNvidiaEmbeddings() {
  console.log("🚀 Starting NVIDIA Nemotron-3 Embeddings Backfill...");
  if (isDryRun) {
    console.log("ℹ️ Dry-run mode ENABLED. No database updates will be performed.");
  }

  if (!supabaseUrl || !serviceRoleKey || !process.env.NVIDIA_API_KEY) {
    console.log("⚠️ Skipping live backfill: Supabase Service Role Key or NVIDIA_API_KEY is not configured.");
    return { success: false, reason: "Credentials not configured." };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // 1. Backfill Profiles
  try {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, city, age, job_title, budget_min, budget_max, move_in_date, lease_months, profile_preferences(*)");

    if (profiles && profiles.length > 0) {
      console.log(`📦 Processing ${profiles.length} profiles...`);
      for (const p of profiles) {
        const { text, sourceHash } = buildRoommateEmbeddingDocument(
          {
            displayName: p.display_name,
            city: p.city,
            age: p.age,
            jobTitle: p.job_title,
            budgetMin: p.budget_min,
            budgetMax: p.budget_max,
            moveInDate: p.move_in_date,
            leaseMonths: p.lease_months,
          },
          p.profile_preferences ? (Array.isArray(p.profile_preferences) ? p.profile_preferences[0] : p.profile_preferences) : null,
          []
        );

        // Check if existing embedding with same source_hash exists
        const { data: existing } = await supabase
          .from("ai_embeddings")
          .select("source_hash")
          .eq("entity_type", "profile")
          .eq("entity_id", p.id)
          .eq("model", "nvidia/nemotron-3-embed-1b")
          .maybeSingle();

        if (existing && existing.source_hash === sourceHash) {
          totalSkipped += 1;
          continue;
        }

        if (isDryRun) {
          totalProcessed += 1;
          continue;
        }

        try {
          const vector = await globalEmbeddingClient.getSingleEmbedding(text, { inputType: "passage" });
          await supabase.from("ai_embeddings").upsert(
            {
              entity_type: "profile",
              entity_id: p.id,
              owner_user_id: p.id,
              model: "nvidia/nemotron-3-embed-1b",
              model_version: "v1",
              embedding_version: 1,
              source_hash: sourceHash,
              vector: vector as any,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "entity_type,entity_id,model,embedding_version" }
          );
          totalProcessed += 1;
        } catch (err) {
          console.error(`❌ Failed to build embedding for profile ${p.id}:`, err);
          totalFailed += 1;
        }
      }
    }
  } catch (err) {
    console.error("Error querying profiles for backfill:", err);
  }

  // 2. Backfill Properties
  try {
    const { data: properties } = await supabase
      .from("properties")
      .select("id, title, description, district, city, monthly_rent, deposit_amount, rooms, area, floor, total_floors");

    if (properties && properties.length > 0) {
      console.log(`📦 Processing ${properties.length} properties...`);
      for (const prop of properties) {
        const { text, sourceHash } = buildPropertyEmbeddingDocument({
          title: prop.title,
          description: prop.description,
          district: prop.district,
          city: prop.city,
          monthlyRent: prop.monthly_rent,
          depositAmount: prop.deposit_amount,
          rooms: prop.rooms,
          area: prop.area,
          floor: prop.floor,
          totalFloors: prop.total_floors,
        });

        const { data: existing } = await supabase
          .from("ai_embeddings")
          .select("source_hash")
          .eq("entity_type", "property")
          .eq("entity_id", prop.id)
          .eq("model", "nvidia/nemotron-3-embed-1b")
          .maybeSingle();

        if (existing && existing.source_hash === sourceHash) {
          totalSkipped += 1;
          continue;
        }

        if (isDryRun) {
          totalProcessed += 1;
          continue;
        }

        try {
          const vector = await globalEmbeddingClient.getSingleEmbedding(text, { inputType: "passage" });
          await supabase.from("ai_embeddings").upsert(
            {
              entity_type: "property",
              entity_id: prop.id,
              model: "nvidia/nemotron-3-embed-1b",
              model_version: "v1",
              embedding_version: 1,
              source_hash: sourceHash,
              vector: vector as any,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "entity_type,entity_id,model,embedding_version" }
          );
          totalProcessed += 1;
        } catch (err) {
          console.error(`❌ Failed to build embedding for property ${prop.id}:`, err);
          totalFailed += 1;
        }
      }
    }
  } catch (err) {
    console.error("Error querying properties for backfill:", err);
  }

  console.log(`🎉 Backfill Complete! Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Failed: ${totalFailed}`);
  return { success: true, totalProcessed, totalSkipped, totalFailed };
}

if (require.main === module) {
  backfillNvidiaEmbeddings().catch((err) => {
    console.error("Unhandled error in backfill script:", err);
    process.exit(1);
  });
}
