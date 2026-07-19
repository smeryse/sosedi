"use client";

import { useState } from "react";
import { Corner2D, Wall2D, Room2D } from "@/lib/domain/floorplan/types";
import { snapPointToGrid } from "@/lib/domain/floorplan/graph-engine";
import { OwnerEditorTool } from "./owner-editor-layout";

interface Floorplan2DCanvasProps {
  activeTool: OwnerEditorTool;
  corners: Map<string, Corner2D>;
  walls: Map<string, Wall2D>;
  rooms: Room2D[];
  onAddWall: (start: [number, number], end: [number, number]) => void;
  onSelectEntity: (id: string | null) => void;
}

export function Floorplan2DCanvas({
  activeTool,
  corners,
  walls,
  rooms,
  onAddWall,
  onSelectEntity,
}: Floorplan2DCanvasProps) {
  const [drawingStart, setDrawingStart] = useState<[number, number] | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = (e.clientX - rect.left - rect.width / 2) / 40;
    const rawY = (e.clientY - rect.top - rect.height / 2) / 40;

    const [snappedX, snappedY] = snapPointToGrid(rawX, rawY, 0.5);

    if (activeTool === "wall") {
      if (!drawingStart) {
        setDrawingStart([snappedX, snappedY]);
      } else {
        onAddWall(drawingStart, [snappedX, snappedY]);
        setDrawingStart(null);
      }
    } else {
      setDrawingStart(null);
      onSelectEntity(null);
    }
  };

  const cornerArray = Array.from(corners.values());
  const wallArray = Array.from(walls.values());

  return (
    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden cursor-crosshair">
      <svg
        data-testid="floorplan-svg"
        className="w-full h-full select-none"
        onClick={handleCanvasClick}
      >
        {/* Grid pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform="translate(400, 300)">
          {/* Room Polygons */}
          {rooms.map((room) => {
            const pointsStr = room.polygonPoints
              .map(([x, y]) => `${x * 40},${y * 40}`)
              .join(" ");
            return (
              <g key={room.id}>
                <polygon
                  points={pointsStr}
                  fill="#84cc16"
                  fillOpacity="0.25"
                  stroke="#84cc16"
                  strokeWidth="2"
                />
                <text
                  x={(room.polygonPoints[0][0] + room.polygonPoints[2][0]) * 20}
                  y={(room.polygonPoints[0][1] + room.polygonPoints[2][1]) * 20}
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {room.name} ({room.areaM2} м²)
                </text>
              </g>
            );
          })}

          {/* Wall Lines */}
          {wallArray.map((wall) => {
            const start = corners.get(wall.startCornerId);
            const end = corners.get(wall.endCornerId);
            if (!start || !end) return null;

            return (
              <line
                key={wall.id}
                x1={start.x * 40}
                y1={start.y * 40}
                x2={end.x * 40}
                y2={end.y * 40}
                stroke="#9ca3af"
                strokeWidth="10"
                strokeLinecap="round"
              />
            );
          })}

          {/* Corner Handles */}
          {cornerArray.map((corner) => (
            <circle
              key={corner.id}
              cx={corner.x * 40}
              cy={corner.y * 40}
              r="6"
              fill="#CCFF00"
              stroke="#0f172a"
              strokeWidth="2"
            />
          ))}

          {/* Active Wall Drawing Line */}
          {drawingStart && (
            <circle
              cx={drawingStart[0] * 40}
              cy={drawingStart[1] * 40}
              r="8"
              fill="#ef4444"
              className="animate-ping"
            />
          )}
        </g>
      </svg>

      {/* Helper Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 text-xs text-slate-300 p-3 rounded-xl border border-slate-800 pointer-events-none">
        <span>Инструмент: <b>{activeTool}</b></span>
        {activeTool === "wall" && (
          <span className="block text-[11px] text-[#CCFF00] font-medium mt-1">
            Кликните 1 раз для первой точки стены, кликните 2 раз для завершения стены.
          </span>
        )}
      </div>
    </div>
  );
}
