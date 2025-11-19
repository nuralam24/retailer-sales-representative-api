import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, HttpStatus, Res, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { SalesRepsService } from './sales-reps.service';
import { CreateSalesRepDto, UpdateSalesRepDto } from './dto/create-sales-rep.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/guards/roles.decorator';
import { Roles } from '../../common/guards/roles.enum';
import { Response } from 'express';

@ApiTags('Sales Representatives')
@Controller('admin/sales-reps')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.ADMIN)
@ApiBearerAuth()
export class SalesRepsController {
  constructor(private readonly salesRepsService: SalesRepsService) {}

  @Post()
  @ApiBody({ type: CreateSalesRepDto })
  @ApiOperation({ summary: 'Create a new sales rep (Admin only)' })
  @ApiResponse({ status: 201, description: 'Sales rep created' })
  async create(@Body() createSalesRepDto: CreateSalesRepDto, @Res() res: Response) {
    try {
      const salesRep = await this.salesRepsService.create(createSalesRepDto);
      return res.status(HttpStatus.CREATED).json({ 
        success: true, data: salesRep, message: 'Sales rep created successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Get()
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10, description: 'Number of items per page' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1, description: 'Page number' })
  @ApiOperation({ summary: 'Get all sales reps with pagination' })
  @ApiResponse({ status: 200, description: 'List of sales reps with pagination metadata' })
  async findAll(@Res() res: Response, @Query('limit') limit?: string, @Query('page') page?: string) {
    try {
      const parsedLimit = limit ? parseInt(limit, 10) : 10;
      const parsedPage = page ? parseInt(page, 10) : 1;
      const result = await this.salesRepsService.findAll(parsedLimit, parsedPage) as any;
      return res.status(HttpStatus.OK).json({
        success: true, data: result.data, meta: result.meta, message: 'Sales reps retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  } 

  @Get(':id')
  @ApiOperation({ summary: 'Get sales rep by ID' })
  @ApiResponse({ status: 200, description: 'Sales rep found' })
  @ApiResponse({ status: 404, description: 'Sales rep not found' })
  async findOne(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const salesRep = await this.salesRepsService.findOne(id);
      if (!salesRep) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Sales rep not found!' 
        });
      }
      return res.status(HttpStatus.OK).json({
        success: true, data: salesRep, message: 'Sales rep retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Get(':id/retailers/count')
  @ApiOperation({ summary: 'Get count of assigned retailers for sales rep' })
  @ApiResponse({ status: 200, description: 'Retailer count' })
  async getRetailerCount(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const count = await this.salesRepsService.getAssignedRetailerCount(id);
      return res.status(HttpStatus.OK).json({
        success: true, data: count, message: 'Retailer count retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Put(':id')
  @ApiBody({ type: UpdateSalesRepDto })
  @ApiOperation({ summary: 'Update sales rep' })
  @ApiResponse({ status: 200, description: 'Sales rep updated' })
  async update(@Res() res: Response, @Param('id', ParseIntPipe) id: number, @Body() updateSalesRepDto: UpdateSalesRepDto) { 
    try {
      const salesRep = await this.salesRepsService.findOne(id);
      if (!salesRep) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Sales rep not found!' 
        });
      }
      const updatedSalesRep = await this.salesRepsService.update(id, updateSalesRepDto);
      return res.status(HttpStatus.OK).json({
        success: true, data: updatedSalesRep, message: 'Sales rep updated successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sales rep' })
  @ApiResponse({ status: 200, description: 'Sales rep deleted' })
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const salesRep = await this.salesRepsService.findOne(id);
      if (!salesRep) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Sales rep not found!' 
        });
      }
      await this.salesRepsService.remove(id);
      return res.status(HttpStatus.OK).json({
        success: true, data: null, message: 'Sales rep deleted successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }
}

