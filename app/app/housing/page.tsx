import { Suspense } from "react";
import { PropertyDirectory } from "@/components/tenant/property-directory";

export default function HousingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-[#6B6F66]">Загрузка каталога жилья...</div>}>
      <PropertyDirectory />
    </Suspense>
  );
}
