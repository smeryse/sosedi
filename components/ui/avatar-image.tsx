"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AvatarImage({
  src,
  name,
  size = 40,
  className,
  priority = false,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(!src);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (failed || !src) {
    return (
      <span
        aria-label={name}
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-[#EEF1E8] font-extrabold text-[#55574F]",
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.28) }}
      >
        {initials || "С"}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("shrink-0 rounded-full object-cover aspect-square", className)}
      style={{ width: size, height: size }}
    />
  );
}
