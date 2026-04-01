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
                    <router-link to="/sales/orders/material-product/list"
                        class="text-gray-600 hover:text-primary-600">
                        {{ t('sales.forms.viewPages.lists.salesOrders') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ orderCode }}</span>
                </div>

                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="archiveIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ orderCode }}</h1>
                                <p class="text-sm text-gray-600">{{ t('sales.forms.viewPages.subtitles.orderDetail') }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-6 border-b !border-gray-200">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">{{ t('sales.forms.viewPages.sections.orderInfo') }}</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.customerName') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ customerName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.orderTypeLabel') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ orderType }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.orderDate') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ orderDateTime }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.project') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ projectName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.projectMap') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ targetLocation }}</p>
                        </div>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.materialSourceLocation') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ sourceLocation }}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="packageIcon"></span>
                            <h2 class="text-base font-bold">{{ t('sales.forms.common.sections.orderItemsTable') }}</h2>
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
import { archiveIcon, homeIcon } from '@/components/icons/globalIcons'
import { busIcon, truckIcon, packageIcon } from '@/components/icons/priceOffersIcons'

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const orderData = ref<any>(null)

const routeId = computed(() => route.params.id as string)

const fetchOrderData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/sales/orders/building-materials/${routeId.value}`)
        orderData.value = res.data
    } catch (e: any) {
        console.error('Error fetching order data:', e)
        error(e?.response?.data?.message || t('sales.forms.common.messages.loadSalesOrderViewFailed'))
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchOrderData()
})

const orderCode = computed(() => orderData.value?.code || '')
const projectName = computed(() => orderData.value?.project_name || '—')
const orderType = computed(() => {
    const type = orderData.value?.so_type
    if (type === 'so_without_logistics') return t('sales.forms.viewPages.orderKind.saleNoTransport')
    if (type === 'so_with_logistics') return t('sales.forms.viewPages.orderKind.saleWithTransport')
    return type || '—'
})
const customerName = computed(() => orderData.value?.customer_name || '—')
const orderDateTime = computed(() => {
    const dt = orderData.value?.so_datetime
    return dt ? new Date(dt).toLocaleDateString('en-US') : '—'
})
const targetLocation = computed(() => orderData.value?.target_location || '—')
const sourceLocation = computed(() => orderData.value?.source_location || '—')

const productItems = computed(() => {
    if (!orderData.value?.items) return []
    return orderData.value.items.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        unit: item.unit_name || '—',
        quantity: item.quantity || 0,
        unit_price: item.price_per_unit || 0,
        discount: item.discount_val || 0,
        tax: item.total_tax || 0,
        subtotal: item.subtotal_after_tax || 0,
    }))
})

const transportItems = computed(() => {
    if (!orderData.value?.so_logistics_product_details) return []
    return orderData.value.so_logistics_product_details.map((item: any) => ({
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

const hasAdditionalLogistics = computed(() => !!orderData.value?.so_attached_logistics_detail)
const additionalLogistics = computed(() => {
    const logistics = orderData.value?.so_attached_logistics_detail
    if (!logistics) return {}
    return {
        from_date: logistics.from_date ? new Date(logistics.from_date).toLocaleDateString('en-US') : '—',
        to_date: logistics.to_date ? new Date(logistics.to_date).toLocaleDateString('en-US') : '—',
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
