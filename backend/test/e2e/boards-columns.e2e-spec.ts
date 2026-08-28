/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import request from 'supertest';
import { E2eApp, closeE2eApp, createE2eApp } from './setup/app';
import {
  TestIdentity,
  authHeader,
  createTestIdentity,
  register,
} from './helpers/auth';
import {
  Board,
  Column,
  Workspace,
  createBoard,
  createColumn,
  createWorkspace,
} from './helpers/data';

describe('tablero y columnas', () => {
  let e2eApp: E2eApp;
  let ownerIdentity: TestIdentity;
  let owner: Awaited<ReturnType<typeof register>>;
  let memberIdentity: TestIdentity;
  let member: Awaited<ReturnType<typeof register>>;
  let workspace: Workspace;
  let board: Board;
  let firstColumn: Column;
  let secondColumn: Column;
  let thirdColumn: Column;

  beforeAll(async () => {
    e2eApp = await createE2eApp();
    ownerIdentity = createTestIdentity('board-owner');
    owner = await register(e2eApp.server, ownerIdentity);
    memberIdentity = createTestIdentity('board-member');
    member = await register(e2eApp.server, memberIdentity);
    workspace = await createWorkspace(
      e2eApp.server,
      owner.tokens,
      `Board Workspace ${ownerIdentity.email}`,
    );

    const invitation = await request(e2eApp.server)
      .post(`/workspaces/${workspace.id}/invitations`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ email: memberIdentity.email })
      .expect(201);
    await request(e2eApp.server)
      .post('/workspaces/invitations/accept')
      .set(...authHeader(member.tokens.accessToken))
      .send({ token: invitation.body.token })
      .expect(201);
  });

  afterAll(async () => {
    await closeE2eApp(e2eApp);
  });

  it('Aplicar permisos de espacio de trabajo y administración de tableros', async () => {
    await request(e2eApp.server)
      .post(`/workspaces/${workspace.id}/boards`)
      .set(...authHeader(member.tokens.accessToken))
      .send({ name: 'Should be forbidden' })
      .expect(403);

    await request(e2eApp.server)
      .patch(`/workspaces/${workspace.id}/members/${member.user.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ role: 'admin' })
      .expect(204);

    board = await createBoard(
      e2eApp.server,
      owner.tokens,
      workspace.id,
      `E2E Board ${ownerIdentity.email}`,
    );
    expect(board).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: `E2E Board ${ownerIdentity.email}`,
      }),
    );

    const listed = await request(e2eApp.server)
      .get(`/workspaces/${workspace.id}/boards`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200);
    expect(listed.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: board.id })]),
    );

    await request(e2eApp.server)
      .get(`/boards/${board.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual(
          expect.objectContaining({ id: board.id, columns: expect.any(Array) }),
        ),
      );

    await request(e2eApp.server)
      .patch(`/boards/${board.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ name: `Updated Board ${ownerIdentity.email}` })
      .expect(200)
      .expect(({ body }) =>
        expect(body.name).toBe(`Updated Board ${ownerIdentity.email}`),
      );
  });

  it('crear, actualizar, reordenar y movel columnas', async () => {
    firstColumn = await createColumn(
      e2eApp.server,
      owner.tokens,
      board.id,
      'Todo',
    );
    secondColumn = await createColumn(
      e2eApp.server,
      owner.tokens,
      board.id,
      'Doing',
    );
    thirdColumn = await createColumn(
      e2eApp.server,
      owner.tokens,
      board.id,
      'Done',
    );

    await request(e2eApp.server)
      .patch(`/columns/${secondColumn.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ name: 'In progress', wipLimit: 5 })
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual(
          expect.objectContaining({
            id: secondColumn.id,
            name: 'In progress',
            wipLimit: 5,
          }),
        ),
      );

    await request(e2eApp.server)
      .patch(`/boards/${board.id}/columns/reorder`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ columnId: thirdColumn.id, afterId: firstColumn.id })
      .expect(200);

    await request(e2eApp.server)
      .patch(`/boards/${board.id}/columns/reorder`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ columnId: firstColumn.id })
      .expect(400);

    await request(e2eApp.server)
      .delete(`/columns/${thirdColumn.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(204);
  });

  it('Archivar los tableros y los excluye de la lista de espacios de trabajo predeterminada', async () => {
    await request(e2eApp.server)
      .delete(`/boards/${board.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(204);

    const activeBoards = await request(e2eApp.server)
      .get(`/workspaces/${workspace.id}/boards`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200);
    expect(
      activeBoards.body.find(
        (candidate: { id: string }) => candidate.id === board.id,
      ),
    ).toBeUndefined();

    const allBoards = await request(e2eApp.server)
      .get(`/workspaces/${workspace.id}/boards`)
      .set(...authHeader(owner.tokens.accessToken))
      .query({ includeArchived: true })
      .expect(200);
    expect(allBoards.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: board.id, isArchived: true }),
      ]),
    );
  });
});
