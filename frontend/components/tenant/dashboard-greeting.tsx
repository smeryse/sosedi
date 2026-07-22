"use client";

import { useEffect, useState } from "react";

function getGreeting(hour: number): string {
  if (hour < 6) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

export function DashboardGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Здравствуйте");

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  return (
    <h1 className="text-[30px] font-black tracking-tight text-foreground sm:text-[36px]">
      {greeting}, {name}! 👋
    </h1>
  );
}
