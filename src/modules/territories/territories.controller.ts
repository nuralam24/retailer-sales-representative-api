import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TerritoriesService } from './territories.service';
import { CreateTerritoryDto, UpdateTerritoryDto } from './dto/create-territory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/guards/roles.decorator';
import { Roles } from '../../common/guards/roles.enum';
import { Response } from 'express';

@ApiTags('Territories')
@Controller('admin/territories')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.ADMIN)
@ApiBearerAuth()
export class TerritoriesController {
  constructor(private readonly territoriesService: TerritoriesService) {}

  @Post()
  @ApiBody({ type: CreateTerritoryDto })
  @ApiOperation({ summary: 'Create a new territory (Admin only)' })
  @ApiResponse({ status: 201, description: 'Territory created' })
  async create(@Body() createTerritoryDto: CreateTerritoryDto, @Res() res: Response) {
    try {
      const territory = await this.territoriesService.create(createTerritoryDto);
      return res.status(HttpStatus.CREATED).json({ 
        success: true, data: territory, message: 'Territory created successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all territories or filter by area' })
  @ApiQuery({ name: 'areaId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of territories' })
  async findAll(@Res() res: Response, @Query('areaId', new ParseIntPipe({ optional: true })) areaId?: number) {
    try {
      if (areaId) {
        const territories = await this.territoriesService.findByArea(areaId);
        return res.status(HttpStatus.OK).json({ 
          success: true, data: territories, message: 'Territories retrieved successfully!' 
        });
      }
      const territories = await this.territoriesService.findAll();
      return res.status(HttpStatus.OK).json({ 
        success: true, data: territories, message: 'Territories retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get territory by ID' })
  @ApiResponse({ status: 200, description: 'Territory found' })
  @ApiResponse({ status: 404, description: 'Territory not found' })
  async findOne(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const territory = await this.territoriesService.findOne(id);
      if (!territory) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Territory not found!' 
        });
      }
      return res.status(HttpStatus.OK).json({ 
        success: true, data: territory, message: 'Territory retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update territory' })
  @ApiResponse({ status: 200, description: 'Territory updated' })
  async update(@Res() res: Response, @Param('id', ParseIntPipe) id: number, @Body() updateTerritoryDto: UpdateTerritoryDto) {
    try {
      const territory = await this.territoriesService.findOne(id);
      if (!territory) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Territory not found!' 
        });
      }
      const updatedTerritory = await this.territoriesService.update(id, updateTerritoryDto);
      return res.status(HttpStatus.OK).json({ 
        success: true, data: updatedTerritory, message: 'Territory updated successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete territory' })
  @ApiResponse({ status: 200, description: 'Territory deleted' })
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const territory = await this.territoriesService.findOne(id);
      if (!territory) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Territory not found!' 
        });
      }
      await this.territoriesService.remove(id);
      return res.status(HttpStatus.OK).json({
        success: true, data: null, message: 'Territory deleted successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }
}

