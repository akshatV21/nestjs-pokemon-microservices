import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuthenticatedSocket, CITIES, DespawnInfo, EVENTS, EXCEPTION_MSGS, SERVICES, catchAuthErrors } from '@utils/utils'
import { lastValueFrom } from 'rxjs'
import { Auth, AuthorizeDto, SpawnDocument } from '@lib/common'
import { OnEvent } from '@nestjs/event-emitter'

@WebSocketGateway(8083, { namespace: 'spawns', cors: { origin: '*' } })
export class SpawnsGateway {
  constructor(@Inject(SERVICES.AUTH_SERVICE) private readonly authService: ClientProxy) {}

  @WebSocketServer()
  server: Server

  async handleConnection(socket: AuthenticatedSocket) {
    const token = socket.handshake.auth.token
    if (!token) throw new WsException(EXCEPTION_MSGS.NULL_TOKEN)

    await lastValueFrom(this.authService.send<any, AuthorizeDto>(EVENTS.AUTHORIZE, { token, requestType: 'ws' })).catch(err =>
      catchAuthErrors(err, 'ws'),
    )
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
