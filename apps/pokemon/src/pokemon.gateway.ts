import { Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { WebSocketGateway, WebSocketServer, WsException, SubscribeMessage, MessageBody } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Types } from 'mongoose'
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
import { TradePokemonDto } from './dtos/trade-pokemon.dto'
import { PokemonService } from './pokemon.service'

@WebSocketGateway({ namespace: 'pokemon', cors: { origin: '*' } })
export class PokemonGateway {
  private trades: Map<`${number}`, TradeInfo>

  constructor(
    private socketSessions: SocketSessions,
    @Inject(SERVICES.AUTH_SERVICE) private readonly authService: ClientProxy,
    private readonly pokemonService: PokemonService,
  ) {
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

    this.socketSessions.setSocket(response.user, socket)
  }

  async handleDisconnect(socket: AuthenticatedSocket) {
    const userId = socket.entityId

    this.socketSessions.removeSocket(userId)
    this.trades.forEach((trade, code) => {
      if (trade.userOne.id.equals(userId) || trade.userTwo.id.equals(userId)) {
        const otherUserId = trade.userOne.id.equals(userId) ? trade.userTwo.id : trade.userOne.id
        const otherUserSocket = this.socketSessions.getSocket(otherUserId.toString())

        this.trades.delete(code)
        otherUserSocket.emit(EVENTS.USER_DISCONNECTED, { message: 'The other user disconnected.' })
      }
    })
  }

  @SubscribeMessage(EVENTS.INITIALIZE_TRADE)
  async handleInitializeTradeEvent(@MessageBody() payload: TradePokemonDto) {
    const code = generateTradeCode()

    this.trades.set(code, { code, userOne: { id: new Types.ObjectId(payload.userId), pokemon: null, confirm: false }, userTwo: null })
    return { code }
  }

  @SubscribeMessage(EVENTS.JOIN_TRADE)
  async handleTradeJoinEvent(@MessageBody() payload: TradePokemonDto) {
    const trade = this.trades.get(payload.code)

    if (!trade) throw new WsException('Invalid trade code.')
    if (trade.userTwo) throw new WsException('Two users are already connected.')

    trade.userTwo = { id: new Types.ObjectId(payload.userId), pokemon: null, confirm: false }
    this.trades.set(payload.code, trade)

    const userOneSocket = this.socketSessions.getSocket(trade.userOne.id.toString())
    const userTwoSocket = this.socketSessions.getSocket(trade.userTwo.id.toString())

    userOneSocket.emit(EVENTS.JOINED_TRADE, trade)
    userTwoSocket.emit(EVENTS.JOINED_TRADE, trade)
  }

  @SubscribeMessage(EVENTS.SELECT_POKEMON)
  async handleSelectPokemonEvent(@MessageBody() payload: TradePokemonDto) {
    const trade = this.trades.get(payload.code)
    this.canTrade(payload, trade)

    if (trade.userOne.id.equals(payload.userId)) trade.userOne.pokemon = payload.pokemonId
    else trade.userTwo.pokemon = payload.pokemonId

    this.trades.set(payload.code, trade)

    const userOneSocket = this.socketSessions.getSocket(trade.userOne.id.toString())
    const userTwoSocket = this.socketSessions.getSocket(trade.userTwo.id.toString())

    userOneSocket.emit(EVENTS.POKEMON_SELECTED, trade)
    userTwoSocket.emit(EVENTS.POKEMON_SELECTED, trade)
  }

  @SubscribeMessage(EVENTS.CONFIRM_TRADE)
  async handleConfirmTradeEvent(@MessageBody() payload: TradePokemonDto) {
    const trade = this.trades.get(payload.code)

    this.canTrade(payload, trade)

    if (trade.userOne.id.equals(payload.userId)) trade.userOne.confirm = true
    else trade.userTwo.confirm = true

    this.trades.set(payload.code, trade)

    const userOneSocket = this.socketSessions.getSocket(trade.userOne.id.toString())
    const userTwoSocket = this.socketSessions.getSocket(trade.userTwo.id.toString())

    userOneSocket.emit(EVENTS.TRADE_CONFIRMED, trade)
    userTwoSocket.emit(EVENTS.TRADE_CONFIRMED, trade)

    if (trade.userOne.confirm && trade.userTwo.confirm) {
      const tradeInfo = await this.pokemonService.tradePokemon(trade)

      userOneSocket.emit(EVENTS.TRADE_COMPLETED, tradeInfo)
      userTwoSocket.emit(EVENTS.TRADE_COMPLETED, tradeInfo)
    }
  }

  @SubscribeMessage(EVENTS.CANCEL_TRADE)
  async handleCancelTradeEvent(@MessageBody() payload: TradePokemonDto) {
    const trade = this.trades.get(payload.code)

    this.canTrade(payload, trade)

    const userOneSocket = this.socketSessions.getSocket(trade.userOne.id.toString())
    const userTwoSocket = this.socketSessions.getSocket(trade.userTwo.id.toString())

    userOneSocket.emit(EVENTS.TRADE_CANCELED, { message: 'The other user cancelled the trade.' })
    userTwoSocket.emit(EVENTS.TRADE_CANCELED, { message: 'The other user cancelled the trade.' })

    this.trades.delete(payload.code)
  }

  private canTrade(payload: TradePokemonDto, trade: TradeInfo) {
    if (!trade) throw new WsException('Invalid trade code.')
    if (!trade.userTwo) throw new WsException('Only one user is connected.')
    if (trade.userOne.id.equals(payload.userId) && trade.userTwo.id.equals(payload.userId))
      throw new WsException('You are not part of this trade.')
  }
}
