"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import { ArrowLeft, Bus, Armchair, Users, Activity, Plus, Minus, Navigation, Trees } from "lucide-react";
import { useCommercial3DStore } from "@/lib/application/3d/store";
import { cn } from "@/lib/utils";

const rasterMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "osm-layer",
      type: "raster",
      source: "osm",
      paint: {
        "raster-saturation": -0.7,
        "raster-contrast": 0.05,
      },
    },
  ],
};

interface QualityOfLifeScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export function QualityOfLifeScreen({ onBack, onNext }: QualityOfLifeScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { activeQualityMode, setActiveQualityMode } = useCommercial3DStore();

  useEffect(() => {
    let active = true;
    if (!containerRef.current || mapRef.current) return;

    void import("maplibre-gl").then((maplibre) => {
      if (!active || !containerRef.current) return;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: rasterMapStyle,
        center: [38.976, 45.035],
        zoom: 13.2,
        pitch: 45,
        bearing: -10,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on("load", () => {
        if (!active) return;
        setMapLoaded(true);

        map.addSource("roommates-zone", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [
                    [
                      [38.965, 45.03],
                      [38.985, 45.03],
                      [38.985, 45.042],
                      [38.965, 45.042],
                      [38.965, 45.03],
                    ],
                  ],
                },
                properties: { name: "High Match Zone" },
              },
            ],
          },
        });

        map.addLayer({
          id: "roommates-fill",
          type: "fill",
          source: "roommates-zone",
          paint: {
            "fill-color": "#CCFF00",
            "fill-opacity": 0.25,
          },
        });

        map.addLayer({
          id: "roommates-line",
          type: "line",
          source: "roommates-zone",
          paint: {
            "line-color": "#CCFF00",
            "line-width": 3,
          },
        });

        const zoneBadgeEl = document.createElement("div");
        zoneBadgeEl.innerHTML = `
          <div class="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
            <span class="size-2 rounded-full bg-[#CCFF00]"></span>
            <span class="text-xs font-bold text-gray-900">👥 14 подходящих людей</span>
          </div>
        `;
        new maplibre.Marker({ element: zoneBadgeEl, anchor: "center" })
          .setLngLat([38.975, 45.036])
          .addTo(map);

        map.addSource("route-to-kubsu", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [38.976, 45.035],
                    [39.0, 45.03],
                    [39.0305, 45.0205],
                  ],
                },
                properties: {},
              },
            ],
          },
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route-to-kubsu",
          paint: {
            "line-color": "#10B981",
            "line-width": 4,
            "line-dasharray": [2, 1],
          },
        });
      });
    });

    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    if (map.getLayer("roommates-fill")) {
      map.setLayoutProperty(
        "roommates-fill",
        "visibility",
        activeQualityMode === "neighbors" ? "visible" : "none"
      );
      map.setLayoutProperty(
        "roommates-line",
        "visibility",
        activeQualityMode === "neighbors" ? "visible" : "none"
      );
    }

    if (map.getLayer("route-line")) {
      map.setLayoutProperty(
        "route-line",
        "visibility",
        activeQualityMode === "transport" ? "visible" : "none"
      );
    }
  }, [activeQualityMode, mapLoaded]);

  return (
    <div className="relative w-full h-[100dvh] bg-[#EAEFE8] overflow-hidden flex flex-col font-sans select-none">
      <div className="absolute inset-0 z-0">
        <div ref={containerRef} className="w-full h-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 bg-[#E1E8DF] flex items-center justify-center text-xs font-bold text-gray-600">
            Загружаем слой качества жизни...
          </div>
        )}
      </div>

      <header className="relative z-30 pt-4 px-4 sm:px-8 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-sm border border-gray-200/80"
          >
            <ArrowLeft className="size-4 sm:size-5" />
          </button>
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 font-heading">
            соседи<span className="text-[#CCFF00]">.</span>
          </span>
        </div>

        <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight font-heading flex items-center gap-1.5">
          Качество <span className="text-[#99CC00]">жизни</span>
        </h1>
      </header>

      <main className="relative z-30 flex-1 px-4 sm:px-8 pt-4 pb-6 flex flex-col sm:flex-row justify-between pointer-events-none gap-4">
        <div className="w-full sm:w-48 bg-white/95 backdrop-blur-xl rounded-3xl p-3 border border-gray-100 shadow-2xl space-y-2 pointer-events-auto z-20">
          <button
            onClick={() => setActiveQualityMode("transport")}
            className={cn(
              "w-full py-2.5 px-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold transition-all",
              activeQualityMode === "transport"
                ? "bg-[#CCFF00] text-gray-900 shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            )}
          >
            <Bus className="size-4" />
            <span>Транспорт</span>
          </button>

          <button
            onClick={() => setActiveQualityMode("comfort")}
            className={cn(
              "w-full py-2.5 px-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold transition-all",
              activeQualityMode === "comfort"
                ? "bg-[#CCFF00] text-gray-900 shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            )}
          >
            <Armchair className="size-4" />
            <span>Комфорт</span>
          </button>

          <button
            onClick={() => setActiveQualityMode("neighbors")}
            className={cn(
              "w-full py-2.5 px-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold transition-all",
              activeQualityMode === "neighbors"
                ? "bg-[#CCFF00] text-gray-900 shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            )}
          >
            <Users className="size-4" />
            <span>Соседи</span>
          </button>
        </div>

        <div className="hidden sm:flex absolute right-8 top-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-100 items-center gap-2 text-xs font-bold text-gray-800 pointer-events-auto">
          <Activity className="size-4 text-emerald-500 animate-pulse" />
          Тихо вечером
        </div>

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

        <div className="w-full sm:w-96 sm:absolute sm:right-8 sm:bottom-8 bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-2xl pointer-events-auto space-y-4 z-30">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-gray-900">
              Совместимость района — <span className="text-emerald-600">86%</span>
            </span>
            <span className="size-2.5 rounded-full bg-[#CCFF00]" />
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><Users className="size-3 text-emerald-600" /> Соседи</span>
                <span>86%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#CCFF00] rounded-full w-[86%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><Bus className="size-3 text-emerald-600" /> Транспорт</span>
                <span>78%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[78%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><Trees className="size-3 text-emerald-600" /> Экология</span>
                <span>92%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#CCFF00] rounded-full w-[92%]" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80",
              ].map((src, i) => (
                <img key={i} src={src} alt="avatar" className="size-7 rounded-full object-cover ring-2 ring-white" />
              ))}
              <div className="size-7 rounded-full bg-[#CCFF00] text-gray-900 font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                +10
              </div>
            </div>

            <button
              onClick={onNext}
              className="py-2 px-3.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl shadow-md transition-colors"
            >
              Перейти к квартире →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
