import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import * as redisStore from 'cache-manager-redis-store'

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'redis-server',
      port: 6379,
      ttl: 10,
      max: 1000,
      isGlobal: true
    }),
  ],
})
export class RedisModule {}
