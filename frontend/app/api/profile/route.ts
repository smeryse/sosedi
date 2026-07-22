import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth/session";
import { query, type QueryResultRow } from "@/lib/db";

type ProfileRow = QueryResultRow & {
  id: string;
  display_name: string;
  avatar_path: string | null;
  age: number | null;
  job_title: string | null;
  bio: string | null;
  city: string;
  budget_min: number | null;
  budget_max: number | null;
  move_in_date: string | null;
  lease_months: number | null;
  is_public: boolean;
  districts: string[];
  smoking: "no" | "sometimes" | "yes" | "indifferent";
  pets: "no" | "cat" | "dog" | "other" | "indifferent";
  sleep_schedule: "early" | "late" | "flexible";
  noise_tolerance: number | null;
  guests_frequency: "never" | "rarely" | "sometimes" | "often" | null;
  remote_work: "never" | "sometimes" | "often" | null;
  cleanliness: number | null;
  sociability: number | null;
  private_space: number | null;
};

export async function GET() {
  try {
    const user = await requireUser();
    const result = await query<ProfileRow>(
      `SELECT
         p.id, p.display_name, p.avatar_path, p.age, p.job_title, p.bio,
         p.city, p.budget_min, p.budget_max, p.move_in_date, p.lease_months,
         p.is_public,
         COALESCE(pp.districts, ARRAY[]::TEXT[]) AS districts,
         COALESCE(pp.smoking, 'no') AS smoking,
         COALESCE(pp.pets, 'indifferent') AS pets,
         COALESCE(pp.sleep_schedule, 'flexible') AS sleep_schedule,
         pp.noise_tolerance, pp.guests_frequency, pp.remote_work,
         pp.cleanliness, pp.sociability, pp.private_space
       FROM profiles p
       LEFT JOIN profile_preferences pp ON pp.profile_id = p.id
       WHERE p.id = $1`,
      [user.id],
    );
    const profile = result.rows[0];
    if (!profile) {
      return NextResponse.json({ error: { message: "Профиль не найден" } }, { status: 404 });
    }
    return NextResponse.json({ profile }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { message: "Требуется авторизация" } }, { status: error.status });
    }
    throw error;
  }
}
