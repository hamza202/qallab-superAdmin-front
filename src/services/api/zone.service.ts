import { useApi } from '@/composables/useApi'

export interface Zone {
    id: number
    geographical_zone: string
    geographical_zone_id: number
    city: string
    city_id: number
    is_active: boolean
    actions?: {
        can_update: boolean
        can_delete: boolean
        can_view: boolean
        can_change_status: boolean
    }
}

export interface ZoneListResponse {
    status: number
    code: number
    locale: string
    message: string
    data: Zone[]
}

export interface ZoneShowResponse {
    status: number
    code: number
    locale: string
    message: string
    data: Zone
}

export interface ListItem {
    id: number
    name: string
}

export interface ListResponse {
    status: number
    code: number
    locale: string
    message: string
    data: ListItem[]
}

const { get, post, upload, delete: destroy, patch } = useApi()

const zoneService = {
    async create(data: { geographical_zone_id: number; city_id: number; is_active: boolean }): Promise<ZoneShowResponse> {
        return await post<ZoneShowResponse>('/zones', data)
    },

    async update(id: number, data: FormData): Promise<ZoneShowResponse> {
        data.append('_method', 'PUT')
        return await upload<ZoneShowResponse>(`/zones/${id}`, data)
    },

    async getById(id: number): Promise<ZoneShowResponse> {
        return await get<ZoneShowResponse>(`/zones/${id}`)
    },

    async delete(id: number): Promise<void> {
        await destroy(`/zones/${id}`)
    },

    async getGeographicalZones(): Promise<ListResponse> {
        return await get<ListResponse>('/geographical-zones/list')
    },

    async getCities(): Promise<ListResponse> {
        return await get<ListResponse>('/cities/list')
    },
}

export default zoneService
