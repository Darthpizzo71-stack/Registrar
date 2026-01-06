import { useQuery } from '@tanstack/react-query'
import { apiService } from '../../services/api'
import { format } from 'date-fns'

interface MeetingDeadlineStatusProps {
  meetingId: number
}

export default function MeetingDeadlineStatus({ meetingId }: MeetingDeadlineStatusProps) {
  const { data: deadlineStatus, isLoading } = useQuery({
    queryKey: ['deadline-status', meetingId],
    queryFn: () => apiService.getDeadlineStatus(meetingId),
    enabled: !!meetingId,
  })

  if (isLoading || !deadlineStatus) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met':
        return 'bg-green-100 text-green-800'
      case 'missed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'met':
        return 'Deadline Met'
      case 'missed':
        return 'Deadline Missed'
      case 'pending':
        return 'Deadline Pending'
      default:
        return 'No Deadline'
    }
  }

  if (!deadlineStatus.posting_deadline) {
    return null
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deadlineStatus.status)}`}>
          {getStatusText(deadlineStatus.status)}
        </span>
        {deadlineStatus.posting_deadline && (
          <span className="text-xs text-gray-500">
            Deadline: {format(new Date(deadlineStatus.posting_deadline), 'MMM d, yyyy h:mm a')}
          </span>
        )}
      </div>
      {deadlineStatus.posted_at && (
        <span className="text-xs text-gray-500 mt-1 block">
          Posted: {format(new Date(deadlineStatus.posted_at), 'MMM d, yyyy h:mm a')}
        </span>
      )}
    </div>
  )
}



