"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { OrbitControls } from "@react-three/drei";
import { useCommercial3DStore } from "@/lib/application/3d/store";
import manifest from "@/public/models/apartments/demo-apartment/manifest.json";

export function ApartmentCameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const defaultPos = manifest.defaultCamera.position as [number, number, number];
  const defaultTarget = manifest.defaultCamera.target as [number, number, number];

  const targetPos = useRef(new THREE.Vector3(...defaultPos));
  const targetLookAt = useRef(new THREE.Vector3(...defaultTarget));
  const targetFov = useRef(manifest.defaultCamera.fov);
  const isAnimating = useRef(false);

  const { activeRoomId } = useCommercial3DStore();

  useEffect(() => {
    isAnimating.current = true;

    const roomPreset = manifest.rooms.find((r) => r.roomId === activeRoomId)?.cameraPreset;
    const preset = roomPreset || manifest.defaultCamera;

    const pos = preset.position as [number, number, number];
    const target = preset.target as [number, number, number];

    targetPos.current.set(...pos);
    targetLookAt.current.set(...target);
    targetFov.current = preset.fov;

    // Reduced motion check
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      camera.position.set(...pos);
      if (controlsRef.current) {
        controlsRef.current.target.set(...target);
        controlsRef.current.update();
      }
      isAnimating.current = false;
    }
  }, [activeRoomId, camera]);

  useFrame((_, delta) => {
    if (!isAnimating.current || !controlsRef.current) return;

    const lerpFactor = Math.min(1, delta * 4.0);
    camera.position.lerp(targetPos.current, lerpFactor);
    controlsRef.current.target.lerp(targetLookAt.current, lerpFactor);

    if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.fov - targetFov.current) > 0.1) {
      camera.fov += (targetFov.current - camera.fov) * lerpFactor;
      camera.updateProjectionMatrix();
    }

    controlsRef.current.update();

    if (camera.position.distanceTo(targetPos.current) < 0.08) {
      isAnimating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={25}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2.15}
      onStart={() => {
        isAnimating.current = false;
      }}
    />
  );
}
