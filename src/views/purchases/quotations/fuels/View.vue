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
                    <router-link to="/settings" class="text-gray-600 hover:text-primary-600">
                        المشتريات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/purchases/quotations/fuels/list"
                        class="text-gray-600 hover:text-primary-600">
                        عروض الأسعار
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ QuotationName ||
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
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ QuotationName || '--' }}</h1>
                                <p class="text-sm text-gray-600">تفاصيل عرض السعر والمعلومات الخاصة به</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <!-- Quotation Information Section -->
                <div class="p-6 border-b !border-gray-200">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">معلومات عرض السعر</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المورد</label>
                            <p class="text-base font-semibold text-gray-900">{{ supplierName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الفئة</label>
                            <p class="text-base font-semibold text-gray-900">{{ categoryLabel }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ عرض السعر</label>
                            <p class="text-base font-semibold text-gray-900">{{ quotationDateTime }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">المشروع</label>
                            <p class="text-base font-semibold text-gray-900">{{ projectName }}</p>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-4 mt-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع المشروع</label>
                            <p class="text-base font-semibold text-gray-900">{{ targetLocation }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">طريقة الدفع</label>
                            <p class="text-base font-semibold text-gray-900">{{ paymentMethodLabel }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الدفعة المقدمة</label>
                            <p class="text-sm text-gray-700 leading-relaxed flex gap-1 items-center">{{ upfrontPayment
                            }} <span v-html="rialIcon"></span></p>

                        </div>
                    </div>
                </div>

                <!-- Products Table Section -->
                <div>
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="packageIcon"></span>
                            <h2 class="text-base font-bold">جدول عناصر عرض السعر</h2>
                        </div>
                    </div>
                    <div>
                        <DataTable :headers="productHeaders" :items="productItems" />
                    </div>
                </div>

                <!-- Transport Details Section -->
                <div>
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="busIcon"></span>
                            <h2 class="text-base font-bold">تفاصيل التوريد</h2>
                        </div>
                    </div>
                    <div>
                        <DataTable :headers="transportHeaders" :items="transportItems" />
                    </div>
                </div>

                <!-- Additional Logistics Section -->
                <div v-if="hasAdditionalLogistics" class="mb-8">
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="truckIcon"></span>
                            <h2 class="text-base font-bold">بيانات التوريد الإضافية</h2>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex flex-wrap gap-4">
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ بدء النقل</label>
                                <p class="text-base font-semibold text-gray-900">{{ additionalLogistics.from_date }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ انتهاء النقل</label>
                                <p class="text-base font-semibold text-gray-900">{{ additionalLogistics.to_date }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">مدة التنفيذ</label>
                                <p class="text-base font-semibold text-gray-900">{{
                                    additionalLogistics.actual_execution_duration }} يوم</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع مركبة النقل</label>
                                <p class="text-base font-semibold text-gray-900">{{ additionalLogistics.vehicle_type }}
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد مركبات النقل</label>
                                <p class="text-base font-semibold text-gray-900">{{ additionalLogistics.transport_no }}
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد الرحلات الكلي</label>
                                <p class="text-base font-semibold text-gray-900">{{ additionalLogistics.trip_no }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التحميل</label>
                                <p class="text-base font-semibold text-gray-900">{{
                                    additionalLogistics.loading_responsible }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التنزيل</label>
                                <p class="text-base font-semibold text-gray-900">{{
                                    additionalLogistics.downloading_responsible }}</p>
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
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { rialIcon, archiveIcon, homeIcon } from '@/components/icons/globalIcons'
import { busIcon, truckIcon, packageIcon } from '@/components/icons/priceOffersIcons'
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
        const res = await api.get<any>(`/purchases/quotations/fuels/${routeId.value}`)
        quotationData.value = res.data
    } catch (e: any) {
        console.error('Error fetching quotation data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات عرض السعر')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchQuotationData()
})

// Computed properties for display
const quotationCode = computed(() => quotationData.value?.uuid || '')
const QuotationName = computed(() => quotationData.value?.quotation_name || '')
const projectName = computed(() => quotationData.value?.project_name || '—')
const categoryLabel = computed(() => quotationData.value?.category_label || '—')
const supplierName = computed(() => quotationData.value?.supplier?.name || '—')
const quotationDateTime = computed(() => {
    const dt = quotationData.value?.quotations_datetime
    return dt ? new Date(dt).toLocaleDateString('en-US') : '—'
})
const targetLocation = computed(() => quotationData.value?.target_location || '—')
const paymentMethodLabel = computed(() => quotationData.value?.payment_method_label || '—')
const upfrontPayment = computed(() => quotationData.value?.upfront_payment || 0)

// Products table
const productItems = computed(() => {
    if (!quotationData.value?.items) return []
    return quotationData.value.items.map((item: any) => ({
        id: item.id,
        item_name: item.item?.name || '—',
        unit: item.unit?.name || '—',
        quantity: item.quantity || 0,
        unit_price: item.price_per_unit || '—',
        discount: item.discount_val || '—',
        tax: item.total_tax || '—',
        subtotal: item.subtotal_after_tax || '—',
    }))
})

// Transport details table
const transportItems = computed(() => {
    if (!quotationData.value?.logistics_product_details) return []
    return quotationData.value.logistics_product_details.map((item: any) => ({
        id: item.id,
        item_name: item.item?.name || '—',
        quantity: item.quantity || 0,
        trip_start: item.trip_start ? new Date(item.trip_start).toLocaleDateString('ar-SA') : '—',
        number_of_trips: item.number_of_trips || 0,
        vehicle_type: Array.isArray(item.transport_type) ? item.transport_type.join(', ') : (item.transport_type || '—'),
        trip_capacity: item.trip_capacity || 0,
        trip_time: getAmPmIntervalName(item.am_pm_interval),
    }))
})

// Additional logistics
const hasAdditionalLogistics = computed(() => !!quotationData.value?.attached_logistics_detail)
const additionalLogistics = computed(() => {
    const logistics = quotationData.value?.attached_logistics_detail
    if (!logistics) return {}
    return {
        from_date: logistics.from_date ? new Date(logistics.from_date).toLocaleDateString('ar-SA') : '—',
        to_date: logistics.to_date ? new Date(logistics.to_date).toLocaleDateString('ar-SA') : '—',
        actual_execution_duration: logistics.actual_execution_duration || 0,
        vehicle_type: Array.isArray(logistics.transport_type) ? logistics.transport_type.join(', ') : (logistics.transport_type || '—'),
        transport_no: logistics.transport_no || 0,
        trip_no: logistics.trip_no || 0,
        loading_responsible: logistics.loading_responsible_party || '—',
        downloading_responsible: logistics.downloading_responsible_party || '—',
    }
})

// Helper functions
const getAmPmIntervalName = (interval: any) => {
    if (interval === 'am') return 'صباحاً'
    if (interval === 'pm') return 'مساءً'
    if (interval === 'both') return 'صباحاً ومساءً'
    return interval || '—'
}


// Table headers
const productHeaders = [
    { title: 'اسم المنتج', key: 'item_name' },
    { title: 'الوحدة', key: 'unit' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'سعر الوحدة', key: 'unit_price' },
    { title: 'الخصم', key: 'discount' },
    { title: 'الضريبة', key: 'tax' },
    { title: 'إجمالي المبلغ', key: 'subtotal' },
]

const transportHeaders = [
    { title: 'المنتج', key: 'item_name' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'تاريخ بداية النقل', key: 'trip_start' },
    { title: 'عدد الرحلات', key: 'number_of_trips' },
    { title: 'نوع مركبة النقل', key: 'vehicle_type' },
    { title: 'سعة الرحلة', key: 'trip_capacity' },
    { title: 'توقيت الرحلة', key: 'trip_time' },
]

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
