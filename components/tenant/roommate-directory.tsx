"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { demoRoommates } from "@/data/demo";
import { DemoRepository } from "@/lib/repositories/demo-repository";
import { PersonCard } from "./person-card";

export function RoommateDirectory() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("Все районы");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  useEffect(() => { void new DemoRepository().getState().then((state) => setFavoriteIds(state.favorites.filter((item) => item.type === "profile").map((item) => item.id))); }, []);
  const people = useMemo(() => demoRoommates.filter((person) => {
    const needle = query.trim().toLocaleLowerCase("ru");
    const matchesQuery = !needle || [person.name, person.job, person.district, ...person.traits].join(" ").toLocaleLowerCase("ru").includes(needle);
    return matchesQuery && (district === "Все районы" || person.district === district);
  }), [district, query]);
  const toggle = async (id: string) => { const state = await new DemoRepository().toggleFavorite("profile", id); setFavoriteIds(state.favorites.filter((item) => item.type === "profile").map((item) => item.id)); };
  return <div className="space-y-5"><div className="grid gap-3 rounded-[20px] border bg-surface p-3 md:grid-cols-[1fr_190px_auto]"><label className="flex h-11 items-center gap-2 rounded-full bg-surface-muted px-4"><Search className="size-4 text-muted-foreground" /><span className="sr-only">Поиск соседей</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Имя, работа или интересы" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label><select value={district} onChange={(event) => setDistrict(event.target.value)} className="h-11 rounded-full bg-surface-muted px-4 text-sm outline-none"><option>Все районы</option><option>Центр</option><option>Фестивальный</option><option>Юбилейный</option><option>Черёмушки</option></select><button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-xs font-extrabold"><SlidersHorizontal className="size-4" /> Фильтры</button></div><p className="text-xs text-muted-foreground">Показано {people.length} из {demoRoommates.length} профилей · сортировка по совместимости</p>{people.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{people.map((person) => <PersonCard key={person.id} person={person} favorite={favoriteIds.includes(person.id)} onFavorite={(id) => void toggle(id)} />)}</div> : <div className="rounded-[20px] border bg-surface p-10 text-center"><h2 className="font-extrabold">Никого не нашли</h2><p className="mt-2 text-sm text-muted-foreground">Попробуйте другой район или запрос.</p></div>}</div>;
}
