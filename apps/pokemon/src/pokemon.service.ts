import { BasePokemonDocument, BasePokemonRepository } from '@lib/common'
import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { CreatePokemonDto } from './dtos/create-pokemon.dto'

@Injectable()
export class PokemonService {
  constructor(private readonly BasePokemonRepository: BasePokemonRepository) {}

  async create(createPokemonDto: CreatePokemonDto) {
    const promises: Promise<BasePokemonDocument>[] = []
    const hasPreEvolution = createPokemonDto.stage.previous

    const pokemonObjectId = new Types.ObjectId()

    const createPokemonPromise = this.BasePokemonRepository.create(createPokemonDto, pokemonObjectId)
    promises.push(createPokemonPromise)

    if (hasPreEvolution) {
      const updatePreEvoPokemonPromise = this.BasePokemonRepository.update(createPokemonDto.stage.previous, {
        $set: { 'stage.next': pokemonObjectId },
      })
      promises.push(updatePreEvoPokemonPromise)
    }

    const [pokemon] = await Promise.all(promises)
    return pokemon
  }

  async list() {
    return this.BasePokemonRepository.find({})
  }
}
