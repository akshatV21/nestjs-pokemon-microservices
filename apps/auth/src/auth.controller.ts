import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dtos/register.dto'
import { HttpSuccessResponse } from '@utils/utils'
import { LoginDto } from './dtos/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async httpRegisterUser(@Body() registerDto: RegisterDto): Promise<HttpSuccessResponse> {
    const user = await this.authService.register(registerDto)
    return { success: true, message: 'User registered successfully.', data: { user } }
  }

  @Post('login')
  async httpLoginUser(@Body() loginDto: LoginDto): Promise<HttpSuccessResponse> {
    const result = await this.authService.login(loginDto)
    return { success: true, message: 'User logged in successfully.', data: result }
  }
}
