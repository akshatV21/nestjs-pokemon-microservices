import {
  BasePokemonDocument,
  BasePokemonRepository,
  CaughtPokemonRepository,
  EvolutionLineDocument,
  SpawnDocument,
  SpawnRepository,
  UserDocument,
  UserRepository,
  ItemUsedDto,
  PokemonXpGainDto,
} from '@lib/common'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import {
  Block,
  CATCH_RATE_MODIFIERS,
  CITIES,
  City,
  DespawnInfo,
  EARN_CREDITS,
  EVENTS,
  EVOLUTION_STAGES,
  INITIAL_SPAWN_SIZE,
  MAX_LEVEL_IN_WILD,
  MovesManager,
  NEW_SPAWN_DELAY,
  POKEMON_XP_TO_LEVEL_UP,
  SERVICES,
  SPAWN_TIME,
  STAT_INCREMENT_VALUES,
  TOTAL_SPAWN_RATE,
} from '@utils/utils'
import { SpawnsManager } from './spawns-manager.service'
import { Types } from 'mongoose'
import { SPAWN_RATES } from './rates/spawn-rates'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SHINY_RATES } from './rates/shiny-rates'
import { CatchSpawnDto } from './dtos/catch-spawn.dto'
import { CATCH_RATES } from './rates/catch-rates'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class SpawnsService {
  private basePokemonObj: Record<string, BasePokemonDocument>
  private evolutionLineObj: Record<string, EvolutionLineDocument>
  private noOfPokemonSpawned: number

  constructor(
    private readonly BasePokemonRepository: BasePokemonRepository,
    private readonly SpawnRepository: SpawnRepository,
    private readonly CaughtPokemonRepository: CaughtPokemonRepository,
    private readonly UserRepository: UserRepository,
    private readonly spawnsManager: SpawnsManager,
    private readonly eventEmitter: EventEmitter2,
    private readonly movesManager: MovesManager,
    @Inject(SERVICES.INVENTORY_SERVICE) private readonly inventoryService: ClientProxy,
    @Inject(SERVICES.POKEMON_SERVICE) private readonly pokemonService: ClientProxy,
  ) {
    this.basePokemonObj = {}
    this.evolutionLineObj = {}
    this.noOfPokemonSpawned = 0
  }

  // Generates initial spawns for each city.
  async generateInitialSpawns() {
    const cities = Object.values(CITIES)
    const promises: Promise<SpawnDocument>[] = []

    for (const city of cities) {
      const emptyBlocks = this.spawnsManager.getEmptyBlocksByCity(city)

      for (let i = 0; i < INITIAL_SPAWN_SIZE; i++) {
        // Generates a random block index and creates a spawn on the chosen block.
        const randomBlockIndex = Math.floor(Math.random() * emptyBlocks.length)
        const randomBlock = emptyBlocks[randomBlockIndex]

        // Creates a new spawn and adds the promise to the list.
        const spawnPromise = this.createSpawn(city, randomBlock)
        promises.push(spawnPromise)

        // Removes the chosen block to avoid duplicates.
        emptyBlocks.splice(randomBlockIndex, 1)
      }
    }

    await Promise.all(promises)
  }

  // Schedules the spawning of a new Pokémon in the given city after a specified delay.
  scheduleSpawningNewPokemon(city: City, newSpawnDelay: number) {
    const callback = this.generateNewSpawn(city)
    setTimeout(callback, newSpawnDelay)
  }

  // Generates a callback function for spawning a new Pokémon.
  generateNewSpawn(city: City) {
    return async () => {
      const emptyBlocks = this.spawnsManager.getEmptyBlocksByCity(city)
      const randomBlock = emptyBlocks[Math.floor(Math.random() * emptyBlocks.length)]

      // Create a new spawn and associate pokémon details
      const spawn = await this.createSpawn(city, randomBlock)
      spawn.pokemon = this.basePokemonObj[spawn.pokemon.toString()]

      // Emit an event to notify that a new Pokémon has spawned
      this.eventEmitter.emit(EVENTS.POKEMON_SPAWNED, spawn)
    }
  }

  // Schedules the despawning of a Pokémon after a specified delay.
  scheduleDespawningPokemon(despawnInfo: DespawnInfo) {
    const callback = this.despawnPokemon(despawnInfo)
    setTimeout(callback, despawnInfo.despawnsIn)
  }

  // Generates a callback function for despawning a Pokémon.
  despawnPokemon(despawnInfo: DespawnInfo) {
    return async () => {
      // Delete the spawn from the database.
      await this.SpawnRepository.delete({ _id: despawnInfo.spawnId })

      console.log(`DESPAWNED ${despawnInfo.pokemonSpecies} at ${despawnInfo.block} in ${despawnInfo.city}`)

      // Remove the spawn from the spawnsManager.
      this.spawnsManager.removeSpawn(despawnInfo.spawnId)

      // Emit an event to notify that the Pokémon has despawned.
      this.eventEmitter.emit(EVENTS.POKEMON_DESPAWNED, despawnInfo)

      // Calculate a new spawn delay and schedule a new Pokémon spawn.
      const newSpawnDelay = Math.floor(Math.random() * (NEW_SPAWN_DELAY.MAX - NEW_SPAWN_DELAY.MIN + 1)) + NEW_SPAWN_DELAY.MIN
      this.scheduleSpawningNewPokemon(despawnInfo.city, newSpawnDelay)
    }
  }

  // Creates a new spawn for a Pokémon in the specified city and block.
  async createSpawn(city: City, block: Block) {
    let randomPokemon: BasePokemonDocument
    let cumulativeSpawnRate = 0

    // Generate a random spawn rate between 0 and the total spawn rate.
    const randomSpawnRate = Math.random() * TOTAL_SPAWN_RATE

    // Select a random Pokémon based on the cumulative spawn rates.
    for (const pokemon of Object.values(this.basePokemonObj)) {
      cumulativeSpawnRate += SPAWN_RATES[pokemon.pokedexNo]

      // If the random spawn rate is within the cumulative spawn rate,
      // choose this Pokémon for spawning.
      if (randomSpawnRate <= cumulativeSpawnRate) {
        randomPokemon = pokemon
        break
      }
    }

    // Get the evolution line and stage information for the selected Pokémon.
    const pokemonEvolutionLine = this.evolutionLineObj[randomPokemon.id]
    const stage = randomPokemon.evolution.currentStage === 1 ? 1 : randomPokemon.evolution.currentStage - 1
    const minLevel = pokemonEvolutionLine.stages[EVOLUTION_STAGES[stage]].evolvesAtLevel

    // Determine if the spawned Pokémon is shiny based on the shiny rate.
    const shinyRate = SHINY_RATES[randomPokemon.pokedexNo]
    const isShiny = Math.random() < shinyRate

    // Generate a unique spawn object ID and calculate the despawn time.
    const spawnObjectId = new Types.ObjectId()
    const despawnsIn = Math.floor(Math.random() * (SPAWN_TIME.MAX - SPAWN_TIME.MIN + 1)) + SPAWN_TIME.MIN

    // Create a new spawn entry in the database.
    const createSpawnPromise = this.SpawnRepository.create(
      {
        pokemon: randomPokemon._id,
        level: Math.floor(Math.random() * (MAX_LEVEL_IN_WILD - minLevel + 1)) + minLevel,
        location: { city, block },
        despawnsAt: new Date(Date.now() + despawnsIn),
        isShiny,
        moveset: this.movesManager.getPokemonRandomMoveset(randomPokemon.id),
      },
      spawnObjectId,
    )

    // Add the new spawn to the spawnsManager for tracking.
    this.spawnsManager.addNewSpawn(spawnObjectId, city, block)

    // Schedule the despawning of the Pokémon after a specified time.
    this.scheduleDespawningPokemon({
      spawnId: spawnObjectId,
      city,
      pokemonSpecies: randomPokemon.species,
      despawnsIn,
      block,
    })

    this.noOfPokemonSpawned += 1
    console.log(`SPAWNED ${randomPokemon.species} at ${block} in ${city} - [${this.noOfPokemonSpawned}]`)

    return createSpawnPromise
  }

  // Retrieves a list of uncaught Pokémon spawns for the specified city.
  async getCitySpawns(city: City, user: UserDocument) {
    // Fetch all spawns for the given city from the database.
    const citySpawns = await this.SpawnRepository.find({ 'location.city': city })

    // Get the spawn IDs of the Pokémon caught by the user in the city.
    const caughtSpawnIds = this.spawnsManager.getUserCaughtSpawnIdsByCity(city, user._id)

    // Filter the city spawns to include only those that the user hasn't caught.
    const uncaughtSpawns = citySpawns.filter(spawn => !caughtSpawnIds.includes(spawn._id))
    const finalSpawns = uncaughtSpawns.map(spawn => {
      spawn.pokemon = this.basePokemonObj[spawn.pokemon.toString()]
      return spawn
    })

    return finalSpawns
  }

  async despawnEveryPokemon() {
    await this.SpawnRepository.deleteMany({})
  }

  // Attempts to catch a Pokémon based on the provided spawn information and user data.
  async catch(catchSpawnDto: CatchSpawnDto, user: UserDocument) {
    // Check if the user's storage is full before attempting to catch.
    const pokemonInStorage = user.pokemon.caught.inStorage.length
    if (pokemonInStorage >= user.pokemon.storageLimit) {
      throw new BadRequestException('No more space for pokemon to store.')
    }

    if (user.inventory.items[catchSpawnDto.ball] <= 0) throw new BadRequestException(`You do not have any ${catchSpawnDto.ball}`)
    if (catchSpawnDto.berry && user.inventory.items[catchSpawnDto.ball] <= 0)
      throw new BadRequestException(`You do not have any ${catchSpawnDto.berry}`)

    // Retrieve the spawn details based on the provided spawn ID.
    const spawn = await this.SpawnRepository.findById(catchSpawnDto.spawn, {}, { lean: true })
    if (!spawn) {
      throw new BadRequestException('Invalid spawn.')
    }

    // Prepare the payload for the RabbitMQ message and emitting it
    const rpcPayload: ItemUsedDto = { user: user._id, ball: catchSpawnDto.ball, berry: catchSpawnDto.berry }
    this.inventoryService.emit(EVENTS.ITEM_USED, rpcPayload)

    // Find the corresponding base Pokémon for the spawn.
    const pokemon = this.basePokemonObj[spawn.pokemon as unknown as string]

    // Calculate the base catch rate and modify it based on items.
    let baseCatchRate = CATCH_RATES[pokemon.pokedexNo]
    baseCatchRate += baseCatchRate * CATCH_RATE_MODIFIERS[catchSpawnDto.ball.toUpperCase()]
    if (catchSpawnDto.berry) {
      baseCatchRate += baseCatchRate * CATCH_RATE_MODIFIERS[catchSpawnDto.berry.toUpperCase()]
    }

    // Generate a random catch rate and check if the catch attempt was successful.
    const randomCatchRate = Math.random()
    if (randomCatchRate > baseCatchRate) throw new BadRequestException('Did not catch pokemon.')

    const stats = {
      attack: pokemon.stats.attack + spawn.level * STAT_INCREMENT_VALUES.ATTACK,
      defence: pokemon.stats.defence + spawn.level * STAT_INCREMENT_VALUES.DEFENCE,
      hp: pokemon.stats.hp + spawn.level * STAT_INCREMENT_VALUES.HP,
      speed: pokemon.stats.speed + spawn.level * STAT_INCREMENT_VALUES.SPEED,
    }

    const creditsEarned = Math.floor(Math.random() * (EARN_CREDITS.MAX - EARN_CREDITS.MIN + 1)) + EARN_CREDITS.MIN

    // Start a transaction to update user and caught Pokémon data.
    const caughtPokemonObjectId = new Types.ObjectId()
    const session = await this.CaughtPokemonRepository.startTransaction()

    try {
      // Update the user's caught Pokémon storage.
      const updateUserPromise = this.UserRepository.update(user._id, {
        $push: { 'pokemon.caught.inStorage': caughtPokemonObjectId },
        $inc: { credits: creditsEarned },
      })

      // Create a new caught Pokémon entry with relevant data.
      const createCaughtPokemonPromise = this.CaughtPokemonRepository.create(
        {
          user: user._id,
          nickname: pokemon.species,
          pokemon: pokemon._id,
          location: spawn.location,
          level: spawn.level,
          isShiny: spawn.isShiny,
          xp: POKEMON_XP_TO_LEVEL_UP[spawn.level],
          stats,
          moveset: spawn.moveset,
        },
        caughtPokemonObjectId,
      )

      // Execute promises to update user and caught Pokémon data.
      const [caughtPokemon] = await Promise.all([createCaughtPokemonPromise, updateUserPromise])
      await session.commitTransaction()

      const pokemonXpGainRpcPayload: PokemonXpGainDto = {
        user: user._id,
        pokemon: user.pokemon.active,
        xp: POKEMON_XP_TO_LEVEL_UP[spawn.level],
      }
      this.pokemonService.emit(EVENTS.POKEMON_CAUGHT, pokemonXpGainRpcPayload)

      caughtPokemon.pokemon = pokemon
      return caughtPokemon
    } catch (error) {
      // Rollback the transaction in case of an error and re-throw the error.
      await session.abortTransaction()
      throw error
    }
  }

  async updateBasePokemonData() {
    const basePokemonList = await this.BasePokemonRepository.find({}, {}, { populate: { path: 'evolution.line' } })
    basePokemonList.forEach(pokemon => {
      this.evolutionLineObj[pokemon.id] = pokemon.evolution.line as unknown as EvolutionLineDocument

      pokemon.evolution.line = pokemon.evolution.line._id
      this.basePokemonObj[pokemon.id] = pokemon
    })
  }
}
