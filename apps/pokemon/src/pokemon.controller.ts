import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common'
import { Types } from 'mongoose'
import { PokemonService } from './pokemon.service'
import { Auth, AuthUser, UserDocument } from '@lib/common'
import { CreatePokemonDto } from './dtos/create-pokemon.dto'
import { HttpSuccessResponse, ParseObjectId } from '@utils/utils'
import { CreateEvolutionLineDto } from './dtos/create-evolution-line.dto'
import { AddActivePokemonDto } from './dtos/add-active-pokemon.dto'

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
    return { success: true, message: 'Pokemon fetched successfully.', data: { pokemon, total: pokemon.length } }
  }

  @Get(':basePokemonId')
  @Auth()
  async httpGetBasePokemon(@Param('basePokemonId', ParseObjectId) basePokemonId: Types.ObjectId): Promise<HttpSuccessResponse> {
    const pokemon = await this.pokemonService.getBasePokemon(basePokemonId)
    return { success: true, message: 'Base pokemon fetched successfully.', data: { pokemon } }
  }

  @Post('evolution')
  @Auth()
  async httpCreateEvolutionLine(@Body() createEvolutionLineDto: CreateEvolutionLineDto): Promise<HttpSuccessResponse> {
    const evolutionLine = await this.pokemonService.createEvolutionLine(createEvolutionLineDto)
    return { success: true, message: 'Evolution line created successfully.', data: { evolutionLine } }
  }

  @Get('evolution/:basePokemonId')
  @Auth({ isOpen: true })
  async httpGetPokemonEvolutionLine(@Param('basePokemonId', ParseObjectId) basePokemonId: Types.ObjectId): Promise<HttpSuccessResponse> {
    const evolutionLine = await this.pokemonService.getPokemonEvolutionLine(basePokemonId)
    return { success: true, message: 'Fetched evolution line successfully.', data: { evolutionLine } }
  }

  @Patch('active')
  @Auth({ isOpen: true })
  async httpAddActivePokemon(
    @Body() addActivePokemonDto: AddActivePokemonDto,
    @AuthUser() user: UserDocument,
  ): Promise<HttpSuccessResponse> {
    const activePokemon = await this.pokemonService.addActivePokemon(addActivePokemonDto, user)
    return { success: true, message: 'Added active pokemon successfully.', data: { activePokemon } }
  }
}
