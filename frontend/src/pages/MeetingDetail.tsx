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
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-2xl p-8 mb-10 shadow-medium border border-primary-100">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{meeting.title}</h1>
        <div className="space-y-2">
          <p className="text-lg text-gray-700 font-medium">
            📅 {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')} at {meeting.time}
          </p>
          <p className="text-base text-gray-600">
            📍 {meeting.location}
          </p>
        </div>
        {meeting.description && (
          <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-700 leading-relaxed">{meeting.description}</p>
          </div>
        )}
      </div>

      {meeting.sections && meeting.sections.length > 0 ? (
        <div className="space-y-6">
          {meeting.sections.map((section) => (
            <section key={section.id} className="bg-white p-6 md:p-8 rounded-xl shadow-soft border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-200">
                {section.title}
              </h2>
              {section.items && section.items.length > 0 ? (
                <div className="space-y-5">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="border-l-4 border-primary-500 pl-6 py-4 bg-primary-50/30 rounded-r-xl"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {item.number && <span className="text-primary-600">{item.number}.</span>} {item.title}
                      </h3>
                      <p className="text-gray-700 mb-3 leading-relaxed">{item.description}</p>
                      {item.department && (
                        <p className="text-sm font-medium text-primary-700 mb-3">
                          Department: {item.department}
                        </p>
                      )}
                      {item.minute && item.minute.status === 'approved' && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-2 text-primary-700">📝 Approved Minutes:</h4>
                          <p className="text-gray-700 leading-relaxed">{item.minute.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No items in this section.</p>
              )}
            </section>
          ))}
        </div>
      ) : meeting.agenda_items && meeting.agenda_items.length > 0 ? (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-soft border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-200">Agenda Items</h2>
          <div className="space-y-5">
            {meeting.agenda_items.map((item) => (
              <div
                key={item.id}
                className="border-l-4 border-primary-500 pl-6 py-4 bg-primary-50/30 rounded-r-xl"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.number && <span className="text-primary-600">{item.number}.</span>} {item.title}
                </h3>
                <p className="text-gray-700 mb-3 leading-relaxed">{item.description}</p>
                {item.department && (
                  <p className="text-sm font-medium text-primary-700">
                    Department: {item.department}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-soft border border-gray-100">
          <p className="text-lg text-gray-600">No agenda items available for this meeting.</p>
        </div>
      )}
    </div>
  )
}





