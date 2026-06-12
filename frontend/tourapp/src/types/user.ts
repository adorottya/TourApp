export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  biography: string | null;
  motto: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  biography?: string;
  motto?: string;
}
