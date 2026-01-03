import { useQuery } from '@tanstack/react-query'
import { apiService } from '../../services/api'

export default function MinutesManagement() {
  const { data, isLoading } = useQuery({
    queryKey: ['minutes-admin'],
    queryFn: () => apiService.getMinutes(),
  })

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Minutes</h2>
      {isLoading ? (
        <div className="text-gray-600">Loading minutes...</div>
      ) : data?.results && data.results.length > 0 ? (
        <div className="space-y-4">
          {data.results.map((minute) => (
            <div
              key={minute.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {minute.agenda_item_title}
              </h3>
              <p className="text-gray-600 mb-2">{minute.text}</p>
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                {minute.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No minutes found.</p>
      )}
    </div>
  )
}





