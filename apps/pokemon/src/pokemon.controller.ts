import { Controller, Get, Req } from '@nestjs/common'
import { PokemonService } from './pokemon.service'
import { Auth } from '@lib/common'

@Controller()
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @Auth()
  getHello(@Req() req: any): string {
    return req.user
  }
}
