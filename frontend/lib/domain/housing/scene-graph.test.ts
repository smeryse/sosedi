import { describe, it, expect } from "vitest";
import { SceneNodeSchema, WallNodeSchema, RoomNodeSchema } from "./scene-graph";
import { validateSceneDocument } from "./scene-document";

describe("SceneGraph & Document Schemas", () => {
  const wallUuid = "11111111-2222-3333-4444-555555555555";
  const startCornerUuid = "00000000-0000-0000-0000-000000000001";
  const endCornerUuid = "00000000-0000-0000-0000-000000000002";
  const roomUuid = "99999999-8888-7777-6666-555555555555";

  it("should validate a correct WallNode schema", () => {
    const wallData = {
      id: wallUuid,
      name: "Внешняя стена 1",
      type: "wall",
      startCornerId: startCornerUuid,
      endCornerId: endCornerUuid,
      thicknessMeters: 0.2,
      heightMeters: 2.8,
      isExterior: true,
    };

    const parsed = WallNodeSchema.parse(wallData);
    expect(parsed.type).toBe("wall");
    expect(parsed.isExterior).toBe(true);
  });

  it("should validate a correct ApartmentSceneDocument", () => {
    const validDoc = {
      schemaVersion: "1.0.0",
      apartmentId: "apt-demo-1",
      name: "3-комнатная квартира",
      units: "meters",
      scale: 1.0,
      nodes: [
        {
          id: roomUuid,
          name: "Главная спальня",
          type: "room",
          roomId: "room-master",
          roomKind: "bedroom",
          accessType: "private",
          areaM2: 22,
          selectable: true,
          polygonPoints: [
            [-5, -5],
            [0, -5],
            [0, 0],
            [-5, 0],
          ],
        },
      ],
      rootIds: [roomUuid],
      defaultCamera: {
        position: [0, 12, 14],
        target: [0, 0, 0],
        fov: 45,
      },
      bounds: { min: [-7, 0, -6], max: [7, 2, 6] },
    };

    const res = validateSceneDocument(validDoc);
    expect(res.success).toBe(true);
    expect(res.data?.nodes[0].type).toBe("room");
  });
});
