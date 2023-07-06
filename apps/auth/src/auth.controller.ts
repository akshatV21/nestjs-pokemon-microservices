import { Body, Controller, Get, Post, UseGuards, UsePipes } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dtos/register.dto'
import { EVENTS, HttpSuccessResponse } from '@utils/utils'
import { LoginDto } from './dtos/login.dto'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { Authorize } from './guards/authorize.guard'
import { Auth, AuthorizeDto } from '@lib/common'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Auth({ isOpen: true })
  async httpRegisterUser(@Body() registerDto: RegisterDto): Promise<HttpSuccessResponse> {
    const user = await this.authService.register(registerDto)
    return { success: true, message: 'User registered successfully.', data: { user } }
  }

  @Post('login')
  @Auth({ isOpen: true })
  async httpLoginUser(@Body() loginDto: LoginDto): Promise<HttpSuccessResponse> {
    const result = await this.authService.login(loginDto)
    return { success: true, message: 'User logged in successfully.', data: result }
  }

  @MessagePattern(EVENTS.AUTHORIZE)
  @UseGuards(Authorize)
  authorize(@Payload() payload: AuthorizeDto) {
    return { user: payload.user }
  }
}
