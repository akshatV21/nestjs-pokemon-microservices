import { Injectable } from '@nestjs/common'
import { Model, Connection } from 'mongoose'
import { User, UserDocument } from '../models'
import { AbstractRepository } from './abstract.repository'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument, User> {
  constructor(@InjectModel(User.name) UserModel: Model<UserDocument>, @InjectConnection() connection: Connection) {
    super(UserModel, connection)
  }
}
