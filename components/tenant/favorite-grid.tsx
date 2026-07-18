"use client";

import { useEffect, useMemo, useState } from "react";
import { demoProperties, demoRoommates } from "@/data/demo";
import { DemoRepository } from "@/lib/repositories/demo-repository";
import { EmptyState } from "./page-frame";
import { PersonCard } from "./person-card";
import { PropertyCard } from "./property-card";

export function FavoriteGrid() {
  const [favoriteIds, setFavoriteIds] = useState<{ type: "profile" | "property"; id: string }[]>([]);
  useEffect(() => { void new DemoRepository().getState().then((state) => setFavoriteIds(state.favorites)); }, []);
  const people = useMemo(() => demoRoommates.filter((person) => favoriteIds.some((item) => item.type === "profile" && item.id === person.id)), [favoriteIds]);
  const properties = useMemo(() => demoProperties.filter((property) => favoriteIds.some((item) => item.type === "property" && item.id === property.id)), [favoriteIds]);
  const toggle = async (type: "profile" | "property", id: string) => { const next = await new DemoRepository().toggleFavorite(type, id); setFavoriteIds(next.favorites); };
  if (!favoriteIds.length) return <EmptyState title="Пока ничего нет" description="Сохраняйте подходящих соседей и квартиры, чтобы быстро вернуться к ним." href="/app/roommates" action="Найти соседей" />;
  return <div className="space-y-8"><section><h2 className="mb-3 text-lg font-extrabold">Соседи</h2><div className="grid gap-4 md:grid-cols-2">{people.map((person) => <PersonCard key={person.id} person={person} favorite onFavorite={(id) => void toggle("profile", id)} />)}</div></section><section><h2 className="mb-3 text-lg font-extrabold">Жильё</h2><div className="grid gap-4 md:grid-cols-2">{properties.map((property) => <PropertyCard key={property.id} property={property} favorite onFavorite={(id) => void toggle("property", id)} />)}</div></section></div>;
}
