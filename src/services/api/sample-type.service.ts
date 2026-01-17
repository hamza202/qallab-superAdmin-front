import api from './index'

export interface SampleType {
    id: number
    name: string
    name_ar?: string
    name_en?: string
    description: string | null
    description_ar?: string
    description_en?: string
    is_active: boolean
    created_at: string
    updated_at: string
    actions?: {
        can_update: boolean
        can_delete: boolean
        can_view: boolean
        can_change_status: boolean
    }
}

export interface SampleTypeFormData {
    'name[en]': string
    'name[ar]': string
    'description[en]'?: string
    'description[ar]'?: string
    is_active?: boolean
}

export interface SampleTypeListParams {
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

export interface SampleTypeListResponse {
    status: number
    code: number
    locale: string
    message: string
    data: SampleType[]
    pagination: PaginationMeta
    headers?: TableHeader[]
    shownHeaders?: TableHeader[]
    header_table?: string
    actions?: {
        can_create: boolean
    }
}

export interface SampleTypeShowResponse {
    status: number
    code: number
    locale: string
    message: string
    data: SampleType
}

const sampleTypeService = {
    /**
     * Get paginated list of sample types (Index)
     * GET /sample-types
     */
    async getIndex(params?: SampleTypeListParams): Promise<SampleTypeListResponse> {
        const response = await api.get<SampleTypeListResponse>('/sample-types', { params })
        return response.data
    },

    /**
     * Get list of sample types for table (List)
     * GET /sample-types/list
     */
    async getList(params?: SampleTypeListParams): Promise<SampleTypeListResponse> {
        const response = await api.get<SampleTypeListResponse>('/sample-types/list', { params })
        return response.data
    },

    /**
     * Get single sample type by ID (Show)
     * GET /sample-types/{id}
     */
    async getById(id: number): Promise<SampleTypeShowResponse> {
        const response = await api.get<SampleTypeShowResponse>(`/sample-types/${id}`)
        return response.data
    },

    /**
     * Create new sample type (Store)
     * POST /sample-types
     */
    async create(data: FormData): Promise<SampleTypeShowResponse> {
        const response = await api.post<SampleTypeShowResponse>('/sample-types', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    /**
     * Update sample type (Update)
     * POST /sample-types/{id} with _method: PUT
     */
    async update(id: number, data: FormData): Promise<SampleTypeShowResponse> {
        // إضافة _method: PUT للتعديل عبر POST
        data.append('_method', 'PUT')
        const response = await api.post<SampleTypeShowResponse>(`/sample-types/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    /**
     * Delete sample type (Delete)
     * DELETE /sample-types/{id}
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/sample-types/${id}`)
    },

    /**
     * Change sample type status (Change Status)
     * PATCH /sample-types/{id}/change-status
     */
    async changeStatus(id: number, status: boolean): Promise<SampleTypeShowResponse> {
        const response = await api.patch<SampleTypeShowResponse>(`/sample-types/${id}/change-status`, { status })
        return response.data
    },
}

export default sampleTypeService
