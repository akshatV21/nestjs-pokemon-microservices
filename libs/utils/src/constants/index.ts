export const DEFAULT_VALUES = {
  POKEMON_STORAGE_LIMIT: 100,
  MIN_BASE_STAT: 10,
  MAX_BASE_STAT: 140,
  INVENTORY_STORAGE_LIMIT: 200,
  ACTIVE_POKEMON_LIMIT: 6,
  MIN_LEVEL: 1,
  MAX_LEVEL: 40,
} as const

export const REQUEST_TYPES = ['http', 'rpc', 'ws'] as const

export const EXCEPTION_MSGS = {
  UNAUTHORIZED: 'UnauthorizedAccess',
  JWT_EXPIRED: 'JwtExpired',
  INVALID_JWT: 'InvalidJwt',
  NULL_TOKEN: 'NullToken',
} as const

export const SERVICES = {
  AUTH_SERVICE: 'AUTH',
  POKEMON_SERVICE: 'POKEMON',
  SPAWNS_SERVICE: 'SPAWNS',
  INVENTORY_SERVICE: 'INVENTORY',
} as const

export const EVENTS = {
  AUTHORIZE: 'authorize',
  POKEMON_SPAWNED: 'pokemon-spawned',
  POKEMON_DESPAWNED: 'pokemon-despawned',
  BASE_POKEMON_LIST_UPDATED: 'base-pokemon-list-updated',
  ITEM_USED: 'item-used',
  POKEMON_CAUGHT: 'pokemon-caught',
  POKEMON_XP_DISTRIBUTED: 'pokemon-xp-distributed',
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
  MAX_LEFT: 10,
  MAX_TOP: 10,
} as const

export const MAX_SPAWNS_PER_BLOCK = 1

export const INITIAL_SPAWN_SIZE = 40

export const SPAWN_TIME = {
  MIN: 4000,
  MAX: 8000,
} as const

export const MAX_LEVEL_IN_WILD = 24

export const TOTAL_SPAWN_RATE = 100

export const NEW_SPAWN_DELAY = {
  MIN: 2000,
  MAX: 6000,
} as const

export const DROPPED_ITEMS_QUANTITY = {
  MIN: 6,
  MAX: 14,
} as const

export const ITEMS = ['pokeballs', 'greatballs', 'ultraballs', 'razzBerry', 'pinapBerry', 'goldenRazzBerry'] as const

export const BALLS = ['pokeballs', 'greatballs', 'ultraballs'] as const

export const BERRIES = ['razzBerry', 'pinapBerry', 'goldenRazzBerry'] as const

export const CATCH_RATE_MODIFIERS = {
  POKEBALLS: 0,
  GREATBALLS: 0.1,
  ULTRABALLS: 0.2,
  RAZZBERRY: 0.05,
  GOLDENRAZZBERRY: 0.1,
} as const

export const POKEMON_XP_TO_LEVEL_UP = {
  1: 100,
  2: 353,
  3: 607,
  4: 861,
  5: 1115,
  6: 1369,
  7: 1623,
  8: 1876,
  9: 2130,
  10: 2384,
  11: 2638,
  12: 2892,
  13: 3146,
  14: 3400,
  15: 3653,
  16: 3907,
  17: 4161,
  18: 4415,
  19: 4669,
  20: 4923,
  21: 5176,
  22: 5430,
  23: 5684,
  24: 5938,
  25: 6192,
  26: 6446,
  27: 6700,
  28: 6953,
  29: 7207,
  30: 7461,
  31: 7715,
  32: 7969,
  33: 8223,
  34: 8476,
  35: 8730,
  36: 8984,
  37: 9238,
  38: 9492,
  39: 9746,
  40: 10000,
} as const

export const BASE_POKEMON_PAGINATION_LIMIT = 10

export const STAT_INCREMENT_VALUES = {
  ATTACK: 2,
  DEFENCE: 1.6,
  HP: 1.8,
  SPEED: 1.4,
} as const
