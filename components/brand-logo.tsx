import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center", className)}>
      <Image
        src="/brand/sosedi-logo.svg"
        alt="Соседи"
        width={146}
        height={34}
        priority
      />
    </Link>
  );
}
