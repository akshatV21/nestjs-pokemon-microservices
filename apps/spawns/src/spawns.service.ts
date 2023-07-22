import {
  BasePokemonDocument,
  BasePokemonRepository,
  EvolutionLineDocument,
  Spawn,
  SpawnDocument,
  SpawnRepository,
  UserDocument,
} from '@lib/common'
import { Injectable } from '@nestjs/common'
import {
  Block,
  CITIES,
  City,
  DespawnInfo,
  EVENTS,
  EVOLUTION_STAGES,
  INITIAL_SPAWN_SIZE,
  MAX_LEVEL_IN_WILD,
  NEW_SPAWN_DELAY,
  SPAWN_TIME,
  TOTAL_SPAWN_RATE,
} from '@utils/utils'
import { SpawnsManager } from './spawns-manager.service'
import { Types } from 'mongoose'
import { SPAWN_RATES } from './rates/spawn-rates'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { basename } from 'path'

@Injectable()
export class SpawnsService {
  private basePokemonList: BasePokemonDocument[]

  constructor(
    private readonly BasePokemonRepository: BasePokemonRepository,
    private readonly SpawnRepository: SpawnRepository,
    private readonly spawnsManager: SpawnsManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async generateInitialSpawns() {
    const cities = Object.values(CITIES)
    const promises: Promise<SpawnDocument>[] = []

    for (const city of cities) {
      const emptyBlocks = this.spawnsManager.getEmptyBlocksByCity(city)

      for (let i = 0; i < INITIAL_SPAWN_SIZE; i++) {
        const randomBlockIndex = Math.floor(Math.random() * emptyBlocks.length)
        const randomBlock = emptyBlocks[randomBlockIndex]

        const spawnPromise = this.createSpawn(city, randomBlock)
        promises.push(spawnPromise)
        emptyBlocks.splice(randomBlockIndex, 1)
      }
    }

    await Promise.all(promises)
  }

  scheduleSpawningNewPokemon(city: City, newSpawnDelay: number) {
    const callback = this.generateNewSpawn(city)
    setTimeout(callback, newSpawnDelay)
  }

  generateNewSpawn(city: City) {
    return async () => {
      const emptyBlocks = this.spawnsManager.getEmptyBlocksByCity(city)
      const randomBlock = emptyBlocks[Math.floor(Math.random() * emptyBlocks.length)]

      const spawn = await this.createSpawn(city, randomBlock)
      spawn.pokemon = this.basePokemonList.find(pokemon => spawn.pokemon.equals(pokemon._id))

      this.eventEmitter.emit(EVENTS.POKEMON_SPAWNED, spawn)
    }
  }

  scheduleDespawningPokemon(despawnInfo: DespawnInfo) {
    const callback = this.despawnPokemon(despawnInfo)
    setTimeout(callback, despawnInfo.despawnsIn)
  }

  despawnPokemon(despawnInfo: DespawnInfo) {
    return async () => {
      await this.SpawnRepository.delete({ _id: despawnInfo.spawnId })

      this.spawnsManager.removeSpawn(despawnInfo.spawnId)
      this.eventEmitter.emit(EVENTS.POKEMON_DESPAWNED, despawnInfo)

      const newSpawnDelay = Math.floor(Math.random() * (NEW_SPAWN_DELAY.MAX - NEW_SPAWN_DELAY.MIN + 1)) + NEW_SPAWN_DELAY.MIN
      this.scheduleSpawningNewPokemon(despawnInfo.city, newSpawnDelay)
    }
  }

  async createSpawn(city: City, block: Block) {
    let randomPokemon: BasePokemonDocument
    let cumulativeSpawnRate = 0
    const randomSpawnRate = Math.random() * TOTAL_SPAWN_RATE

    for (const pokemon of this.basePokemonList) {
      cumulativeSpawnRate += SPAWN_RATES[pokemon.pokedexNo]
      if (randomSpawnRate <= cumulativeSpawnRate) {
        randomPokemon = pokemon
        break
      }
    }

    const pokemonEvolutionLine = randomPokemon.evolution.line as unknown as EvolutionLineDocument
    const stage = randomPokemon.evolution.currentStage === 1 ? 1 : randomPokemon.evolution.currentStage - 1
    const minLevel = pokemonEvolutionLine.stages[EVOLUTION_STAGES[stage]].evolvesAtLevel

    const spawnObjectId = new Types.ObjectId()
    const despawnsIn = Math.floor(Math.random() * (SPAWN_TIME.MAX - SPAWN_TIME.MIN + 1)) + SPAWN_TIME.MIN

    const createSpawnPromise = this.SpawnRepository.create(
      {
        pokemon: randomPokemon._id,
        level: Math.floor(Math.random() * (MAX_LEVEL_IN_WILD - minLevel + 1)) + minLevel,
        location: { city, block },
        despawnsAt: new Date(Date.now() + despawnsIn),
      },
      spawnObjectId,
    )

    this.spawnsManager.addNewSpawn(spawnObjectId, city, block)
    this.scheduleDespawningPokemon({
      spawnId: spawnObjectId,
      city,
      pokemonSpecies: randomPokemon.species,
      despawnsIn,
      block,
    })

    return createSpawnPromise
  }

  async getCitySpawns(city: City, user: UserDocument) {
    const citySpawns = await this.SpawnRepository.find({ 'location.city': city })
    
    const caughtSpawnIds = this.spawnsManager.getUserCaughtSpawnIdsByCity(city, user._id)
    const uncaughtSpawns = citySpawns.filter(spawn => !caughtSpawnIds.includes(spawn._id))

    return uncaughtSpawns
  }

  async despawnEveryPokemon() {
    await this.SpawnRepository.deleteMany({})
  }

  async updateBasePokemonList() {
    this.basePokemonList = await this.BasePokemonRepository.find({})
  }
}
