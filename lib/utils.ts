import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// The current auth client uses the local Postgres API and does not require
// browser-side Supabase credentials. Demo mode must be enabled explicitly.
export const hasEnvVars = process.env.NEXT_PUBLIC_DEMO_MODE !== "true";

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
