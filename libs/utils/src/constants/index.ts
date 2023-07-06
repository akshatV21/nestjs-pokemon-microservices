import { ContextType } from '@nestjs/common'

export const DEFAULT_VALUES = {
  POKEMON_STORAGE_LIMIT: 100,
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
