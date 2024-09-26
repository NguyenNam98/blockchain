import { Injectable, NestMiddleware, HttpStatus, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './app.exception';
import { isEmpty } from 'lodash';
@Injectable()
export class AppMiddleware implements NestMiddleware {
  constructor(
      ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (e) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        data: {},
        error: AppError.EUA001,
        message: 'Unauthorized',
      });
    }
  }
}
