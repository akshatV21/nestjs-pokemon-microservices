import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuthenticatedSocket, CITIES, DespawnInfo, EVENTS, EXCEPTION_MSGS, SERVICES, SocketSessions, catchAuthErrors } from '@utils/utils'
import { lastValueFrom } from 'rxjs'
import { AuthorizeDto, SpawnDocument } from '@lib/common'
import { OnEvent } from '@nestjs/event-emitter'

@WebSocketGateway({ namespace: 'spawns', cors: { origin: '*' } })
export class SpawnsGateway {
  constructor(private socketSessions: SocketSessions, @Inject(SERVICES.AUTH_SERVICE) private readonly authService: ClientProxy) {}

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

  @OnEvent(EVENTS.POKEMON_SPAWNED)
  handlePokemonSpawnedEvent(payload: SpawnDocument) {
    this.server.emit(EVENTS.POKEMON_SPAWNED, payload)
  }

  @OnEvent(EVENTS.POKEMON_DESPAWNED)
  handlePokemonDespawnedEvent(payload: DespawnInfo) {
    this.server.emit(EVENTS.POKEMON_DESPAWNED, { spawnId: payload.spawnId, city: payload.city })
  }
}
