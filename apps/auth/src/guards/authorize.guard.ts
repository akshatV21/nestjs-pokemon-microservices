import { AuthorizeDto, UserDocument, UserRepository } from '@lib/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import {
  CanActivate,
  ContextType,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'
import { EXCEPTION_MSGS } from '@utils/utils'
import { verify } from 'jsonwebtoken'

@Injectable()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class Authorize implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly UserRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

    let user: UserDocument

    if (data.cached) {
      const cachedUser = await this.cacheManager.get<UserDocument>(id)

      if (cachedUser) user = cachedUser
      else {
        user = await this.UserRepository.findById(id)
        await this.cacheManager.set(id, user, { ttl: 3600 })
      }
    }

    if (!data.cached) {
      user = await this.UserRepository.findById(id)
      await this.cacheManager.set(id, user, { ttl: 3600 })
    }

    data.user = user
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
