import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { DEFAULT_VALUES, RANKS, Rank } from '@utils/utils'
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

  @Prop({ default: [], ref: 'Pokemon' })
  active?: Types.ObjectId[]

  @Prop({ default: DEFAULT_VALUES.POKEMON_STORAGE_LIMIT })
  storageLimit?: number
}

@Schema({ _id: false })
class ItemSchema {
  @Prop({ default: 0 })
  pokeballs: number

  @Prop({ default: 0 })
  greatballs: number

  @Prop({ default: 0 })
  ultraballs: number

  @Prop({ default: 0 })
  razzBerry: number

  @Prop({ default: 0 })
  pinapBerry: number

  @Prop({ default: 0 })
  goldenRazzBerry: number
}

@Schema({ _id: false })
class InventorySchema {
  @Prop({ default: new ItemSchema() })
  items?: ItemSchema

  @Prop({ default: DEFAULT_VALUES.INVENTORY_STORAGE_LIMIT })
  storageLimit: number
}

@Schema({ _id: false })
class BattleStatsSchema {
  @Prop({ default: 0 })
  played: number

  @Prop({ default: 0 })
  won: number

  @Prop({ default: 0 })
  lost: number

  @Prop({ default: 0 })
  draw: number
}

@Schema({ _id: false })
class BattleSchema {
  @Prop({ default: 0 })
  points: number

  @Prop({ default: RANKS.BRONZE })
  rank: Rank

  @Prop({ default: new BattleStatsSchema() })
  stats: BattleStatsSchema
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  password: string

  @Prop({ default: new PokemonSchema() })
  pokemon?: PokemonSchema

  @Prop({ default: 0 })
  credits?: number

  @Prop({ default: new InventorySchema() })
  inventory?: InventorySchema

  @Prop({ default: new BattleSchema() })
  battle?: BattleSchema
}

const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()

  this.password = hashSync(this.password, 4)
  return next()
})

export { UserSchema }
