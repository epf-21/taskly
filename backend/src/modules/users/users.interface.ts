export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
}

export interface UpdateUserData {
  fullName?: string;
  avatarUrl?: string;
}
