import { BasePokemonRepository, EvolutionLineDocument, Spawn, SpawnDocument, SpawnRepository } from '@lib/common'
import { Injectable } from '@nestjs/common'
import { CITIES, City, EVOLUTION_STAGES, INITIAL_SPAWN_SIZE, MAX_LEVEL_IN_WILD, SPAWN_TIME } from '@utils/utils'
import { SpawnsManager } from './spawns-manager.servier'
import { Types } from 'mongoose'
import { SchedulerRegistry } from '@nestjs/schedule'

@Injectable()
export class SpawnsService {
  constructor(
    private readonly BasePokemonRepository: BasePokemonRepository,
    private readonly SpawnRepository: SpawnRepository,
    private readonly spawnsManager: SpawnsManager,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async generateSpawns() {
    const pokemonList = await this.BasePokemonRepository.find(
      {},
      { _id: 1, species: 1, evolution: 1 },
      { populate: { path: 'evolution.line' } },
    )
    const cities = Object.values(CITIES)
    const promises: Promise<SpawnDocument>[] = []

    for (const city of cities) {
      const emptyBlocks = this.spawnsManager.getEmptyBlocksByCity(city)

      for (let i = 0; i < INITIAL_SPAWN_SIZE; i++) {
        const randomBlockIndex = Math.floor(Math.random() * emptyBlocks.length)
        const randomPokemonIndex = Math.floor(Math.random() * pokemonList.length)

        const randomBlock = emptyBlocks[randomBlockIndex]
        const randomPokemon = pokemonList[randomPokemonIndex]

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

        emptyBlocks.splice(randomBlockIndex, 1)
        pokemonList.splice(randomPokemonIndex, 1)

        promises.push(createSpawnPromise)
        this.spawnsManager.addNewSpawn(city, randomBlock, spawnObjectId)
        this.scheduleDespawningPokemon(spawnObjectId, randomPokemon.species, despawnsIn)
      }
    }

    await Promise.all(promises)
  }

  scheduleDespawningPokemon(spawnId: Types.ObjectId, pokemonSpecies: string, despawnsIn: number) {
    const callback = this.despawnPokemon(spawnId, pokemonSpecies)
    const timeout = setTimeout(callback, despawnsIn)
    this.schedulerRegistry.addTimeout(spawnId.toString(), timeout)
  }

  despawnPokemon(spawnId: Types.ObjectId, pokemonSpecies: string) {
    return async () => {
      const spawn = await this.SpawnRepository.delete({ _id: spawnId })
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
    await this.SpawnRepository.deleteMany({ 'location.city': 'blazeville' })
  }
}
