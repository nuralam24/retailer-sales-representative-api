import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App Health')
@Controller('')
export class AppsController {
  @ApiOperation({ summary: 'Health check endpoint' })
  @Get('')
  health() {
    return { 
      success: true, 
      message: 'API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  }
}
