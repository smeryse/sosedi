"use client";

import { useState } from "react";
import { Play, Pause, Volume2, Sparkles } from "lucide-react";

interface VoiceMessagePlayerProps {
  originalAudioUrl: string;
  bnrAudioUrl?: string;
  duration?: string;
}

export function VoiceMessagePlayer({
  originalAudioUrl,
  bnrAudioUrl,
  duration = "0:15",
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [useBnr, setUseBnr] = useState(false);

  const activeUrl = useBnr && bnrAudioUrl ? bnrAudioUrl : originalAudioUrl;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col space-y-2 rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm backdrop-blur-xl max-w-xs">
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex size-10 items-center justify-center rounded-full bg-[#7B9E00] text-white shadow-md hover:bg-[#688500] transition-transform active:scale-95"
        >
          {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
        </button>

        {/* Waveform Visualization Placeholder */}
        <div className="flex flex-1 items-center space-x-1 h-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all ${
                isPlaying ? "animate-pulse bg-[#7B9E00]" : "bg-[#E5E5E0]"
              }`}
              style={{
                height: `${Math.sin(i * 0.5) * 10 + 14}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        <span className="text-[11px] font-medium text-[#878881]">{duration}</span>
      </div>

      {/* Single BNR Toggle Switch */}
      <div className="flex items-center justify-between border-t border-[#E5E5E0]/60 pt-2 text-[11px]">
        <span className="flex items-center text-[#52524E]">
          <Sparkles className="size-3.5 mr-1 text-[#7B9E00]" />
          NVIDIA BNR Шумоподавление
        </span>
        <button
          onClick={() => setUseBnr(!useBnr)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            useBnr ? "bg-[#7B9E00]" : "bg-[#E5E5E0]"
          }`}
        >
          <span
            className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
              useBnr ? "translate-x-4.5" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
