import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { BLOCKS_VALUE, Block, City, SpawnsManagerKey } from '@utils/utils'

@Injectable()
export class SpawnsManager {
  private spawns: Map<SpawnsManagerKey, Types.ObjectId>

  constructor() {
    this.spawns = new Map()
  }

  addNewSpawn(city: City, block: Block, spawnId: Types.ObjectId) {
    this.spawns.set(`${city}-${block}`, spawnId)
  }

  removeSpawn(city: City, block: Block) {
    this.spawns.delete(`${city}-${block}`)
  }

  getSpawnId(city: City, block: Block): Types.ObjectId | undefined {
    return this.spawns.get(`${city}-${block}`)
  }

  hasSpawn(city: City, block: Block): boolean {
    return this.spawns.has(`${city}-${block}`)
  }

  getSpawnsByCity(city: City): Types.ObjectId[] {
    const spawns = this.spawns.entries()
    const spawnsByCity: Types.ObjectId[] = []

    for (const [key, spawnId] of spawns) {
      const [spawnCity] = key.split('-')
      if (spawnCity === city) spawnsByCity.push(spawnId)
    }

    return spawnsByCity
  }

  getAllSpawns(): Types.ObjectId[] {
    return [...this.spawns.values()]
  }

  getEmptyBlocksByCity(city: City): Block[] {
    const emptyBlocks: Block[] = []

    for (let left = BLOCKS_VALUE.MIN_LEFT; left <= BLOCKS_VALUE.MAX_LEFT; left++) {
      for (let top = BLOCKS_VALUE.MIN_TOP; top <= BLOCKS_VALUE.MAX_TOP; top++) {
        const key: SpawnsManagerKey = `${city}-${left}:${top}`
        if (!this.spawns.has(key)) emptyBlocks.push(`${left}:${top}`)
      }
    }
    return emptyBlocks
  }
}
