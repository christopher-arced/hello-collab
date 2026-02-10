import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'
import type { ApiResponse } from '@hello/types'

/**
 * Middleware factory that validates request body against a Zod schema.
 * If validation fails, returns a 400 response with field errors.
 * If validation succeeds, replaces req.body with the parsed data and calls next().
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
      return
    }

    req.body = result.data
    next()
  }
}
