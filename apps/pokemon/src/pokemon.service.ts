import {
  BasePokemonDocument,
  BasePokemonRepository,
  CaughtPokemonDocument,
  CaughtPokemonRepository,
  EvolutionLine,
  EvolutionLineDocument,
  EvolutionLineRepository,
  PokemonXpGainDto,
  UserDocument,
  UserRepository,
} from '@lib/common'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { CreatePokemonDto } from './dtos/create-pokemon.dto'
import { CreateEvolutionLineDto } from './dtos/create-evolution-line.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import {
  CACHE_KEYS,
  DEFAULT_VALUES,
  EVENTS,
  POKEMON_XP_TO_LEVEL_UP,
  PokemonLevelUp,
  SERVICES,
  BASE_POKEMON_PAGINATION_LIMIT,
} from '@utils/utils'
import { ClientProxy } from '@nestjs/microservices'
import { AddActivePokemonDto } from './dtos/add-active-pokemon.dto'
import { RemoveActivePokemonDto } from './dtos/remove-active-pokemon.dto'
import { TransferPokemonDto } from './dtos/transfer-pokemon.dto'
import { UpdateNicknameDto } from './dtos/update-nickname.dto'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class PokemonService {
  constructor(
    private readonly BasePokemonRepository: BasePokemonRepository,
    private readonly EvolutionLineRepository: EvolutionLineRepository,
    private readonly UserRepository: UserRepository,
    private readonly CaughtPokemonRepository: CaughtPokemonRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(SERVICES.SPAWNS_SERVICE) private readonly spawnsService: ClientProxy,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    const pokemon = await this.BasePokemonRepository.create(createPokemonDto)

    this.spawnsService.emit(EVENTS.BASE_POKEMON_LIST_UPDATED, {})
    return pokemon
  }

  async listBasePokemon(page: number) {
    const cachedPokemon = await this.cacheManager.get<BasePokemonDocument[] | null>(`${CACHE_KEYS.BASE_POKEMON_LIST}-${page}`)
    if (cachedPokemon) return cachedPokemon

    const skipCount = (page - 1) * BASE_POKEMON_PAGINATION_LIMIT
    const pokemon = await this.BasePokemonRepository.find({}, {}, { skip: skipCount, limit: BASE_POKEMON_PAGINATION_LIMIT })

    if (pokemon.length > 0) await this.cacheManager.set(`${CACHE_KEYS.BASE_POKEMON_LIST}-${page}`, pokemon, { ttl: 20 })
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

    if (evolutionLine) await this.cacheManager.set(`${CACHE_KEYS.EVOLUTION_LINE}-${basePokemonId}`, evolutionLine, { ttl: 20 })
    return evolutionLine
  }

  async getCaughtPokemonList(user: UserDocument) {
    const pokemon = await this.CaughtPokemonRepository.find({ user: user._id }, {}, { populate: { path: 'pokemon' } })
    return pokemon
  }

  // Adds a caught Pokémon to the user's active Pokémon list.
  async addActivePokemon({ pokemon }: AddActivePokemonDto, user: UserDocument) {
    // Check if the Pokémon is caught by the user.
    const isCaughtByUser = user.pokemon.caught.inStorage.includes(pokemon)
    if (!isCaughtByUser) throw new BadRequestException('You have not caught this pokemon.')

    // Check the number of current active Pokémon.
    const noOfCurrentActivePokemon = user.pokemon.active.length
    if (noOfCurrentActivePokemon >= DEFAULT_VALUES.ACTIVE_POKEMON_LIMIT)
      throw new BadRequestException(`Cannot have more than ${DEFAULT_VALUES.ACTIVE_POKEMON_LIMIT} active pokemon.`)

    // Add the Pokémon to the active list and update the user.
    const userUpdated = await this.UserRepository.update(user._id, { $push: { 'pokemon.active': pokemon } })
    return userUpdated.pokemon.active
  }

  // Removes an active Pokémon from the user's active Pokémon list.
  async removeActivePokemon({ pokemon }: RemoveActivePokemonDto, user: UserDocument) {
    const currentActivePokemon = user.pokemon.active

    // Check if the provided Pokémon is active.
    if (!currentActivePokemon.includes(pokemon)) throw new BadRequestException('You cannot remove an inactive pokemon.')

    // Remove the Pokémon from the active list and update the user.
    const userUpdated = await this.UserRepository.update(user._id, { $pull: { 'pokemon.active': pokemon } })
    return userUpdated.pokemon.active
  }

  // Transfers selected Pokémon from caught Pokémon storage to the transferred list.
  async transfer(transferPokemonDto: TransferPokemonDto, user: UserDocument) {
    // Iterate through each Pokémon in the transfer request.
    transferPokemonDto.pokemon.forEach(pokemonId => {
      // Check if the user has caught the Pokémon before allowing the transfer.
      const isCaughtByUser = user.pokemon.caught.inStorage.includes(pokemonId)
      if (!isCaughtByUser) {
        throw new BadRequestException(`You cannot transfer a Pokémon that you haven't caught.`)
      }
    })

    // Update the user's document to perform the transfer.
    const userUpdated = await this.UserRepository.update(user._id, {
      $pull: { 'pokemon.caught.inStorage': { $in: transferPokemonDto.pokemon } },
      $push: { 'pokemon.caught.transferred': { $each: transferPokemonDto.pokemon } },
    })

    // Return the transferred Pokémon IDs.
    return { transferred: transferPokemonDto.pokemon }
  }

  // Updates the nickname of a caught Pokémon for the given user.
  async updateNickname({ pokemon, nickname }: UpdateNicknameDto, user: UserDocument) {
    // Check if the Pokémon is caught by the user.
    const isCaughtByUser = user.pokemon.caught.inStorage.includes(pokemon)
    if (!isCaughtByUser) throw new BadRequestException('You have not caught this pokemon.')

    await this.CaughtPokemonRepository.update(pokemon, { $set: { nickname } })
    return nickname
  }

  async distributeXpToActivePokemon({ user, pokemon, xp }: PokemonXpGainDto) {
    const xpPerPokemon = Math.floor(xp / DEFAULT_VALUES.ACTIVE_POKEMON_LIMIT)
    const pokemonList = await this.CaughtPokemonRepository.find({ _id: { $in: pokemon } }, { xp: 1, level: 1 })

    const promises: Promise<CaughtPokemonDocument>[] = []
    const finalPokemonList: PokemonLevelUp[] = []
    const session = await this.CaughtPokemonRepository.startTransaction()

    try {
      for (let activePokemon of pokemonList) {
        let levelsGained = 0
        let isMaxLevel = false
        let minXpToLevelUp = POKEMON_XP_TO_LEVEL_UP[activePokemon.level + 1]

        activePokemon.xp += xpPerPokemon
        while (!isMaxLevel && minXpToLevelUp <= activePokemon.xp) {
          activePokemon.level += 1
          levelsGained += 1

          isMaxLevel = activePokemon.level === DEFAULT_VALUES.MAX_LEVEL
          if (!isMaxLevel) minXpToLevelUp = POKEMON_XP_TO_LEVEL_UP[activePokemon.level + 1]
        }

        promises.push(activePokemon.save())
        finalPokemonList.push({ pokemon: activePokemon._id, levelsGained })
      }

      await Promise.all(promises)
      await session.commitTransaction()

      this.eventEmitter.emitAsync(EVENTS.POKEMON_XP_DISTRIBUTED, { user, finalPokemonList })
    } catch (error) {
      await session.abortTransaction()
    }
  }
}
