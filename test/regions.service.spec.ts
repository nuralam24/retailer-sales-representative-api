import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RegionsService } from '../src/modules/regions/regions.service';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('RegionsService', () => {
  let service: RegionsService;
  let prisma: PrismaService;
  let cacheManager: any;

  const mockPrismaService = {
    region: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RegionsService>(RegionsService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new region', async () => {
      const createRegionDto = { name: 'Dhaka Division' };
      const mockRegion = { id: 1, ...createRegionDto, createdAt: new Date(), updatedAt: new Date() };

      mockPrismaService.region.create.mockResolvedValue(mockRegion);

      const result = await service.create(createRegionDto);

      expect(result).toEqual(mockRegion);
      expect(mockPrismaService.region.create).toHaveBeenCalledWith({ data: createRegionDto });
      expect(mockCacheManager.del).toHaveBeenCalledWith('regions:all');
    });
  });

  describe('findAll', () => {
    it('should return cached regions if available', async () => {
      const mockRegions = [{ id: 1, name: 'Dhaka Division' }];
      mockCacheManager.get.mockResolvedValue(mockRegions);

      const result = await service.findAll();

      expect(result).toEqual(mockRegions);
      expect(mockCacheManager.get).toHaveBeenCalledWith('regions:all');
      expect(mockPrismaService.region.findMany).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache if not cached', async () => {
      const mockRegions = [{ id: 1, name: 'Dhaka Division' }];
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.region.findMany.mockResolvedValue(mockRegions);

      const result = await service.findAll();

      expect(result).toEqual(mockRegions);
      expect(mockPrismaService.region.findMany).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith('regions:all', mockRegions, 3600);
    });
  });

  describe('findOne', () => {
    it('should return a region by id', async () => {
      const mockRegion = { id: 1, name: 'Dhaka Division' };
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);

      const result = await service.findOne(1);

      expect(result).toEqual(mockRegion);
      expect(mockPrismaService.region.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if region not found', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.region.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Region with ID 999 not found');
    });
  });

  describe('update', () => {
    it('should update a region', async () => {
      const mockRegion = { id: 1, name: 'Dhaka Division' };
      const updateDto = { name: 'Updated Dhaka' };
      const updatedRegion = { ...mockRegion, ...updateDto };

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);
      mockPrismaService.region.update.mockResolvedValue(updatedRegion);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedRegion);
      expect(mockCacheManager.del).toHaveBeenCalledWith('regions:1');
      expect(mockCacheManager.del).toHaveBeenCalledWith('regions:all');
    });
  });

  describe('remove', () => {
    it('should remove a region', async () => {
      const mockRegion = { id: 1, name: 'Dhaka Division' };
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);
      mockPrismaService.region.delete.mockResolvedValue(mockRegion);

      await service.remove(1);

      expect(mockPrismaService.region.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockCacheManager.del).toHaveBeenCalledWith('regions:1');
      expect(mockCacheManager.del).toHaveBeenCalledWith('regions:all');
    });
  });
});
