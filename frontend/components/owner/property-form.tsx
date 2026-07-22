"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ImagePlus, Loader2, ShieldCheck } from "lucide-react";
import { createProperty } from "@/app/actions/properties";

type SignedUpload = {
  uploadUrl: string;
  objectKey: string;
  requiredHeaders: Record<string, string>;
};

async function sha256Base64(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  const bytes = new Uint8Array(digest);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary);
}

async function uploadPropertyImage(propertyId: string, file: File): Promise<void> {
  const checksumSha256 = await sha256Base64(file);
  const signedResponse = await fetch(`/api/properties/${propertyId}/images`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      checksumSha256,
    }),
  });
  const signedBody = await signedResponse.json() as SignedUpload & { error?: string };
  if (!signedResponse.ok) throw new Error(signedBody.error ?? "Не удалось подготовить загрузку");
  const uploadResponse = await fetch(signedBody.uploadUrl, {
    method: "PUT",
    headers: signedBody.requiredHeaders,
    body: file,
  });
  if (!uploadResponse.ok) throw new Error("Хранилище не приняло фотографию");
  const completeResponse = await fetch(`/api/properties/${propertyId}/images`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      objectKey: signedBody.objectKey,
      altText: file.name.replace(/\.[^.]+$/, ""),
      mimeType: file.type,
      size: file.size,
      checksumSha256,
    }),
  });
  const completeBody = await completeResponse.json() as { error?: string };
  if (!completeResponse.ok) throw new Error(completeBody.error ?? "Не удалось подтвердить фотографию");
}

const inputClass =
  "mt-2 min-h-12 w-full rounded-[14px] border border-border bg-background px-3 text-sm font-medium outline-none transition focus:border-[hsl(var(--accent-hover))] focus:ring-4 focus:ring-[hsl(var(--accent-soft))]";

export function PropertyForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    setProgress(0);
    try {
      const data = new FormData(event.currentTarget);
      const property = await createProperty({
        title: String(data.get("title") ?? ""),
        description: String(data.get("description") ?? ""),
        city: String(data.get("city") ?? "Краснодар"),
        district: String(data.get("district") ?? ""),
        address: String(data.get("address") ?? ""),
        monthlyRent: Number(data.get("monthlyRent")),
        deposit: Number(data.get("deposit")),
        rooms: Number(data.get("rooms")),
        area: Number(data.get("area")),
        floor: data.get("floor") ? Number(data.get("floor")) : undefined,
        totalFloors: data.get("totalFloors") ? Number(data.get("totalFloors")) : undefined,
        availableFrom: String(data.get("availableFrom") || "") || undefined,
        leaseMonthsMin: Number(data.get("leaseMonthsMin") || 6),
        petsAllowed: data.get("petsAllowed") === "on",
        smokingAllowed: data.get("smokingAllowed") === "on",
        furnished: data.get("furnished") === "on",
      });
      for (let index = 0; index < files.length; index += 1) {
        await uploadPropertyImage(property.id, files[index]);
        setProgress(index + 1);
      }
      router.push(`/owner/properties/${property.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось сохранить объект");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-5">
      <section className="surface-card grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 flex items-start gap-3 border-b pb-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
            <Building2 className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold">Основные данные</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Укажите точные условия. Адрес и контакты защищены до отклика.</p>
          </div>
        </div>

        <label className="text-xs font-extrabold sm:col-span-2">
          Название
          <input name="title" required minLength={4} maxLength={160} placeholder="Светлая трёхкомнатная квартира в центре" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold">
          Город
          <input name="city" required defaultValue="Краснодар" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold">
          Район
          <input name="district" required placeholder="Центральный район" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold sm:col-span-2">
          Адрес
          <input name="address" required placeholder="ул. Северная, д. 426" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold">
          Аренда в месяц, ₽
          <input name="monthlyRent" required type="number" min="1000" step="100" placeholder="45000" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold">
          Залог, ₽
          <input name="deposit" required type="number" min="0" step="100" defaultValue="0" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold">
          Комнаты
          <input name="rooms" required type="number" min="1" max="100" placeholder="3" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold">
          Площадь, м²
          <input name="area" required type="number" min="5" max="5000" step="0.1" placeholder="72" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold">
          Этаж
          <input name="floor" type="number" min="-5" max="200" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold">
          Этажей в доме
          <input name="totalFloors" type="number" min="1" max="200" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold">
          Доступно с
          <input name="availableFrom" type="date" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold">
          Минимальный срок, месяцев
          <input name="leaseMonthsMin" type="number" min="1" max="120" defaultValue="6" className={inputClass} />
        </label>
        <label className="text-xs font-extrabold sm:col-span-2">
          Описание
          <textarea name="description" rows={6} maxLength={5000} placeholder="Расскажите о квартире, доме и важных условиях" className={`${inputClass} py-3`} />
        </label>
        <div className="sm:col-span-2 grid gap-2 sm:grid-cols-3">
          {[
            ["furnished", "Есть мебель"],
            ["petsAllowed", "Можно с животными"],
            ["smokingAllowed", "Курение разрешено"],
          ].map(([name, label]) => (
            <label key={name} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[14px] border px-3 text-xs font-bold">
              <input name={name} type="checkbox" className="size-4 accent-[hsl(var(--accent-hover))]" /> {label}
            </label>
          ))}
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="flex items-start gap-3">
          <ImagePlus className="mt-0.5 size-5 text-[hsl(var(--accent-hover))]" />
          <div>
            <h2 className="text-sm font-extrabold">Фотографии</h2>
            <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG или WebP до 10 МБ. Первая фотография станет обложкой.</p>
          </div>
        </div>
        <input
          className="mt-4 block min-h-12 w-full rounded-[14px] border p-3 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-[hsl(var(--accent-soft))] file:px-4 file:py-2 file:font-extrabold"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 30))}
        />
        {previews.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map(({ file, url }, index) => (
              <figure key={`${file.name}-${file.lastModified}`} className="relative aspect-square overflow-hidden rounded-[12px] border bg-surface-muted">
                {/* Browser-created previews are intentionally rendered with img. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
                {index === 0 ? <figcaption className="absolute bottom-1 left-1 rounded-full bg-black/75 px-2 py-1 text-[9px] font-bold text-white">Обложка</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : null}
      </section>

      <div className="surface-card flex items-start gap-3 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[hsl(var(--accent-hover))]" />
        <p className="leading-5">Объект сохранится как черновик. Для публикации добавьте фото и отправьте его на модерацию.</p>
      </div>
      {error ? <p role="alert" className="rounded-[14px] border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      <button type="submit" disabled={submitting} className="lime-button inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-xs font-extrabold disabled:opacity-60">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        {submitting ? (files.length ? `Загружено ${progress} из ${files.length}` : "Сохраняем…") : "Сохранить черновик"}
      </button>
    </form>
  );
}
