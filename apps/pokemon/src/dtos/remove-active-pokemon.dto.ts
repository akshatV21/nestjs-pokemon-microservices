import { BadRequestException } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { ArrayMinSize, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class RemoveActivePokemonDto {
  @IsNotEmpty()
  @ArrayMinSize(1)
  @Transform(({ key, value }) =>
    value.map((stringId: string) => {
      if (!Types.ObjectId.isValid(stringId)) throw new BadRequestException(`${key} should contain valid object id.`)
      return new Types.ObjectId(stringId)
    }),
  )
  pokemon: Types.ObjectId[]
}
