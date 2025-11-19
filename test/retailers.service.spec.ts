import { Test, TestingModule } from '@nestjs/testing';
import { RetailersService } from '../src/modules/retailers/retailers.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('RetailersService', () => {
  let service: RetailersService;
  let prismaService: PrismaService;
  let cacheManager: any;

  const mockPrismaService = {
    retailer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
    },
    salesRepRetailer: {
      findUnique: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    store: {
      keys: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetailersService,
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

    service = module.get<RetailersService>(RetailersService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllForSalesRep', () => {
    it('should return paginated retailers for a sales rep', async () => {
      const salesRepId = 1;
      const searchDto = { page: 1, limit: 20 };
      const mockRetailers = [
        {
          id: 1,
          uid: 'RET-001',
          name: 'Test Retailer',
          phone: '+8801712345678',
          regionId: 1,
          areaId: 1,
          distributorId: 1,
          territoryId: 1,
          points: 100,
          routes: 'Route A',
          notes: 'Test notes',
          region: { id: 1, name: 'Dhaka' },
          area: { id: 1, name: 'Gulshan' },
          distributor: { id: 1, name: 'Dist A' },
          territory: { id: 1, name: 'Territory 1' },
        },
      ];

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.retailer.findMany.mockResolvedValue(mockRetailers);
      mockPrismaService.retailer.count.mockResolvedValue(1);

      const result = await service.findAllForSalesRep(salesRepId, searchDto);

      expect(result).toEqual({
        data: mockRetailers,
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });

      expect(mockPrismaService.retailer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignments: {
              some: { salesRepId },
            },
          }),
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should return cached data if available', async () => {
      const salesRepId = 1;
      const searchDto = { page: 1, limit: 20 };
      const cachedData = {
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      };

      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.findAllForSalesRep(salesRepId, searchDto);

      expect(result).toEqual(cachedData);
      expect(mockPrismaService.retailer.findMany).not.toHaveBeenCalled();
    });

    it('should apply search filters correctly', async () => {
      const salesRepId = 1;
      const searchDto = { 
        page: 1, 
        limit: 20, 
        search: 'Test',
        regionId: 1,
        areaId: 2,
        distributorId: 3,
        territoryId: 4,
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.retailer.findMany.mockResolvedValue([]);
      mockPrismaService.retailer.count.mockResolvedValue(0);

      await service.findAllForSalesRep(salesRepId, searchDto);

      expect(mockPrismaService.retailer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignments: {
              some: { salesRepId },
            },
            OR: [
              { name: { contains: 'Test', mode: 'insensitive' } },
              { uid: { contains: 'Test', mode: 'insensitive' } },
              { phone: { contains: 'Test', mode: 'insensitive' } },
            ],
            regionId: 1,
            areaId: 2,
            distributorId: 3,
            territoryId: 4,
          }),
        }),
      );
    });
  });

  describe('findByUid', () => {
    it('should return retailer by UID', async () => {
      const uid = 'RET-001';
      const mockRetailer = {
        id: 1,
        uid,
        name: 'Test Retailer',
        phone: '+8801712345678',
        regionId: 1,
        areaId: 1,
        distributorId: 1,
        territoryId: 1,
        region: { id: 1, name: 'Dhaka' },
        area: { id: 1, name: 'Gulshan' },
        distributor: { id: 1, name: 'Dist A' },
        territory: { id: 1, name: 'Territory 1' },
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.retailer.findUnique.mockResolvedValue(mockRetailer);

      const result = await service.findByUid(uid);

      expect(result).toEqual(mockRetailer);
      expect(mockPrismaService.retailer.findUnique).toHaveBeenCalledWith({
        where: { uid },
        include: {
          region: true,
          area: true,
          distributor: true,
          territory: true,
        },
      });
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException if retailer not found', async () => {
      const uid = 'RET-999';

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.retailer.findUnique.mockResolvedValue(null);

      await expect(service.findByUid(uid)).rejects.toThrow(NotFoundException);
      await expect(service.findByUid(uid)).rejects.toThrow(
        `Retailer with UID ${uid} not found`,
      );
    });

    it('should return cached retailer if available', async () => {
      const uid = 'RET-001';
      const cachedRetailer = { id: 1, uid, name: 'Cached Retailer' };

      mockCacheManager.get.mockResolvedValue(cachedRetailer);

      const result = await service.findByUid(uid);

      expect(result).toEqual(cachedRetailer);
      expect(mockPrismaService.retailer.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update retailer successfully for sales rep with access', async () => {
      const uid = 'RET-001';
      const salesRepId = 1;
      const updateDto = { points: 200, routes: 'Updated Route' };
      
      const existingRetailer = {
        id: 1,
        uid,
        name: 'Test Retailer',
      };
      
      const updatedRetailer = {
        ...existingRetailer,
        ...updateDto,
        region: { id: 1, name: 'Dhaka' },
        area: { id: 1, name: 'Gulshan' },
        distributor: { id: 1, name: 'Dist A' },
        territory: { id: 1, name: 'Territory 1' },
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.retailer.findUnique.mockResolvedValue(existingRetailer);
      mockPrismaService.salesRepRetailer.findUnique.mockResolvedValue({ 
        salesRepId, 
        retailerId: 1 
      });
      mockPrismaService.retailer.update.mockResolvedValue(updatedRetailer);
      mockCacheManager.store.keys.mockResolvedValue(['retailers:salesrep:1']);

      const result = await service.update(uid, updateDto, salesRepId);

      expect(result).toEqual(updatedRetailer);
      expect(mockPrismaService.retailer.update).toHaveBeenCalledWith({
        where: { id: existingRetailer.id },
        data: updateDto,
        include: {
          region: true,
          area: true,
          distributor: true,
          territory: true,
        },
      });
    });

    it('should throw ForbiddenException if sales rep does not have access', async () => {
      const uid = 'RET-001';
      const salesRepId = 1;
      const updateDto = { points: 200 };

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.retailer.findUnique.mockResolvedValue({ id: 1, uid });
      mockPrismaService.salesRepRetailer.findUnique.mockResolvedValue(null);

      await expect(service.update(uid, updateDto, salesRepId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.update(uid, updateDto, salesRepId)).rejects.toThrow(
        'You do not have access to this retailer',
      );
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple retailers at once', async () => {
      const retailers = [
        {
          uid: 'RET-001',
          name: 'Retailer 1',
          phone: '+8801712345678',
          regionId: 1,
          areaId: 1,
          distributorId: 1,
          territoryId: 1,
          points: 100,
          routes: null,
          notes: null,
        },
        {
          uid: 'RET-002',
          name: 'Retailer 2',
          phone: '+8801712345679',
          regionId: 1,
          areaId: 1,
          distributorId: 1,
          territoryId: 1,
          points: 150,
          routes: null,
          notes: null,
        },
      ];

      mockPrismaService.retailer.createMany.mockResolvedValue({ count: 2 });
      mockCacheManager.store.keys.mockResolvedValue([]);

      const result = await service.bulkCreate(retailers);

      expect(result).toEqual({ count: 2 });
      expect(mockPrismaService.retailer.createMany).toHaveBeenCalledWith({
        data: retailers,
        skipDuplicates: true,
      });
    });
  });

  describe('checkSalesRepAccess', () => {
    it('should return true if sales rep has access to retailer', async () => {
      const uid = 'RET-001';
      const salesRepId = 1;

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.retailer.findUnique.mockResolvedValue({ id: 1, uid });
      mockPrismaService.salesRepRetailer.findUnique.mockResolvedValue({
        salesRepId,
        retailerId: 1,
      });

      const result = await service.checkSalesRepAccess(uid, salesRepId);

      expect(result).toBe(true);
    });

    it('should return false if sales rep does not have access', async () => {
      const uid = 'RET-001';
      const salesRepId = 1;

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.retailer.findUnique.mockResolvedValue({ id: 1, uid });
      mockPrismaService.salesRepRetailer.findUnique.mockResolvedValue(null);

      const result = await service.checkSalesRepAccess(uid, salesRepId);

      expect(result).toBe(false);
    });
  });
});

