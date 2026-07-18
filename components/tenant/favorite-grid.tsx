"use client";

import { useMemo } from "react";
import { demoProperties, demoRoommates } from "@/data/demo";
import { useFavorites } from "@/components/favorites-context";
import { EmptyState } from "./page-frame";
import { PersonCard } from "./person-card";
import { PropertyCard } from "./property-card";

export function FavoriteGrid() {
  const { favorites } = useFavorites();

  const people = useMemo(() => {
    return demoRoommates.filter((person) =>
      favorites.some((item) => item.type === "profile" && item.id === person.id)
    );
  }, [favorites]);

  const properties = useMemo(() => {
    return demoProperties.filter((property) =>
      favorites.some((item) => item.type === "property" && item.id === property.id)
    );
  }, [favorites]);

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
