import { AuthorizeDto } from '@lib/common'
import { CanActivate, ContextType, ExecutionContext, Injectable, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'
import { EXCEPTION_MSGS } from '@utils/utils'
import { verify } from 'jsonwebtoken'
import { Observable } from 'rxjs'

@Injectable()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class Authorize implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const data = context.switchToRpc().getData<AuthorizeDto>()

    const token = data.token
    const requestType = data.requestType

    const { id } = this.validateToken(token, 'rpc')

    if (requestType === 'rpc') return true
    if (requestType === 'ws') {
      data.user = id
      return true
    }

    return true
  }

  validateToken(token: string, type: ContextType = 'http'): any {
    return verify(token, this.configService.get('JWT_SECRET'), (err, payload) => {
      // when jwt is valid
      if (!err) return payload

      // when jwt has expired
      if (err.name === 'TokenExpiredError' && type === 'http') throw new UnauthorizedException('Token has expired')
      if (err.name === 'TokenExpiredError' && type === 'rpc') throw new RpcException(EXCEPTION_MSGS.JWT_EXPIRED)

      // throws error when jwt is malformed
      throw type === 'http'
        ? new UnauthorizedException(EXCEPTION_MSGS.INVALID_JWT, 'InvalidToken')
        : new RpcException(EXCEPTION_MSGS.INVALID_JWT)
    })
  }
}
