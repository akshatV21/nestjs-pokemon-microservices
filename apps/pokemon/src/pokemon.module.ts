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
        RMQ_URL: Joi.string().required(),
        RMQ_AUTH_QUEUE: Joi.string().required(),
        RMQ_POKEMON_QUEUE: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: BasePokemon.name, schema: BasePokemonSchema },
    ]),
    RmqModule.register([SERVICES.AUTH_SERVICE]),
  ],
  controllers: [PokemonController],
  providers: [PokemonService, UserRepository, BasePokemonRepository, { provide: APP_GUARD, useClass: Authorize }],
})
export class PokemonModule {}
