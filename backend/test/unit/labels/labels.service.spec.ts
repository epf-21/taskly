import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from 'src/modules/activity/activity.service';
import { CreateLabelDto } from 'src/modules/labels/dto/create-label.dto';
import { UpdateLabelDto } from 'src/modules/labels/dto/update-label.dto';
import { LabelsRepository } from 'src/modules/labels/labels.repository';
import { LabelsService } from 'src/modules/labels/labels.service';

const mockLabel = (overrides: Record<string, unknown> = {}) => ({
  id: 'l-1',
  workspaceId: 'ws-1',
  name: 'bug',
  color: '#ff0000',
  createdAt: new Date(),
  ...overrides,
});

describe('LabelsService', () => {
  let service: LabelsService;

  const mockRepository = {
    create: jest.fn(),
    findManyByWorkspace: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockActivityService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabelsService,
        { provide: LabelsRepository, useValue: mockRepository },
        { provide: ActivityService, useValue: mockActivityService },
      ],
    }).compile();

    service = module.get<LabelsService>(LabelsService);
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('lanza ConflictException si el nombre ya existe en el workspace', async () => {
      mockRepository.findByName.mockResolvedValue(mockLabel());

      const dto: CreateLabelDto = { name: 'bug' };

      await expect(service.create('ws-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('crea la etiqueta con color por defecto del schema si no se indica', async () => {
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockLabel({ color: '#999999' }));

      const dto: CreateLabelDto = { name: 'feature' };
      await service.create('ws-1', dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        name: 'feature',
        color: undefined,
      });
    });
  });

  describe('findAll', () => {
    it('lista las etiquetas del workspace', async () => {
      mockRepository.findManyByWorkspace.mockResolvedValue([mockLabel()]);

      const result = await service.findAll('ws-1');

      expect(result).toHaveLength(1);
      expect(mockRepository.findManyByWorkspace).toHaveBeenCalledWith('ws-1');
    });
  });

  describe('update', () => {
    it('lanza NotFoundException si la etiqueta es de otro workspace', async () => {
      mockRepository.findById.mockResolvedValue(
        mockLabel({ workspaceId: 'otro-ws' }),
      );

      const dto: UpdateLabelDto = { name: 'nuevo' };

      await expect(service.update('ws-1', 'l-1', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('rechaza renombrar a un nombre que ya existe', async () => {
      mockRepository.findById.mockResolvedValue(mockLabel());
      mockRepository.findByName.mockResolvedValue(
        mockLabel({ id: 'l-2', name: 'existente' }),
      );

      const dto: UpdateLabelDto = { name: 'existente' };

      await expect(service.update('ws-1', 'l-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('actualiza nombre y color', async () => {
      mockRepository.findById.mockResolvedValue(mockLabel());
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(
        mockLabel({ name: 'hotfix', color: '#00ff00' }),
      );

      const dto: UpdateLabelDto = { name: 'hotfix', color: '#00FF00' };
      await service.update('ws-1', 'l-1', dto);

      expect(mockRepository.update).toHaveBeenCalledWith('l-1', dto);
    });
  });

  describe('remove', () => {
    it('lanza NotFoundException si la etiqueta no pertenece al workspace', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove('ws-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('elimina la etiqueta (task_labels caen en cascada)', async () => {
      mockRepository.findById.mockResolvedValue(mockLabel());
      mockRepository.delete.mockResolvedValue(mockLabel());

      await service.remove('ws-1', 'l-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('l-1');
    });
  });
});
