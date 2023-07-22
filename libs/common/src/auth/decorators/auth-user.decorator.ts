import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export const AuthUser = createParamDecorator((input: any, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user
})
