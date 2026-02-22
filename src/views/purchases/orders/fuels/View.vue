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
                    <router-link to="/purchases/orders/fuels/list" class="text-gray-600 hover:text-primary-600">
                        طلبات عروض أسعار محروقات
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
                                <p class="text-sm text-gray-600">تفاصيل الطلب والمعلومات الخاصة به</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- General Information Section -->
                <div class="p-6">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">البيانات الأساسية</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع الطلبية</label>
                            <p class="text-base font-semibold text-gray-900">{{ orderType }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المسؤول</label>
                            <p class="text-base font-semibold text-gray-900">{{ responsiblePerson }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">هاتف المسؤول</label>
                            <p class="text-base font-semibold text-gray-900 dir-ltr text-end">{{ responsiblePhone }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ الطلبية</label>
                            <p class="text-base font-semibold text-gray-900">{{ requestDateTime }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">طريقة الدفع</label>
                            <p class="text-base font-semibold text-gray-900">{{ paymentMethod }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">مدة التوريد</label>
                            <p class="text-base font-semibold text-gray-900">{{ supplyInterval }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">مدة التسليم</label>
                            <p class="text-base font-semibold text-gray-900">{{ deliveredInterval }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع التوريد</label>
                            <p class="text-base font-semibold text-gray-900">{{ supplyType }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">حالة الطلبية</label>
                            <p class="text-base font-semibold text-gray-900">{{ statusName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المشروع</label>
                            <p class="text-base font-semibold text-gray-900">{{ projectName }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">كود عرض السعر</label>
                            <p class="text-base font-semibold text-gray-900">{{ quotationCode }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع تسليم المواد</label>
                            <p class="text-base font-semibold text-gray-900">{{ sourceLocation }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع الإستلام</label>
                            <p class="text-base font-semibold text-gray-900">{{ targetLocation }}</p>
                        </div>
                    </div>
                </div>

                <!-- Items Section -->
                <div>
                    <div class="bg-primary-50 px-6 py-4">
                        <div class="flex items-center gap-2 text-primary-600 font-bold">
                            <span class="w-[18px]" v-html="fileCheckIcon"></span>
                            <h2 class="text-base">المنتجات</h2>
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
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { archiveIcon, homeIcon, fileCheckIcon } from '@/components/icons/globalIcons'

const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const requestData = ref<any>(null)
const supplyTypeItems = ref<{ title: string; value: string | number }[]>([])
const deliveryMethodItems = ref<{ title: string; value: string | number }[]>([])

// Get route ID
const routeId = computed(() => route.params.id as string)

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/purchases/constants')
        const data = res.data
        if (data) {
            if (data.supply_types?.length) supplyTypeItems.value = data.supply_types.map((i: any) => ({ title: i.label, value: i.key }))
            const deliveryMethods = data.delivered_methods ?? data.delivery_methods
            if (deliveryMethods?.length) deliveryMethodItems.value = deliveryMethods.map((i: any) => ({ title: i.label, value: i.key }))
        }
    } catch (e) {
        console.error('Error fetching constants:', e)
    }
}

// Fetch request data
const fetchRequestData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/purchases/orders/fuels/${routeId.value}`)
        requestData.value = res.data
    } catch (e: any) {
        console.error('Error fetching request data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات الطلب')
    } finally {
        isLoading.value = false
    }
}

// Helpers for labels from constants
const getSupplyTypeName = (key: string | null | undefined) => {
    if (!key) return '—'
    const item = supplyTypeItems.value.find((i: any) => i.value === key)
    return item?.title || String(key)
}
const getDeliveredMethodName = (key: string | null | undefined) => {
    if (!key) return '—'
    const item = deliveryMethodItems.value.find((i: any) => i.value === key)
    return item?.title || String(key)
}

// Computed properties for display
const requestCode = computed(() => requestData.value?.code || '—')
const responsiblePerson = computed(() => requestData.value?.responsible_person || '—')
const responsiblePhone = computed(() => requestData.value?.responsible_phone || '—')
const requestDateTime = computed(() => requestData.value?.po_datetime || '—')
const targetLocation = computed(() => requestData.value?.target_location || '—')
const sourceLocation = computed(() => requestData.value?.source_location || '—')
const statusName = computed(() => requestData.value?.status_name || '—')
const projectName = computed(() => requestData.value?.project_name || '—')
const quotationCode = computed(() => requestData.value?.sale_quotation_code || '—')
const paymentMethod = computed(() => {
    const method = requestData.value?.payment_method
    if (method === 'cash') return 'نقدي'
    if (method === 'deferred') return 'آجل'
    return method || '—'
})

const orderType = computed(() => {
    const type = requestData.value?.po_type
    if (type === 'po_without_logistics') return 'طلبية بدون خدمة نقل'
    if (type === 'po_with_logistics') return 'طلبية مع خدمة نقل'
    return type || '—'
})

// Logistics details
const logisticsDetail = computed(() => requestData.value?.po_attached_logistics_detail || null)
const supplyType = computed(() => {
    const type = logisticsDetail.value?.supply_type
    return getSupplyTypeName(type)
})
const supplyInterval = computed(() => {
    const interval = logisticsDetail.value?.supply_interval
    return interval != null ? `${interval} يوم` : '—'
})
const deliveredInterval = computed(() => {
    const interval = logisticsDetail.value?.delivered_interval
    return interval != null ? `${interval} يوم` : '—'
})

// Items table data
const itemsData = computed(() => {
    if (!requestData.value?.items) return []
    return requestData.value.items.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        unit_name: item.unit_name || '—',
        quantity: item.quantity || 0,
        price_per_unit: item.price_per_unit || 0,
        discount_val: item.discount_val || 0,
        total_tax: item.total_tax || 0,
        subtotal_after_tax: item.subtotal_after_tax || 0,
        notes: item.notes || '—'
    }))
})


// Table headers
const itemHeaders = [
    { title: 'اسم المنتج', key: 'item_name' },
    { title: 'الوحدة', key: 'unit_name' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'سعر الوحدة', key: 'price_per_unit' },
    { title: 'خصم', key: 'discount_val' },
    { title: 'مبلغ الضريبة', key: 'total_tax' },
    { title: 'إجمالي المبلغ', key: 'subtotal_after_tax' },
    { title: 'ملاحظات', key: 'notes' },
]
onMounted(async () => {
    fetchConstants()
    await fetchRequestData()
})

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
