export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
