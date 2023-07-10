import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import * as redisStore from 'cache-manager-redis-store'

@Module({})
export class RedisModule {
  static register() {
    return CacheModule.register({
      store: redisStore,
      host: 'redis-server',
      port: 6379,
      max: 1000,
      isGlobal: true,
    })
  }
}
