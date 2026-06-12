import { apiFetch } from './client';
import type { FollowEntry, IsFollowingResponse } from '../types/social';

export function follow(userId: string): Promise<void> {
  return apiFetch(`/api/social/follow/${userId}`, { method: 'POST' });
}

export function unfollow(userId: string): Promise<void> {
  return apiFetch(`/api/social/follow/${userId}`, { method: 'DELETE' });
}

export function getFollowing(): Promise<FollowEntry[]> {
  return apiFetch('/api/social/following');
}

export function getRecommendations(): Promise<FollowEntry[]> {
  return apiFetch('/api/social/recommendations');
}

export function isFollowing(userId: string): Promise<IsFollowingResponse> {
  return apiFetch(`/api/social/is-following/${userId}`);
}
