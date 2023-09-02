import { IsNegative, IsOptional } from "class-validator";

export class DiscardItemsDto {
  @IsOptional()
  @IsNegative()
  pokeballs: number

  @IsOptional()
  @IsNegative()
  greatballs: number

  @IsOptional()
  @IsNegative()
  ultraballs: number

  @IsOptional()
  @IsNegative()
  razzBerry: number

  @IsOptional()
  @IsNegative()
  pinapBerry: number

  @IsOptional()
  @IsNegative()
  goldenRazzBerry: number
}