import { NestFactory } from '@nestjs/core'
import { AuthModule } from './auth.module'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import * as morgan from 'morgan'
import { ValidationPipe } from '@nestjs/common'
import { RmqService } from '@lib/common'
import { SERVICES } from '@utils/utils'

async function bootstrap() {
  const app = await NestFactory.create(AuthModule)

  const rmqService = app.get<RmqService>(RmqService)
  const configService = app.get<ConfigService>(ConfigService)

  const PORT = configService.get('PORT')

  app.connectMicroservice(rmqService.getOptions(SERVICES.AUTH_SERVICE))
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  app.use(helmet())
  app.use(morgan('dev'))

  await app.startAllMicroservices()
  await app.listen(PORT, () => console.log(`Auth service is listening to requests on port: ${PORT}`))
}
bootstrap()
