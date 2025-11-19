import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSalesRepDto, UpdateSalesRepDto } from './dto/create-sales-rep.dto';
import { BulkAssignmentDto, BulkUnassignmentDto, BulkAssignmentResponseDto } from '../admin/dto/bulk-assignment.dto';

@Injectable()
export class SalesRepsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createSalesRepDto: CreateSalesRepDto) {
    const existing = await this.prisma.salesRep.findUnique({
      where: { username: createSalesRepDto.username },
    });

    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createSalesRepDto.password, salt);

    const salesRep = await this.prisma.salesRep.create({
      data: {
        username: createSalesRepDto.username,
        name: createSalesRepDto.name,
        phone: createSalesRepDto.phone,
        passwordHash,
        role: createSalesRepDto.role || 'sales_rep',
      },
    });

    await this.cacheManager.del('salesreps:all');
    
    // Exclude password from response
    const { passwordHash: _, ...result } = salesRep;
    return result;
  }

  async findAll(limit: number = 10, page: number = 1) {
    const cacheKey = `salesreps:all:limit:${limit}:page:${page}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Get total count
    const total = await this.prisma.salesRep.count();

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    const salesReps = await this.prisma.salesRep.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    });
    
    const result = {
      data: salesReps,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };

    await this.cacheManager.set(cacheKey, result, 3600);
    return result;
  }

  async findOne(id: number) {
    const salesRep = await this.prisma.salesRep.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!salesRep) return null;
    return salesRep;
  }

  async findByUsername(username: string) {
    const salesRep = await this.prisma.salesRep.findUnique({
      where: { username },
    });
    
    if (!salesRep) {
      throw new NotFoundException(`Sales Rep with username ${username} not found`);
    }

    return salesRep;
  }

  async update(id: number, updateSalesRepDto: UpdateSalesRepDto) {
    await this.findOne(id);
    
    const updateData: any = { ...updateSalesRepDto };
    
    if (updateSalesRepDto.password) {
      const salt = await bcrypt.genSalt();
      updateData.passwordHash = await bcrypt.hash(updateSalesRepDto.password, salt);
      delete updateData.password;
    }

    const updated = await this.prisma.salesRep.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.cacheManager.del(`salesreps:${id}`);
    await this.cacheManager.del('salesreps:all');
    
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    
    await this.prisma.salesRep.delete({
      where: { id },
    });
    
    await this.cacheManager.del(`salesreps:${id}`);
    await this.cacheManager.del('salesreps:all');
  }

  async bulkAssignRetailers(bulkAssignmentDto: BulkAssignmentDto): Promise<BulkAssignmentResponseDto> {
    const { salesRepId, retailerIds } = bulkAssignmentDto;

    await this.findOne(salesRepId);

    const existing = await this.prisma.salesRepRetailer.findMany({
      where: {
        salesRepId,
        retailerId: { in: retailerIds },
      },
    });

    const existingRetailerIds = existing.map(e => e.retailerId);
    const newRetailerIds = retailerIds.filter(id => !existingRetailerIds.includes(id));

    if (newRetailerIds.length === 0) {
      return {
        success: true,
        assigned: 0,
        message: 'All retailers are already assigned to this sales rep',
      };
    }

    await this.prisma.salesRepRetailer.createMany({
      data: newRetailerIds.map(retailerId => ({
        salesRepId,
        retailerId,
      })),
    });
    
    await this.clearSalesRepCache(salesRepId);

    return {
      success: true,
      assigned: newRetailerIds.length,
      message: `Successfully assigned ${newRetailerIds.length} retailers`,
    };
  }

  async bulkUnassignRetailers(bulkUnassignmentDto: BulkUnassignmentDto): Promise<BulkAssignmentResponseDto> {
    const { salesRepId, retailerIds } = bulkUnassignmentDto;

    await this.findOne(salesRepId);

    const result = await this.prisma.salesRepRetailer.deleteMany({
      where: {
        salesRepId,
        retailerId: { in: retailerIds },
      },
    });

    await this.clearSalesRepCache(salesRepId);

    return {
      success: true,
      assigned: result.count,
      message: `Successfully unassigned ${result.count} retailers`,
    };
  }

  async getAssignedRetailerCount(salesRepId: number): Promise<number> {
    return await this.prisma.salesRepRetailer.count({
      where: { salesRepId },
    });
  }

  private async clearSalesRepCache(salesRepId: number): Promise<void> {
    const keys = await this.cacheManager.store.keys(`retailers:salesrep:${salesRepId}:*`);
    if (keys && keys.length > 0) {
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
    }
  }
}
