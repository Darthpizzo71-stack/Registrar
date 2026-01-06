import { useQuery } from '@tanstack/react-query'
import { apiService } from '../../services/api'
import VotingComponent from './VotingComponent'

export default function AgendaItemsManagement() {
  const { data, isLoading } = useQuery({
    queryKey: ['agenda-items-admin'],
    queryFn: () => apiService.getAgendaItems(),
  })

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Agenda Items</h2>
      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading agenda items...</p>
        </div>
      ) : data?.results && data.results.length > 0 ? (
        <div className="space-y-5">
          {data.results.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 md:p-8 rounded-xl shadow-soft border border-gray-100 hover:shadow-medium transition-all"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {item.number && <span className="text-primary-600">{item.number}.</span>} {item.title}
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">{item.description}</p>
              {item.department && (
                <p className="text-sm font-medium text-primary-700 mb-4">
                  Department: {item.department}
                </p>
              )}
              {item.requires_vote && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <VotingComponent agendaItem={item} meetingId={item.meeting} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-soft border border-gray-100">
          <p className="text-lg text-gray-600 mb-2">No agenda items found.</p>
          <p className="text-sm text-gray-500">Agenda items will appear here once they are created.</p>
        </div>
      )}
    </div>
  )
}





