import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { PokemonService } from './pokemon.service'
import { Auth } from '@lib/common'
import { CreatePokemonDto } from './dtos/create-pokemon.dto'
import { HttpSuccessResponse } from '@utils/utils'
import { CreateEvolutionLineDto } from './dtos/create-evolution-line.dto'

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  @Auth()
  async httpCreatePokemon(@Body() createPokemonDto: CreatePokemonDto): Promise<HttpSuccessResponse> {
    const pokemon = await this.pokemonService.create(createPokemonDto)
    return { success: true, message: 'New pokemon created successfully.', data: { pokemon } }
  }

  @Get('list')
  @Auth()
  async httpListPokemon(): Promise<HttpSuccessResponse> {
    const pokemon = await this.pokemonService.list()
    return { success: true, message: 'Pokemon fetched successfully.', data: { pokemon } }
  }

  @Post('evolution')
  @Auth()
  async httpCreateEvolutionLine(@Body() createEvolutionLineDto: CreateEvolutionLineDto): Promise<HttpSuccessResponse> {
    const evolutionLine = await this.pokemonService.createEvolutionLine(createEvolutionLineDto)
    return { success: true, message: 'Evolution line created successfully.', data: { evolutionLine } }
  }
}
