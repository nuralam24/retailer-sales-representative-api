import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAreaDto, UpdateAreaDto } from './dto/create-area.dto';

@Injectable()
export class AreasService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createAreaDto: CreateAreaDto) {
    const area = await this.prisma.area.create({
      data: createAreaDto,
    });
    await this.cacheManager.del('areas:all');
    await this.cacheManager.del(`areas:region:${createAreaDto.regionId}`);
    return area;
  }

  async findAll() {
    const cacheKey = 'areas:all';
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const areas = await this.prisma.area.findMany({
      include: { region: true },
      orderBy: { name: 'asc' },
    });
    
    await this.cacheManager.set(cacheKey, areas, 3600);
    return areas;
  }

  async findByRegion(regionId: number) {
    const cacheKey = `areas:region:${regionId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const areas = await this.prisma.area.findMany({
      where: { regionId },
      include: { region: true },
      orderBy: { name: 'asc' },
    });
    
    await this.cacheManager.set(cacheKey, areas, 3600);
    return areas;
  }

  async findOne(id: number) {
    const cacheKey = `areas:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const area = await this.prisma.area.findUnique({
      where: { id },
      include: { region: true },
    });
    
    if (!area) return null;

    await this.cacheManager.set(cacheKey, area, 3600);
    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const area: any = await this.findOne(id);
    const oldRegionId = area.regionId;
    
    const updated = await this.prisma.area.update({
      where: { id },
      data: updateAreaDto,
      include: { region: true },
    });
    
    await this.cacheManager.del(`areas:${id}`);
    await this.cacheManager.del('areas:all');
    await this.cacheManager.del(`areas:region:${oldRegionId}`);
    await this.cacheManager.del(`areas:region:${updateAreaDto.regionId}`);
    
    return updated;
  }

  async remove(id: number) {
    const area: any = await this.findOne(id);
    
    await this.prisma.area.delete({
      where: { id },
    });
    
    await this.cacheManager.del(`areas:${id}`);
    await this.cacheManager.del('areas:all');
    await this.cacheManager.del(`areas:region:${area.regionId}`);
  }
}
