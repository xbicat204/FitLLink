import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'
import crypto from 'crypto'

export const genarateAccessToken = (payload) => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}


export const genarateRefreshToken = (payload) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

export const generateResetToken = (minutes = 5) => {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * minutes)

  return { token, expires }
}