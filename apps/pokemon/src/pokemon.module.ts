import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';

@Module({
  imports: [],
  controllers: [PokemonController],
  providers: [PokemonService],
})
export class PokemonModule {}
