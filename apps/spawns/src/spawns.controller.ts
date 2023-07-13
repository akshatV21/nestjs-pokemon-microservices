import { Controller, Get } from '@nestjs/common'
import { SpawnsService } from './spawns.service'

@Controller()
export class SpawnsController {
  constructor(private readonly spawnsService: SpawnsService) {}
}
