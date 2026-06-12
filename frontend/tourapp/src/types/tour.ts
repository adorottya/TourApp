export interface Tour {
  id: string;
  guideId: string;
  name: string;
  description: string;
  difficulty: string;
  tags: string[];
  status: string;
  price: number;
  createdAt: string;
}

export interface Keypoint {
  id: string;
  tourId: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image: string | null;
  orderIndex: number;
}

export interface CreateTourRequest {
  name: string;
  description: string;
  difficulty: string;
  tags: string[];
  price?: number;
}

export interface UpdateTourRequest {
  name?: string;
  description?: string;
  difficulty?: string;
  tags?: string[];
  status?: string;
  price?: number;
}

export interface CreateKeypointRequest {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image?: string;
  orderIndex: number;
}
