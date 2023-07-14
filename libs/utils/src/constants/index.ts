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
  SPAWNS_SERVICE: 'SPAWNS',
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

export const CACHE_KEYS = {
  EVOLUTION_LINE: 'evolution-line',
  BASE_POKEMON: 'base-pokemon',
  BASE_POKEMON_LIST: 'base-pokemon-list',
} as const

export const CITIES = {
  BLAZEVILLE: 'blazeville',
  AURORA: 'aurora',
  SOLACE: 'solace',
} as const

export const BLOCKS_VALUE = {
  MIN_LEFT: 1,
  MIN_TOP: 1,
  MAX_LEFT: 5,
  MAX_TOP: 5,
} as const

export const MAX_SPAWNS_PER_BLOCK = 1

export const INITIAL_SPAWN_SIZE = 1

export const SPAWN_TIME = {
  MIN: 10000,
  MAX: 14000,
} as const

export const MAX_LEVEL_IN_WILD = 24

export const TOTAL_SPAWN_RATE = 100

export const NEW_SPAWN_DELAY = {
  MIN: 20000,
  MAX: 40000,
} as const
