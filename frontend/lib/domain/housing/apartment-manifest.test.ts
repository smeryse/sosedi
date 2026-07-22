import { describe, it, expect } from "vitest";
import { validateApartmentManifest } from "./apartment-manifest";

describe("validateApartmentManifest", () => {
  const validManifest = {
    version: "1.0.0",
    modelUrl: "/models/apartments/demo-apartment/apartment.glb",
    previewUrl: "/models/apartments/demo-apartment/preview.webp",
    units: "meters",
    scale: 1.0,
    byteSize: 31023,
    checksum: "6cdb474f0382",
    bounds: { min: [-7, 0, -6], max: [7, 2, 6] },
    defaultCamera: { position: [0, 12, 14], target: [0, 0, 0], fov: 45, minDistance: 3, maxDistance: 25 },
    rooms: [
      {
        roomId: "room-master",
        name: "Главная спальня (Мастер)",
        roomKind: "bedroom",
        accessType: "private",
        areaM2: 22,
        selectable: true,
        meshNames: ["Floor_Master", "Furniture_Master_Bed"],
        hitboxNames: ["RoomHitbox_Master"],
        anchor: [-3.2, 0.5, -2.8],
        labelAnchor: [-3.2, 1.8, -2.8],
        cameraPreset: { position: [-3.2, 6, 2.5], target: [-3.2, 0.75, -2.8], fov: 45, minDistance: 2, maxDistance: 15 },
        hasBalcony: true,
        noiseLevel: "quiet",
        windowSize: "large",
        features: ["Балкон", "Большое окно", "Тихая сторона"],
      },
    ],
  };

  it("should validate a correct apartment manifest", () => {
    const res = validateApartmentManifest(validManifest);
    expect(res.success).toBe(true);
    expect(res.data?.rooms[0].roomId).toBe("room-master");
  });

  it("should reject manifest missing modelUrl", () => {
    const invalid = { ...validManifest, modelUrl: "" };
    const res = validateApartmentManifest(invalid);
    expect(res.success).toBe(false);
  });

  it("should reject manifest with duplicate roomIds", () => {
    const invalid = {
      ...validManifest,
      rooms: [validManifest.rooms[0], validManifest.rooms[0]],
    };
    const res = validateApartmentManifest(invalid);
    expect(res.success).toBe(false);
    expect(res.error).toContain("Duplicate roomId");
  });
});
