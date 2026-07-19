import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Heart, MapPin, MessageCircle, UsersRound } from "lucide-react";
import { demoProperties, formatRubles } from "@/data/demo";
import { PageFrame } from "@/components/tenant/page-frame";
import { notFound } from "next/navigation";
import { CoLivingLayout } from "@/components/tenant/co-living-layout";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = demoProperties.find((item) => item.id === id);

  if (!property) notFound();

  return (
    <PageFrame
      backHref="/app/housing"
      backLabel="К каталогу жилья"
      title={property.title}
      description={`${property.district} · ${property.rooms} комн. · ${property.area} м²`}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[24px] border bg-surface">
            <div className="relative h-[300px] sm:h-[460px]">
              <Image
                src={property.image}
                alt={property.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="text-2xl font-extrabold">
                  {formatRubles(property.price)}{" "}
                  <span className="text-sm font-medium text-muted-foreground">/ месяц</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-[hsl(var(--accent-hover))]" /> {property.address}, {property.district}
                </p>
              </div>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full border hover:bg-surface-muted"
                aria-label="Сохранить квартиру"
              >
                <Heart className="size-5" />
              </button>
            </div>
          </div>

          <section className="surface-card p-5">
            <h2 className="text-base font-extrabold">О квартире</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Реальное объявление из Краснодара, выгруженное с платформы ЦИАН. Светлое жильё с хорошей транспортной доступностью.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Комнаты", `${property.rooms}`],
                ["Площадь", `${property.area} м²`],
                ["Этаж", property.floor],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[14px] bg-surface-muted p-3">
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-extrabold">{value}</p>
                </div>
              ))}
            </div>

            {property.tags && property.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t">
                {property.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          <CoLivingLayout
            price={property.price}
            rooms={property.rooms}
            area={property.area}
            propertyId={property.id}
          />
        </div>

        <aside className="space-y-4">
          <section className="surface-card p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[hsl(var(--accent-hover))]">
              Подходит группе
            </p>
            <p className="mt-2 text-5xl font-extrabold tracking-[-0.06em]">{property.match}%</p>
            <div className="mt-4 space-y-3">
              {[
                "Бюджет группы проходит",
                "Достаточно отдельных комнат",
                "Район в приоритетах",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2 text-xs">
                  <Check className="size-4 text-[hsl(var(--accent-hover))]" /> {item}
                </p>
              ))}
            </div>
          </section>

          {property.cianUrl && (
            <a
              href={property.cianUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-[#005BFF]/30 bg-[#005BFF]/10 px-4 py-3 text-xs font-extrabold text-[#005BFF] hover:bg-[#005BFF]/20 transition-colors"
            >
              <ExternalLink className="size-4" /> Открыть объявление на ЦИАН ↗
            </a>
          )}

          <Link
            href={`/app/applications/new?property=${property.id}`}
            className="lime-button flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold"
          >
            <UsersRound className="size-4" /> Подать заявку группой
          </Link>
          <Link
            href={`/app/messages/${property.id}`}
            className="flex items-center justify-center gap-2 rounded-full border bg-surface px-4 py-3 text-xs font-extrabold"
          >
            <MessageCircle className="size-4" /> Задать вопрос
          </Link>
          <Link
            href="/app/housing"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground"
          >
            <ArrowLeft className="size-4" /> Вернуться к объектам
          </Link>
        </aside>
      </div>
    </PageFrame>
  );
}
