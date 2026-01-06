import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { format } from 'date-fns'

export default function Meetings() {
  const [statusFilter, setStatusFilter] = useState<string>('published')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['meetings', statusFilter, searchQuery],
    queryFn: () =>
      apiService.getMeetings({
        status: statusFilter,
        search: searchQuery || undefined,
        ordering: '-date',
      }),
  })

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Public Meetings</h1>
        <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                Search Meetings
              </label>
              <input
                id="search"
                type="text"
                placeholder="Type to search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-300 focus:border-primary-500 transition-all"
                aria-label="Search meetings"
              />
            </div>
            <div className="sm:w-48">
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-300 focus:border-primary-500 transition-all bg-white"
                aria-label="Filter by status"
              >
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading meetings...</p>
        </div>
      ) : data?.results && data.results.length > 0 ? (
        <div className="space-y-5">
          {data.results.map((meeting) => (
            <Link
              key={meeting.id}
              to={`/meetings/${meeting.id}`}
              className="block bg-white p-6 md:p-8 rounded-xl shadow-soft hover:shadow-medium transition-all border border-gray-100 hover:border-primary-200 group transform hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors flex-1">
                      {meeting.title}
                    </h2>
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-primary-100 text-primary-700 whitespace-nowrap flex-shrink-0">
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-soft border border-gray-100">
          <p className="text-lg text-gray-600 mb-2">No meetings found.</p>
          <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}





