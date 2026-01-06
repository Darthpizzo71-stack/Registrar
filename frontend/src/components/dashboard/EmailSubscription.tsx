import React, { useState } from 'react'
import { apiService } from '../../services/api'

export const EmailSubscription: React.FC = () => {
  const [email, setEmail] = useState('')
  const [subscriptionTypes, setSubscriptionTypes] = useState<string[]>(['meeting_published'])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await apiService.subscribeToEmails(email, subscriptionTypes)
      setMessage({ type: 'success', text: 'Successfully subscribed to email notifications!' })
      setEmail('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to subscribe. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSubscriptionType = (type: string) => {
    setSubscriptionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Email Notifications</h2>
      <p className="text-gray-600 mb-4">
        Subscribe to receive email notifications about meetings and agendas.
      </p>

      <form onSubmit={handleSubscribe} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Types
          </label>
          <div className="space-y-2">
            {[
              { value: 'meeting_published', label: 'Meeting Published' },
              { value: 'agenda_updated', label: 'Agenda Updated' },
              { value: 'minutes_approved', label: 'Minutes Approved' },
            ].map((type) => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={subscriptionTypes.includes(type.value)}
                  onChange={() => toggleSubscriptionType(type.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {message && (
          <div
            className={`px-4 py-3 rounded ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  )
}



