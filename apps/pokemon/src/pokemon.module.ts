import { Module } from '@nestjs/common'
import { PokemonController } from './pokemon.controller'
import { PokemonService } from './pokemon.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import {
  Authorize,
  BasePokemon,
  BasePokemonRepository,
  BasePokemonSchema,
  DatabaseModule,
  EvolutionLine,
  EvolutionLineRepository,
  EvolutionLineSchema,
  RedisModule,
  RmqModule,
  User,
  UserRepository,
  UserSchema,
} from '@lib/common'
import { APP_GUARD } from '@nestjs/core'
import { SERVICES } from '@utils/utils'

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
        RMQ_POKEMON_QUEUE: Joi.string().required(),
        RMQ_SPAWNS_QUEUE: Joi.string().required(),
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
    ]),
    RmqModule.register([SERVICES.AUTH_SERVICE, SERVICES.SPAWNS_SERVICE]),
    RedisModule.register(),
  ],
  controllers: [PokemonController],
  providers: [PokemonService, UserRepository, BasePokemonRepository, EvolutionLineRepository, { provide: APP_GUARD, useClass: Authorize }],
})
export class PokemonModule {}
