import { describe, it, expect } from "vitest";
import {
  calculatePolygonArea,
  calculatePolygonPerimeter,
  snapPointToGrid,
  findClosedRooms,
} from "./graph-engine";
import { Corner2D, Wall2D } from "./types";
import { validateItemPlacement } from "./placement-rules";

describe("2D Floorplan Graph Engine", () => {
  it("should calculate exact area of a 4x5 meter square room (20 m²)", () => {
    const points: [number, number][] = [
      [0, 0],
      [4, 0],
      [4, 5],
      [0, 5],
    ];

    const area = calculatePolygonArea(points);
    expect(area).toBe(20);

    const perimeter = calculatePolygonPerimeter(points);
    expect(perimeter).toBe(18);
  });

  it("should snap coordinates to 0.1m grid", () => {
    const [snappedX, snappedY] = snapPointToGrid(3.1415, 2.7818, 0.1);
    expect(snappedX).toBe(3.1);
    expect(snappedY).toBe(2.8);
  });

  it("should detect closed room loop from corner graph", () => {
    const corners = new Map<string, Corner2D>([
      ["c1", { id: "c1", x: 0, y: 0, wallIds: ["w1", "w4"] }],
      ["c2", { id: "c2", x: 5, y: 0, wallIds: ["w1", "w2"] }],
      ["c3", { id: "c3", x: 5, y: 4, wallIds: ["w2", "w3"] }],
      ["c4", { id: "c4", x: 0, y: 4, wallIds: ["w3", "w4"] }],
    ]);

    const walls = new Map<string, Wall2D>([
      ["w1", { id: "w1", startCornerId: "c1", endCornerId: "c2", thicknessMeters: 0.2, heightMeters: 2.8, isExterior: true }],
      ["w2", { id: "w2", startCornerId: "c2", endCornerId: "c3", thicknessMeters: 0.2, heightMeters: 2.8, isExterior: true }],
      ["w3", { id: "w3", startCornerId: "c3", endCornerId: "c4", thicknessMeters: 0.2, heightMeters: 2.8, isExterior: true }],
      ["w4", { id: "w4", startCornerId: "c4", endCornerId: "c1", thicknessMeters: 0.2, heightMeters: 2.8, isExterior: true }],
    ]);

    const rooms = findClosedRooms(corners, walls);
    expect(rooms.length).toBe(1);
    expect(rooms[0].areaM2).toBe(20);
  });

  it("should validate furniture placement inside room bounds", () => {
    const roomPoints: [number, number][] = [
      [0, 0],
      [6, 0],
      [6, 6],
      [0, 6],
    ];

    const validBed = {
      id: "bed-1",
      name: "Кровать",
      placementType: "floor" as const,
      position: [3, 0.4, 3] as [number, number, number],
      dimensions: [2.0, 0.6, 1.6] as [number, number, number],
    };

    expect(validateItemPlacement(validBed, roomPoints).isValid).toBe(true);

    const outOfBoundsBed = {
      ...validBed,
      position: [7, 0.4, 7] as [number, number, number],
    };

    expect(validateItemPlacement(outOfBoundsBed, roomPoints).isValid).toBe(false);
  });
});
