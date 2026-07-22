import type { Metadata } from "next";
import { Check, Flag, LockKeyhole, ShieldCheck } from "lucide-react";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Безопасность",
  description: "Как безопасно искать жильё и соседей в сервисе «Соседи».",
};

const safetyItems = [
  {
    title: "Проверяйте до оплаты",
    description:
      "Осмотрите жильё, проверьте документы и полномочия владельца, зафиксируйте условия в договоре. Не переводите предоплату под давлением.",
    icon: ShieldCheck,
  },
  {
    title: "Берегите личные данные",
    description:
      "Не отправляйте коды входа, данные карты и полные копии документов в чате. Передавайте чувствительные сведения только когда это действительно нужно.",
    icon: LockKeyhole,
  },
  {
    title: "Сообщайте о нарушениях",
    description:
      "Если вас торопят, просят оплатить сомнительным способом, угрожают или публикуют ложные данные — прекратите общение и отправьте жалобу.",
    icon: Flag,
  },
];

export default function SafetyPage() {
  return (
    <LegalPage
      eyebrow="Безопасность"
      title="Спокойная аренда начинается с проверки."
      intro="Мы даём инструменты для поиска и общения, но важные решения остаются за людьми. Эти правила помогают заметить риск до сделки."
    >
      {safetyItems.map((item) => {
        const Icon = item.icon;
        return (
          <section
            key={item.title}
            className="flex gap-4 rounded-[24px] border border-black/10 bg-[#FFFFFC] p-5 sm:p-7"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#D6FF3F]">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-black">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-black/65">{item.description}</p>
            </div>
          </section>
        );
      })}

      <section className="rounded-[24px] bg-[#111111] p-5 text-white sm:p-7">
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 size-5 shrink-0 text-[#D6FF3F]" aria-hidden="true" />
          <div>
            <h2 className="font-black">Нужна помощь?</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Напишите на{" "}
              <a
                className="font-bold text-white underline underline-offset-4"
                href="mailto:hello@sosedi.app"
              >
                hello@sosedi.app
              </a>
              . Если есть непосредственная угроза жизни или имуществу, обратитесь в
              экстренные службы.
            </p>
          </div>
        </div>
      </section>
    </LegalPage>
  );
}
