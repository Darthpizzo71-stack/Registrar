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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Dashboard</h1>
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
          <p className="text-lg text-gray-700">
            Welcome back, <span className="font-semibold text-primary-700">{user?.first_name} {user?.last_name}</span>!
          </p>
          <p className="text-sm text-gray-600 mt-1">
            You are logged in as <span className="font-medium text-primary-600">{user?.role?.replace('_', ' ')}</span>
          </p>
        </div>
      </div>

      <nav className="mb-8 bg-white rounded-xl shadow-soft border border-gray-100 p-2">
        <div className="flex flex-wrap gap-2">
          {canCreateAgenda && (
            <Link
              to="/dashboard/meetings"
              className={`px-6 py-3 rounded-lg font-semibold text-base transition-all ${
                location.pathname.includes('/dashboard/meetings')
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-medium'
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              📅 Meetings
            </Link>
          )}
          {canSubmitItems && (
            <>
              <Link
                to="/dashboard/agenda-items"
                className={`px-6 py-3 rounded-lg font-semibold text-base transition-all ${
                  location.pathname.includes('/dashboard/agenda-items')
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-medium'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                📋 Agenda Items
              </Link>
              <Link
                to="/dashboard/minutes"
                className={`px-6 py-3 rounded-lg font-semibold text-base transition-all ${
                  location.pathname.includes('/dashboard/minutes')
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-medium'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                📝 Minutes
              </Link>
            </>
          )}
          {canManageUsers && (
            <Link
              to="/dashboard/users"
              className={`px-6 py-3 rounded-lg font-semibold text-base transition-all ${
                location.pathname.includes('/dashboard/users')
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-medium'
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              👥 Users
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
            <div className="bg-white rounded-xl p-12 text-center shadow-soft border border-gray-100">
              <p className="text-lg text-gray-600 mb-2">Select a section from the navigation above to get started.</p>
              <p className="text-sm text-gray-500">Choose from Meetings, Agenda Items, Minutes, or Users.</p>
            </div>
          }
        />
      </Routes>
    </div>
  )
}



