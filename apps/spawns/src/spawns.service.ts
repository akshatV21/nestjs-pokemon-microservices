import { BasePokemonDocument, BasePokemonRepository, EvolutionLineDocument, Spawn, SpawnDocument, SpawnRepository } from '@lib/common'
import { Injectable } from '@nestjs/common'
import {
  Block,
  CITIES,
  City,
  DespawnInfo,
  EVOLUTION_STAGES,
  INITIAL_SPAWN_SIZE,
  MAX_LEVEL_IN_WILD,
  NEW_SPAWN_DELAY,
  SPAWN_TIME,
  TOTAL_SPAWN_RATE,
} from '@utils/utils'
import { SpawnsManager } from './spawns-manager.servier'
import { Types } from 'mongoose'
import { SchedulerRegistry } from '@nestjs/schedule'
import { SPAWN_RATES } from './spawn-rates'

@Injectable()
export class SpawnsService {
  constructor(
    private readonly BasePokemonRepository: BasePokemonRepository,
    private readonly SpawnRepository: SpawnRepository,
    private readonly spawnsManager: SpawnsManager,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async generateSpawns(spawnRates: typeof SPAWN_RATES) {
    const pokemonList = await this.BasePokemonRepository.find(
      {},
      { _id: 1, species: 1, evolution: 1, pokedexNo: 1 },
      { populate: { path: 'evolution.line' }, sort: { pokedexNo: 1 } },
    )

    const cities = Object.values(CITIES)
    const promises: Promise<SpawnDocument>[] = []

    for (const city of cities) {
      const emptyBlocks = this.spawnsManager.getEmptyBlocksByCity(city)

      for (let i = 0; i < INITIAL_SPAWN_SIZE; i++) {
        const randomBlockIndex = Math.floor(Math.random() * emptyBlocks.length)
        const randomBlock = emptyBlocks[randomBlockIndex]

        const spawnPromise = this.createSpawn(pokemonList, city, randomBlock)
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
      const pokemonList = await this.BasePokemonRepository.find(
        {},
        { _id: 1, species: 1, evolution: 1, pokedexNo: 1 },
        { populate: { path: 'evolution.line' }, sort: { pokedexNo: 1 } },
      )

      const emptyBlocks = this.spawnsManager.getEmptyBlocksByCity(city)
      const randomBlock = emptyBlocks[Math.floor(Math.random() * emptyBlocks.length)]

      await this.createSpawn(pokemonList, city, randomBlock)
    }
  }

  scheduleDespawningPokemon(despawnInfo: DespawnInfo) {
    const callback = this.despawnPokemon(despawnInfo)
    setTimeout(callback, despawnInfo.despawnsIn)
  }

  despawnPokemon(despawnInfo: DespawnInfo) {
    return async () => {
      await this.SpawnRepository.delete({ _id: despawnInfo.spawnId })
      this.spawnsManager.removeSpawn(despawnInfo.city, despawnInfo.block)
      console.log(`despawned ${despawnInfo.pokemonSpecies} from ${despawnInfo.city} city`)

      const newSpawnDelay = Math.floor(Math.random() * (NEW_SPAWN_DELAY.MAX - NEW_SPAWN_DELAY.MIN + 1)) + NEW_SPAWN_DELAY.MIN
      this.scheduleSpawningNewPokemon(despawnInfo.city, newSpawnDelay)
    }
  }

  async createSpawn(pokemonList: BasePokemonDocument[], city: City, block: Block) {
    let randomPokemon: BasePokemonDocument
    let cumulativeSpawnRate = 0
    const randomSpawnRate = Math.random() * TOTAL_SPAWN_RATE

    for (const pokemon of pokemonList) {
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

    this.spawnsManager.addNewSpawn(city, block, spawnObjectId)
    this.scheduleDespawningPokemon({
      spawnId: spawnObjectId,
      city,
      pokemonSpecies: randomPokemon.species,
      despawnsIn,
      block,
    })

    console.log(`spawned ${randomPokemon.species} in ${city} city`)
    return createSpawnPromise
  }

  async getCitySpawns(city: City) {
    return this.SpawnRepository.find(
      { 'location.city': city },
      {},
      { populate: { path: 'pokemon', select: 'species description typings img' } },
    )
  }

  async despawnEveryPokemon() {
    await this.SpawnRepository.deleteMany({ 'location.city': 'solace' })
  }
}
