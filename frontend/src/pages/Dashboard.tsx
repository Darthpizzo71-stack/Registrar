import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import MeetingsManagement from '../components/dashboard/MeetingsManagement'
import AgendaItemsManagement from '../components/dashboard/AgendaItemsManagement'
import MinutesManagement from '../components/dashboard/MinutesManagement'
import UserManagement from '../components/dashboard/UserManagement'

export default function Dashboard() {
  const { user } = useAuth()
  const location = useLocation()

  const canCreateAgenda = user?.role === 'clerk' || user?.role === 'it_admin'
  const canSubmitItems = user?.role === 'clerk' || user?.role === 'staff' || user?.role === 'it_admin'
  const canManageUsers = user?.role === 'clerk' || user?.role === 'it_admin'

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome, {user?.first_name} {user?.last_name}. You are logged in as{' '}
        {user?.role}.
      </p>

      <nav className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          {canCreateAgenda && (
            <Link
              to="/dashboard/meetings"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                location.pathname.includes('/dashboard/meetings')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meetings
            </Link>
          )}
          {canSubmitItems && (
            <>
              <Link
                to="/dashboard/agenda-items"
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  location.pathname.includes('/dashboard/agenda-items')
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Agenda Items
              </Link>
              <Link
                to="/dashboard/minutes"
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  location.pathname.includes('/dashboard/minutes')
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Minutes
              </Link>
            </>
          )}
          {canManageUsers && (
            <Link
              to="/dashboard/users"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                location.pathname.includes('/dashboard/users')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </Link>
          )}
        </div>
      </nav>

      <Routes>
        {canCreateAgenda && (
          <Route path="meetings" element={<MeetingsManagement />} />
        )}
        {canSubmitItems && (
          <>
            <Route path="agenda-items" element={<AgendaItemsManagement />} />
            <Route path="minutes" element={<MinutesManagement />} />
          </>
        )}
        {canManageUsers && (
          <Route path="users" element={<UserManagement />} />
        )}
        <Route
          path="*"
          element={
            <div className="text-center py-12">
              <p className="text-gray-600">Select a section from the navigation above.</p>
            </div>
          }
        />
      </Routes>
    </div>
  )
}



