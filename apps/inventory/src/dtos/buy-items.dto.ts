import { ITEMS, Item } from '@utils/utils'
import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator'

export class BuyItemsDto {
  @IsNotEmpty()
  @IsEnum(ITEMS)
  item: Item

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number
}
