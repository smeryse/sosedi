import { RoomEntity, RoommateEntity, RentCalculationResult, RoomId } from "./types";

/**
 * Pure domain function to calculate fair individual rent split.
 * Guarantees that sum(calculatedPrices) strictly equals totalRent.
 */
export function calculateFairRentSplit(
  totalRent: number,
  rooms: RoomEntity[],
  roommates: RoommateEntity[]
): RentCalculationResult {
  const privateRooms = rooms.filter((r) => r.type === "private");
  const roomMap = new Map(privateRooms.map((r) => [r.id, r]));

  // Calculate room weights
  const roommateWeights = roommates.map((rm) => {
    const room = rm.assignedRoomId ? roomMap.get(rm.assignedRoomId as Exclude<RoomId, null>) : undefined;
    let weight = room ? room.areaM2 : 15;
    if (room?.hasBalcony) weight += 4;
    if (room?.hasWorkplace) weight += 2;
    if (room?.noiseLevel === "quiet") weight += 2;
    return { roommateId: rm.id, roomId: rm.assignedRoomId, weight, roomName: room?.name || "Спальня" };
  });

  const totalWeight = roommateWeights.reduce((sum, item) => sum + item.weight, 0);

  let allocatedSum = 0;
  const assignments = roommateWeights.map((item, index) => {
    const roommate = roommates.find((r) => r.id === item.roommateId);
    let calculatedPrice = 0;

    if (index === roommateWeights.length - 1) {
      // Allocate exact remainder to last roommate to ensure sum(prices) === totalRent
      calculatedPrice = totalRent - allocatedSum;
    } else {
      calculatedPrice = Math.round((item.weight / (totalWeight || 1)) * totalRent);
      allocatedSum += calculatedPrice;
    }

    const room = item.roomId ? roomMap.get(item.roomId as Exclude<RoomId, null>) : undefined;
    const baseShare = Math.round(totalRent / (roommates.length || 1));
    const areaBonus = Math.round((((room?.areaM2 || 15) - 15) / 15) * 2000);
    const amenityBonus = calculatedPrice - baseShare - areaBonus;

    return {
      roommateId: item.roommateId,
      roommateName: roommate?.name || "Жилец",
      roomId: item.roomId,
      roomName: item.roomName,
      calculatedPrice,
      breakdown: {
        baseShare,
        areaBonus,
        amenityBonus,
      },
    };
  });

  const actualTotal = assignments.reduce((sum, a) => sum + a.calculatedPrice, 0);

  return {
    totalRent,
    assignments,
    isValid: actualTotal === totalRent,
  };
}
