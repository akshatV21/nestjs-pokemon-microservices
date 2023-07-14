import { Module } from '@nestjs/common'
import { SpawnsController } from './spawns.controller'
import { SpawnsService } from './spawns.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import {
  BasePokemon,
  BasePokemonRepository,
  BasePokemonSchema,
  DatabaseModule,
  EvolutionLine,
  EvolutionLineSchema,
  RedisModule,
  RmqModule,
  Spawn,
  SpawnRepository,
  SpawnSchema,
  User,
  UserRepository,
  UserSchema,
  Authorize,
} from '@lib/common'
import { SERVICES } from '@utils/utils'
import { SpawnsManager } from './spawns-manager.servier'
import { APP_GUARD } from '@nestjs/core'
import { SpawnsGateway } from './spawns.gateway'

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
    DatabaseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: BasePokemon.name, schema: BasePokemonSchema },
      { name: EvolutionLine.name, schema: EvolutionLineSchema },
      { name: Spawn.name, schema: SpawnSchema },
    ]),
    RmqModule.register([SERVICES.AUTH_SERVICE]),
    RedisModule.register(),
  ],
  controllers: [SpawnsController],
  providers: [
    SpawnsService,
    UserRepository,
    BasePokemonRepository,
    SpawnRepository,
    SpawnsManager,
    { provide: APP_GUARD, useClass: Authorize },
    SpawnsGateway,
  ],
})
export class SpawnsModule {}
