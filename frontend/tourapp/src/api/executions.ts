import { apiFetch } from './client';
import type { KeypointCheckResult, TourExecution } from '../types/execution';

export function startExecution(tokenId: string): Promise<TourExecution> {
  return apiFetch('/api/executions', { method: 'POST', body: JSON.stringify({ tokenId }) });
}

export function getActiveExecution(): Promise<TourExecution> {
  return apiFetch('/api/executions/active');
}

export function checkKeypoints(id: string): Promise<KeypointCheckResult> {
  return apiFetch(`/api/executions/${id}/check-keypoints`);
}

export function updateExecutionPosition(id: string, latitude: number, longitude: number): Promise<TourExecution> {
  return apiFetch(`/api/executions/${id}/update-position`, { method: 'POST', body: JSON.stringify({ latitude, longitude }) });
}

export function completeExecution(id: string): Promise<TourExecution> {
  return apiFetch(`/api/executions/${id}/complete`, { method: 'POST' });
}

export function abandonExecution(id: string): Promise<TourExecution> {
  return apiFetch(`/api/executions/${id}/abandon`, { method: 'POST' });
}
