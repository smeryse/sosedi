import { Heart } from "lucide-react";
import { FavoriteGrid } from "@/components/tenant/favorite-grid";
import { PageFrame } from "@/components/tenant/page-frame";

export default function FavoritesPage() { return <PageFrame title="Избранное" description="Сохранённые люди и объекты — в одном месте, чтобы не терять хорошие варианты."><div className="flex items-center gap-2 rounded-[18px] border bg-surface p-4 text-xs text-muted-foreground"><Heart className="size-4 text-rose-500" /> Нажмите на сердечко ещё раз, чтобы убрать карточку.</div><FavoriteGrid /></PageFrame>; }
