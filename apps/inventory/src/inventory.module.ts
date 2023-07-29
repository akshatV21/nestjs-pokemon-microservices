import { Module } from '@nestjs/common'
import { InventoryController } from './inventory.controller'
import { InventoryService } from './inventory.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { Authorize, DatabaseModule, RmqModule, User, UserRepository, UserSchema } from '@lib/common'
import { SERVICES } from '@utils/utils'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGO_URI: Joi.string().required(),
        RMQ_URL: Joi.string().required(),
        RMQ_AUTH_QUEUE: Joi.string().required(),
        RMQ_INVENTORY_QUEUE: Joi.string().required(),
        RMQ_SPAWNS_QUEUE: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RmqModule.register([SERVICES.AUTH_SERVICE, SERVICES.INVENTORY_SERVICE]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, UserRepository, { provide: APP_GUARD, useClass: Authorize }],
})
export class InventoryModule {}
