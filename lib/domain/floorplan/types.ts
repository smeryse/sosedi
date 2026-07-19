export interface Corner2D {
  id: string;
  x: number; // in meters
  y: number; // in meters
  wallIds: string[];
}

export interface Wall2D {
  id: string;
  startCornerId: string;
  endCornerId: string;
  thicknessMeters: number;
  heightMeters: number;
  isExterior: boolean;
}

export interface Room2D {
  id: string;
  name: string;
  cornerIds: string[];
  polygonPoints: [number, number][]; // [[x,y], ...]
  areaM2: number;
  perimeterMeters: number;
  roomId?: "room-master" | "room-second" | "room-third" | "room-living" | "room-kitchen" | "room-bathroom" | "room-hall";
}

export interface FloorplanGraph {
  corners: Map<string, Corner2D>;
  walls: Map<string, Wall2D>;
  rooms: Room2D[];
}
