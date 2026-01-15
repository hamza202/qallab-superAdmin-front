import api from './index'

export interface LoginCredentials {
  login: string
  password: string
  device_name: string
  source: string
}

export interface Organization {
  id: number
  name: string
  type: string
  is_active: boolean
  user_roles?: string[]
  crusher?: {
    id: number
    name: string
  }
}

export interface User {
  id: number
  name: string
  username: string | null
  email: string
  mobile: string
  is_active: boolean
  organization: Organization
  organizations: Organization[]
}

export interface LoginResponse {
  status: number
  code: number
  locale: string
  message: string
  data: {
    user: User
    token: string
  }
}

export interface ApiErrorResponse {
  status: number
  code: number
  locale: string
  message: string
  errors?: Record<string, string[]>
}

const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Even if logout API fails, we should clear local data
      console.error('Logout API error:', error)
    }
  },

  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>('/auth/profile')
    return response.data.data
  },

  getDefaultCredentials(email: string, password: string): LoginCredentials {
    return {
      login: email,
      password: password,
      device_name: 'web',
      source: 'admin',
    }
  },
}

export default authService
