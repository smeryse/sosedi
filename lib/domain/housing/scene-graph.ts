import { z } from "zod";

export const Vector3TupleSchema = z.tuple([z.number(), z.number(), z.number()]);
export const QuaternionTupleSchema = z.tuple([z.number(), z.number(), z.number(), z.number()]);

export const TransformSchema = z.object({
  position: Vector3TupleSchema.default([0, 0, 0]),
  rotation: Vector3TupleSchema.default([0, 0, 0]), // Euler degrees/radians
  scale: Vector3TupleSchema.default([1, 1, 1]),
});

export const BaseNodeSchema = z.object({
  id: z.string().min(1),
  parentId: z.string().min(1).nullable().default(null),
  name: z.string().min(1),
  type: z.string(),
  version: z.number().int().positive().default(1),
  transform: TransformSchema.default({ position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const SiteNodeSchema = BaseNodeSchema.extend({
  type: z.literal("site"),
  address: z.string().optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
});

export const BuildingNodeSchema = BaseNodeSchema.extend({
  type: z.literal("building"),
  buildingId: z.string().optional(),
  floorsCount: z.number().int().positive().default(1),
});

export const LevelNodeSchema = BaseNodeSchema.extend({
  type: z.literal("level"),
  levelNumber: z.number().int().default(1),
  elevationMeters: z.number().default(0),
  heightMeters: z.number().positive().default(2.8),
});

export const WallNodeSchema = BaseNodeSchema.extend({
  type: z.literal("wall"),
  startCornerId: z.string().min(1),
  endCornerId: z.string().min(1),
  thicknessMeters: z.number().positive().default(0.2),
  heightMeters: z.number().positive().default(2.8),
  isExterior: z.boolean().default(false),
  materialColor: z.string().default("#9ca3af"),
});

export const SlabNodeSchema = BaseNodeSchema.extend({
  type: z.literal("slab"),
  polygonPoints: z.array(z.tuple([z.number(), z.number()])),
  thicknessMeters: z.number().positive().default(0.25),
  materialColor: z.string().default("#e5e7eb"),
});

export const OpeningNodeSchema = BaseNodeSchema.extend({
  type: z.literal("opening"),
  wallNodeId: z.string().min(1),
  openingKind: z.enum(["door", "window", "passageway"]),
  offsetMeters: z.number().nonnegative(),
  widthMeters: z.number().positive().default(0.9),
  heightMeters: z.number().positive().default(2.1),
  elevationFromFloorMeters: z.number().nonnegative().default(0),
});

export const FurnitureNodeSchema = BaseNodeSchema.extend({
  type: z.literal("furniture"),
  assetCatalogId: z.string(),
  placementType: z.enum(["floor", "wall", "in-wall", "ceiling"]).default("floor"),
  dimensionsMeters: Vector3TupleSchema.default([1, 1, 1]),
  modelUrl: z.string().optional(),
});

export const RoomNodeSchema = BaseNodeSchema.extend({
  type: z.literal("room"),
  roomId: z.enum([
    "room-master",
    "room-second",
    "room-third",
    "room-living",
    "room-kitchen",
    "room-bathroom",
    "room-hall",
  ]),
  roomKind: z.enum(["bedroom", "living", "kitchen", "bathroom", "hall"]),
  accessType: z.enum(["private", "common"]),
  areaM2: z.number().positive(),
  selectable: z.boolean().default(true),
  polygonPoints: z.array(z.tuple([z.number(), z.number()])),
});

export const SceneNodeSchema = z.discriminatedUnion("type", [
  SiteNodeSchema,
  BuildingNodeSchema,
  LevelNodeSchema,
  WallNodeSchema,
  SlabNodeSchema,
  OpeningNodeSchema,
  FurnitureNodeSchema,
  RoomNodeSchema,
]);

export type Vector3Tuple = z.infer<typeof Vector3TupleSchema>;
export type Transform = z.infer<typeof TransformSchema>;
export type BaseNode = z.infer<typeof BaseNodeSchema>;
export type SiteNode = z.infer<typeof SiteNodeSchema>;
export type BuildingNode = z.infer<typeof BuildingNodeSchema>;
export type LevelNode = z.infer<typeof LevelNodeSchema>;
export type WallNode = z.infer<typeof WallNodeSchema>;
export type SlabNode = z.infer<typeof SlabNodeSchema>;
export type OpeningNode = z.infer<typeof OpeningNodeSchema>;
export type FurnitureNode = z.infer<typeof FurnitureNodeSchema>;
export type RoomNode = z.infer<typeof RoomNodeSchema>;
export type SceneNode = z.infer<typeof SceneNodeSchema>;
