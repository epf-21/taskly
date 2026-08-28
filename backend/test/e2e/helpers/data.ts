import request from 'supertest';
import { App } from 'supertest/types';
import { Tokens, authHeader } from './auth';

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
};

export type Board = {
  id: string;
  name: string;
};

export type Column = {
  id: string;
  name: string;
};

export type Task = {
  id: string;
  title: string;
  columnId: string;
};

export async function createWorkspace(
  server: App,
  tokens: Tokens,
  name: string,
): Promise<Workspace> {
  const response = await request(server)
    .post('/workspaces')
    .set(...authHeader(tokens.accessToken))
    .send({ name })
    .expect(201);
  return response.body as Workspace;
}

export async function createBoard(
  server: App,
  tokens: Tokens,
  workspaceId: string,
  name: string,
): Promise<Board> {
  const response = await request(server)
    .post(`/workspaces/${workspaceId}/boards`)
    .set(...authHeader(tokens.accessToken))
    .send({ name })
    .expect(201);
  return response.body as Board;
}

export async function createColumn(
  server: App,
  tokens: Tokens,
  boardId: string,
  name: string,
): Promise<Column> {
  const response = await request(server)
    .post(`/boards/${boardId}/columns`)
    .set(...authHeader(tokens.accessToken))
    .send({ name })
    .expect(201);
  return response.body as Column;
}

export async function createTask(
  server: App,
  tokens: Tokens,
  columnId: string,
  title: string,
): Promise<Task> {
  const response = await request(server)
    .post(`/columns/${columnId}/tasks`)
    .set(...authHeader(tokens.accessToken))
    .send({ title, description: 'Task description', priority: 'high' })
    .expect(201);
  return response.body as Task;
}
