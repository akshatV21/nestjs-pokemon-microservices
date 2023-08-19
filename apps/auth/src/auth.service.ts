import { UserDocument, UserRepository } from '@lib/common'
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { RegisterDto } from './dtos/register.dto'
import { LoginDto } from './dtos/login.dto'
import { compareSync } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(private readonly UserRepository: UserRepository, private readonly configService: ConfigService) {}

  async register(registerDto: RegisterDto) {
    const isUsernameAlreadyInUse = await this.UserRepository.exists({ username: registerDto.username })
    if (isUsernameAlreadyInUse) throw new BadRequestException('Username is already in use.')

    const user = (await this.UserRepository.create(registerDto)).toObject<UserDocument>()
    const { password, ...rest } = user

    return rest
  }

  async login(loginDto: LoginDto) {
    const registeredUser = await this.UserRepository.findOne(
      { username: loginDto.username },
      { pokemon: 0, inventory: 0 },
      { lean: true },
    )
    if (!registeredUser) throw new BadRequestException('No registered user with provided username.')
    
    const passwordMatches = compareSync(loginDto.password, registeredUser.password)
    if (!passwordMatches) throw new UnauthorizedException('Invalid password provided.')

    const token = sign({ id: registeredUser._id }, this.configService.get('JWT_SECRET'), { expiresIn: '24h' })
    const { password, ...rest } = registeredUser

    return { user: rest, token }
  }
}
