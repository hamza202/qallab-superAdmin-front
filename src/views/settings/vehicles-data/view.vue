<template>
    <default-layout>
        <div class="vehicle-view-page -mx-6" :dir="pageDir">
            <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
                <v-progress-circular indeterminate color="primary" size="64" />
            </div>

            <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] px-6">
                <v-icon size="64" class="text-red-500 mb-4">mdi-alert-circle-outline</v-icon>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('common.ui.dataLoadError') }}</h3>
                <p class="text-gray-600 mb-4">{{ error }}</p>
                <ButtonWithIcon color="primary" :label="t('common.ui.retry')" @click="fetchVehicle" />
            </div>

            <div v-else-if="vehicle">
                <!-- Breadcrumb: Home / Logistics companies / Vehicle data / current type -->
                <nav class="flex flex-wrap items-center gap-3 mb-6 text-sm px-6" aria-label="Breadcrumb">
                    <router-link to="/" class="text-gray-500 hover:text-primary-600 shrink-0">
                        <span v-html="homeIcon"></span>
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-gray-600">
                        {{ t('breadcrumb.settings.root') }}
                    </span>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link :to="{ name: 'VehiclesDataList' }" class="text-gray-600 hover:text-primary-600">
                        {{ t('pages.vehiclesData.title') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">
                        {{ vehicle.vehicle_type_label || vehicle.vehicle_type || '—' }}
                    </span>
                </nav>

                <!-- Page header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                            <span v-html="icon" class="text-primary-600"></span>
                        </div>
                        <div>
                            <h1 class="text-lg font-bold text-gray-900 mb-1">
                                {{ vehicle.vehicle_type_label || vehicle.vehicle_type || '—' }}
                            </h1>
                            <p class="text-sm text-gray-600">
                                {{ vehicle.vehicle_category_label || vehicle.vehicle_category || '—' }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="p-6 bg-white">
                    <h2 class="text-xl font-bold text-primary-900 pb-4">
                        {{ t('pages.vehiclesData.view.vehicleDataSection') }}
                    </h2>

                    <!-- Row 1 -->
                    <div class="flex flex-wrap gap-0 mb-0">
                        <ViewField :label="t('pages.vehiclesData.view.fields.vehicleNumber')"
                            :value="vehicle.vehicle_number" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.plateNumber')"
                            :value="vehicle.plate_number" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.vehicleType')"
                            :value="vehicle.vehicle_type_label || vehicle.vehicle_type" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.vehicleCategory')"
                            :value="vehicle.vehicle_category_label || vehicle.vehicle_category" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.cargoType')"
                            :value="vehicle.cargo_type_label || vehicle.cargo_type" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.manufacturer')"
                            :value="vehicle.manufacturer?.name || '—'" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.manufacturingYear')"
                            :value="formatYear(vehicle.manufacturing_year)" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.cargoCapacity')"
                            :value="formatCapacity(vehicle.cargo_capacity)" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.fuelType')"
                            :value="vehicle.fuel_type_label || vehicle.fuel_type" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.operationalReadiness')"
                            :value="vehicle.operational_readiness_label || vehicle.operational_readiness"
                            :value-class="operationalSuccessClass(vehicle)" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.gpsTracking')"
                            :value="vehicle.gps_tracking_label || vehicle.gps_tracking"
                            :value-class="gpsSuccessClass(vehicle)" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />

                        <ViewField :label="t('pages.vehiclesData.view.fields.vehicleOwnership')"
                            :value="vehicle.vehicle_ownership_label || vehicle.vehicle_ownership" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.lastMaintenanceDate')"
                            :value="formatDate(vehicle.last_maintenance_date)" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.insuranceStatus')"
                            :value="vehicle.insurance_status_label || vehicle.insurance_status"
                            :value-class="insuranceSuccessClass(vehicle)" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.drivingLicense')"
                            :value="vehicle.driving_license_number?.trim() ? vehicle.driving_license_number : '—'"
                            :value-class="vehicle.driving_license_number?.trim() ? 'text-green-600 font-semibold' : ''" />
                        <v-divider vertical class="hidden sm:block my-4 border-gray-200" />
                        <ViewField :label="t('pages.vehiclesData.view.fields.status')"
                            :value="vehicle.is_active ? t('common.status.active') : t('common.status.inactive')"
                            :value-class="vehicle.is_active ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'" />
                        <v-divider vertical class="hidden md:block my-4 border-gray-200" />
                        <div class="info-item-bordered flex-1 min-w-[200px] px-4 py-3 md:flex-[2]">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">
                                {{ t('pages.vehiclesData.view.fields.notes') }}
                            </label>
                            <p class="text-base text-gray-900 whitespace-pre-wrap break-words">
                                {{ vehicle.notes?.trim() ? vehicle.notes : '—' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </default-layout>
</template>

<script setup lang="ts">
import { defineComponent, h, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const { t, locale } = useI18n()
const pageDir = computed(() => (String(locale.value).toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'))

const ViewField = defineComponent({
    name: 'VehicleViewField',
    props: {
        label: { type: String, required: true },
        value: { type: [String, Number], default: undefined },
        valueClass: { type: String, default: '' },
    },
    setup(props) {
        return () =>
            h('div', { class: 'info-item-bordered flex-1 min-w-[160px] px-4 py-3' }, [
                h('label', { class: 'font-semibold text-sm text-gray-500 mb-2 block' }, props.label),
                h(
                    'p',
                    { class: ['text-base font-semibold', props.valueClass || 'text-gray-900'] },
                    props.value === null || props.value === undefined || props.value === ''
                        ? '—'
                        : String(props.value)
                ),
            ])
    },
})

interface VehicleDetail {
    id: number
    vehicle_number: string
    plate_number: string
    vehicle_type: string
    vehicle_type_label?: string
    vehicle_category: string
    vehicle_category_label?: string
    cargo_type: string
    cargo_type_label?: string
    manufacturer_id?: number
    manufacturing_year: number | string
    cargo_capacity: string | number
    fuel_type: string
    fuel_type_label?: string
    gps_tracking: string
    gps_tracking_label?: string
    operational_readiness: string
    operational_readiness_label?: string
    vehicle_ownership: string
    vehicle_ownership_label?: string
    last_maintenance_date: string
    insurance_status: string
    insurance_status_label?: string
    driving_license_number: string
    notes: string | null
    is_active: boolean
    manufacturer?: { id: number; name: string }
}

const route = useRoute()
const api = useApi()

const loading = ref(false)
const error = ref<string | null>(null)
const vehicle = ref<VehicleDetail | null>(null)

const icon = `<svg width="48" height="43" viewBox="0 0 48 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M38.8333 17.1667V8.93333C38.8333 6.50644 38.8333 5.29299 38.361 4.36604C37.9456 3.55067 37.2827 2.88776 36.4673 2.47231C35.5403 2 34.3269 2 31.9 2H15.4333C13.0064 2 11.793 2 10.866 2.47231C10.0507 2.88776 9.38776 3.55067 8.9723 4.36604C8.5 5.29299 8.5 6.50644 8.5 8.93333V17.1667M8.5 15H2V12.8333M38.8333 15H45.3333V12.8333M10.6667 24.75H10.6883M36.6667 24.75H36.6883M12.4 17.1667H34.9333C38.5737 17.1667 40.3938 17.1667 41.7843 17.8751C43.0073 18.4983 44.0017 19.4927 44.6249 20.7157C45.3333 22.1062 45.3333 23.9263 45.3333 27.5667V34.5C45.3333 36.5191 45.3333 37.5286 45.0035 38.325C44.5637 39.3867 43.7201 40.2303 42.6583 40.6701C41.862 41 40.8524 41 38.8333 41H37.5333C36.7282 41 36.3256 41 35.9888 40.9466C34.1346 40.653 32.6804 39.1988 32.3867 37.3446C32.3333 37.0077 32.3333 36.6051 32.3333 35.8C32.3333 35.5987 32.3333 35.4981 32.32 35.4139C32.2466 34.9503 31.883 34.5868 31.4195 34.5133C31.3353 34.5 31.2346 34.5 31.0333 34.5H16.3C16.0987 34.5 15.9981 34.5 15.9139 34.5133C15.4503 34.5868 15.0868 34.9503 15.0133 35.4139C15 35.4981 15 35.5987 15 35.8C15 36.6051 15 37.0077 14.9466 37.3446C14.653 39.1988 13.1987 40.653 11.3445 40.9466C11.0077 41 10.6051 41 9.8 41H8.5C6.48092 41 5.47138 41 4.67504 40.6701C3.61325 40.2303 2.76966 39.3867 2.32986 38.325C2 37.5286 2 36.5191 2 34.5V27.5667C2 23.9263 2 22.1062 2.70846 20.7157C3.33163 19.4927 4.32601 18.4983 5.54906 17.8751C6.93949 17.1667 8.75966 17.1667 12.4 17.1667ZM11.75 24.75C11.75 25.3483 11.265 25.8333 10.6667 25.8333C10.0684 25.8333 9.58333 25.3483 9.58333 24.75C9.58333 24.1517 10.0684 23.6667 10.6667 23.6667C11.265 23.6667 11.75 24.1517 11.75 24.75ZM37.75 24.75C37.75 25.3483 37.265 25.8333 36.6667 25.8333C36.0684 25.8333 35.5833 25.3483 35.5833 24.75C35.5833 24.1517 36.0684 23.6667 36.6667 23.6667C37.265 23.6667 37.75 24.1517 37.75 24.75Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    const part = iso.split('T')[0]
    const [y, m, d] = part.split('-')
    if (!y || !m || !d) return iso
    return `${d}\\${m}\\${y}`
}

function formatYear(y: number | string | null | undefined): string {
    if (y === null || y === undefined || y === '') return '—'
    return String(y)
}

function formatCapacity(c: string | number | null | undefined): string {
    if (c === null || c === undefined || c === '') return '—'
    return String(c)
}

function insuranceSuccessClass(v: VehicleDetail): string {
    if (v.insurance_status === 'valid') return 'text-green-600 font-semibold'
    return ''
}

function gpsSuccessClass(v: VehicleDetail): string {
    if (v.gps_tracking === 'installed' || v.gps_tracking === 'enabled') return 'text-green-600 font-semibold'
    return ''
}

function operationalSuccessClass(v: VehicleDetail): string {
    if (v.operational_readiness === 'ready' || v.operational_readiness === 'fuel_ready') return 'text-green-600 font-semibold'
    return ''
}

const fetchVehicle = async () => {
    try {
        loading.value = true
        error.value = null
        const id = route.params.id
        const response = await api.get<{
            status?: boolean
            data?: VehicleDetail
            message?: string
        }>(`/vehicles/${id}`)

        const raw: any = response
        const data = raw?.data !== undefined ? raw.data : raw
        if (data && typeof data === 'object' && 'id' in data) {
            vehicle.value = data as VehicleDetail
        } else {
            throw new Error(raw?.message || t('common.messages.general.loadDataFailed'))
        }
    } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } }
        const errorMessage = e?.response?.data?.message || t('common.messages.general.loadDataFailed')
        toast.error(errorMessage)
        error.value = errorMessage
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchVehicle()
})
</script>

<style scoped>
.info-item-bordered {
    min-width: 140px;
}
</style>
