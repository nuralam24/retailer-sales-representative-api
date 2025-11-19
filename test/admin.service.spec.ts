import { Test, TestingModule } from '@nestjs/testing';
import { AdminService, CsvImportResult } from '../src/modules/admin/admin.service';
import { RetailersService } from '../src/modules/retailers/retailers.service';
import { BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let retailersService: RetailersService;

  const mockRetailersService = {
    bulkCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: RetailersService,
          useValue: mockRetailersService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    retailersService = module.get<RetailersService>(RetailersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importRetailersFromCsv', () => {
    it('should throw BadRequestException if no file is provided', async () => {
      await expect(service.importRetailersFromCsv(null)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.importRetailersFromCsv(null)).rejects.toThrow(
        'No file uploaded',
      );
    });

    it('should throw BadRequestException if file is not CSV', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'application/json',
        originalname: 'test.json',
      } as Express.Multer.File;

      await expect(service.importRetailersFromCsv(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.importRetailersFromCsv(mockFile)).rejects.toThrow(
        'File must be a CSV',
      );
    });

    it('should successfully import valid CSV data', async () => {
      const csvContent = `uid,name,phone,regionId,areaId,distributorId,territoryId,points,routes,notes
RET-001,Test Store 1,+8801712345678,1,1,1,1,100,Route A,Good store
RET-002,Test Store 2,+8801712345679,1,1,1,1,150,Route B,Regular customer`;

      const mockFile = {
        buffer: Buffer.from(csvContent),
        mimetype: 'text/csv',
        originalname: 'retailers.csv',
      } as Express.Multer.File;

      mockRetailersService.bulkCreate.mockResolvedValue({ count: 2 });

      const result: CsvImportResult = await service.importRetailersFromCsv(mockFile);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors.length).toBe(0);
      expect(mockRetailersService.bulkCreate).toHaveBeenCalled();
    });

    it('should handle CSV with missing required fields', async () => {
      const csvContent = `uid,name,phone,regionId,areaId,distributorId,territoryId
RET-001,Test Store 1,+8801712345678,1,1,1
RET-002,Test Store 2,+8801712345679,1,1,1,1`;

      const mockFile = {
        buffer: Buffer.from(csvContent),
        mimetype: 'text/csv',
        originalname: 'retailers.csv',
      } as Express.Multer.File;

      mockRetailersService.bulkCreate.mockResolvedValue({ count: 1 });

      const result: CsvImportResult = await service.importRetailersFromCsv(mockFile);

      expect(result.success).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle CSV with invalid numeric values', async () => {
      const csvContent = `uid,name,phone,regionId,areaId,distributorId,territoryId,points
RET-001,Test Store 1,+8801712345678,invalid,1,1,1,100
RET-002,Test Store 2,+8801712345679,1,1,1,1,150`;

      const mockFile = {
        buffer: Buffer.from(csvContent),
        mimetype: 'text/csv',
        originalname: 'retailers.csv',
      } as Express.Multer.File;

      mockRetailersService.bulkCreate.mockResolvedValue({ count: 1 });

      const result: CsvImportResult = await service.importRetailersFromCsv(mockFile);

      expect(result.success).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid numeric values');
    });

    it('should process large CSV in batches', async () => {
      // Create a CSV with more than 100 rows to test batching
      let csvContent = 'uid,name,phone,regionId,areaId,distributorId,territoryId,points\n';
      
      for (let i = 1; i <= 150; i++) {
        csvContent += `RET-${String(i).padStart(3, '0')},Store ${i},+880171234${String(i).padStart(4, '0')},1,1,1,1,100\n`;
      }

      const mockFile = {
        buffer: Buffer.from(csvContent),
        mimetype: 'text/csv',
        originalname: 'retailers.csv',
      } as Express.Multer.File;

      mockRetailersService.bulkCreate
        .mockResolvedValueOnce({ count: 100 })
        .mockResolvedValueOnce({ count: 50 });

      const result: CsvImportResult = await service.importRetailersFromCsv(mockFile);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(150);
      expect(mockRetailersService.bulkCreate).toHaveBeenCalledTimes(2);
    });

    it('should handle batch failures gracefully', async () => {
      const csvContent = `uid,name,phone,regionId,areaId,distributorId,territoryId,points
RET-001,Test Store 1,+8801712345678,1,1,1,1,100
RET-002,Test Store 2,+8801712345679,1,1,1,1,150`;

      const mockFile = {
        buffer: Buffer.from(csvContent),
        mimetype: 'text/csv',
        originalname: 'retailers.csv',
      } as Express.Multer.File;

      mockRetailersService.bulkCreate.mockRejectedValue(
        new Error('Database constraint violation'),
      );

      const result: CsvImportResult = await service.importRetailersFromCsv(mockFile);

      expect(result.success).toBe(true);
      expect(result.failed).toBe(2);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Database constraint violation');
    });

    it('should handle empty CSV file', async () => {
      const csvContent = 'uid,name,phone,regionId,areaId,distributorId,territoryId';

      const mockFile = {
        buffer: Buffer.from(csvContent),
        mimetype: 'text/csv',
        originalname: 'retailers.csv',
      } as Express.Multer.File;

      const result: CsvImportResult = await service.importRetailersFromCsv(mockFile);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(0);
      expect(result.failed).toBe(0);
      expect(mockRetailersService.bulkCreate).not.toHaveBeenCalled();
    });

    it('should handle CSV with optional fields (routes, notes)', async () => {
      const csvContent = `uid,name,phone,regionId,areaId,distributorId,territoryId,points,routes,notes
RET-001,Test Store 1,+8801712345678,1,1,1,1,100,,
RET-002,Test Store 2,+8801712345679,1,1,1,1,150,Route B,Has notes`;

      const mockFile = {
        buffer: Buffer.from(csvContent),
        mimetype: 'text/csv',
        originalname: 'retailers.csv',
      } as Express.Multer.File;

      mockRetailersService.bulkCreate.mockResolvedValue({ count: 2 });

      const result: CsvImportResult = await service.importRetailersFromCsv(mockFile);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      
      const callArgs = mockRetailersService.bulkCreate.mock.calls[0][0];
      expect(callArgs[0].routes).toBeNull();
      expect(callArgs[0].notes).toBeNull();
      expect(callArgs[1].routes).toBe('Route B');
      expect(callArgs[1].notes).toBe('Has notes');
    });

    it('should limit error messages to 50', async () => {
      // Create CSV with more than 50 invalid rows
      let csvContent = 'uid,name,phone,regionId,areaId,distributorId,territoryId\n';
      
      for (let i = 1; i <= 60; i++) {
        csvContent += `RET-${i},Store ${i},+8801712345678\n`; // Missing required fields
      }

      const mockFile = {
        buffer: Buffer.from(csvContent),
        mimetype: 'text/csv',
        originalname: 'retailers.csv',
      } as Express.Multer.File;

      const result: CsvImportResult = await service.importRetailersFromCsv(mockFile);

      expect(result.success).toBe(true);
      expect(result.errors.length).toBeLessThanOrEqual(50);
    });
  });
});

