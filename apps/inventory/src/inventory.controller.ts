import { Controller, Get } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { Auth, AuthUser, ItemUsedDto, UserDocument } from '@lib/common'
import { EVENTS, HttpSuccessResponse } from '@utils/utils'
import { EventPattern, Payload } from '@nestjs/microservices'

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('drops')
  @Auth()
  async httpGetDrops(@AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const drops = await this.inventoryService.drops(user)
    return { success: true, message: 'Fetch drops successfully.', data: { drops } }
  }

  @EventPattern(EVENTS.ITEM_USED)
  handleItemUsedMessage(@Payload() payload: ItemUsedDto) {
    this.inventoryService.useItem(payload)
  }
}
