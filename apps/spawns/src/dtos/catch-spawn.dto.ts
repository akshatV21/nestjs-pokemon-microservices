import { BALLS, BERRIES, Ball, Berry } from '@utils/utils'
import { Type } from 'class-transformer'
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'
import { Types } from 'mongoose'

export class CatchSpawnDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  spawn: Types.ObjectId

  @IsNotEmpty()
  @IsEnum(BALLS)
  ball: Ball

  @IsOptional()
  @IsEnum(BERRIES)
  berry: Berry
}
