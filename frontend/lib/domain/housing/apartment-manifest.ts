import { z } from "zod";

export const CameraPresetSchema = z.object({
  position: z.tuple([z.number(), z.number(), z.number()]),
  target: z.tuple([z.number(), z.number(), z.number()]),
  fov: z.number().positive(),
  minDistance: z.number().positive().default(2),
  maxDistance: z.number().positive().default(25),
});

export const ManifestRoomSchema = z.object({
  roomId: z.enum([
    "room-master",
    "room-second",
    "room-third",
    "room-living",
    "room-kitchen",
    "room-bathroom",
    "room-hall",
  ]),
  name: z.string(),
  roomKind: z.enum(["bedroom", "living", "kitchen", "bathroom", "hall"]),
  accessType: z.enum(["private", "common"]),
  areaM2: z.number().positive(),
  selectable: z.boolean(),
  meshNames: z.array(z.string()),
  hitboxNames: z.array(z.string()),
  anchor: z.tuple([z.number(), z.number(), z.number()]),
  labelAnchor: z.tuple([z.number(), z.number(), z.number()]),
  cameraPreset: CameraPresetSchema,
  hasBalcony: z.boolean().optional(),
  hasWorkplace: z.boolean().optional(),
  noiseLevel: z.enum(["quiet", "moderate"]).optional(),
  windowSize: z.enum(["large", "medium", "standard"]).optional(),
  features: z.array(z.string()).default([]),
});

export const ApartmentManifestSchema = z
  .object({
    version: z.string(),
    modelUrl: z.string().min(1),
    previewUrl: z.string().optional(),
    units: z.enum(["meters", "centimeters"]).default("meters"),
    scale: z.number().positive().default(1.0),
    byteSize: z.number().nonnegative(),
    checksum: z.string(),
    bounds: z.object({
      min: z.tuple([z.number(), z.number(), z.number()]),
      max: z.tuple([z.number(), z.number(), z.number()]),
    }),
    defaultCamera: CameraPresetSchema,
    qualityVariants: z
      .object({
        mobileUrl: z.string().optional(),
        lowPolyUrl: z.string().optional(),
      })
      .optional(),
    rooms: z.array(ManifestRoomSchema).min(1),
  })
  .refine(
    (manifest) => {
      const roomIds = manifest.rooms.map((r) => r.roomId);
      return new Set(roomIds).size === roomIds.length;
    },
    { message: "Duplicate roomId found in manifest rooms" }
  )
  .refine(
    (manifest) => {
      const allHitboxes = manifest.rooms.flatMap((r) => r.hitboxNames);
      return new Set(allHitboxes).size === allHitboxes.length;
    },
    { message: "Duplicate hitboxNames found across rooms" }
  );

export type ApartmentManifest = z.infer<typeof ApartmentManifestSchema>;
export type ManifestRoom = z.infer<typeof ManifestRoomSchema>;

export function validateApartmentManifest(rawJson: unknown): {
  success: boolean;
  data?: ApartmentManifest;
  error?: string;
} {
  try {
    const data = ApartmentManifestSchema.parse(rawJson);
    return { success: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues;
      return { success: false, error: issues.map((e) => `${e.path?.join(".")}: ${e.message}`).join("; ") || err.message };
    }
    return { success: false, error: String(err) };
  }
}
