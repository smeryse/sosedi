"use client";

import { useEffect, useState, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { useCommercial3DStore } from "@/lib/application/3d/store";
import { ThreeMeasurementSystem, DistanceMeasurement } from "@/lib/3d/measurement-system";

export type MeasurementStatus = "idle" | "selecting-first" | "selecting-second" | "complete";

export function MeasurementTool() {
  const { isMeasuring, setIsMeasuring } = useCommercial3DStore();
  const { scene, camera, gl } = useThree();

  const [pointA, setPointA] = useState<THREE.Vector3 | null>(null);
  const [pointB, setPointB] = useState<THREE.Vector3 | null>(null);
  const [measurement, setMeasurement] = useState<DistanceMeasurement | null>(null);
  const [status, setStatus] = useState<MeasurementStatus>("idle");

  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerVecRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!isMeasuring) {
      setPointA(null);
      setPointB(null);
      setMeasurement(null);
      setStatus("idle");
      return;
    }

    if (status === "idle") setStatus("selecting-first");

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore right clicks or clicks outside canvas
      if (e.button !== 0) return;

      const rect = gl.domElement.getBoundingClientRect();
      pointerVecRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerVecRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerVecRef.current, camera);

      // Filter only objects marked with userData.measurementSurface === true
      const validTargets: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.userData?.measurementSurface === true) {
          validTargets.push(obj);
        }
      });

      const intersects = raycasterRef.current.intersectObjects(validTargets, false);

      if (intersects.length > 0) {
        const point = intersects[0].point.clone();

        if (!pointA || status === "selecting-first") {
          setPointA(point);
          setPointB(null);
          setMeasurement(null);
          setStatus("selecting-second");
        } else if (!pointB || status === "selecting-second") {
          setPointB(point);
          const result = ThreeMeasurementSystem.calculateDistance(pointA, point);
          setMeasurement(result);
          setStatus("complete");
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPointA(null);
        setPointB(null);
        setMeasurement(null);
        setStatus("selecting-first");
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMeasuring, pointA, pointB, status, camera, scene, gl]);

  const formattedValue = measurement ? `${measurement.distanceMeters.toFixed(2)} м` : "";

  return (
    <group data-measurement-status={status}>
      {pointA && (
        <mesh position={pointA}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#CCFF00" />
        </mesh>
      )}

      {pointB && (
        <mesh position={pointB}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#CCFF00" />
        </mesh>
      )}

      {pointA && pointB && (
        <Line
          points={[
            [pointA.x, pointA.y, pointA.z],
            [pointB.x, pointB.y, pointB.z],
          ]}
          color="#CCFF00"
          lineWidth={3.5}
        />
      )}

      {measurement && pointA && pointB && (
        <Html
          position={[
            (pointA.x + pointB.x) / 2,
            (pointA.y + pointB.y) / 2 + 0.3,
            (pointA.z + pointB.z) / 2,
          ]}
          center
        >
          <div
            data-measurement-value={formattedValue}
            className="bg-gray-900 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-2xl border border-[#CCFF00] whitespace-nowrap animate-bounce flex items-center gap-2"
          >
            <span>📏 {formattedValue}</span>
            <button
              onClick={() => {
                setPointA(null);
                setPointB(null);
                setMeasurement(null);
                setStatus("selecting-first");
              }}
              className="text-[10px] text-gray-400 hover:text-white underline ml-1"
            >
              Сброс
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
