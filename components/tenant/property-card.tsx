import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import type { DemoProperty } from "@/data/demo";
import { formatRubles } from "@/data/demo";

export function PropertyCard({ property, favorite = false, onFavorite }: { property: DemoProperty; favorite?: boolean; onFavorite?: (id: string) => void }) {
  return (
    <article className="group overflow-hidden rounded-[20px] border bg-surface shadow-card transition-transform hover:-translate-y-0.5">
      <div className="relative h-52 overflow-hidden">
        <Image src={property.image} alt={property.title} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between"><span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-extrabold text-background">{property.match}% группе</span>{onFavorite ? <button type="button" aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"} onClick={() => onFavorite(property.id)} className="grid size-9 place-items-center rounded-full bg-surface/90 backdrop-blur"><Heart className={`size-4 ${favorite ? "fill-current text-rose-500" : ""}`} /></button> : null}</div>
      </div>
      <div className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-extrabold">{property.title}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" />{property.district}</p></div><span className="whitespace-nowrap text-sm font-extrabold">{formatRubles(property.price)}</span></div><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{property.rooms} комнаты · {property.area} м²</span><Link href={`/app/housing/${property.id}`} className="font-extrabold text-foreground hover:text-[hsl(var(--accent-hover))]">Подробнее →</Link></div></div>
    </article>
  );
}
