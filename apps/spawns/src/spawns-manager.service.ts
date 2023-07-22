import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { BLOCKS_VALUE, Block, City, SpawnedPokemonInfo, SpawnsManagerKey } from '@utils/utils'

@Injectable()
export class SpawnsManager {
  private spawns: Map<Types.ObjectId, SpawnedPokemonInfo>

  constructor() {
    this.spawns = new Map()
  }

  addNewSpawn(spawnId: Types.ObjectId, city: City, block: Block) {
    this.spawns.set(spawnId, { id: spawnId, location: { city, block }, caughtBy: [] })
  }

  removeSpawn(spawnId: Types.ObjectId) {
    this.spawns.delete(spawnId)
  }

  addCaughtBy(spawnId: Types.ObjectId, userId: Types.ObjectId) {
    const spawn = this.spawns.get(spawnId)
    spawn.caughtBy.push(userId)
    this.spawns.set(spawnId, spawn)
  }

  getEmptyBlocksByCity(city: City): Block[] {
    const emptyBlocks: Block[] = []
    const spawnsArray = [...this.spawns.values()]

    for (let left = BLOCKS_VALUE.MIN_LEFT; left <= BLOCKS_VALUE.MAX_LEFT; left++) {
      for (let top = BLOCKS_VALUE.MIN_TOP; top <= BLOCKS_VALUE.MAX_TOP; top++) {
        const spawn = spawnsArray.find(spawn => spawn.location.city === city && spawn.location.block === `${left}:${top}`)
        if (!spawn) emptyBlocks.push(spawn.location.block)
      }
    }

    return emptyBlocks
  }

  getUserCaughtSpawnIdsByCity(city: City, userId: Types.ObjectId) {
    const spawnsArray = [...this.spawns.values()]
    return spawnsArray.filter(spawn => spawn.location.city === city && !spawn.caughtBy.includes(userId)).map(spawn => spawn.id)
  }
}
