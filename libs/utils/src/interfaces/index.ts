import { Socket } from 'socket.io'
import { Block, City } from '../types'
import { Types } from 'mongoose'

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
  }
  userTwo: {
    id: Types.ObjectId
    pokemon: Types.ObjectId | null
  } | null
  code: `${number}`
}
