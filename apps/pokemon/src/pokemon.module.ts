import { Module } from '@nestjs/common'
import { PokemonController } from './pokemon.controller'
import { PokemonService } from './pokemon.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { Authorize, DatabaseModule, User, UserRepository, UserSchema } from '@lib/common'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGO_URI: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PokemonController],
  providers: [PokemonService, UserRepository, { provide: APP_GUARD, useClass: Authorize }],
})
export class PokemonModule {}
