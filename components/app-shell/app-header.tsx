import Link from "next/link";
import { Bell, ChevronDown, Heart, Menu, Plus, Search } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AvatarImage } from "@/components/ui/avatar-image";

export function AppHeader({ owner = false }: { owner?: boolean }) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center bg-[#F4F4F0] px-4 sm:px-6">
      <div className="flex h-full w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:hidden">
          <BrandLogo className="[&_img]:h-auto [&_img]:w-[112px]" />
        </div>

        <label className="hidden h-[46px] max-w-[580px] flex-1 items-center gap-3 rounded-full border border-[#E5E5E0] bg-white px-4 text-[#878881] shadow-sm transition-colors focus-within:border-[#B3DB00] sm:flex">
          <Search className="size-[18px] stroke-[1.8] text-[#878881]" />
          <span className="sr-only">Поиск по платформе</span>
          <input
            type="search"
            placeholder={
              owner
                ? "Поиск по объектам и заявкам..."
                : "Поиск по городам, районам, людям, объявлениям..."
            }
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#111111] outline-none placeholder:text-[#878881]"
          />
        </label>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href={owner ? "/owner/properties/new" : "/app/group/create"}
            className="lime-button hidden h-[44px] items-center gap-2 rounded-full px-5 text-[12.5px] font-extrabold shadow-sm transition-transform hover:scale-[1.02] md:inline-flex"
          >
            <Plus className="size-4 stroke-[2.5]" />
            {owner ? "Добавить объект" : "Создать объявление"}
          </Link>

          <Link
            href="/app/messages"
            aria-label="Сообщения: 2 новых"
            className="relative grid size-11 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm transition-colors hover:bg-[#F4F4F0]"
          >
            <span className="sr-only">Сообщения</span>
            <svg className="size-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008H8.625V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zM21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-[#B3DB00] text-[9px] font-black text-[#111111]">
              2
            </span>
          </Link>

          <Link
            href="/app/notifications"
            aria-label="Уведомления: 5 новых"
            className="relative grid size-11 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm transition-colors hover:bg-[#F4F4F0]"
          >
            <Bell className="size-[19px] stroke-[1.8]" />
            <span className="absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-[#B3DB00] text-[9px] font-black text-[#111111]">
              5
            </span>
          </Link>

          <Link
            href="/app/profile"
            className="flex items-center gap-2.5 rounded-full border border-[#E5E5E0] bg-white p-1 pr-3.5 shadow-sm transition-colors hover:bg-[#F4F4F0]"
          >
            <AvatarImage
              src="/demo/people/maria.jpg"
              name="Анна Смирнова"
              size={36}
              className="size-[36px]"
            />
            <ChevronDown className="size-4 text-[#777871]" />
          </Link>

          <button
            type="button"
            aria-label="Открыть меню"
            className="grid size-11 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm hover:bg-[#F4F4F0] lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
