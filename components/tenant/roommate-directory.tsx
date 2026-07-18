"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { demoRoommates } from "@/data/demo";
import { PersonCard } from "./person-card";

export function RoommateDirectory() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || searchParams.get("q") || "";
  const initialDistrict = searchParams.get("district") || "Все районы";

  const [query, setQuery] = useState(initialQuery);
  const [district, setDistrict] = useState(initialDistrict);

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q");
    if (q) setQuery(q);
    const d = searchParams.get("district");
    if (d) setDistrict(d);
  }, [searchParams]);

  const people = useMemo(() => {
    return demoRoommates.filter((person) => {
      const needle = query.trim().toLocaleLowerCase("ru");
      const matchesQuery =
        !needle ||
        [person.name, person.job, person.district, ...person.traits]
          .join(" ")
          .toLocaleLowerCase("ru")
          .includes(needle);
      return (
        matchesQuery &&
        (district === "Все районы" || person.district.includes(district) || district.includes(person.district))
      );
    });
  }, [district, query]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-[20px] border border-[#E5E5E0] bg-white p-3 md:grid-cols-[1fr_190px_auto] shadow-sm">
        <label className="flex h-11 items-center gap-2 rounded-full bg-[#F4F4F0] px-4">
          <Search className="size-4 text-[#878881]" />
          <span className="sr-only">Поиск соседей</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Имя, работа или интересы..."
            className="min-w-0 flex-1 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#878881]"
          />
        </label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="h-11 rounded-full bg-[#F4F4F0] px-4 text-sm font-medium text-[#111111] outline-none cursor-pointer"
        >
          <option>Все районы</option>
          <option>Центр</option>
          <option>Фестивальный</option>
          <option>Юбилейный</option>
          <option>Черёмушки</option>
          <option>Панорама</option>
        </select>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-4 text-xs font-extrabold text-[#111111] shadow-sm hover:bg-[#F4F4F0] cursor-pointer"
        >
          <SlidersHorizontal className="size-4" /> Фильтры
        </button>
      </div>

      <p className="text-xs font-medium text-[#6B6F66]">
        Показано {people.length} из {demoRoommates.length} профилей · сортировка по совместимости
      </p>

      {people.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <div className="rounded-[20px] border border-[#E5E5E0] bg-white p-10 text-center shadow-sm">
          <h2 className="font-extrabold text-[#111111]">Никого не нашли</h2>
          <p className="mt-2 text-sm text-[#6B6F66]">Попробуйте другой район или поисковый запрос.</p>
        </div>
      )}
    </div>
  );
}
