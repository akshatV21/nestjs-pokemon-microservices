import { BasePokemonDocument, BasePokemonRepository } from '@lib/common'
import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { CreatePokemonDto } from './dtos/create-pokemon.dto'

@Injectable()
export class PokemonService {
  constructor(private readonly BasePokemonRepository: BasePokemonRepository) {}

  async create(createPokemonDto: CreatePokemonDto) {
    const pokemon = await this.BasePokemonRepository.create(createPokemonDto)
    return pokemon
  }

  async list() {
    return this.BasePokemonRepository.find({})
  }
}
