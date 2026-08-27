import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type { CommentModel, TaskModel } from 'src/generated/prisma/models';

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTaskById(taskId: string): Promise<TaskModel | null> {
    return this.prisma.task.findUnique({ where: { id: taskId } });
  }

  create(data: {
    taskId: string;
    userId: string;
    content: string;
  }): Promise<CommentModel> {
    return this.prisma.comment.create({ data });
  }

  findById(id: string): Promise<CommentModel | null> {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  update(id: string, content: string): Promise<CommentModel> {
    return this.prisma.comment.update({
      where: { id },
      data: { content, editedAt: new Date() },
    });
  }

  delete(id: string): Promise<CommentModel> {
    return this.prisma.comment.delete({ where: { id } });
  }
}
