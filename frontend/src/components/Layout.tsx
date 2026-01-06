import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-5" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/registrar-logo.png" 
                alt="Registrar Logo" 
                className="h-12 w-auto transition-transform group-hover:scale-105"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Registrar
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                to="/meetings"
                className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-lg text-base font-medium transition-colors hover:bg-primary-50"
              >
                Meetings
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-lg text-base font-medium transition-colors hover:bg-primary-50"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2.5 rounded-lg text-base font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-3 focus:ring-primary-300 focus:ring-offset-2 shadow-soft transition-all transform hover:scale-105 active:scale-95"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2.5 rounded-lg text-base font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-3 focus:ring-primary-300 focus:ring-offset-2 shadow-soft transition-all transform hover:scale-105 active:scale-95"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-10">{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Registrar - Government Meeting Management System
          </p>
        </div>
      </footer>
    </div>
  )
}


