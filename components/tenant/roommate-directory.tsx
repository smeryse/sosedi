"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { createClientRepository } from "@/lib/repositories";
import { roommateProfiles } from "@/lib/repositories/demo-repository";
import type { DemoRoommate } from "@/data/demo";
import { PersonCard } from "./person-card";
import { Stagger, StaggerItem } from "@/components/ui/motion-primitives";

export function RoommateDirectory() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || searchParams.get("q") || "";
  const initialDistrict = searchParams.get("district") || "Все районы";

  const [query, setQuery] = useState(initialQuery);
  const [district, setDistrict] = useState(initialDistrict);
  const [budget, setBudget] = useState(35000);
  const [lifestyle, setLifestyle] = useState("Неважно");
  const [smoking, setSmoking] = useState("Неважно");
  const [pets, setPets] = useState("Неважно");
  const [remoteWork, setRemoteWork] = useState("Неважно");
  const [guests, setGuests] = useState("Неважно");
  const [people, setPeople] = useState<DemoRoommate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery(searchParams.get("search") || searchParams.get("q") || "");
    setDistrict(searchParams.get("district") || "Все районы");
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const fetchRoommates = async () => {
      setLoading(true);
      try {
        const repo = createClientRepository();
        const results = await repo.listRoommates(query);
        if (active) {
          const filtered = results.filter((person) => {
            // District check
            const districtMatches = district === "Все районы" || person.district.includes(district) || district.includes(person.district);
            if (!districtMatches) return false;

            // Budget check
            if (person.budget > budget) return false;

            const profile = roommateProfiles[person.id];
            if (!profile) return true;

            // Smoking check
            if (smoking !== "Неважно") {
              const matchesSmoking = smoking === "Не курит" ? profile.smoking === "no" : profile.smoking !== "no";
              if (!matchesSmoking) return false;
            }

            // Pets check
            if (pets !== "Неважно") {
              const matchesPets = pets === "Без животных" ? profile.pets === "no" : profile.pets !== "no";
              if (!matchesPets) return false;
            }

            // Remote work check
            if (remoteWork !== "Неважно") {
              const matchesRemote = remoteWork === "Иногда" ? profile.remoteWork === "sometimes" : profile.remoteWork === "often";
              if (!matchesRemote) return false;
            }

            // Guests check
            if (guests !== "Неважно") {
              const matchesGuests = guests === "Редко"
                ? (profile.guests === "never" || profile.guests === "rarely")
                : guests === "Иногда"
                  ? profile.guests === "sometimes"
                  : profile.guests === "often";
              if (!matchesGuests) return false;
            }

            // Lifestyle check
            if (lifestyle !== "Неважно") {
              if (lifestyle === "Спокойный" && profile.noise > 2) return false;
              if (lifestyle === "Активный" && profile.sociability < 3) return false;
              if (lifestyle === "Домосед" && profile.remoteWork === "never") return false;
            }

            return true;
          });
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
  }, [query, district, budget, lifestyle, smoking, pets, remoteWork, guests]);

  const resetFilters = () => {
    setDistrict("Все районы");
    setBudget(35000);
    setLifestyle("Неважно");
    setSmoking("Неважно");
    setPets("Неважно");
    setRemoteWork("Неважно");
    setGuests("Неважно");
  };

  return (
    <div className="space-y-5">
      <div className="surface-card grid gap-x-5 gap-y-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-2">
          <span className="flex items-center justify-between text-[10px] font-black"><span>Бюджет</span><b>до {budget.toLocaleString("ru-RU")} ₽</b></span>
          <input type="range" min="15000" max="50000" step="1000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="h-1.5 w-full accent-[#9FC400]" />
        </label>
        <FilterSelect label="Район" value={district} onChange={setDistrict} options={["Все районы", "Центр", "Фестивальный", "Юбилейный", "Черёмушки", "Панорама"]} />
        <label className="space-y-2"><span className="text-[10px] font-black">Дата въезда</span><input type="date" className="h-10 w-full rounded-[12px] border bg-white px-3 text-xs outline-none focus:border-[#B3DB00]" /></label>
        <FilterSelect label="Образ жизни" value={lifestyle} onChange={setLifestyle} options={["Неважно", "Спокойный", "Активный", "Домосед"]} />
        <FilterSelect label="Курение" value={smoking} onChange={setSmoking} options={["Неважно", "Не курит", "Курит"]} />
        <FilterSelect label="Животные" value={pets} onChange={setPets} options={["Неважно", "Можно", "Без животных"]} />
        <FilterSelect label="Работа из дома" value={remoteWork} onChange={setRemoteWork} options={["Неважно", "Иногда", "Постоянно"]} />
        <FilterSelect label="Гости" value={guests} onChange={setGuests} options={["Неважно", "Редко", "Иногда", "Часто"]} />
        <button type="button" onClick={resetFilters} className="pressable mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#F0F8CB] to-[#EAF6AF] text-[11px] font-black"><RotateCcw className="size-3.5" /> Сбросить фильтры</button>
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
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {people.map((person) => (
            <StaggerItem key={person.id}><PersonCard person={person} /></StaggerItem>
          ))}
        </Stagger>
      ) : (
        <div className="rounded-[20px] border border-[#E5E5E0] bg-white p-10 text-center shadow-sm">
          <h2 className="font-extrabold text-[#111111]">Никого не нашли</h2>
          <p className="mt-2 text-sm text-[#6B6F66]">Попробуйте другой район или поисковый запрос.</p>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-[12px] border bg-white px-3 text-xs outline-none transition focus:border-[#B3DB00]">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
