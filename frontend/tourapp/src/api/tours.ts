import { apiFetch } from './client';
import type { CreateKeypointRequest, CreateTourRequest, Keypoint, Tour, UpdateTourRequest } from '../types/tour';

export function listPublished(): Promise<Tour[]> {
  return apiFetch('/api/tours');
}

export function myTours(): Promise<Tour[]> {
  return apiFetch('/api/tours/my');
}

export function getTour(id: string): Promise<Tour> {
  return apiFetch(`/api/tours/${id}`);
}

export function createTour(req: CreateTourRequest): Promise<Tour> {
  return apiFetch('/api/tours', { method: 'POST', body: JSON.stringify(req) });
}

export function updateTour(id: string, req: UpdateTourRequest): Promise<Tour> {
  return apiFetch(`/api/tours/${id}`, { method: 'PUT', body: JSON.stringify(req) });
}

export function getKeypoints(tourId: string): Promise<Keypoint[]> {
  return apiFetch(`/api/tours/${tourId}/keypoints`);
}

export function addKeypoint(tourId: string, req: CreateKeypointRequest): Promise<Keypoint> {
  return apiFetch(`/api/tours/${tourId}/keypoints`, { method: 'POST', body: JSON.stringify(req) });
}

export function deleteKeypoint(tourId: string, keypointId: string): Promise<void> {
  return apiFetch(`/api/tours/${tourId}/keypoints/${keypointId}`, { method: 'DELETE' });
}

export function reorderKeypoints(tourId: string, keypointIds: string[]): Promise<Keypoint[]> {
  return apiFetch(`/api/tours/${tourId}/keypoints/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ keypointIds }),
  });
}
