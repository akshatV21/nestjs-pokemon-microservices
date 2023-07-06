import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { Authorize, DatabaseModule, RmqModule, User, UserRepository, UserSchema } from '@lib/common'
import { APP_GUARD } from '@nestjs/core'
import { SERVICES } from '@utils/utils'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        RMQ_URL: Joi.string().required(),
        RMQ_AUTH_QUEUE: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RmqModule.register([SERVICES.AUTH_SERVICE]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, { provide: APP_GUARD, useClass: Authorize }],
})
export class AuthModule {}
