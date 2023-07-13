import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'

export type SpawnDocument = Spawn & Document

@Schema({ _id: false })
class SpawnLocationSchema {
  @Prop({ required: true })
  city: string

  @Prop({ required: true })
  block: string
}

@Schema({ timestamps: true })
export class Spawn {
  @Prop({ required: true, ref: 'BasePokemon' })
  pokemon: Types.ObjectId

  @Prop({ required: true })
  level: number

  @Prop({ required: true })
  location: SpawnLocationSchema

  @Prop({ required: true })
  despawnsAt: Date
}

export const SpawnSchema = SchemaFactory.createForClass(Spawn)
