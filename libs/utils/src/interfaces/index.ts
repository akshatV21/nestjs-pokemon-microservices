export interface HttpSuccessResponse {
  success: boolean
  message: string
  data: Record<string, any>
}

export interface AuthOptions {
  isLive?: boolean
  isOpen?: boolean
}
