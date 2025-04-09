import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../services/logger.service';
import { ClsService } from 'nestjs-cls';
import { v4 } from 'uuid'

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private loggerService: CustomLoggerService, private clsService: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    console.log('this', this)
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();
    const traceId =  headers['x-trace-id'] || v4();
    this.clsService.set('traceId', traceId)

    // Log request
    this.loggerService.log('HTTP', 'request', 'start', {
      method,
      url: originalUrl,
      ip,
      userAgent,
    });
    

    // Add response listener to log when the request is completed
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const { statusCode } = res;
      
      // Log response
      this.loggerService.log('HTTP', 'response', 'end', {
        method,
        url: originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
      });
    });

    next();
  }
}
