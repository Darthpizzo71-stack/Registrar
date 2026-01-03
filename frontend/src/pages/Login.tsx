import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.tsx:13',message:'Login form submitted',data:{username,windowLocation:window.location.href,windowOrigin:window.location.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    try {
      await login(username, password)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.tsx:19',message:'Login succeeded in handleSubmit',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error: any) {
      // #region agent log
      const errorInfo = {
        errorMessage: error.message,
        errorResponseStatus: error.response?.status,
        errorResponseData: error.response?.data,
        errorCode: error.code,
        errorStack: error.stack,
        isNetworkError: !error.response && error.request,
      };
      fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.tsx:21',message:'Login error in handleSubmit',data:errorInfo,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
      // #endregion
      const errorMessage = error.message || 
                          error.response?.data?.detail || 
                          error.response?.data?.non_field_errors?.[0] ||
                          'Login failed. Please check your credentials and ensure the backend server is running.'
      toast.error(errorMessage)
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-required="true"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}



