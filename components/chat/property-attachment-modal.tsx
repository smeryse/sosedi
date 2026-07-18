"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2, Check, Search, X } from "lucide-react";
import { demoProperties, formatRubles } from "@/data/demo";

interface PropertyAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty: (propertyId: string) => void;
}

export function PropertyAttachmentModal({
  isOpen,
  onClose,
  onSelectProperty,
}: PropertyAttachmentModalProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredProperties = demoProperties.filter((p) =>
    `${p.title} ${p.address} ${p.district}`
      .toLocaleLowerCase("ru")
      .includes(search.trim().toLocaleLowerCase("ru"))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-[24px] border border-[#E5E5E0] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-[#7B9E00]" />
            <h3 className="text-base font-extrabold text-[#111111]">
              Выберите квартиру для отправки в чат
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-[#6B6F66] hover:bg-[#F4F4F0] hover:text-[#111111]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="my-3 relative flex h-10 items-center rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-3">
          <Search className="mr-2 size-4 text-[#878881]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск объекта по адресу..."
            className="w-full bg-transparent text-xs outline-none text-[#111111] placeholder:text-[#878881]"
          />
        </div>

        {/* Properties list */}
        <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              onClick={() => {
                onSelectProperty(property.id);
                onClose();
              }}
              className="group flex cursor-pointer items-center gap-3 rounded-[16px] border border-[#E5E5E0] p-2.5 transition-all hover:border-[#111111] hover:bg-[#F9F9F6]"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-[12px] bg-gray-100">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-[#111111]">{property.title}</p>
                <p className="mt-0.5 text-[11px] text-[#6B6F66] truncate">{property.address}</p>
                <p className="mt-1 text-[11px] font-bold text-[#7B9E00]">
                  {formatRubles(property.price)} / мес.
                </p>
              </div>
              <button
                type="button"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-[#EBF7B6] text-[#111111] opacity-90 group-hover:opacity-100"
              >
                <Check className="size-4" />
              </button>
            </div>
          ))}

          {!filteredProperties.length && (
            <p className="py-8 text-center text-xs text-[#6B6F66]">Квартиры не найдены</p>
          )}
        </div>
      </div>
    </div>
  );
}
