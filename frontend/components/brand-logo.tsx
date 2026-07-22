import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center", className)}>
      <Image
        src="/brand/sosedi-logo-v2.svg"
        alt="Соседи"
        width={160}
        height={38}
        priority
      />
    </Link>
  );
}
