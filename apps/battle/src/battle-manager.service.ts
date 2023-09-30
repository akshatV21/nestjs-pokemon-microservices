import { Injectable, BadRequestException } from '@nestjs/common'
import crypto from 'crypto'
import { BattleInfo, DEFAULT_VALUES, PlayerBattleInfo } from '@utils/utils'

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
    return crypto.randomBytes(DEFAULT_VALUES.BATTLE_ID_LENGTH).toString('hex')
  }

  joinBattle(player: PlayerBattleInfo) {
    let battle: BattleInfo
    if (this.waitingBattles.length > 0) battle = this.waitingBattles.pop()!
    else battle = this.getBattleInfoFromPool()

    if (battle[player.id]) throw new BadRequestException('Can only play one battle at a time.')

    battle.players[player.id] = player
    battle.id = this.generateBattleId()
    if (Object.keys(battle.players).length === 2) {
      battle.status = 'in-progress'
      this.liveBattles.set(battle.id, battle)
    } else this.waitingBattles.push(battle)

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
}
