import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'
import { PokemonTyping } from '@utils/utils'

export type BasePokemonDocument = BasePokemon & Document

@Schema({ _id: false })
class PokemonStageSchema {
  @Prop({ required: true, min: 0, max: 3 })
  current: number

  @Prop({ default: null, ref: 'BasePokemon' })
  next: Types.ObjectId
}

@Schema({ _id: false })
class PokemonStatsSchema {
  @Prop({ required: true, min: 10, max: 100 })
  attack: number

  @Prop({ required: true, min: 10, max: 100 })
  defence: number

  @Prop({ required: true, min: 10, max: 100 })
  hp: number

  @Prop({ required: true, min: 10, max: 100 })
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
  img: string

  @Prop({ required: true, min: 1, max: 9 })
  generation: number

  @Prop({ required: true })
  stage: PokemonStageSchema

  @Prop({ required: true })
  stats: PokemonStatsSchema
}

export const BasePokemonSchema = SchemaFactory.createForClass(BasePokemon)
