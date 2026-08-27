import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CommentModel } from 'src/generated/prisma/models';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async create(
    userId: string,
    taskId: string,
    dto: CreateCommentDto,
  ): Promise<CommentModel> {
    const task = await this.commentsRepository.findTaskById(taskId);

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return this.commentsRepository.create({
      taskId: task.id,
      userId,
      content: dto.content,
    });
  }

  async update(
    userId: string,
    commentId: string,
    dto: UpdateCommentDto,
  ): Promise<CommentModel> {
    const comment = await this.findExisting(commentId);
    this.assertOwner(comment, userId);

    return this.commentsRepository.update(comment.id, dto.content);
  }

  async remove(userId: string, commentId: string): Promise<void> {
    const comment = await this.findExisting(commentId);
    this.assertOwner(comment, userId);

    await this.commentsRepository.delete(comment.id);
  }

  private async findExisting(commentId: string): Promise<CommentModel> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return comment;
  }

  private assertOwner(comment: CommentModel, userId: string): void {
    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'Solo el autor puede modificar este comentario',
      );
    }
  }
}
