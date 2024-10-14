import BigNumber from 'bignumber.js'
import { z } from 'zod'

export const transferSchema = z.object({
  to: z
    .string()
    .startsWith('0x', 'Address must start with 0x')
    .transform((val) => val as `0x${string}`),
  amount: z
    .string()
    .refine((val) => !!val && +val >= 0, 'Invalid amount')
    .transform((val) => BigNumber(val).toFixed()),
})
