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
    <div className="p-5 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-200">
      <h4 className="text-base font-bold text-gray-900 mb-4">📊 Voting</h4>
      
      {currentVote ? (
        <div className="mb-4 p-3 bg-white rounded-lg border border-primary-200">
          <p className="text-sm text-gray-700 mb-2">
            Your vote: <span className="font-bold text-primary-700 capitalize">{currentVote.vote}</span>
          </p>
          <button
            onClick={() => handleVote(currentVote.vote)}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 underline"
          >
            Change vote
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Record your vote:</p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => handleVote('yes')}
              disabled={recordVoteMutation.isPending || selectedVote === 'yes'}
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-xl hover:from-secondary-600 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              ✓ Yes
            </button>
            <button
              onClick={() => handleVote('no')}
              disabled={recordVoteMutation.isPending || selectedVote === 'no'}
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              ✗ No
            </button>
            <button
              onClick={() => handleVote('abstain')}
              disabled={recordVoteMutation.isPending || selectedVote === 'abstain'}
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-secondary-400 to-secondary-500 text-white rounded-xl hover:from-secondary-500 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              ⊘ Abstain
            </button>
            <button
              onClick={() => handleVote('absent')}
              disabled={recordVoteMutation.isPending || selectedVote === 'absent'}
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              ⊗ Absent
            </button>
          </div>
        </div>
      )}

      {voteSummary && !summaryLoading && (
        <div className="mt-4 pt-4 border-t-2 border-primary-200">
          <p className="text-sm font-bold text-gray-900 mb-3">Vote Summary:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-primary-100">
              <span className="text-sm font-bold text-secondary-600 block">Yes</span>
              <span className="text-lg font-bold text-gray-900">{voteSummary.yes}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-primary-100">
              <span className="text-sm font-bold text-accent-600 block">No</span>
              <span className="text-lg font-bold text-gray-900">{voteSummary.no}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-primary-100">
              <span className="text-sm font-bold text-secondary-500 block">Abstain</span>
              <span className="text-lg font-bold text-gray-900">{voteSummary.abstain}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-primary-100">
              <span className="text-sm font-bold text-gray-600 block">Absent</span>
              <span className="text-lg font-bold text-gray-900">{voteSummary.absent}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700 mt-3">Total votes: <span className="text-primary-700">{voteSummary.total_votes}</span></p>
        </div>
      )}
    </div>
  )
}



