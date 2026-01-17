import api from './index'

export interface TestMethodology {
  id: number
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TestMethodologyFormData {
  'name[en]': string
  'name[ar]': string
  'description[en]'?: string
  'description[ar]'?: string
  is_active?: boolean
}

export interface TestMethodologyListParams {
  per_page?: number
  cursor?: string
  name?: string
  status?: string
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

export interface TestMethodologyListResponse {
  status: number
  code: number
  locale: string
  message: string
  data: TestMethodology[]
  meta: PaginationMeta
  headers?: TableHeader[]
  shownHeaders?: TableHeader[]
  header_table?: string
}

const testMethodologyService = {
  async getList(params?: TestMethodologyListParams): Promise<TestMethodologyListResponse> {
    const response = await api.get<TestMethodologyListResponse>('/test-methodologies', { params })
    return response.data
  },

  async getById(id: number): Promise<{ data: TestMethodology }> {
    const response = await api.get<{ data: TestMethodology }>(`/test-methodologies/${id}`)
    return response.data
  },

  async create(data: Partial<TestMethodology>): Promise<{ data: TestMethodology }> {
    const response = await api.post<{ data: TestMethodology }>('/test-methodologies', data)
    return response.data
  },

  async update(id: number, data: FormData): Promise<{ data: TestMethodology }> {
    data.append('_method', 'PUT')
    const response = await api.post<{ data: TestMethodology }>(`/test-methodologies/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/test-methodologies/${id}`)
  },

  async changeStatus(id: number, status: boolean): Promise<{ data: TestMethodology }> {
    const response = await api.patch<{ data: TestMethodology }>(`/test-methodologies/${id}/change-status`, { status })
    return response.data
  },
}

export default testMethodologyService
