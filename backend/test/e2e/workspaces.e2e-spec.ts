/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import request from 'supertest';
import { E2eApp, closeE2eApp, createE2eApp } from './setup/app';
import {
  TestIdentity,
  authHeader,
  createTestIdentity,
  register,
} from './helpers/auth';
import { Workspace, createWorkspace } from './helpers/data';

describe('espacio de trabajo y miembros)', () => {
  let e2eApp: E2eApp;
  let ownerIdentity: TestIdentity;
  let owner: Awaited<ReturnType<typeof register>>;
  let memberIdentity: TestIdentity;
  let member: Awaited<ReturnType<typeof register>>;
  let workspace: Workspace;

  beforeAll(async () => {
    e2eApp = await createE2eApp();
    ownerIdentity = createTestIdentity('workspace-owner');
    owner = await register(e2eApp.server, ownerIdentity);
    memberIdentity = createTestIdentity('workspace-member');
    member = await register(e2eApp.server, memberIdentity);
  });

  afterAll(async () => {
    await closeE2eApp(e2eApp);
  });

  it('crear, listar, leer, actualizar y eliminar workspaces', async () => {
    workspace = await createWorkspace(
      e2eApp.server,
      owner.tokens,
      `E2E Workspace ${ownerIdentity.email}`,
    );

    expect(workspace).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: `E2E Workspace ${ownerIdentity.email}`,
        slug: expect.stringContaining('e2e-workspace'),
        ownerId: owner.user.id,
      }),
    );

    const listed = await request(e2eApp.server)
      .get('/workspaces')
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200);
    expect(listed.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: workspace.id, role: 'owner' }),
      ]),
    );

    await request(e2eApp.server)
      .get(`/workspaces/${workspace.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200)
      .expect(({ body }) => expect(body.id).toBe(workspace.id));

    await request(e2eApp.server)
      .patch(`/workspaces/${workspace.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ name: `Renamed Workspace ${ownerIdentity.email}` })
      .expect(200)
      .expect(({ body }) =>
        expect(body.name).toBe(`Renamed Workspace ${ownerIdentity.email}`),
      );

    const disposable = await createWorkspace(
      e2eApp.server,
      owner.tokens,
      `Disposable Workspace ${ownerIdentity.email}`,
    );
    await request(e2eApp.server)
      .delete(`/workspaces/${disposable.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(204);
    await request(e2eApp.server)
      .get(`/workspaces/${disposable.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(403);
  });

  it('invitar a usuario, aceptar la invitación y gestion de los miembros', async () => {
    const invitation = await request(e2eApp.server)
      .post(`/workspaces/${workspace.id}/invitations`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ email: memberIdentity.email })
      .expect(201);
    expect(invitation.body).toEqual(
      expect.objectContaining({
        workspaceId: workspace.id,
        invitedEmail: memberIdentity.email,
        role: 'member',
        token: expect.any(String),
        status: 'pending',
      }),
    );

    const accepted = await request(e2eApp.server)
      .post('/workspaces/invitations/accept')
      .set(...authHeader(member.tokens.accessToken))
      .send({ token: invitation.body.token })
      .expect(201);
    expect(accepted.body).toEqual(
      expect.objectContaining({
        workspace: expect.objectContaining({ id: workspace.id }),
        role: 'member',
        alreadyMember: false,
      }),
    );

    const members = await request(e2eApp.server)
      .get(`/workspaces/${workspace.id}/members`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200);
    expect(members.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: owner.user.id, role: 'owner' }),
        expect.objectContaining({ userId: member.user.id, role: 'member' }),
      ]),
    );
    await request(e2eApp.server)
      .patch(`/workspaces/${workspace.id}/members/${owner.user.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ role: 'member' })
      .expect(403);
  });
});
