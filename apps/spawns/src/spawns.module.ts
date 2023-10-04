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
  CaughtPokemon,
  CaughtPokemonSchema,
  CaughtPokemonRepository,
} from '@lib/common'
import { MovesManager, SERVICES, SocketSessions } from '@utils/utils'
import { SpawnsManager } from './spawns-manager.service'
import { APP_GUARD } from '@nestjs/core'
import { SpawnsGateway } from './spawns.gateway'
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        // WS_PORT: Joi.number().required(),
        MONGO_URI: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        RMQ_URL: Joi.string().required(),
        RMQ_AUTH_QUEUE: Joi.string().required(),
        RMQ_POKEMON_QUEUE: Joi.string().required(),
        RMQ_SPAWNS_QUEUE: Joi.string().required(),
        RMQ_INVENTORY_QUEUE: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_USERNAME: Joi.string().required(),
        REDIS_PASSWORD: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: BasePokemon.name, schema: BasePokemonSchema },
      { name: EvolutionLine.name, schema: EvolutionLineSchema },
      { name: Spawn.name, schema: SpawnSchema },
      { name: CaughtPokemon.name, schema: CaughtPokemonSchema },
    ]),
    RmqModule.register([SERVICES.AUTH_SERVICE, SERVICES.INVENTORY_SERVICE, SERVICES.POKEMON_SERVICE]),
    RedisModule.register(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [SpawnsController],
  providers: [
    SpawnsService,
    UserRepository,
    BasePokemonRepository,
    SpawnRepository,
    CaughtPokemonRepository,
    SpawnsManager,
    { provide: APP_GUARD, useClass: Authorize },
    SpawnsGateway,
    SocketSessions,
    MovesManager,
  ],
})
export class SpawnsModule {}
