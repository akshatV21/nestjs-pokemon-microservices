import { EVOLUTION_STAGES, POKEMON_TYPINGS, SERVICES } from '../constants'

type ObjectValuesUnion<T extends Record<string, string>> = T extends Record<string, infer U> ? U : never

export type Service = ObjectValuesUnion<typeof SERVICES>

export type PokemonTyping = ObjectValuesUnion<typeof POKEMON_TYPINGS>

export type EvolutionStage = ObjectValuesUnion<typeof EVOLUTION_STAGES>
