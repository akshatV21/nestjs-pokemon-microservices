import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import * as redisStore from 'cache-manager-redis-store'

@Module({})
export class RedisModule {
  static register() {
    return CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      max: 1000,
      isGlobal: true,
    })
  }
}
