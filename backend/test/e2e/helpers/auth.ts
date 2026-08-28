import request from 'supertest';
import { App } from 'supertest/types';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type TestIdentity = {
  email: string;
  fullName: string;
  password: string;
};

export type RegisteredUser = {
  id: string;
  email: string;
  fullName: string;
};

type AuthResponse = {
  user: RegisteredUser;
  accessToken: string;
  refreshToken: string;
};

export function createTestIdentity(label: string): TestIdentity {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return {
    email: `e2e-${label}-${suffix}@example.com`,
    fullName: `E2E ${label} ${suffix}`,
    password: 'E2ePassword-123',
  };
}

export async function register(
  server: App,
  identity: TestIdentity,
): Promise<{ user: RegisteredUser; tokens: Tokens }> {
  const response = await request(server)
    .post('/auth/register')
    .send(identity)
    .expect(201);
  const body = response.body as AuthResponse;

  return {
    user: body.user,
    tokens: {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    },
  };
}

export async function login(
  server: App,
  identity: TestIdentity,
): Promise<{ user: RegisteredUser; tokens: Tokens }> {
  const response = await request(server)
    .post('/auth/login')
    .send({ email: identity.email, password: identity.password })
    .expect(200);
  const body = response.body as AuthResponse;

  return {
    user: body.user,
    tokens: {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    },
  };
}

export function authHeader(token: string): ['Authorization', string] {
  return ['Authorization', `Bearer ${token}`];
}

export function waitForNextJwtTimestamp(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1100));
}
