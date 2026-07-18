import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function SignUpSuccessPage() { return <div className="w-full max-w-sm rounded-[22px] border bg-surface p-6 text-center shadow-card"><div className="mx-auto grid size-12 place-items-center rounded-full bg-[hsl(var(--accent))]"><CheckCircle2 className="size-6" /></div><h1 className="mt-5 text-2xl font-extrabold">Почти готово</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Проверьте почту и подтвердите аккаунт. После этого можно будет заполнить анкету.</p><Link href="/auth/login" className="lime-button mt-6 inline-flex rounded-full px-5 py-3 text-xs font-extrabold">Вернуться ко входу</Link></div>; }
