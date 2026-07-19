import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export class SceneRegistry {
  private registry = new Map<string, THREE.Object3D>();
  private dirtyNodeIds = new Set<string>();

  public register(id: string, object: THREE.Object3D): void {
    if (!id || !object) return;
    object.userData.entityId = id;
    this.registry.set(id, object);
    this.dirtyNodeIds.add(id);
  }

  public unregister(id: string): void {
    if (!id) return;
    this.registry.delete(id);
    this.dirtyNodeIds.delete(id);
  }

  public getObject(id: string): THREE.Object3D | undefined {
    return this.registry.get(id);
  }

  public hasObject(id: string): boolean {
    return this.registry.has(id);
  }

  public markDirty(id: string): void {
    if (this.registry.has(id)) {
      this.dirtyNodeIds.add(id);
    }
  }

  public clearDirty(id: string): void {
    this.dirtyNodeIds.delete(id);
  }

  public isDirty(id: string): boolean {
    return this.dirtyNodeIds.has(id);
  }

  public getDirtyNodeIds(): string[] {
    return Array.from(this.dirtyNodeIds);
  }

  public clearAllDirty(): void {
    this.dirtyNodeIds.clear();
  }

  public focusEntity(
    id: string,
    camera: THREE.Camera,
    controls?: OrbitControlsImpl | null,
    offsetMultiplier: number = 1.8
  ): boolean {
    const object = this.getObject(id);
    if (!object) return false;

    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return false;

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = Math.max(maxDim * offsetMultiplier, 3);

    const targetPos = new THREE.Vector3()
      .copy(center)
      .add(new THREE.Vector3(0, distance * 0.75, distance * 0.85));

    camera.position.copy(targetPos);

    if (controls) {
      controls.target.copy(center);
      controls.update();
    } else {
      camera.lookAt(center);
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.updateProjectionMatrix();
    }

    return true;
  }

  public getWorldBounds(): THREE.Box3 {
    const combined = new THREE.Box3();
    for (const object of this.registry.values()) {
      if (object.visible) {
        combined.expandByObject(object);
      }
    }
    return combined;
  }

  public clear(): void {
    this.registry.clear();
    this.dirtyNodeIds.clear();
  }

  public get size(): number {
    return this.registry.size;
  }
}

export const globalSceneRegistry = new SceneRegistry();
