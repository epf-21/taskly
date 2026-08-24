import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateColumnDto } from 'src/modules/columns/dto/create-column.dto';
import { ReorderColumnDto } from 'src/modules/columns/dto/reorder-column.dto';
import { UpdateColumnDto } from 'src/modules/columns/dto/update-column.dto';
import { ColumnsRepository } from 'src/modules/columns/columns.repository';
import { ColumnsService } from 'src/modules/columns/columns.service';

const mockColumn = (overrides: Record<string, unknown> = {}) => ({
  id: 'c-1',
  boardId: 'b-1',
  name: 'Por hacer',
  position: 1024,
  wipLimit: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ColumnsService', () => {
  let service: ColumnsService;

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findLastPosition: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        { provide: ColumnsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('usa la posición base si el board no tiene columnas', async () => {
      mockRepository.findLastPosition.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockColumn());

      const dto: CreateColumnDto = { name: 'Por hacer' };
      await service.create('b-1', dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        boardId: 'b-1',
        name: 'Por hacer',
        position: 1024,
        wipLimit: undefined,
      });
    });

    it('coloca la nueva columna al final del board', async () => {
      mockRepository.findLastPosition.mockResolvedValue(2048);
      mockRepository.create.mockResolvedValue(mockColumn({ position: 2049 }));

      const dto: CreateColumnDto = { name: 'En progreso' };
      await service.create('b-1', dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ position: 2049 }),
      );
    });
  });

  describe('update', () => {
    it('lanza NotFoundException si la columna no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const dto: UpdateColumnDto = { name: 'Nuevo nombre' };

      await expect(service.update('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('actualiza nombre y WIP limit', async () => {
      mockRepository.findById.mockResolvedValue(mockColumn());
      mockRepository.update.mockResolvedValue(
        mockColumn({ name: 'Haciendo', wipLimit: 3 }),
      );

      const dto: UpdateColumnDto = { name: 'Haciendo', wipLimit: 3 };
      await service.update('c-1', dto);

      expect(mockRepository.update).toHaveBeenCalledWith('c-1', {
        name: 'Haciendo',
        wipLimit: 3,
      });
    });
  });

  describe('reorder', () => {
    it('lanza BadRequestException si no indica vecinos', async () => {
      const dto: ReorderColumnDto = { columnId: 'c-1' };

      await expect(service.reorder('b-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si before y after son iguales', async () => {
      const dto: ReorderColumnDto = {
        columnId: 'c-1',
        beforeId: 'c-2',
        afterId: 'c-2',
      };

      await expect(service.reorder('b-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si la columna movida es su propio vecino', async () => {
      const dto: ReorderColumnDto = {
        columnId: 'c-1',
        afterId: 'c-1',
      };

      await expect(service.reorder('b-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza NotFoundException si la columna no pertenece al board', async () => {
      mockRepository.findById.mockResolvedValue(
        mockColumn({ boardId: 'otro-board' }),
      );

      const dto: ReorderColumnDto = { columnId: 'c-1', afterId: 'c-9' };

      await expect(service.reorder('b-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza BadRequestException si un vecino no pertenece al board', async () => {
      mockRepository.findById
        .mockResolvedValueOnce(mockColumn()) // columna movida
        .mockResolvedValueOnce(mockColumn({ id: 'c-2', boardId: 'otro' })); // vecino

      const dto: ReorderColumnDto = { columnId: 'c-1', afterId: 'c-2' };

      await expect(service.reorder('b-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('calcula el punto medio entre los vecinos', async () => {
      mockRepository.findById
        .mockResolvedValueOnce(mockColumn({ position: 999 }))
        .mockResolvedValueOnce(mockColumn({ id: 'c-a', position: 1000 }))
        .mockResolvedValueOnce(mockColumn({ id: 'c-b', position: 2000 }));
      mockRepository.update.mockResolvedValue(mockColumn({ position: 1500 }));

      const dto: ReorderColumnDto = {
        columnId: 'c-1',
        beforeId: 'c-a',
        afterId: 'c-b',
      };
      await service.reorder('b-1', dto);

      expect(mockRepository.update).toHaveBeenCalledWith('c-1', {
        position: 1500,
      });
    });

    it('inserta al final cuando solo se indica before', async () => {
      mockRepository.findById
        .mockResolvedValueOnce(mockColumn())
        .mockResolvedValueOnce(mockColumn({ id: 'c-last', position: 3000 }));
      mockRepository.update.mockResolvedValue(mockColumn({ position: 3001 }));

      const dto: ReorderColumnDto = { columnId: 'c-1', beforeId: 'c-last' };
      await service.reorder('b-1', dto);

      expect(mockRepository.update).toHaveBeenCalledWith('c-1', {
        position: 3001,
      });
    });
  });

  describe('remove', () => {
    it('lanza NotFoundException si la columna no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('elimina la columna (las tareas caen en cascada)', async () => {
      mockRepository.findById.mockResolvedValue(mockColumn());
      mockRepository.delete.mockResolvedValue(mockColumn());

      await service.remove('c-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('c-1');
    });
  });
});
