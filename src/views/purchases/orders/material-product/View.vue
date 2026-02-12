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
                    <router-link to="/purchases/orders/material-product/list"
                        class="text-gray-600 hover:text-primary-600">
                        طلبات المشتريات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ orderCode }}</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="archiveIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ orderCode }}</h1>
                                <p class="text-sm text-gray-600">تفاصيل الطلبية والمعلومات الخاصة بها</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <!-- Order Information Section -->
                <div class="p-6 border-b !border-gray-200">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">معلومات الطلبية</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المورد</label>
                            <p class="text-base font-semibold text-gray-900">{{ supplierName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع الطلبية</label>
                            <p class="text-base font-semibold text-gray-900">{{ orderType }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ إنشاء الطلبية</label>
                            <p class="text-base font-semibold text-gray-900">{{ orderDateTime }}</p>
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
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">العقد</label>
                            <p class="text-base font-semibold text-gray-900">{{ contractNumber }}</p>
                        </div>
                    </div>
                </div>

                <!-- Products Table Section -->
                <div>
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span v-html="packageIcon"></span>
                            <h2 class="text-base font-bold">جدول عناصر الطلبية</h2>
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
import { archiveIcon, homeIcon } from '@/components/icons/globalIcons'
import { busIcon, truckIcon, packageIcon } from '@/components/icons/priceOffersIcons'
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const orderData = ref<any>(null)

// Get route ID
const routeId = computed(() => route.params.id as string)

// Fetch order data
const fetchOrderData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/purchases/orders/building-materials/${routeId.value}`)
        orderData.value = res.data
    } catch (e: any) {
        console.error('Error fetching order data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات الطلبية')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchOrderData()
})

// Computed properties for display
const orderCode = computed(() => orderData.value?.code || '')
const projectName = computed(() => orderData.value?.project_name || '—')
const orderType = computed(() => {
    const type = orderData.value?.po_type
    if (type === 'po_without_logistics') return 'شراء مع نقل'
    if (type === 'po_with_logistics') return 'شراء مع نقل'
    return type || '—'
})
const supplierName = computed(() => orderData.value?.supplier_name || '—')
const orderDateTime = computed(() => {
    const dt = orderData.value?.po_datetime
    return dt ? new Date(dt).toLocaleDateString('en-US') : '—'
})
const targetLocation = computed(() => orderData.value?.target_location || '—')
const contractNumber = computed(() => orderData.value?.contract_number || '—')
const paymentMethod = computed(() => {
    const method = orderData.value?.payment_method
    if (method === 'cash') return 'كاش'
    if (method === 'deferred') return 'آجل'
    return method || '—'
})
const upfrontPayment = computed(() => orderData.value?.upfront_payment || 0)
const finalTotal = computed(() => orderData.value?.final_total || '0')

// Products table
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

// Transport details table
const transportItems = computed(() => {
    if (!orderData.value?.po_logistics_product_details) return []
    return orderData.value.po_logistics_product_details.map((item: any) => ({
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

// Additional logistics
const hasAdditionalLogistics = computed(() => !!orderData.value?.po_attached_logistics_detail)
const additionalLogistics = computed(() => {
    const logistics = orderData.value?.po_attached_logistics_detail
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
