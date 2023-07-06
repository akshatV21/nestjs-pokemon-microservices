import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { PokemonService } from './pokemon.service'
import { Auth } from '@lib/common'
import { CreatePokemonDto } from './dtos/create-pokemon.dto'
import { HttpSuccessResponse } from '@utils/utils'

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  @Auth()
  async httpCreatePokemon(@Body() createPokemonDto: CreatePokemonDto): Promise<HttpSuccessResponse> {
    const pokemon = await this.pokemonService.create(createPokemonDto)
    return { success: true, message: 'New pokemon created successfully.', data: { pokemon } }
  }
}
