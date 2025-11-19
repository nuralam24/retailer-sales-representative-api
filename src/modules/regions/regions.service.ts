import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRegionDto, UpdateRegionDto } from './dto/create-region.dto';

@Injectable()
export class RegionsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createRegionDto: CreateRegionDto) {
    const region = await this.prisma.region.create({
      data: createRegionDto,
    });
    await this.cacheManager.del('regions:all');
    return region;
  }

  async findAll() {
    const cacheKey = 'regions:all';
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const regions = await this.prisma.region.findMany({
      orderBy: { name: 'asc' },
    });
    
    await this.cacheManager.set(cacheKey, regions, 3600);
    return regions;
  }

  async findOne(id: number) {
    const cacheKey = `regions:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const region = await this.prisma.region.findUnique({
      where: { id },
    });
    
    if (!region) return null;

    await this.cacheManager.set(cacheKey, region, 3600);
    return region;
  }

  async update(id: number, updateRegionDto: UpdateRegionDto) {
    await this.findOne(id);
    
    const updated = await this.prisma.region.update({
      where: { id },
      data: updateRegionDto,
    });
    
    await this.cacheManager.del(`regions:${id}`);
    await this.cacheManager.del('regions:all');
    
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    
    await this.prisma.region.delete({
      where: { id },
    });
    
    await this.cacheManager.del(`regions:${id}`);
    await this.cacheManager.del('regions:all');
  }
}
