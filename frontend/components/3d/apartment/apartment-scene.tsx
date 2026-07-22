"use client";

import { useCommercial3DStore } from "@/lib/application/3d/store";
import { ApartmentModel } from "./apartment-model";
import { ApartmentCameraController } from "./apartment-camera-controller";
import { MeasurementTool } from "./measurement-tool";

export function ApartmentScene() {
  const { isDay } = useCommercial3DStore();

  return (
    <group>
      {/* Real Scene Lighting (Day / Night) */}
      <ambientLight intensity={isDay ? 0.95 : 0.2} />

      <directionalLight
        position={isDay ? [10, 18, 10] : [2, 8, -4]}
        intensity={isDay ? 2.4 : 0.35}
        color={isDay ? "#FFFFFF" : "#818CF8"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Interior Night Accent Lights */}
      {!isDay && (
        <>
          <pointLight position={[-3.2, 2.0, -2.8]} intensity={4} color="#FEF08A" distance={6} />
          <pointLight position={[2.8, 2.0, -2.8]} intensity={4} color="#FEF08A" distance={6} />
          <pointLight position={[2.2, 2.0, 2.4]} intensity={5} color="#FDE047" distance={8} />
        </>
      )}

      {/* Camera Controls & Presets */}
      <ApartmentCameraController />

      {/* 3D Apartment Room Geometries */}
      <ApartmentModel />

      {/* Point-to-Point 3D Raycasting Measurement Tool */}
      <MeasurementTool />
    </group>
  );
}
