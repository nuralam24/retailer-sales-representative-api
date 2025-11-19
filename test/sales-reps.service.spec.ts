import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SalesRepsService } from '../src/modules/sales_rep_retailers/sales-reps.service';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('SalesRepsService', () => {
  let service: SalesRepsService;
  let prisma: PrismaService;
  let cacheManager: any;

  const mockPrismaService = {
    salesRep: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    salesRepRetailer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    store: {
      keys: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesRepsService,
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

    service = module.get<SalesRepsService>(SalesRepsService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new sales rep', async () => {
      const createDto = {
        username: 'karim_ahmed',
        name: 'Karim Ahmed',
        phone: '+8801712345678',
        password: 'password123',
        role: 'sales_rep' as any,
      };

      const mockSalesRep = {
        id: 1,
        username: 'karim_ahmed',
        name: 'Karim Ahmed',
        phone: '+8801712345678',
        role: 'sales_rep' as any,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.salesRep.findUnique.mockResolvedValue(null);
      mockPrismaService.salesRep.create.mockResolvedValue(mockSalesRep);

      const result = await service.create(createDto);

      expect(result.username).toBe('karim_ahmed');
      expect(result).not.toHaveProperty('passwordHash');
      expect(mockCacheManager.del).toHaveBeenCalledWith('salesreps:all');
    });

    it('should throw ConflictException if username exists', async () => {
      const createDto = {
        username: 'karim_ahmed',
        name: 'Karim Ahmed',
        phone: '+8801712345678',
        password: 'password123',
      };

      mockPrismaService.salesRep.findUnique.mockResolvedValue({ username: 'karim_ahmed' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('bulkAssignRetailers', () => {
    it('should assign retailers to sales rep', async () => {
      const bulkAssignmentDto = {
        salesRepId: 1,
        retailerIds: [1, 2, 3],
      };

      mockPrismaService.salesRep.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.salesRepRetailer.findMany.mockResolvedValue([]);
      mockPrismaService.salesRepRetailer.createMany.mockResolvedValue({ count: 3 });
      mockCacheManager.store.keys.mockResolvedValue([]);

      const result = await service.bulkAssignRetailers(bulkAssignmentDto);

      expect(result.success).toBe(true);
      expect(result.assigned).toBe(3);
      expect(mockPrismaService.salesRepRetailer.createMany).toHaveBeenCalled();
    });

    it('should skip already assigned retailers', async () => {
      const bulkAssignmentDto = {
        salesRepId: 1,
        retailerIds: [1, 2, 3],
      };

      const existingAssignments = [
        { salesRepId: 1, retailerId: 1, assignedAt: new Date() },
        { salesRepId: 1, retailerId: 2, assignedAt: new Date() },
      ];

      mockPrismaService.salesRep.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.salesRepRetailer.findMany.mockResolvedValue(existingAssignments);
      mockPrismaService.salesRepRetailer.createMany.mockResolvedValue({ count: 1 });
      mockCacheManager.store.keys.mockResolvedValue([]);

      const result = await service.bulkAssignRetailers(bulkAssignmentDto);

      expect(result.assigned).toBe(1);
    });
  });

  describe('bulkUnassignRetailers', () => {
    it('should unassign retailers from sales rep', async () => {
      const bulkUnassignmentDto = {
        salesRepId: 1,
        retailerIds: [1, 2, 3],
      };

      mockPrismaService.salesRep.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.salesRepRetailer.deleteMany.mockResolvedValue({ count: 3 });
      mockCacheManager.store.keys.mockResolvedValue([]);

      const result = await service.bulkUnassignRetailers(bulkUnassignmentDto);

      expect(result.success).toBe(true);
      expect(result.assigned).toBe(3);
    });
  });

  describe('getAssignedRetailerCount', () => {
    it('should return count of assigned retailers', async () => {
      mockPrismaService.salesRepRetailer.count.mockResolvedValue(70);

      const result = await service.getAssignedRetailerCount(1);

      expect(result).toBe(70);
      expect(mockPrismaService.salesRepRetailer.count).toHaveBeenCalledWith({
        where: { salesRepId: 1 },
      });
    });
  });
});
