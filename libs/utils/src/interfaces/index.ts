import { Socket } from 'socket.io'
import { BattleStatus, Block, City, MoveType, PokemonTyping, Rank, StatusCondition } from '../types'
import { Types } from 'mongoose'
import { PokemonStatsSchema } from '@lib/common'

export interface HttpSuccessResponse {
  success: boolean
  message: string
  data: Record<string, any>
}

export interface AuthOptions {
  isLive?: boolean
  isOpen?: boolean
  cached?: boolean
}

export interface AuthenticatedSocket extends Socket {
  entityId?: string
}

export interface SpawnedPokemonInfo {
  id: Types.ObjectId
  location: {
    city: City
    block: Block
  }
  caughtBy: Types.ObjectId[]
}

export interface PokemonLevelUp {
  pokemon: string
  levelsGained: number
}

export interface TradeInfo {
  userOne: {
    id: Types.ObjectId
    pokemon: Types.ObjectId | null
    confirm: boolean
  }
  userTwo: {
    id: Types.ObjectId
    pokemon: Types.ObjectId | null
    confirm: boolean
  } | null
  code: `${number}`
}

export interface Move {
  id: string
  name: string
  description: string
  typing: PokemonTyping
  power: number
  accuracy: number
  pp: number
  priority: number
  type: MoveType
  burn?: number // chance to burn
  sleep?: number // chance to sleep
  poison?: number // chance to poison
  freeze?: number // chance to freeze
  paralyze?: number // chance to paralyze
  flinch?: number // chance to flinch
  recoil?: number // fraction of damage to be taken as recoil
  heal?: number // fraction of damage to be healed
  user?: {
    attack?: number // no of stages to increase or decrease attack
    defense?: number // no of stages to increase or decrease defense
    speed?: number // no of stages to increase or decrease speed
  }
  opponent?: {
    attack?: number // no of stages to increase or decrease attack
    defense?: number // no of stages to increase or decrease defense
    speed?: number // no of stages to increase or decrease speed
  }
}

export interface MovePool {
  pokemonId: string
  moves: {
    moveId: string
    level: number
  }[]
}

export interface ModifiedPokemonStats {
  attack: {
    current: number
    stages: number
  }
  defense: {
    current: number
    stages: number
  }
  speed: {
    current: number
    stages: number
  }
}

export interface PokemonBattleInfo {
  id: string
  name: string
  typings: PokemonTyping[]
  level: number
  moves: string[]
  currentHp: number
  baseStats: PokemonStatsSchema
  modifiedStats: ModifiedPokemonStats
  status: StatusCondition | null
}

export interface PlayerBattleInfo {
  id: string
  username: string
  pokemon: Record<string, PokemonBattleInfo>
  onFieldPokemonId: string | null
  selectedMoveId: string | null
  time: number
  points: number
  rank: Rank
}

export interface BattleInfo {
  id: string
  status: BattleStatus
  players: Record<string, PlayerBattleInfo>
  turns: number
}

export interface SelectFirstPokemon {
  pokemonId: string
  playerId: string
  battleId: string
}

export interface UpdatePlayerTimer {
  battleId: string
  playerId: string
  time: number
}

export interface PlayerTimedOut {
  battleId: string
  playerId: string
}

export interface SelectMove {
  battleId: string
  playerId: string
  moveId: string
}

export interface TurnStage {
  from: string
  to: string
  missed: boolean
  damage?: number
  critical?: boolean
  effectiveness?: 'super-effective' | 'not-very-effective' | 'nuetral'
  fainted: boolean
  failed?: boolean
  status?: StatusCondition
  statChanges?: Record<string, Partial<ModifiedPokemonStats>>
  messages: string[]
}
