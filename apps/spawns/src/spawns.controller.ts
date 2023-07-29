import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { SpawnsService } from './spawns.service'
import { Auth, AuthUser, UserDocument } from '@lib/common'
import { City, EVENTS, HttpSuccessResponse } from '@utils/utils'
import { MessagePattern } from '@nestjs/microservices'
import { CatchSpawnDto } from './dtos/catch-spawn.dto'

@Controller('spawns')
export class SpawnsController {
  constructor(private readonly spawnsService: SpawnsService) {}

  @Get(':city')
  @Auth()
  async httpGetCitySpawns(@Param('city') city: City, @AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const spawns = await this.spawnsService.getCitySpawns(city, user)
    return { success: true, message: `Fetched ${city} spawns successfully.`, data: { spawns } }
  }

  @Post('catch')
  @Auth({ cached: false })
  async httpCatchPokemon(@Body() catchSpawnDto: CatchSpawnDto, @AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const pokemon = await this.spawnsService.catch(catchSpawnDto, user)
    return { success: true, message: 'Caught pokemon successfully.', data: { pokemon } }
  }

  @MessagePattern(EVENTS.BASE_POKEMON_LIST_UPDATED)
  handleBasePokemonListUpdatedEvent() {
    this.spawnsService.updateBasePokemonList()
  }
}
