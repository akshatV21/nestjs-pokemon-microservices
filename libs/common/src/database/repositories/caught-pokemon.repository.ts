import { Injectable } from '@nestjs/common'
import { Model, Connection } from 'mongoose'
import { CaughtPokemon, CaughtPokemonDocument } from '../models'
import { AbstractRepository } from './abstract.repository'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'

@Injectable()
export class CaughtPokemonRepository extends AbstractRepository<CaughtPokemonDocument, CaughtPokemon> {
  constructor(
    @InjectModel(CaughtPokemon.name) CaughtPokemonModel: Model<CaughtPokemonDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(CaughtPokemonModel, connection)
  }
}
