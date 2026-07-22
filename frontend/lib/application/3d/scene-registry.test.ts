import { describe, it, expect, beforeEach } from "vitest";
import * as THREE from "three";
import { SceneRegistry } from "./scene-registry";

describe("SceneRegistry", () => {
  let registry: SceneRegistry;

  beforeEach(() => {
    registry = new SceneRegistry();
  });

  it("should register and retrieve Object3D by entityId", () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    registry.register("entity-123", mesh);

    expect(registry.hasObject("entity-123")).toBe(true);
    expect(registry.getObject("entity-123")).toBe(mesh);
    expect(mesh.userData.entityId).toBe("entity-123");
  });

  it("should track dirty node updates correctly", () => {
    const mesh = new THREE.Mesh();
    registry.register("entity-456", mesh);

    expect(registry.isDirty("entity-456")).toBe(true);
    registry.clearDirty("entity-456");
    expect(registry.isDirty("entity-456")).toBe(false);

    registry.markDirty("entity-456");
    expect(registry.isDirty("entity-456")).toBe(true);
  });

  it("should unregister Object3D cleanly", () => {
    const mesh = new THREE.Mesh();
    registry.register("entity-789", mesh);
    registry.unregister("entity-789");

    expect(registry.hasObject("entity-789")).toBe(false);
    expect(registry.isDirty("entity-789")).toBe(false);
  });
});
