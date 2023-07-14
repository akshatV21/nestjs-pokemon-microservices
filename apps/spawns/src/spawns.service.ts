import { BasePokemonDocument, BasePokemonRepository, EvolutionLineDocument, Spawn, SpawnDocument, SpawnRepository } from '@lib/common'
import { Injectable } from '@nestjs/common'
import {
  CITIES,
  City,
  DespawnInfo,
  EVOLUTION_STAGES,
  INITIAL_SPAWN_SIZE,
  MAX_LEVEL_IN_WILD,
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

        const pokemonEovultionLine = randomPokemon.evolution.line as unknown as EvolutionLineDocument
        const stage = randomPokemon.evolution.currentStage === 1 ? 1 : randomPokemon.evolution.currentStage - 1
        const minLevel = pokemonEovultionLine.stages[EVOLUTION_STAGES[stage]].evolvesAtLevel

        const spawnObjectId = new Types.ObjectId()
        const despawnsIn = Math.floor(Math.random() * (SPAWN_TIME.MAX - SPAWN_TIME.MIN + 1)) + SPAWN_TIME.MIN

        const createSpawnPromise = this.SpawnRepository.create(
          {
            pokemon: randomPokemon._id,
            level: Math.floor(Math.random() * (MAX_LEVEL_IN_WILD - minLevel + 1)) + minLevel,
            location: { city, block: randomBlock },
            despawnsAt: new Date(Date.now() + despawnsIn),
          },
          spawnObjectId,
        )

        promises.push(createSpawnPromise)
        emptyBlocks.splice(randomBlockIndex, 1)

        this.spawnsManager.addNewSpawn(city, randomBlock, spawnObjectId)
        this.scheduleDespawningPokemon({ spawnId: spawnObjectId, city, pokemonSpecies: randomPokemon.species, despawnsIn })
        console.log(`spawned ${randomPokemon.species} in ${city} city`)
      }
    }

    await Promise.all(promises)
  }

  scheduleDespawningPokemon(despawnInfo: DespawnInfo) {
    const callback = this.despawnPokemon(despawnInfo)
    const timeout = setTimeout(callback, despawnInfo.despawnsIn)
    this.schedulerRegistry.addTimeout(despawnInfo.spawnId.toString(), timeout)
  }

  despawnPokemon(despawnInfo: DespawnInfo) {
    return async () => {
      await this.SpawnRepository.delete({ _id: despawnInfo.spawnId })
      console.log(`despawned ${despawnInfo.pokemonSpecies} from ${despawnInfo.city} city`)
    }
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
