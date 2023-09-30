import { Controller, Post, Get, Query } from '@nestjs/common'
import { BattleService } from './battle.service'
import { Auth, AuthUser, UserDocument } from '@lib/common'
import { BattleStatus, HttpSuccessResponse } from '@utils/utils'

@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post('join')
  @Auth({ cached: false })
  async httpJoinBattle(@AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const battle = await this.battleService.join(user)
    return { success: true, message: 'Joined battle successfully.', data: { battle } }
  }

  @Get('list')
  @Auth()
  async httpGetBattleList(@Query('status') status: BattleStatus): Promise<HttpSuccessResponse> {
    const battles = this.battleService.getBattleByStatus(status)
    return { success: true, message: 'Retrieved battle list successfully.', data: { battles } }
  }
}
