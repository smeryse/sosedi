import { describe, it, expect } from "vitest";
import { calculateFairRentSplit } from "./rent-calculator";
import { RoomEntity, RoommateEntity } from "./types";

describe("calculateFairRentSplit", () => {
  const mockRooms: RoomEntity[] = [
    { id: "room-master", apartmentId: "apt-1", name: "Главная спальня", type: "private", areaM2: 22, hasBalcony: true, windowSize: "large", noiseLevel: "quiet", weight: 26 },
    { id: "room-second", apartmentId: "apt-1", name: "Вторая спальня", type: "private", areaM2: 18, hasWorkplace: true, windowSize: "medium", noiseLevel: "moderate", weight: 20 },
    { id: "room-third", apartmentId: "apt-1", name: "Уютная спальня", type: "private", areaM2: 14, windowSize: "standard", noiseLevel: "quiet", weight: 16 },
    { id: "room-living", apartmentId: "apt-1", name: "Гостиная", type: "common", areaM2: 24, windowSize: "large", noiseLevel: "moderate", weight: 0 },
  ];

  const mockRoommates: RoommateEntity[] = [
    { id: "roman", name: "Роман", avatar: "avatar1.png", role: "Дизайнер", assignedRoomId: "room-master", calculatedPrice: 0 },
    { id: "ilya", name: "Илья", avatar: "avatar2.png", role: "Разработчик", assignedRoomId: "room-second", calculatedPrice: 0 },
    { id: "arina", name: "Арина", avatar: "avatar3.png", role: "Маркетолог", assignedRoomId: "room-third", calculatedPrice: 0 },
  ];

  it("should calculate room prices such that the sum strictly equals totalRent (40 000 ₽)", () => {
    const totalRent = 40000;
    const result = calculateFairRentSplit(totalRent, mockRooms, mockRoommates);

    expect(result.isValid).toBe(true);
    const sum = result.assignments.reduce((acc, curr) => acc + curr.calculatedPrice, 0);
    expect(sum).toBe(totalRent);
  });

  it("should assign higher price to master bedroom with balcony than small bedroom", () => {
    const totalRent = 40000;
    const result = calculateFairRentSplit(totalRent, mockRooms, mockRoommates);

    const masterRent = result.assignments.find((a) => a.roomId === "room-master")?.calculatedPrice || 0;
    const smallRent = result.assignments.find((a) => a.roomId === "room-third")?.calculatedPrice || 0;

    expect(masterRent).toBeGreaterThan(smallRent);
  });
});
