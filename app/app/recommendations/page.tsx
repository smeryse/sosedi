import { Sparkles } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { getRepository } from "@/lib/repositories";
import { PersonCard } from "@/components/tenant/person-card";

export default async function RecommendationsPage() {
  const repo = getRepository();
  const roommates = await repo.listRoommates();
  // Filter for high compatibility
  const recommendations = roommates.filter((r) => r.compatibility >= 80);
  const displayRoommates = recommendations.length > 0 ? recommendations : roommates.slice(0, 4);

  // Calculate highest compatibility
  const highestMatch = displayRoommates.length > 0 ? displayRoommates[0].compatibility : 93;

  return (
    <PageFrame
      eyebrow="Для вас"
      title="Рекомендации"
      description="Подборка обновляется после каждого ответа в анкете и действия в каталоге."
    >
      <div className="rounded-[20px] bg-foreground p-5 text-background sm:flex sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 size-5 text-[hsl(var(--accent))]" />
          <div>
            <p className="text-sm font-extrabold">Подборка стала точнее</p>
            <p className="mt-1 text-xs leading-5 text-background/65">
              Мы нашли {displayRoommates.length} человек с совместимостью от 80%.
            </p>
          </div>
        </div>
        <span className="mt-4 text-3xl font-extrabold text-[hsl(var(--accent))] sm:mt-0">
          {highestMatch}%
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {displayRoommates.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
    </PageFrame>
  );
}
