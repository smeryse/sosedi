import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/motion-primitives";

export function PageFrame({
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel = "Назад",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-7">
      {backHref ? (
        <Link href={backHref} className="group inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" /> {backLabel}
        </Link>
      ) : null}
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow ? <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7B9E00]">{eyebrow}</p> : null}
            <h1 className="text-[clamp(1.85rem,3vw,2.55rem)] font-black leading-[1.05] tracking-[-0.045em] text-[#111111]">{title}</h1>
            {description ? <p className="mt-2 max-w-2xl text-[13px] leading-5 text-muted-foreground sm:text-sm">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </Reveal>
      <Reveal delay={0.08}>{children}</Reveal>
    </div>
  );
}

export function EmptyState({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return (
    <div className="surface-card flex min-h-48 flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {href && action ? <Link href={href} className="lime-button mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-extrabold">{action}<ArrowRight className="size-4" /></Link> : null}
    </div>
  );
}
