import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator'
import { Types } from 'mongoose'

export class TradePokemonDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  userId: Types.ObjectId

  @IsOptional()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  pokemonId: Types.ObjectId

  @IsOptional()
  @IsNumberString()
  code: `${number}`
}
