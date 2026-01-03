import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/api'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from token on mount
    if (token) {
      authService.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [token])

  const login = async (username: string, password: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:48',message:'AuthContext.login called',data:{username,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const response = await authService.login(username, password)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:51',message:'AuthService.login returned',data:{hasResponse:!!response,hasAccess:!!response?.access},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (!response || !response.access) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:52',message:'Invalid response from server',data:{hasResponse:!!response,hasAccess:!!response?.access},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        throw new Error('Invalid response from server')
      }
      setToken(response.access)
      localStorage.setItem('token', response.access)
      if (response.refresh) {
        localStorage.setItem('refresh', response.refresh)
      }
      const userData = await authService.getCurrentUser()
      setUser(userData)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:60',message:'Login completed successfully',data:{hasUserData:!!userData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (error: any) {
      // #region agent log
      const errorDetails = {
        errorMessage: error.message,
        errorResponseStatus: error.response?.status,
        errorResponseData: error.response?.data,
        errorCode: error.code,
        isNetworkError: !error.response && error.request,
      };
      fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:61',message:'Login error caught in AuthContext',data:errorDetails,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
      // #endregion
      // Re-throw with more context
      const message = error.response?.data?.detail || 
                     error.message || 
                     'Login failed. Please check your credentials and ensure the backend server is running.'
      throw new Error(message)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}



