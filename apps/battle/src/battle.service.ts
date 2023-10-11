import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { BattleManager } from './battle-manager.service'
import { BasePokemonDocument, CaughtPokemonRepository, UserDocument } from '@lib/common'
import { BattleStatus, DEFAULT_VALUES, EVENTS, PlayerBattleInfo } from '@utils/utils'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class BattleService {
  constructor(
    private readonly battleManager: BattleManager,
    private readonly CaughtPokemonRepository: CaughtPokemonRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async join(user: UserDocument) {
    const pokemonBattleInfo = {}
    const pokemon = await this.CaughtPokemonRepository.find(
      { _id: { $in: user.pokemon.active.map(id => new Types.ObjectId(id)) } },
      { level: 1, moveset: 1, stats: 1, nickname: 1, pokemon: 1 },
      { populate: { path: 'pokemon', select: 'typings' } },
    )

    pokemon.forEach(pokemon => {
      pokemonBattleInfo[pokemon._id.toString()] = {
        id: pokemon._id.toString(),
        name: pokemon.nickname,
        typings: [],
        level: pokemon.level,
        moves: pokemon.moveset,
        currentHp: pokemon.stats.hp,
        baseStats: pokemon.stats,
        modifiedStats: {
          attack: { current: pokemon.stats.attack, stages: 0 },
          defense: { current: pokemon.stats.defence, stages: 0 },
          speed: { current: pokemon.stats.speed, stages: 0 },
        },
        status: null,
      }
    })

    const playerInfo: PlayerBattleInfo = {
      id: user._id.toString(),
      username: user.username,
      pokemon: pokemonBattleInfo,
      onFieldPokemonId: null,
      time: DEFAULT_VALUES.BATTLE_TIMEOUT,
      points: user.battle.points,
      rank: user.battle.rank,
      selectedMoveId: null,
    }

    const battle = this.battleManager.joinBattle(playerInfo)
    this.eventEmitter.emitAsync(EVENTS.USER_JOINED_BATTLE, user._id.toString(), battle)

    return battle
  }

  getBattleByStatus(status: BattleStatus) {
    if (status === 'in-progress') return this.battleManager.getLiveBattles()
    else if (status === 'waiting') return this.battleManager.getWaitingBattles()
  }
}
