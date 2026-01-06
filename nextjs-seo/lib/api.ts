// API utility for making authenticated requests to the inspir backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://inspir.uk/api'

interface ApiOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  requiresAuth?: boolean
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = true,
  } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add auth token if required
  if (requiresAuth) {
    const token = localStorage.getItem('inspir_parent_token')
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body) {
    requestOptions.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions)

  let data: any
  try {
    data = await response.json()
  } catch (err) {
    data = null
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error || data?.message || 'API request failed',
      data
    )
  }

  return data as T
}

// Parent API endpoints
export const parentApi = {
  // Get parent profile
  getProfile: () => apiRequest('/parents/profile'),

  // Update parent profile
  updateProfile: (updates: any) =>
    apiRequest('/parents/profile', { method: 'PATCH', body: updates }),

  // Change password
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/parents/change-password', {
      method: 'POST',
      body: { current_password: currentPassword, new_password: newPassword },
    }),

  // Get dashboard data
  getDashboard: () => apiRequest('/parents/dashboard'),

  // Get subscription info
  getSubscription: () => apiRequest('/parents/subscription'),
}

// Student API endpoints
export const studentApi = {
  // Get all students for parent
  getStudents: () => apiRequest('/students'),

  // Get single student
  getStudent: (id: string) => apiRequest(`/students/${id}`),

  // Create student
  createStudent: (student: any) =>
    apiRequest('/students', { method: 'POST', body: student }),

  // Update student
  updateStudent: (id: string, updates: any) =>
    apiRequest(`/students/${id}`, { method: 'PATCH', body: updates }),

  // Delete student
  deleteStudent: (id: string) =>
    apiRequest(`/students/${id}`, { method: 'DELETE' }),

  // Reset student password
  resetPassword: (id: string) =>
    apiRequest(`/students/${id}/reset-password`, { method: 'POST' }),

  // Get student usage stats
  getUsage: (id: string) => apiRequest(`/students/${id}/usage`),

  // Get student conversations (chat history)
  getConversations: (id: string) => apiRequest(`/students/${id}/conversations`),

  // Get conversation messages
  getConversationMessages: (studentId: string, conversationId: string) =>
    apiRequest(`/students/${studentId}/conversations/${conversationId}/messages`),
}

export default apiRequest
