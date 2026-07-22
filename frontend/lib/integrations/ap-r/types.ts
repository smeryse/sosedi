export type RawAPRFeedItem = {
  externalId: string;
  originalUrl?: string;
  city?: string;
  complexName?: string;
  developer?: string;
  address?: string;
  propertyType?: string;
  rooms?: number | string;
  area?: number | string;
  floor?: number | string;
  totalFloors?: number | string;
  price?: number | string;
  pricePerSqM?: number | string;
  completionDate?: string;
  finishing?: string;
  images?: string | string[];
  latitude?: number | string;
  longitude?: number | string;
  description?: string;
  isAvailable?: boolean | string;
  updatedAt?: string;
};

export type NormalizedAPRProperty = {
  id?: string;
  externalId: string;
  source: "ap-r";
  originalUrl: string;
  city: string;
  complexName: string;
  developer: string;
  address: string;
  propertyType: "flat" | "studio" | "apartment";
  rooms: number;
  area: number;
  floor: number | null;
  totalFloors: number | null;
  price: number;
  pricePerSqM: number;
  completionDate: string;
  finishing: string;
  images: string[];
  latitude: number | null;
  longitude: number | null;
  description: string;
  isAvailable: boolean;
  fetchedAt: string;
  lastCheckedAt: string;
};

export type APRImportResult = {
  id?: string;
  status: "success" | "partial_success" | "failed";
  processedCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  startedAt: string;
  completedAt: string;
  errorMessages: string[];
  details?: Record<string, unknown>;
};

export type APRPropertyFilters = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number[];
  minArea?: number;
  maxArea?: number;
  completionDate?: string;
  propertyType?: "flat" | "studio" | "apartment";
  isAvailableOnly?: boolean;
};

export type FreshnessStatus = {
  isStale: boolean;
  staleDaysThreshold: number;
  daysOld: number;
  displayNote: string;
};
