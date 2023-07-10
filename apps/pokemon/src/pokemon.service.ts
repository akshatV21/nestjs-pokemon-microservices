import { BasePokemonDocument, BasePokemonRepository, EvolutionLine, EvolutionLineDocument, EvolutionLineRepository } from '@lib/common'
import { Inject, Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { CreatePokemonDto } from './dtos/create-pokemon.dto'
import { CreateEvolutionLineDto } from './dtos/create-evolution-line.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { CACHE_KEYS } from '@utils/utils'

@Injectable()
export class PokemonService {
  constructor(
    private readonly BasePokemonRepository: BasePokemonRepository,
    private readonly EvolutionLineRepository: EvolutionLineRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    const pokemon = await this.BasePokemonRepository.create(createPokemonDto)
    return pokemon
  }

  async list() {
    return this.BasePokemonRepository.find({})
  }

  async getBasePokemon(basePokemonId: Types.ObjectId) {
    const cachedPokemon = await this.cacheManager.get<BasePokemonDocument | null>(`${CACHE_KEYS.BASE_POKEMON}-${basePokemonId}`)
    if (cachedPokemon) return cachedPokemon

    const pokemon = await this.BasePokemonRepository.findById(basePokemonId)
    if (pokemon) await this.cacheManager.set(`${CACHE_KEYS.BASE_POKEMON}-${basePokemonId}`, pokemon)

    return pokemon
  }

  async createEvolutionLine({ stages }: CreateEvolutionLineDto) {
    const body: EvolutionLine = {
      pokemon: stages.reduce((prev, curr) => [...prev, ...curr.pokemon], []),
      stages: stages.reduce((prev, curr) => {
        prev[`${curr.stage}`] = { pokemon: curr.pokemon, evolvesAtLevel: curr.evolvesAtLevel }
        return prev
      }, {}),
    }

    const evolutionLineObjectId = new Types.ObjectId()
    const session = await this.EvolutionLineRepository.startTransaction()

    try {
      const createEvolutionLinePromise = this.EvolutionLineRepository.create(body, evolutionLineObjectId)
      const updateBasePokemonPromise = this.BasePokemonRepository.updateMany(
        { _id: { $in: body.pokemon } },
        { $set: { 'evolution.line': evolutionLineObjectId } },
      )

      const [evolutionLine] = await Promise.all([createEvolutionLinePromise, updateBasePokemonPromise])
      await session.commitTransaction()

      return evolutionLine
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async getPokemonEvolutionLine(basePokemonId: Types.ObjectId) {
    const cachedEvolutionLine = await this.cacheManager.get<EvolutionLineDocument | null>(`${CACHE_KEYS.EVOLUTION_LINE}-${basePokemonId}`)
    if (cachedEvolutionLine) return cachedEvolutionLine

    const evolutionLine = await this.EvolutionLineRepository.findOne(
      { pokemon: { $elemMatch: { $in: [basePokemonId] } } },
      {},
      {
        populate: {
          path: 'stages.stageZero.pokemon stages.stageOne.pokemon stages.stageTwo.pokemon stages.stageThree.pokemon',
          select: 'species typings description',
        },
      },
    )

    if (evolutionLine) await this.cacheManager.set(`${CACHE_KEYS.EVOLUTION_LINE}-${basePokemonId}`, evolutionLine, 30)
    return evolutionLine
  }
}
