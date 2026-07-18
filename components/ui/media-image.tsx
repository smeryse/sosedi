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
      <span className={cn("absolute inset-0 grid place-items-center bg-[#F0F1EC] text-[#9A9B94]", className)}>
        <ImageIcon className="size-7 stroke-[1.4]" aria-hidden="true" />
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
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
