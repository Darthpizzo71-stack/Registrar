import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../../services/api'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import MeetingDeadlineStatus from './MeetingDeadlineStatus'

export default function MeetingsManagement() {
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['meetings-admin'],
    queryFn: () => apiService.getMeetings({ ordering: '-date' }),
  })

  const publishMutation = useMutation({
    mutationFn: (id: number) => apiService.publishMeeting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings-admin'] })
      queryClient.invalidateQueries({ queryKey: ['deadline-status'] })
      toast.success('Meeting published successfully')
    },
    onError: () => {
      toast.error('Failed to publish meeting')
    },
  })

  const exportICSMutation = useMutation({
    mutationFn: async (meetingId: number) => {
      const blob = await apiService.exportMeetingICS(meetingId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meeting_${meetingId}.ics`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
    onSuccess: () => {
      toast.success('Calendar file downloaded')
    },
    onError: () => {
      toast.error('Failed to export calendar')
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Meetings</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {showCreateForm ? 'Cancel' : 'Create Meeting'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Meeting</h3>
          <p className="text-gray-600">Meeting creation form will be implemented here.</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-600">Loading meetings...</div>
      ) : data?.results && data.results.length > 0 ? (
        <div className="space-y-4">
          {data.results.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {meeting.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {format(new Date(meeting.date), 'MMMM d, yyyy')} at {meeting.time}
                  </p>
                  <p className="text-sm text-gray-500">{meeting.location}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {meeting.status}
                  </span>
                  <MeetingDeadlineStatus meetingId={meeting.id} />
                </div>
                <div className="flex gap-2 flex-col sm:flex-row">
                  {meeting.status === 'draft' && (
                    <button
                      onClick={() => publishMutation.mutate(meeting.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => exportICSMutation.mutate(meeting.id)}
                    disabled={exportICSMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {exportICSMutation.isPending ? 'Exporting...' : '📅 Export Calendar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No meetings found.</p>
      )}
    </div>
  )
}





