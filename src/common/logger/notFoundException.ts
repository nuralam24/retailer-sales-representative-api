import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.getResponse();

    response.status(HttpStatus.NOT_FOUND).json({
      success: false, data: null, message: `API not found. ${message['message']}`,
    });
  }
}
