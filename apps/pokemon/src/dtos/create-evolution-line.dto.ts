import { EVOLUTION_STAGES, EvolutionStage, IsObjectId } from '@utils/utils'
import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsJWT,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { Types } from 'mongoose'

export class EvolutionStageDto {
  @IsNotEmpty()
  @IsEnum(EVOLUTION_STAGES, {
    message: `stage must be one of the following values: ${Object.values(EVOLUTION_STAGES).join(', ')}`,
  })
  stage: EvolutionStage

  @IsNotEmpty()
  @IsObjectId()
  @ArrayMinSize(1)
  @Transform(({ value }) => {
    console.log('transformation')
    return value.map((stringId: string) => new Types.ObjectId(stringId))
  })
  pokemon: Types.ObjectId[]

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(40)
  evolvesAtLevel: number
}

export class CreateEvolutionLineDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested()
  @Type(() => EvolutionStageDto)
  stages: EvolutionStageDto[]
}
