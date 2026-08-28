import request from 'supertest';
import { E2eApp, closeE2eApp, createE2eApp } from './setup/app';
import {
  TestIdentity,
  Tokens,
  createTestIdentity,
  authHeader,
  login,
  register,
  waitForNextJwtTimestamp,
} from './helpers/auth';

describe('Autenticación y perfil', () => {
  let e2eApp: E2eApp;
  let ownerIdentity: TestIdentity;
  let owner: Awaited<ReturnType<typeof register>>;
  let memberIdentity: TestIdentity;
  let member: Awaited<ReturnType<typeof register>>;

  beforeAll(async () => {
    e2eApp = await createE2eApp();
    ownerIdentity = createTestIdentity('auth-owner');
    owner = await register(e2eApp.server, ownerIdentity);
    memberIdentity = createTestIdentity('auth-member');
    member = await register(e2eApp.server, memberIdentity);
  });

  afterAll(async () => {
    await closeE2eApp(e2eApp);
  });

  it('registra usuarios y devuelve tokens sin exponer el hash de la contraseña', () => {
    expect(owner.user).toEqual(
      expect.objectContaining({
        email: ownerIdentity.email,
        fullName: ownerIdentity.fullName,
      }),
    );
    expect(owner.user).not.toHaveProperty('passwordHash');
    expect(owner.tokens.accessToken).toEqual(expect.any(String));
    expect(owner.tokens.refreshToken).toEqual(expect.any(String));
    expect(member.user.id).not.toBe(owner.user.id);
  });

  it('Rechaza el registro no válido y el acceso al perfil no autenticado', async () => {
    await request(e2eApp.server)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'short', fullName: '' })
      .expect(400);

    await request(e2eApp.server).get('/users/me').expect(401);
  });

  it('iniciar sessión, rotar el refresh token y cierre de sessión con el refresh token', async () => {
    await waitForNextJwtTimestamp();
    const loggedIn = await login(e2eApp.server, ownerIdentity);

    expect(loggedIn.user.id).toBe(owner.user.id);
    expect(loggedIn.tokens.accessToken).toEqual(expect.any(String));

    await waitForNextJwtTimestamp();
    const refreshed = await request(e2eApp.server)
      .post('/auth/refresh')
      .send({ refreshToken: loggedIn.tokens.refreshToken })
      .expect(200);
    const rotatedTokens: Tokens = {
      accessToken: loggedIn.tokens.accessToken,
      refreshToken: (refreshed.body as { refreshToken: string }).refreshToken,
    };

    expect(rotatedTokens.refreshToken).not.toBe(loggedIn.tokens.refreshToken);
    await request(e2eApp.server)
      .post('/auth/refresh')
      .send({ refreshToken: loggedIn.tokens.refreshToken })
      .expect(401);

    await request(e2eApp.server)
      .post('/auth/logout')
      .send({ refreshToken: rotatedTokens.refreshToken })
      .expect(204);
    await request(e2eApp.server)
      .post('/auth/refresh')
      .send({ refreshToken: rotatedTokens.refreshToken })
      .expect(401);
  });

  it('leer y actualizar el usuario actual', async () => {
    const profile = await request(e2eApp.server)
      .get('/users/me')
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200);
    expect(profile.body).toEqual(
      expect.objectContaining({
        id: owner.user.id,
        email: ownerIdentity.email,
      }),
    );

    const updated = await request(e2eApp.server)
      .patch('/users/me')
      .set(...authHeader(owner.tokens.accessToken))
      .send({
        fullName: `Updated ${ownerIdentity.fullName}`,
        avatarUrl: 'https://example.com/avatar.png',
      })
      .expect(200);
    expect(updated.body).toEqual(
      expect.objectContaining({
        id: owner.user.id,
        fullName: `Updated ${ownerIdentity.fullName}`,
        avatarUrl: 'https://example.com/avatar.png',
      }),
    );
  });
});
