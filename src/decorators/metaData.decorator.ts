import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common'
import { BaseException } from '../app.exception'

export const MetaData = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const metaData = request.metaData
    return data ? metaData?.[data] : metaData
  },
)

/**
 * Use when post request to others service which need cookie to check authentication
 */
export const SaCookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().cookies
  },
)

export const GuardException = (exception: BaseException) =>
  SetMetadata('guard-exception', exception)
