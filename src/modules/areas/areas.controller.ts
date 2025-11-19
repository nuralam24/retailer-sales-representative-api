import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AreasService } from './areas.service';
import { CreateAreaDto, UpdateAreaDto } from './dto/create-area.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/guards/roles.decorator';
import { Roles } from '../../common/guards/roles.enum';
import { Response } from 'express';

@ApiTags('Areas')
@Controller('admin/areas')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.ADMIN)
@ApiBearerAuth()
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @ApiBody({ type: CreateAreaDto })
  @ApiOperation({ summary: 'Create a new area (Admin only)' })
  @ApiResponse({ status: 201, description: 'Area created' })
  async create(@Body() createAreaDto: CreateAreaDto, @Res() res: Response) {
    try {
      const area = await this.areasService.create(createAreaDto);
      return res.status(HttpStatus.CREATED).json({ 
        success: true, data: area, message: 'Area created successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all areas or filter by region' })
  @ApiQuery({ name: 'regionId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of areas' })
  async findAll(@Res() res: Response, @Query('regionId', new ParseIntPipe({ optional: true })) regionId?: number) { 
    try {
      if (regionId) {
        const areas = await this.areasService.findByRegion(regionId);
        return res.status(HttpStatus.OK).json({ 
          success: true, data: areas, message: 'Areas retrieved successfully!' 
        });
      }
      const areas = await this.areasService.findAll();
      return res.status(HttpStatus.OK).json({ 
        success: true, data: areas, message: 'Areas retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get area by ID' })
  @ApiResponse({ status: 200, description: 'Area found' })
  @ApiResponse({ status: 404, description: 'Area not found' })
  async findOne(@Res() res: Response, @Param('id', ParseIntPipe) id: number) { 
    try {
      const area = await this.areasService.findOne(id);
      if (!area) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Area not found!' 
        });
      }
      return res.status(HttpStatus.OK).json({ 
        success: true, data: area, message: 'Area retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update area' })
  @ApiResponse({ status: 200, description: 'Area updated' })
  async update(@Res() res: Response, @Param('id', ParseIntPipe) id: number, @Body() updateAreaDto: UpdateAreaDto) {
    try {
      const area = await this.areasService.findOne(id);
      if (!area) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Area not found!' 
        });
      }
      const updatedArea = await this.areasService.update(id, updateAreaDto);
      return res.status(HttpStatus.OK).json({ 
        success: true, data: updatedArea, message: 'Area updated successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete area' })
  @ApiResponse({ status: 200, description: 'Area deleted' })
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const area = await this.areasService.findOne(id);
      if (!area) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Area not found!' 
        });
      }
      await this.areasService.remove(id);
      return res.status(HttpStatus.OK).json({
        success: true, data: null, message: 'Area deleted successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }
}

