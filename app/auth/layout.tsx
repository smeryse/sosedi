import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function AuthLayout({ children }: { children: ReactNode }) { return <main className="min-h-screen bg-surface-muted/60"><header className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5"><BrandLogo /><Link href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground">Вернуться на главную</Link></header><div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-6xl items-center justify-center px-5 pb-12">{children}</div></main>; }
