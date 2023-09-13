import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { RankingType } from '@utils/utils'
import { Document, Types } from 'mongoose'

export type RankingDocument = Ranking & Document

@Schema({ _id: false })
export class UserRanking {
  @Prop({ required: true })
  _id: Types.ObjectId

  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  amount: number
}

@Schema()
export class Ranking {
  @Prop({ required: true })
  type: RankingType

  @Prop({ required: true })
  users: UserRanking[]
}

export const RankingSchema = SchemaFactory.createForClass(Ranking)
