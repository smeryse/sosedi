import type { Metadata } from "next";
import {
  OnboardingFlow,
  type OnboardingRole,
} from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Настройка профиля",
  description:
    "Расскажите о себе или добавьте жильё, чтобы начать пользоваться Соседями.",
};

interface OnboardingPageProps {
  searchParams: Promise<{
    role?: string | string[];
  }>;
}

function parseRole(value: string | string[] | undefined): OnboardingRole {
  const role = Array.isArray(value) ? value[0] : value;
  return role === "landlord" ? "landlord" : "tenant";
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = await searchParams;
  return <OnboardingFlow role={parseRole(params.role)} />;
}
