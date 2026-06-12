import { apiFetch } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';

export function login(req: LoginRequest): Promise<LoginResponse> {
  return apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(req) });
}

export function register(req: RegisterRequest): Promise<{ id: number }> {
  return apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(req) });
}
