import api from './index'

export interface TestGroup {
  id: number
  name: string
  description: string | null
  parent_id: number | null
  parent_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
  actions?: {
    can_update: boolean
    can_delete: boolean
    can_view: boolean
  }
}

export interface TestGroupFormData {
  'name[en]': string
  'name[ar]': string
  'description[en]'?: string
  'description[ar]'?: string
  parent_id?: number | null
  is_active?: boolean
}

export interface TestGroupListParams {
  per_page?: number
  cursor?: string
  name?: string
  status?: string
  parent_id?: number | null
}

export interface PaginationMeta {
  path: string
  per_page: number
  next_cursor: string | null
  prev_cursor: string | null
}

export interface TableHeader {
  key: string
  title: string
  sortable?: boolean
}

export interface TestGroupListResponse {
  status: number
  code: number
  locale: string
  message: string
  data: TestGroup[]
  pagination: PaginationMeta
  headers?: TableHeader[]
  shownHeaders?: TableHeader[]
  header_table?: string
  actions?: {
    can_create: boolean
  }
}

const testGroupService = {
  async getList(params?: TestGroupListParams): Promise<TestGroupListResponse> {
    const response = await api.get<TestGroupListResponse>('/test-groups', { params })
    return response.data
  },

  async getById(id: number): Promise<{ data: TestGroup }> {
    const response = await api.get<{ data: TestGroup }>(`/test-groups/${id}`)
    return response.data
  },

  async create(data: Partial<TestGroup>): Promise<{ data: TestGroup }> {
    const response = await api.post<{ data: TestGroup }>('/test-groups', data)
    return response.data
  },

  async update(id: number, data: FormData): Promise<{ data: TestGroup }> {
    data.append('_method', 'PUT')
    const response = await api.post<{ data: TestGroup }>(`/test-groups/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/test-groups/${id}`)
  },

  async changeStatus(id: number, status: boolean): Promise<{ data: TestGroup }> {
    const response = await api.patch<{ data: TestGroup }>(`/test-groups/${id}/change-status`, { status })
    return response.data
  },
}

export default testGroupService
