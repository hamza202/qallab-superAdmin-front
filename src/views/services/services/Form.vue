<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import BasicInfoTab from './components/BasicInfoTab.vue'
import OperationalDataTab from './components/OperationalDataTab.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const api = useApi()
const { success, error } = useNotification()

const serviceId = ref<number | null>(null)
const isEditing = computed(() => !!route.params.id)
const saving = ref(false)
const loading = ref(false)

// Constants from API
const domains = ref<Array<{ key: string; label: string }>>([])
const types = ref<Array<{ key: string; label: string }>>([])
const pricingMethods = ref<Array<{ key: string; label: string }>>([])
const durationUnits = ref<Array<{ key: string; label: string }>>([])
const visibilityLevels = ref<Array<{ key: string; label: string }>>([])

// Dropdown data from API
const units = ref<Array<{ id: number; name: string }>>([])
const taxes = ref<Array<{ id: number; tax_name: string }>>([])
const pricingMethodsList = ref<Array<{ id: number; name: string }>>([])

const servicesIcon = `<svg width="43" height="35" viewBox="0 0 43 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 8.5L28 8.5M28 8.5C28 12.0899 30.9102 15 34.5 15C38.0899 15 41 12.0899 41 8.5C41 4.91015 38.0899 2 34.5 2C30.9102 2 28 4.91015 28 8.5ZM15 25.8333L41 25.8333M15 25.8333C15 29.4232 12.0899 32.3333 8.5 32.3333C4.91015 32.3333 2 29.4232 2 25.8333C2 22.2435 4.91015 19.3333 8.5 19.3333C12.0899 19.3333 15 22.2435 15 25.8333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8333 5.00016H5.49992C5.03321 5.00016 4.79985 5.00016 4.62159 4.90933C4.46479 4.82944 4.33731 4.70196 4.25741 4.54515C4.16659 4.3669 4.16659 4.13354 4.16659 3.66683V0.833496M12.4999 15.8335V10.5002C12.4999 10.0335 12.4999 9.8001 12.4091 9.62184C12.3292 9.46504 12.2017 9.33755 12.0449 9.25766C11.8667 9.16683 11.6333 9.16683 11.1666 9.16683H5.49992C5.03321 9.16683 4.79985 9.16683 4.62159 9.25766C4.46479 9.33755 4.33731 9.46504 4.25741 9.62184C4.16659 9.8001 4.16659 10.0335 4.16659 10.5002V15.8335M15.8333 6.10473V11.8335C15.8333 13.2336 15.8333 13.9337 15.5608 14.4685C15.3211 14.9389 14.9386 15.3213 14.4682 15.561C13.9334 15.8335 13.2334 15.8335 11.8333 15.8335H4.83325C3.43312 15.8335 2.73306 15.8335 2.19828 15.561C1.72787 15.3213 1.34542 14.9389 1.10574 14.4685C0.833252 13.9337 0.833252 13.2336 0.833252 11.8335V4.8335C0.833252 3.43336 0.833252 2.7333 1.10574 2.19852C1.34542 1.72811 1.72787 1.34566 2.19828 1.10598C2.73306 0.833496 3.43312 0.833496 4.83325 0.833496H10.562C10.9697 0.833496 11.1735 0.833496 11.3653 0.879546C11.5354 0.920374 11.6979 0.987715 11.8471 1.0791C12.0153 1.18217 12.1594 1.32629 12.4476 1.61454L15.0522 4.21911C15.3405 4.50737 15.4846 4.65149 15.5877 4.81969C15.679 4.96881 15.7464 5.13138 15.7872 5.30144C15.8333 5.49326 15.8333 5.69708 15.8333 6.10473Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;


const activeTab = ref(0)

const tabs = [
    {
        title: "البيانات الأساسية", value: 0, icon: `<svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 11.5V5.8C17 4.11984 17 3.27976 16.673 2.63803C16.3854 2.07354 15.9265 1.6146 15.362 1.32698C14.7202 1 13.8802 1 12.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H9M11 10H5M7 14H5M13 6H5M11.5 18L13.5 20L18 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
` },
    {
        title: "البيانات التشغيلية", value: 1, icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 4V15.2C12 16.8802 12 17.7202 12.327 18.362C12.6146 18.9265 13.0735 19.3854 13.638 19.673C14.2798 20 15.1198 20 16.8 20H17M17 20C17 21.1046 17.8954 22 19 22C20.1046 22 21 21.1046 21 20C21 18.8954 20.1046 18 19 18C17.8954 18 17 18.8954 17 20ZM7 4L17 4M7 4C7 5.10457 6.10457 6 5 6C3.89543 6 3 5.10457 3 4C3 2.89543 3.89543 2 5 2C6.10457 2 7 2.89543 7 4ZM17 4C17 5.10457 17.8954 6 19 6C20.1046 6 21 5.10457 21 4C21 2.89543 20.1046 2 19 2C17.8954 2 17 2.89543 17 4ZM12 12H17M17 12C17 13.1046 17.8954 14 19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
` },
]

// Form data matching API payload structure
const basicInfoData = ref({
    name_ar: '',
    name_en: '',
    service_code: '',
    service_type: 'internal',
    service_category_id: null as number | null,
    description_ar: '',
    description_en: '',
    unit_id: null as number | null,
    unit_price: '',
    pricing_method_id: null as number | null,
    min_quantity: '',
    is_taxable: true,
    tax_id: null as number | null,
    tax_percentage: '',
    is_active: true,
})

const operationalData = ref({
    requires_scheduling: true,
    service_duration: '',
    service_duration_unit: 'دقيقة',
    requires_approval: true,
    is_barter: false,
    is_partial_allowed: false,
    sales_enabled: true,
    purchase_enabled: true,
    project_enabled: true,
    visibility_level: 'public',
    notes: '',
    activation_date: null as string | null,
})

const isTabActive = (value: number) => activeTab.value === value

const basicInfoCompleted = computed(() => {
    if (isEditing.value) {
        return !!(basicInfoData.value.name_ar && basicInfoData.value.service_code && serviceId.value)
    }
    return !!(basicInfoData.value.name_ar && basicInfoData.value.service_code)
})

const operationalInfoCompleted = computed(() => {
    return !!(operationalData.value.service_duration && operationalData.value.visibility_level)
})

const isTabCompleted = (value: number) => {
    if (value === 0) return basicInfoCompleted.value
    if (value === 1) return operationalInfoCompleted.value
    return false
}

const handleTabChange = (newTab: number, event?: Event) => {
    if (!isEditing.value && newTab === 1 && activeTab.value === 0) {
        if (!basicInfoCompleted.value) {
            error('يجب إكمال المعلومات الأساسية أولاً')
            if (event) {
                event.preventDefault()
                event.stopPropagation()
            }
            setTimeout(() => {
                activeTab.value = 0
            }, 0)
            return
        }
    }
    activeTab.value = newTab
}

// API Functions
const fetchConstants = async () => {
    try {
        const response = await api.get<any>('/admin/api/services/constants')
        const data = response.data

        domains.value = data.domains || []
        types.value = data.types || []
        pricingMethods.value = data.pricing_methods || []
        durationUnits.value = data.duration_units || []
        visibilityLevels.value = data.visibility || []
    } catch (err: any) {
        console.error('Error fetching constants:', err)
        error(err?.response?.data?.message || 'Failed to fetch constants')
    }
}

const fetchUnits = async () => {
    try {
        const response = await api.get<any>('/admin/api/units/list')
        units.value = response.data || []
    } catch (err: any) {
        console.error('Error fetching units:', err)
    }
}

const fetchTaxes = async () => {
    try {
        const response = await api.get<any>('/admin/api/taxes/list')
        taxes.value = response.data || []
    } catch (err: any) {
        console.error('Error fetching taxes:', err)
    }
}

const fetchPricingMethods = async () => {
    try {
        const response = await api.get<any>('/admin/api/pricing-methods/list')
        pricingMethodsList.value = response.data || []
    } catch (err: any) {
        console.error('Error fetching pricing methods:', err)
    }
}

const fetchServiceData = async () => {
    if (!route.params.id) return

    try {
        loading.value = true
        const response = await api.get<any>(`/admin/api/services/${route.params.id}`)
        const data = response.data

        serviceId.value = data.id

        // Basic Info
        basicInfoData.value = {
            name_ar: data.name_translations?.ar || data.name,
            name_en: data.name_translations?.en || data.name,
            service_code: data.service_code,
            service_type: data.service_type,
            service_category_id: data.service_category_id,
            description_ar: data.description_translations?.ar || data.description,
            description_en: data.description_translations?.en || data.description,
            unit_id: data.unit_id,
            unit_price: data.unit_price,
            pricing_method_id: data.pricing_method_id,
            min_quantity: data.min_quantity,
            is_taxable: data.is_taxable,
            tax_id: data.tax_id,
            tax_percentage: data.tax_percentage,
            is_active: data.is_active,
        }

        // Operational Data
        operationalData.value = {
            requires_scheduling: data.requires_scheduling,
            service_duration: data.service_duration,
            service_duration_unit: data.service_duration_unit,
            requires_approval: data.requires_approval,
            is_barter: data.is_barter,
            is_partial_allowed: data.is_partial_allowed,
            sales_enabled: data.sales_enabled,
            purchase_enabled: data.purchase_enabled,
            project_enabled: data.project_enabled,
            visibility_level: data.visibility_level,
            notes: data.notes,
            activation_date: data.activation_date,
        }
    } catch (err: any) {
        console.error('Error fetching service data:', err)
        error(err?.response?.data?.message || 'Failed to fetch service data')
    } finally {
        loading.value = false
    }
}

const buildPayload = (step: number) => {
    return {
        step,
        service_id: serviceId.value || undefined,
        name: {
            en: basicInfoData.value.name_en,
            ar: basicInfoData.value.name_ar
        },
        description: {
            en: basicInfoData.value.description_en,
            ar: basicInfoData.value.description_ar
        },
        service_code: basicInfoData.value.service_code,
        service_category_id: basicInfoData.value.service_category_id,
        service_type: basicInfoData.value.service_type,
        is_active: basicInfoData.value.is_active,
        unit_id: basicInfoData.value.unit_id,
        unit_price: parseFloat(basicInfoData.value.unit_price) || 0,
        pricing_method_id: basicInfoData.value.pricing_method_id,
        min_quantity: parseInt(basicInfoData.value.min_quantity) || 0,
        is_taxable: basicInfoData.value.is_taxable,
        tax_id: basicInfoData.value.tax_id,
        tax_percentage: parseFloat(basicInfoData.value.tax_percentage) || 0,
        requires_scheduling: operationalData.value.requires_scheduling,
        service_duration: parseInt(operationalData.value.service_duration) || 0,
        service_duration_unit: operationalData.value.service_duration_unit,
        requires_approval: operationalData.value.requires_approval,
        is_barter: operationalData.value.is_barter,
        is_partial_allowed: operationalData.value.is_partial_allowed,
        sales_enabled: operationalData.value.sales_enabled,
        purchase_enabled: operationalData.value.purchase_enabled,
        project_enabled: operationalData.value.project_enabled,
        visibility_level: operationalData.value.visibility_level,
        notes: operationalData.value.notes,
        activation_date: operationalData.value.activation_date,
    }
}

const saveStep = async (step: number) => {
    try {
        saving.value = true
        const payload = buildPayload(step)

        let response: any

        if (serviceId.value) {
            response = await api.put(`/admin/api/services/${serviceId.value}`, payload)
        } else {
            response = await api.post('/admin/api/services', payload)
        }

        if (response.data.service_id) {
            serviceId.value = response.data.service_id
        }

        success(response.message || 'Service saved successfully')
        return true
    } catch (err: any) {
        console.error('Error saving service:', err)

        if (err?.response?.data?.errors) {
            const errors = err.response.data.errors
            const errorMessages = Object.values(errors).flat().join('\n')
            error(errorMessages)
        } else {
            error(err?.response?.data?.message || 'Failed to save service')
        }
        return false
    } finally {
        saving.value = false
    }
}

const handleSave = async () => {
    const step1Success = await saveStep(1)
    if (!step1Success) return

    if (activeTab.value === 1) {
        const step2Success = await saveStep(2)
        if (step2Success) {
            router.push({ name: 'ServicesList' })
        }
    } else {
        activeTab.value = 1
    }
}

const handleClose = () => {
    router.push({ name: 'ServicesList' })
}

// Lifecycle
onMounted(async () => {
    // Fetch all dropdown data
    await Promise.all([
        fetchConstants(),
        fetchUnits(),
        fetchTaxes(),
        fetchPricingMethods()
    ])

    // Fetch service data if editing
    if (isEditing.value) {
        await fetchServiceData()
    }
})

const checkCircleIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_12506_1251)">
<path d="M16.5 8.31429V9.00429C16.4991 10.6216 15.9754 12.1953 15.007 13.4907C14.0386 14.786 12.6775 15.7337 11.1265 16.1922C9.57557 16.6508 7.91794 16.5957 6.40085 16.0352C4.88376 15.4747 3.58849 14.4389 2.70822 13.0821C1.82795 11.7253 1.40984 10.1203 1.51626 8.50653C1.62267 6.89272 2.24791 5.35654 3.29871 4.1271C4.34951 2.89766 5.76959 2.04083 7.34714 1.6844C8.92469 1.32798 10.5752 1.49105 12.0525 2.14929M16.5 3L9 10.5075L6.75 8.2575" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_12506_1251">
<rect width="18" height="18" fill="white"/>
</clipPath>
</defs>
</svg>`
</script>

<template>
    <default-layout>
        <div class="services-form-page">
            <PageHeader :icon="servicesIcon" title-key="pages.services.title"
                description-key="pages.services.description" />

            <div class="-mx-6">
                <div class="flex gap-2 overflow-y-auto py-4 px-6 border-y border-gray-200">
                    <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" :class="[
                        'flex items-center gap-2 px-3.5 py-2.5 rounded-md transition-all',
                        isTabActive(tab.value)
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-400 hover:bg-gray-50',
                    ]">
                        <span v-html="tab.icon" class="w-6 h-6"></span>
                        <span class="text-base font-semibold whitespace-nowrap">{{
                            tab.title
                        }}</span>
                    </button>
                </div>

                <div class="bg-white px-6 py-3">
                    <v-tabs-window v-model="activeTab">
                        <v-tabs-window-item :value="0">
                            <BasicInfoTab v-model="basicInfoData" :domains="domains" :types="types" :units="units"
                                :pricing-methods="pricingMethodsList" :taxes="taxes" />
                        </v-tabs-window-item>

                        <v-tabs-window-item :value="1">
                            <OperationalDataTab v-model="operationalData" :duration-units="durationUnits"
                                :visibility-levels="visibilityLevels" />
                        </v-tabs-window-item>
                    </v-tabs-window>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                    <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
                        :prepend-icon="saveIcon" label="حفظ" @click="handleSave" />

                    <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
                        custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" :label="t('common.close')"
                        @click="handleClose" />
                </div>

            </div>
        </div>
    </default-layout>
</template>

<style scoped>
.custom-tabs {
    border-bottom: none;
}

.custom-tab {
    @apply rounded-lg px-6 py-2 text-base font-semibold text-gray-600 bg-white border border-gray-300 mx-1;
    text-transform: none;
    letter-spacing: normal;
}

.custom-tab--active {
    @apply bg-primary-600 !text-white border-primary-600;
}

.custom-tab--completed {
    @apply bg-primary-600 text-white border-primary-600;
}
</style>
