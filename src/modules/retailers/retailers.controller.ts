import { Controller, Get, Patch, Body, Param, Query, UseGuards, Request, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RetailersService } from './retailers.service';
import { UpdateRetailerDto, SearchRetailerDto } from './dto/create-retailer.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('Retailers')
@Controller('retailers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RetailersController {
  constructor(private readonly retailersService: RetailersService) {}

  @Get()
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10, description: 'Number of items per page' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'search', type: String, required: false, example: 'Store', description: 'Search in name, UID, or phone' })
  @ApiQuery({ name: 'regionId', type: Number, required: false, example: 2, description: 'Filter by region ID' })
  @ApiQuery({ name: 'areaId', type: Number, required: false, example: 5, description: 'Filter by area ID' })
  @ApiQuery({ name: 'distributorId', type: Number, required: false, example: 1, description: 'Filter by distributor ID' })
  @ApiQuery({ name: 'territoryId', type: Number, required: false, example: 5, description: 'Filter by territory ID' })
  @ApiOperation({ summary: 'Get paginated list of assigned retailers for Sales Rep' })
  @ApiResponse({ status: 200, description: 'Paginated retailers list' })
  async findAllForSalesRep(@Res() res: Response, @Request() req, @Query('limit') limit?: string, @Query('page') page?: string, @Query('search') search?: string, @Query('regionId') regionId?: string, @Query('areaId') areaId?: string, @Query('distributorId') distributorId?: string, @Query('territoryId') territoryId?: string) {
    try {
      const result = await this.retailersService.findAllForSalesRep(req.user.id, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
        regionId: regionId ? parseInt(regionId, 10) : undefined,  
        areaId: areaId ? parseInt(areaId, 10) : undefined,  
        distributorId: distributorId ? parseInt(distributorId, 10) : undefined,  
        territoryId: territoryId ? parseInt(territoryId, 10) : undefined,
      } as SearchRetailerDto);
      return res.status(HttpStatus.OK).json({
        success: true, data: result.data, meta: result.meta, message: 'Retailers retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get retailer details by UID' })
  @ApiResponse({ status: 200, description: 'Retailer found' })
  @ApiResponse({ status: 404, description: 'Retailer not found' })
  async findOne(@Res() res: Response, @Param('uid') uid: string) {
    try {
      const retailer = await this.retailersService.findByUid(uid);
      if (!retailer) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Retailer not found!' 
        });
      }
      return res.status(HttpStatus.OK).json({ 
        success: true, data: retailer, message: 'Retailer retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Patch(':uid')
  @ApiOperation({ summary: 'Update retailer fields (Points, Routes, Notes)' })
  @ApiResponse({ status: 200, description: 'Retailer updated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async update(@Res() res: Response, @Param('uid') uid: string, @Body() updateRetailerDto: UpdateRetailerDto, @Request() req) {
    try {
      const retailer = await this.retailersService.findByUid(uid);
      if (!retailer) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Retailer not found!' 
        });
      }
      const updatedRetailer = await this.retailersService.update(uid, updateRetailerDto, req.user.id);
      return res.status(HttpStatus.OK).json({ 
        success: true, data: updatedRetailer, message: 'Retailer updated successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }
}

