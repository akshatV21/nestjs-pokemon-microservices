import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common'
import { Types } from 'mongoose'
import { PokemonService } from './pokemon.service'
import { Auth, AuthUser, PokemonXpGainDto, UserDocument } from '@lib/common'
import { CreatePokemonDto } from './dtos/create-pokemon.dto'
import { EVENTS, HttpSuccessResponse, ParseObjectId } from '@utils/utils'
import { CreateEvolutionLineDto } from './dtos/create-evolution-line.dto'
import { AddActivePokemonDto } from './dtos/add-active-pokemon.dto'
import { RemoveActivePokemonDto } from './dtos/remove-active-pokemon.dto'
import { TransferPokemonDto } from './dtos/transfer-pokemon.dto'
import { UpdateNicknameDto } from './dtos/update-nickname.dto'
import { EventPattern, Payload } from '@nestjs/microservices'

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
  async httpListBasePokemon(@Query('page', ParseIntPipe) page: number): Promise<HttpSuccessResponse> {
    const pokemon = await this.pokemonService.listBasePokemon(page)
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
  @Auth()
  async httpGetPokemonEvolutionLine(@Param('basePokemonId', ParseObjectId) basePokemonId: Types.ObjectId): Promise<HttpSuccessResponse> {
    const evolutionLine = await this.pokemonService.getPokemonEvolutionLine(basePokemonId)
    return { success: true, message: 'Fetched evolution line successfully.', data: { evolutionLine } }
  }

  @Patch('active/add')
  @Auth({ cached: false })
  async httpAddActivePokemon(
    @Body() addActivePokemonDto: AddActivePokemonDto,
    @AuthUser() user: UserDocument,
  ): Promise<HttpSuccessResponse> {
    const activePokemon = await this.pokemonService.addActivePokemon(addActivePokemonDto, user)
    return { success: true, message: 'Added active pokemon successfully.', data: { activePokemon } }
  }

  @Patch('active/remove')
  @Auth({ cached: false })
  async httpRemoveActivePokemon(
    @Body() removeActivePokemonDto: RemoveActivePokemonDto,
    @AuthUser() user: UserDocument,
  ): Promise<HttpSuccessResponse> {
    const activePokemon = await this.pokemonService.removeActivePokemon(removeActivePokemonDto, user)
    return { success: true, message: 'Removed active pokemon successfully.', data: { activePokemon } }
  }

  @Patch('transfer')
  @Auth({ cached: false })
  async httpTransferPokemon(@Body() transferPokemonDto: TransferPokemonDto, @AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const transferredPokemon = await this.pokemonService.transfer(transferPokemonDto, user)
    return { success: true, message: 'Pokemon transferred successfully.', data: transferredPokemon }
  }

  @Patch('nickname')
  @Auth({ cached: false })
  async httpUpdateNickname(@Body() updateNicknameDto: UpdateNicknameDto, @AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const nickname = await this.pokemonService.updateNickname(updateNicknameDto, user)
    return { success: true, message: 'Nickname updated successfully.', data: { nickname } }
  }

  @EventPattern(EVENTS.POKEMON_CAUGHT)
  handlePokemonCaughtEvent(@Payload() pokemonXpGainDto: PokemonXpGainDto) {
    this.pokemonService.distributeXpToActivePokemon(pokemonXpGainDto)
  }
}
