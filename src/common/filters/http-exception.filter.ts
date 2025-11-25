import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Log the full error
    this.logger.error(
      `[${request[REQUEST_ID_HEADER]}] ${request.method} ${request.url} - Status: ${status}`,
      exception.stack,
    );

    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'Ocurrió un error inesperado';

    response.status(status).json({
      success: false,
      code: status,
      message: errorMessage,
      requestId: request[REQUEST_ID_HEADER],
      timestamp: new Date().toISOString(),
      payload: null,
    });
  }
}