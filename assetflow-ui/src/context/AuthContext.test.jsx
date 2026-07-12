import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { authApi } from '../api/services'

vi.mock('../api/services', () => ({
  authApi: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts unauthenticated when localStorage has no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('restores the user from localStorage on mount', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'admin@assetflow.com', role: 'ROLE_ADMIN' }))

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAdmin).toBe(true)
  })

  it('login stores tokens and user, and marks the session authenticated', async () => {
    authApi.login.mockResolvedValue({
      data: {
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
        user: { id: 1, email: 'employee@assetflow.com', role: 'ROLE_EMPLOYEE', firstName: 'Jane' },
      },
    })

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    let outcome
    await act(async () => {
      outcome = await result.current.login({ email: 'employee@assetflow.com', password: 'pw' })
    })

    expect(outcome.success).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAdmin).toBe(false)
    expect(localStorage.getItem('accessToken')).toBe('access-123')
    expect(JSON.parse(localStorage.getItem('user')).email).toBe('employee@assetflow.com')
  })

  it('login failure leaves the session unauthenticated and returns the error', async () => {
    authApi.login.mockRejectedValue({ message: 'Invalid email or password' })

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    let outcome
    await act(async () => {
      outcome = await result.current.login({ email: 'nope@assetflow.com', password: 'wrong' })
    })

    expect(outcome.success).toBe(false)
    expect(outcome.error).toBe('Invalid email or password')
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('logout clears storage and resets the user even if the API call fails', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'admin@assetflow.com', role: 'ROLE_ADMIN' }))
    localStorage.setItem('accessToken', 'access-123')
    authApi.logout.mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.isAuthenticated).toBe(true)

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
  })
})
