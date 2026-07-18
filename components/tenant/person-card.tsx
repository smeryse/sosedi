import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Sparkles } from "lucide-react";
import type { DemoRoommate } from "@/data/demo";
import { formatRubles } from "@/data/demo";

export function PersonCard({ person, favorite = false, onFavorite }: { person: DemoRoommate; favorite?: boolean; onFavorite?: (id: string) => void }) {
  return (
    <article className="group overflow-hidden rounded-[20px] border bg-surface shadow-card transition-transform hover:-translate-y-0.5">
      <div className="relative h-48 overflow-hidden">
        <Image src={person.image} alt={`${person.name}, ${person.age} лет`} fill sizes="(max-width: 768px) 100vw, 320px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent))] px-2.5 py-1 text-[10px] font-extrabold"><Sparkles className="size-3" /> {person.compatibility}%</span>
          {onFavorite ? <button type="button" aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"} onClick={() => onFavorite(person.id)} className="grid size-9 place-items-center rounded-full bg-surface/90 backdrop-blur hover:bg-surface"><Heart className={`size-4 ${favorite ? "fill-current text-rose-500" : ""}`} /></button> : null}
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="font-extrabold">{person.name}, {person.age}</h2><p className="mt-1 text-xs text-muted-foreground">{person.job}</p></div>
          <span className="text-right text-[11px] font-bold">{formatRubles(person.budget)}<span className="block font-normal text-muted-foreground">на человека</span></span>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" /> {person.district}</p>
        <div className="flex flex-wrap gap-1.5">{person.traits.map((trait) => <span key={trait} className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-bold">{trait}</span>)}</div>
        <Link href={`/app/roommates/${person.id}`} className="inline-flex w-full items-center justify-center rounded-full border py-2.5 text-xs font-extrabold hover:bg-surface-muted">Открыть профиль</Link>
      </div>
    </article>
  );
}
