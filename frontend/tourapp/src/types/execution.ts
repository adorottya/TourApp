export interface TourExecution {
  id: string;
  touristId: string;
  tourId: string;
  tokenId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  visitedKeypoints: string[];
  lastKnownLat: number;
  lastKnownLong: number;
  lastActivity: string | null;
}

export interface TouristPosition {
  id: string;
  touristId: string;
  latitude: number;
  longitude: number;
  recordedAt: string;
}

export interface KeypointCheckResult {
  visitedKeypoints: string[];
  totalKeypoints: number;
  lastKnownLat: number;
  lastKnownLon: number;
}
