"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import type { DemoRoommate } from "@/data/demo";
import { formatRubles } from "@/data/demo";
import { HeartButton } from "@/components/favorites-context";

export function PersonCard({ person }: { person: DemoRoommate; favorite?: boolean; onFavorite?: (id: string) => void }) {
  return (
    <article className="group overflow-hidden rounded-[20px] border border-[#E5E5E0] bg-white shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={person.image}
          alt={`${person.name}, ${person.age} лет`}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#B3DB00] px-2.5 py-1 text-[10px] font-extrabold text-[#111111] shadow-sm">
            <Sparkles className="size-3" /> {person.compatibility}%
          </span>
          <HeartButton type="profile" id={person.id} size="md" />
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-[#111111]">{person.name}, {person.age}</h2>
            <p className="mt-1 text-xs text-[#6B6F66]">{person.job}</p>
          </div>
          <span className="text-right text-[11px] font-bold text-[#111111]">
            {formatRubles(person.budget)}
            <span className="block text-[10px] font-normal text-[#6B6F66]">на человека</span>
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-[#6B6F66]">
          <MapPin className="size-3.5 text-[#7B9E00]" /> {person.district}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {person.traits.map((trait) => (
            <span key={trait} className="rounded-full bg-[#F4F4F0] px-2.5 py-1 text-[10px] font-bold text-[#111111]">
              {trait}
            </span>
          ))}
        </div>
        <Link
          href={`/app/roommates/${person.id}`}
          className="inline-flex w-full items-center justify-center rounded-full border border-[#E5E5E0] bg-white py-2.5 text-xs font-extrabold text-[#111111] transition-colors hover:bg-[#F4F4F0]"
        >
          Открыть профиль
        </Link>
      </div>
    </article>
  );
}
