export interface OrderItem {
  tourId: string;
  tourName: string;
  price: number;
}

export interface Cart {
  id: string;
  touristId: string;
  items: OrderItem[];
  updatedAt: string | null;
}

export interface TourPurchaseToken {
  id: string;
  touristId: string;
  tourId: string;
  tourName: string;
  price: number;
  purchasedAt: string;
}
