import React, { createContext, useContext, useReducer, useEffect } from 'react'
import Cookies from 'js-cookie'
import { AuthState, User, LoginCredentials, RegisterData } from '../types'

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

// Auth Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('auth_token')
      const userId = Cookies.get('user_id')
      
      if (!token || !userId) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      // Get user from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const user = users.find((u: User) => u.id === userId)

      if (user && user.isActive) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
      } else {
        Cookies.remove('auth_token')
        Cookies.remove('user_id')
        dispatch({ type: 'LOGIN_FAILURE' })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      Cookies.remove('auth_token')
      Cookies.remove('user_id')
      dispatch({ type: 'LOGIN_FAILURE' })
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' })

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      
      // Find user by email
      const user = users.find((u: User) => 
        u.email === credentials.email && u.isActive
      )

      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      // For demo purposes, we'll accept any password for the admin user
      // In production, you would hash and compare passwords
      if (credentials.email === 'admin@elventolero.com' || credentials.password === 'admin123') {
        // Generate a simple token
        const token = `token_${user.id}_${Date.now()}`
        
        // Update last login
        user.lastLogin = new Date().toISOString()
        const updatedUsers = users.map((u: User) => u.id === user.id ? user : u)
        localStorage.setItem('users', JSON.stringify(updatedUsers))

        // Set cookies
        Cookies.set('auth_token', token, { expires: 7 }) // 7 days
        Cookies.set('user_id', user.id, { expires: 7 })

        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
      } else {
        throw new Error('Contraseña incorrecta')
      }
    } catch (error) {
      console.error('Login failed:', error)
      dispatch({ type: 'LOGIN_FAILURE' })
      throw error
    }
  }

  const logout = () => {
    Cookies.remove('auth_token')
    Cookies.remove('user_id')
    dispatch({ type: 'LOGOUT' })
  }

  const register = async (data: RegisterData) => {
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      
      // Check if email already exists
      if (users.some((u: User) => u.email === data.email)) {
        throw new Error('El email ya está registrado')
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add to users array
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))

      console.log('✅ Usuario registrado exitosamente')
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}