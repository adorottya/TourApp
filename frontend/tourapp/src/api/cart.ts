import { apiFetch } from './client';
import type { Cart, TourPurchaseToken } from '../types/cart';

export function getCart(): Promise<Cart> {
  return apiFetch('/api/cart');
}

export function addToCart(tourId: string): Promise<Cart> {
  return apiFetch('/api/cart/items', { method: 'POST', body: JSON.stringify({ tourId }) });
}

export function removeFromCart(tourId: string): Promise<Cart> {
  return apiFetch(`/api/cart/items/${tourId}`, { method: 'DELETE' });
}

export function checkout(): Promise<TourPurchaseToken[]> {
  return apiFetch('/api/cart/checkout', { method: 'POST' });
}
