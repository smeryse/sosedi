"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
  const initialDistrict = searchParams.get("district") || "Любой район";
  const initialCity = searchParams.get("city") || "Краснодар";
  const initialMinPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
  const initialMaxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
  const initialRooms = searchParams.get("rooms") ? searchParams.get("rooms")!.split(",").map(Number) : [];
  const initialPets = searchParams.get("pets") === "true";
  const initialFurnished = searchParams.get("furnished") === "true";
  const initialSort = searchParams.get("sort") || "match";

  const [query, setQuery] = useState(initialSearch);
  const [district, setDistrict] = useState(initialDistrict);
  const [city, setCity] = useState(initialCity);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [rooms, setRooms] = useState<number[]>(initialRooms);
  const [petsAllowed, setPetsAllowed] = useState<boolean | undefined>(searchParams.has("pets") ? initialPets : undefined);
  const [furnished, setFurnished] = useState<boolean | undefined>(searchParams.has("furnished") ? initialFurnished : undefined);
  const [sortBy, setSortBy] = useState<"match" | "price_asc" | "price_desc" | "newest">(initialSort as any);
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
  const [properties, setProperties] = useState<DemoProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [openBudget, setOpenBudget] = useState(false);
  const [openRooms, setOpenRooms] = useState(false);
  const [openRentalTerm, setOpenRentalTerm] = useState(false);
  const [openPets, setOpenPets] = useState(false);
  const [openFurnished, setOpenFurnished] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  useEffect(() => {
    const s = searchParams.get("search") || searchParams.get("q");
    if (s !== null) setQuery(s);
    const d = searchParams.get("district");
    if (d !== null) setDistrict(d);
    const c = searchParams.get("city");
    if (c !== null) setCity(c);
    const mp = searchParams.get("minPrice");
    if (mp !== null) setMinPrice(mp ? parseInt(mp) : undefined);
    const Mp = searchParams.get("maxPrice");
    if (Mp !== null) setMaxPrice(Mp ? parseInt(Mp) : undefined);
    const r = searchParams.get("rooms");
    if (r !== null) setRooms(r ? r.split(",").map(Number) : []);
    const p = searchParams.get("pets");
    if (p !== null) setPetsAllowed(p === "true");
    const f = searchParams.get("furnished");
    if (f !== null) setFurnished(f === "true");
    const sortVal = searchParams.get("sort");
    if (sortVal !== null) setSortBy(sortVal as any);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const repo = getRepository();
        const results = await repo.listProperties({
          query,
          city: city !== "Все города" ? city : undefined,
          districts: district !== "Любой район" ? [district] : undefined,
          minPrice,
          maxPrice,
          rooms: rooms.length > 0 ? rooms : undefined,
          petsAllowed: petsAllowed,
          furnished,
          sortBy,
        });
        if (active) {
          setProperties(results);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProperties();
    return () => { active = false; };
  }, [query, city, district, minPrice, maxPrice, rooms, petsAllowed, furnished, sortBy]);

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (city && city !== "Все города") params.set("city", city);
    if (district && district !== "Любой район") params.set("district", district);
    if (minPrice !== undefined) params.set("minPrice", String(minPrice));
    if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
    if (rooms.length > 0) params.set("rooms", rooms.join(","));
    if (petsAllowed !== undefined) params.set("pets", String(petsAllowed));
    if (furnished !== undefined) params.set("furnished", String(furnished));
    if (sortBy !== "match") params.set("sort", sortBy);
    router.replace(`/app/housing?${params.toString()}`, { scroll: false });
  };

  // Call updateUrl when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(updateUrl, 300);
    return () => clearTimeout(timer);
  }, [query, city, district, minPrice, maxPrice, rooms, petsAllowed, furnished, sortBy]);


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

        {/* City Select Capsule */}
        <div className="relative">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-[42px] appearance-none rounded-full border border-[#E5E5E0] bg-white pl-4 pr-9 text-[11px] font-bold text-[#111111] shadow-sm outline-none cursor-pointer hover:border-[#111111]"
          >
            <option value="Все города">🏙 Город: Все города</option>
            <option value="Краснодар">Краснодар</option>
            <option value="Москва">Москва</option>
            <option value="Санкт-Петербург">Санкт-Петербург</option>
            <option value="Казань">Казань</option>
            <option value="Екатеринбург">Екатеринбург</option>
            <option value="Новосибирск">Новосибирск</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-3.5 text-[#878881]" />
        </div>

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
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenBudget(!openBudget)}
            className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-4 text-[11px] shadow-sm transition-colors hover:border-[#111111] cursor-pointer"
          >
            <span className="font-bold text-[#111111]">₽ Бюджет:</span>
            <span className="font-medium text-[#6B6F66]">
              {minPrice !== undefined || maxPrice !== undefined
                ? `${minPrice ? formatRubles(minPrice) : "0"} – ${maxPrice ? formatRubles(maxPrice) : "∞"}`
                : "Любой"}
            </span>
            <ChevronDown className={`size-3 text-[#878881] transition-transform ${openBudget ? "rotate-180" : ""}`} />
          </button>
          {openBudget && (
            <div className="absolute z-10 top-full left-0 mt-1.5 w-[220px] rounded-xl border border-[#E5E5E0] bg-white p-3 shadow-lg">
              <label className="flex items-center gap-2 mb-2 text-[12px] font-medium text-[#111111]">
                <span>От</span>
                <input
                  type="number"
                  value={minPrice ?? ""}
                  onChange={(e) => setMinPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-1/2 rounded-lg border border-[#E5E5E0] bg-white px-3 py-1.5 text-[12px] outline-none focus:border-[#B3DB00]"
                />
              </label>
              <label className="flex items-center gap-2 mb-2 text-[12px] font-medium text-[#111111]">
                <span>До</span>
                <input
                  type="number"
                  value={maxPrice ?? ""}
                  onChange={(e) => setMaxPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="∞"
                  className="w-1/2 rounded-lg border border-[#E5E5E0] bg-white px-3 py-1.5 text-[12px] outline-none focus:border-[#B3DB00]"
                />
              </label>
              <button
                type="button"
                onClick={() => { setMinPrice(undefined); setMaxPrice(undefined); setOpenBudget(false); }}
                className="w-full text-left text-[12px] font-medium text-[#6B6F66] hover:text-[#111111]"
              >
                Сбросить
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenRooms(!openRooms)}
            className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-4 text-[11px] shadow-sm transition-colors hover:border-[#111111] cursor-pointer"
          >
            <span className="font-bold text-[#111111]">🛏 Комнаты:</span>
            <span className="font-medium text-[#6B6F66]">
              {rooms.length > 0 ? rooms.map(r => `${r}к`).join(", ") : "Любое кол-во"}
            </span>
            <ChevronDown className={`size-3 text-[#878881] transition-transform ${openRooms ? "rotate-180" : ""}`} />
          </button>
          {openRooms && (
            <div className="absolute z-10 top-full left-0 mt-1.5 w-[180px] rounded-xl border border-[#E5E5E0] bg-white p-3 shadow-lg">
              {[1,2,3,4].map(r => (
                <label key={r} className="flex items-center gap-2 py-1.5 text-[12px] cursor-pointer hover:bg-[#F5F5F0] rounded-lg px-2">
                  <input
                    type="checkbox"
                    checked={rooms.includes(r)}
                    onChange={(e) => setRooms(e.target.checked ? [...rooms, r] : rooms.filter(x => x !== r))}
                    className="size-4 accent-[#7B9E00]"
                  />
                  {r} комната{r > 1 ? "ы" : ""}
                </label>
              ))}
              <button
                type="button"
                onClick={() => { setRooms([]); setOpenRooms(false); }}
                className="w-full text-left py-1.5 text-[12px] font-medium text-[#6B6F66] hover:text-[#111111]"
              >
                Сбросить
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenRentalTerm(!openRentalTerm)}
            className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-4 text-[11px] shadow-sm transition-colors hover:border-[#111111] cursor-pointer"
          >
            <span className="font-bold text-[#111111]">⏰ Срок:</span>
            <span className="font-medium text-[#6B6F66]">Любой срок</span>
            <ChevronDown className={`size-3 text-[#878881] transition-transform ${openRentalTerm ? "rotate-180" : ""}`} />
          </button>
          {openRentalTerm && (
            <div className="absolute z-10 top-full left-0 mt-1.5 w-[180px] rounded-xl border border-[#E5E5E0] bg-white p-3 shadow-lg">
              {["Краткосрочная (до 6 мес)", "Долгосрочная (6–12 мес)", "Год и более"].map((term, i) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setOpenRentalTerm(false)}
                  className="w-full text-left py-1.5 text-[12px] font-medium text-[#111111] hover:bg-[#F5F5F0] rounded-lg px-2"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenPets(!openPets)}
            className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-4 text-[11px] shadow-sm transition-colors hover:border-[#111111] cursor-pointer"
          >
            <span className="font-bold text-[#111111]">🐾 Животные:</span>
            <span className="font-medium text-[#6B6F66]">
              {petsAllowed === true ? "Можно" : petsAllowed === false ? "Нельзя" : "Не важно"}
            </span>
            <ChevronDown className={`size-3 text-[#878881] transition-transform ${openPets ? "rotate-180" : ""}`} />
          </button>
          {openPets && (
            <div className="absolute z-10 top-full left-0 mt-1.5 w-[180px] rounded-xl border border-[#E5E5E0] bg-white p-3 shadow-lg">
              {[
                { value: true, label: "Можно с животными" },
                { value: false, label: "Нельзя с животными" },
                { value: undefined, label: "Не важно" },
              ].map(opt => (
                <button
                  key={opt.value === undefined ? "any" : String(opt.value)}
                  type="button"
                  onClick={() => { setPetsAllowed(opt.value); setOpenPets(false); }}
                  className={`w-full text-left py-1.5 text-[12px] font-medium rounded-lg px-2 ${petsAllowed === opt.value ? "bg-[#EBF7B6] text-[#7B9E00]" : "text-[#111111] hover:bg-[#F5F5F0]"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenFurnished(!openFurnished)}
            className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-4 text-[11px] shadow-sm transition-colors hover:border-[#111111] cursor-pointer"
          >
            <span className="font-bold text-[#111111]">🪑 Мебель:</span>
            <span className="font-medium text-[#6B6F66]">
              {furnished === true ? "Есть" : furnished === false ? "Нет" : "Любая"}
            </span>
            <ChevronDown className={`size-3 text-[#878881] transition-transform ${openFurnished ? "rotate-180" : ""}`} />
          </button>
          {openFurnished && (
            <div className="absolute z-10 top-full left-0 mt-1.5 w-[180px] rounded-xl border border-[#E5E5E0] bg-white p-3 shadow-lg">
              {[
                { value: true, label: "Мебель есть" },
                { value: false, label: "Без мебели" },
                { value: undefined, label: "Любая" },
              ].map(opt => (
                <button
                  key={opt.value === undefined ? "any" : String(opt.value)}
                  type="button"
                  onClick={() => { setFurnished(opt.value); setOpenFurnished(false); }}
                  className={`w-full text-left py-1.5 text-[12px] font-medium rounded-lg px-2 ${furnished === opt.value ? "bg-[#EBF7B6] text-[#7B9E00]" : "text-[#111111] hover:bg-[#F5F5F0]"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenSort(!openSort)}
            className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white px-4 text-[11px] shadow-sm transition-colors hover:border-[#111111] cursor-pointer"
          >
            <span className="font-bold text-[#111111]">⇅ Сортировка:</span>
            <span className="font-medium text-[#6B6F66]">
              {sortBy === "match" ? "По совпадению" : sortBy === "price_asc" ? "Цена ↑" : sortBy === "price_desc" ? "Цена ↓" : "Сначала новые"}
            </span>
            <ChevronDown className={`size-3 text-[#878881] transition-transform ${openSort ? "rotate-180" : ""}`} />
          </button>
          {openSort && (
            <div className="absolute z-10 top-full left-0 mt-1.5 w-[180px] rounded-xl border border-[#E5E5E0] bg-white p-3 shadow-lg">
              {[
                { value: "match", label: "По совпадению" },
                { value: "newest", label: "Сначала новые" },
                { value: "price_asc", label: "Цена: по возрастанию" },
                { value: "price_desc", label: "Цена: по убыванию" },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSortBy(opt.value as any); setOpenSort(false); }}
                  className={`w-full text-left py-1.5 text-[12px] font-medium rounded-lg px-2 ${sortBy === opt.value ? "bg-[#EBF7B6] text-[#7B9E00]" : "text-[#111111] hover:bg-[#F5F5F0]"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
              {loading ? "Загрузка вариантов..." : `Найдено ${properties.length} вариантов в ${city}`}
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
