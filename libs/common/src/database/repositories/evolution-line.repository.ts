import { Injectable } from '@nestjs/common'
import { Model, Connection } from 'mongoose'
import { EvolutionLine, EvolutionLineDocument } from '../models'
import { AbstractRepository } from './abstract.repository'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'

@Injectable()
export class EvolutionLineRepository extends AbstractRepository<EvolutionLineDocument, EvolutionLine> {
  constructor(@InjectModel(EvolutionLine.name) EvolutionLineModel: Model<EvolutionLineDocument>, @InjectConnection() connection: Connection) {
    super(EvolutionLineModel, connection)
  }
}
