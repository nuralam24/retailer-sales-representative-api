import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTerritoryDto, UpdateTerritoryDto } from './dto/create-territory.dto';

@Injectable()
export class TerritoriesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createTerritoryDto: CreateTerritoryDto) {
    const territory = await this.prisma.territory.create({
      data: createTerritoryDto,
    });
    await this.cacheManager.del('territories:all');
    await this.cacheManager.del(`territories:area:${createTerritoryDto.areaId}`);
    return territory;
  }

  async findAll() {
    const cacheKey = 'territories:all';
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const territories = await this.prisma.territory.findMany({
      include: { area: true },
      orderBy: { name: 'asc' },
    });
    
    await this.cacheManager.set(cacheKey, territories, 3600);
    return territories;
  }

  async findByArea(areaId: number) {
    const cacheKey = `territories:area:${areaId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const territories = await this.prisma.territory.findMany({
      where: { areaId },
      include: { area: true },
      orderBy: { name: 'asc' },
    });
    
    await this.cacheManager.set(cacheKey, territories, 3600);
    return territories;
  }

  async findOne(id: number) {
    const cacheKey = `territories:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const territory = await this.prisma.territory.findUnique({
      where: { id },
      include: { area: true },
    });
    
    if (!territory) return null;

    await this.cacheManager.set(cacheKey, territory, 3600);
    return territory;
  }

  async update(id: number, updateTerritoryDto: UpdateTerritoryDto) {
    const territory: any = await this.findOne(id);
    if (!territory) return null;

    const oldAreaId = territory.areaId;
    
    const updated = await this.prisma.territory.update({
      where: { id },
      data: updateTerritoryDto,
      include: { area: true },
    });
    
    await this.cacheManager.del(`territories:${id}`);
    await this.cacheManager.del('territories:all');
    await this.cacheManager.del(`territories:area:${oldAreaId}`);
    await this.cacheManager.del(`territories:area:${updateTerritoryDto.areaId}`);
    
    return updated;
  }

  async remove(id: number) {
    const territory: any = await this.findOne(id);
    
    await this.prisma.territory.delete({
      where: { id },
    });
    
    await this.cacheManager.del(`territories:${id}`);
    await this.cacheManager.del('territories:all');
    await this.cacheManager.del(`territories:area:${territory.areaId}`);
  }
}
