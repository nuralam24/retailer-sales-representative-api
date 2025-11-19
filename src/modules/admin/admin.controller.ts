import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  Res,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AdminService, CsvImportResult } from './admin.service';
import { SalesRepsService } from '../sales_rep_retailers/sales-reps.service';
import { BulkAssignmentDto, BulkUnassignmentDto, BulkAssignmentResponseDto } from './dto/bulk-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/guards/roles.decorator';
import { Roles } from '../../common/guards/roles.enum';
import { Response } from 'express';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly salesRepsService: SalesRepsService,
  ) {}

  @Post('retailers/import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk import retailers from CSV (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Import completed' })
  @ApiResponse({ status: 400, description: 'Invalid CSV file' })
  async importRetailers(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file) {
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        success: false, data: null, message: 'No file uploaded' 
      });
    }
    const result = await this.adminService.importRetailersFromCsv(file);
    if (result && result.success) {
      return res.status(HttpStatus.CREATED).json({ 
        success: true, data: result, message: 'Import completed successfully!' 
      });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        success: false, data: null, message: 'Invalid CSV file' 
      });
    }
  }

  @Post('assignments/bulk')
  @ApiOperation({ summary: 'Bulk assign retailers to a sales rep (Admin only)' })
  @ApiResponse({ status: 201, description: 'Retailers assigned' })
  async bulkAssign(@Body() bulkAssignmentDto: BulkAssignmentDto, @Res() res: Response) {
    const result = await this.salesRepsService.bulkAssignRetailers(bulkAssignmentDto);
    if (result && result.success) {
      return res.status(HttpStatus.CREATED).json({ 
        success: true, data: result, message: 'Retailers assigned successfully!' 
      });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        success: false, data: null, message: 'Failed to assign retailers' 
      });
    }
  }

  @Post('assignments/bulk-unassign')
  @ApiOperation({ summary: 'Bulk unassign retailers from a sales rep (Admin only)' })
  @ApiResponse({ status: 200, description: 'Retailers unassigned' })
  async bulkUnassign(@Body() bulkUnassignmentDto: BulkUnassignmentDto, @Res() res: Response) { 
    const result = await this.salesRepsService.bulkUnassignRetailers(bulkUnassignmentDto);
    if (result && result.success) {
      return res.status(HttpStatus.OK).json({ 
        success: true, data: result, message: 'Retailers unassigned successfully!' 
      });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        success: false, data: null, message: 'Failed to unassign retailers' 
      });
    }
  }
}

