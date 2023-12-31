import { SetMetadata } from '@nestjs/common'
import { AuthOptions } from '@utils/utils'

export const Auth = (authOptions?: AuthOptions) => {
  const metadata: AuthOptions = {
    isLive: authOptions?.isLive ?? true,
    isOpen: authOptions?.isOpen ?? false,
    cached: authOptions?.cached ?? true,
  }

  return SetMetadata('authOptions', metadata)
}
