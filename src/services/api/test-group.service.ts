import api from './index'

export interface TestGroup {
  id: number
  name: string
  name_en?: string
  name_ar?: string
  description?: string
  description_en?: string
  description_ar?: string
  parent_id?: number | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface TestGroupFormData {
  'name[en]': string
  'name[ar]': string
  'description[en]'?: string
  'description[ar]'?: string
  is_active?: boolean
  parent_id?: number | null
}

export interface TestGroupListParams {
  name?: string
  status?: string
  ignore_id?: number
}

export interface PaginationMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

export interface TestGroupListResponse {
  status: number
  code: number
  locale: string
  message: string
  data: TestGroup[]
  meta: PaginationMeta
}

const testGroupService = {
  async getList(params?: TestGroupListParams): Promise<TestGroupListResponse> {
    const response = await api.get<TestGroupListResponse>('/test-groups/list', { params })
    return response.data
  },

  async getById(id: number): Promise<{ data: TestGroup }> {
    const response = await api.get<{ data: TestGroup }>(`/test-groups/${id}`)
    return response.data
  },

  async create(data: FormData): Promise<{ data: TestGroup }> {
    const response = await api.post<{ data: TestGroup }>('/test-groups', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async update(id: number, data: FormData): Promise<{ data: TestGroup }> {
    data.append('_method', 'PUT')
    const response = await api.post<{ data: TestGroup }>(`/test-groups/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/test-groups/${id}`)
  },
}

export default testGroupService
