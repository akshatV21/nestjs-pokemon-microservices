import { Controller, Get, Param } from '@nestjs/common'
import { SpawnsService } from './spawns.service'
import { Auth } from '@lib/common'
import { City, EVENTS, HttpSuccessResponse } from '@utils/utils'
import { MessagePattern } from '@nestjs/microservices'

@Controller('spawns')
export class SpawnsController {
  constructor(private readonly spawnsService: SpawnsService) {}

  @Get(':city')
  @Auth()
  async httpGetCitySpawns(@Param('city') city: City): Promise<HttpSuccessResponse> {
    const spawns = await this.spawnsService.getCitySpawns(city)
    return { success: true, message: `Fetched ${city} spawns successfully.`, data: { spawns } }
  }

  @MessagePattern(EVENTS.BASE_POKEMON_LIST_UPDATED)
  handleBasePokemonListUpdatedEvent() {
    this.spawnsService.updateBasePokemonList()
  }
}
