import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { BLOCKS_VALUE, Block, City, SpawnedPokemonInfo, SpawnsManagerKey } from '@utils/utils'

@Injectable()
export class SpawnsManager {
  private spawns: Map<Types.ObjectId, SpawnedPokemonInfo>
  private spawnsPool: SpawnedPokemonInfo[]

  constructor() {
    this.spawns = new Map()
    this.spawnsPool = []
  }

  private getSpawnInfoFromPool(): SpawnedPokemonInfo {
    if (this.spawnsPool.length > 0) return this.spawnsPool.pop()!
    return { id: '' as unknown as Types.ObjectId, location: { city: 'aurora', block: '0:0' }, caughtBy: [] }
  }

  private returnSpawnInfoToPool(spawnInfo: SpawnedPokemonInfo) {
    spawnInfo.caughtBy = []
    this.spawnsPool.push(spawnInfo)
  }

  addNewSpawn(spawnId: Types.ObjectId, city: City, block: Block) {
    const spawn = this.getSpawnInfoFromPool()

    spawn.id = spawnId
    spawn.location.city = city
    spawn.location.block = block

    this.spawns.set(spawnId, { id: spawnId, location: { city, block }, caughtBy: [] })
  }

  removeSpawn(spawnId: Types.ObjectId) {
    const spawn = this.spawns.get(spawnId)
    if (spawn) {
      this.spawns.delete(spawnId)
      this.returnSpawnInfoToPool(spawn)
    }
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
        if (!spawn) emptyBlocks.push(`${left}:${top}`)
      }
    }

    return emptyBlocks
  }

  getUserCaughtSpawnIdsByCity(city: City, userId: Types.ObjectId) {
    const spawnsArray = [...this.spawns.values()]
    return spawnsArray.filter(spawn => spawn.location.city === city && !spawn.caughtBy.includes(userId)).map(spawn => spawn.id)
  }
}
