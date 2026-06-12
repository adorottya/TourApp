import { apiFetch } from './client';
import type { TouristPosition } from '../types/execution';

export function recordPosition(latitude: number, longitude: number): Promise<TouristPosition> {
  return apiFetch('/api/position/record', { method: 'POST', body: JSON.stringify({ latitude, longitude }) });
}

export function getLatestPosition(): Promise<TouristPosition> {
  return apiFetch('/api/position/latest');
}
