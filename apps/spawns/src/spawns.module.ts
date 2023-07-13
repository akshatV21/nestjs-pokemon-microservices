import { Module } from '@nestjs/common'
import { SpawnsController } from './spawns.controller'
import { SpawnsService } from './spawns.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { DatabaseModule, RedisModule, RmqModule, User, UserSchema } from '@lib/common'
import { SERVICES } from '@utils/utils'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGO_URI: Joi.string().required(),
        RMQ_URL: Joi.string().required(),
        RMQ_AUTH_QUEUE: Joi.string().required(),
        RMQ_POKEMON_QUEUE: Joi.string().required(),
        RMQ_SPAWNS_QUEUE: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RmqModule.register([SERVICES.AUTH_SERVICE]),
    RedisModule.register(),
  ],
  controllers: [SpawnsController],
  providers: [SpawnsService],
})
export class SpawnsModule {}
