import { NestFactory } from '@nestjs/core'
import { PokemonModule } from './pokemon.module'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import * as morgan from 'morgan'
import { RmqService } from '@lib/common'
import { SERVICES } from '@utils/utils'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(PokemonModule)

  const rmqService = app.get<RmqService>(RmqService)
  const configService = app.get<ConfigService>(ConfigService)

  const PORT = configService.get('PORT')

  app.connectMicroservice(rmqService.getOptions(SERVICES.POKEMON_SERVICE))
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))

  app.use(helmet())
  app.use(morgan('dev'))

  await app.startAllMicroservices()
  await app.listen(PORT, () => console.log(`Pokemon service is listening to requests on port: ${PORT}`))
}
bootstrap()
