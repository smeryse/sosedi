export type PlacementType = "floor" | "wall" | "in-wall" | "ceiling";

export interface FurniturePlacementCandidate {
  id: string;
  name: string;
  placementType: PlacementType;
  position: [number, number, number];
  dimensions: [number, number, number];
}

export interface PlacementValidationResult {
  isValid: boolean;
  reason?: string;
}

export function validateItemPlacement(
  candidate: FurniturePlacementCandidate,
  roomPolygonPoints: [number, number][]
): PlacementValidationResult {
  const [posX, posY, posZ] = candidate.position;
  const [dimX, dimY, dimZ] = candidate.dimensions;

  // 1. Check placement type constraints
  if (candidate.placementType === "floor" && posY < 0) {
    return { isValid: false, reason: "Напольный предмет не может находиться ниже уровня пола" };
  }

  if (candidate.placementType === "ceiling" && posY < 2.0) {
    return { isValid: false, reason: "Потолочный светильник должен крепиться на высоте не менее 2.0 м" };
  }

  // 2. Simple bounding box check inside room polygon
  if (roomPolygonPoints.length >= 3) {
    const minX = Math.min(...roomPolygonPoints.map((p) => p[0]));
    const maxX = Math.max(...roomPolygonPoints.map((p) => p[0]));
    const minZ = Math.min(...roomPolygonPoints.map((p) => p[1]));
    const maxZ = Math.max(...roomPolygonPoints.map((p) => p[1]));

    const halfWidth = dimX / 2;
    const halfDepth = dimZ / 2;

    if (
      posX - halfWidth < minX ||
      posX + halfWidth > maxX ||
      posZ - halfDepth < minZ ||
      posZ + halfDepth > maxZ
    ) {
      return { isValid: false, reason: "Предмет выходит за границы выбранной комнаты" };
    }
  }

  return { isValid: true };
}
