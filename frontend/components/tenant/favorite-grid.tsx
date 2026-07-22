"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClientRepository } from "@/lib/repositories";
import type { DemoProperty, DemoRoommate } from "@/data/demo";
import { useFavorites } from "@/components/favorites-context";
import { PersonCard } from "./person-card";
import { PropertyCard } from "./property-card";
import { Stagger, StaggerItem } from "@/components/ui/motion-primitives";

export function FavoriteGrid() {
  const { favorites } = useFavorites();
  const [allRoommates, setAllRoommates] = useState<DemoRoommate[]>([]);
  const [allProperties, setAllProperties] = useState<DemoProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const repo = createClientRepository();
      const [roommates, properties] = await Promise.all([
        repo.listRoommates(),
        repo.listProperties(),
      ]);
      if (!cancelled) {
        setAllRoommates(roommates);
        setAllProperties(properties);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const people = useMemo(() => {
    return allRoommates.filter((person) =>
      favorites.some((item) => item.type === "profile" && item.id === person.id)
    );
  }, [favorites, allRoommates]);

  const properties = useMemo(() => {
    return allProperties.filter((property) =>
      favorites.some((item) => item.type === "property" && item.id === property.id)
    );
  }, [favorites, allProperties]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="animate-pulse rounded-[22px] border bg-white p-4 h-[120px]">
            <div className="flex gap-4">
              <div className="h-[90px] w-[90px] shrink-0 rounded-[16px] bg-[#ECEFE8]" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-4 bg-[#ECEFE8] rounded w-1/3" />
                <div className="h-3 bg-[#ECEFE8] rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!favorites.length || (!people.length && !properties.length)) {
    return (
      <div className="surface-card flex flex-col items-center justify-center p-10 text-center">
        <div className="mb-4 grid size-16 place-items-center rounded-full bg-[#EBF7B6] text-[#7B9E00]">
          <span className="text-2xl font-black">💚</span>
        </div>
        <h3 className="text-lg font-black text-[#111111]">Пока ничего не сохранено</h3>
        <p className="mt-2 max-w-md text-xs font-medium text-[#6B6F66]">
          Нажмите на сердечко на любой карточке жилья или соседа, чтобы не потерять понравившиеся варианты.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app/housing"
            className="lime-button inline-flex h-10 items-center justify-center rounded-full px-5 text-xs font-extrabold text-[#111111]"
          >
            Найти жильё
          </Link>
          <Link
            href="/app/roommates"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#E5E5E0] bg-white px-5 text-xs font-extrabold text-[#111111] hover:bg-[#F4F4F0]"
          >
            Найти соседей
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {people.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-extrabold text-[#111111]">Соседи ({people.length})</h2>
          <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {people.map((person) => (
              <StaggerItem key={person.id}><PersonCard person={person} /></StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {properties.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-extrabold text-[#111111]">Жильё ({properties.length})</h2>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <StaggerItem key={property.id}><PropertyCard property={property} /></StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </div>
  );
}
