"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SceneRegistry, globalSceneRegistry } from "@/lib/application/3d/scene-registry";
import { ApartmentModel } from "@/components/3d/apartment/apartment-model";
import { MeasurementTool } from "@/components/3d/apartment/measurement-tool";

interface Parametric3DSceneProps {
  registry?: SceneRegistry;
}

export function Parametric3DScene({ registry = globalSceneRegistry }: Parametric3DSceneProps) {
  return (
    <div className="relative w-full h-full min-h-[300px]">
      <Canvas
        shadows
        camera={{ position: [0, 12, 14], fov: 45 }}
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#0F172A"]} />

        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 18, 10]} intensity={2.2} castShadow />

        <OrbitControls makeDefault enableDamping dampingFactor={0.05} minDistance={3} maxDistance={25} />

        {/* 3D Parametric Model Component */}
        <ApartmentModel />

        {/* 3D Measurement System */}
        <MeasurementTool />
      </Canvas>
    </div>
  );
}
