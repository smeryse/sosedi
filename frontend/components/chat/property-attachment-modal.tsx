"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const filteredProperties = demoProperties.filter((p) =>
    `${p.title} ${p.address} ${p.district}`
      .toLocaleLowerCase("ru")
      .includes(search.trim().toLocaleLowerCase("ru"))
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop overlay listener */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[24px] border border-[#E5E5E0] bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-full bg-[#EBF7B6] text-[#7B9E00]">
              <Building2 className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#111111]">
                Прикрепить квартиру к сообщению
              </h3>
              <p className="text-[11px] text-[#6B6F66]">
                Выберите жильё для обсуждения с сожителями
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-[#6B6F66] transition-colors hover:bg-[#F4F4F0] hover:text-[#111111]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="my-3.5 relative flex h-10 items-center rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-3.5">
          <Search className="mr-2 size-4 text-[#878881]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск объекта по названию или адресу..."
            className="w-full bg-transparent text-xs text-[#111111] placeholder:text-[#878881] outline-none"
          />
        </div>

        {/* Properties list */}
        <div className="max-h-[360px] space-y-2.5 overflow-y-auto pr-1 soft-scrollbar">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              onClick={() => {
                onSelectProperty(property.id);
                onClose();
              }}
              className="group flex cursor-pointer items-center gap-3.5 rounded-[18px] border border-[#E5E5E0] p-3 transition-all hover:border-[#111111] hover:bg-[#F9F9F6] hover:shadow-sm"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-[14px] bg-gray-100">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-[#111111] truncate">{property.title}</p>
                <p className="mt-0.5 text-[11px] text-[#6B6F66] truncate">{property.address}</p>
                <p className="mt-1 text-[11px] font-extrabold text-[#7B9E00]">
                  {formatRubles(property.price)} / мес.
                </p>
              </div>
              <button
                type="button"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-[#EBF7B6] text-[#111111] opacity-90 transition-opacity group-hover:opacity-100"
              >
                <Check className="size-4" />
              </button>
            </div>
          ))}

          {!filteredProperties.length && (
            <div className="py-10 text-center">
              <p className="text-xs font-bold text-[#6B6F66]">Квартиры не найдены</p>
              <p className="mt-1 text-[11px] text-[#878881]">Попробуйте изменить поисковый запрос</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
