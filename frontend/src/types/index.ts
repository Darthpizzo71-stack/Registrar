export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'clerk' | 'staff' | 'official' | 'public' | 'it_admin'
  department?: string
  phone?: string
  mfa_enabled: boolean
  is_active: boolean
  date_joined: string
  last_login?: string
}

export interface Meeting {
  id: number
  title: string
  meeting_type: 'regular' | 'special' | 'workshop' | 'hearing' | 'emergency'
  status: 'draft' | 'published' | 'completed' | 'archived'
  date: string
  time: string
  location: string
  description?: string
  published_at?: string
  posting_deadline?: string
  posted_at?: string
  created_by: number
  created_by_name?: string
  created_at: string
  updated_at: string
  sections?: AgendaSection[]
  agenda_items?: AgendaItem[]
  item_count?: number
}

export interface AgendaSection {
  id: number
  meeting: number
  title: string
  order: number
  description?: string
  items?: AgendaItem[]
}

export interface AgendaItem {
  id: number
  meeting: number
  section?: number
  title: string
  description: string
  order: number
  number?: string
  submitted_by?: number
  submitted_by_name?: string
  department?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  is_consent: boolean
  requires_vote: boolean
  created_at: string
  updated_at: string
  minute?: Minute
  attachments?: Attachment[]
}

export interface Minute {
  id: number
  agenda_item: number
  agenda_item_title?: string
  text: string
  status: 'draft' | 'review' | 'approved'
  version: number
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  created_by: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface Attachment {
  id: number
  agenda_item?: number
  agenda_item_title?: string
  name: string
  description?: string
  file: string
  file_url?: string
  file_type: 'pdf' | 'image' | 'spreadsheet' | 'document' | 'other'
  file_size: number
  mime_type: string
  version: number
  is_current: boolean
  uploaded_by: number
  uploaded_by_name?: string
  uploaded_at: string
  updated_at: string
  public_url?: string
  is_public: boolean
}

export interface Vote {
  id: number
  agenda_item: number
  official: number
  official_name?: string
  vote: 'yes' | 'no' | 'abstain' | 'absent'
  recorded_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}





