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
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-large border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-base font-semibold text-gray-700 mb-3">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-5 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-300 focus:border-primary-500 transition-all"
              placeholder="Enter your username"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-3">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-300 focus:border-primary-500 transition-all"
              placeholder="Enter your password"
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-3 focus:ring-primary-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                Logging in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}



