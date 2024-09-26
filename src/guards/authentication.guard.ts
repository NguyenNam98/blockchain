import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const roles =
      this.reflector.get<string[]>("roles", context.getHandler()) || []

    if (roles?.[0] === "guest") {
      // In case guest user (Defined by decorator @Roles(Role.Guest))
      // no need to require authenticated user
      return true
    }

    return this.validateUser(request, context) as unknown as boolean
  }

  async validateUser(request, context: ExecutionContext): Promise<boolean> {
    if (!request?.metaData?.userId) {
      throw this.getCustomException(context) || new UnauthorizedException()
    }
    return true
  }

  getCustomException(context: ExecutionContext) {
    return this.reflector.get("guard-exception", context.getClass())
  }
}
