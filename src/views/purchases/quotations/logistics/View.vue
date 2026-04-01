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
                    <router-link to="/purchases" class="text-gray-600 hover:text-primary-600">
                        {{ t('purchases.views.shared.purchasesBreadcrumb') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/purchases/quotations/logistics/list" class="text-gray-600 hover:text-primary-600">
                        {{ t('purchases.views.shared.listQuotationsLogistics') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ quotationCode ||
                        '--' }}</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="archiveIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ quotationCode || '--' }}</h1>
                                <p class="text-sm text-gray-600">{{ t('purchases.views.shared.quotationSubtitle') }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <!-- Quotation Information Section (البيانات الأساسية) -->
                <div class="p-6 border-b !border-gray-200">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">{{ t('purchases.views.shared.basicDataSection') }}</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.transportCompanyDisplay') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ supplierName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.offerDate') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ quotationDateTime }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.shared.forms.common.labels.responsiblePhone') }}</label>
                            <p class="text-base font-semibold text-gray-900 dir-ltr text-end">{{ responsiblePhone }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.quotationValidity') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ t('purchases.views.shared.daysWithUnit', { n: quotationValidityNo }) }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.quotationName') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ QuotationName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.labels.projectName') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ projectName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.labels.projectLocation') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ targetLocation }}</p>
                        </div>
                    </div>
                </div>

                <!-- Transport Details Section (تفاصيل النقل) -->
                <div v-if="hasTransportDetails" class="mb-8">
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="truckIcon"></span>
                            <h2 class="text-base font-bold">{{ t('purchases.requests.logistics.form.transportDetails') }}</h2>
                        </div>
                    </div>
                    <div class="p-6 space-y-10 divide-y divide-gray-200">
                        <div v-for="(detail, index) in transportDetailsList" :key="detail.id || index"
                            class="space-y-4 py-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-base font-bold text-primary-900">{{ t('purchases.views.shared.transportServiceHash', { n: index + 1 }) }}</h3>
                                <p
                                    class="text-base text-gray-700 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                                    {{ detail.transport_amount }}
                                    <SarIcon :width="13" :height="15" color="#697586" />
                                </p>
                            </div>
                            <div class="flex flex-wrap gap-4">
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.materialMovedType') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.material_type }}
                                    </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.tripCount') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.trip_no }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.executionDuration') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{
                                        t('purchases.views.shared.daysWithUnit', { n: detail.actual_execution_interval }) }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.workHours') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.am_pm_interval }}
                                    </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.transportFromDate') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.from_date }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.transportToDate') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.to_date }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.transportAmount') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.transport_amount }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.vehicleType') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.transport_type }}
                                    </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.vehicleCount') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{
                                        t('purchases.views.shared.vehiclesWithUnit', { n: detail.transport_no }) }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.loadingResponsible') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{
                                        detail.loading_responsible_party }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.unloadingResponsible') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{
                                        detail.downloading_responsible_party }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.discountType') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.discount_type_label }}
                                    </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.discountValue') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.discount_val }}</p>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-4 mt-4">
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.map.pickup') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.source_location
                                    }}
                                    </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.map.delivery') }}</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.target_location
                                    }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Products Table Section (المنتجات) -->
                <div>
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="packageIcon"></span>
                            <h2 class="text-base font-bold">{{ t('purchases.views.shared.productsSection') }}</h2>
                        </div>
                    </div>
                    <div>
                        <DataTable :headers="productHeaders" :items="productItems" />
                    </div>
                </div>

                <!-- Trips Table Section (الرحلات) -->
                <div>
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="busIcon"></span>
                            <h2 class="text-base font-bold">{{ t('purchases.views.shared.tripsSection') }}</h2>
                        </div>
                    </div>
                    <div>
                        <DataTable :headers="tripHeaders" :items="tripItems" />
                    </div>
                </div>

                <!-- Summary Section (ملخص عرض السعر) -->
                <div v-if="summaryData" class="mb-8">
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span class="w-4" v-html="fileIcon_2"></span>
                            <h2 class="text-base font-bold">{{ t('purchases.views.shared.quotationSummaryTitle') }}</h2>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex flex-wrap gap-4">
                            <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.totalBeforeDiscount') }}</label>
                                <p class="text-base font-semibold text-gray-900 flex items-center gap-1">
                                    {{ summaryData.total_before_discount }}
                                    <SarIcon :width="13" :height="15" color="#697586" />
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.totalDiscountSum') }}</label>
                                <p class="text-base font-semibold text-gray-900 flex items-center gap-1">
                                    {{ summaryData.total_discount }}
                                    <SarIcon :width="13" :height="15" color="#697586" />
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.totalAfterDiscount') }}</label>
                                <p class="text-base font-semibold text-gray-900 flex items-center gap-1">
                                    {{ summaryData.total_after_discount }}
                                    <SarIcon :width="13" :height="15" color="#697586" />
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.taxPercentLabel') }}</label>
                                <p class="text-base font-semibold text-gray-900">{{ (summaryData.vat_rate * 100) }}%</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.totalTaxSum') }}</label>
                                <p class="text-base font-semibold text-gray-900 flex items-center gap-1">
                                    {{ summaryData.total_vat }}
                                    <SarIcon :width="13" :height="15" color="#697586" />
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.views.shared.finalTotal') }}</label>
                                <p class="text-base font-semibold text-primary-600 flex items-center gap-1">
                                    {{ summaryData.final_total }}
                                    <SarIcon :width="13" :height="15" color="#2563EB" />
                                </p>
                            </div>
                        </div>
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
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { archiveIcon, fileIcon_2, homeIcon } from '@/components/icons/globalIcons'
import { busIcon, truckIcon, packageIcon } from '@/components/icons/priceOffersIcons'
import SarIcon from '@/components/icons/SarIcon.vue'
const { t } = useI18n();
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const quotationData = ref<any>(null)

// Get route ID
const routeId = computed(() => route.params.id as string)

// Fetch quotation data
const fetchQuotationData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/purchases/quotations/logistics/${routeId.value}`)
        quotationData.value = res.data
    } catch (e: any) {
        console.error('Error fetching quotation data:', e)
        error(e?.response?.data?.message || t('purchases.views.shared.loadQuotationError'))
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchQuotationData()
})

// Computed properties for display
const quotationCode = computed(() => quotationData.value?.code || '')
const QuotationName = computed(() => quotationData.value?.quotation_name || '')
const projectName = computed(() => quotationData.value?.project_name || '—')
const categoryLabel = computed(() => {
    const category = quotationData.value?.category
    if (category === 'logistics') return t('purchases.views.shared.categoryLogistics')
    return category || '—'
})
const supplierName = computed(() => quotationData.value?.supplier_name || '—')
const responsiblePerson = computed(() => quotationData.value?.responsible_person || '—')
const responsiblePhone = computed(() => quotationData.value?.responsible_phone || '—')
const quotationDateTime = computed(() => quotationData.value?.quotations_datetime || '—')
const quotationValidityNo = computed(() => quotationData.value?.quotation_validity_no || 0)
const targetLocation = computed(() => quotationData.value?.target_location || '—')
const paymentMethodLabel = computed(() => {
    const method = quotationData.value?.payment_method
    if (method === 'cash') return t('purchases.views.shared.paymentNaqd')
    if (method === 'installment') return t('purchases.views.shared.paymentInstallment')
    return method || '—'
})
const upfrontPayment = computed(() => quotationData.value?.upfront_payment || 0)
const invoiceInterval = computed(() => quotationData.value?.invoice_interval || 0)
const paymentTermNo = computed(() => quotationData.value?.payment_term_no || 0)

// Products table (المنتجات)
const productItems = computed(() => {
    if (!quotationData.value?.quotation_product_details) return []
    return quotationData.value.quotation_product_details.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        unit: item.unit_name || '—',
        quantity: item.quantity || 0,
        from_date: item.from_date || '—',
        trip_no: item.trip_no || 0,
        // transport_type: item.transport_type || '—',
    }))
})

// Trips table (الرحلات)
const tripItems = computed(() => {
    if (!quotationData.value?.quotation_trip_details) return []
    return quotationData.value.quotation_trip_details.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        unit: item.unit_name || '—',
        quantity: item.quantity || 0,
        trip_date: item.trip_date || '—',
        trip_price: item.trip_price || 0,
        transport_type: Array.isArray(item.transport_type_label) ? item.transport_type_label.join(', ') : '—',
        trip_no: item.trip_no || 0,
        sub_total: item.sub_total || 0,
        discount_type: item.discount_type || 0,
        discount_val: item.discount_val || 0,
    }))
})

// Transport details (تفاصيل النقل)
const hasTransportDetails = computed(() => {
    return quotationData.value?.quotation_logistics_details &&
        quotationData.value.quotation_logistics_details.length > 0
})

const transportDetailsList = computed(() => {
    if (!hasTransportDetails.value) return []
    return quotationData.value.quotation_logistics_details.map((details: any) => ({
        id: details.id,
        material_type: Array.isArray(details.material_type_label) ? details.material_type_label.join(', ') : '—',
        trip_no: details.trip_no || 0,
        actual_execution_interval: details.actual_execution_interval || 0,
        am_pm_interval: getAmPmIntervalName(details.am_pm_interval),
        from_date: details.from_date || '—',
        to_date: details.to_date || '—',
        transport_type: Array.isArray(details.transport_type_label) ? details.transport_type_label.join(', ') : '—',
        transport_no: details.transport_no || 0,
        loading_responsible_party: details.loading_responsible_party || '—',
        downloading_responsible_party: details.downloading_responsible_party || '—',
        target_location: details.target_location || '—',
        source_location: details.source_location || '—',
        transport_amount: details.transport_amount || 0,
        discount_type_label: details.discount_type === 1 ? t('purchases.views.shared.discountPercent') : t('purchases.views.shared.discountFixed'),
        discount_val: details.discount_val || 0,
    }))
})

// Summary data
const summaryData = computed(() => {
    const summary = quotationData.value?.summery
    if (!summary) return null
    return {
        total_before_discount: summary.total_before_discount ?? 0,
        total_after_discount: summary.total_after_discount ?? 0,
        total_discount: summary.total_discount ?? 0,
        vat_rate: summary.vat_rate ?? 0,
        total_vat: summary.total_vat ?? 0,
        final_total: summary.final_total ?? 0,
    }
})

// Helper functions
const getAmPmIntervalName = (interval: any) => {
    if (interval === 'am') return t('purchases.views.shared.timeInterval.am')
    if (interval === 'pm') return t('purchases.views.shared.timeInterval.pm')
    if (interval === 'both') return t('purchases.views.shared.timeInterval.both')
    return interval || '—'
}


// Table headers
const productHeaders = computed(() => [
    { title: t('purchases.link.shared.table.productName'), key: 'item_name' },
    { title: t('purchases.shared.forms.common.tableHeaders.unit'), key: 'unit' },
    { title: t('purchases.link.shared.table.quantity'), key: 'quantity' },
    { title: t('purchases.orders.shared.tableHeaders.transportStartDate'), key: 'from_date' },
    { title: t('purchases.views.shared.dailyTripsCount'), key: 'trip_no' },
])

const tripHeaders = computed(() => [
    { title: t('purchases.orders.shared.tableHeaders.product'), key: 'item_name' },
    { title: t('purchases.link.shared.table.quantity'), key: 'quantity' },
    { title: t('purchases.orders.shared.tableHeaders.tripDate'), key: 'trip_date' },
    { title: t('purchases.orders.shared.tableHeaders.vehicleType'), key: 'transport_type' },
    { title: t('purchases.orders.shared.tableHeaders.tripCount'), key: 'trip_no' },
    { title: t('purchases.orders.shared.tableHeaders.tripPrice'), key: 'trip_price' },
    { title: t('purchases.views.shared.grandTripPrice'), key: 'sub_total' },
])

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
