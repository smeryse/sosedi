"use client";

import { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";

interface MapPrimitiveBaseProps {
  map: maplibregl.Map | null;
}

export interface MapMarkerProps extends MapPrimitiveBaseProps {
  longitude: number;
  latitude: number;
  color?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function MapMarker({ map, longitude, latitude, color = "#CCFF00", onClick, children }: MapMarkerProps) {
  useEffect(() => {
    if (!map) return;

    const el = document.createElement("div");
    el.className = "mapcn-marker-container cursor-pointer transition-transform hover:scale-110";

    if (children) {
      // Custom React / HTML element rendering inside Marker
      const container = document.createElement("div");
      el.appendChild(container);
    } else {
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.backgroundColor = color;
      el.style.borderRadius = "50%";
      el.style.border = "3px solid #0f172a";
      el.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    }

    if (onClick) {
      el.addEventListener("click", onClick);
    }

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => {
      if (onClick) el.removeEventListener("click", onClick);
      marker.remove();
    };
  }, [map, longitude, latitude, color, onClick, children]);

  return null;
}

export interface MapPopupProps extends MapPrimitiveBaseProps {
  longitude: number;
  latitude: number;
  onClose?: () => void;
  children: React.ReactNode;
}

export function MapPopup({ map, longitude, latitude, onClose, children }: MapPopupProps) {
  useEffect(() => {
    if (!map) return;

    const div = document.createElement("div");
    div.className = "p-2 font-sans text-xs font-bold text-gray-900";

    const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
      .setLngLat([longitude, latitude])
      .setDOMContent(div)
      .addTo(map);

    if (onClose) {
      popup.on("close", onClose);
    }

    return () => {
      popup.remove();
    };
  }, [map, longitude, latitude, onClose, children]);

  return null;
}

export interface MapZoomControlProps extends MapPrimitiveBaseProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function MapZoomControl({ map, position = "top-right" }: MapZoomControlProps) {
  useEffect(() => {
    if (!map) return;
    const nav = new maplibregl.NavigationControl({ showCompass: true, showZoom: true });
    map.addControl(nav, position);
    return () => {
      map.removeControl(nav);
    };
  }, [map, position]);

  return null;
}

export interface MapFullscreenControlProps extends MapPrimitiveBaseProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function MapFullscreenControl({ map, position = "top-right" }: MapFullscreenControlProps) {
  useEffect(() => {
    if (!map) return;
    const fs = new maplibregl.FullscreenControl();
    map.addControl(fs, position);
    return () => {
      map.removeControl(fs);
    };
  }, [map, position]);

  return null;
}
