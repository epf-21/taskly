import { Injectable } from '@nestjs/common';
import { ActivityAction } from 'src/generated/prisma/enums';
import type { ActivityLogModel } from 'src/generated/prisma/models';
import { ActivityRepository, ActivityLogInput } from './activity.repository';

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async log(input: ActivityLogInput): Promise<ActivityLogModel> {
    return this.activityRepository.create(input);
  }

  findByWorkspace(
    workspaceId: string,
    limit = 25,
    action?: ActivityAction,
  ): Promise<ActivityLogModel[]> {
    return this.activityRepository.findByWorkspace(workspaceId, limit, action);
  }

  findByBoard(
    boardId: string,
    limit = 25,
    action?: ActivityAction,
  ): Promise<ActivityLogModel[]> {
    return this.activityRepository.findByBoard(boardId, limit, action);
  }

  findByTask(
    taskId: string,
    limit = 25,
    action?: ActivityAction,
  ): Promise<ActivityLogModel[]> {
    return this.activityRepository.findByTask(taskId, limit, action);
  }
}
