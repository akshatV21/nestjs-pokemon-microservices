import { ContextType } from '@nestjs/common'
import { REQUEST_TYPES } from '@utils/utils'
import { IsEnum, IsJWT, IsNotEmpty } from 'class-validator'

export class AuthorizeDto {
  @IsNotEmpty()
  @IsJWT()
  token: string

  @IsNotEmpty()
  @IsEnum(REQUEST_TYPES)
  requestType: ContextType

  user?: any
}
