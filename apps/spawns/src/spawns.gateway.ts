import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { AuthenticatedSocket, EVENTS, EXCEPTION_MSGS, SERVICES, catchAuthErrors } from '@utils/utils'
import { lastValueFrom } from 'rxjs'
import { AuthorizeDto } from '@lib/common'

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
}
