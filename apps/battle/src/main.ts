import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import * as morgan from 'morgan'
import { BattleModule } from './battle.module'
import { RmqService } from '@lib/common'
import { ConfigService } from '@nestjs/config'
import { SERVICES } from '@utils/utils'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(BattleModule)

  const rmqService = app.get<RmqService>(RmqService)
  const configService = app.get<ConfigService>(ConfigService)

  const PORT = configService.get('PORT')

  app.connectMicroservice(rmqService.getOptions(SERVICES.BATTLE_SERVICE))
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))

  app.use(helmet())
  app.use(morgan('dev'))

  await app.startAllMicroservices()
  await app.listen(PORT, () => console.log(`Battle service is listening to requests on port: ${PORT}`))
}
bootstrap()
