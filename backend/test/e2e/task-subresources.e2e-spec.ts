/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

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

describe('subrecursos de tareas', () => {
  let e2eApp: E2eApp;
  let ownerIdentity: TestIdentity;
  let owner: Awaited<ReturnType<typeof register>>;
  let memberIdentity: TestIdentity;
  let member: Awaited<ReturnType<typeof register>>;
  let workspace: Workspace;
  let board: Board;
  let column: Column;
  let task: Task;
  let commentId: string;

  beforeAll(async () => {
    e2eApp = await createE2eApp();
    ownerIdentity = createTestIdentity('subresource-owner');
    owner = await register(e2eApp.server, ownerIdentity);
    memberIdentity = createTestIdentity('subresource-member');
    member = await register(e2eApp.server, memberIdentity);
    workspace = await createWorkspace(
      e2eApp.server,
      owner.tokens,
      `Subresource Workspace ${ownerIdentity.email}`,
    );
    board = await createBoard(
      e2eApp.server,
      owner.tokens,
      workspace.id,
      `Subresource Board ${ownerIdentity.email}`,
    );
    column = await createColumn(e2eApp.server, owner.tokens, board.id, 'Todo');
    task = await createTask(
      e2eApp.server,
      owner.tokens,
      column.id,
      `Subresource Task ${ownerIdentity.email}`,
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

  it('crear, editar, proteger y eliminar comentarios', async () => {
    const created = await request(e2eApp.server)
      .post(`/tasks/${task.id}/comments`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ content: `Comment ${ownerIdentity.email}` })
      .expect(201);
    commentId = created.body.id;

    await request(e2eApp.server)
      .patch(`/comments/${commentId}`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ content: `Edited comment ${ownerIdentity.email}` })
      .expect(200)
      .expect(({ body }) =>
        expect(body.content).toBe(`Edited comment ${ownerIdentity.email}`),
      );

    await request(e2eApp.server)
      .patch(`/comments/${commentId}`)
      .set(...authHeader(member.tokens.accessToken))
      .send({ content: 'Not the author' })
      .expect(403);

    await request(e2eApp.server)
      .delete(`/comments/${commentId}`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(204);
  });

  it('crear elementos de la lista de verificación, alternar y crear archivos adjuntos', async () => {
    const checklist = await request(e2eApp.server)
      .post(`/tasks/${task.id}/checklists`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ title: `Checklist ${ownerIdentity.email}` })
      .expect(201);
    const item = await request(e2eApp.server)
      .post(`/checklists/${checklist.body.id}/items`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({ content: 'First checklist item' })
      .expect(201);

    await request(e2eApp.server)
      .patch(`/checklist-items/${item.body.id}/toggle`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200)
      .expect(({ body }) => expect(body.isDone).toBe(true));
    await request(e2eApp.server)
      .patch(`/checklist-items/${item.body.id}/toggle`)
      .set(...authHeader(owner.tokens.accessToken))
      .expect(200)
      .expect(({ body }) => expect(body.isDone).toBe(false));

    await request(e2eApp.server)
      .post(`/tasks/${task.id}/attachments`)
      .set(...authHeader(owner.tokens.accessToken))
      .send({
        fileName: 'spec.txt',
        fileUrl: 'https://example.com/spec.txt',
        fileSizeBytes: 42,
        mimeType: 'text/plain',
      })
      .expect(201)
      .expect(({ body }) =>
        expect(body).toEqual(
          expect.objectContaining({
            taskId: task.id,
            fileName: 'spec.txt',
            fileSizeBytes: 42,
            mimeType: 'text/plain',
          }),
        ),
      );
  });
});
