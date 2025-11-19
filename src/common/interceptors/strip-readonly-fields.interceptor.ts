import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

/**
 * Strip Read-Only Fields Interceptor
 * Prevents Mass Assignment attacks
 * Removes sensitive/read-only fields from request body
 * 
 * Usage:
 * @UseInterceptors(StripReadOnlyFieldsInterceptor)
 * @SetMetadata('readOnlyFields', ['id', 'createdAt', 'updatedAt', 'role', 'isAdmin'])
 */
@Injectable()
export class StripReadOnlyFieldsInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Get read-only fields from metadata
    const readOnlyFields = this.reflector.get<string[]>(
      'readOnlyFields', 
      context.getHandler()
    );

    // If no metadata, use default protected fields
    const fieldsToStrip = readOnlyFields || this.getDefaultReadOnlyFields();

    // Strip read-only fields from body
    if (request.body && typeof request.body === 'object') {
      this.stripFields(request.body, fieldsToStrip);
    }

    return next.handle();
  }

  private stripFields(obj: any, fields: string[]): void {
    fields.forEach(field => {
      if (field in obj) {
        console.warn(`[SECURITY] Attempted to modify read-only field: ${field}`);
        delete obj[field];
      }
    });
  }

  private getDefaultReadOnlyFields(): string[] {
    return [
      'id',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'role',
      'isAdmin',
      'isVerified',
      'emailVerifiedAt',
      'lastLoginAt',
      'loginAttempts',
    ];
  }
}

/**
 * Decorator to specify read-only fields
 */
export const ReadOnlyFields = (...fields: string[]) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('readOnlyFields', fields, descriptor.value);
    return descriptor;
  };
};

