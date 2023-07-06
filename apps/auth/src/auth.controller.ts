import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dtos/register.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async httpLoginUser(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto)
    return { success: true, message: 'User registered successfully.', data: { user } }
  }
}
