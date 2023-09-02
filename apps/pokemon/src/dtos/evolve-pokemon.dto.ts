import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class EvolvePokemonDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  pokemon: Types.ObjectId
}
