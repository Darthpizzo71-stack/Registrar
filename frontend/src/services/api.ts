import axios, { AxiosInstance, AxiosError } from 'axios'
import { User, Meeting, AgendaItem, Minute, Attachment, Vote, PaginatedResponse } from '../types'

// Use relative URL to leverage Vite proxy, or use env var if set
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// #region agent log
// Log API_BASE_URL configuration
fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:4',message:'API_BASE_URL configured',data:{apiBaseUrl:API_BASE_URL,envVar:import.meta.env.VITE_API_URL,windowLocation:window.location.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refresh = localStorage.getItem('refresh')
            if (refresh) {
              const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                refresh,
              })
              const { access } = response.data
              localStorage.setItem('token', access)
              originalRequest.headers.Authorization = `Bearer ${access}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            localStorage.removeItem('token')
            localStorage.removeItem('refresh')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Meetings
  async getMeetings(params?: {
    status?: string
    meeting_type?: string
    date?: string
    search?: string
    ordering?: string
    page?: number
  }): Promise<PaginatedResponse<Meeting>> {
    const response = await this.client.get('/meetings/meetings/', { params })
    return response.data
  }

  async getMeeting(id: number): Promise<Meeting> {
    const response = await this.client.get(`/meetings/meetings/${id}/`)
    return response.data
  }

  async createMeeting(data: Partial<Meeting>): Promise<Meeting> {
    const response = await this.client.post('/meetings/meetings/', data)
    return response.data
  }

  async updateMeeting(id: number, data: Partial<Meeting>): Promise<Meeting> {
    const response = await this.client.patch(`/meetings/meetings/${id}/`, data)
    return response.data
  }

  async publishMeeting(id: number): Promise<Meeting> {
    const response = await this.client.post(`/meetings/meetings/${id}/publish/`)
    return response.data
  }

  // Agenda Items
  async getAgendaItems(params?: {
    meeting?: number
    section?: number
    priority?: string
    search?: string
  }): Promise<PaginatedResponse<AgendaItem>> {
    const response = await this.client.get('/meetings/items/', { params })
    return response.data
  }

  async createAgendaItem(data: Partial<AgendaItem>): Promise<AgendaItem> {
    const response = await this.client.post('/meetings/items/', data)
    return response.data
  }

  // Minutes
  async getMinutes(params?: {
    agenda_item?: number
    status?: string
    search?: string
  }): Promise<PaginatedResponse<Minute>> {
    const response = await this.client.get('/meetings/minutes/', { params })
    return response.data
  }

  async createMinute(data: Partial<Minute>): Promise<Minute> {
    const response = await this.client.post('/meetings/minutes/', data)
    return response.data
  }

  async approveMinute(id: number): Promise<Minute> {
    const response = await this.client.post(`/meetings/minutes/${id}/approve/`)
    return response.data
  }

  // Votes
  async getVotes(params?: {
    agenda_item?: number
    official?: number
    vote?: string
  }): Promise<PaginatedResponse<Vote>> {
    const response = await this.client.get('/meetings/votes/', { params })
    return response.data
  }

  async recordVote(agendaItemId: number, vote: 'yes' | 'no' | 'abstain' | 'absent', officialId: number): Promise<Vote> {
    const response = await this.client.post('/meetings/votes/', {
      agenda_item: agendaItemId,
      official: officialId,
      vote
    })
    return response.data
  }

  async getVoteSummary(agendaItemId: number): Promise<any> {
    const response = await this.client.get('/meetings/votes/summary/', {
      params: { agenda_item: agendaItemId }
    })
    return response.data
  }

  async getMeetingVotes(meetingId: number): Promise<any> {
    const response = await this.client.get('/meetings/votes/by_meeting/', {
      params: { meeting: meetingId }
    })
    return response.data
  }

  // Calendar Export
  async exportMeetingICS(meetingId: number): Promise<Blob> {
    const response = await this.client.get(`/meetings/meetings/${meetingId}/ics_export/`, {
      responseType: 'blob'
    })
    return response.data
  }

  async getDeadlineStatus(meetingId: number): Promise<any> {
    const response = await this.client.get(`/meetings/meetings/${meetingId}/deadline_status/`)
    return response.data
  }

  async getAgendaPDF(meetingId: number): Promise<Blob> {
    const response = await this.client.get(`/meetings/meetings/${meetingId}/agenda_pdf/`, {
      responseType: 'blob'
    })
    return response.data
  }

  // Attachments
  async getAttachments(params?: {
    agenda_item?: number
    file_type?: string
  }): Promise<PaginatedResponse<Attachment>> {
    const response = await this.client.get('/documents/attachments/', { params })
    return response.data
  }

  async uploadAttachment(
    file: File,
    agendaItemId: number,
    name: string,
    description?: string
  ): Promise<Attachment> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('agenda_item', agendaItemId.toString())
    formData.append('name', name)
    if (description) {
      formData.append('description', description)
    }

    const response = await this.client.post('/documents/attachments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Search
  async searchDocuments(query: string): Promise<Attachment[]> {
    const response = await this.client.get('/documents/attachments/search/', {
      params: { q: query },
    })
    return response.data
  }

  // Users
  async getUsers(): Promise<PaginatedResponse<User>> {
    const response = await this.client.get('/users/')
    return response.data
  }

  async getUser(id: number): Promise<User> {
    const response = await this.client.get(`/users/${id}/`)
    return response.data
  }

  async createUser(data: {
    username: string
    email: string
    password: string
    password_confirm: string
    first_name: string
    last_name: string
    role: string
    department?: string
    phone?: string
  }): Promise<User> {
    const response = await this.client.post('/users/', data)
    return response.data
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await this.client.patch(`/users/${id}/`, data)
    return response.data
  }

  async deleteUser(id: number): Promise<void> {
    await this.client.delete(`/users/${id}/`)
  }

  // Email Subscriptions
  async subscribeToEmails(email: string, subscriptionTypes: string[] = ['meeting_published']): Promise<any> {
    const response = await this.client.post('/meetings/email-subscriptions/subscribe/', {
      email,
      subscription_types: subscriptionTypes,
    })
    return response.data
  }

  async unsubscribeFromEmails(token?: string, email?: string): Promise<any> {
    const response = await this.client.post('/meetings/email-subscriptions/unsubscribe/', {
      token,
      email,
    })
    return response.data
  }

  // Electronic Signatures
  async createSignature(data: {
    document_type: string
    document_id: number
    signature_type: string
    signature_data?: string
    signature_image?: File
  }): Promise<any> {
    const formData = new FormData()
    formData.append('document_type', data.document_type)
    formData.append('document_id', data.document_id.toString())
    formData.append('signature_type', data.signature_type)
    if (data.signature_data) {
      formData.append('signature_data', data.signature_data)
    }
    if (data.signature_image) {
      formData.append('signature_image', data.signature_image)
    }

    const response = await this.client.post('/meetings/signatures/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async getSignaturesByDocument(documentType: string, documentId: number): Promise<any[]> {
    const response = await this.client.get('/meetings/signatures/by_document/', {
      params: {
        document_type: documentType,
        document_id: documentId,
      },
    })
    return response.data
  }

  // Analytics
  async getMeetingStats(meetingId?: number, dateFrom?: string, dateTo?: string): Promise<any> {
    const response = await this.client.get('/meetings/analytics/meeting_stats/', {
      params: {
        meeting_id: meetingId,
        date_from: dateFrom,
        date_to: dateTo,
      },
    })
    return response.data
  }

  async getVotingStats(meetingId?: number): Promise<any> {
    const response = await this.client.get('/meetings/analytics/voting_stats/', {
      params: {
        meeting_id: meetingId,
      },
    })
    return response.data
  }

  async getDocumentAccessStats(documentType?: string, documentId?: number, days?: number): Promise<any> {
    const response = await this.client.get('/meetings/analytics/document_access/', {
      params: {
        document_type: documentType,
        document_id: documentId,
        days: days || 30,
      },
    })
    return response.data
  }

  // Agenda Packet
  async downloadAgendaPacket(meetingId: number, format: 'pdf' | 'docx' = 'pdf', includeAttachments: boolean = true): Promise<Blob> {
    const response = await this.client.get(`/meetings/meetings/${meetingId}/agenda_packet/`, {
      params: {
        format,
        attachments: includeAttachments,
      },
      responseType: 'blob',
    })
    return response.data
  }

  // Send notification
  async sendMeetingNotification(meetingId: number, type: 'published' | 'updated' | 'reminder'): Promise<any> {
    const response = await this.client.post(`/meetings/meetings/${meetingId}/send_notification/`, {
      type,
    })
    return response.data
  }
}

export const apiService = new ApiService()

// Auth service
export const authService = {
  async login(username: string, password: string) {
    // #region agent log
    const loginUrl = `${API_BASE_URL}/auth/token/`;
    fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:210',message:'Login request starting',data:{url:loginUrl,apiBaseUrl:API_BASE_URL,windowOrigin:window.location.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      const response = await axios.post(loginUrl, {
        username,
        password,
      })
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:215',message:'Login request successful',data:{status:response.status,hasAccess:!!response.data?.access},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return response.data
    } catch (error: any) {
      // #region agent log
      const errorData = {
        message: error.message,
        code: error.code,
        responseStatus: error.response?.status,
        responseStatusText: error.response?.statusText,
        responseData: error.response?.data,
        requestUrl: error.config?.url,
        requestMethod: error.config?.method,
        isNetworkError: !error.response && error.request,
        isTimeout: error.code === 'ECONNABORTED',
        isConnectionRefused: error.code === 'ECONNREFUSED',
        isCorsError: error.message?.includes('CORS') || error.message?.includes('cross-origin'),
      };
      fetch('http://127.0.0.1:7242/ingest/f48bd063-02a2-4722-8b8e-64687902f213',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:216',message:'Login request failed',data:errorData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await axios.get(`${API_BASE_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
}

