import { Injectable } from '@nestjs/common'
import { Model, Connection } from 'mongoose'
import { BasePokemon, BasePokemonDocument } from '../models'
import { AbstractRepository } from './abstract.repository'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'

@Injectable()
export class BasePokemonRepository extends AbstractRepository<BasePokemonDocument, BasePokemon> {
  constructor(@InjectModel(BasePokemon.name) BasePokemonModel: Model<BasePokemonDocument>, @InjectConnection() connection: Connection) {
    super(BasePokemonModel, connection)
  }
}
