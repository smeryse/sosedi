"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Home,
  LayoutGrid,
  Map as MapIcon,
  Maximize2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  Wrench,
} from "lucide-react";
import { CityMap } from "@/components/map/city-map";
import { MediaImage } from "@/components/ui/media-image";
import { getRepository } from "@/lib/repositories";
import { formatRubles, type DemoProperty } from "@/data/demo";
import { HeartButton } from "@/components/favorites-context";

export function PropertyDirectory() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
  const initialDistrict = searchParams.get("district") || "Любой район";

  const [query, setQuery] = useState(initialSearch);
  const [district, setDistrict] = useState(initialDistrict);
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
  const [properties, setProperties] = useState<DemoProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = searchParams.get("search") || searchParams.get("q");
    if (s !== null) setQuery(s);
    const d = searchParams.get("district");
    if (d !== null) setDistrict(d);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const repo = getRepository();
        const results = await repo.listProperties(query);
        if (active) {
          const filtered = results.filter((property) => {
            return (
              district === "Любой район" ||
              property.district.toLowerCase().includes(district.toLowerCase())
            );
          });
          setProperties(filtered);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProperties();
    return () => { active = false; };
  }, [query, district]);


  return (
    <div className="space-y-4">
      {/* Header Section (Title + Subtitle + View Toggle capsule) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-[#111111] sm:text-[34px]">
            Поиск жилья
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#6B6F66]">
            Найдите квартиру или комнату для совместной аренды
          </p>
        </div>

        {/* View Toggle Pill Switch (Exact match to 3.png) */}
        <div className="flex items-center rounded-full border border-[#E5E5E0] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`inline-flex h-8 items-center gap-2 rounded-full px-4 text-[11px] font-extrabold transition-colors cursor-pointer ${
              viewMode === "split"
                ? "bg-[#EBF7B6] text-[#111111]"
                : "text-[#6B6F66] hover:text-[#111111]"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            Список
          </button>

          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`inline-flex h-8 items-center gap-2 rounded-full px-4 text-[11px] font-extrabold transition-colors cursor-pointer ${
              viewMode === "map"
                ? "bg-[#EBF7B6] text-[#111111]"
                : "text-[#6B6F66] hover:text-[#111111]"
            }`}
          >
            <MapIcon className="size-3.5" />
            Карта
          </button>
        </div>
      </div>

      {/* Filter Capsule Row (Exact match to 3.png) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Search Input Capsule */}
        <label className="flex h-[42px] min-w-[220px] max-w-[280px] flex-1 items-center gap-2.5 rounded-full border border-[#E5E5E0] bg-white px-4 text-[12px] shadow-sm transition-colors focus-within:border-[#B3DB00]">
          <Search className="size-4 text-[#878881]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или улице..."
            className="w-full bg-transparent text-[#111111] outline-none placeholder:text-[#878881]"
          />
        </label>

        {/* District Select Capsule */}
        <div className="relative">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="h-[42px] appearance-none rounded-full border border-[#E5E5E0] bg-white pl-4 pr-9 text-[11px] font-bold text-[#111111] shadow-sm outline-none cursor-pointer hover:border-[#111111]"
          >
            <option value="Любой район">📍 Район: Любой район</option>
            <option value="Центральный">Центральный район</option>
            <option value="Прикубанский">Прикубанский округ</option>
            <option value="Западный">Западный округ</option>
            <option value="Карасунский">Карасунский округ</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-3.5 text-[#878881]" />
        </div>

        {/* Capsule Filters */}
        {[
          ["₽ Бюджет", "Любой"],
          ["🛏 Комнаты", "Любое кол-во"],
          ["⏰ Срок аренды", "Любой срок"],
          ["🐾 Можно с животными", "Не важно"],
          ["🪑 Мебель", "Любая"],
          ["⇅ Сортировка", "Сначала новые"],
        ].map(([label, val]) => (
          <button
            key={label}
            type="button"
            className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-4 text-[11px] shadow-sm transition-colors hover:border-[#111111] cursor-pointer"
          >
            <span className="font-bold text-[#111111]">{label}:</span>
            <span className="font-medium text-[#6B6F66]">{val}</span>
            <ChevronDown className="size-3 text-[#878881]" />
          </button>
        ))}

        <button
          type="button"
          className="relative inline-flex h-[42px] items-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-4 text-[11px] font-extrabold text-[#111111] shadow-sm hover:border-[#111111] cursor-pointer"
        >
          <SlidersHorizontal className="size-3.5" /> Фильтры
          <span className="grid size-4 place-items-center rounded-full bg-[#B3DB00] text-[9px] font-black text-[#111111]">
            0
          </span>
        </button>
      </div>

      {/* Main Split Layout: Left Listing + Right Map */}
      <div
        className={`grid gap-4 ${
          viewMode === "split"
            ? "lg:grid-cols-[1fr_minmax(420px,500px)] xl:grid-cols-[1fr_minmax(480px,580px)]"
            : viewMode === "list"
            ? "grid-cols-1"
            : "grid-cols-1"
        }`}
      >
        {/* Left List Column */}
        {viewMode !== "map" && (
          <section className="min-w-0 space-y-4 max-h-[calc(100vh-190px)] overflow-y-auto pr-1 soft-scrollbar">
            <p className="text-[11.5px] font-bold text-[#6B6F66]">
              {loading ? "Загрузка вариантов..." : `Найдено ${properties.length} вариантов в Краснодаре`}
            </p>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="animate-pulse rounded-[24px] border bg-white p-3.5 h-[200px] flex flex-col gap-4 sm:flex-row">
                    <div className="h-[170px] w-full shrink-0 overflow-hidden rounded-[18px] sm:w-[220px] bg-[#ECEFE8]" />
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-5 bg-[#ECEFE8] rounded w-1/3" />
                      <div className="h-4 bg-[#ECEFE8] rounded w-2/3" />
                      <div className="h-4 bg-[#ECEFE8] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.map((property) => (
              <article
                key={property.id}
                className="group flex flex-col gap-4 overflow-hidden rounded-[24px] border border-[#E5E5E0] bg-white p-3.5 shadow-sm transition-all hover:shadow-md sm:flex-row"
              >
                {/* Photo container */}
                <div className="relative h-[170px] shrink-0 overflow-hidden rounded-[18px] sm:w-[220px] md:w-[240px]">
                  <Link href={`/app/housing/${property.id}`}>
                    <MediaImage
                      src={property.image}
                      alt={property.title}
                      sizes="300px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <span className="absolute bottom-2.5 left-2.5 rounded-full bg-[#111111]/80 px-2.5 py-1 text-[9.5px] font-extrabold text-white backdrop-blur-sm">
                    {property.photosCount} фото
                  </span>
                  <HeartButton
                    type="property"
                    id={property.id}
                    className="absolute right-2.5 top-2.5"
                  />
                </div>

                {/* Details container (Exact 3.png layout) */}
                <div className="flex min-w-0 flex-1 flex-col justify-between pt-1">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[20px] font-black tracking-tight text-[#111111]">
                        {formatRubles(property.price)}{" "}
                        <span className="text-[12px] font-normal text-[#6B6F66]">/ мес.</span>
                      </p>
                    </div>

                    <p className="mt-0.5 text-[11.5px] font-bold text-[#6B6F66]">
                      {property.district} · {property.address}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-[11px] font-medium text-[#111111]">
                      <span className="flex items-center gap-1.5">
                        <Home className="size-3.5 text-[#7B9E00]" /> {property.rooms} комн. · {property.area} м²
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Utensils className="size-3.5 text-[#7B9E00]" /> Кухня-гостиная
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Maximize2 className="size-3.5 text-[#7B9E00]" /> {property.floor} этаж
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Wrench className="size-3.5 text-[#7B9E00]" /> Евроремонт
                      </span>
                    </div>
                  </div>

                  {/* Compatibility Badge & CTA (Exact 3.png) */}
                  <div className="mt-4 flex flex-col gap-2.5 pt-2 border-t border-[#E5E5E0]/60">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF7B6] px-3 py-1 text-[11px] font-black text-[#7B9E00]">
                      <Sparkles className="size-3.5" /> Подходит группе на {property.match}%
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/app/housing/${property.id}`}
                        className="flex h-8.5 flex-1 items-center justify-center rounded-full border border-[#B3DB00] bg-white text-[11.5px] font-black text-[#111111] transition-colors hover:bg-[#EBF7B6]"
                      >
                        Подробнее
                      </Link>
                      {property.cianUrl ? (
                        <a
                          href={property.cianUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8.5 items-center justify-center rounded-full bg-[#005BFF]/10 px-3.5 text-[11px] font-black text-[#005BFF] hover:bg-[#005BFF]/20"
                          title="Открыть карточку на ЦИАН"
                        >
                          ЦИАН ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* Right Map Column (Exact 3.png layout) */}
        {viewMode !== "list" && (
          <section className="sticky top-[90px] h-[calc(100vh-190px)] min-h-[450px] overflow-hidden rounded-[26px] border border-[#E5E5E0] bg-white shadow-sm">
            <CityMap className="h-full w-full" />
          </section>
        )}
      </div>
    </div>
  );
}
