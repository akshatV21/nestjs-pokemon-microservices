import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'
import { BasePokemonDocument, PokemonStatsSchema } from './base-pokemon.model'
import { SpawnLocationSchema } from './spawn.model'

export type CaughtPokemonDocument = CaughtPokemon & Document

@Schema()
export class CaughtPokemon {
  @Prop({ required: true, ref: 'User' })
  user: Types.ObjectId

  @Prop({ default: null })
  nickname?: string

  @Prop({ required: true, ref: 'BasePokemon', type: Types.ObjectId })
  pokemon: Types.ObjectId | BasePokemonDocument

  @Prop({ required: true })
  level: number

  @Prop({ required: true })
  location: SpawnLocationSchema

  @Prop({ required: true })
  isShiny: boolean

  @Prop({ required: true })
  xp: number

  @Prop({ required: true })
  stats: PokemonStatsSchema

  @Prop({ required: true })
  moveset: string[] // contains move ids
}

export const CaughtPokemonSchema = SchemaFactory.createForClass(CaughtPokemon)
