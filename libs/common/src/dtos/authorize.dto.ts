import { ContextType } from '@nestjs/common'
import { REQUEST_TYPES } from '@utils/utils'
import { IsBoolean, IsEnum, IsJWT, IsNotEmpty } from 'class-validator'

export class AuthorizeDto {
  @IsNotEmpty()
  @IsJWT()
  token: string

  @IsNotEmpty()
  @IsEnum(REQUEST_TYPES)
  requestType: ContextType

  @IsNotEmpty()
  @IsBoolean()
  cached: boolean

  user?: any
}
