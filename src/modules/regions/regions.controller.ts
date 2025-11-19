import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { CreateRegionDto, UpdateRegionDto } from './dto/create-region.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/guards/roles.decorator';
import { Roles } from '../../common/guards/roles.enum';
import { Response } from 'express';

@ApiTags('Regions')
@Controller('admin/regions')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.ADMIN)
@ApiBearerAuth()
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  @ApiBody({ type: CreateRegionDto })
  @ApiOperation({ summary: 'Create a new region (Admin only)' })
  @ApiResponse({ status: 201, description: 'Region created' })
  async create(@Body() createRegionDto: CreateRegionDto, @Res() res: Response) {
    try {
      const region = await this.regionsService.create(createRegionDto);
      return res.status(HttpStatus.CREATED).json({ 
        success: true, data: region, message: 'Region created successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all regions' })
  @ApiResponse({ status: 200, description: 'List of regions' })
  async findAll(@Res() res: Response) {
    try {
      const regions = await this.regionsService.findAll();
      return res.status(HttpStatus.OK).json({ 
        success: true, data: regions, message: 'Regions retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get region by ID' })
  @ApiResponse({ status: 200, description: 'Region found' })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async findOne(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const region = await this.regionsService.findOne(id);
      if (!region) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Region not found!' 
        });
      }
      return res.status(HttpStatus.OK).json({ 
        success: true, data: region, message: 'Region retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update region' })
  @ApiResponse({ status: 200, description: 'Region updated' })
  async update(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRegionDto: UpdateRegionDto,
  ) {
    try {
      const region = await this.regionsService.findOne(id);
      if (!region) {
          return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Region not found!' 
        });
      }
      const updatedRegion = await this.regionsService.update(id, updateRegionDto);
      return res.status(HttpStatus.OK).json({ 
        success: true, data: updatedRegion, message: 'Region updated successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete region' })
  @ApiResponse({ status: 200, description: 'Region deleted' })
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const region = await this.regionsService.findOne(id);
      if (!region) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Region not found!' 
        });
      }
      await this.regionsService.remove(id);
      return res.status(HttpStatus.OK).json({
        success: true, data: null, message: 'Region deleted successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }
}

