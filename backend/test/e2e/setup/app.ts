/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';

export type E2eApp = {
  app: INestApplication<App>;
  server: App;
};

export async function createE2eApp(): Promise<E2eApp> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  return { app, server: app.getHttpServer() };
}

export async function closeE2eApp(e2eApp: E2eApp | undefined): Promise<void> {
  await e2eApp?.app.close();
}
