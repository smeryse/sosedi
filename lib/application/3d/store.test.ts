import { describe, it, expect, beforeEach } from "vitest";
import { useCommercial3DStore } from "./store";

describe("useCommercial3DStore", () => {
  beforeEach(() => {
    useCommercial3DStore.getState().setActiveRoomId("room-master");
  });

  it("should preserve exact RoomId without converting bedroom into bedroom", () => {
    const store = useCommercial3DStore.getState();
    store.setActiveRoomId("room-second");
    expect(useCommercial3DStore.getState().activeRoomId).toBe("room-second");

    store.setActiveRoomId("room-third");
    expect(useCommercial3DStore.getState().activeRoomId).toBe("room-third");
  });

  it("should perform a clean swap when assigning a roommate to an occupied room", () => {
    const store = useCommercial3DStore.getState();
    // Roman is in room-master, Ilya is in room-second
    // Assign Roman to room-second
    store.assignRoommateToRoom("roman", "room-second");

    const updated = useCommercial3DStore.getState().roommates3B;
    const roman = updated.find((r) => r.id === "roman");
    const ilya = updated.find((r) => r.id === "ilya");

    expect(roman?.assignedRoomId).toBe("room-second");
    expect(ilya?.assignedRoomId).toBe("room-master"); // Ilya swapped to Roman's previous room
  });

  it("should maintain total rent sum strictly equal to 40 000 ₽ after roommate swaps", () => {
    const store = useCommercial3DStore.getState();
    store.assignRoommateToRoom("arina", "room-master");

    const rentResult = useCommercial3DStore.getState().rentResult;
    expect(rentResult.isValid).toBe(true);
    const sum = rentResult.assignments.reduce((acc, curr) => acc + curr.calculatedPrice, 0);
    expect(sum).toBe(40000);
  });
});
