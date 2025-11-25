import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware';

export interface StandardResponse<T> {
  success: boolean;
  code: number;
  message: string;
  requestId: string;
  timestamp: string;
  payload: T;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();
    
    return next.handle().pipe(
      map(data => {
        
        const message = data?.message || 'Operación exitosa';
        
        if (data?.message) {
          delete data.message;
        }

        return {
          success: response.statusCode >= 200 && response.statusCode < 300,
          code: response.statusCode,
          message: message,
          requestId: request[REQUEST_ID_HEADER],
          timestamp: new Date().toISOString(),
          payload: data,
        };
      }),
    );
  }
}