import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { DEFAULT_VALUES } from '@utils/utils'
import { hashSync } from 'bcrypt'
import { Types, Document } from 'mongoose'

export type UserDocument = User & Document

@Schema({ _id: false })
class PokemonCaughtSchema {
  @Prop({ default: [], ref: 'Pokemon' })
  inStorage?: Types.ObjectId[]

  @Prop({ default: [], ref: 'Pokemon' })
  transferred?: Types.ObjectId[]
}

@Schema({ _id: false })
class PokemonSchema {
  @Prop({ default: new PokemonCaughtSchema() })
  caught?: PokemonCaughtSchema

  @Prop({ default: DEFAULT_VALUES.POKEMON_STORAGE_LIMIT })
  storageLimit?: number
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  password: string

  @Prop({ default: new PokemonSchema() })
  pokemon?: PokemonSchema
}

const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()

  this.password = hashSync(this.password, 4)
  return next()
})

export { UserSchema }
