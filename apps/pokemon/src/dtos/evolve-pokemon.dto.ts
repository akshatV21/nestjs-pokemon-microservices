import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class EvolvePokemonDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  caughtPokemonId: Types.ObjectId

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  basePokemonId: Types.ObjectId
}
