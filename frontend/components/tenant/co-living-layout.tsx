"use client";

import { useState } from "react";
import { ShieldCheck, Key } from "lucide-react";

interface CoLivingLayoutProps {
  price: number;
  rooms: number;
  area: number;
  propertyId?: string;
}

export function CoLivingLayout({ price, rooms, area }: CoLivingLayoutProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Calculate rooms details
  const isMultiRoom = rooms > 1;
  
  const room1Price = Math.round(price * 0.55);
  const room2Price = price - room1Price;

  const room1Area = Math.round(area * 0.45);
  const room2Area = Math.round(area * 0.35);

  const roomsList = [
    {
      id: "room-1",
      name: "Комната 1 (Мастер-спальня)",
      area: `${room1Area} м²`,
      price: room1Price,
      description: "Двуспальная кровать, шкаф-купе, панорамная лоджия, рабочая зона.",
      features: ["Шумоизоляция стен", "Электронный замок"],
      status: "vacant"
    },
    {
      id: "room-2",
      name: isMultiRoom ? "Комната 2 (Стандарт)" : "Зона Б (Купе-спальня)",
      area: `${room2Area} м²`,
      price: room2Price,
      description: isMultiRoom 
        ? "Полутороспальная кровать, письменный стол, комод." 
        : "Раскладной диван-кровать, трансформируемая перегородка, шкаф.",
      features: ["Электронный замок"],
      status: isMultiRoom ? "occupied" : "vacant",
      occupiedBy: isMultiRoom ? "Артём, 27 лет (разработчик)" : undefined
    }
  ];

  const formatPrice = (val: number) => {
    return val.toLocaleString("ru-RU") + " ₽";
  };

  return (
    <section className="surface-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-[#111111]">
            Планировка совместной аренды
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
            <ShieldCheck className="size-3 text-emerald-600" />
            CoLiving Ready
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-semibold">
          Стандарт АЗКК
        </span>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        Квартира сертифицирована Ассоциацией застройщиков для совместного проживания. Все спальни изолированы, оснащены индивидуальными замками и приборами учета коммунальных услуг.
      </p>

      <div className="grid gap-3 mt-3">
        {roomsList.map((room) => {
          const isSelected = selectedRoom === room.id;
          const isOccupied = room.status === "occupied";
          
          return (
            <div 
              key={room.id}
              onClick={() => {
                if (!isOccupied) {
                  setSelectedRoom(isSelected ? null : room.id);
                }
              }}
              className={`border rounded-[18px] p-4 text-left transition-all ${
                isOccupied 
                  ? "opacity-60 bg-surface-muted cursor-not-allowed border-border" 
                  : isSelected 
                    ? "border-[#8EAD00] bg-[#EBF7B6] cursor-pointer" 
                    : "bg-white hover:border-[#B3DB00] hover:bg-[#F8FBEA] cursor-pointer"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm text-[#111111]">
                    {room.name} · {room.area}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-4">
                    {room.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-sm text-[#111111]">
                    {formatPrice(room.price)}
                  </p>
                  <span className="text-[9px] text-muted-foreground block">в месяц</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[10px]">
                <div className="flex gap-2">
                  {room.features.map(f => (
                    <span key={f} className="inline-flex items-center gap-1 text-muted-foreground font-medium">
                      ✓ {f}
                    </span>
                  ))}
                </div>
                <div>
                  {isOccupied ? (
                    <span className="inline-flex rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 font-bold">
                      Занято: {room.occupiedBy}
                    </span>
                  ) : isSelected ? (
                    <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold">
                      Выбрано вами
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 font-bold border border-blue-100">
                      Свободно
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[14px] bg-surface-muted p-3 flex gap-3 text-xs leading-4">
        <Key className="size-4 shrink-0 text-[#7B9E00] mt-0.5" />
        <div>
          <p className="font-bold text-[#111111]">Умный доступ и ЖКХ</p>
          <p className="mt-0.5 text-muted-foreground text-[10px]">
            Каждому жильцу выдается цифровой ключ доступа в приложении. Расход электроэнергии и воды в комнатах рассчитывается раздельно по датчикам.
          </p>
        </div>
      </div>
    </section>
  );
}
