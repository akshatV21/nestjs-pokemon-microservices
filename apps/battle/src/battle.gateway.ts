import { AuthorizeDto, UserRepository } from '@lib/common'
import { UsePipes, ValidationPipe, Inject } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ClientProxy } from '@nestjs/microservices'
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException, MessageBody } from '@nestjs/websockets'
import {
  AuthenticatedSocket,
  BattleEndingReason,
  BattleInfo,
  EVENTS,
  EXCEPTION_MSGS,
  POINTS,
  POINTS_TO_RANK_UP,
  PlayerTimedOut,
  RANKING_ORDER_ASC,
  RANKING_ORDER_DESC,
  SERVICES,
  SelectFirstPokemon,
  SocketSessions,
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

  @SubscribeMessage(EVENTS.PLAYER_TIMED_OUT)
  handlePlayerTimeoutEvent(@MessageBody() payload: PlayerTimedOut) {
    this.endBattle(payload.battleId, 'timeout', payload.playerId)
  }

  async endBattle(battleId: string, reason: BattleEndingReason, playerId: string) {
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
