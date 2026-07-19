import * as THREE from "three";

export interface AssetDisposeInterface {
  dispose(): void;
}

export class ThreeAssetManager {
  private static instance: ThreeAssetManager;
  private textureCache = new Map<string, THREE.Texture>();

  private constructor() {}

  public static getInstance(): ThreeAssetManager {
    if (!ThreeAssetManager.instance) {
      ThreeAssetManager.instance = new ThreeAssetManager();
    }
    return ThreeAssetManager.instance;
  }

  /**
   * Safely disposes all GPU resources associated with a Three.js scene or object.
   */
  public disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => this.disposeMaterial(mat));
          } else {
            this.disposeMaterial(child.material);
          }
        }
      }
    });
  }

  private disposeMaterial(material: THREE.Material): void {
    material.dispose();
    Object.keys(material).forEach((key) => {
      const value = (material as unknown as Record<string, unknown>)[key];
      if (value && typeof value === "object" && "isTexture" in value) {
        (value as THREE.Texture).dispose();
      }
    });
  }

  public clearCache(): void {
    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
  }
}
