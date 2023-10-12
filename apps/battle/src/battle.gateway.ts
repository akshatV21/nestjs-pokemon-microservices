import { AuthorizeDto, UserRepository } from '@lib/common'
import { UsePipes, ValidationPipe, Inject } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ClientProxy } from '@nestjs/microservices'
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException, MessageBody } from '@nestjs/websockets'
import {
  AuthenticatedSocket,
  BattleEndingReason,
  BattleInfo,
  CRITICAL_HIT_CHANCE,
  EFFECTIVENESS_MODIFIERS,
  EVENTS,
  EXCEPTION_MSGS,
  Effectiveness,
  MovesManager,
  NEG_STAGE_MODIFIERS,
  POINTS,
  POINTS_TO_RANK_UP,
  PlayerTimedOut,
  RANKING_ORDER_ASC,
  RANKING_ORDER_DESC,
  SERVICES,
  STAGE_MODIFIERS,
  STATUS_CONDITIONS,
  STATUS_CONDITION_PAST,
  STATUS_DAMANGE,
  STAT_NAMES,
  SelectFirstPokemon,
  SelectMove,
  SocketSessions,
  StatusCondition,
  TYPE_CHART,
  TurnInfo,
  TurnStage,
  UpdatePlayerTimer,
  catchAuthErrors,
} from '@utils/utils'
import { lastValueFrom } from 'rxjs'
import { Server } from 'socket.io'
import { BattleManager } from './battle-manager.service'

@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
@WebSocketGateway({ namespace: 'battle', cors: { origin: '*' } })
export class BattleGateway {
  @WebSocketServer()
  server: Server

  constructor(
    private socketSessions: SocketSessions,
    private readonly movesManager: MovesManager,
    private readonly battleManager: BattleManager,
    private readonly UserRepository: UserRepository,
    @Inject(SERVICES.AUTH_SERVICE) private readonly authService: ClientProxy,
  ) {}

  async handleConnection(socket: AuthenticatedSocket) {
    const token = socket.handshake.auth.token || socket.handshake.headers.token
    if (!token) throw new WsException(EXCEPTION_MSGS.NULL_TOKEN)

    const response = await lastValueFrom(
      this.authService.send<any, AuthorizeDto>(EVENTS.AUTHORIZE, { token, requestType: 'ws', cached: false }),
    ).catch(err => catchAuthErrors(err, 'ws'))

    this.socketSessions.setSocket(response.user, socket)
  }

  async handleDisconnect(socket: AuthenticatedSocket) {
    const token = socket.handshake.auth.token || socket.handshake.headers.token
    if (!token) throw new WsException(EXCEPTION_MSGS.NULL_TOKEN)

    const response = await lastValueFrom(
      this.authService.send<any, AuthorizeDto>(EVENTS.AUTHORIZE, { token, requestType: 'ws', cached: false }),
    ).catch(err => catchAuthErrors(err, 'ws'))

    const battle = this.battleManager.getBattleByPlayerId(response.user)
    if (battle) this.endBattle(battle.id, 'disconnect', response.user)

    this.socketSessions.removeSocket(response.user)
  }

  @OnEvent(EVENTS.USER_JOINED_BATTLE)
  joinBattleRoom(userId: string, battle: BattleInfo) {
    const socket = this.socketSessions.getSocket(userId)
    if (socket) socket.join(battle.id)

    this.server.to(battle.id).emit(EVENTS.USER_JOINED_BATTLE, battle)
  }

  @SubscribeMessage(EVENTS.FIRST_POKE_SELECTED)
  handleFirstPokeSelectedEvent(@MessageBody() payload: SelectFirstPokemon) {
    const battle = this.battleManager.selectFirstPokemon(payload.battleId, payload.playerId, payload.pokemonId)
    if (battle) this.server.to(payload.battleId).emit(EVENTS.BATTLE_STARTED, payload)
  }

  @SubscribeMessage(EVENTS.UPDATE_PLAYER_TIMER)
  handleUpdateBattleTimerEvent(@MessageBody() payload: UpdatePlayerTimer) {
    let message: string
    const { username, time: remainingTime, battleId } = this.battleManager.updateTimer(payload.battleId, payload.playerId, payload.time)

    if (remainingTime <= 10) message = `${username} has less than 10 seconds left.`
    else if (remainingTime <= 30) message = `${username} has less than 30 seconds left.`
    else if (remainingTime <= 60) message = `${username} has less than 1 minute left.`
    else if (remainingTime <= 120) message = `${username} has less than 2 minutes left.`

    if (message) this.server.to(battleId).emit(EVENTS.PLAYER_TIMER_UPDATED, { battleId: payload.battleId, message })
  }

  @SubscribeMessage(EVENTS.GET_BATTLE_INFO)
  handleGetBattleInfoEvent(@MessageBody() battleId: string) {
    const battle = this.battleManager.getBattle(battleId)
    if (!battle) throw new WsException('Battle not found.')

    return battle
  }

  @SubscribeMessage(EVENTS.SELECT_MOVE)
  handleSelectMoveEvent(@MessageBody() payload: SelectMove) {
    const battle = this.battleManager.selectMove(payload.battleId, payload.playerId, payload.moveId)
    if (battle) this.handleBothPlayersSelectedMoveEvent(battle)
  }

  @SubscribeMessage(EVENTS.PLAYER_TIMED_OUT)
  handlePlayerTimeoutEvent(@MessageBody() payload: PlayerTimedOut) {
    this.endBattle(payload.battleId, 'timeout', payload.playerId)
  }

  private handleBothPlayersSelectedMoveEvent(battle: BattleInfo) {
    const turn = []
    const [player1, player2] = Object.values(battle.players)

    const player1Pokemon = player1.pokemon[player1.onFieldPokemonId!]
    const player2Pokemon = player2.pokemon[player2.onFieldPokemonId!]

    const pokemon1MoveID = player1Pokemon.moves.find(move => move === player1.selectedMoveId)!
    const pokemon2MoveID = player2Pokemon.moves.find(move => move === player2.selectedMoveId)!

    const pokemon1Move = this.movesManager.getMove(pokemon1MoveID)
    const pokemon2Move = this.movesManager.getMove(pokemon2MoveID)

    let pokemon1Speed = player1Pokemon.modifiedStats.speed.current * STAGE_MODIFIERS[pokemon1Move.priority]
    let pokemon2Speed = player2Pokemon.modifiedStats.speed.current * STAGE_MODIFIERS[pokemon2Move.priority]
    const pokemon1IsFaster = pokemon1Speed > pokemon2Speed

    const pokemonToMoveFirst = pokemon1IsFaster ? player1Pokemon : player2Pokemon
    const pokemonToMoveSecond = pokemon1IsFaster ? player2Pokemon : player1Pokemon

    const firstStageInTurn: TurnStage = this.getStageInTurn({
      pokemon1: pokemonToMoveFirst,
      pokemon2: pokemonToMoveSecond,
      pokemon1Move,
      player1,
      player2,
    })

    const secondStageInTurn: TurnStage = this.getStageInTurn({
      pokemon1: pokemonToMoveSecond,
      pokemon2: pokemonToMoveFirst,
      pokemon1Move,
      player1,
      player2,
    })

    turn.push(firstStageInTurn)
    turn.push(secondStageInTurn)

    this.server.to(battle.id).emit(EVENTS.MOVES_SELECTED_BY_BOTH_PLAYERS, { battleId: battle.id, turn })
  }

  private getStageInTurn({ pokemon1, pokemon2, pokemon1Move, player1, player2 }: TurnInfo) {
    const msgs = [`${pokemon1.name} used ${pokemon1Move.name}.`]
    const stageInTurn: TurnStage = {
      from: pokemon1.id,
      to: pokemon2.id,
      missed: false,
      fainted: false,
      messages: msgs,
    }

    const pokemon1MoveMissed = Math.random() * 100 > pokemon1Move.accuracy
    if (pokemon1MoveMissed) {
      msgs.push(`${pokemon1.name}'s missed its ${pokemon1Move.name}.`)
      stageInTurn.missed = true
    } else {
      let damage = Math.floor((pokemon1.modifiedStats.attack.current / pokemon2.modifiedStats.defense.current) * pokemon1Move.power)
      const effectiveness = this.movesManager.getEffectiveness(pokemon1Move, pokemon2.typings)

      damage = Math.floor(damage * EFFECTIVENESS_MODIFIERS[effectiveness])
      damage = pokemon1.typings.includes(pokemon1Move.typing) ? Math.floor(damage * 1.5) : damage

      const isCriticalHit = Math.random() <= CRITICAL_HIT_CHANCE
      if (isCriticalHit) damage = Math.floor(damage * 1.5)

      pokemon2.currentHp -= damage
      msgs.push(`${pokemon2.name}'s hp was reduced to ${pokemon2.currentHp}.`)

      if (effectiveness === 'super-effective' || effectiveness === 'not-very-effective') msgs.push(`It was ${effectiveness}!`)
      if (isCriticalHit) msgs.push(`It was a critical hit!`)

      stageInTurn.damage = damage
      stageInTurn.critical = isCriticalHit
      stageInTurn.effectiveness = effectiveness

      if (pokemon2.currentHp <= 0) {
        msgs.push(`${pokemon2.name} fainted!`)
        stageInTurn.fainted = true
      }

      if (!stageInTurn.fainted) {
        const alreadyHasStatusCondition = pokemon2.status
        if (!alreadyHasStatusCondition) this.checkForAndApplyStatus({ pokemon2, pokemon1Move, msgs })

        if (pokemon1Move.user)
          this.checkForAndApplyStatChanges({
            pokemon: pokemon1,
            move: pokemon1Move,
            player: player1,
            msgs,
            stageInTurn,
            target: 'user',
          })

        if (pokemon1Move.opponent)
          this.checkForAndApplyStatChanges({
            pokemon: pokemon2,
            move: pokemon1Move,
            player: player2,
            msgs,
            stageInTurn,
            target: 'opponent',
          })
      }
    }

    return stageInTurn
  }

  private checkForAndApplyStatus({ pokemon2, pokemon1Move, msgs }: TurnInfo) {
    let statusCondition: StatusCondition
    for (const status of Object.values(STATUS_CONDITIONS)) {
      const canStatusChance = pokemon1Move[status]
      if (canStatusChance && Math.random() * 100 <= canStatusChance) {
        statusCondition = status
        break
      }
    }

    const gotStatusConditionThisTurn = statusCondition && !pokemon2.status
    if (!gotStatusConditionThisTurn) return

    pokemon2.status = gotStatusConditionThisTurn ? statusCondition : pokemon2.status
    msgs.push(`${pokemon2.name} was ${STATUS_CONDITION_PAST[statusCondition]}!`)

    if (statusCondition === 'burn') pokemon2.modifiedStats.attack.current = Math.floor(pokemon2.modifiedStats.attack.current * 0.5)
    if (statusCondition === 'paralyze') pokemon2.modifiedStats.speed.current = Math.floor(pokemon2.modifiedStats.speed.current * 0.5)
  }

  private checkForAndApplyStatChanges({ pokemon, move, player, msgs, stageInTurn, target }: TurnInfo) {
    for (const stat of STAT_NAMES) {
      if (pokemon.modifiedStats[stat].stages >= 6 || pokemon.modifiedStats[stat].stages <= -6) {
        msgs.push(`${pokemon.name}'s ${stat} cannot go any higher!`)
        continue
      }

      let stage: number
      const statChangeDirection = move[target][stat]! > 0 ? 'increased' : 'decreased'

      if (statChangeDirection === 'increased') {
        stage = Math.min(move.user[stat]!, 6 - pokemon.modifiedStats[stat].stages)
        pokemon.modifiedStats[stat].stages += stage
        pokemon.modifiedStats[stat].current = Math.floor(pokemon.modifiedStats[stat].current * STAGE_MODIFIERS[stage])
      } else {
        stage = Math.abs(Math.max(move.user[stat]!, -6 - pokemon.modifiedStats[stat].stages))
        pokemon.modifiedStats[stat].stages -= stage
        pokemon.modifiedStats[stat].current = Math.floor(pokemon.modifiedStats[stat].current * NEG_STAGE_MODIFIERS[stage])
      }

      if (!stageInTurn.statChanges[player.id]) stageInTurn.statChanges[player.id] = {}
      stageInTurn.statChanges[player.id][stat] = {
        current: pokemon.modifiedStats[stat].current,
        stages: pokemon.modifiedStats[stat].stages,
      }

      msgs.push(`${pokemon.name}'s ${stat} ${statChangeDirection} by ${stage} stages!`)
    }
  }

  private async endBattle(battleId: string, reason: BattleEndingReason, playerId: string) {
    const messages = []
    const players = this.battleManager.endBattle(battleId)
    const winner = Object.values(players).find(player => player.id !== playerId)
    const loser = players[playerId]

    if (reason === 'timeout') {
      messages.push(`${loser.username} has no time left.`)
      messages.push(`${winner.username} won the battle!`)
    } else if (reason === 'surrender') {
      messages.push(`${loser.username} surrendered.`)
      messages.push(`${winner.username} won the battle!`)
    } else if (reason === 'disconnect') {
      messages.push(`${loser.username} disconnected.`)
      messages.push(`${winner.username} won the battle!`)
    } else if (reason === 'all-pokemon-fainted') {
      messages.push(`${loser.username}'s all pokemon fainted.`)
      messages.push(`${winner.username} won the battle!`)
    }

    const session = await this.UserRepository.startTransaction()
    const loserPoints = loser.points - POINTS[reason]
    const winnerPoints = winner.points + POINTS[reason]

    messages.push(`${loser.username} lost ${POINTS[reason]} points.`)
    messages.push(`${winner.username} gained ${POINTS[reason]} points.`)

    const loserRank = loserPoints < POINTS_TO_RANK_UP[loser.rank] ? RANKING_ORDER_DESC[loser.rank] : loser.rank
    const winnerRank = winnerPoints >= POINTS_TO_RANK_UP[winner.rank] ? RANKING_ORDER_ASC[winner.rank] : winner.rank

    if (loser.rank !== loserRank) messages.push(`${loser.username} has been demoted to ${loserRank} rank.`)
    if (winner.rank !== winnerRank) messages.push(`${winner.username} has been promoted to ${winnerRank} rank.`)

    try {
      const loserUpdatePromise = this.UserRepository.update(loser.id, {
        $set: { 'battle.points': loserPoints, 'battle.rank': loserRank },
        $inc: { 'battle.stats.lost': 1 },
      })

      const winnerUpdatePromise = this.UserRepository.update(winner.id, {
        $set: { 'battle.points': winnerPoints, 'battle.rank': winnerRank },
        $inc: { 'battle.stats.won': 1 },
      })

      await Promise.all([loserUpdatePromise, winnerUpdatePromise])
      await session.commitTransaction()

      this.server.to(battleId).emit(EVENTS.BATTLE_ENDED, { battleId, messages })
    } catch (error) {
      await session.abortTransaction()
      throw new WsException('Error while ending battle.')
    }
  }
}
