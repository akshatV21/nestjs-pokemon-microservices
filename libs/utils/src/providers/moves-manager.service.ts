import { Injectable } from '@nestjs/common'
import { readFile } from 'fs/promises'
import { watch } from 'chokidar'
import { Move, MovePool } from '../interfaces'
import { Effectiveness } from '../types'
import { TYPE_CHART } from '../constants'

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

    while (moveset.length < 4) {
      const randomMove = movePool[Math.floor(Math.random() * movePool.length)]
      if (!moveset.includes(randomMove.moveId)) moveset.push(randomMove.moveId)
    }

    return moveset
  }

  getMoveset(moveIds: string[]) {
    return moveIds.map(moveId => this.moves[moveId])
  }

  getEffectiveness(move: Move, typings: string[]) {
    let effectiveness: Effectiveness

    for (const type of typings) {
      const currentEffectiveness = TYPE_CHART[move.typing][type]

      if (!effectiveness) effectiveness = currentEffectiveness
      else if (currentEffectiveness === 'super-effective' && effectiveness === 'not-very-effective') effectiveness = 'nuetral'
      else if (currentEffectiveness === 'not-very-effective' && effectiveness === 'super-effective') effectiveness = 'nuetral'
      else if (currentEffectiveness === 'super-effective' && effectiveness === 'nuetral') effectiveness = 'super-effective'
      else if (currentEffectiveness === 'not-very-effective' && effectiveness === 'nuetral') effectiveness = 'not-very-effective'
    }

    return effectiveness
  }
}
