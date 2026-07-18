"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { CityMap } from "@/components/map/city-map";
import { MediaImage } from "@/components/ui/media-image";
import { demoProperties, formatRubles } from "@/data/demo";
import { DemoRepository } from "@/lib/repositories/demo-repository";

export function PropertyDirectory() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("Любой район");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["bolshoy-red"]);
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");

  const properties = useMemo(() => {
    return demoProperties.filter((property) => {
      const needle = query.trim().toLocaleLowerCase("ru");
      const matchQuery =
        !needle ||
        `${property.title} ${property.address} ${property.district}`
          .toLocaleLowerCase("ru")
          .includes(needle);
      const matchDistrict =
        district === "Любой район" || property.district.includes(district);
      return matchQuery && matchDistrict;
    });
  }, [district, query]);

  const toggleFavorite = async (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    await new DemoRepository().toggleFavorite("property", id);
  };

  return (
    <div className="space-y-4">
      {/* Header section with title and View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111] sm:text-[32px]">
            Поиск жилья
          </h1>
          <p className="mt-0.5 text-[13px] text-[#6B6F66]">
            Найдите квартиру или комнату в Краснодаре (всего {demoProperties.length} проверенных объявлений)
          </p>
        </div>

        <div className="inline-flex h-[42px] items-center rounded-full border border-[#E5E5E0] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`inline-flex h-8 items-center gap-2 rounded-full px-4 text-[11px] font-extrabold transition-colors ${
              viewMode === "split"
                ? "bg-[#EBF7B6] text-[#111111]"
                : "text-[#6B6F66] hover:text-[#111111]"
            }`}
          >
            <LayoutGrid className="size-3.5" /> Список
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`inline-flex h-8 items-center gap-2 rounded-full px-4 text-[11px] font-extrabold transition-colors ${
              viewMode === "map"
                ? "bg-[#EBF7B6] text-[#111111]"
                : "text-[#6B6F66] hover:text-[#111111]"
            }`}
          >
            <MapIcon className="size-3.5" /> Карта
          </button>
        </div>
      </div>

      {/* Filter capsule bar */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex h-[42px] items-center rounded-full border border-[#E5E5E0] bg-white px-4 shadow-sm hover:border-[#111111]">
          <Search className="mr-2 size-4 text-[#878881]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или улице..."
            className="w-[200px] bg-transparent text-[11px] text-[#111111] outline-none placeholder:text-[#878881]"
          />
        </label>

        <label className="relative flex h-[42px] items-center rounded-full border border-[#E5E5E0] bg-white px-4 shadow-sm hover:border-[#111111]">
          <span className="text-[11px] font-bold text-[#111111]">Район:</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="appearance-none bg-transparent pl-1.5 pr-6 text-[11px] font-medium text-[#6B6F66] outline-none cursor-pointer"
          >
            <option>Любой район</option>
            <option>Центральный</option>
            <option>Фестивальный</option>
            <option>Юбилейный</option>
            <option>Панорама</option>
            <option>Черёмушки</option>
            <option>Губернский</option>
            <option>40 лет Победы</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-[#878881]" />
        </label>

        {[
          ["Бюджет", "До 50 000 ₽"],
          ["Комнаты", "Любое кол-во"],
          ["Срок аренды", "От 6 мес."],
          ["Сортировка", "Сначала лучшие"],
        ].map(([label, val]) => (
          <button
            key={label}
            type="button"
            className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-4 text-[11px] shadow-sm transition-colors hover:border-[#111111]"
          >
            <span className="font-bold text-[#111111]">{label}:</span>
            <span className="font-medium text-[#6B6F66]">{val}</span>
            <ChevronDown className="size-3.5 text-[#878881]" />
          </button>
        ))}

        <button
          type="button"
          className="relative inline-flex h-[42px] items-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-4 text-[11px] font-extrabold text-[#111111] shadow-sm hover:border-[#111111]"
        >
          <SlidersHorizontal className="size-3.5" /> Фильтры
          <span className="grid size-4 place-items-center rounded-full bg-[#B3DB00] text-[9px] font-black text-[#111111]">
            0
          </span>
        </button>
      </div>

      {/* Main split grid */}
      <div className="grid gap-5 xl:grid-cols-[480px_minmax(0,1fr)] 2xl:grid-cols-[520px_minmax(0,1fr)]">
        {/* Left list column */}
        <section className="min-w-0 space-y-4 max-h-[calc(100vh-170px)] overflow-y-auto pr-1 soft-scrollbar">
          <p className="text-[11.5px] font-bold text-[#6B6F66]">
            Найдено {properties.length} объектов в Краснодаре
          </p>

          {properties.map((property) => {
            const isFav = favoriteIds.includes(property.id);
            return (
              <article
                key={property.id}
                className="group grid grid-cols-1 overflow-hidden rounded-[24px] border border-[#E5E5E0] bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:grid-cols-[210px_minmax(0,1fr)]"
              >
                {/* Photo container */}
                <div className="relative h-[170px] w-full overflow-hidden rounded-[18px] sm:h-full">
                  <MediaImage
                    src={property.image}
                    alt={property.title}
                    sizes="220px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-2.5 left-2.5 rounded-full bg-[#111111]/80 px-2.5 py-1 text-[9.5px] font-extrabold text-white backdrop-blur-sm">
                    {property.photosCount} фото
                  </span>
                  <button
                    type="button"
                    onClick={() => void toggleFavorite(property.id)}
                    aria-label={isFav ? "Убрать из избранного" : "В избранное"}
                    className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-110"
                  >
                    <Heart
                      className={`size-4 ${
                        isFav ? "fill-[#111111] text-[#111111]" : "text-[#111111]"
                      }`}
                    />
                  </button>
                </div>

                {/* Info container */}
                <div className="flex min-w-0 flex-col p-3 sm:pl-4">
                  <div>
                    <p className="text-[16px] font-black tracking-tight text-[#111111]">
                      {formatRubles(property.price)}{" "}
                      <span className="text-[11px] font-normal text-[#6B6F66]">
                        / мес.
                      </span>
                    </p>
                    <h3 className="mt-0.5 text-[12px] font-extrabold text-[#111111]">
                      {property.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-[#6B6F66]">
                      <MapPin className="size-3 text-[#7B9E00]" /> {property.address}, {property.district}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[10.5px] text-[#6B6F66]">
                    <span>{property.rooms} комн.</span>
                    <span>·</span>
                    <span>{property.area} м²</span>
                    <span>·</span>
                    <span>{property.floor} эт.</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {property.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#F4F4F0] px-2.5 py-1 text-[9.5px] font-medium text-[#6B6F66]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3.5 pt-2 border-t border-[#E5E5E0]/60 flex flex-col gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF7B6] px-3 py-1 text-[10.5px] font-extrabold text-[#7B9E00]">
                      <Sparkles className="size-3.5" /> Подходит группе на {property.match}%
                    </span>

                    <Link
                      href={`/app/housing/${property.id}`}
                      className="flex h-8 items-center justify-center rounded-full border border-[#E5E5E0] bg-white text-[11px] font-bold text-[#111111] transition-colors hover:border-[#111111] hover:bg-[#F4F4F0]"
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {!properties.length ? (
            <div className="rounded-[24px] border border-[#E5E5E0] bg-white p-8 text-center shadow-sm">
              <p className="text-[14px] font-extrabold text-[#111111]">Ничего не найдено</p>
              <p className="mt-1 text-[11px] text-[#6B6F66]">Попробуйте изменить поисковый запрос или фильтр по району.</p>
            </div>
          ) : null}
        </section>

        {/* Right Map column */}
        <section className="sticky top-[92px] h-[calc(100vh-170px)] min-h-[560px] overflow-hidden rounded-[24px] border border-[#E5E5E0] bg-white shadow-sm">
          <CityMap className="h-full w-full" />
        </section>
      </div>
    </div>
  );
}
