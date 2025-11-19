import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRetailerDto, UpdateRetailerDto, SearchRetailerDto } from './dto/create-retailer.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RetailersService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createRetailerDto: CreateRetailerDto) {
    const retailer = await this.prisma.retailer.create({
      data: createRetailerDto,
    });
    await this.clearRetailerCache();
    return retailer;
  }

  async findAllForSalesRep(salesRepId: number, searchDto: SearchRetailerDto): Promise<PaginatedResponseDto<any>> {
    const { search, regionId, areaId, distributorId, territoryId, page = 1, limit = 10 } = searchDto;

    const cacheKey = `retailers:salesrep:${salesRepId}:${JSON.stringify(searchDto)}`;
    const cached = await this.cacheManager.get<PaginatedResponseDto<any>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const where: Prisma.RetailerWhereInput = {
      assignments: {
        some: {
          salesRepId,
        },
      },
    };

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { uid: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Apply other filters
    if (regionId) where.regionId = regionId;
    if (areaId) where.areaId = areaId;
    if (distributorId) where.distributorId = distributorId;
    if (territoryId) where.territoryId = territoryId;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.retailer.findMany({
        where,
        include: {
          region: true,
          area: true,
          distributor: true,
          territory: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.retailer.count({ where }),
    ]);

    const result: PaginatedResponseDto<any> = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  async findByUid(uid: string) {
    const cacheKey = `retailers:uid:${uid}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const retailer = await this.prisma.retailer.findUnique({
      where: { uid },
      include: {
        region: true,
        area: true,
        distributor: true,
        territory: true,
      },
    });
    
    if (!retailer) return null;

    await this.cacheManager.set(cacheKey, retailer, 3600);
    return retailer;
  }

  async findOne(id: number) {
    const retailer = await this.prisma.retailer.findUnique({
      where: { id },
      include: {
        region: true,
        area: true,
        distributor: true,
        territory: true,
      },
    });
    
    if (!retailer) return null;

    return retailer;
  }

  async checkSalesRepAccess(uid: string, salesRepId: number): Promise<boolean> {
    const retailer: any = await this.findByUid(uid);
    
    const assignment = await this.prisma.salesRepRetailer.findUnique({
      where: {
        salesRepId_retailerId: {
          salesRepId,
          retailerId: retailer.id,
        },
      },
    });

    return !!assignment;
  }

  async update(uid: string, updateRetailerDto: UpdateRetailerDto, salesRepId?: number) {
    const retailer: any = await this.findByUid(uid);

    if (salesRepId) {
      const hasAccess = await this.checkSalesRepAccess(uid, salesRepId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this retailer');
      }
    }

    const updated = await this.prisma.retailer.update({
      where: { id: retailer.id },
      data: updateRetailerDto,
      include: {
        region: true,
        area: true,
        distributor: true,
        territory: true,
      },
    });
    
    await this.clearRetailerCache();
    await this.cacheManager.del(`retailers:uid:${uid}`);
    
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    
    await this.prisma.retailer.delete({
      where: { id },
    });
    
    await this.clearRetailerCache();
  }

  async bulkCreate(retailers: CreateRetailerDto[]) {
    const created = await this.prisma.retailer.createMany({
      data: retailers,
      skipDuplicates: true,
    });
    
    await this.clearRetailerCache();
    return created;
  }

  private async clearRetailerCache(): Promise<void> {
    const keys = await this.cacheManager.store.keys('retailers:*');
    if (keys && keys.length > 0) {
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
    }
  }
}
