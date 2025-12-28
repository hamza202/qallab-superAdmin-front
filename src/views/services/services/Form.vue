<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import BasicInfoTab from './components/BasicInfoTab.vue'
import OperationalDataTab from './components/OperationalDataTab.vue'

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

const servicesIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="6" width="40" height="40" rx="4" stroke="#1570EF" stroke-width="3"/>
<path d="M14 16H38" stroke="#1570EF" stroke-width="3"/>
<path d="M14 24H38" stroke="#1570EF" stroke-width="3"/>
<path d="M14 32H30" stroke="#1570EF" stroke-width="3"/>
</svg>`

const activeTab = ref(0)

const tabs = [
    { title: "البيانات الأساسية", value: 0 },
    { title: "البيانات التشغيلية", value: 1 },
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
                <div class="bg-white px-6">
                    <v-tabs v-model="activeTab" color="primary" class="custom-tabs mb-6" hide-slider>
                        <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" :class="[
                            'custom-tab',
                            {
                                'custom-tab--active': isTabActive(tab.value),
                                'custom-tab--completed': isTabCompleted(tab.value),
                            },
                        ]" @click="handleTabChange(tab.value, $event)">
                            {{ tab.title }}
                            <span v-if="isTabCompleted(tab.value)" class="ms-2" v-html="checkCircleIcon"></span>
                        </v-tab>
                    </v-tabs>

                    <v-tabs-window v-model="activeTab">
                        <v-tabs-window-item :value="0">
                            <BasicInfoTab 
                                v-model="basicInfoData" 
                                :domains="domains"
                                :types="types"
                                :units="units"
                                :pricing-methods="pricingMethodsList"
                                :taxes="taxes"
                            />
                        </v-tabs-window-item>

                        <v-tabs-window-item :value="1">
                            <OperationalDataTab 
                                v-model="operationalData"
                                :duration-units="durationUnits"
                                :visibility-levels="visibilityLevels"
                            />
                        </v-tabs-window-item>
                    </v-tabs-window>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 sm:justify-center mt-6 px-6">
                    <v-btn variant="flat" color="primary" height="44" class="font-semibold text-base sm:min-w-[200px]"
                        @click="handleSave" :loading="saving">
                        <template #prepend>
                            <v-icon>mdi-content-save-all-outline</v-icon>
                        </template>
                        حفظ
                    </v-btn>
                    <v-btn variant="flat" color="primary-50" height="44"
                        class="font-semibold text-base text-primary-700 sm:min-w-[200px]" @click="handleClose"
                        :disabled="saving">
                        <template #prepend>
                            <v-icon>mdi-close</v-icon>
                        </template>
                        اغلاق
                    </v-btn>
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
