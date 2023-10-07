import { Injectable, BadRequestException } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { BattleInfo, DEFAULT_VALUES, PlayerBattleInfo } from '@utils/utils'
import { WsException } from '@nestjs/websockets'

@Injectable()
export class BattleManager {
  private battlesPool: BattleInfo[]
  private waitingBattles: BattleInfo[]
  private liveBattles: Map<string, BattleInfo>

  constructor() {
    this.battlesPool = []
    this.waitingBattles = []
    this.liveBattles = new Map()
  }

  private getBattleInfoFromPool(): BattleInfo {
    if (this.battlesPool.length > 0) return this.battlesPool.pop()!
    return { id: '', status: 'waiting', players: {}, turns: 0 }
  }

  private returnBattleInfoToPool(battleInfo: BattleInfo) {
    battleInfo.status = 'waiting'
    battleInfo.turns = 0
    battleInfo.players = {}

    this.battlesPool.push(battleInfo)
  }

  private generateBattleId() {
    return randomBytes(DEFAULT_VALUES.BATTLE_ID_LENGTH).toString('hex')
  }

  joinBattle(player: PlayerBattleInfo) {
    let battle: BattleInfo
    if (this.waitingBattles.length > 0) battle = this.waitingBattles.pop()!
    else battle = this.getBattleInfoFromPool()

    if (battle[player.id]) throw new BadRequestException('Can only play one battle at a time.')

    battle.players[player.id] = player
    if (Object.keys(battle.players).length === 2) {
      battle.status = 'starting'
      this.liveBattles.set(battle.id, battle)
    } else {
      battle.id = this.generateBattleId()
      this.waitingBattles.push(battle)
    }

    return battle
  }

  leaveBattle(battleId: string, playerId: string) {
    const battle = this.liveBattles.get(battleId)
    if (!battle) throw new BadRequestException('Battle not found.')

    delete battle.players[playerId]
    if (Object.keys(battle.players).length === 0) {
      this.liveBattles.delete(battleId)
      this.returnBattleInfoToPool(battle)
    }
  }

  getWaitingBattles() {
    return this.waitingBattles
  }

  getLiveBattles() {
    return this.liveBattles
  }

  selectFirstPokemon(battleId: string, playerId: string, pokemonId: string) {
    let isInProgress = false

    const battle = this.liveBattles.get(battleId)
    if (!battle) throw new WsException('Battle not found.')

    const player = battle.players[playerId]
    const secondPlayerId = Object.keys(battle.players).find(id => id !== playerId)!

    if (!player) throw new WsException('Player not found.')
    if (player.onFieldPokemonId) throw new WsException('You has already selected a pokemon.')
    if (!Object.keys(player.pokemon).includes(pokemonId)) throw new WsException('You do not have this pokemon in your team.')

    player.onFieldPokemonId = pokemonId
    if (battle.players[playerId].onFieldPokemonId && battle.players[secondPlayerId].onFieldPokemonId) {
      battle.status = 'in-progress'
      isInProgress = true
    }

    this.liveBattles.set(battleId, battle)
    return isInProgress ? battle : null
  }

  updateTimer(battleId: string, playerId: string, time: number) {
    const battle = this.liveBattles.get(battleId)
    if (!battle) throw new WsException('Battle not found.')

    const player = battle.players[playerId]
    if (!player) throw new WsException('Player not found.')

    player.time = time
    this.liveBattles.set(battleId, battle)

    return { username: player.username, time: DEFAULT_VALUES.BATTLE_TIMEOUT - time, battleId }
  }

  endBattle(battleId: string) {
    const battle = this.liveBattles.get(battleId)
    if (!battle) throw new WsException('Battle not found.')

    this.liveBattles.delete(battleId)
    this.returnBattleInfoToPool(battle)

    return battle.players
  }
}
