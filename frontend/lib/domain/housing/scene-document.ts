import { z } from "zod";
import { SceneNodeSchema, SceneNode } from "./scene-graph";
import { CameraPresetSchema } from "./apartment-manifest";

export const ApartmentSceneDocumentSchema = z.object({
  schemaVersion: z.string().default("1.0.0"),
  apartmentId: z.string(),
  name: z.string().default("3-комнатная квартира"),
  units: z.enum(["meters", "centimeters"]).default("meters"),
  scale: z.number().positive().default(1.0),
  nodes: z.array(SceneNodeSchema).min(1),
  rootIds: z.array(z.string().min(1)),
  cameraPresets: z.record(z.string(), CameraPresetSchema).default({}),
  defaultCamera: CameraPresetSchema,
  bounds: z.object({
    min: z.tuple([z.number(), z.number(), z.number()]),
    max: z.tuple([z.number(), z.number(), z.number()]),
  }),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type ApartmentSceneDocument = z.infer<typeof ApartmentSceneDocumentSchema>;

export function validateSceneDocument(rawJson: unknown): {
  success: boolean;
  data?: ApartmentSceneDocument;
  error?: string;
} {
  try {
    const data = ApartmentSceneDocumentSchema.parse(rawJson);
    return { success: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues || (err as any).errors || [];
      return {
        success: false,
        error: issues.map((e: any) => `${e.path?.join(".")}: ${e.message}`).join("; ") || err.message,
      };
    }
    return { success: false, error: String(err) };
  }
}

export function migrateSceneDocument(rawJson: any): ApartmentSceneDocument {
  if (!rawJson.schemaVersion || rawJson.schemaVersion === "1.0.0") {
    return ApartmentSceneDocumentSchema.parse(rawJson);
  }
  throw new Error(`Unsupported scene document schemaVersion: ${rawJson.schemaVersion}`);
}
