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
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src="/registrar-logo.png" 
            alt="Registrar Logo" 
            className="h-16 w-auto"
          />
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to Registrar
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-8">
          Government Meeting Management System - View agendas, minutes, and public records
        </p>
        <div className="flex gap-4">
          <Link
            to="/meetings"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            View All Meetings
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Meetings</h2>
        {isLoading ? (
          <div className="text-gray-600">Loading meetings...</div>
        ) : meetingsData?.results && meetingsData.results.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {meetingsData.results.slice(0, 6).map((meeting) => (
              <Link
                key={meeting.id}
                to={`/meetings/${meeting.id}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {meeting.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {format(new Date(meeting.date), 'MMMM d, yyyy')} at{' '}
                  {meeting.time}
                </p>
                <p className="text-sm text-gray-500">{meeting.location}</p>
                {meeting.item_count !== undefined && (
                  <p className="text-xs text-gray-400 mt-2">
                    {meeting.item_count} agenda items
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No upcoming meetings scheduled.</p>
        )}
      </section>
    </div>
  )
}


