"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { getRepository } from "@/lib/repositories";
import type { DemoRoommate } from "@/data/demo";
import { PersonCard } from "./person-card";

export function RoommateDirectory() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || searchParams.get("q") || "";
  const initialDistrict = searchParams.get("district") || "Все районы";

  const [query, setQuery] = useState(initialQuery);
  const [district, setDistrict] = useState(initialDistrict);
  const [people, setPeople] = useState<DemoRoommate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q");
    if (q) setQuery(q);
    const d = searchParams.get("district");
    if (d) setDistrict(d);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const fetchRoommates = async () => {
      setLoading(true);
      try {
        const repo = getRepository();
        const results = await repo.listRoommates(query);
        if (active) {
          const filtered = results.filter((person) =>
            district === "Все районы" ||
            person.district.includes(district) ||
            district.includes(person.district)
          );
          setPeople(filtered);
          setTotalCount(results.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRoommates();
    return () => { active = false; };
  }, [query, district]);

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
        Показано {people.length} из {totalCount} профилей · сортировка по совместимости
      </p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse rounded-[24px] border bg-white p-5 h-[220px]">
              <div className="flex gap-4">
                <div className="size-14 rounded-full bg-[#ECEFE8]" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-[#ECEFE8] rounded w-3/4" />
                  <div className="h-3 bg-[#ECEFE8] rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <div className="h-3 bg-[#ECEFE8] rounded" />
                <div className="h-3 bg-[#ECEFE8] rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : people.length ? (
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
