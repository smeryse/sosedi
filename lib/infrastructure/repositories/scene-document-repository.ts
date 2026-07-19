import { ApartmentSceneDocument, validateSceneDocument } from "@/lib/domain/housing/scene-document";

export class SceneDocumentRepository {
  private localDrafts = new Map<string, ApartmentSceneDocument>();

  public async getDocumentByApartmentId(apartmentId: string): Promise<ApartmentSceneDocument | null> {
    if (this.localDrafts.has(apartmentId)) {
      return this.localDrafts.get(apartmentId)!;
    }

    // Default sample document fallback
    const fallbackDoc: ApartmentSceneDocument = {
      schemaVersion: "1.0.0",
      apartmentId,
      name: "3-комнатная квартира (78 м²)",
      units: "meters",
      scale: 1.0,
      nodes: [
        {
          id: "room-master-node",
          parentId: null,
          name: "Главная спальня (Мастер)",
          type: "room",
          version: 1,
          transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          metadata: {},
          roomId: "room-master",
          roomKind: "bedroom",
          accessType: "private",
          areaM2: 22,
          selectable: true,
          polygonPoints: [
            [-5.6, -5.3],
            [-0.8, -5.3],
            [-0.8, -0.3],
            [-5.6, -0.3],
          ],
        },
      ],
      rootIds: ["room-master-node"],
      cameraPresets: {
        "room-master": {
          position: [-3.2, 6.0, 2.5],
          target: [-3.2, 0.75, -2.8],
          fov: 45,
          minDistance: 2,
          maxDistance: 15,
        },
      },
      defaultCamera: {
        position: [0, 12, 14],
        target: [0, 0, 0],
        fov: 45,
        minDistance: 4,
        maxDistance: 25,
      },
      bounds: { min: [-7.1, 0, -6.1], max: [7.1, 2.0, 6.1] },
      metadata: {},
    };

    const validated = validateSceneDocument(fallbackDoc);
    return validated.data || null;
  }

  public async saveDraft(apartmentId: string, document: ApartmentSceneDocument): Promise<boolean> {
    const validated = validateSceneDocument(document);
    if (!validated.success) {
      console.error("[SceneDocumentRepository] Document validation failed:", validated.error);
      return false;
    }

    this.localDrafts.set(apartmentId, validated.data!);
    return true;
  }
}

export const sceneDocumentRepository = new SceneDocumentRepository();
