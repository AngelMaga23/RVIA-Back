// src/interceptors/validation.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as fs from 'fs';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  constructor(private readonly validateDto: (dto: any) => boolean) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files = request.files;
    const body = request.body;

    // Validate DTO
    if (!this.validateDto(body)) {
      files.forEach(file => {
        if (file.path) {
          fs.unlinkSync(file.path); // Remove the file if validation fails
        }
      });
      throw new BadRequestException('Invalid DTO');
    }

    return next.handle().pipe(
      catchError((error) => {
        files.forEach(file => {
          if (file.path) {
            fs.unlinkSync(file.path); // Clean up files on error
          }
        });
 
        throw new InternalServerErrorException(error.response ? error.response : error.message);
      })
    );
  }
}
