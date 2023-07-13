import { Injectable } from '@nestjs/common'
import { Model, Connection } from 'mongoose'
import { Spawn, SpawnDocument } from '../models'
import { AbstractRepository } from './abstract.repository'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'

@Injectable()
export class SpawnRepository extends AbstractRepository<SpawnDocument, Spawn> {
  constructor(@InjectModel(Spawn.name) SpawnModel: Model<SpawnDocument>, @InjectConnection() connection: Connection) {
    super(SpawnModel, connection)
  }
}
