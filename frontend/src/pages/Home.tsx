import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { format } from 'date-fns'

export default function Home() {
  const { data: meetingsData, isLoading } = useQuery({
    queryKey: ['upcoming-meetings'],
    queryFn: () =>
      apiService.getMeetings({
        status: 'published',
        ordering: 'date',
        page: 1,
      }),
  })

  return (
    <div>
      <section className="mb-16">
        <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-2xl p-8 md:p-12 shadow-medium border border-primary-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
            <img 
              src="/registrar-logo.png" 
              alt="Registrar Logo" 
              className="h-20 w-auto"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Welcome to <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Registrar</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl">
                Your trusted source for government meeting information. View agendas, minutes, and public records with ease.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/meetings"
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-3 focus:ring-primary-300 focus:ring-offset-2 shadow-medium transition-all transform hover:scale-105 active:scale-95 text-center"
            >
              View All Meetings
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Upcoming Meetings</h2>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading meetings...</p>
          </div>
        ) : meetingsData?.results && meetingsData.results.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {meetingsData.results.slice(0, 6).map((meeting) => (
              <Link
                key={meeting.id}
                to={`/meetings/${meeting.id}`}
                className="bg-white p-6 rounded-xl shadow-soft hover:shadow-medium transition-all border border-gray-100 hover:border-primary-200 group transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors flex-1">
                    {meeting.title}
                  </h3>
                  <span className="ml-3 px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700 whitespace-nowrap">
                    {meeting.meeting_type}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-base text-gray-700 font-medium">
                    📅 {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-base text-gray-700">
                    🕐 {meeting.time}
                  </p>
                  <p className="text-sm text-gray-600">
                    📍 {meeting.location}
                  </p>
                </div>
                {meeting.item_count !== undefined && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-primary-600">
                      {meeting.item_count} agenda {meeting.item_count === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-soft border border-gray-100">
            <p className="text-lg text-gray-600">No upcoming meetings scheduled at this time.</p>
            <p className="text-sm text-gray-500 mt-2">Check back later for new meeting announcements.</p>
          </div>
        )}
      </section>
    </div>
  )
}


