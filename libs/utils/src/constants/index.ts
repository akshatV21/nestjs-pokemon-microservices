export const DEFAULT_VALUES = {
  POKEMON_STORAGE_LIMIT: 100,
  MIN_BASE_STAT: 10,
  MAX_BASE_STAT: 140,
  INVENTORY_STORAGE_LIMIT: 200,
  ACTIVE_POKEMON_LIMIT: 6,
  MIN_LEVEL: 1,
  MAX_LEVEL: 40,
  BATTLE_TIMEOUT: 180,
  BATTLE_ID_LENGTH: 8,
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
  BATTLE_SERVICE: 'BATTLE',
} as const

export const EVENTS = {
  AUTHORIZE: 'authorize',
  POKEMON_SPAWNED: 'pokemon-spawned',
  POKEMON_DESPAWNED: 'pokemon-despawned',
  BASE_POKEMON_LIST_UPDATED: 'base-pokemon-list-updated',
  ITEM_USED: 'item-used',
  POKEMON_CAUGHT: 'pokemon-caught',
  POKEMON_XP_DISTRIBUTED: 'pokemon-xp-distributed',
  INITIALIZE_TRADE: 'initialize-trade',
  JOIN_TRADE: 'join-trade',
  JOINED_TRADE: 'joined-trade',
  SELECT_POKEMON: 'select-pokemon',
  POKEMON_SELECTED: 'pokemon-selected',
  USER_DISCONNECTED: 'user-disconnected',
  CONFIRM_TRADE: 'confirm-trade',
  TRADE_CONFIRMED: 'trade-confirmed',
  TRADE_COMPLETED: 'trade-completed',
  CANCEL_TRADE: 'cancel-trade',
  TRADE_CANCELED: 'trade-canceled',
  USER_JOINED_BATTLE: 'user-joined-battle',
  FIRST_POKE_SELECTED: 'first-poke-selected',
  BATTLE_STARTED: 'battle-started',
  UPDATE_PLAYER_TIMER: 'update-player-timer',
  PLAYER_TIMER_UPDATED: 'player-timer-updated',
  BATTLE_ENDED: 'battle-ended',
  GET_BATTLE_INFO: 'get-battle-info',
  PLAYER_TIMED_OUT: 'player-timed-out',
  SELECT_MOVE: 'select-move',
  MOVES_SELECTED_BY_BOTH_PLAYERS: 'moves-selected-by-both-players',
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

export const INITIAL_SPAWN_SIZE = 4

export const SPAWN_TIME = {
  MIN: 80000,
  MAX: 120000,
} as const

export const MAX_LEVEL_IN_WILD = 24

export const TOTAL_SPAWN_RATE = 100

export const NEW_SPAWN_DELAY = {
  MIN: 20000,
  MAX: 40000,
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

export const EARN_CREDITS = {
  MIN: 2,
  MAX: 5,
} as const

export const PER_ITEM_COSTS = {
  pokeballs: 0.5,
  greatballs: 0.8,
  ultraballs: 0.9,
  razzBerry: 0.4,
  pinapBerry: 0.5,
  goldenRazzBerry: 0.8,
} as const

export const RANKING_TYPES = {
  MOST_CAUGHT_POKEMON: 'most-caught-pokemon',
  MOST_XP: 'most-xp',
} as const

export const MOVE_TYPES = {
  DAMAGE: 'damage',
  STATUS: 'status',
} as const

export const BATTLE_STATUS = {
  WAITING: 'waiting',
  STARTING: 'starting',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const

export const BATTLE_ENDING_REASONS = {
  TIMEOUT: 'timeout',
  SURRENDER: 'surrender',
  DISCONNECT: 'disconnect',
  ALL_POKEMON_FAINTED: 'all-pokemon-fainted',
} as const

export const RANKS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
  ELITE: 'elite',
} as const

export const RANKING_ORDER_ASC = {
  bronze: 'silver',
  silver: 'gold',
  gold: 'platinum',
  platinum: 'diamond',
  diamond: 'elite',
} as const

export const RANKING_ORDER_DESC = {
  elite: 'diamond',
  diamond: 'platinum',
  platinum: 'gold',
  gold: 'silver',
  silver: 'bronze',
} as const

export const POINTS_TO_RANK_UP = {
  BRONZE: 0,
  SILVER: 100,
  GOLD: 400,
  PLATINUM: 800,
  DIAMOND: 1400,
  ELITE: 2000,
} as const

export const POINTS = {
  timeout: 10,
  disconnect: 5,
  surrender: 15,
  'all-pokemon-fainted': 20,
} as const

export const STAGE_MODIFIERS = {
  0: 1,
  1: 1.5,
  2: 2,
  3: 2.5,
  4: 3,
} as const

export const NEG_STAGE_MODIFIERS = {
  0: 1,
  1: 0.66,
  2: 0.5,
  3: 0.4,
  4: 0.33,
} as const

export const STATUS_CONDITIONS = {
  PARALYZE: 'paralyze',
  POISON: 'poison',
  BURN: 'burn',
  FREEZE: 'freeze',
  SLEEP: 'sleep',
} as const

export const STATUS_CONDITION_PAST = {
  paralyze: 'paralyzed',
  poison: 'poisoned',
  burn: 'burned',
  freeze: 'frozen',
  sleep: 'asleep',
} as const

export const TYPE_CHART = {
  normal: {},
  fire: {
    grass: 'super-effective',
    ice: 'super-effective',
    bug: 'super-effective',
    steel: 'super-effective',
    rock: 'not-very-effective',
    dragon: 'not-very-effective',
    fire: 'not-very-effective',
    water: 'not-very-effective',
    ground: 'not-very-effective',
  },
  water: {
    fire: 'super-effective',
    ground: 'super-effective',
    rock: 'super-effective',
    water: 'not-very-effective',
    grass: 'not-very-effective',
    dragon: 'not-very-effective',
    electric: 'not-very-effective',
  },
  grass: {
    water: 'super-effective',
    ground: 'super-effective',
    rock: 'super-effective',
    grass: 'not-very-effective',
    fire: 'not-very-effective',
    bug: 'not-very-effective',
    dragon: 'not-very-effective',
    flying: 'not-very-effective',
    poison: 'not-very-effective',
    steel: 'not-very-effective',
  },
  electric: {
    water: 'super-effective',
    flying: 'super-effective',
    electric: 'not-very-effective',
    ground: 'not-very-effective',
  },
  ice: {
    grass: 'super-effective',
    ground: 'super-effective',
    flying: 'super-effective',
    dragon: 'super-effective',
    fire: 'not-very-effective',
    water: 'not-very-effective',
    ice: 'not-very-effective',
    steel: 'not-very-effective',
  },
  fighting: {
    normal: 'super-effective',
    ice: 'super-effective',
    rock: 'super-effective',
    dark: 'super-effective',
    steel: 'not-very-effective',
    flying: 'not-very-effective',
    poison: 'not-very-effective',
    psychic: 'not-very-effective',
    fairy: 'not-very-effective',
  },
  poison: {
    grass: 'super-effective',
    fairy: 'super-effective',
    poison: 'not-very-effective',
    ground: 'not-very-effective',
    rock: 'not-very-effective',
    ghost: 'not-very-effective',
  },
  ground: {
    fire: 'super-effective',
    electric: 'super-effective',
    poison: 'super-effective',
    rock: 'super-effective',
    steel: 'super-effective',
    flying: 'not-very-effective',
    bug: 'not-very-effective',
    grass: 'not-very-effective',
  },
  flying: {
    grass: 'super-effective',
    fighting: 'super-effective',
    bug: 'super-effective',
    flying: 'not-very-effective',
    electric: 'not-very-effective',
    rock: 'not-very-effective',
  },
  psychic: {
    fighting: 'super-effective',
    poison: 'super-effective',
    psychic: 'not-very-effective',
    dark: 'not-very-effective',
    steel: 'not-very-effective',
  },
  bug: {
    grass: 'super-effective',
    psychic: 'super-effective',
    dark: 'super-effective',
    fire: 'not-very-effective',
    fighting: 'not-very-effective',
    flying: 'not-very-effective',
    poison: 'not-very-effective',
    ghost: 'not-very-effective',
    steel: 'not-very-effective',
    fairy: 'not-very-effective',
  },
  rock: {
    fire: 'super-effective',
    ice: 'super-effective',
    flying: 'super-effective',
    bug: 'super-effective',
    fighting: 'not-very-effective',
    ground: 'not-very-effective',
    steel: 'not-very-effective',
  },
  ghost: {
    psychic: 'super-effective',
    ghost: 'super-effective',
    dark: 'not-very-effective',
    normal: 'not-very-effective',
  },
  dragon: {
    dragon: 'super-effective',
    steel: 'not-very-effective',
    fairy: 'not-very-effective',
  },
  dark: {
    psychic: 'super-effective',
    ghost: 'super-effective',
    fighting: 'not-very-effective',
    dark: 'not-very-effective',
    fairy: 'not-very-effective',
  },
  steel: {
    ice: 'super-effective',
    rock: 'super-effective',
    fairy: 'super-effective',
    steel: 'not-very-effective',
    fire: 'not-very-effective',
    water: 'not-very-effective',
    electric: 'not-very-effective',
  },
  fairy: {
    fighting: 'super-effective',
    dragon: 'super-effective',
    dark: 'super-effective',
    poison: 'not-very-effective',
    steel: 'not-very-effective',
    fire: 'not-very-effective',
  },
} as const

export const EFFECTIVENESS_MODIFIERS = {
  'super-effective': 1.5,
  'not-very-effective': 0.5,
  nuetral: 1,
} as const

export const CRITICAL_HIT_CHANCE = 0.1

export const STATUS_DAMANGE = {
  burn: 5,
  poison: 10,
} as const

export const STAT_NAMES = ['attack', 'defense', 'speed'] as const
