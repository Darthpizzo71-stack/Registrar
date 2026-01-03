import { useQuery } from '@tanstack/react-query'
import { apiService } from '../../services/api'

export default function AgendaItemsManagement() {
  const { data, isLoading } = useQuery({
    queryKey: ['agenda-items-admin'],
    queryFn: () => apiService.getAgendaItems(),
  })

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Agenda Items</h2>
      {isLoading ? (
        <div className="text-gray-600">Loading agenda items...</div>
      ) : data?.results && data.results.length > 0 ? (
        <div className="space-y-4">
          {data.results.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.number && `${item.number}. `}
                {item.title}
              </h3>
              <p className="text-gray-600 mb-2">{item.description}</p>
              {item.department && (
                <p className="text-sm text-gray-500">Department: {item.department}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No agenda items found.</p>
      )}
    </div>
  )
}





