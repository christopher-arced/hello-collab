import type { Request, Response } from 'express'
import { registerSchema } from '@hello/validation'
import { createUser, generateTokens, findUserByEmail } from '../services/auth.service'

export async function register(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    })
  }

  const { email, password, name } = result.data

  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'Email already registered',
    })
  }

  const user = await createUser({ email, password, name })
  const tokens = generateTokens(user.id)

  return res.status(201).json({
    success: true,
    data: { user, tokens },
  })
}
