"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import { SlidersHorizontal, Heart, ArrowRight, Plus, Minus, Navigation, Key, Users, GraduationCap, Filter } from "lucide-react";
import { MOCK_BUILDINGS, CityBuilding } from "@/lib/3d-demo-data";
import { useCommercial3DStore } from "@/lib/application/3d/store";
import { cn } from "@/lib/utils";

const rasterMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-layer",
      type: "raster",
      source: "osm",
      paint: {
        "raster-saturation": -0.65,
        "raster-contrast": 0.1,
        "raster-brightness-max": 0.95,
      },
    },
  ],
};

interface CityMapScreenProps {
  onSelectApartment: (building: CityBuilding) => void;
  onNextScreen?: () => void;
}

export function CityMapScreen({ onSelectApartment, onNextScreen }: CityMapScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const {
    selectedBuildingId,
    setSelectedBuildingId,
    maxRent,
    setMaxRent,
    timeToDestinationMin,
    setTimeToDestinationMin,
    peopleFilter,
    districtFilter,
    setDistrictFilter,
    has3DModelFilter,
    setHas3DModelFilter,
    getSelectedBuilding,
  } = useCommercial3DStore();

  const selectedBuilding = getSelectedBuilding();

  // Dynamic Filtering
  const filteredBuildings = MOCK_BUILDINGS.filter((b) => {
    if (b.price > maxRent + 5000) return false;
    if (b.timeToKubSU > timeToDestinationMin + 15) return false;
    if (districtFilter !== "Все районы" && !b.address.includes(districtFilter)) return false;
    return true;
  });

  useEffect(() => {
    let active = true;
    if (!containerRef.current || mapRef.current) return;

    void import("maplibre-gl").then((maplibre) => {
      if (!active || !containerRef.current) return;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: rasterMapStyle,
        center: [38.976, 45.035],
        zoom: 12.8,
        pitch: 55,
        bearing: -15,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on("load", () => {
        if (!active) return;
        setMapLoaded(true);

        // Render Building Pins
        filteredBuildings.forEach((bldg) => {
          const el = document.createElement("div");
          el.className = "group cursor-pointer";
          el.innerHTML = `
            <div class="relative flex flex-col items-center">
              <div class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-xl transition-all flex items-center gap-1.5 ${
                bldg.id === selectedBuildingId
                  ? "bg-gray-900 text-white border border-gray-700 ring-2 ring-[#CCFF00]"
                  : "bg-white text-gray-900 border border-gray-200"
              }">
                <span class="size-2 rounded-full bg-[#CCFF00]"></span>
                ${bldg.priceFormatted}
              </div>
            </div>
          `;

          el.addEventListener("click", () => {
            setSelectedBuildingId(bldg.id);
            map.flyTo({
              center: bldg.coordinates,
              zoom: 15,
              pitch: 60,
              bearing: -20,
              duration: 1200,
            });
          });

          new maplibre.Marker({ element: el, anchor: "bottom" })
            .setLngLat(bldg.coordinates)
            .addTo(map);
        });

        // KubSU Destination Marker
        const kubsuEl = document.createElement("div");
        kubsuEl.innerHTML = `
          <div class="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-xl border border-gray-200 flex items-center gap-1.5 animate-bounce">
            <span class="size-2.5 rounded-full bg-emerald-500"></span>
            🎓 КубГУ
          </div>
        `;
        new maplibre.Marker({ element: kubsuEl, anchor: "bottom" })
          .setLngLat([39.0305, 45.0205])
          .addTo(map);
      });
    });

    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [filteredBuildings.length]);

  return (
    <div className="relative w-full h-[100dvh] bg-[#EBEFEA] overflow-hidden flex flex-col font-sans select-none">
      {/* MapLibre Canvas */}
      <div className="absolute inset-0 z-0">
        <div ref={containerRef} className="w-full h-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 bg-[#E3E8E2] flex items-center justify-center text-xs font-bold text-gray-600">
            Загружаем интерактивную 3D-карту...
          </div>
        )}
      </div>

      {/* Header Overlay */}
      <header className="relative z-30 pt-4 px-4 sm:px-8 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 font-heading">
            соседи<span className="text-[#CCFF00]">.</span>
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-200/80 shadow-sm text-xs font-semibold text-gray-700">
          <span className="size-2 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="hidden sm:inline">Шаг 1 из 5 •</span> 3D-Карта
        </div>
      </header>

      {/* Main Responsive Layout */}
      <main className="relative z-30 flex-1 px-4 sm:px-8 pt-2 pb-6 flex flex-col justify-between pointer-events-none">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 max-w-lg leading-tight font-heading pointer-events-auto">
            Найдите дом <br />
            <span className="text-gray-500 font-normal">и своих людей</span>
          </h1>
        </div>

        {/* Dynamic Filter Card */}
        <div className="w-full sm:w-80 bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-2xl space-y-3 pointer-events-auto my-2 sm:my-0">
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-2xl border border-gray-200/80 text-xs font-semibold text-gray-800">
              <span className="flex items-center gap-1.5">
                <Key className="size-3.5 text-gray-500" />
                Аренда
              </span>
              <span className="text-gray-400">▾</span>
            </button>
            <button className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-2xl border border-gray-200/80 text-xs font-semibold text-gray-800">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5 text-gray-500" />
                {peopleFilter}
              </span>
              <span className="text-gray-400">▾</span>
            </button>
          </div>

          <div className="space-y-1 bg-gray-50/80 p-2.5 rounded-2xl border border-gray-100">
            <div className="flex justify-between text-xs font-semibold text-gray-700">
              <span className="text-gray-500">Бюджет</span>
              <span className="text-gray-900 font-bold">до {maxRent.toLocaleString()} ₽</span>
            </div>
            <input
              type="range"
              min="15000"
              max="40000"
              step="1000"
              value={maxRent}
              onChange={(e) => setMaxRent(Number(e.target.value))}
              className="w-full accent-[#CCFF00] h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1 bg-gray-50/80 p-2.5 rounded-2xl border border-gray-100">
            <div className="flex justify-between text-xs font-semibold text-gray-700">
              <span className="text-gray-500">До КубГУ</span>
              <span className="text-gray-900 font-bold">до {timeToDestinationMin} мин</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="1"
              value={timeToDestinationMin}
              onChange={(e) => setTimeToDestinationMin(Number(e.target.value))}
              className="w-full accent-[#CCFF00] h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Extended Filters Toggle */}
          {showMoreFilters && (
            <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Только с 3D-моделью</span>
                <input
                  type="checkbox"
                  checked={has3DModelFilter}
                  onChange={(e) => setHas3DModelFilter(e.target.checked)}
                  className="accent-[#CCFF00] size-4"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowMoreFilters((prev) => !prev)}
              className="flex-1 py-2.5 px-3 bg-gray-100 text-gray-700 font-semibold text-xs rounded-2xl flex items-center justify-center gap-1.5"
            >
              <Filter className="size-3.5" />
              {showMoreFilters ? "Скрыть" : "Фильтры"}
            </button>
            <button className="flex-1 py-2.5 px-3 bg-[#CCFF00] hover:bg-[#b8e600] text-gray-900 font-bold text-xs rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95">
              Найдено: {filteredBuildings.length}
            </button>
          </div>
        </div>

        {/* Map Controls */}
        <div className="hidden sm:flex absolute left-8 bottom-8 flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/80 p-1 pointer-events-auto space-y-1 z-20">
          <button onClick={() => mapRef.current?.zoomIn()} className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-700">
            <Plus className="size-4" />
          </button>
          <div className="w-full h-px bg-gray-200" />
          <button onClick={() => mapRef.current?.zoomOut()} className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-700">
            <Minus className="size-4" />
          </button>
          <div className="w-full h-px bg-gray-200" />
          <button onClick={() => mapRef.current?.resetNorthPitch()} className="p-2.5 hover:bg-gray-100 rounded-xl text-emerald-600">
            <Navigation className="size-4" />
          </button>
        </div>

        {/* Selected Building Preview Drawer */}
        <div className="w-full sm:w-96 sm:absolute sm:right-8 sm:bottom-8 bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-2xl pointer-events-auto space-y-3 z-30">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/30 text-emerald-950 font-bold text-xs border border-[#CCFF00]">
              <span className="size-2 rounded-full bg-[#CCFF00] animate-ping" />
              {selectedBuilding.matchPercentage}% совместимость
            </div>
            <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500">
              <Heart className="size-4" />
            </button>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{selectedBuilding.address}</h3>
            <p className="text-xs text-gray-500 font-medium">
              {selectedBuilding.name} • {selectedBuilding.rooms} ({selectedBuilding.area})
            </p>
          </div>

          <div className="relative h-28 sm:h-36 rounded-2xl overflow-hidden shadow-inner group">
            <img
              src={selectedBuilding.image}
              alt={selectedBuilding.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-2.5 left-3 text-white font-bold text-sm">
              {selectedBuilding.priceFormatted} <span className="text-xs font-normal text-white/80">/ мес</span>
            </span>
          </div>

          <button
            onClick={() => {
              onSelectApartment(selectedBuilding);
              if (onNextScreen) onNextScreen();
            }}
            className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>Смотреть квартиру</span>
            <ArrowRight className="size-4 text-[#CCFF00]" />
          </button>
        </div>
      </main>
    </div>
  );
}
