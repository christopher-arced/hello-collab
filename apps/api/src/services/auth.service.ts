import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma, type User as PrismaUser } from '@hello/database'
import type { RegisterInput } from '@hello/validation'
import type { User, AuthTokens } from '@hello/types'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateTokens(userId: string): AuthTokens {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  const accessToken = jwt.sign({ userId }, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  })
  return { accessToken }
}

export async function createUser(data: RegisterInput): Promise<Omit<User, 'passwordHash'>> {
  const passwordHash = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return user
}

export async function findUserByEmail(email: string): Promise<PrismaUser | null> {
  return prisma.user.findUnique({ where: { email } })
}
