import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../../services/api'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import MeetingDeadlineStatus from './MeetingDeadlineStatus'
import { VideoPlayer } from './VideoPlayer'

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

  const downloadPacketMutation = useMutation({
    mutationFn: async ({ meetingId, format }: { meetingId: number; format: 'pdf' | 'docx' }) => {
      const blob = await apiService.downloadAgendaPacket(meetingId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `agenda_packet_${meetingId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
    onSuccess: () => {
      toast.success('Agenda packet downloaded')
    },
    onError: () => {
      toast.error('Failed to download agenda packet')
    },
  })

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ meetingId, type }: { meetingId: number; type: 'published' | 'updated' | 'reminder' }) => {
      await apiService.sendMeetingNotification(meetingId, type)
    },
    onSuccess: () => {
      toast.success('Notification sent successfully')
    },
    onError: () => {
      toast.error('Failed to send notification')
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Manage Meetings</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-3 focus:ring-primary-300 focus:ring-offset-2 shadow-medium transition-all transform hover:scale-105 active:scale-95"
        >
          {showCreateForm ? '✕ Cancel' : '+ Create Meeting'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-8 rounded-xl shadow-soft border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Meeting</h3>
          <p className="text-gray-600">Meeting creation form will be implemented here.</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading meetings...</p>
        </div>
      ) : data?.results && data.results.length > 0 ? (
        <div className="space-y-5">
          {data.results.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white p-6 md:p-8 rounded-xl shadow-soft border border-gray-100 hover:shadow-medium transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 flex-1">
                      {meeting.title}
                    </h3>
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-primary-100 text-primary-700 whitespace-nowrap">
                      {meeting.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-base text-gray-700 font-medium">
                      📅 {format(new Date(meeting.date), 'MMMM d, yyyy')} at {meeting.time}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {meeting.location}
                    </p>
                  </div>
                  <MeetingDeadlineStatus meetingId={meeting.id} />
                </div>
                <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
                  {meeting.status === 'draft' && (
                    <button
                      onClick={() => publishMutation.mutate(meeting.id)}
                      className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-secondary-600 hover:to-secondary-700 focus:outline-none focus:ring-3 focus:ring-secondary-300 focus:ring-offset-2 shadow-soft transition-all transform hover:scale-105 active:scale-95"
                    >
                      ✓ Publish
                    </button>
                  )}
                  <button
                    onClick={() => exportICSMutation.mutate(meeting.id)}
                    disabled={exportICSMutation.isPending}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-3 focus:ring-primary-300 focus:ring-offset-2 shadow-soft transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {exportICSMutation.isPending ? '⏳ Exporting...' : '📅 Export Calendar'}
                  </button>
                  <button
                    onClick={() => downloadPacketMutation.mutate({ meetingId: meeting.id, format: 'pdf' })}
                    disabled={downloadPacketMutation.isPending}
                    className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-accent-600 hover:to-accent-700 focus:outline-none focus:ring-3 focus:ring-accent-300 focus:ring-offset-2 shadow-soft transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    📄 PDF Packet
                  </button>
                  <button
                    onClick={() => downloadPacketMutation.mutate({ meetingId: meeting.id, format: 'docx' })}
                    disabled={downloadPacketMutation.isPending}
                    className="bg-gradient-to-r from-secondary-400 to-secondary-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-secondary-500 hover:to-secondary-600 focus:outline-none focus:ring-3 focus:ring-secondary-300 focus:ring-offset-2 shadow-soft transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    📝 DOCX Packet
                  </button>
                  {meeting.status === 'published' && (
                    <button
                      onClick={() => sendNotificationMutation.mutate({ meetingId: meeting.id, type: 'published' })}
                      disabled={sendNotificationMutation.isPending}
                      className="bg-gradient-to-r from-accent-400 to-accent-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-accent-500 hover:to-accent-600 focus:outline-none focus:ring-3 focus:ring-accent-300 focus:ring-offset-2 shadow-soft transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      📧 Notify
                    </button>
                  )}
                </div>
              </div>
              {(meeting.video_url || meeting.video_embed_code) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <VideoPlayer meeting={meeting} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-soft border border-gray-100">
          <p className="text-lg text-gray-600 mb-2">No meetings found.</p>
          <p className="text-sm text-gray-500">Create a new meeting to get started.</p>
        </div>
      )}
    </div>
  )
}





