"use client";

import { useEffect, useMemo, useState } from "react";
import { getRepository } from "@/lib/repositories";
import type { DemoProperty, DemoRoommate } from "@/data/demo";
import { useFavorites } from "@/components/favorites-context";
import { EmptyState } from "./page-frame";
import { PersonCard } from "./person-card";
import { PropertyCard } from "./property-card";

export function FavoriteGrid() {
  const { favorites } = useFavorites();
  const [allRoommates, setAllRoommates] = useState<DemoRoommate[]>([]);
  const [allProperties, setAllProperties] = useState<DemoProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const repo = getRepository();
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
      <EmptyState
        title="Пока ничего не сохранено"
        description="Нажмите на сердечко на любой карточке жилья или соседа, чтобы добавить вариант сюда."
        href="/app/housing"
        action="Найти жильё"
      />
    );
  }

  return (
    <div className="space-y-8">
      {people.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-extrabold text-[#111111]">Соседи ({people.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </section>
      )}

      {properties.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-extrabold text-[#111111]">Жильё ({properties.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
