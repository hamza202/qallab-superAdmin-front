import { useApi } from '@/composables/useApi'

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

export interface Actions {
    can_create: boolean;
    can_bulk_delete?: boolean;
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
  actions: Actions
}

const { get, post, delete: destroy, patch } = useApi()

const testMethodologyService = {
  async getList(params?: TestMethodologyListParams): Promise<TestMethodologyListResponse> {
    return await get<TestMethodologyListResponse>('/test-methodologies', { params })
  },

  async getById(id: number): Promise<{ data: TestMethodology }> {
    return await get<{ data: TestMethodology }>(`/test-methodologies/${id}`)
  },

  async create(data: Partial<TestMethodology>): Promise<{ data: TestMethodology }> {
    return await post<{ data: TestMethodology }>('/test-methodologies', data)
  },

  async update(id: number, data: FormData): Promise<{ data: TestMethodology }> {
    data.append('_method', 'PUT')
    return await post<{ data: TestMethodology }>(`/test-methodologies/${id}`, data)
  },

  async delete(id: number): Promise<void> {
    await destroy(`/test-methodologies/${id}`)
  },

  async changeStatus(id: number, status: boolean): Promise<{ data: TestMethodology }> {
    return await patch<{ data: TestMethodology }>(`/test-methodologies/${id}/change-status`, { status })
  },
}

export default testMethodologyService
