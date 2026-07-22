import * as THREE from "three";

export interface DistanceMeasurement {
  pointA: THREE.Vector3;
  pointB: THREE.Vector3;
  distanceMeters: number;
}

export class ThreeMeasurementSystem {
  /**
   * Calculates actual 3D Euclidean distance between two world coordinate vectors in meters.
   */
  public static calculateDistance(p1: THREE.Vector3, p2: THREE.Vector3, scaleFactor: number = 1.0): DistanceMeasurement {
    const distanceMeters = p1.distanceTo(p2) * scaleFactor;
    return {
      pointA: p1.clone(),
      pointB: p2.clone(),
      distanceMeters: Math.round(distanceMeters * 10) / 10, // Round to 1 decimal place (e.g. 3.8m)
    };
  }
}
