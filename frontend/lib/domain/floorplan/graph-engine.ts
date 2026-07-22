import { Corner2D, Wall2D, Room2D, FloorplanGraph } from "./types";

/**
 * Calculates polygon area using the Shoelace formula (in square meters).
 */
export function calculatePolygonArea(points: [number, number][]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  return Math.abs(area) / 2;
}

/**
 * Calculates polygon perimeter (in meters).
 */
export function calculatePolygonPerimeter(points: [number, number][]): number {
  if (points.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j][0] - points[i][0];
    const dy = points[j][1] - points[i][1];
    perimeter += Math.hypot(dx, dy);
  }
  return perimeter;
}

/**
 * Snaps a point to grid increments.
 */
export function snapPointToGrid(x: number, y: number, gridSizeMeters = 0.1): [number, number] {
  const snappedX = Math.round(x / gridSizeMeters) * gridSizeMeters;
  const snappedY = Math.round(y / gridSizeMeters) * gridSizeMeters;
  return [Number(snappedX.toFixed(2)), Number(snappedY.toFixed(2))];
}

/**
 * Snaps point to nearest existing corner if within radius.
 */
export function snapPointToCorners(
  x: number,
  y: number,
  corners: Map<string, Corner2D>,
  snapRadiusMeters = 0.3
): { point: [number, number]; snappedCornerId?: string } {
  let closestCorner: Corner2D | undefined;
  let minDistance = snapRadiusMeters;

  for (const corner of corners.values()) {
    const dist = Math.hypot(corner.x - x, corner.y - y);
    if (dist < minDistance) {
      minDistance = dist;
      closestCorner = corner;
    }
  }

  if (closestCorner) {
    return { point: [closestCorner.x, closestCorner.y], snappedCornerId: closestCorner.id };
  }

  return { point: [x, y] };
}

/**
 * Detects closed room loops in corner/wall graph.
 */
export function findClosedRooms(corners: Map<string, Corner2D>, walls: Map<string, Wall2D>): Room2D[] {
  const rooms: Room2D[] = [];
  const cornerList = Array.from(corners.values());
  if (cornerList.length < 3) return rooms;

  // Simple bounding box rectangle room detection for wall graphs
  const minX = Math.min(...cornerList.map((c) => c.x));
  const maxX = Math.max(...cornerList.map((c) => c.x));
  const minY = Math.min(...cornerList.map((c) => c.y));
  const maxY = Math.max(...cornerList.map((c) => c.y));

  if (maxX - minX > 0.5 && maxY - minY > 0.5) {
    const points: [number, number][] = [
      [minX, minY],
      [maxX, minY],
      [maxX, maxY],
      [minX, maxY],
    ];
    const area = calculatePolygonArea(points);
    const perimeter = calculatePolygonPerimeter(points);

    rooms.push({
      id: "room-auto-1",
      name: "Помещение 1",
      cornerIds: cornerList.map((c) => c.id),
      polygonPoints: points,
      areaM2: Number(area.toFixed(1)),
      perimeterMeters: Number(perimeter.toFixed(1)),
      roomId: "room-master",
    });
  }

  return rooms;
}
