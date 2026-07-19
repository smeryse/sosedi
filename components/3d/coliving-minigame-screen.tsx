"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, Sun, Moon, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { GAME_SITUATIONS } from "@/lib/3d-demo-data";
import { useCommercial3DStore } from "@/lib/application/3d/store";
import { ConciergeVerdict } from "@/lib/infrastructure/ai/concierge-provider";
import { cn } from "@/lib/utils";

interface ColivingMinigameScreenProps {
  onBack: () => void;
  onFinishGame: (finalScore: number) => void;
}

export function ColivingMinigameScreen({ onBack, onFinishGame }: ColivingMinigameScreenProps) {
  const {
    gameAnswers,
    gameStepIndex,
    setGameAnswer,
    setGameStepIndex,
    compatibilityResult,
    resetGame,
    loadAIVerdict,
    aiVerdict,
  } = useCommercial3DStore();

  const [loadingAI, setLoadingAI] = useState(false);
  const currentSituation = GAME_SITUATIONS[gameStepIndex] || GAME_SITUATIONS[0];
  const isFinished = gameStepIndex >= GAME_SITUATIONS.length;

  useEffect(() => {
    if (isFinished && !aiVerdict) {
      setLoadingAI(true);
      void loadAIVerdict().finally(() => setLoadingAI(false));
    }
  }, [isFinished, aiVerdict, loadAIVerdict]);

  const handleSelectOption = (optionId: string) => {
    setGameAnswer(currentSituation.id, optionId);
  };

  const handleNextStep = () => {
    if (gameStepIndex < GAME_SITUATIONS.length - 1) {
      setGameStepIndex(gameStepIndex + 1);
    } else {
      setGameStepIndex(GAME_SITUATIONS.length);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#EBF0E6] overflow-hidden flex flex-col font-sans select-none">
      <div className="absolute inset-0 bg-[#E2E8DD] flex items-center justify-center p-2 sm:p-6">
        <div className="relative w-full max-w-5xl h-[65vh] sm:h-[550px] bg-white/70 rounded-3xl sm:rounded-[3rem] p-4 sm:p-6 shadow-2xl border-2 sm:border-4 border-white flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#BDCEB7_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

          <div className="relative w-full h-full flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 z-10 gap-4">
            <div className="relative w-full sm:w-1/2 h-full rounded-2xl sm:rounded-3xl bg-amber-50/40 border border-gray-200 p-3 sm:p-4 flex flex-col justify-end">
              <span className="absolute top-3 left-3 text-[10px] sm:text-xs font-bold text-gray-500">Кухня</span>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex flex-col items-center">
                  <div className="bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-800 shadow-md mb-1 border">
                    «Кто варщик кофе?» ☕
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                    alt="Roman"
                    className="size-12 sm:size-14 rounded-full object-cover ring-4 ring-[#CCFF00] shadow-xl"
                  />
                  <span className="text-[10px] sm:text-xs font-bold text-gray-900 mt-0.5">Роман</span>
                </div>

                <div className="relative flex flex-col items-center">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Ilya"
                    className="size-10 sm:size-12 rounded-full object-cover ring-2 ring-emerald-500 shadow-lg"
                  />
                  <span className="text-[10px] sm:text-xs font-bold text-gray-700 mt-0.5">Илья</span>
                </div>
              </div>
            </div>

            <div className="relative w-full sm:w-1/2 h-full rounded-2xl sm:rounded-3xl bg-emerald-50/30 border border-gray-200 p-3 sm:p-4 flex flex-col justify-end">
              <span className="absolute top-3 left-3 text-[10px] sm:text-xs font-bold text-gray-500">Гостиная</span>
              <div className="flex items-center justify-center mb-6">
                <div className="relative flex flex-col items-center">
                  <div className="bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-800 shadow-md mb-1 border">
                    «Предупреждай о гостях» 👍
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                    alt="Arina"
                    className="size-12 sm:size-14 rounded-full object-cover ring-4 ring-[#CCFF00] shadow-xl"
                  />
                  <span className="text-[10px] sm:text-xs font-bold text-gray-900 mt-0.5">Арина</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <header className="relative z-30 pt-4 px-4 sm:px-8 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-200/80"
          >
            <ArrowLeft className="size-4 sm:size-5" />
          </button>
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 font-heading">
            соседи<span className="text-[#CCFF00]">.</span>
          </span>
        </div>

        <h1 className="text-lg sm:text-3xl font-black text-gray-900 tracking-tight font-heading">
          Поживите вместе <span className="text-emerald-700">один день</span>
        </h1>
      </header>

      <main className="relative z-30 flex-1 px-4 sm:px-8 pt-4 pb-6 flex flex-col sm:flex-row justify-between pointer-events-none gap-4">
        <div className="hidden sm:block flex-1" />

        {!isFinished ? (
          <div className="w-full sm:w-[420px] bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-2xl pointer-events-auto flex flex-col justify-between z-30 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2 pt-1">
                <Sun className="size-4 text-amber-500" />
                <div className="flex-1 h-1 bg-gray-200 mx-3 rounded-full relative">
                  <div
                    style={{ left: `${(gameStepIndex / (GAME_SITUATIONS.length - 1)) * 100}%` }}
                    className="absolute -top-2.5 size-6 rounded-full bg-[#CCFF00] ring-4 ring-emerald-500/20 shadow-md flex items-center justify-center -translate-x-1/2"
                  >
                    <Moon className="size-3 text-gray-900" />
                  </div>
                </div>
                <Moon className="size-4 text-indigo-500" />
              </div>

              <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Ситуация {gameStepIndex + 1} из {GAME_SITUATIONS.length}
              </span>

              <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                {currentSituation.question}
              </h2>

              <div className="space-y-2">
                {currentSituation.options.map((opt) => {
                  const isSelected = gameAnswers[currentSituation.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={cn(
                        "w-full p-3 rounded-2xl text-left text-xs font-bold border transition-all flex items-center justify-between",
                        isSelected
                          ? "bg-[#CCFF00] border-[#99CC00] text-gray-900 shadow-md"
                          : "bg-gray-50/90 border-gray-200 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="size-4 text-gray-900" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNextStep}
                className="w-full py-3 px-4 bg-[#CCFF00] hover:bg-[#b8e600] text-gray-900 font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
              >
                <span>{gameStepIndex === GAME_SITUATIONS.length - 1 ? "Рассчитать вердикт AI" : "Продолжить"}</span>
              </button>
            </div>
          </div>
        ) : (
          /* AI Concierge Verdict Card */
          <div className="w-full sm:w-[440px] bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xl pointer-events-auto space-y-4 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-[#CCFF00] flex items-center justify-center text-gray-900 shadow-md">
                  <Sparkles className="size-5 text-emerald-950" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">Вердикт AI-Консьержа</h3>
                  <span className="text-xs text-emerald-600 font-bold">Zod Validated Structured AI</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 leading-none">
                  {compatibilityResult.overallScore}%
                </span>
              </div>
            </div>

            {loadingAI ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-gray-500 gap-2">
                <Loader2 className="size-4 animate-spin text-emerald-600" />
                <span>AI-Консьерж формирует объяснение...</span>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 space-y-2 text-xs max-h-[300px] overflow-y-auto">
                <p className="text-gray-800 leading-relaxed font-medium">
                  {aiVerdict?.summary || compatibilityResult.advice}
                </p>

                <div className="pt-2 border-t border-gray-200 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Почему квартира подходит:</span>
                  <p className="text-gray-700 text-[11px]">{aiVerdict?.whyFitsGroup}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Справедливая аренда:</span>
                  <p className="text-gray-700 text-[11px]">{aiVerdict?.fairRentExplanation}</p>
                </div>

                {compatibilityResult.highlights.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Совпадения:</span>
                    <div className="flex flex-wrap gap-1">
                      {compatibilityResult.highlights.map((h, i) => (
                        <span key={i} className="bg-[#CCFF00]/30 text-emerald-950 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={resetGame}
                className="py-3 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-1"
              >
                <RefreshCw className="size-3.5" />
              </button>
              <button
                onClick={() => onFinishGame(compatibilityResult.overallScore)}
                className="flex-1 py-3 px-4 bg-gray-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl"
              >
                <Check className="size-4 text-[#CCFF00]" />
                <span>Забронировать ({compatibilityResult.overallScore}%)</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
