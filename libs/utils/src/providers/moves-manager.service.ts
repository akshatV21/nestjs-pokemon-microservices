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

    watch('../../../../data/moves.json').on('change', () => this.loadMoves())
    watch('../../../../data/move-pool.json').on('change', () => this.loadMovePool())
  }

  async loadMoves() {
    const movesInJSON = await readFile('../../../../data/moves.json', { encoding: 'utf-8' })
    this.moves = JSON.parse(movesInJSON)
  }

  async loadMovePool() {
    const movePoolInJSON = await readFile('../../../../data/move-pool.json', { encoding: 'utf-8' })
    this.movePools = JSON.parse(movePoolInJSON)
  }

  getMove(moveId: string) {
    return this.moves[moveId]
  }

  getMovePool(pokemonId: string) {
    return this.movePools[pokemonId]
  }

  getPokemonRandomMoveset(pokedexNo: number) {
    const movePool = this.movePools[pokedexNo].moves
    const moveset: string[] = []

    for (let i = 0; i < 4; i++) {
      const randomMove = movePool[Math.floor(Math.random() * movePool.length)]
      moveset.push(randomMove.moveId)
    }

    return moveset
  }
}
