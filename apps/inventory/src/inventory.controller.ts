import { Body, Controller, Delete, Get, Post } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { Auth, AuthUser, ItemUsedDto, UserDocument } from '@lib/common'
import { EVENTS, HttpSuccessResponse } from '@utils/utils'
import { EventPattern, Payload } from '@nestjs/microservices'
import { DiscardItemsDto } from './dtos/discard-items.dto'
import { BuyItemsDto } from './dtos/buy-items.dto'

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('drops')
  @Auth()
  async httpGetDrops(@AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const drops = await this.inventoryService.drops(user)
    return { success: true, message: 'Fetch drops successfully.', data: { drops } }
  }

  @Delete('discard')
  @Auth({ cached: false })
  async httpDiscardItems(@Body() discardItemsDto: DiscardItemsDto, @AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const items = await this.inventoryService.discard(discardItemsDto, user)
    return { success: true, message: 'Items discarded successfully.', data: { items } }
  }

  @EventPattern(EVENTS.ITEM_USED)
  handleItemUsedMessage(@Payload() payload: ItemUsedDto) {
    this.inventoryService.useItem(payload)
  }

  @Post('buy/items')
  @Auth({ cached: false })
  async httpBuyItems(@Body() buyItemsDto: BuyItemsDto, @AuthUser() user: UserDocument): Promise<HttpSuccessResponse> {
    const result = await this.inventoryService.buyItems(buyItemsDto, user)
    return { success: true, message: 'Bought items successfully.', data: result }
  }
}
