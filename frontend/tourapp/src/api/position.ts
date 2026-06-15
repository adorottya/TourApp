import { apiFetch } from './client';
import type { KeypointCheckResult, TouristPosition } from '../types/execution';

export interface RecordPositionResponse {
  position: TouristPosition;
  executionProgress?: KeypointCheckResult;
}

export function recordPosition(latitude: number, longitude: number): Promise<RecordPositionResponse> {
  return apiFetch('/api/position/record', { method: 'POST', body: JSON.stringify({ latitude, longitude }) });
}

export function getLatestPosition(): Promise<TouristPosition> {
  return apiFetch('/api/position/latest');
}
