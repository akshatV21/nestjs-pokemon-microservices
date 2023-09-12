import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets'
import { Server } from 'socket.io'
import {
  AuthenticatedSocket,
  EVENTS,
  EXCEPTION_MSGS,
  SERVICES,
  SocketSessions,
  TradeInfo,
  catchAuthErrors,
  generateTradeCode,
} from '@utils/utils'
import { lastValueFrom } from 'rxjs'
import { AuthorizeDto } from '@lib/common'
import { OnEvent } from '@nestjs/event-emitter'
import { TradePokemonDto } from './dtos/trade-pokemon.dto'

@WebSocketGateway({ namespace: 'pokemon', cors: { origin: '*' } })
export class PokemonGateway {
  private trades: Map<`${number}`, TradeInfo>

  constructor(private socketSessions: SocketSessions, @Inject(SERVICES.AUTH_SERVICE) private readonly authService: ClientProxy) {
    this.trades = new Map()
  }

  @WebSocketServer()
  server: Server

  async handleConnection(socket: AuthenticatedSocket) {
    const token = socket.handshake.auth.token || socket.handshake.headers.token
    if (!token) throw new WsException(EXCEPTION_MSGS.NULL_TOKEN)

    const response = await lastValueFrom(
      this.authService.send<any, AuthorizeDto>(EVENTS.AUTHORIZE, { token, requestType: 'ws', cached: false }),
    ).catch(err => catchAuthErrors(err, 'ws'))
    this.socketSessions.setSocket(response.userId, socket)
  }

  @OnEvent(EVENTS.INITIALIZE_TRADE)
  async handleInitializeTradeEvent(payload: TradePokemonDto) {
    const userTradeInfo = { userId: payload.userId }
    const code = generateTradeCode()

    this.trades.set(code, { code, userOne: { id: payload.userId, pokemon: null }, userTwo: null })
    return { code }
  }

  @OnEvent(EVENTS.JOIN_TRADE)
  async handleTradeJoinEvent(payload: TradePokemonDto) {
    const trade = this.trades.get(payload.code)

    if (!trade) throw new WsException('Invalid trade code.')
    if (trade.userTwo) throw new WsException('Two users are already connected.')

    trade.userTwo = { id: payload.userId, pokemon: null }
    this.trades.set(payload.code, trade)

    const userOneSocket = this.socketSessions.getSocket(trade.userOne.id.toString())
    const userTwoSocket = this.socketSessions.getSocket(trade.userTwo.id.toString())

    userOneSocket.emit(EVENTS.JOINED_TRADE, trade)
    userTwoSocket.emit(EVENTS.JOINED_TRADE, trade)
  }
}
