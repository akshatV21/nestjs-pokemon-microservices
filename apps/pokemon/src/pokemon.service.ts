import {
  BasePokemonDocument,
  BasePokemonRepository,
  EvolutionLine,
  EvolutionLineDocument,
  EvolutionLineRepository,
  UserDocument,
  UserRepository,
} from '@lib/common'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { CreatePokemonDto } from './dtos/create-pokemon.dto'
import { CreateEvolutionLineDto } from './dtos/create-evolution-line.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { CACHE_KEYS, DEFAULT_VALUES, EVENTS, SERVICES } from '@utils/utils'
import { ClientProxy } from '@nestjs/microservices'
import { AddActivePokemonDto } from './dtos/add-active-pokemon.dto'
import { RemoveActivePokemonDto } from './dtos/remove-active-pokemon.dto'

@Injectable()
export class PokemonService {
  constructor(
    private readonly BasePokemonRepository: BasePokemonRepository,
    private readonly EvolutionLineRepository: EvolutionLineRepository,
    private readonly UserRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(SERVICES.SPAWNS_SERVICE) private readonly spawnsService: ClientProxy,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    const pokemon = await this.BasePokemonRepository.create(createPokemonDto)

    this.spawnsService.emit(EVENTS.BASE_POKEMON_LIST_UPDATED, {})
    return pokemon
  }

  async list() {
    const cachedPokemon = await this.cacheManager.get<BasePokemonDocument[] | null>(`${CACHE_KEYS.BASE_POKEMON_LIST}`)
    if (cachedPokemon) return cachedPokemon

    const pokemon = await this.BasePokemonRepository.find({})
    if (pokemon.length > 0) await this.cacheManager.set(`${CACHE_KEYS.BASE_POKEMON_LIST}`, pokemon, { ttl: 20 })

    return pokemon
  }

  async getBasePokemon(basePokemonId: Types.ObjectId) {
    const cachedPokemon = await this.cacheManager.get<BasePokemonDocument | null>(`${CACHE_KEYS.BASE_POKEMON}-${basePokemonId}`)
    if (cachedPokemon) return cachedPokemon

    const pokemon = await this.BasePokemonRepository.findById(basePokemonId)
    if (pokemon) await this.cacheManager.set(`${CACHE_KEYS.BASE_POKEMON}-${basePokemonId}`, pokemon, { ttl: 20 })

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
    console.log('evolution-line-cached')
    if (evolutionLine) await this.cacheManager.set(`${CACHE_KEYS.EVOLUTION_LINE}-${basePokemonId}`, evolutionLine, { ttl: 20 })
    return evolutionLine
  }

  async addActivePokemon({ pokemon }: AddActivePokemonDto, user: UserDocument) {
    const isCaughtByUser = user.pokemon.caught.inStorage.includes(pokemon)
    const noOfCurrentActivePokemon = user.pokemon.active.length

    if (!isCaughtByUser) throw new BadRequestException(`You cannot add a Pokémon that you haven't caught.`)

    if (noOfCurrentActivePokemon >= DEFAULT_VALUES.ACTIVE_POKEMON_LIMIT)
      throw new BadRequestException(`Cannot have more than ${DEFAULT_VALUES.ACTIVE_POKEMON_LIMIT} active pokemon.`)

    const userUpdated = await this.UserRepository.update(user._id, { $push: { 'pokemon.active': pokemon } })
    return userUpdated.pokemon.active
  }

  async removeActivePokemon({ pokemon }: RemoveActivePokemonDto, user: UserDocument) {
    const currentActivePokemon = user.pokemon.active
    if (!currentActivePokemon.includes(pokemon)) throw new BadRequestException('The specified Pokémon is not currently active.')

    const userUpdated = await this.UserRepository.update(user._id, { $pull: { 'pokemon.active': pokemon } })
    return userUpdated.pokemon.active
  }
}
