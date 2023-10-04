import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { isEnum } from 'class-validator'
import { BATTLE_STATUS } from '../constants'

@Injectable()
export class ParseBattleStatus implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const isValid = isEnum(value, BATTLE_STATUS)
    if (!isValid) throw new BadRequestException(`Invalid battle status: ${value}`)
    return value
  }
}
