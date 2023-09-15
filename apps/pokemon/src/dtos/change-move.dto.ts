import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsNumberString } from 'class-validator'
import { Types } from 'mongoose'

export class ChangeMoveDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  caughtPokemonId: Types.ObjectId

  @IsNotEmpty()
  @IsNumberString()
  currentMoveId: string

  @IsNotEmpty()
  @IsNumberString()
  newMoveId: string
}
