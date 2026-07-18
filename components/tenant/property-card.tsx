"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { DemoProperty } from "@/data/demo";
import { formatRubles } from "@/data/demo";
import { HeartButton } from "@/components/favorites-context";

export function PropertyCard({ property }: { property: DemoProperty; favorite?: boolean; onFavorite?: (id: string) => void }) {
  return (
    <article className="group overflow-hidden rounded-[20px] border border-[#E5E5E0] bg-white shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-extrabold text-white">
            {property.match}% группе
          </span>
          <HeartButton type="property" id={property.id} size="md" />
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-[#111111]">{property.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#6B6F66]">
              <MapPin className="size-3.5 text-[#7B9E00]" />
              {property.district}
            </p>
          </div>
          <span className="whitespace-nowrap text-sm font-black text-[#111111]">
            {formatRubles(property.price)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-[#6B6F66]">
          <span>{property.rooms} комн. · {property.area} м²</span>
          <Link
            href={`/app/housing/${property.id}`}
            className="font-extrabold text-[#111111] hover:text-[#7B9E00] transition-colors"
          >
            Подробнее →
          </Link>
        </div>
      </div>
    </article>
  );
}
