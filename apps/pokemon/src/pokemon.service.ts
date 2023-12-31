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
import { WsException } from '@nestjs/websockets'
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
  STAT_INCREMENT_VALUES,
  EVOLUTION_STAGES,
  TradeInfo,
  RANKING_TYPES,
  MovesManager,
} from '@utils/utils'
import { ClientProxy } from '@nestjs/microservices'
import { AddActivePokemonDto } from './dtos/add-active-pokemon.dto'
import { RemoveActivePokemonDto } from './dtos/remove-active-pokemon.dto'
import { TransferPokemonDto } from './dtos/transfer-pokemon.dto'
import { UpdateNicknameDto } from './dtos/update-nickname.dto'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EvolvePokemonDto } from './dtos/evolve-pokemon.dto'
import { Cron } from '@nestjs/schedule'
import { RankingRepository } from '@lib/common'
import { ChangeMoveDto } from './dtos/change-move.dto'

@Injectable()
export class PokemonService {
  constructor(
    private readonly BasePokemonRepository: BasePokemonRepository,
    private readonly EvolutionLineRepository: EvolutionLineRepository,
    private readonly UserRepository: UserRepository,
    private readonly CaughtPokemonRepository: CaughtPokemonRepository,
    // private readonly RankingRepository: RankingRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly MovesManager: MovesManager,
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

    for (const currentPokemon of pokemon) {
      const moves = this.MovesManager.getMoveset(currentPokemon.moveset as string[])
      currentPokemon.moveset = moves.map(move => ({
        id: move.id,
        name: move.name,
        description: move.description,
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp,
        type: move.type,
      }))
    }

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

  // Distribute XP to active Pokémon for a user
  async distributeXpToActivePokemon({ user, pokemon, xp }: PokemonXpGainDto) {
    // Calculate the XP to be distributed per Pokémon based on the limit
    const xpPerPokemon = Math.floor(xp / DEFAULT_VALUES.ACTIVE_POKEMON_LIMIT)

    // Fetch the Pokémon from the database by their IDs, retrieving only 'xp' and 'level' fields
    const pokemonList = await this.CaughtPokemonRepository.find({ _id: { $in: pokemon } }, { xp: 1, level: 1, stats: 1 })

    // Initialize arrays to store promises and final Pokémon leveling information
    const promises: Promise<CaughtPokemonDocument>[] = []
    const finalPokemonList: PokemonLevelUp[] = []

    // Start a MongoDB session for the transaction
    const session = await this.CaughtPokemonRepository.startTransaction()

    try {
      for (let activePokemon of pokemonList) {
        let levelsGained = 0
        let isMaxLevel = false

        // Calculate the minimum XP required to level up
        let minXpToLevelUp = POKEMON_XP_TO_LEVEL_UP[activePokemon.level + 1]

        // Add the calculated XP to the Pokémon's XP
        activePokemon.xp += xpPerPokemon

        // While the Pokémon hasn't reached the max level and has enough XP to level up
        while (!isMaxLevel && minXpToLevelUp <= activePokemon.xp) {
          activePokemon.level += 1
          levelsGained += 1

          // Increase the Pokémon's stats based on predefined increment values
          activePokemon.stats.attack += STAT_INCREMENT_VALUES.ATTACK
          activePokemon.stats.defence += STAT_INCREMENT_VALUES.DEFENCE
          activePokemon.stats.hp += STAT_INCREMENT_VALUES.HP
          activePokemon.stats.speed += STAT_INCREMENT_VALUES.SPEED

          // Check if the Pokémon has reached the max level
          isMaxLevel = activePokemon.level === DEFAULT_VALUES.MAX_LEVEL

          // Calculate the minimum XP required for the next level
          if (!isMaxLevel) minXpToLevelUp = POKEMON_XP_TO_LEVEL_UP[activePokemon.level + 1]
        }

        // Push the updated Pokémon to the promises array
        promises.push(activePokemon.save())

        // Store information about the Pokémon's level gain
        finalPokemonList.push({ pokemon: activePokemon._id, levelsGained })
      }

      // Wait for all Pokémon updates to complete
      await Promise.all(promises)

      // Commit the transaction
      await session.commitTransaction()

      // Emit an event to signal that Pokémon XP has been distributed
      this.eventEmitter.emitAsync(EVENTS.POKEMON_XP_DISTRIBUTED, { user, finalPokemonList })
    } catch (error) {
      // Rollback the transaction in case of an error
      await session.abortTransaction()
      console.error(error)
    }
  }

  async evolve({ caughtPokemonId, basePokemonId }: EvolvePokemonDto, user: UserDocument) {
    const isCaughtByUser = user.pokemon.caught.inStorage.includes(caughtPokemonId)
    if (!isCaughtByUser) throw new BadRequestException('You have not caught this pokemon.')

    const fetchCaughtPokemonPromise = this.CaughtPokemonRepository.findById(caughtPokemonId, { pokemon: 1, stats: 1, level: 1 })

    const fetchBasePokemonPromise = this.BasePokemonRepository.findById(
      basePokemonId,
      { stats: 1, evolution: 1 },
      { populate: { path: 'evolution.line' } },
    )

    const [basePokemon, caughtPokemon] = await Promise.all([fetchBasePokemonPromise, fetchCaughtPokemonPromise])

    const evolutionLine = basePokemon.evolution.line as EvolutionLineDocument
    const currentStageInfo = evolutionLine.stages[EVOLUTION_STAGES[basePokemon.evolution.currentStage]]

    if (caughtPokemon.level < currentStageInfo.evolvesAtLevel)
      throw new BadRequestException(`This pokemon needs to be atleast of level ${currentStageInfo.evolvesAtLevel} to evolves.`)

    const nextStageInfo = evolutionLine.stages[EVOLUTION_STAGES[basePokemon.evolution.currentStage + 1]]
    if (!nextStageInfo) throw new BadRequestException('This pokemon cannot evolve further.')

    const pokemonToEvolveInto = await this.BasePokemonRepository.findById(nextStageInfo.pokemon[0], { stats: 1 })

    caughtPokemon.pokemon = pokemonToEvolveInto._id
    caughtPokemon.stats = {
      attack: pokemonToEvolveInto.stats.attack + caughtPokemon.level * STAT_INCREMENT_VALUES.ATTACK,
      defence: pokemonToEvolveInto.stats.defence + caughtPokemon.level * STAT_INCREMENT_VALUES.DEFENCE,
      hp: pokemonToEvolveInto.stats.hp + caughtPokemon.level * STAT_INCREMENT_VALUES.HP,
      speed: pokemonToEvolveInto.stats.speed + caughtPokemon.level * STAT_INCREMENT_VALUES.SPEED,
    }

    await caughtPokemon.save()
    return caughtPokemon
  }

  async tradePokemon(tradeInfo: TradeInfo) {
    const userOneId = tradeInfo.userOne.id
    const userTwoId = tradeInfo.userTwo.id

    const userOnePokemonId = tradeInfo.userOne.pokemon
    const userTwoPokemonId = tradeInfo.userTwo.pokemon

    const session = await this.UserRepository.startTransaction()

    try {
      const userOnePullPromise = this.UserRepository.update(userOneId, {
        $pull: { 'pokemon.caught.inStorage': userOnePokemonId },
      })
      const userOnePushPromise = this.UserRepository.update(userOneId, {
        $push: { 'pokemon.caught.inStorage': userTwoPokemonId },
      })

      const userTwoPullPromise = this.UserRepository.update(userTwoId, {
        $pull: { 'pokemon.caught.inStorage': userTwoPokemonId },
      })
      const userTwoPushPromise = this.UserRepository.update(userTwoId, {
        $push: { 'pokemon.caught.inStorage': userOnePokemonId },
      })

      const userOnePokemonUpdatePromise = this.CaughtPokemonRepository.update(userOnePokemonId, { $set: { user: userTwoId } })
      const userTwoPokemonUpdatePromise = this.CaughtPokemonRepository.update(userTwoPokemonId, { $set: { user: userOneId } })

      await Promise.all([
        userOnePullPromise,
        userOnePushPromise,
        userTwoPullPromise,
        userTwoPushPromise,
        userOnePokemonUpdatePromise,
        userTwoPokemonUpdatePromise,
      ])

      tradeInfo.userOne.pokemon = userTwoPokemonId
      tradeInfo.userTwo.pokemon = userOnePokemonId

      await session.commitTransaction()
      return tradeInfo
    } catch (error) {
      await session.abortTransaction()
      throw new WsException('Something went wrong while trading pokemon.')
    }
  }

  // @Cron('0 0 0 * * *')
  // async updateMostCaughtPokemonRankings() {
  //   try {
  //     const mostCaughtPokemonRanking = await this.RankingRepository.findOne({ type: RANKING_TYPES.MOST_CAUGHT_POKEMON })
  //     const users = await this.UserRepository.aggregate([
  //       { $project: { username: 1, pokemon: 1 } },
  //       { $addFields: { totalPokemon: { $size: { $concatArrays: ['$pokemon.caught.inStorage', '$pokemon.caught.transferred'] } } } },
  //       { $sort: { totalPokemon: -1 } },
  //       { $limit: 10 },
  //     ])

  //     const newRankings = users.map(user => {
  //       const totalPokemon = user.pokemon.caught.inStorage.length + user.pokemon.caught.transferred.length
  //       return { _id: user._id, username: user.username, amount: totalPokemon }
  //     })

  //     await this.RankingRepository.update(mostCaughtPokemonRanking._id, {
  //       $set: { users: newRankings },
  //     })
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  async changePokemonMove(changeMoveDto: ChangeMoveDto, user: UserDocument) {
    const isCaughtByUser = user.pokemon.caught.inStorage.includes(changeMoveDto.caughtPokemonId)
    if (!isCaughtByUser) throw new BadRequestException('You have not caught this pokemon.')

    const caughtPokemon = await this.CaughtPokemonRepository.findById(changeMoveDto.caughtPokemonId, { pokemon: 1, moveset: 1, level: 1 })

    if (!caughtPokemon.moveset.includes(changeMoveDto.currentMoveId))
      throw new BadRequestException('This pokemon does not have current move.')
    if (caughtPokemon.moveset.includes(changeMoveDto.newMoveId)) throw new BadRequestException('This pokemon already has the new move.')

    const pokemonMovePool = this.MovesManager.getMovePool(caughtPokemon.pokemon.toString()).moves
    const newMove = pokemonMovePool.find(move => move.moveId === changeMoveDto.newMoveId)

    if (!newMove) throw new BadRequestException('This pokemon cannot learn this move.')
    if (caughtPokemon.level < newMove.level)
      throw new BadRequestException(`This pokemon needs to be atleast of level ${newMove.level} to learn this move.`)

    const currentMoveIndex = caughtPokemon.moveset.findIndex(moveId => moveId === changeMoveDto.currentMoveId)
    caughtPokemon.moveset[currentMoveIndex] = changeMoveDto.newMoveId

    await caughtPokemon.save()
    return caughtPokemon.moveset
  }

  async getPokemonMoveset(caughtPokemonId: Types.ObjectId, user: UserDocument) {
    const isCaughtByUser = user.pokemon.caught.inStorage.includes(caughtPokemonId)
    if (!isCaughtByUser) throw new BadRequestException('You have not caught this pokemon.')

    const caughtPokemon = await this.CaughtPokemonRepository.findById(caughtPokemonId, { moveset: 1 })
    const moveset = this.MovesManager.getMoveset(caughtPokemon.moveset as string[])

    return moveset
  }
}
