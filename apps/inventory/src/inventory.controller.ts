import { Controller, Get } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { Auth, AuthUser, UserDocument } from '@lib/common'
import { HttpSuccessResponse } from '@utils/utils'

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('drops')
  @Auth()
  async httpGetDrops(@AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const drops = await this.inventoryService.drops(user)
    return { success: true, message: 'Fetch drops successfully.', data: { drops } }
  }
}
