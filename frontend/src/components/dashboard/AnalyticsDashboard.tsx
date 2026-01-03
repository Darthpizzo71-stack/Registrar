import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

export const AnalyticsDashboard: React.FC = () => {
  const [meetingStats, setMeetingStats] = useState<any>(null)
  const [votingStats, setVotingStats] = useState<any>(null)
  const [documentStats, setDocumentStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | undefined>()

  useEffect(() => {
    loadAnalytics()
  }, [selectedMeetingId])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [meetingData, votingData, docData] = await Promise.all([
        apiService.getMeetingStats(selectedMeetingId),
        apiService.getVotingStats(selectedMeetingId),
        apiService.getDocumentAccessStats(),
      ])
      setMeetingStats(meetingData)
      setVotingStats(votingData)
      setDocumentStats(docData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      {/* Meeting Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Meeting Statistics</h3>
        {meetingStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-gray-600">Total Meetings</div>
              <div className="text-2xl font-bold text-blue-600">{meetingStats.total_meetings}</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-gray-600">Published</div>
              <div className="text-2xl font-bold text-green-600">
                {meetingStats.published_meetings}
              </div>
            </div>
            {meetingStats.attendance && (
              <div className="bg-purple-50 p-4 rounded">
                <div className="text-sm text-gray-600">Total Attendance</div>
                <div className="text-2xl font-bold text-purple-600">
                  {meetingStats.attendance.total}
                </div>
              </div>
            )}
          </div>
        )}

        {meetingStats?.by_type && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Meetings by Type</h4>
            <div className="space-y-2">
              {Object.entries(meetingStats.by_type).map(([type, count]: [string, any]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Voting Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Voting Statistics</h3>
        {votingStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded text-center">
              <div className="text-sm text-gray-600">Yes</div>
              <div className="text-2xl font-bold text-green-600">{votingStats.by_vote?.yes || 0}</div>
            </div>
            <div className="bg-red-50 p-4 rounded text-center">
              <div className="text-sm text-gray-600">No</div>
              <div className="text-2xl font-bold text-red-600">{votingStats.by_vote?.no || 0}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded text-center">
              <div className="text-sm text-gray-600">Abstain</div>
              <div className="text-2xl font-bold text-yellow-600">
                {votingStats.by_vote?.abstain || 0}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded text-center">
              <div className="text-sm text-gray-600">Absent</div>
              <div className="text-2xl font-bold text-gray-600">
                {votingStats.by_vote?.absent || 0}
              </div>
            </div>
          </div>
        )}

        {votingStats?.top_voters && votingStats.top_voters.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Top Voters</h4>
            <div className="space-y-2">
              {votingStats.top_voters.map((voter: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">
                    {voter.official__first_name} {voter.official__last_name}
                  </span>
                  <span className="font-semibold">{voter.vote_count} votes</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Access Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Document Access (Last 30 Days)</h3>
        {documentStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-gray-600">Total Accesses</div>
              <div className="text-2xl font-bold text-blue-600">
                {documentStats.total_accesses}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-gray-600">Views</div>
              <div className="text-2xl font-bold text-green-600">
                {documentStats.by_type?.view || 0}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-sm text-gray-600">Downloads</div>
              <div className="text-2xl font-bold text-purple-600">
                {documentStats.by_type?.download || 0}
              </div>
            </div>
          </div>
        )}

        {documentStats?.by_document_type && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Access by Document Type</h4>
            <div className="space-y-2">
              {Object.entries(documentStats.by_document_type).map(([type, count]: [string, any]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{type}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

