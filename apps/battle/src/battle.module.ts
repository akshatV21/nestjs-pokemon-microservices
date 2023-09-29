import { Module } from '@nestjs/common';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import {
  Authorize,
  BasePokemon,
  BasePokemonRepository,
  BasePokemonSchema,
  CaughtPokemon,
  CaughtPokemonRepository,
  CaughtPokemonSchema,
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
} from '@lib/common'
import { MovesManager, SERVICES, SocketSessions } from '@utils/utils'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGO_URI: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        RMQ_URL: Joi.string().required(),
        RMQ_AUTH_QUEUE: Joi.string().required(),
        RMQ_BATTLE_QUEUE: Joi.string().required(),
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
    RmqModule.register([SERVICES.AUTH_SERVICE]),
    RedisModule.register(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [BattleController],
  providers: [
    BattleService,
    UserRepository,
    BasePokemonRepository,
    SpawnRepository,
    CaughtPokemonRepository,
    { provide: APP_GUARD, useClass: Authorize },
    SocketSessions,
    MovesManager,
  ],
})
export class BattleModule {}
