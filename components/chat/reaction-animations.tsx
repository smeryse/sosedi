"use client";

import { useEffect, useRef, useState } from "react";

interface ReactionParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
  rotation: number;
  dx: number;
  dy: number;
  scale: number;
  opacity: number;
  delay: number;
  lifetime: number;
}

interface ReactionAnimationProps {
  emoji: string;
  x: number;
  y: number;
  onComplete: () => void;
}

const REACTION_CONFIGS: Record<string, {
  particleCount: number;
  colors: string[];
  duration: number;
  gravity: number;
  spread: number;
  sizeRange: [number, number];
  specialEffect?: "heartbeat" | "flame" | "confetti" | "shockwave" | "bounce" | "wiggle";
}> = {
  "👍": {
    particleCount: 18,
    colors: ["#B3DB00", "#9FC400", "#7B9E00", "#EBF7B6"],
    duration: 1200,
    gravity: -0.3,
    spread: 1.2,
    sizeRange: [24, 36],
    specialEffect: "bounce",
  },
  "❤️": {
    particleCount: 20,
    colors: ["#FF3B6E", "#FF6B8A", "#FF99AA", "#FFCCD5", "#FFF0F2"],
    duration: 1500,
    gravity: -0.2,
    spread: 1.5,
    sizeRange: [22, 34],
    specialEffect: "heartbeat",
  },
  "🔥": {
    particleCount: 25,
    colors: ["#FF4500", "#FF6B35", "#FF9F1C", "#FFCC00", "#FFF8E7"],
    duration: 1800,
    gravity: -0.5,
    spread: 1.8,
    sizeRange: [26, 40],
    specialEffect: "flame",
  },
  "🤡": {
    particleCount: 22,
    colors: ["#FF6B6B", "#4ECDC4", "#FFD93D", "#FF6B9D", "#A8E6CF", "#FFB347"],
    duration: 1600,
    gravity: -0.15,
    spread: 2.0,
    sizeRange: [16, 28],
    specialEffect: "wiggle",
  },
  "🎉": {
    particleCount: 30,
    colors: ["#FF6B6B", "#4ECDC4", "#FFD93D", "#FF6B9D", "#A8E6CF", "#B3DB00", "#7B9E00", "#FFB347"],
    duration: 2000,
    gravity: -0.1,
    spread: 2.5,
    sizeRange: [18, 30],
    specialEffect: "confetti",
  },
  "😮": {
    particleCount: 16,
    colors: ["#B3DB00", "#9FC400", "#7B9E00", "#EBF7B6", "#FFFFFF"],
    duration: 1000,
    gravity: 0,
    spread: 3.0,
    sizeRange: [26, 40],
    specialEffect: "shockwave",
  },
};

function createParticles(
  emoji: string,
  x: number,
  y: number,
  config: typeof REACTION_CONFIGS[string]
): ReactionParticle[] {
  const particles: ReactionParticle[] = [];
  const now = Date.now();

  for (let i = 0; i < config.particleCount; i++) {
    const angle = (Math.PI * 2 * i) / config.particleCount + (Math.random() - 0.5) * 0.5;
    const velocity = 60 + Math.random() * 120;
    const dx = Math.cos(angle) * velocity * config.spread;
    const dy = Math.sin(angle) * velocity * config.spread + (Math.random() - 0.5) * 40;

    const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];

    particles.push({
      id: now + i,
      x,
      y,
      emoji,
      size,
      rotation: Math.random() * 360,
      dx,
      dy,
      scale: 1,
      opacity: 1,
      delay: Math.random() * 150,
      lifetime: config.duration,
    });
  }

  return particles;
}

export function ReactionAnimation({ emoji, x, y, onComplete }: ReactionAnimationProps) {
  const config = REACTION_CONFIGS[emoji] || REACTION_CONFIGS["👍"];
  const [particles, setParticles] = useState<ReactionParticle[]>(() =>
    createParticles(emoji, x, y, config)
  );
  const [showShockwave, setShowShockwave] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    if (config.specialEffect === "shockwave") {
      setShowShockwave(true);
      setTimeout(() => setShowShockwave(false), 600);
    }
    if (config.specialEffect === "heartbeat") {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
  }, [config.specialEffect]);

  useEffect(() => {
    let frame: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / config.duration, 1);

      setParticles((prev) =>
        prev.map((p) => {
          const particleProgress = Math.min(
            (elapsed - p.delay) / p.lifetime,
            1
          );
          if (particleProgress <= 0) return p;

          const easeOut = 1 - Math.pow(1 - particleProgress, 3);
          const easeInOut = particleProgress < 0.5
            ? 2 * particleProgress * particleProgress
            : 1 - Math.pow(-2 * particleProgress + 2, 2) / 2;

          let newX = p.x + p.dx * easeOut * 0.016;
          let newY = p.y + p.dy * easeOut * 0.016;
          let newDy = p.dy + config.gravity * 9.8 * 0.016 * 60;
          let newScale = 1 - easeOut * 0.5;
          let newOpacity = 1 - easeOut;
          let newRotation = p.rotation + (Math.random() - 0.5) * 10;

          if (config.specialEffect === "bounce") {
            const bounce = Math.sin(particleProgress * Math.PI * 4) * 0.15 * (1 - easeOut);
            newScale += bounce;
            newRotation += bounce * 30;
          }
          if (config.specialEffect === "wiggle") {
            const wiggle = Math.sin(particleProgress * Math.PI * 6 + p.id) * 0.2 * (1 - easeOut);
            newRotation += wiggle * 45;
            newX += Math.sin(particleProgress * Math.PI * 8) * 2;
          }
          if (config.specialEffect === "flame") {
            const flicker = Math.sin(particleProgress * Math.PI * 10 + p.id) * 0.1;
            newScale += flicker;
            newX += Math.sin(particleProgress * Math.PI * 6) * 1.5;
            newOpacity = Math.max(0, 1 - particleProgress * 1.2);
          }
          if (config.specialEffect === "confetti") {
            const spin = particleProgress * 720;
            newRotation += spin;
            newScale = 1 - easeInOut * 0.3;
            newOpacity = 1 - easeInOut;
          }

          return {
            ...p,
            x: newX,
            y: newY,
            dy: newDy,
            scale: Math.max(0.1, newScale),
            opacity: Math.max(0, newOpacity),
            rotation: newRotation,
          };
        }).filter((p) => (Date.now() - startTime - p.delay) < p.lifetime)
      );

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [config, onComplete]);

  return (
    <>
      {showShockwave && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: x - 100,
            top: y - 100,
            width: 200,
            height: 200,
          }}
        >
          <div
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderColor: "#B3DB00",
              animation: "shockwave 0.6s ease-out forwards",
            }}
          />
          <div
            className="absolute inset-0 rounded-full border-2"
            style={{
              left: 20,
              top: 20,
              width: 160,
              height: 160,
              borderColor: "#9FC400",
              animation: "shockwave 0.6s ease-out 0.1s forwards",
            }}
          />
          <div
            className="absolute inset-0 rounded-full border-2"
            style={{
              left: 40,
              top: 40,
              width: 120,
              height: 120,
              borderColor: "#7B9E00",
              animation: "shockwave 0.6s ease-out 0.2s forwards",
            }}
          />
        </div>
      )}

      {showHeart && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: x - 32,
            top: y - 32,
            width: 64,
            height: 64,
          }}
        >
          <svg viewBox="0 0 64 64" width="64" height="64">
            <path
              d="M32 52 L16 36 C16 26 22 18 32 28 C42 18 48 26 48 36 L32 52 Z"
              fill="#FF3B6E"
              style={{
                animation: "heartbeat 0.8s ease-in-out",
                transformOrigin: "32px 44px",
              }}
            />
          </svg>
        </div>
      )}

      <div className="fixed pointer-events-none z-[9998]" style={{ left: 0, top: 0 }}>
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute select-none"
            style={{
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              fontSize: `${p.size}px`,
              transform: `translate(-50%, -50%) scale(${p.scale}) rotate(${p.rotation}deg)`,
              opacity: p.opacity,
              filter: config.specialEffect === "flame"
                ? `drop-shadow(0 0 ${p.size * 0.3}px ${config.colors[0]})`
                : "none",
              pointerEvents: "none",
              zIndex: 9998,
            }}
          >
            {config.specialEffect === "confetti" ? (
              <div
                style={{
                  width: p.size,
                  height: p.size * 0.6,
                  background: config.colors[Math.floor(Math.random() * config.colors.length)],
                  borderRadius: "2px",
                  transform: `rotate(${p.rotation}deg)`,
                }}
              />
            ) : config.specialEffect === "flame" ? (
              <span style={{ display: "block", textShadow: `0 0 ${p.size * 0.4}px ${config.colors[0]}` }}>
                🔥
              </span>
            ) : (
              p.emoji
            )}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes shockwave {
          0% { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes heartbeat {
          0% { transform: scale(0.3); opacity: 1; }
          20% { transform: scale(1.1); opacity: 1; }
          40% { transform: scale(0.9); opacity: 1; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </>
  );
}

export function ReactionButton({
  emoji,
  count,
  onClick,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: {
  emoji: string;
  count: number;
  onClick: (e: React.MouseEvent) => void;
  isActive: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const event = new CustomEvent("reaction-trigger", {
        detail: { emoji, x, y },
      });
      window.dispatchEvent(event);
    }
    onClick(e);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onMouseEnter={() => { setHovered(true); onMouseEnter?.(); }}
      onMouseLeave={() => { setHovered(false); onMouseLeave?.(); }}
      className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-[#EBF7B6] text-[#111111] border border-[#B3DB00] shadow-[0_4px_16px_rgba(179,219,0,0.3)]"
          : "bg-white/80 text-[#6B6F66] border border-[#E5E5E0]/60 hover:bg-[#EBF7B6]/50 hover:text-[#111111] hover:border-[#B3DB00]/50"
      }`}
      style={{
        transform: hovered && !isActive ? "scale(1.1)" : isActive ? "scale(1.05)" : "scale(1)",
        boxShadow: isActive ? "0 4px 16px rgba(179, 219, 0, 0.3)" : hovered ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <span
        className="relative"
        style={{
          display: "inline-block",
          animation: isActive ? "reaction-pop 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)" : "none",
          filter: isActive ? "drop-shadow(0 2px 4px rgba(179, 219, 0, 0.4))" : "none",
        }}
      >
        {emoji}
      </span>
      <span className="font-black tabular-nums">{count}</span>
      <style jsx>{`
        @keyframes reaction-pop {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.3) rotate(-10deg); }
          50% { transform: scale(1.1) rotate(5deg); }
          75% { transform: scale(1.15) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </button>
  );
}

export function useReactionAnimations() {
  const [animations, setAnimations] = useState<Array<{ emoji: string; x: number; y: number; id: number }>>([]);

  useEffect(() => {
    const handler = (e: CustomEvent<{ emoji: string; x: number; y: number }>) => {
      const id = Date.now() + Math.random();
      setAnimations((prev) => [...prev, { ...e.detail, id }]);
    };
    window.addEventListener("reaction-trigger", handler as EventListener);
    return () => window.removeEventListener("reaction-trigger", handler as EventListener);
  }, []);

  const removeAnimation = (id: number) => {
    setAnimations((prev) => prev.filter((a) => a.id !== id));
  };

  return { animations, removeAnimation };
}
