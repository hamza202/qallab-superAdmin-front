<template>
    <default-layout>
        <div class="category-view-page -mx-6">
            <div>
                <div class="flex flex-wrap items-center gap-3 mb-6 text-sm px-6">
                    <router-link to="/" class="text-gray-500 hover:text-primary-600">
                        <span v-html="homeIcon"></span>
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/sales" class="text-gray-600 hover:text-primary-600">
                        {{ t('sales.forms.viewPages.breadcrumb.sales') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/sales/quotations/material-product/list"
                        class="text-gray-600 hover:text-primary-600">
                        {{ t('sales.forms.viewPages.lists.quotations') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ quotationCode ||
                        '--' }}</span>
                </div>

                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="archiveIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ quotationCode || '--' }}</h1>
                                <p class="text-sm text-gray-600">{{ t('sales.forms.viewPages.subtitles.quotationDetail') }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-6 border-b !border-gray-200">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">{{ t('sales.forms.common.sections.basicData') }}</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.customerName') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ customerName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.quotationName') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ QuotationName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.quotationDate') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ quotationDateTime }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.project') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ projectName }}</p>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-4 mt-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.projectMap') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ targetLocation }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.requestType') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ quotationType }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.advancePayment') }}</label>
                            <p class="text-sm text-gray-700 leading-relaxed flex gap-1 items-center">{{ upfrontPayment
                                }} <span v-html="rialIcon"></span></p>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="packageIcon"></span>
                            <h2 class="text-base font-bold">{{ t('sales.forms.common.sections.quotationItemsTable') }}</h2>
                        </div>
                    </div>
                    <div>
                        <DataTable :headers="productHeaders" :items="productItems" />
                    </div>
                </div>

                <div>
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="busIcon"></span>
                            <h2 class="text-base font-bold">{{ t('sales.forms.common.sections.supplyDetails') }}</h2>
                        </div>
                    </div>
                    <div>
                        <DataTable :headers="transportHeaders" :items="transportItems" />
                    </div>
                </div>

                <div v-if="hasAdditionalLogistics" class="mb-8">
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="truckIcon"></span>
                            <h2 class="text-base font-bold">{{ t('sales.forms.common.sections.additionalSupplyData') }}</h2>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex flex-wrap gap-4">
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportStart') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ additionalLogistics.from_date }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportEnd') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ additionalLogistics.to_date }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.executionDuration') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{
                                    additionalLogistics.actual_execution_duration }} {{ t('sales.forms.viewPages.sections.dayUnit') }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportVehicleType') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ additionalLogistics.vehicle_type }}
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportVehicleCount') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ additionalLogistics.transport_no }}
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.totalTripsCount') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ additionalLogistics.trip_no }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.loadingOfficer') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{
                                    additionalLogistics.loading_responsible }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.unloadingOfficerTrip') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{
                                    additionalLogistics.downloading_responsible }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
import { rialIcon, archiveIcon, homeIcon } from '@/components/icons/globalIcons'
import { busIcon, truckIcon, packageIcon } from '@/components/icons/priceOffersIcons'

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const quotationData = ref<any>(null)

const routeId = computed(() => route.params.id as string)

const fetchQuotationData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/sales/quotations/building-materials/${routeId.value}`)
        quotationData.value = res.data
    } catch (e: any) {
        console.error('Error fetching quotation data:', e)
        error(e?.response?.data?.message || t('sales.forms.common.messages.loadQuotationViewFailed'))
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchQuotationData()
})

const quotationCode = computed(() => quotationData.value?.code || '')
const QuotationName = computed(() => quotationData.value?.quotation_name || '')
const projectName = computed(() => quotationData.value?.project_name || '—')
const customerName = computed(() => quotationData.value?.customer_name || '—')
const quotationDateTime = computed(() => {
    const dt = quotationData.value?.quotations_datetime
    return dt ? new Date(dt).toLocaleDateString('en-US') : '—'
})
const targetLocation = computed(() => quotationData.value?.target_location || '—')
const upfrontPayment = computed(() => quotationData.value?.upfront_payment || 0)
const quotationType = computed(() => {
    const type = quotationData.value?.quotation_type
    if (type === 'sale_quotation_without_logistics') return t('sales.forms.viewPages.orderKind.quotationWithoutService')
    if (type === 'sale_quotation_with_logistics') return t('sales.forms.viewPages.orderKind.quotationWithService')
    return type || ''
})

const productItems = computed(() => {
    if (!quotationData.value?.items) return []
    return quotationData.value.items.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        unit: item.unit_name || '—',
        quantity: item.quantity || 0,
        unit_price: item.price_per_unit || '—',
        discount: item.discount_val || '—',
        tax: item.total_tax || '—',
        subtotal: item.subtotal_after_tax || '—',
    }))
})

const transportItems = computed(() => {
    if (!quotationData.value?.logistics_product_details) return []
    return quotationData.value.logistics_product_details.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        quantity: item.quantity || 0,
        trip_start: item.trip_start ? new Date(item.trip_start).toLocaleDateString('en-US') : '—',
        number_of_trips: item.number_of_trips || 0,
        vehicle_type: Array.isArray(item.transport_type_label) ? item.transport_type_label.join(', ') : (item.transport_type_label || '—'),
        trip_capacity: item.trip_capacity || 0,
        trip_time: getAmPmIntervalName(item.am_pm_interval),
    }))
})

const hasAdditionalLogistics = computed(() => !!quotationData.value?.attached_logistics_detail)
const additionalLogistics = computed(() => {
    const logistics = quotationData.value?.attached_logistics_detail
    if (!logistics) return {}
    return {
        from_date: logistics.from_date ? new Date(logistics.from_date).toLocaleDateString('ar-SA') : '—',
        to_date: logistics.to_date ? new Date(logistics.to_date).toLocaleDateString('ar-SA') : '—',
        actual_execution_duration: logistics.actual_execution_duration || 0,
        vehicle_type: Array.isArray(logistics.transport_type_label) ? logistics.transport_type_label.join(', ') : (logistics.transport_type_label || '—'),
        transport_no: logistics.transport_no || 0,
        trip_no: logistics.trip_no || 0,
        loading_responsible: logistics.loading_responsible_party || '—',
        downloading_responsible: logistics.downloading_responsible_party || '—',
    }
})

const getAmPmIntervalName = (interval: any) => {
    if (interval === 'am') return t('sales.forms.common.intervals.morning')
    if (interval === 'pm') return t('sales.forms.common.intervals.evening')
    if (interval === 'both') return t('sales.forms.common.intervals.morningAndEvening')
    return interval || '—'
}

const productHeaders = computed(() => [
    { title: t('sales.forms.tables.tripProducts.itemName'), key: 'item_name' },
    { title: t('sales.forms.common.labels.unitCol'), key: 'unit' },
    { title: t('sales.forms.common.labels.quantityDisplay'), key: 'quantity' },
    { title: t('sales.forms.common.labels.unitPrice'), key: 'unit_price' },
    { title: t('sales.forms.common.labels.discount'), key: 'discount' },
    { title: t('sales.forms.stats.tax'), key: 'tax' },
    { title: t('sales.forms.common.labels.totalAmount'), key: 'subtotal' },
])

const transportHeaders = computed(() => [
    { title: t('sales.forms.common.labels.product'), key: 'item_name' },
    { title: t('sales.forms.common.labels.quantityDisplay'), key: 'quantity' },
    { title: t('sales.forms.common.labels.transportStart'), key: 'trip_start' },
    { title: t('sales.forms.common.labels.tripsCount'), key: 'number_of_trips' },
    { title: t('sales.forms.common.labels.transportVehicleType'), key: 'vehicle_type' },
    { title: t('sales.forms.common.labels.tripCapacity'), key: 'trip_capacity' },
    { title: t('sales.forms.common.labels.tripTiming'), key: 'trip_time' },
])

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
