import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { RoommateDirectory } from "@/components/tenant/roommate-directory";

export default function RoommatesPage() {
  return (
    <PageFrame
      eyebrow="Поиск"
      title="Найдите своего соседа"
      description="Соседи сравнивают не только бюджет. Мы учитываем режим дня, правила дома, привычки и то, как вы хотите чувствовать себя дома."
      actions={
        <Link
          href="/app/compatibility"
          className="lime-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold"
        >
          <Sparkles className="size-4" /> Заполнить анкету
        </Link>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[18px] border border-[#E5E5E0] bg-white p-4 shadow-sm">
          <CheckCircle2 className="size-5 text-[#7B9E00]" />
          <p className="mt-3 text-sm font-extrabold text-[#111111]">Совместимость 90%+</p>
          <p className="mt-1 text-xs leading-5 text-[#6B6F66]">Показываем причины совпадения, а не только цифру.</p>
        </div>
        <div className="rounded-[18px] border border-[#E5E5E0] bg-white p-4 shadow-sm">
          <CheckCircle2 className="size-5 text-[#7B9E00]" />
          <p className="mt-3 text-sm font-extrabold text-[#111111]">Безопасное знакомство</p>
          <p className="mt-1 text-xs leading-5 text-[#6B6F66]">Профиль можно подтвердить и скрыть личные контакты.</p>
        </div>
        <div className="rounded-[18px] border border-[#E5E5E0] bg-white p-4 shadow-sm">
          <CheckCircle2 className="size-5 text-[#7B9E00]" />
          <p className="mt-3 text-sm font-extrabold text-[#111111]">Готовая группа</p>
          <p className="mt-1 text-xs leading-5 text-[#6B6F66]">Соберите команду до 4 человек для общей заявки.</p>
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
