import { Controller, Get } from '@nestjs/common'
import { BattleService } from './battle.service'

@Controller()
export class BattleController {
  constructor(private readonly battleService: BattleService) {}
}
