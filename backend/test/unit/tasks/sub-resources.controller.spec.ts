import {
  ChecklistItemController,
  ChecklistItemsController,
  ChecklistsController,
} from 'src/modules/tasks/checklists/checklists.controller';
import {
  CommentsController,
  CommentItemController,
} from 'src/modules/tasks/comments/comments.controller';
import { AttachmentsController } from 'src/modules/tasks/attachments/attachments.controller';

describe('Task sub-resource controllers', () => {
  const service = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addItem: jest.fn(),
    toggleItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates comment create, update, and delete', async () => {
    const comments = new CommentsController(service as never);
    const comment = new CommentItemController(service as never);

    comments.create('user-1', 'task-1', { content: 'Nuevo' });
    comment.update('user-1', 'comment-1', { content: 'Editado' });
    await comment.remove('user-1', 'comment-1');

    expect(service.create).toHaveBeenCalledWith('user-1', 'task-1', {
      content: 'Nuevo',
    });
    expect(service.update).toHaveBeenCalledWith('user-1', 'comment-1', {
      content: 'Editado',
    });
    expect(service.remove).toHaveBeenCalledWith('user-1', 'comment-1');
  });

  it('delegates checklist creation, item creation, and toggle', () => {
    const checklists = new ChecklistsController(service as never);
    const items = new ChecklistItemsController(service as never);
    const item = new ChecklistItemController(service as never);

    checklists.create('task-1', { title: 'QA' });
    items.addItem('checklist-1', { content: 'Compilar' });
    item.toggle('item-1');

    expect(service.create).toHaveBeenCalledWith('task-1', { title: 'QA' });
    expect(service.addItem).toHaveBeenCalledWith('checklist-1', {
      content: 'Compilar',
    });
    expect(service.toggleItem).toHaveBeenCalledWith('item-1');
  });

  it('delegates attachment registration with the authenticated user', () => {
    const attachments = new AttachmentsController(service as never);

    attachments.create('user-1', 'task-1', {
      fileName: 'spec.pdf',
      fileUrl: 'https://files.example/spec.pdf',
    });

    expect(service.create).toHaveBeenCalledWith('user-1', 'task-1', {
      fileName: 'spec.pdf',
      fileUrl: 'https://files.example/spec.pdf',
    });
  });
});
