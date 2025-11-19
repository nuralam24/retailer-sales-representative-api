import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DistributorsService } from './distributors.service';
import { CreateDistributorDto, UpdateDistributorDto } from './dto/create-distributor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/guards/roles.decorator';
import { Roles } from '../../common/guards/roles.enum';
import { Response } from 'express';

@ApiTags('Distributors')
@Controller('admin/distributors')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.ADMIN)
@ApiBearerAuth()
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  @Post()
  @ApiBody({ type: CreateDistributorDto })
  @ApiOperation({ summary: 'Create a new distributor (Admin only)' })
  @ApiResponse({ status: 201, description: 'Distributor created' })
  async create(@Body() createDistributorDto: CreateDistributorDto, @Res() res: Response) {
    try {
      const distributor = await this.distributorsService.create(createDistributorDto);
      return res.status(HttpStatus.CREATED).json({ 
        success: true, data: distributor, message: 'Distributor created successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    } 
  }

  @Get()
  @ApiOperation({ summary: 'Get all distributors' })
  @ApiResponse({ status: 200, description: 'List of distributors' })
  async findAll(@Res() res: Response) {
    try {
      const distributors = await this.distributorsService.findAll();
      return res.status(HttpStatus.OK).json({ 
        success: true, data: distributors, message: 'Distributors retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get distributor by ID' })
  @ApiResponse({ status: 200, description: 'Distributor found' })
  @ApiResponse({ status: 404, description: 'Distributor not found' })
  async findOne(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const distributor = await this.distributorsService.findOne(id);
      if (!distributor) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Distributor not found!' 
        });
      }
      return res.status(HttpStatus.OK).json({ 
        success: true, data: distributor, message: 'Distributor retrieved successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update distributor' })
  @ApiResponse({ status: 200, description: 'Distributor updated' })
  async update(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDistributorDto: UpdateDistributorDto,
  ) {
    try {
      const distributor = await this.distributorsService.findOne(id);
      if (!distributor) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Distributor not found!' 
        });
      }
      const updatedDistributor = await this.distributorsService.update(id, updateDistributorDto);
      return res.status(HttpStatus.OK).json({ 
        success: true, data: updatedDistributor, message: 'Distributor updated successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete distributor' })
  @ApiResponse({ status: 200, description: 'Distributor deleted' })
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const distributor = await this.distributorsService.findOne(id);
      if (!distributor) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false, data: null, message: 'Distributor not found!' 
        });
      }
      await this.distributorsService.remove(id);
      return res.status(HttpStatus.OK).json({
        success: true, data: null, message: 'Distributor deleted successfully!' 
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, data: null, message: 'An unexpected error occurred. Please try again!' 
      });
    }
  }
}

