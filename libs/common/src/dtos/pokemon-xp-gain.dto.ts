import { BadRequestException } from '@nestjs/common'
import { Transform, Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator'
import { Types } from 'mongoose'

export class PokemonXpGainDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  user: Types.ObjectId

  @IsNotEmpty()
  @Transform(({ key, value }) =>
    value.map((stringId: string) => {
      if (!Types.ObjectId.isValid(stringId)) throw new BadRequestException(`${key} should contain valid object id.`)
      return new Types.ObjectId(stringId)
    }),
  )
  pokemon: Types.ObjectId[]

  @IsNotEmpty()
  @IsNumber()
  xp: number
}
