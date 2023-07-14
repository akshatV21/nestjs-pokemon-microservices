import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Block, City } from '@utils/utils'
import { Types, Document } from 'mongoose'
import { BasePokemonDocument } from './base-pokemon.model'

export type SpawnDocument = Spawn & Document

@Schema({ _id: false })
class SpawnLocationSchema {
  @Prop({ required: true, type: String })
  city: City

  @Prop({ required: true, type: String })
  block: Block
}

@Schema({ timestamps: true })
export class Spawn {
  @Prop({ required: true, ref: 'BasePokemon', type: Types.ObjectId })
  pokemon: Types.ObjectId | BasePokemonDocument

  @Prop({ required: true })
  level: number

  @Prop({ required: true })
  location: SpawnLocationSchema

  @Prop({ required: true })
  despawnsAt: Date
}

export const SpawnSchema = SchemaFactory.createForClass(Spawn)
