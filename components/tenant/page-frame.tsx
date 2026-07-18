import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    <div className="space-y-6">
      {backHref ? (
        <Link href={backHref} className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[hsl(var(--accent-hover))]">{eyebrow}</p> : null}
          <h1 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.05em]">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
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
