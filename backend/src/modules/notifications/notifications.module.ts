import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';
import { TaskDueSoonScheduler } from './task-due-soon.scheduler';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsRepository,
    NotificationsService,
    TaskDueSoonScheduler,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
