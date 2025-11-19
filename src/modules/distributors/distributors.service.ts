import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDistributorDto, UpdateDistributorDto } from './dto/create-distributor.dto';

@Injectable()
export class DistributorsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createDistributorDto: CreateDistributorDto) {
    const distributor = await this.prisma.distributor.create({
      data: createDistributorDto,
    });
    await this.cacheManager.del('distributors:all');
    return distributor;
  }

  async findAll() {
    const cacheKey = 'distributors:all';
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const distributors = await this.prisma.distributor.findMany({
      orderBy: { name: 'asc' },
    });
    
    await this.cacheManager.set(cacheKey, distributors, 3600);
    return distributors;
  }

  async findOne(id: number) {
    const cacheKey = `distributors:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const distributor = await this.prisma.distributor.findUnique({
      where: { id },
    });
    
    if (!distributor) return null;
    
    await this.cacheManager.set(cacheKey, distributor, 3600);
    return distributor;
  }

  async update(id: number, updateDistributorDto: UpdateDistributorDto) {
    await this.findOne(id);
    
    const updated = await this.prisma.distributor.update({
      where: { id },
      data: updateDistributorDto,
    });
    
    await this.cacheManager.del(`distributors:${id}`);
    await this.cacheManager.del('distributors:all');
    
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    
    await this.prisma.distributor.delete({
      where: { id },
    });
    
    await this.cacheManager.del(`distributors:${id}`);
    await this.cacheManager.del('distributors:all');
  }
}
