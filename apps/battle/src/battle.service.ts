import { Injectable } from '@nestjs/common'
import { BattleManager } from './battle-manager.service'
import { CaughtPokemonRepository, UserDocument } from '@lib/common'
import { DEFAULT_VALUES, PlayerBattleInfo, PokemonBattleInfo } from '@utils/utils'

@Injectable()
export class BattleService {
  constructor(private readonly battleManager: BattleManager, private readonly CaughtPokemonRepository: CaughtPokemonRepository) {}

  async join(user: UserDocument) {
    const pokemonBattleInfo = {}
    const pokemon = await this.CaughtPokemonRepository.find({ _id: { $in: user.pokemon.active } }, { level: 1, moveset: 1, stats: 1 })

    pokemon.forEach(pokemon => {
      pokemonBattleInfo[pokemon._id.toString()] = {
        id: pokemon._id.toString(),
        level: pokemon.level,
        moves: pokemon.moveset,
        currentHp: pokemon.stats.hp,
        baseStats: pokemon.stats,
        modifiedStats: [],
      }
    })

    const playerInfo: PlayerBattleInfo = {
      id: user._id.toString(),
      username: user.username,
      pokemon: pokemonBattleInfo,
      onFieldPokemonId: null,
      time: DEFAULT_VALUES.BATTLE_TIMEOUT,
    }

    const battle = this.battleManager.joinBattle(playerInfo)
    return battle
  }
}
