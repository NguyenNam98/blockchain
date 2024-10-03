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
    const auPayloadHeader = request.headers['au-payload']
    console.log("auPayloadHeader", auPayloadHeader)
    let auPayload
    try {
      auPayload = JSON.parse(auPayloadHeader)
    } catch (e) {
      // console.log("error", e)
      auPayload = {}
    }
    request.metaData = {
      ipAddress,
      userAgent,
      referer,
      userId: "1632b5f2-df79-4f61-b548-81861e1dfe0f" ?? "",
    } as TMetaData
    return true
  }
}
