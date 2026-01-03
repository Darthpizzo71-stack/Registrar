import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { AgendaItem, Vote } from '../../types'

interface VotingComponentProps {
  agendaItem: AgendaItem
  meetingId: number
}

export default function VotingComponent({ agendaItem, meetingId }: VotingComponentProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | 'abstain' | 'absent' | null>(null)

  // Get existing vote for this user
  const { data: existingVote } = useQuery({
    queryKey: ['vote', agendaItem.id, user?.id],
    queryFn: () => apiService.getVotes({ agenda_item: agendaItem.id, official: user?.id }),
    enabled: !!user && !!agendaItem.id,
  })

  // Get vote summary
  const { data: voteSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['vote-summary', agendaItem.id],
    queryFn: () => apiService.getVoteSummary(agendaItem.id),
    enabled: !!agendaItem.id && agendaItem.requires_vote,
  })

  const recordVoteMutation = useMutation({
    mutationFn: (vote: 'yes' | 'no' | 'abstain' | 'absent') =>
      apiService.recordVote(agendaItem.id, vote, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vote', agendaItem.id] })
      queryClient.invalidateQueries({ queryKey: ['vote-summary', agendaItem.id] })
      queryClient.invalidateQueries({ queryKey: ['meeting-votes', meetingId] })
      toast.success('Vote recorded successfully')
      setSelectedVote(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to record vote')
    },
  })

  const handleVote = (vote: 'yes' | 'no' | 'abstain' | 'absent') => {
    if (!user) {
      toast.error('You must be logged in to vote')
      return
    }

    if (user.role !== 'official' && user.role !== 'clerk' && user.role !== 'it_admin') {
      toast.error('Only elected officials can vote')
      return
    }

    setSelectedVote(vote)
    recordVoteMutation.mutate(vote)
  }

  if (!agendaItem.requires_vote) {
    return null
  }

  const currentVote = existingVote?.results?.[0] as Vote | undefined

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Voting</h4>
      
      {currentVote ? (
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-2">
            Your vote: <span className="font-semibold capitalize">{currentVote.vote}</span>
          </p>
          <button
            onClick={() => handleVote(currentVote.vote)}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Change vote
          </button>
        </div>
      ) : (
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-2">Record your vote:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleVote('yes')}
              disabled={recordVoteMutation.isPending || selectedVote === 'yes'}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Yes
            </button>
            <button
              onClick={() => handleVote('no')}
              disabled={recordVoteMutation.isPending || selectedVote === 'no'}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              No
            </button>
            <button
              onClick={() => handleVote('abstain')}
              disabled={recordVoteMutation.isPending || selectedVote === 'abstain'}
              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Abstain
            </button>
            <button
              onClick={() => handleVote('absent')}
              disabled={recordVoteMutation.isPending || selectedVote === 'absent'}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Absent
            </button>
          </div>
        </div>
      )}

      {voteSummary && !summaryLoading && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          <p className="text-xs font-semibold text-gray-700 mb-2">Vote Summary:</p>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-green-600 font-semibold">Yes:</span> {voteSummary.yes}
            </div>
            <div>
              <span className="text-red-600 font-semibold">No:</span> {voteSummary.no}
            </div>
            <div>
              <span className="text-yellow-600 font-semibold">Abstain:</span> {voteSummary.abstain}
            </div>
            <div>
              <span className="text-gray-600 font-semibold">Absent:</span> {voteSummary.absent}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total votes: {voteSummary.total_votes}</p>
        </div>
      )}
    </div>
  )
}

