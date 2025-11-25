import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { REQUEST_ID_HEADER } from './request-id.middleware';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, headers } = req;
    const requestId = req[REQUEST_ID_HEADER];
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip;

    this.logger.log(
      `[${requestId}] ==> ${method} ${originalUrl} - ${userAgent} ${ip}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      this.logger.log(
        `[${requestId}] <== ${statusCode} ${contentLength || '0'}b - ${method} ${originalUrl}`,
      );
    });

    next();
  }
}
