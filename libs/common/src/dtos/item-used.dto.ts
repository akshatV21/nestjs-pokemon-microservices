import { BALLS, BERRIES, Ball, Berry } from '@utils/utils'
import { Type } from 'class-transformer'
import { IsIn, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'
import { Types } from 'mongoose'

export class ItemUsedDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  user: Types.ObjectId

  @IsOptional()
  @IsIn(BALLS)
  ball?: Ball

  @IsOptional()
  @IsIn(BERRIES)
  berry?: Berry
}
