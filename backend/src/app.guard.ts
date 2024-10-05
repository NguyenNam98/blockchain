import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { TMetaData } from './app.typing'

@Injectable()
export class AppGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    return this.validateUser(request) as unknown as boolean
  }

  async validateUser(request): Promise<boolean> {
    const ipAddress =
        request.headers['remote-addr'] ||
        (request.headers['x-forwarded-for'] || '').split(',')[0] ||
        ''
    const userAgent = request.headers['user-agent'] || ''
    const referer = request.headers['referer'] || ''
    const auPayloadHeader = request.headers['user-id']

    request.metaData = {
      ipAddress,
      userAgent,
      referer,
      userId: auPayloadHeader || '',
    } as TMetaData
    return true
  }
}
