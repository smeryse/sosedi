export type GraphicsTier = "auto" | "low" | "medium" | "high";

export interface PerformanceProfile {
  tier: GraphicsTier;
  pixelRatio: number;
  shadowsEnabled: boolean;
  antialias: boolean;
  maxTextureSize: number;
}

export class PerformanceManager {
  private currentTier: GraphicsTier = "auto";

  public getProfile(requestedTier: GraphicsTier = "auto"): PerformanceProfile {
    this.currentTier = requestedTier;

    if (requestedTier === "low") {
      return { tier: "low", pixelRatio: 1.0, shadowsEnabled: false, antialias: false, maxTextureSize: 1024 };
    }

    if (requestedTier === "medium") {
      return { tier: "medium", pixelRatio: 1.25, shadowsEnabled: true, antialias: true, maxTextureSize: 2048 };
    }

    if (requestedTier === "high") {
      const pr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1.5;
      return { tier: "high", pixelRatio: pr, shadowsEnabled: true, antialias: true, maxTextureSize: 4096 };
    }

    // Auto detection based on device memory and screen size
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    return {
      tier: "auto",
      pixelRatio: isMobile ? 1.0 : 1.5,
      shadowsEnabled: !isMobile,
      antialias: true,
      maxTextureSize: isMobile ? 2048 : 4096,
    };
  }
}
