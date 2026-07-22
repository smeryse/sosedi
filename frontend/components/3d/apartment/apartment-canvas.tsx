"use client";

import { Component, ReactNode, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useCommercial3DStore } from "@/lib/application/3d/store";
import { ApartmentScene } from "./apartment-scene";
import { ApartmentLoadingScreen } from "./apartment-loading-screen";
import { ApartmentFallback } from "./apartment-fallback";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ApartmentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function ApartmentCanvas() {
  const { graphicsTier } = useCommercial3DStore();

  const dpr: [number, number] | number = graphicsTier === "low" ? 1 : [1, 2];

  return (
    <ApartmentErrorBoundary fallback={<ApartmentFallback />}>
      <div className="relative w-full h-full min-h-[300px] overflow-hidden">
        <Suspense fallback={<ApartmentLoadingScreen />}>
          <Canvas
            shadows
            dpr={dpr}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: false,
            }}
            camera={{ position: [0, 12, 14], fov: 45 }}
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
          >
            <color attach="background" args={["#0F172A"]} />
            <ApartmentScene />
          </Canvas>
        </Suspense>
      </div>
    </ApartmentErrorBoundary>
  );
}
