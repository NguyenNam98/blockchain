import { Response } from 'express'
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { AppError, BusinessException } from './app.exception'
import { TBaseDto } from './app.typing'

const SEND_SLACK_ENV = ['production', 'staging']
const IGNORE_STATUS_CODE_ERROR = [
  HttpStatus.BAD_REQUEST,
  HttpStatus.FORBIDDEN,
  HttpStatus.NOT_FOUND,
]
const RESPONSE_STATUS_CODE_ERROR = [
  HttpStatus.NOT_FOUND,
  HttpStatus.TOO_MANY_REQUESTS,
]

/**
 * All unhandled exception will be handled here
 * It includes special treatment for BusinessException
 * */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<any>()
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR
    const exceptionResponse = exception.response || {}
    /*
     * This special handle case service validate business or something failed
     * it will throw BusinessException
     * */

    if (exception instanceof BusinessException) {
      return response.status(HttpStatus.OK).json({
        data: {},
        error: exception.error,
        message: exception.message,
      } as TBaseDto<any>)
    }
    if (
      IGNORE_STATUS_CODE_ERROR.includes(status) ||
      (exceptionResponse.message &&
        (exceptionResponse.message.includes('Guard') ||
          exceptionResponse.message.match(
            /Unexpected token . in JSON at position/,
          )))
    ) {
      return response
        .status(
          RESPONSE_STATUS_CODE_ERROR.includes(status) ? status : HttpStatus.OK,
        )
        .json({
          data: {},
          error: exceptionResponse.error || AppError.ECI500,
          message: exceptionResponse.message || 'Internal error',
        } as TBaseDto<any>)
    }

    const error = exceptionResponse.message || exceptionResponse.error
    console.log('error', error)
    const ipAddress =
      request.headers['remote-addr'] ||
      (request.headers['x-forwarded-for'] || '').split(',')[0]
    const slackPreContent = `:boom:
    Request url: \`${request.url || 'empty'}\`
    Method: \`${request.method || 'empty'}\`
    Referer: \`${request.headers.referer || 'empty'}\`
    User agent: \`${request.headers['user-agent'] || 'empty'}\`
    Ip address: \`${ipAddress || 'empty'}\`
    `

    // HttpException of nestjs sometime generate error stack:  Error: [object Object]
    const slackMessage = (exception.stack || '').replace(
      '[object Object]',
      error,
    )

    if (SEND_SLACK_ENV.includes(process.env.ENV || 'local')) {
      console.log('send slack to track')
    } else {
      Logger.error(slackMessage)
    }

    response.status(HttpStatus.OK).json({
      data: {},
      error: exceptionResponse.error || AppError.ECI500,
      message: exceptionResponse.message || 'Internal error',
    } as TBaseDto<any>)
  }
}
