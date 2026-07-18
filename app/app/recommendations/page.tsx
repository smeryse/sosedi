import { Sparkles } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { demoRoommates } from "@/data/demo";
import { PersonCard } from "@/components/tenant/person-card";

export default function RecommendationsPage() { return <PageFrame eyebrow="Для вас" title="Рекомендации" description="Подборка обновляется после каждого ответа в анкете и действия в каталоге."><div className="rounded-[20px] bg-foreground p-5 text-background sm:flex sm:items-center sm:justify-between"><div className="flex gap-3"><Sparkles className="mt-0.5 size-5 text-[hsl(var(--accent))]" /><div><p className="text-sm font-extrabold">Подборка стала точнее</p><p className="mt-1 text-xs leading-5 text-background/65">Мы нашли 4 человека с совместимостью от 90%.</p></div></div><span className="mt-4 text-3xl font-extrabold text-[hsl(var(--accent))] sm:mt-0">93%</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{demoRoommates.map((person) => <PersonCard key={person.id} person={person} />)}</div></PageFrame>; }
