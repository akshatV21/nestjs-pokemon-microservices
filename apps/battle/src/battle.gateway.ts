import { AuthorizeDto } from '@lib/common'
import { UsePipes, ValidationPipe, Inject } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ClientProxy } from '@nestjs/microservices'
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException, MessageBody } from '@nestjs/websockets'
import {
  AuthenticatedSocket,
  BattleInfo,
  EVENTS,
  EXCEPTION_MSGS,
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

    if (remainingTime <= 0) {
      message = `${username} has no time left.`
      this.handlePlayerTimeout(battleId, payload.playerId)
    } else if (remainingTime <= 10) message = `${username} has 10 seconds left.`
    else if (remainingTime <= 30) message = `${username} has 30 seconds left.`
    else if (remainingTime <= 60) message = `${username} has 1 minute left.`
    else if (remainingTime <= 120) message = `${username} has 2 minutes left.`

    if (message) this.server.to(battleId).emit(EVENTS.PLAYER_TIMER_UPDATED, { battleId: payload.battleId, message })
  }

  handlePlayerTimeout(battleId: string, playerId: string) {
    const players = this.battleManager.endBattle(battleId)
    const winnerPlayerId = Object.values(players).find(player => player.id !== playerId)

    this.server.to(battleId).emit(EVENTS.BATTLE_ENDED, { battleId, winner: winnerPlayerId })
  }

  @SubscribeMessage(EVENTS.GET_BATTLE_INFO)
  handleGetBattleInfoEvent(@MessageBody() battleId: string) {
    const battle = this.battleManager.getBattle(battleId)
    if (!battle) throw new WsException('Battle not found.')

    return battle
  }
}
