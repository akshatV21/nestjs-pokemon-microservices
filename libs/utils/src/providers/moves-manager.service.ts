import { Injectable } from '@nestjs/common'
import { readFile } from 'fs/promises'
import { watch } from 'chokidar'
import { Move, MovePool } from '../interfaces'

@Injectable()
export class MovesManager {
  private moves: Record<string, Move> = {}
  private movePools: Record<string, MovePool> = {}

  constructor() {
    this.loadMoves()
    this.loadMovePool()

    watch('./dist/data/moves.json').on('change', () => this.loadMoves())
    watch('./dist/data/move-pool.json').on('change', () => this.loadMovePool())
  }

  async loadMoves() {
    const movesInJSON = await readFile('./dist/data/moves.json', { encoding: 'utf-8' })
    console.log('Done loading moves.')
    this.moves = JSON.parse(movesInJSON)
  }

  async loadMovePool() {
    const movePoolInJSON = await readFile('./dist/data/move-pool.json', { encoding: 'utf-8' })
    console.log('Done loading move pools')
    this.movePools = JSON.parse(movePoolInJSON)
  }

  getMove(moveId: string) {
    return this.moves[moveId]
  }

  getMovePool(pokemonId: string) {
    return this.movePools[pokemonId]
  }

  getPokemonRandomMoveset(pokemonId: string) {
    const movePool = this.movePools[pokemonId].moves
    const moveset: string[] = []
    console.log(movePool)
    while (moveset.length < 4) {
      const randomMove = movePool[Math.floor(Math.random() * movePool.length)]
      console.log(randomMove.moveId)
      if (!moveset.includes(randomMove.moveId)) moveset.push(randomMove.moveId)
    }

    return moveset
  }

  getMoveset(moveIds: string[]) {
    return moveIds.map(moveId => this.moves[moveId])
  }
}
