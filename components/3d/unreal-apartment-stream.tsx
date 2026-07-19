"use client";

import { useState } from "react";
import { Monitor, X, ExternalLink } from "lucide-react";

interface UnrealApartmentStreamProps {
  streamUrl?: string;
  onClose: () => void;
}

export function UnrealApartmentStream({ streamUrl, onClose }: UnrealApartmentStreamProps) {
  const [loaded, setLoaded] = useState(false);

  const url = streamUrl || process.env.NEXT_PUBLIC_UNREAL_STREAM_URL;

  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans select-none animate-in fade-in duration-300">
      {/* Stream Header */}
      <div className="bg-gray-900/90 backdrop-blur-md px-6 py-3 border-b border-gray-800 flex items-center justify-between z-10 text-white">
        <div className="flex items-center gap-3">
          <div className="size-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-black tracking-tight font-heading">
            Unreal Engine 5 • Pixel Streaming
          </span>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
            60 FPS Live Stream
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>В отдельном окне</span>
            <ExternalLink className="size-3.5" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="relative flex-1 bg-black">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-3">
            <Monitor className="size-10 text-[#CCFF00] animate-bounce" />
            <p className="text-xs font-semibold text-gray-400">
              Подключаемся к серверу Pixel Streaming...
            </p>
          </div>
        )}
        <iframe
          src={url}
          onLoad={() => setLoaded(true)}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; microphone; camera; display-capture; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
