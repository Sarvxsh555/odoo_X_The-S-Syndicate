import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../api/services'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (credentials) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(credentials)
      const { accessToken, refreshToken, user: userData } = response.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      toast.success(`Welcome back, ${userData.firstName}!`)
      return { success: true }
    } catch (error) {
      const message = error?.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(async (data) => {
    setIsLoading(true)
    try {
      const response = await authApi.signup(data)
      const { accessToken, refreshToken, user: userData } = response.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      toast.success('Account created successfully!')
      return { success: true }
    } catch (error) {
      const message = error?.message || 'Signup failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {}
    localStorage.clear()
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, isAdmin, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
