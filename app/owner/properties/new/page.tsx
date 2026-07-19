import Link from "next/link";
import { PageFrame } from "@/components/tenant/page-frame";

export default function NewOwnerPropertyPage() {
  return (
    <PageFrame
      backHref="/owner/properties"
      title="Добавить объект"
      description="Заполните базовые данные — фотографии и правила можно будет дополнить позже."
    >
      <form className="max-w-2xl space-y-4">
        <div className="surface-card grid gap-4 p-5 sm:grid-cols-2">
          <label className="text-xs font-extrabold sm:col-span-2">
            Название
            <input
              required
              placeholder="Светлая квартира в центре"
              className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
            />
          </label>
          
          <label className="text-xs font-extrabold">
            Район
            <select className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal">
              <option>Центр</option>
              <option>Фестивальный</option>
              <option>Юбилейный</option>
            </select>
          </label>
          
          <label className="text-xs font-extrabold">
            Аренда в месяц
            <input
              required
              type="number"
              min="1000"
              placeholder="45000"
              className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
            />
          </label>
          
          <label className="text-xs font-extrabold">
            Комнаты
            <input
              required
              type="number"
              min="1"
              max="20"
              placeholder="2"
              className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
            />
          </label>
          
          <label className="text-xs font-extrabold">
            Площадь, м²
            <input
              required
              type="number"
              min="5"
              max="1000"
              placeholder="54"
              className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
            />
          </label>
          
          <label className="text-xs font-extrabold sm:col-span-2">
            Описание
            <textarea
              rows={5}
              placeholder="Что важно знать будущим жильцам?"
              className="mt-2 w-full rounded-[14px] border bg-background p-3 text-sm font-normal outline-none"
            />
          </label>
        </div>
        
        <button type="submit" className="lime-button rounded-full px-5 py-3 text-xs font-extrabold">
          Сохранить черновик
        </button>
      </form>
    </PageFrame>
  );
}
