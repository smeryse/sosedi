import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { RoommateDirectory } from "@/components/tenant/roommate-directory";
import { AvatarImage } from "@/components/ui/avatar-image";
import { demoRoommates } from "@/data/demo";

export default function RoommatesPage() {
  return (
    <PageFrame
      title="Поиск соседей"
      description="Подбираем людей по образу жизни и бюджету для комфортного совместного проживания."
      actions={
        <Link
          href="/app/compatibility"
          className="lime-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold"
        >
          <Sparkles className="size-4" /> Заполнить анкету
        </Link>
      }
    >
      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black">Лучшие совпадения</p>
          <p className="mt-1 text-[10px] text-[#6B6F66]">На основе вашей анкеты совместимости</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {demoRoommates.slice(0, 5).map((person) => (
            <Link key={person.id} href={`/app/roommates/${person.id}`} className="group relative shrink-0 overflow-hidden rounded-[14px]">
              <AvatarImage src={person.image} name={person.name} size={58} className="size-[58px] rounded-[14px] transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-black">{person.compatibility}%</span>
            </Link>
          ))}
          <Link href="/app/roommates/compare" className="ml-1 whitespace-nowrap text-[10px] font-black text-[#7B9E00]">Смотреть все →</Link>
        </div>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-[#6B6F66]">Загрузка соседей...</div>}>
        <RoommateDirectory />
      </Suspense>
      <Link
        href="/app/roommates/compare"
        className="inline-flex items-center gap-2 text-xs font-extrabold text-[#6B6F66] hover:text-[#111111]"
      >
        Сравнить выбранных соседей <ArrowRight className="size-4" />
      </Link>
    </PageFrame>
  );
}
