import jwt from 'jsonwebtoken'
import { env } from '../../src/config/environment'
import {
  genarateAccessToken,
  genarateRefreshToken,
  generateResetToken
} from '../../src/utils/genarateTokens'

const payload = { _id: 'student-123', role: 'student' }

describe('FitLink authentication token helpers', () => {
  beforeEach(() => {
    env.ACCESS_TOKEN_SECRET = 'fitlink-unit-test-access-secret'
    env.REFRESH_TOKEN_SECRET = 'fitlink-unit-test-refresh-secret'
  })

  test('creates an access token with expected claims and one-day expiry', () => {
    const token = genarateAccessToken(payload)
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET)

    expect(decoded._id).toBe(payload._id)
    expect(decoded.role).toBe(payload.role)
    expect(decoded.exp - decoded.iat).toBe(24 * 60 * 60)
  })

  test('creates a refresh token with a seven-day expiry', () => {
    const token = genarateRefreshToken(payload)
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET)

    expect(decoded._id).toBe(payload._id)
    expect(decoded.role).toBe(payload.role)
    expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60)
  })

  test('creates a 64-character hex reset token expiring after five minutes', () => {
    const before = Date.now()
    const { token, expires } = generateResetToken()
    const after = Date.now()

    expect(token).toMatch(/^[a-f0-9]{64}$/)
    expect(expires.getTime()).toBeGreaterThanOrEqual(before + 5 * 60 * 1000)
    expect(expires.getTime()).toBeLessThanOrEqual(after + 5 * 60 * 1000)
  })
})
