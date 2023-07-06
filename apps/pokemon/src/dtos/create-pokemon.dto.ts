import { DEFAULT_VALUES, POKEMON_TYPINGS, PokemonTyping } from '@utils/utils'
import { Types } from 'mongoose'
import { Type } from 'class-transformer'
import {
  IsDefined,
  IsEnum,
  IsJWT,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'

class ImgDto {
  @IsNotEmpty()
  @IsString()
  default: string

  @IsOptional()
  @IsString()
  shiny: string
}

class StageDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(3)
  current: number

  @IsOptional()
  @IsString()
  previous: Types.ObjectId
}

class StatsDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(DEFAULT_VALUES.MIN_BASE_STAT)
  @Max(DEFAULT_VALUES.MAX_BASE_STAT)
  attack: number

  @IsNotEmpty()
  @IsNumber()
  @Min(DEFAULT_VALUES.MIN_BASE_STAT)
  @Max(DEFAULT_VALUES.MAX_BASE_STAT)
  defence: number

  @IsNotEmpty()
  @IsNumber()
  @Min(DEFAULT_VALUES.MIN_BASE_STAT)
  @Max(DEFAULT_VALUES.MAX_BASE_STAT)
  hp: number

  @IsNotEmpty()
  @IsNumber()
  @Min(DEFAULT_VALUES.MIN_BASE_STAT)
  @Max(DEFAULT_VALUES.MAX_BASE_STAT)
  speed: number
}

export class CreatePokemonDto {
  @IsNotEmpty()
  @IsNumber()
  pokedexNo: number

  @IsNotEmpty()
  @IsString()
  species: string

  @IsNotEmpty()
  @IsString()
  description: string

  @IsNotEmpty()
  @IsEnum(POKEMON_TYPINGS, { each: true })
  typings: PokemonTyping[]

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(8)
  generation: number

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ImgDto)
  img: ImgDto

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => StageDto)
  stage: StageDto

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => StatsDto)
  stats: StatsDto
}
