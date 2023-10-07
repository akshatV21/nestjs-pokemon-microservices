import {
  BALLS,
  BATTLE_STATUS,
  BERRIES,
  BLOCKS_VALUE,
  CITIES,
  EVOLUTION_STAGES,
  ITEMS,
  MOVE_TYPES,
  POKEMON_TYPINGS,
  RANKING_TYPES,
  SERVICES,
} from '../constants'
import { Types } from 'mongoose'

type ObjectValuesUnion<T extends Record<string, string>> = T extends Record<string, infer U> ? U : never

export type Service = ObjectValuesUnion<typeof SERVICES>

export type PokemonTyping = ObjectValuesUnion<typeof POKEMON_TYPINGS>

export type EvolutionStage = ObjectValuesUnion<typeof EVOLUTION_STAGES>

export type City = ObjectValuesUnion<typeof CITIES>

export type Block = `${number}:${number}`

export type SpawnsManagerKey = `${City}-${Block}`

export type DespawnInfo = {
  spawnId: Types.ObjectId
  city: City
  pokemonSpecies: string
  despawnsIn: number
  block: Block
}

export type Item = (typeof ITEMS)[number]

export type Ball = (typeof BALLS)[number]

export type Berry = (typeof BERRIES)[number]

export type RankingType = ObjectValuesUnion<typeof RANKING_TYPES>

export type MoveType = ObjectValuesUnion<typeof MOVE_TYPES>

export type BattleStatus = ObjectValuesUnion<typeof BATTLE_STATUS>
