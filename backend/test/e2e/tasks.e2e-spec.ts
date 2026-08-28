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
  Task,
  Workspace,
  createBoard,
  createColumn,
  createTask,
  createWorkspace,
} from './helpers/data';

describe('tareas y etiquetas', () => {
  let e2eApp: E2eApp;
  let ownerIdentity: TestIdentity;
  let owner: Awaited<ReturnType<typeof register>>;
  let memberIdentity: TestIdentity;
  let member: Awaited<ReturnType<typeof register>>;
  let workspace: Workspace;
  let board: Board;
  let firstColumn: Column;
  let secondColumn: Column;
  let task: Task;
  let secondTask: Task;
  let taskInSecondColumn: Task;
  let labelId: string;

  beforeAll(async () => {
    e2eApp = await createE2eApp();
    ownerIdentity = createTestIdentity('task-owner');
    owner = await register(e2eApp.server, ownerIdentity);
    memberIdentity = createTestIdentity('task-member');
    member = await register(e2eApp.server, memberIdentity);
    workspace = await createWorkspace(
      e2eApp.server,
      owner.tokens,
      `Task Workspace ${ownerIdentity.email}`,
    );
    board = await createBoard(
      e2eApp.server,
      owner.tokens,
      workspace.id,
      `Task Board ${ownerIdentity.email}`,
    );
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

  it('crear, listar, leer, actualizar mover, asignar y etiquetar tareas ', async () => {
    task = await createTask(
      e2eApp.server,
      owner.tokens,
      firstColumn.id,
      `Task A ${ownerIdentity.email}`,
    );
    secondTask = await createTask(
      e2eApp.server,
      owner.tokens,
      firstColumn.id,
      `Task B ${ownerIdentity.email}`,
    );
    taskInSecondColumn = await createTask(
      e2eApp.server,
      owner.tokens,
      secondColumn.id,
      `Task C ${ownerIdentity.email}`,
    );

    const listed = await request(e2eApp.server)
      .get(`/boards/${board.id}/tasks`)
      .set(...authHeader(owner.tokens.accessToken))
      .query({ priority: 'high', search: ownerIdentity.email })
      .expect(200);
    expect(listed.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: task.id }),
        expect.objectContaining({ id: secondTask.id }),
      ]),
    );

    await request(e2eApp.server)
      .get(`/tasks/${task.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual(
          expect.objectContaining({
            id: task.id,
            title: `Task A ${ownerIdentity.email}`,
          }),
        ),
      );

    await request(e2eApp.server)
      .patch(`/tasks/${task.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({
        title: `Updated Task ${ownerIdentity.email}`,
        priority: 'urgent',
      })
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual(
          expect.objectContaining({
            id: task.id,
            title: `Updated Task ${ownerIdentity.email}`,
            priority: 'urgent',
          }),
        ),
      );

    await request(e2eApp.server)
      .patch(`/tasks/${task.id}/move`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ columnId: secondColumn.id, afterId: taskInSecondColumn.id })
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual(
          expect.objectContaining({ id: task.id, columnId: secondColumn.id }),
        ),
      );

    await request(e2eApp.server)
      .post(`/tasks/${task.id}/assignees`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ userId: member.user.id })
      .expect(201);
    await request(e2eApp.server)
      .post(`/tasks/${task.id}/assignees`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ userId: member.user.id })
      .expect(409);

    const label = await request(e2eApp.server)
      .post(`/workspaces/${workspace.id}/labels`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ name: `Label ${ownerIdentity.email}`, color: '#123456' })
      .expect(201);
    labelId = label.body.id;

    await request(e2eApp.server)
      .get(`/workspaces/${workspace.id}/labels`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: labelId })]),
        ),
      );

    await request(e2eApp.server)
      .patch(`/workspaces/${workspace.id}/labels/${labelId}`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ name: `Updated Label ${ownerIdentity.email}` })
      .expect(200);

    await request(e2eApp.server)
      .post(`/tasks/${task.id}/labels`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ labelId })
      .expect(201);
    await request(e2eApp.server)
      .get(`/tasks/${task.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body.labels).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              label: expect.objectContaining({ id: labelId }),
            }),
          ]),
        ),
      );
    await request(e2eApp.server)
      .post(`/workspaces/${workspace.id}/labels`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ name: `Updated Label ${ownerIdentity.email}` })
      .expect(409);
  });

  it('eliminar responsables, etiquetas y archivar tareas', async () => {
    await request(e2eApp.server)
      .delete(`/tasks/${task.id}/assignees/${member.user.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(204);
    await request(e2eApp.server)
      .delete(`/tasks/${task.id}/labels/${labelId}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(204);
    await request(e2eApp.server)
      .delete(`/workspaces/${workspace.id}/labels/${labelId}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(204);

    await request(e2eApp.server)
      .delete(`/tasks/${secondTask.id}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(204);
    const active = await request(e2eApp.server)
      .get(`/boards/${board.id}/tasks`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200);
    expect(
      active.body.find(
        (candidate: { id: string }) => candidate.id === secondTask.id,
      ),
    ).toBeUndefined();

    const archived = await request(e2eApp.server)
      .get(`/boards/${board.id}/tasks`)
      .set(...authHeader(owner.tokens.accessToken))
      .query({ includeArchived: true })
      .expect(200);
    expect(archived.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: secondTask.id, isArchived: true }),
      ]),
    );
  });
});
