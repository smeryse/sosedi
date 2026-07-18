"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getRepository } from "@/lib/repositories";
import type { DemoState } from "@/lib/repositories/types";
import { Heart } from "lucide-react";

type FavoriteItem = { type: "profile" | "property"; id: string };

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (type: "profile" | "property", id: string) => boolean;
  toggleFavorite: (type: "profile" | "property", id: string) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getRepository()
      .getState()
      .then((state: DemoState) => {
        if (isMounted && state.favorites) {
          setFavorites(state.favorites);
        }
      })
      .catch((err) => console.error("Failed to load favorites:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const isFavorite = (type: "profile" | "property", id: string) => {
    return favorites.some((f) => f.type === type && f.id === id);
  };

  const toggleFavorite = async (type: "profile" | "property", id: string) => {
    // Optimistic update
    const currentlyFav = isFavorite(type, id);
    let nextFavorites: FavoriteItem[];
    if (currentlyFav) {
      nextFavorites = favorites.filter((f) => !(f.type === type && f.id === id));
    } else {
      nextFavorites = [...favorites, { type, id }];
    }
    setFavorites(nextFavorites);

    try {
      const newState = await getRepository().toggleFavorite(type, id);
      if (newState && newState.favorites) {
        setFavorites(newState.favorites);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      // Revert on error
      setFavorites(favorites);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}

export function HeartButton({
  type,
  id,
  className = "",
  size = "md",
}: {
  type: "profile" | "property";
  id: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(type, id);

  const iconSizes = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(type, id);
      }}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
      className={`grid place-items-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer ${
        size === "sm" ? "size-7" : size === "lg" ? "size-9" : "size-8"
      } ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-colors ${
          active ? "fill-[#FF3B30] text-[#FF3B30]" : "text-[#111111] hover:text-[#FF3B30]"
        }`}
      />
    </button>
  );
}
