import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'

export type EvolutionLineDocument = EvolutionLine & Document

@Schema({ _id: false })
class EvolutionStage {
  @Prop({ ref: 'BasePokemon' })
  pokemon?: Types.ObjectId[]

  @Prop({ min: 0, max: 40 })
  evolvesAtLevel?: number
}

@Schema({ _id: false })
class EvolutionStages {
  @Prop()
  stageZero?: EvolutionStage

  @Prop()
  stageOne?: EvolutionStage

  @Prop()
  stageTwo?: EvolutionStage

  @Prop()
  stageThree?: EvolutionStage
}

@Schema({ timestamps: true })
export class EvolutionLine {
  @Prop({ required: true })
  pokemon: Types.ObjectId

  @Prop({ required: true })
  stages: EvolutionStages
}

export const EvolutionLineSchema = SchemaFactory.createForClass(EvolutionLine)
