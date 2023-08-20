import { BadRequestException } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { ArrayMinSize, IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class TransferPokemonDto {
  @IsNotEmpty()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  pokemon: Types.ObjectId[]
}
