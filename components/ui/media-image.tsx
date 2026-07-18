"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function MediaImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <span className={cn("absolute inset-0 grid place-items-center bg-[#F4F4F0] text-[#878881]", className)}>
        <ImageIcon className="size-8 stroke-[1.4]" aria-hidden="true" />
        <span className="sr-only">Изображение недоступно: {alt}</span>
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      unoptimized
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
