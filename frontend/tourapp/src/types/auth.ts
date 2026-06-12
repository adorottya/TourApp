export type Role = 'guide' | 'tourist' | 'administrator';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role: 'guide' | 'tourist';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
