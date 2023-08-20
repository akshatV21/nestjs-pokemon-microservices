import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'
import { Types } from 'mongoose'

export class UpdateNicknameDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  pokemon: Types.ObjectId

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(14)
  nickname: string
}
