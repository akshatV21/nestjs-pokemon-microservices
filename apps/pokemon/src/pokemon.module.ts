import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validationSchema: Joi.object({
    PORT: Joi.number().required()
  }) })],
  controllers: [PokemonController],
  providers: [PokemonService],
})
export class PokemonModule {}
