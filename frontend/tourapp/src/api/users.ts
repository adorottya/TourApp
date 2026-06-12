import { apiFetch } from './client';
import type { UpdateProfileRequest, User } from '../types/user';

export function getProfile(): Promise<User> {
  return apiFetch('/api/users/profile');
}

export function updateProfile(req: UpdateProfileRequest): Promise<unknown> {
  return apiFetch('/api/users/profile', { method: 'PUT', body: JSON.stringify(req) });
}

export function listUsers(): Promise<User[]> {
  return apiFetch('/api/users');
}

export function blockUser(id: number): Promise<unknown> {
  return apiFetch(`/api/users/${id}/block`, { method: 'PATCH' });
}
