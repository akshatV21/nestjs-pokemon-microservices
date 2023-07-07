import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'
import { DEFAULT_VALUES, PokemonTyping } from '@utils/utils'

export type BasePokemonDocument = BasePokemon & Document

@Schema({ _id: false })
class ImgSchema {
  @Prop({ required: true })
  default: string

  @Prop({ required: true })
  shiny: string
}

@Schema({ _id: false })
class EvolutionSchema {
  @Prop({ required: true })
  currentStage: number

  @Prop({ default: null, ref: 'EvolutionLine' })
  line?: Types.ObjectId
}

@Schema({ _id: false })
class PokemonStatsSchema {
  @Prop({ required: true, min: DEFAULT_VALUES.MIN_BASE_STAT, max: DEFAULT_VALUES.MAX_BASE_STAT })
  attack: number

  @Prop({ required: true, min: DEFAULT_VALUES.MIN_BASE_STAT, max: DEFAULT_VALUES.MAX_BASE_STAT })
  defence: number

  @Prop({ required: true, min: DEFAULT_VALUES.MIN_BASE_STAT, max: DEFAULT_VALUES.MAX_BASE_STAT })
  hp: number

  @Prop({ required: true, min: DEFAULT_VALUES.MIN_BASE_STAT, max: DEFAULT_VALUES.MAX_BASE_STAT })
  speed: number
}

@Schema({ timestamps: true })
export class BasePokemon {
  @Prop({ required: true })
  pokedexNo: number

  @Prop({ required: true })
  species: string

  @Prop({ required: true })
  description: string

  @Prop({ required: true })
  typings: PokemonTyping[]

  @Prop({ required: true })
  img: ImgSchema

  @Prop({ required: true, min: 1, max: 9 })
  generation: number

  @Prop({ required: true, ref: 'EvolutionLine' })
  evolution: EvolutionSchema

  @Prop({ required: true })
  stats: PokemonStatsSchema
}

export const BasePokemonSchema = SchemaFactory.createForClass(BasePokemon)
