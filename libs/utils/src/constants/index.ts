import { ContextType } from '@nestjs/common'

export const DEFAULT_VALUES = {
  POKEMON_STORAGE_LIMIT: 100,
  MIN_BASE_STAT: 10,
  MAX_BASE_STAT: 100,
} as const

export const REQUEST_TYPES = ['http', 'rpc', 'ws'] as const

export const EXCEPTION_MSGS = {
  UNAUTHORIZED: 'UnauthorizedAccess',
  JWT_EXPIRED: 'JwtExpired',
  INVALID_JWT: 'InvalidJwt',
} as const

export const SERVICES = {
  AUTH_SERVICE: 'AUTH',
  POKEMON_SERVICE: 'POKEMON',
} as const

export const EVENTS = {
  AUTHORIZE: 'authorize',
} as const

export const POKEMON_TYPINGS = {
  NORMAL: 'normal',
  FIRE: 'fire',
  WATER: 'water',
  ELECTRIC: 'electric',
  GRASS: 'grass',
  ICE: 'ice',
  FIGHTING: 'fighting',
  POISON: 'poison',
  GROUND: 'ground',
  FLYING: 'flying',
  PSYCHIC: 'psychic',
  BUG: 'bug',
  ROCK: 'rock',
  GHOST: 'ghost',
  DRAGON: 'dragon',
  DARK: 'dark',
  STEEL: 'steel',
  FAIRY: 'fairy',
} as const

export const EVOLUTION_STAGES = {
  0: 'stageZero',
  1: 'stageOne',
  2: 'stageTwo',
  3: 'stageThree',
} as const
