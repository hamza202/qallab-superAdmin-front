import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService, { type User, type ApiErrorResponse, type Organization } from '@/services/api/auth.service'
import type { AxiosError } from 'axios'

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'
const AUTH_ORGANIZATION_KEY = 'auth_organization'
const AUTH_ORGANIZATIONS_KEY = 'auth_organizations'
const AUTH_USER_TYPE_KEY = 'auth_user_type'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem(AUTH_TOKEN_KEY))
  const user = ref<User | null>(JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null'))
  const organization = ref<Organization | null>(JSON.parse(localStorage.getItem(AUTH_ORGANIZATION_KEY) || 'null'))
  const organizations = ref<Organization[]>(JSON.parse(localStorage.getItem(AUTH_ORGANIZATIONS_KEY) || '[]'))
  const userType = ref<string | null>(localStorage.getItem(AUTH_USER_TYPE_KEY))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userOrganization = computed(() => organization.value)
  const userOrganizations = computed(() => organizations.value)
  const organizationType = computed(() => userType.value || organization.value?.type || '')

  // Actions
  const setAuthData = (authToken: string, authUser: User) => {
    token.value = authToken
    user.value = authUser
    organization.value = authUser.organization
    organizations.value = authUser.organizations
    userType.value = authUser.organization?.type || null
    
    localStorage.setItem(AUTH_TOKEN_KEY, authToken)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser))
    localStorage.setItem(AUTH_ORGANIZATION_KEY, JSON.stringify(authUser.organization))
    localStorage.setItem(AUTH_ORGANIZATIONS_KEY, JSON.stringify(authUser.organizations))
    if (authUser.organization?.type) {
      localStorage.setItem(AUTH_USER_TYPE_KEY, authUser.organization.type)
    }
  }

  const clearAuthData = () => {
    token.value = null
    user.value = null
    organization.value = null
    organizations.value = []
    userType.value = null
    
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem(AUTH_ORGANIZATION_KEY)
    localStorage.removeItem(AUTH_ORGANIZATIONS_KEY)
    localStorage.removeItem(AUTH_USER_TYPE_KEY)
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const credentials = authService.getDefaultCredentials(email, password)
      const response = await authService.login(credentials)
      
      if (response.status === 200 && response.data) {
        setAuthData(response.data.token, response.data.user)
        return true
      }
      
      error.value = response.message || 'فشل تسجيل الدخول'
      return false
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>
      if (axiosError.response?.data?.message) {
        error.value = axiosError.response.data.message
      } else if (axiosError.response?.data?.errors) {
        const errors = Object.values(axiosError.response.data.errors).flat()
        error.value = errors.join(', ')
      } else {
        error.value = 'حدث خطأ أثناء تسجيل الدخول'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    const currentToken = token.value || localStorage.getItem(AUTH_TOKEN_KEY)
    
    if (!currentToken) {
      console.warn('No token found for logout')
      clearAuthData()
      isLoading.value = false
      return
    }
    
    try {
      await authService.logout(currentToken)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthData()
      isLoading.value = false
    }
  }

  const checkAuth = () => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
    const storedUser = localStorage.getItem(AUTH_USER_KEY)
    const storedOrganization = localStorage.getItem(AUTH_ORGANIZATION_KEY)
    const storedOrganizations = localStorage.getItem(AUTH_ORGANIZATIONS_KEY)
    const storedUserType = localStorage.getItem(AUTH_USER_TYPE_KEY)
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      organization.value = storedOrganization ? JSON.parse(storedOrganization) : null
      organizations.value = storedOrganizations ? JSON.parse(storedOrganizations) : []
      userType.value = storedUserType
      return true
    }
    
    clearAuthData()
    return false
  }

  return {
    // State
    token,
    user,
    organization,
    organizations,
    userType,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    currentUser,
    userName,
    userEmail,
    userOrganization,
    userOrganizations,
    organizationType,
    // Actions
    login,
    logout,
    checkAuth,
    clearAuthData,
  }
})