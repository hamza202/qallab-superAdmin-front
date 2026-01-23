import { useApi } from '@/composables/useApi'

export interface SampleType {
    id: number
    name: string
    name_ar?: string
    name_en?: string
    name_translations?: {
        ar: string
        en: string
    }
    description: string | null
    description_ar?: string
    description_en?: string
    description_translations?: {
        ar: string
        en: string
    }
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

const { get, delete: destroy, patch, upload } = useApi()

const sampleTypeService = {
    /**
     * Get paginated list of sample types (Index)
     * GET /sample-types
     */
    async getIndex(params?: SampleTypeListParams): Promise<SampleTypeListResponse> {
        return await get<SampleTypeListResponse>('/sample-types', { params })
    },

    /**
     * Get list of sample types for table (List)
     * GET /sample-types/list
     */
    async getList(params?: SampleTypeListParams): Promise<SampleTypeListResponse> {
        return await get<SampleTypeListResponse>('/sample-types/list', { params })
    },

    /**
     * Get single sample type by ID (Show)
     * GET /sample-types/{id}
     */
    async getById(id: number): Promise<SampleTypeShowResponse> {
        return await get<SampleTypeShowResponse>(`/sample-types/${id}`)
    },

    /**
     * Create new sample type (Store)
     * POST /sample-types
     */
    async create(data: FormData): Promise<SampleTypeShowResponse> {
        return await upload<SampleTypeShowResponse>('/sample-types', data)
    },

    /**
     * Update sample type (Update)
     * POST /sample-types/{id} with _method: PUT
     */
    async update(id: number, data: FormData): Promise<SampleTypeShowResponse> {
        // إضافة _method: PUT للتعديل عبر POST
        data.append('_method', 'PUT')
        return await upload<SampleTypeShowResponse>(`/sample-types/${id}`, data)
    },

    /**
     * Delete sample type (Delete)
     * DELETE /sample-types/{id}
     */
    async delete(id: number): Promise<void> {
        await destroy(`/sample-types/${id}`)
    },

    /**
     * Change sample type status (Change Status)
     * PATCH /sample-types/{id}/change-status
     */
    async changeStatus(id: number, status: boolean): Promise<SampleTypeShowResponse> {
        return await patch<SampleTypeShowResponse>(`/sample-types/${id}/change-status`, { status })
    },
}

export default sampleTypeService
