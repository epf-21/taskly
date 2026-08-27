import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequireBoardRole } from 'src/common/decorators/roles.decorator';
import { BoardRolesGuard } from 'src/common/guards/board-roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('tasks/:taskId/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireBoardRole('member')
  create(
    @CurrentUser('id') userId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateAttachmentDto,
  ) {
    return this.attachmentsService.create(userId, taskId, dto);
  }
}
