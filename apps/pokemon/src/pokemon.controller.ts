import { Controller, Get } from '@nestjs/common'
import { PokemonService } from './pokemon.service'
import { Auth } from '@lib/common'

@Controller()
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @Auth()
  getHello(): string {
    return this.pokemonService.getHello()
  }
}
