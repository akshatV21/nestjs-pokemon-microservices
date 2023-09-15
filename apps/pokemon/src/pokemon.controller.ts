import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common'
import { Types } from 'mongoose'
import { PokemonService } from './pokemon.service'
import { Auth, AuthUser, PokemonXpGainDto, UserDocument } from '@lib/common'
import { CreatePokemonDto } from './dtos/create-pokemon.dto'
import { EVENTS, HttpSuccessResponse, ParseObjectId, PokemonLevelUp } from '@utils/utils'
import { CreateEvolutionLineDto } from './dtos/create-evolution-line.dto'
import { AddActivePokemonDto } from './dtos/add-active-pokemon.dto'
import { RemoveActivePokemonDto } from './dtos/remove-active-pokemon.dto'
import { TransferPokemonDto } from './dtos/transfer-pokemon.dto'
import { UpdateNicknameDto } from './dtos/update-nickname.dto'
import { EventPattern, Payload } from '@nestjs/microservices'
import { OnEvent } from '@nestjs/event-emitter'
import { ChangeMoveDto } from './dtos/change-move.dto'

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  @Auth()
  async httpCreatePokemon(@Body() createPokemonDto: CreatePokemonDto): Promise<HttpSuccessResponse> {
    const pokemon = await this.pokemonService.create(createPokemonDto)
    return { success: true, message: 'New pokemon created successfully.', data: { pokemon } }
  }

  @Get('base/list')
  @Auth()
  async httpListBasePokemon(@Query('page', ParseIntPipe) page: number): Promise<HttpSuccessResponse> {
    const pokemon = await this.pokemonService.listBasePokemon(page)
    return { success: true, message: 'Pokemon fetched successfully.', data: { pokemon, total: pokemon.length } }
  }

  @Get('base/:basePokemonId')
  @Auth()
  async httpGetBasePokemon(@Param('basePokemonId', ParseObjectId) basePokemonId: Types.ObjectId): Promise<HttpSuccessResponse> {
    const pokemon = await this.pokemonService.getBasePokemon(basePokemonId)
    return { success: true, message: 'Base pokemon fetched successfully.', data: { pokemon } }
  }

  @Get('caught/list')
  @Auth()
  async httpListCaughtPokemon(@AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const pokemon = await this.pokemonService.getCaughtPokemonList(user)
    return { success: true, message: 'Pokemon fetched successfully.', data: { pokemon } }
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

  @Patch('evolve')
  @Auth({ cached: false })
  async httpEvolvePokemon(@Body() evolvePokemonDto: any, @AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const pokemon = await this.pokemonService.evolve(evolvePokemonDto, user)
    return { success: true, message: 'Pokemon evolved successfully.', data: { pokemon } }
  }

  @EventPattern(EVENTS.POKEMON_CAUGHT)
  handlePokemonCaughtEvent(@Payload() pokemonXpGainDto: PokemonXpGainDto) {
    this.pokemonService.distributeXpToActivePokemon(pokemonXpGainDto)
  }

  @OnEvent(EVENTS.POKEMON_XP_DISTRIBUTED)
  handlePokemonXpDistributedEvent(payload: PokemonLevelUp) {
    console.log(payload)
  }

  // endpoint for fetching pokemon moveset
  @Get('moves/:pokemonId')
  @Auth({ cached: false })
  async httpGetPokemonMoveset(
    @Param('pokemonId', ParseObjectId) pokemonId: Types.ObjectId,
    @AuthUser() user: UserDocument,
  ): Promise<HttpSuccessResponse> {
    const moveset = await this.pokemonService.getPokemonMoveset(pokemonId, user)
    return { success: true, message: 'Pokemon moveset fetched successfully.', data: { moveset } }
  }

  @Patch('moves')
  @Auth({ cached: false })
  async httpChangeMove(@Body() changeMoveDto: ChangeMoveDto, @AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const moveset = await this.pokemonService.changePokemonMove(changeMoveDto, user)
    return { success: true, message: 'Pokemon move changed successfully.', data: { moveset } }
  }
}
