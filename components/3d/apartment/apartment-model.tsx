"use client";

import { useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useCommercial3DStore } from "@/lib/application/3d/store";
import { RoomId } from "@/lib/domain/housing/types";

export function ApartmentModel() {
  const { activeRoomId, setActiveRoomId, roommates3B, rooms3B } = useCommercial3DStore();
  const [hoveredRoomId, setHoveredRoomId] = useState<RoomId>(null);

  const activeHighlightMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#CCFF00",
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    []
  );

  const hoverHighlightMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FEF08A",
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    []
  );

  return (
    <group name="ApartmentRootGroup">
      {/* 1. Main Base Floor (Measurement Surface) */}
      <mesh
        name="Floor_Main"
        position={[0, -0.1, 0]}
        userData={{ measurementSurface: true }}
        receiveShadow
      >
        <boxGeometry args={[14, 0.2, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>

      {/* 2. Room Floor Meshes with Architectural Colors */}
      <group name="RoomFloorsGroup">
        {/* Master Bedroom */}
        <mesh name="Floor_Master" position={[-3.2, 0.05, -2.8]} userData={{ measurementSurface: true }} receiveShadow>
          <boxGeometry args={[4.8, 0.05, 5.0]} />
          <meshStandardMaterial color="#84cc16" roughness={0.3} transparent opacity={0.85} />
        </mesh>

        {/* Second Bedroom */}
        <mesh name="Floor_Second" position={[2.8, 0.05, -2.8]} userData={{ measurementSurface: true }} receiveShadow>
          <boxGeometry args={[4.2, 0.05, 4.8]} />
          <meshStandardMaterial color="#10b981" roughness={0.3} transparent opacity={0.85} />
        </mesh>

        {/* Third Bedroom */}
        <mesh name="Floor_Third" position={[-3.6, 0.05, 2.6]} userData={{ measurementSurface: true }} receiveShadow>
          <boxGeometry args={[3.8, 0.05, 4.2]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.3} transparent opacity={0.85} />
        </mesh>

        {/* Living Room */}
        <mesh name="Floor_Living" position={[2.2, 0.05, 2.4]} userData={{ measurementSurface: true }} receiveShadow>
          <boxGeometry args={[5.6, 0.05, 4.8]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} transparent opacity={0.85} />
        </mesh>

        {/* Kitchen */}
        <mesh name="Floor_Kitchen" position={[-0.4, 0.05, -3.8]} userData={{ measurementSurface: true }} receiveShadow>
          <boxGeometry args={[3.4, 0.05, 3.0]} />
          <meshStandardMaterial color="#ec4899" roughness={0.3} transparent opacity={0.85} />
        </mesh>

        {/* Bathroom */}
        <mesh name="Floor_Bathroom" position={[-0.4, 0.05, -0.2]} userData={{ measurementSurface: true }} receiveShadow>
          <boxGeometry args={[2.6, 0.05, 2.6]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.3} transparent opacity={0.85} />
        </mesh>

        {/* Hall */}
        <mesh name="Floor_Hall" position={[0, 0.05, 3.0]} userData={{ measurementSurface: true }} receiveShadow>
          <boxGeometry args={[3.0, 0.05, 4.0]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} transparent opacity={0.85} />
        </mesh>
      </group>

      {/* 3. Cutaway Exterior and Interior Walls */}
      <group name="WallsGroup">
        <mesh name="Wall_Exterior" position={[0, 0.9, -6.1]} userData={{ measurementSurface: true }} castShadow receiveShadow>
          <boxGeometry args={[14.2, 1.8, 0.2]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>

        <mesh name="Wall_Interior_1" position={[-0.7, 0.9, 0]} userData={{ measurementSurface: true }} castShadow receiveShadow>
          <boxGeometry args={[0.2, 1.8, 12.2]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>

        <mesh name="Wall_Interior_2" position={[-3.2, 0.9, 0.3]} userData={{ measurementSurface: true }} castShadow receiveShadow>
          <boxGeometry args={[4.8, 1.8, 0.2]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>

        <mesh name="Wall_Interior_3" position={[2.8, 0.9, 0]} userData={{ measurementSurface: true }} castShadow receiveShadow>
          <boxGeometry args={[4.2, 1.8, 0.2]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>
      </group>

      {/* 4. Furniture Items */}
      <group name="FurnitureGroup">
        {/* Master Bed */}
        <mesh name="Furniture_Master_Bed" position={[-4.0, 0.4, -3.5]} userData={{ measurementSurface: true }} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.6, 1.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>

        {/* Second Bed */}
        <mesh name="Furniture_Second_Bed" position={[3.5, 0.4, -3.5]} userData={{ measurementSurface: true }} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.6, 1.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>

        {/* Third Bed */}
        <mesh name="Furniture_Third_Bed" position={[-4.2, 0.4, 3.2]} userData={{ measurementSurface: true }} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.6, 1.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>

        {/* Second Desk */}
        <mesh name="Furniture_Second_Desk" position={[1.5, 0.45, -1.2]} userData={{ measurementSurface: true }} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.7, 0.6]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>

        {/* Living Room Sofa */}
        <mesh name="Furniture_Living_Sofa" position={[3.2, 0.5, 3.2]} userData={{ measurementSurface: true }} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.8, 1.0]} />
          <meshStandardMaterial color="#0f766e" roughness={0.5} />
        </mesh>

        {/* Kitchen Table */}
        <mesh name="Furniture_Kitchen_Table" position={[-0.4, 0.45, -3.8]} userData={{ measurementSurface: true }} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.75, 1.0]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Hitbox Raycasting Overlay Layers & 3D Roommate Badges */}
      {[
        { roomId: "room-master", pos: [-3.2, 1.0, -2.8], size: [4.8, 2.0, 5.0] },
        { roomId: "room-second", pos: [2.8, 1.0, -2.8], size: [4.2, 2.0, 4.8] },
        { roomId: "room-third", pos: [-3.6, 1.0, 2.6], size: [3.8, 2.0, 4.2] },
        { roomId: "room-living", pos: [2.2, 1.0, 2.4], size: [5.6, 2.0, 4.8] },
        { roomId: "room-kitchen", pos: [-0.4, 1.0, -3.8], size: [3.4, 2.0, 3.0] },
        { roomId: "room-bathroom", pos: [-0.4, 1.0, -0.2], size: [2.6, 2.0, 2.6] },
      ].map((hitbox) => {
        const roomId = hitbox.roomId as RoomId;
        const isActive = activeRoomId === roomId;
        const isHovered = hoveredRoomId === roomId;

        const roommate = roommates3B.find((rm) => rm.assignedRoomId === roomId);

        return (
          <group key={hitbox.roomId} position={hitbox.pos as [number, number, number]}>
            {/* Pointer Raycast Mesh */}
            <mesh
              name={`RoomHitbox_${hitbox.roomId.replace("room-", "")}`}
              userData={{ roomId, interactionType: "room-selection", measurementSurface: false }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredRoomId(roomId);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredRoomId(null);
                document.body.style.cursor = "auto";
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveRoomId(roomId);
              }}
            >
              <boxGeometry args={hitbox.size as [number, number, number]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Room Active / Hover Highlight Overlay Plane */}
            {(isActive || isHovered) && (
              <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[hitbox.size[0], hitbox.size[2]]} />
                <primitive object={isActive ? activeHighlightMaterial : hoverHighlightMaterial} attach="material" />
              </mesh>
            )}

            {/* 3D Roommate HTML Badge */}
            {roommate && (
              <Html position={[0, 1.3, 0]} center distanceFactor={12}>
                <div className="bg-gray-900/95 text-white px-3 py-1.5 rounded-full shadow-2xl border border-[#CCFF00] flex items-center gap-2 text-xs whitespace-nowrap pointer-events-none">
                  <img src={roommate.avatar} alt={roommate.name} className="size-5 rounded-full object-cover ring-1 ring-[#CCFF00]" />
                  <span className="font-bold">{roommate.name}</span>
                  <span className="text-[#CCFF00] font-extrabold">{roommate.calculatedPrice.toLocaleString()} ₽</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
