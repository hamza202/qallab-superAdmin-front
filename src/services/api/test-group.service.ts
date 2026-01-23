import { useApi } from '@/composables/useApi'

export interface TestGroup {
  id: number
  name: string
  name_ar?: string
  name_en?: string
  description: string | null
  description_ar?: string
  description_en?: string
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

const { get, post, delete: destroy, patch } = useApi()

const testGroupService = {
  async getList(params?: TestGroupListParams): Promise<TestGroupListResponse> {
    return await get<TestGroupListResponse>('/test-groups/list', { params })
  },

  async getById(id: number): Promise<{ data: TestGroup }> {
    return await get<{ data: TestGroup }>(`/test-groups/${id}`)
  },

  async create(data: FormData | Partial<TestGroup>): Promise<{ data: TestGroup }> {
    return await post<{ data: TestGroup }>('/test-groups', data)
  },

  async update(id: number, data: FormData): Promise<{ data: TestGroup }> {
    // إضافة _method: PUT للتعديل عبر POST
    data.append('_method', 'PUT')
    return await post<{ data: TestGroup }>(`/test-groups/${id}`, data)
  },

  async delete(id: number): Promise<void> {
    await destroy(`/test-groups/${id}`)
  },

  async changeStatus(id: number, status: boolean): Promise<{ data: TestGroup }> {
    return await patch<{ data: TestGroup }>(`/test-groups/${id}/change-status`, { status })
  },
}

export default testGroupService
