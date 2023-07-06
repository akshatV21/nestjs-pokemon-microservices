import { UserRepository } from '@lib/common'
import { BadRequestException, Injectable } from '@nestjs/common'
import { RegisterDto } from './dtos/register.dto'

@Injectable()
export class AuthService {
  constructor(private readonly UserRepository: UserRepository) {}

  async register(registerDto: RegisterDto) {
    const isUsernameAlreadyInUse = await this.UserRepository.exists({ username: registerDto.username })
    if (isUsernameAlreadyInUse) throw new BadRequestException('Username is already in use.')

    const user = await this.UserRepository.create(registerDto)
    return user
  }
}
