import { Item } from '@utils/utils'

export const DROP_RATES: Record<Item, number> = {
  pokeballs: 0.3, // 30%
  greatballs: 0.2, // 20%
  ultraballs: 0.1, // 10%
  razzBerry: 0.2, // 20%
  pinapBerry: 0.15, // 15%
  goldenRazzBerry: 0.05, // 5%
} as const
