import {
  BadRequestException,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common'
import { ValidationPipeOptions } from '@nestjs/common/pipes/validation.pipe'
import { AppError } from './app.exception'

/**
 * SAParseIntPipe for validating input param
 */
export class SAParseIntPipe extends ParseIntPipe {
  constructor(message?: string, error?: string) {
    super({
      exceptionFactory: () => {
        console.log("error", error)
        return new BadRequestException(
          message || 'Bad Request',
          error || AppError.ECB001,
        )
      },
    })
  }
}

export class SAValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super(
      Object.assign(
        {},
        {
          exceptionFactory: () => {
            return new BadRequestException('Bad Request', AppError.ECB001)
          },
        },
        options || {},
      ),
    )
  }
}
