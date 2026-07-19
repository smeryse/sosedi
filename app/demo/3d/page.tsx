import { Metadata } from "next";
import { ThreeExperienceContainer } from "@/components/3d/three-experience-container";

export const metadata: Metadata = {
  title: "3D Интерактивный опыт выбора жилья — Соседи",
  description: "Интерактивная 3D-карта Краснодара, планировка квартир, распределение комнат и симулятор совместимости жильцов.",
};

export default function ThreeDemoPage() {
  return <ThreeExperienceContainer />;
}
