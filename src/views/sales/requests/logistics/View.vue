<template>
    <default-layout>
        <div class="category-view-page -mx-6">
            <!-- Content -->
            <div>
                <!-- Breadcrumb -->
                <div class="flex flex-wrap items-center gap-3 mb-6 text-sm px-6">
                    <router-link to="/" class="text-gray-500 hover:text-primary-600">
                        <span v-html="homeIcon"></span>
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/sales" class="text-gray-600 hover:text-primary-600">
                        {{ t('sales.forms.viewPages.breadcrumb.sales') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/sales/requests/logistics/list" class="text-gray-600 hover:text-primary-600">
                        {{ t('sales.forms.viewPages.lists.logisticsQuotationRequests') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ requestCode
                    }}</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="archiveIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ requestCode }}</h1>
                                <p class="text-sm text-gray-600">{{ t('sales.forms.viewPages.subtitles.requestDetail') }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab Content — general information -->
                <div class="p-6">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">{{ t('sales.forms.common.sections.basicData') }}</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.responsibleName') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ logisticsData?.responsible_person || '—'
                            }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.responsiblePhone') }}</label>
                            <p class="text-base font-semibold text-gray-900 dir-ltr text-end">{{
                                logisticsData?.responsible_phone || '—'
                                }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.requestDate') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ logisticsData?.request_datetime || '—'
                            }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.logisticsCompany') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ logisticsData?.supplier_name || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.projectName') }}</label>
                            <p class="text-sm font-semibold text-gray-900">{{ logisticsData?.project_name || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.paymentMethod') }}</label>
                            <p class="text-sm font-semibold text-gray-900">{{ paymentMethodLabel }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.advancePayment') }}</label>
                            <p class="text-sm font-semibold text-gray-900 flex gap-1 items-center">{{
                                logisticsData?.upfront_payment || 0 }} <span v-html="rialIcon"></span></p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.materialSourceLocation') }}</label>
                            <p class="text-sm font-semibold text-gray-900">{{ logisticsData?.source_location || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.projectMap') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ logisticsData?.target_location || '—' }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Transport details -->
                <div class="">
                    <div class="bg-primary-50 px-6 py-4">
                        <div class="flex items-center gap-2 text-primary-900 font-bold">
                            <span v-html="packageIcon"></span>
                            <h2 class="text-base">{{ t('sales.forms.viewPages.tabs.logisticsRequestTransport') }}</h2>
                        </div>
                    </div>

                    <div v-for="(detail, index) in logisticsDetails" :key="index" class="p-4">
                        <div class="flex flex-wrap gap-4">
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.materialCarriedType') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{
                                    getCategoryName(detail.material_type) }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.tripsCount') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ detail.trip_no }} {{ t('sales.forms.viewPages.sections.tripCountUnit') }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.executionDuration') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ detail.actual_execution_interval }}
                                    {{ t('sales.forms.viewPages.sections.dayUnit') }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.logisticsDetailDialog.transportTimes') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ getAmPmLabel(detail.am_pm_interval)
                                    }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportStart') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ detail.from_date }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportEnd') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ detail.to_date }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportVehicleType') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{
                                    Array.isArray(detail.transport_type_label) ? detail.transport_type_label.join(', ') : (detail.transport_type_label || '—') }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportVehicleCount') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ detail.transport_no }} {{ t('sales.forms.viewPages.sections.vehicleCountUnit') }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.loadingOfficer') }}</label>
                                <p class="text-sm font-semibold text-gray-900">{{ detail.loading_responsible_party }}
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.unloadingOfficer') }}</label>
                                <p class="text-sm font-semibold text-gray-900">{{ detail.downloading_responsible_party
                                    }}</p>
                            </div>
                        </div>
                        <div class="flex gap-4 flex-wrap">
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.pickupLocationShort') }}</label>
                                <p class="text-sm font-semibold text-gray-900">{{ detail.source_location }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.deliveryLocationShort') }}</label>
                                <p class="text-sm font-semibold text-gray-900">{{ detail.target_location }}</p>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Transported materials -->
                <div>
                    <div class="bg-primary-50 px-6 py-4">
                        <div class="flex items-center gap-2 text-primary-900 font-bold">
                            <span class="w-[18px]" v-html="fileCheckIcon"></span>
                            <h2 class="text-base">{{ t('sales.forms.viewPages.sections.requestDetailsShort') }}</h2>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div class="mb-8">
                        <DataTable :headers="itemHeaders" :items="itemsData" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <v-overlay :model-value="isLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>
    </default-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { rialIcon, archiveIcon, homeIcon, fileCheckIcon } from '@/components/icons/globalIcons'
import { packageIcon } from '@/components/icons/priceOffersIcons'

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const logisticsData = ref<any>(null)
const constantsData = ref<any>(null)

// Get route ID
const routeId = computed(() => route.params.id as string)

// Fetch constants data
const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/sales/trips/constants')
        constantsData.value = res.data
    } catch (e: any) {
        console.error('Error fetching constants:', e)
    }
}

// Fetch logistics request data
const fetchLogisticsData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/sales/logistics/${routeId.value}`)
        logisticsData.value = res.data
    } catch (e: any) {
        console.error('Error fetching logistics data:', e)
        error(e?.response?.data?.message || t('sales.forms.common.messages.loadTransportRequestFailed'))
    } finally {
        isLoading.value = false
    }
}

const categoriesItems = ref<any[]>([]);

const fetchCategories = async () => {
    try {
        const res = await api.get<any>('/categories/list');
        if (Array.isArray(res.data)) {
            categoriesItems.value = res.data.map((i: any) => ({ title: i.name, value: i.id }));
        }
    } catch (e) {
        console.error('Error fetching categories:', e);
    }
}


// Computed properties for display
const requestCode = computed(() => logisticsData.value?.code || '—')

const paymentMethodLabel = computed(() => {
    const method = logisticsData.value?.payment_method
    if (method === 'cash') return t('sales.forms.paymentsDemo.cash')
    if (method === 'deferred') return t('sales.forms.paymentsDemo.deferred')
    return '—'
})

const logisticsDetails = computed(() => logisticsData.value?.logistics_detail || [])

const getCategoryName = (categories: number[]) => {
    if (!categories || categories.length === 0) return '—'

    // Get transport types from constants    
    return categories.map(categoryId => {
        const categoryItem = categoriesItems.value.find((t: any) => t.value == categoryId)
        return categoryItem?.title || categoryId.toString()
    }).join(', ')
}



const getAmPmLabel = (interval: string) => {
    if (!interval) return '—'

    const amPmIntervals = constantsData.value?.am_pm_interval || []
    const intervalObj = amPmIntervals.find((i: any) => i.key == interval)
    if (intervalObj?.label) return intervalObj.label
    if (interval === 'am') return t('sales.forms.common.intervals.morning')
    if (interval === 'pm') return t('sales.forms.common.intervals.evening')
    if (interval === 'both') return t('sales.forms.common.intervals.morningAndEvening')
    return interval
}

// Items table
const itemsData = computed(() => {
    if (!logisticsData.value?.items) return []
    return logisticsData.value.items.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        unit_name: item.unit_name || '—',
        quantity: item.quantity || 0,
    }))
})

const itemHeaders = computed(() => [
    { title: t('sales.forms.tables.tripProducts.itemName'), key: 'item_name' },
    { title: t('sales.forms.common.labels.unitCol'), key: 'unit_name' },
    { title: t('sales.forms.common.labels.quantityDisplay'), key: 'quantity' },
])

onMounted(() => {
    fetchConstants()
    fetchCategories()
    fetchLogisticsData()
})

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
