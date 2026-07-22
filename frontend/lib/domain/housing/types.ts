export type RoomId =
  | "room-master"
  | "room-second"
  | "room-third"
  | "room-living"
  | "room-kitchen"
  | "room-bathroom"
  | "room-hall"
  | null;

export interface BuildingEntity {
  id: string;
  name: string;
  address: string;
  district: string;
  coordinates: [number, number]; // [lng, lat]
  priceFrom: number;
  heightM: number;
  timeToKubSUMin: number;
  matchPercentage: number;
  image: string;
  roommates: {
    name: string;
    avatar: string;
    match: number;
  }[];
}

export interface RoomEntity {
  id: RoomId & string;
  apartmentId: string;
  name: string;
  type: "private" | "common";
  areaM2: number;
  hasBalcony?: boolean;
  hasWorkplace?: boolean;
  hasPrivateBath?: boolean;
  windowSize: "large" | "medium" | "standard";
  noiseLevel: "quiet" | "moderate";
  weight: number;
  baseRentShare?: number;
}

export interface RoommateEntity {
  id: string;
  name: string;
  avatar: string;
  role: string;
  assignedRoomId: string;
  calculatedPrice: number;
}

export interface ApartmentEntity {
  id: string;
  buildingId: string;
  title: string;
  roomsCount: number;
  areaM2: number;
  totalRent: number;
  glbUrl?: string;
  glbMobileUrl?: string;
  manifestUrl?: string;
  rooms: RoomEntity[];
}

export interface RentCalculationResult {
  totalRent: number;
  assignments: {
    roommateId: string;
    roommateName: string;
    roomId: string;
    roomName: string;
    calculatedPrice: number;
    breakdown: {
      baseShare: number;
      areaBonus: number;
      amenityBonus: number;
    };
  }[];
  isValid: boolean;
}
