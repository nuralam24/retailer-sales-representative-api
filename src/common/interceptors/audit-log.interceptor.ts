import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as colors from 'colors';

/**
 * Audit Log Interceptor
 * Logs all write operations (POST, PUT, PATCH, DELETE) for security auditing
 * Helps track unauthorized modification attempts
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, params, ip } = request;

    // Only log write operations
    const writeOperations = ['POST', 'PUT', 'PATCH', 'DELETE'];
    
    if (!writeOperations.includes(method)) {
      return next.handle();
    }

    const timestamp = this.getTimestamp();
    const userId = user?.id || 'anonymous';
    const userEmail = user?.email || 'N/A';

    // Log before operation
    console.log(
      `[${timestamp}] [AUDIT] ${colors.yellow(method)} ${url}`,
      `\n  User ID: ${userId}`,
      `\n  User Email: ${userEmail}`,
      `\n  IP: ${ip}`,
      `\n  Params: ${JSON.stringify(params)}`,
      body && Object.keys(body).length > 0 
        ? `\n  Body: ${JSON.stringify(this.sanitizeBody(body), null, 2)}` 
        : ''
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Log successful operation
          console.log(
            `[${this.getTimestamp()}] [AUDIT-SUCCESS] ${colors.green('✓')} ${method} ${url}`,
            `\n  User: ${userEmail}`,
            `\n  Status: Success`
          );
        },
        error: (error) => {
          // Log failed operation
          console.error(
            `[${this.getTimestamp()}] [AUDIT-FAILED] ${colors.red('✗')} ${method} ${url}`,
            `\n  User: ${userEmail}`,
            `\n  Error: ${error.message}`,
            `\n  Status Code: ${error.status || 500}`
          );
        },
      })
    );
  }

  private getTimestamp(): string {
    const now = new Date();
    const bdtTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    return bdtTime.toISOString().replace('T', ' ').slice(0, 19);
  }

  private sanitizeBody(body: any): any {
    // Remove sensitive fields from logs
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}

