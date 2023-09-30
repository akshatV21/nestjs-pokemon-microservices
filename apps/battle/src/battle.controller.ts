import { Controller, Post, Get } from '@nestjs/common'
import { BattleService } from './battle.service'
import { Auth, AuthUser, UserDocument } from '@lib/common'
import { HttpSuccessResponse } from '@utils/utils'

@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post('join')
  @Auth({ cached: false })
  async httpJoinBattle(@AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const battle = await this.battleService.join(user)
    return { success: true, message: 'Joined battle successfully.', data: { battle } }
  }
}
