import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'

export type UserDocument = User & Document

@Schema()
class PokemonCaughtSchema {
  @Prop({ default: [], ref: 'Pokemon' })
  inStorage: Types.ObjectId[]

  @Prop({ default: [], ref: 'Pokemon' })
  transferred: Types.ObjectId[]
}

@Schema()
class PokemonSchema {
  @Prop({ default: new PokemonCaughtSchema() })
  caught: PokemonCaughtSchema

  @Prop({ default: 100 })
  storageLimit: number
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  password: string

  @Prop({ default: new PokemonSchema() })
  pokemon: PokemonSchema
}

const UserSchema = SchemaFactory.createForClass(User)

export { UserSchema }
