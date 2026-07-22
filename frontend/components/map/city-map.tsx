"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { StyleSpecification } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const points = [
  { label: "от 28 000 ₽", coordinates: [38.976, 45.035] as [number, number] },
  { label: "от 24 000 ₽", coordinates: [38.947, 45.062] as [number, number] },
  { label: "от 22 000 ₽", coordinates: [38.914, 45.039] as [number, number] },
  { label: "от 20 000 ₽", coordinates: [39.01, 45.013] as [number, number] },
];

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.72, "raster-brightness-max": 0.96, "raster-contrast": -0.08 } }],
};

export function CityMap({ className, interactive = true }: { className?: string; interactive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    if (!containerRef.current || mapRef.current) return;

    void import("maplibre-gl").then((maplibre) => {
      if (!active || !containerRef.current) return;
      const map = new maplibre.Map({
        container: containerRef.current,
        style: mapStyle,
        center: [38.976, 45.035],
        zoom: 11.35,
        attributionControl: false,
        interactive,
      });
      mapRef.current = map;
      map.on("load", () => setLoaded(true));
      if (interactive) map.addControl(new maplibre.NavigationControl({ showCompass: false }), "bottom-right");

      points.forEach((point, index) => {
        const marker = document.createElement("div");
        marker.className = index === 0 ? "sosedi-map-marker sosedi-map-marker--active" : "sosedi-map-marker";
        marker.textContent = point.label;
        new maplibre.Marker({ element: marker, anchor: "bottom" }).setLngLat(point.coordinates).addTo(map);
      });
    });

    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [interactive]);

  return (
    <div className={cn("relative overflow-hidden bg-[#ECEFE8]", className)}>
      <div
        aria-label="Карта Краснодара с подходящими квартирами"
        ref={containerRef}
        className={cn("absolute inset-0 transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
      />
      <div className={cn("pointer-events-none absolute inset-0 transition-opacity duration-300", loaded ? "opacity-0" : "opacity-100")}>
        <div className="absolute inset-0 bg-[#ECEFE8]" />
        <div className="absolute -left-[8%] top-[52%] h-14 w-[118%] -rotate-[11deg] bg-[#DDE7EA]" />
        <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(#DDE0D9_1px,transparent_1px),linear-gradient(90deg,#DDE0D9_1px,transparent_1px)] [background-size:42px_42px]" />
        <span className="absolute left-[46%] top-[42%] h-24 w-16 rotate-12 rounded-[45%_35%_52%_34%] bg-[hsl(var(--accent))]/35" />
        <span className="absolute left-5 top-5 rounded-full bg-white px-3 py-2 text-[10px] font-bold text-[#686A62] shadow-sm">Загружаем карту Краснодара…</span>
      </div>
    </div>
  );
}
