import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { ConfigModule } from '@nestjs/config';
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
    PrismaModule,
    UsersModule,
    AuthModule,
    WorkspacesModule,
    BoardsModule,
    ColumnsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
