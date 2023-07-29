import { UserDocument, UserRepository } from '@lib/common'
import { BadRequestException, Injectable } from '@nestjs/common'
import { DROPPED_ITEMS_QUANTITY, ITEMS, Item } from '@utils/utils'
import { DROP_RATES } from './rates/drop-rates'

@Injectable()
export class InventoryService {
  constructor(private readonly UserRepository: UserRepository) {}

  async drops(user: UserDocument) {
    const totalItems = Object.values(user.inventory.items).reduce((prev, curr) => prev + curr, 0)
    if (totalItems >= user.inventory.storageLimit) throw new BadRequestException('No space left in your inventory.')

    const drops: Record<Item, number> = {
      pokeballs: 0,
      greatballs: 0,
      ultraballs: 0,
      razzBerry: 0,
      pinapBerry: 0,
      goldenRazzBerry: 0,
    }

    const dropQuantity =
      Math.floor(Math.random() * (DROPPED_ITEMS_QUANTITY.MAX - DROPPED_ITEMS_QUANTITY.MIN + 1)) + DROPPED_ITEMS_QUANTITY.MIN

    for (let i = 0; i < dropQuantity; i++) {
      const randomDropRate = Math.random()
      const item = this.getRandomItem(randomDropRate)
      drops[item] += 1
    }

    await this.UserRepository.update(user._id, {
      $inc: {
        'inventory.items.pokeballs': drops['pokeballs'],
        'inventory.items.greatballs': drops['greatballs'],
        'inventory.items.ultraballs': drops['ultraballs'],
        'inventory.items.razzBerry': drops['razzBerry'],
        'inventory.items.pinapBerry': drops['pinapBerry'],
        'inventory.items.goldenRazzBerry': drops['goldenRazzBerry'],
      },
    })

    return drops
  }

  getRandomItem(randomDropRate: number) {
    let cumulativeDropRate = 0

    for (let item of ITEMS) {
      cumulativeDropRate += DROP_RATES[item]
      if (randomDropRate <= cumulativeDropRate) return item
    }
  }
}
