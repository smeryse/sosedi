"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { CityMap } from "@/components/map/city-map";
import { MediaImage } from "@/components/ui/media-image";
import { demoProperties, formatRubles } from "@/data/demo";
import { DemoRepository } from "@/lib/repositories/demo-repository";

export function PropertyDirectory() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("Все районы");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["center-loft"]);
  const properties = useMemo(() => demoProperties.filter((property) => {
    const needle = query.trim().toLocaleLowerCase("ru");
    return (!needle || `${property.title} ${property.district}`.toLocaleLowerCase("ru").includes(needle)) && (district === "Все районы" || property.district === district);
  }), [district, query]);
  const toggle = async (id: string) => {
    const state = await new DemoRepository().toggleFavorite("property", id);
    setFavoriteIds(state.favorites.filter((item) => item.type === "property").map((item) => item.id));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 lg:grid-cols-[minmax(250px,1fr)_150px_130px_130px_130px_auto]">
        <label className="flex h-11 items-center gap-2.5 rounded-full bg-white px-4 shadow-[inset_0_0_0_1px_#E5E5E0]">
          <Search className="size-4 text-[#777871]" />
          <span className="sr-only">Поиск жилья</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Район, адрес или название" className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#8D8E87]" />
        </label>
        <label className="relative flex h-11 items-center rounded-full bg-white px-4 shadow-[inset_0_0_0_1px_#E5E5E0]">
          <span className="sr-only">Район</span>
          <select value={district} onChange={(event) => setDistrict(event.target.value)} className="w-full appearance-none bg-transparent pr-4 text-[10px] font-bold outline-none">
            <option>Все районы</option><option>Центр</option><option>Фестивальный</option><option>Юбилейный</option><option>Панорама</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 size-3.5" />
        </label>
        {["До 50 000 ₽", "1–3 комнаты", "От 6 месяцев"].map((label) => (
          <button key={label} type="button" className="flex h-11 items-center justify-between rounded-full bg-white px-4 text-[10px] font-bold shadow-[inset_0_0_0_1px_#E5E5E0]">{label}<ChevronDown className="size-3.5" /></button>
        ))}
        <button type="button" aria-label="Дополнительные фильтры" className="grid size-11 place-items-center rounded-full bg-white shadow-[inset_0_0_0_1px_#E5E5E0]"><SlidersHorizontal className="size-4" /></button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[430px_minmax(0,1fr)] 2xl:grid-cols-[460px_minmax(0,1fr)]">
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between"><p className="text-[11px] font-bold">Найдено {properties.length} подходящих объекта</p><button type="button" className="text-[9px] font-semibold text-[#777871]">Сначала лучшие</button></div>
          <div className="space-y-3">
            {properties.map((property) => (
              <article key={property.id} className="grid min-h-[142px] grid-cols-[156px_minmax(0,1fr)] overflow-hidden rounded-[20px] bg-white shadow-[inset_0_0_0_1px_#E5E5E0]">
                <Link href={`/app/housing/${property.id}`} className="relative m-[5px] overflow-hidden rounded-[16px]">
                  <MediaImage src={property.image} alt={property.title} sizes="160px" className="object-cover" />
                  <span className="absolute bottom-2 left-2 rounded-full bg-[#111111] px-2 py-1 text-[8px] font-bold text-white">{property.match}% группе</span>
                </Link>
                <div className="flex min-w-0 flex-col p-4 pl-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><p className="text-[13px] font-extrabold">{formatRubles(property.price)} <span className="font-medium text-[#777871]">/ мес.</span></p><h2 className="mt-1 truncate text-[10px] font-bold">{property.title}</h2></div>
                    <button type="button" aria-label={favoriteIds.includes(property.id) ? "Убрать из избранного" : "Добавить в избранное"} onClick={() => void toggle(property.id)} className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F4F4F0]"><Heart className={`size-3.5 ${favoriteIds.includes(property.id) ? "fill-[#111111]" : ""}`} /></button>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[9px] text-[#777871]"><MapPin className="size-3" /> {property.district}, Краснодар</p>
                  <div className="mt-auto flex items-end justify-between gap-3"><p className="text-[9px] text-[#777871]">{property.rooms} комн. · {property.area} м²</p><Link href={`/app/housing/${property.id}`} className="text-[9px] font-extrabold text-[#759000]">Подробнее</Link></div>
                </div>
              </article>
            ))}
            {!properties.length ? <div className="rounded-[20px] bg-white p-8 text-center shadow-[inset_0_0_0_1px_#E5E5E0]"><p className="text-[13px] font-extrabold">Ничего не нашли</p><p className="mt-2 text-[10px] text-[#777871]">Измените район или поисковый запрос.</p></div> : null}
          </div>
        </section>

        <section className="relative min-h-[620px] overflow-hidden rounded-[22px] bg-white shadow-[inset_0_0_0_1px_#E5E5E0]">
          <CityMap className="absolute inset-[5px] rounded-[18px]" />
          <div className="pointer-events-none absolute left-5 top-5 rounded-full bg-white px-3 py-2 text-[9px] font-extrabold shadow-sm">{properties.length} объекта на карте</div>
          <div className="pointer-events-none absolute bottom-5 left-5 rounded-full bg-white px-3 py-2 text-[9px] font-bold shadow-sm">Краснодар · актуальные районы</div>
        </section>
      </div>
    </div>
  );
}
