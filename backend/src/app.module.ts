import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './database/prisma.module';
import { envValidationSchema } from './config/env.validation';
import {
  appConfig,
  jwtConfig,
  databaseConfig,
  redisConfig,
} from './config/app.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { BoardsModule } from './modules/boards/boards.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { LabelsModule } from './modules/labels/labels.module';
import { ActivityModule } from './modules/activity/activity.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
      load: [appConfig, jwtConfig, databaseConfig, redisConfig],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    WorkspacesModule,
    BoardsModule,
    ColumnsModule,
    TasksModule,
    LabelsModule,
    ActivityModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
