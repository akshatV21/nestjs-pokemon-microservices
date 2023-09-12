import { ContextType, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { EXCEPTION_MSGS } from '../constants'
import { RpcException } from '@nestjs/microservices'
import { WsException } from '@nestjs/websockets'

export function catchAuthErrors(err: any, type: ContextType) {
  console.log(err)
  switch (err.message) {
    case EXCEPTION_MSGS.UNAUTHORIZED:
      throw type === 'http'
        ? new ForbiddenException('You are not authorized to access this endpoint.')
        : type === 'rpc'
        ? new RpcException('You are not authorized to access this endpoint.')
        : new WsException('You are not authorized to access this endpoint.')
    case EXCEPTION_MSGS.JWT_EXPIRED:
      throw type === 'http'
        ? new UnauthorizedException('You token has expired. Please log in again.')
        : type === 'rpc'
        ? new RpcException('You token has expired. Please log in again.')
        : new WsException('You token has expired. Please log in again.')
    default:
      throw type === 'http' ? new UnauthorizedException('Invalid Jwt.') : new RpcException('Invalid Jwt.')
  }
}

export function generateTradeCode(): `${number}` {
  const min = 100000 // Smallest 6-digit number
  const max = 999999 // Largest 6-digit number

  // Generate a random integer between min and max (inclusive)
  const tradeCode = Math.floor(Math.random() * (max - min + 1)) + min

  // Convert the trade code to a string and pad with leading zeros if necessary
  return `${tradeCode}`
}
