import { Socket } from 'socket.io'

export interface HttpSuccessResponse {
  success: boolean
  message: string
  data: Record<string, any>
}

export interface AuthOptions {
  isLive?: boolean
  isOpen?: boolean
}

export interface AuthenticatedSocket extends Socket {
  entityId?: string
}
