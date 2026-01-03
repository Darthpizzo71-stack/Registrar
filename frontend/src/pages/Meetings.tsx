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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Meetings</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Search meetings"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Filter by status"
          >
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-600">Loading meetings...</div>
      ) : data?.results && data.results.length > 0 ? (
        <div className="space-y-4">
          {data.results.map((meeting) => (
            <Link
              key={meeting.id}
              to={`/meetings/${meeting.id}`}
              className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {meeting.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">
                    {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')} at{' '}
                    {meeting.time}
                  </p>
                  <p className="text-sm text-gray-500">{meeting.location}</p>
                  {meeting.item_count !== undefined && (
                    <p className="text-xs text-gray-400 mt-2">
                      {meeting.item_count} agenda items
                    </p>
                  )}
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                  {meeting.meeting_type}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No meetings found.</p>
      )}
    </div>
  )
}





