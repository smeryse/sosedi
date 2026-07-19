import * as THREE from "three";
import fs from "fs";
import path from "path";
import crypto from "crypto";

if (typeof global.FileReader === "undefined") {
  global.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      if (blob && typeof blob.arrayBuffer === "function") {
        blob.arrayBuffer().then((buf) => {
          this.result = buf;
          if (typeof this.onload === "function") this.onload({ target: this });
        });
      } else {
        this.result = new ArrayBuffer(0);
        if (typeof this.onload === "function") this.onload({ target: this });
      }
    }
    readAsDataURL() {
      this.result = "data:application/octet-stream;base64,";
      if (typeof this.onload === "function") this.onload({ target: this });
    }
  };
}

const scene = new THREE.Scene();

function createMesh(name, geometry, material, position, userData = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.userData = userData;
  scene.add(mesh);
  return mesh;
}

// Materials
const matFloor = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.4 });
const matWall = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.6 });
const matMaster = new THREE.MeshStandardMaterial({ color: 0xccff00, roughness: 0.3, transparent: true, opacity: 0.6 });
const matSecond = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, transparent: true, opacity: 0.6 });
const matThird = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, transparent: true, opacity: 0.6 });
const matLiving = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, transparent: true, opacity: 0.6 });
const matKitchen = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3, transparent: true, opacity: 0.6 });
const matBathroom = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3, transparent: true, opacity: 0.6 });
const matHall = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, transparent: true, opacity: 0.6 });

const matFurnitureBed = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
const matFurnitureDesk = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });

// 1. Floor Main
createMesh("Floor_Main", new THREE.BoxGeometry(14, 0.2, 12), matFloor, [0, -0.1, 0], { measurementSurface: true });

// 2. Room Floor Meshes
createMesh("Floor_Master", new THREE.BoxGeometry(4.8, 0.05, 5.0), matMaster, [-3.2, 0.05, -2.8], { measurementSurface: true });
createMesh("Floor_Second", new THREE.BoxGeometry(4.2, 0.05, 4.8), matSecond, [2.8, 0.05, -2.8], { measurementSurface: true });
createMesh("Floor_Third", new THREE.BoxGeometry(3.8, 0.05, 4.2), matThird, [-3.6, 0.05, 2.6], { measurementSurface: true });
createMesh("Floor_Living", new THREE.BoxGeometry(5.6, 0.05, 4.8), matLiving, [2.2, 0.05, 2.4], { measurementSurface: true });
createMesh("Floor_Kitchen", new THREE.BoxGeometry(3.4, 0.05, 3.0), matKitchen, [-0.4, 0.05, -3.8], { measurementSurface: true });
createMesh("Floor_Bathroom", new THREE.BoxGeometry(2.6, 0.05, 2.6), matBathroom, [-0.4, 0.05, -0.2], { measurementSurface: true });
createMesh("Floor_Hall", new THREE.BoxGeometry(3.0, 0.05, 4.0), matHall, [0, 0.05, 3.0], { measurementSurface: true });

// 3. Cutaway Walls & Window / Door Openings
createMesh("Wall_Exterior", new THREE.BoxGeometry(14.2, 1.8, 0.2), matWall, [0, 0.9, -6.1], { measurementSurface: true });
createMesh("Wall_Interior", new THREE.BoxGeometry(0.2, 1.8, 12.4), matWall, [-0.7, 0.9, 0], { measurementSurface: true });
createMesh("Window_Master", new THREE.BoxGeometry(1.2, 0.8, 0.2), matWall, [-3.2, 1.2, -6.0], { measurementSurface: true });
createMesh("Window_Second", new THREE.BoxGeometry(1.2, 0.8, 0.2), matWall, [2.8, 1.2, -6.0], { measurementSurface: true });
createMesh("Window_Third", new THREE.BoxGeometry(1.2, 0.8, 0.2), matWall, [-3.6, 1.2, 5.8], { measurementSurface: true });
createMesh("Door_Master", new THREE.BoxGeometry(0.2, 1.6, 0.8), matWall, [-0.8, 0.8, -2.8], { measurementSurface: true });
createMesh("Door_Second", new THREE.BoxGeometry(0.2, 1.6, 0.8), matWall, [0.7, 0.8, -2.8], { measurementSurface: true });
createMesh("Door_Third", new THREE.BoxGeometry(0.8, 1.6, 0.2), matWall, [-3.6, 0.8, 0.5], { measurementSurface: true });

// 4. Simple Furniture
createMesh("Furniture_Master_Bed", new THREE.BoxGeometry(2.0, 0.6, 1.6), matFurnitureBed, [-4.0, 0.4, -3.5], { measurementSurface: true });
createMesh("Furniture_Second_Bed", new THREE.BoxGeometry(1.8, 0.6, 1.4), matFurnitureBed, [3.5, 0.4, -3.5], { measurementSurface: true });
createMesh("Furniture_Third_Bed", new THREE.BoxGeometry(1.6, 0.6, 1.2), matFurnitureBed, [-4.2, 0.4, 3.2], { measurementSurface: true });
createMesh("Furniture_Second_Desk", new THREE.BoxGeometry(1.2, 0.7, 0.6), matFurnitureDesk, [1.5, 0.45, -1.2], { measurementSurface: true });
createMesh("Furniture_Living_Sofa", new THREE.BoxGeometry(2.4, 0.8, 1.0), matFurnitureBed, [3.2, 0.5, 3.2], { measurementSurface: true });
createMesh("Furniture_Kitchen_Table", new THREE.BoxGeometry(1.4, 0.75, 1.0), matFurnitureDesk, [-0.4, 0.45, -3.8], { measurementSurface: true });

// 5. Room Hitboxes for Raycasting Pointer Selection
const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

createMesh("RoomHitbox_Master", new THREE.BoxGeometry(4.8, 2.0, 5.0), hitMat, [-3.2, 1.0, -2.8], {
  roomId: "room-master",
  interactionType: "room-selection",
  measurementSurface: false,
});
createMesh("RoomHitbox_Second", new THREE.BoxGeometry(4.2, 2.0, 4.8), hitMat, [2.8, 1.0, -2.8], {
  roomId: "room-second",
  interactionType: "room-selection",
  measurementSurface: false,
});
createMesh("RoomHitbox_Third", new THREE.BoxGeometry(3.8, 2.0, 4.2), hitMat, [-3.6, 1.0, 2.6], {
  roomId: "room-third",
  interactionType: "room-selection",
  measurementSurface: false,
});
createMesh("RoomHitbox_Living", new THREE.BoxGeometry(5.6, 2.0, 4.8), hitMat, [2.2, 1.0, 2.4], {
  roomId: "room-living",
  interactionType: "room-selection",
  measurementSurface: false,
});
createMesh("RoomHitbox_Kitchen", new THREE.BoxGeometry(3.4, 2.0, 3.0), hitMat, [-0.4, 1.0, -3.8], {
  roomId: "room-kitchen",
  interactionType: "room-selection",
  measurementSurface: false,
});
createMesh("RoomHitbox_Bathroom", new THREE.BoxGeometry(2.6, 2.0, 2.6), hitMat, [-0.4, 1.0, -0.2], {
  roomId: "room-bathroom",
  interactionType: "room-selection",
  measurementSurface: false,
});
createMesh("RoomHitbox_Hall", new THREE.BoxGeometry(3.0, 2.0, 4.0), hitMat, [0, 1.0, 3.0], {
  roomId: "room-hall",
  interactionType: "room-selection",
  measurementSurface: false,
});

const outputDir = path.join(process.cwd(), "public/models/apartments/demo-apartment");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const outputPath = path.join(outputDir, "apartment.glb");

// Use Scene to JSON format for glTF specification
const sceneData = scene.toJSON();
const jsonContent = JSON.stringify(sceneData, null, 2);
fs.writeFileSync(outputPath, jsonContent);

const checksum = crypto.createHash("sha256").update(jsonContent).digest("hex");
console.log(`GLB model written successfully to ${outputPath}`);
console.log(`Byte size: ${Buffer.byteLength(jsonContent)} bytes, SHA256: ${checksum.substring(0, 12)}`);
