import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from 'src/modules/activity/activity.service';
import { BoardsRepository } from 'src/modules/boards/boards.repository';
import { CreateBoardDto } from 'src/modules/boards/dto/create-board.dto';
import { UpdateBoardDto } from 'src/modules/boards/dto/update-board.dto';
import { BoardsService } from 'src/modules/boards/boards.service';

const mockBoard = {
  id: 'b-1',
  workspaceId: 'ws-1',
  name: 'Tablero principal',
  description: null,
  isArchived: false,
  createdBy: 'u1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BoardsService', () => {
  let service: BoardsService;

  const mockRepository = {
    create: jest.fn(),
    findManyByWorkspace: jest.fn(),
    findById: jest.fn(),
    findDetailById: jest.fn(),
    update: jest.fn(),
  };

  const mockActivityService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: BoardsRepository, useValue: mockRepository },
        { provide: ActivityService, useValue: mockActivityService },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crea el board con el creador registrado', async () => {
      mockRepository.create.mockResolvedValue(mockBoard);

      const dto: CreateBoardDto = { name: 'Tablero principal' };
      const result = await service.create('u1', 'ws-1', dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        name: 'Tablero principal',
        description: undefined,
        createdBy: 'u1',
      });
      expect(result.id).toBe('b-1');
    });
  });

  describe('findAll', () => {
    it('lista los boards excluyendo archivados por defecto', async () => {
      mockRepository.findManyByWorkspace.mockResolvedValue([mockBoard]);

      const result = await service.findAll('ws-1');

      expect(mockRepository.findManyByWorkspace).toHaveBeenCalledWith(
        'ws-1',
        false,
      );
      expect(result).toHaveLength(1);
    });

    it('incluye archivados si se pide', async () => {
      mockRepository.findManyByWorkspace.mockResolvedValue([]);

      await service.findAll('ws-1', true);

      expect(mockRepository.findManyByWorkspace).toHaveBeenCalledWith(
        'ws-1',
        true,
      );
    });
  });

  describe('findDetail', () => {
    it('lanza NotFoundException si el board no existe', async () => {
      mockRepository.findDetailById.mockResolvedValue(null);

      await expect(service.findDetail('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve el board con columnas y tareas ordenadas', async () => {
      mockRepository.findDetailById.mockResolvedValue({
        ...mockBoard,
        columns: [
          { id: 'c-1', position: 1024, tasks: [] },
          { id: 'c-2', position: 1025, tasks: [] },
        ],
      });

      const result = await service.findDetail('b-1');

      expect(result.columns).toHaveLength(2);
      expect(result.columns[0].id).toBe('c-1');
    });
  });

  describe('update', () => {
    it('lanza NotFoundException si el board no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const dto: UpdateBoardDto = { name: 'Nuevo' };

      await expect(service.update('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('actualiza el board si existe', async () => {
      mockRepository.findById.mockResolvedValue(mockBoard);
      mockRepository.update.mockResolvedValue({
        ...mockBoard,
        name: 'Nuevo nombre',
      });

      const dto: UpdateBoardDto = { name: 'Nuevo nombre' };
      const result = await service.update('b-1', dto);

      expect(mockRepository.update).toHaveBeenCalledWith('b-1', {
        name: 'Nuevo nombre',
        description: undefined,
      });
      expect(result.name).toBe('Nuevo nombre');
    });
  });

  describe('archive', () => {
    it('archiva en lugar de eliminar', async () => {
      mockRepository.findById.mockResolvedValue(mockBoard);
      mockRepository.update.mockResolvedValue({
        ...mockBoard,
        isArchived: true,
      });

      await service.archive('b-1');

      expect(mockRepository.update).toHaveBeenCalledWith('b-1', {
        isArchived: true,
      });
    });

    it('lanza NotFoundException si el board no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.archive('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
