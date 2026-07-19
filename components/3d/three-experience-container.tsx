"use client";

import { useThreeDemoStore } from "@/lib/3d-demo-store";
import { CityMapScreen } from "./city-map-screen";
import { QualityOfLifeScreen } from "./quality-of-life-screen";
import { ApartmentTourScreen } from "./apartment-tour-screen";
import { RoomAssignmentScreen } from "./room-assignment-screen";
import { ColivingMinigameScreen } from "./coliving-minigame-screen";
import { Map, Layers, Home, Grid, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThreeExperienceContainer() {
  const { activeStep, setActiveStep } = useThreeDemoStore();

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-gray-900 font-sans">
      {/* Active Screen Render */}
      {activeStep === 1 && (
        <CityMapScreen
          onSelectApartment={() => setActiveStep(2)}
          onNextScreen={() => setActiveStep(2)}
        />
      )}

      {activeStep === 2 && (
        <QualityOfLifeScreen
          onBack={() => setActiveStep(1)}
          onNext={() => setActiveStep(3)}
        />
      )}

      {activeStep === 3 && (
        <ApartmentTourScreen
          onBack={() => setActiveStep(2)}
          onSelectApartment={() => setActiveStep(4)}
        />
      )}

      {activeStep === 4 && (
        <RoomAssignmentScreen
          onBack={() => setActiveStep(3)}
          onConfirmAssignment={() => setActiveStep(5)}
        />
      )}

      {activeStep === 5 && (
        <ColivingMinigameScreen
          onBack={() => setActiveStep(4)}
          onFinishGame={(score) => {
            alert(`Поздравляем! Ваша бронь оформлена. Рассчитанная совместимость жильцов: ${score}%!`);
            setActiveStep(1);
          }}
        />
      )}

      {/* Floating Bottom Step Bar */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-2xl px-3 sm:px-4 py-2 rounded-full border border-gray-800 shadow-2xl flex items-center gap-1 sm:gap-2 text-white max-w-[95vw] overflow-x-auto">
        {[
          { step: 1, label: "1. MapLibre 3D", icon: Map },
          { step: 2, label: "2. Качество жизни", icon: Layers },
          { step: 3, label: "3. 3D-Квартира", icon: Home },
          { step: 4, label: "4. Комнаты (3 спальни)", icon: Grid },
          { step: 5, label: "5. Динамическая игра", icon: Gamepad2 },
        ].map(({ step, label, icon: Icon }) => (
          <button
            key={step}
            onClick={() => setActiveStep(step as 1 | 2 | 3 | 4 | 5)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap",
              activeStep === step
                ? "bg-[#CCFF00] text-gray-900 shadow-lg scale-105"
                : "text-gray-400 hover:text-white hover:bg-gray-800/80"
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
