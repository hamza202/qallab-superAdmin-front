import api from './index'
import axios from 'axios'

// Base URL للـ login فقط (بدون /admin)
const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/admin$/, '') || 'https://api-dev.qallab.sa/api'

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
    // استخدام AUTH_BASE_URL للـ login فقط (بدون /admin)
    const response = await axios.post<LoginResponse>(`${AUTH_BASE_URL}/auth/login`, credentials)
    return response.data
  },

  async logout(token: string | null): Promise<void> {
    try {
      if (!token) {
        console.warn('No token provided for logout')
        return
      }
      
      await axios.request({
        method: 'GET',
        url: `${AUTH_BASE_URL}/auth/logout`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
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
