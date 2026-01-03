import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { format } from 'date-fns'

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>()
  const meetingId = id ? parseInt(id, 10) : 0

  const { data: meeting, isLoading } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => apiService.getMeeting(meetingId),
    enabled: !!meetingId,
  })

  if (isLoading) {
    return <div className="text-gray-600">Loading meeting details...</div>
  }

  if (!meeting) {
    return <div className="text-gray-600">Meeting not found.</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
        <p className="text-lg text-gray-600 mb-4">
          {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')} at {meeting.time}
        </p>
        <p className="text-gray-600">{meeting.location}</p>
        {meeting.description && (
          <p className="mt-4 text-gray-700">{meeting.description}</p>
        )}
      </div>

      {meeting.sections && meeting.sections.length > 0 ? (
        <div className="space-y-8">
          {meeting.sections.map((section) => (
            <section key={section.id} className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {section.title}
              </h2>
              {section.items && section.items.length > 0 ? (
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="border-l-4 border-primary-500 pl-4 py-2"
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {item.number && `${item.number}. `}
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      {item.department && (
                        <p className="text-sm text-gray-500">
                          Department: {item.department}
                        </p>
                      )}
                      {item.minute && item.minute.status === 'approved' && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <h4 className="font-medium text-gray-900 mb-1">Minutes:</h4>
                          <p className="text-sm text-gray-700">{item.minute.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No items in this section.</p>
              )}
            </section>
          ))}
        </div>
      ) : meeting.agenda_items && meeting.agenda_items.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agenda Items</h2>
          <div className="space-y-4">
            {meeting.agenda_items.map((item) => (
              <div
                key={item.id}
                className="border-l-4 border-primary-500 pl-4 py-2"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {item.number && `${item.number}. `}
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-2">{item.description}</p>
                {item.department && (
                  <p className="text-sm text-gray-500">
                    Department: {item.department}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No agenda items available.</p>
      )}
    </div>
  )
}





