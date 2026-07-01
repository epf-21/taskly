export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface StoreRefreshToken {
  userId: string;
  tokenHash: string;
  userAgent: string | undefined;
  ipAddress: string | undefined;
  expiresAt: Date;
}
