import { Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'
import { Ranking, RankingDocument } from '../models'
import { AbstractRepository } from './abstract.repository'

@Injectable()
export class RankingRepository extends AbstractRepository<RankingDocument, Ranking> {
  constructor(@InjectModel(Ranking.name) RankingModel: Model<RankingDocument>, @InjectConnection() connection: Connection) {
    super(RankingModel, connection)
  }
}
