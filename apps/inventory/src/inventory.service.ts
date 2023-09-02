import { ItemUsedDto, UserDocument, UserRepository } from '@lib/common'
import { BadRequestException, Injectable } from '@nestjs/common'
import { UpdateQuery } from 'mongoose'
import { DROPPED_ITEMS_QUANTITY, ITEMS, Item } from '@utils/utils'
import { DROP_RATES } from './rates/drop-rates'
import { DiscardItemsDto } from './dtos/discard-items.dto'

@Injectable()
export class InventoryService {
  constructor(private readonly UserRepository: UserRepository) {}

  // Generates dropped items for a user's inventory.
  async drops(user: UserDocument) {
    // Check if there's enough space in the user's inventory.
    const totalItems = Object.values(user.inventory.items).reduce((prev, curr) => prev + curr, 0)
    if (totalItems >= user.inventory.storageLimit) {
      throw new BadRequestException('No space left in your inventory.')
    }

    // Initialize the dropped items object.
    const drops: Record<Item, number> = {
      pokeballs: 0,
      greatballs: 0,
      ultraballs: 0,
      razzBerry: 0,
      pinapBerry: 0,
      goldenRazzBerry: 0,
    }

    // Determine the quantity of dropped items.
    const dropQuantity =
      Math.floor(Math.random() * (DROPPED_ITEMS_QUANTITY.MAX - DROPPED_ITEMS_QUANTITY.MIN + 1)) + DROPPED_ITEMS_QUANTITY.MIN

    // Generate dropped items based on drop rates.
    for (let i = 0; i < dropQuantity; i++) {
      const randomDropRate = Math.random()
      const item = this.getRandomItem(randomDropRate)
      drops[item] += 1
    }

    // Update the user's inventory with the dropped items.
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

  // Decrements the count of the specified ball or berry item in the user's inventory.
  async useItem({ user, ball, berry }: ItemUsedDto) {
    await this.UserRepository.update(user, {
      $inc: { [`inventory.items.${ball}`]: ball ? -1 : 0, [`inventory.items.${berry}`]: berry ? -1 : 0 },
    })
  }

  async discard(discardItemsDto: DiscardItemsDto, user: UserDocument) {
    const items = Object.keys(discardItemsDto)
    const updateQuery: UpdateQuery<UserDocument> = {}

    for (const item of items) {
      const currentCount = -user.inventory.items[item]
      const decrementValue = currentCount <= discardItemsDto[item] ? discardItemsDto[item] : currentCount
      updateQuery.$inc[`inventory.items${item}`] = decrementValue
    }

    const updatedUser = await this.UserRepository.update(user._id, updateQuery, { new: true, projection: { 'inventory.items': 1 } })
    return updatedUser.inventory.items
  }

  // Returns a random item based on drop rates.
  private getRandomItem(randomDropRate: number) {
    let cumulativeDropRate = 0

    for (let item of ITEMS) {
      cumulativeDropRate += DROP_RATES[item]
      if (randomDropRate <= cumulativeDropRate) {
        return item
      }
    }
  }
}
