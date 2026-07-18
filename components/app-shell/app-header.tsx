import Link from "next/link";
import { Bell, ChevronDown, Heart, Menu, Plus, Search } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AvatarImage } from "@/components/ui/avatar-image";

export function AppHeader({ owner = false }: { owner?: boolean }) {
  return (
    <header className="sticky top-0 z-30 h-[80px] bg-background px-4 pt-3 sm:px-5">
      <div className="mx-auto flex h-[64px] w-full max-w-[1668px] items-center gap-4 rounded-[20px] bg-white px-4 shadow-[inset_0_0_0_1px_#E5E5E0] sm:px-5">
        <BrandLogo className="lg:hidden [&_img]:h-auto [&_img]:w-[108px]" />
        <label className="hidden h-10 max-w-[620px] flex-1 items-center gap-3 rounded-full bg-[#F4F4F0] px-4 text-muted-foreground sm:flex">
          <Search className="size-[17px] stroke-[1.7]" />
          <span className="sr-only">Поиск по платформе</span>
          <input
            type="search"
            placeholder={
              owner
                ? "Поиск по объектам и заявкам"
                : "Поиск по людям, районам и объявлениям"
            }
            className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-[#878881]"
          />
        </label>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href={owner ? "/owner/properties/new" : "/app/group/create"}
            className="lime-button hidden h-10 items-center gap-2 rounded-full px-5 text-[11px] font-extrabold md:inline-flex"
          >
            <Plus className="size-4" />
            {owner ? "Добавить объект" : "Создать группу"}
          </Link>
          <Link
            href="/app/favorites"
            aria-label="Избранное"
            className="grid size-10 place-items-center rounded-full hover:bg-[#F4F4F0]"
          >
            <Heart className="size-[18px]" />
          </Link>
          <Link
            href="/app/notifications"
            aria-label="Уведомления: 5 новых"
            className="relative grid size-10 place-items-center rounded-full hover:bg-[#F4F4F0]"
          >
            <Bell className="size-[18px]" />
            <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[hsl(var(--accent))] text-[8px] font-extrabold">
              5
            </span>
          </Link>
          <Link
            href="/app/profile"
            className="hidden items-center gap-2 rounded-full p-1.5 pl-2 hover:bg-[#F4F4F0] sm:flex"
          >
            <AvatarImage
              src="/demo/people/maria.jpg"
              name="Анна Смирнова"
              size={32}
              className="size-8"
            />
            <span className="hidden text-[11px] font-bold xl:inline">Анна</span>
            <ChevronDown className="size-3.5" />
          </Link>
          <button
            type="button"
            aria-label="Открыть меню"
            className="grid size-10 place-items-center rounded-full hover:bg-[#F4F4F0] lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
