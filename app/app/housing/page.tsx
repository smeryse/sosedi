import Link from "next/link";
import { UsersRound } from "lucide-react";
import { PropertyDirectory } from "@/components/tenant/property-directory";

export default function HousingPage() {
  return (
    <div className="space-y-4">
      <header className="flex min-h-[68px] items-end justify-between gap-5">
        <div>
          <h1 className="text-[clamp(1.75rem,2.4vw,2.35rem)] font-extrabold leading-none tracking-[-0.05em]">Поиск жилья</h1>
          <p className="mt-2 text-[11px] leading-5 text-[#73746D]">Квартиры и комнаты, подходящие вашему бюджету и составу группы.</p>
        </div>
        <Link href="/app/group" className="hidden h-10 items-center gap-2 rounded-full bg-white px-4 text-[10px] font-bold shadow-[inset_0_0_0_1px_#E5E5E0] sm:inline-flex">
          <UsersRound className="size-4" /> Моя группа
        </Link>
      </header>
      <PropertyDirectory />
    </div>
  );
}
