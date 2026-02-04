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
                        المشتريات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/purchases/requests/logistics/list" class="text-gray-600 hover:text-primary-600">
                        طلبات عروض أسعار خدمة نقل
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

                <!-- Tab Content -->
                <!-- Tab 1: المعلومات العامة -->
                <!-- General Information Section -->
                <div class="p-6">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">البيانات الاساسية</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المسؤول</label>
                            <p class="text-base font-semibold text-gray-900">{{ logisticsData?.responsible_person || '—'
                            }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">هاتف المسؤول</label>
                            <p class="text-base font-semibold text-gray-900 dir-ltr text-end">{{
                                logisticsData?.responsible_phone || '—'
                                }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ الطلب</label>
                            <p class="text-base font-semibold text-gray-900">{{ logisticsData?.request_datetime || '—'
                            }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">شركة النقل</label>
                            <p class="text-base font-semibold text-gray-900">{{ logisticsData?.supplier_name || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المشروع</label>
                            <p class="text-sm font-semibold text-gray-900">{{ logisticsData?.project_name || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">طريقة الدفع</label>
                            <p class="text-sm font-semibold text-gray-900">{{ paymentMethodLabel }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-borderedflex-1  px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">دفعة مقدمة</label>
                            <p class="text-sm font-semibold text-gray-900 flex gap-1 items-center">{{
                                logisticsData?.upfront_payment || 0 }} <span v-html="rialIcon"></span></p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع مصدر المواد</label>
                            <p class="text-sm font-semibold text-gray-900">{{ logisticsData?.source_location || '—' }}
                            </p>
                        </div>
                        <v-divider vertical classc="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع المشروع</label>
                            <p class="text-base font-semibold text-gray-900">{{ logisticsData?.target_location || '—' }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Tab 2: تفاصيل النقل -->
                <div class="">
                    <div class="bg-primary-50 px-6 py-4">
                        <div class="flex items-center gap-2 text-primary-900 font-bold">
                            <span v-html="packageIcon"></span>
                            <h2 class="text-base">تفاصيل النقل</h2>
                        </div>
                    </div>

                    <div v-for="(detail, index) in logisticsDetails" :key="index" class="p-4">
                        <div class="flex flex-wrap gap-4">
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع المواد
                                    المنقولة</label>
                                <p class="text-base font-semibold text-gray-900">{{
                                    getCategoryName(detail.material_type) }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد الرحلات</label>
                                <p class="text-base font-semibold text-gray-900">{{ detail.trip_no }} رحلة</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">مدة التنفيذ</label>
                                <p class="text-base font-semibold text-gray-900">{{ detail.actual_execution_interval }}
                                    يوم</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">أوقات النقل</label>
                                <p class="text-base font-semibold text-gray-900">{{ getAmPmLabel(detail.am_pm_interval)
                                    }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ بدء النقل</label>
                                <p class="text-base font-semibold text-gray-900">{{ detail.from_date }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ انتهاء النقل</label>
                                <p class="text-base font-semibold text-gray-900">{{ detail.to_date }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع مركبة النقل</label>
                                <p class="text-base font-semibold text-gray-900">{{
                                    getTransportTypeName(detail.transport_type) }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد مركبات النقل</label>
                                <p class="text-base font-semibold text-gray-900">{{ detail.transport_no }} مركبة</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التحميل</label>
                                <p class="text-sm font-semibold text-gray-900">{{ detail.loading_responsible_party }}
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التفريغ</label>
                                <p class="text-sm font-semibold text-gray-900">{{ detail.downloading_responsible_party
                                    }}</p>
                            </div>
                        </div>
                        <div class="flex gap-4 flex-wrap">
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع الاستلام</label>
                                <p class="text-sm font-semibold text-gray-900">{{ detail.source_location }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع التسليم</label>
                                <p class="text-sm font-semibold text-gray-900">{{ detail.target_location }}</p>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Tab 3: المواد المنقولة -->
                <div>
                    <div class="bg-primary-50 px-6 py-4">
                        <div class="flex items-center gap-2 text-primary-900 font-bold">
                            <span class="w-[18px]" v-html="fileCheckIcon"></span>
                            <h2 class="text-base">تفاصيل الطلب</h2>
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
import { rialIcon, archiveIcon, homeIcon, fileCheckIcon } from '@/components/icons/globalIcons'
import { truckIcon, packageIcon } from '@/components/icons/priceOffersIcons'

const route = useRoute()
const api = useApi()
const { error } = useNotification()

const activeTab = ref(0)
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
        const res = await api.get<any>(`/purchases/logistics/${routeId.value}`)
        logisticsData.value = res.data
    } catch (e: any) {
        console.error('Error fetching logistics data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات طلب النقل')
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
    if (method === 'cash') return 'نقدي'
    if (method === 'deferred') return 'آجل'
    return '—'
})

const logisticsDetails = computed(() => logisticsData.value?.logistics_detail || [])

// Summary data
const summaryData = computed(() => ({
    itemsCount: itemsData.value.length,
    logisticsCount: logisticsDetails.value.length,
}))

// Logistics table data
const logisticsTableData = computed(() => {
    return logisticsDetails.value.map((detail: any, index: number) => ({
        id: index + 1,
        material_type: getCategoryName(detail.material_type),
        trip_no: detail.trip_no,
        execution_interval: detail.actual_execution_interval,
        am_pm: getAmPmLabel(detail.am_pm_interval),
        from_date: detail.from_date,
        to_date: detail.to_date,
        transport_type: getTransportTypeName(detail.transport_type),
        transport_no: detail.transport_no,
        loading_party: detail.loading_responsible_party,
        downloading_party: detail.downloading_responsible_party,
        source_location: detail.source_location,
        target_location: detail.target_location,
    }))
})

const getCategoryName = (categories: number[]) => {
    if (!categories || categories.length === 0) return '—'

    // Get transport types from constants    
    return categories.map(categoryId => {
        const categoryItem = categoriesItems.value.find((t: any) => t.value == categoryId)
        return categoryItem?.title || categoryId.toString()
    }).join(', ')
}


const getTransportTypeName = (types: number[]) => {
    if (!types || types.length === 0) return '—'

    // Get transport types from constants
    const transportTypes = constantsData.value?.transport_types || []

    return types.map(typeId => {
        const transportType = transportTypes.find((t: any) => t.key == typeId)
        return transportType?.label || typeId.toString()
    }).join(', ')
}

const getAmPmLabel = (interval: string) => {
    if (!interval) return '—'

    // Get am/pm interval from constants
    const amPmIntervals = constantsData.value?.am_pm_interval || []
    const intervalObj = amPmIntervals.find((i: any) => i.key == interval)

    return intervalObj?.label || interval
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

// Tabs configuration
const tabs = [
    {
        title: 'المعلومات العامة للطلب',
        value: 0,
        icon: `<svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 11.5V5.8C17 4.11984 17 3.27976 16.673 2.63803C16.3854 2.07354 15.9265 1.6146 15.362 1.32698C14.7202 1 13.8802 1 12.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H9M11 10H5M7 14H5M13 6H5M11.5 18L13.5 20L18 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
    },
    {
        title: 'تفاصيل النقل',
        value: 1,
        icon: `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 14V4.2C15 3.0799 15 2.51984 14.782 2.09202C14.5903 1.71569 14.2843 1.40973 13.908 1.21799C13.4802 1 12.9201 1 11.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V10.8C1 11.9201 1 12.4802 1.21799 12.908C1.40973 13.2843 1.71569 13.5903 2.09202 13.782C2.51984 14 3.0799 14 4.2 14H15ZM15 14H19.4C19.9601 14 20.2401 14 20.454 13.891C20.6422 13.7951 20.7951 13.6422 20.891 13.454C21 13.2401 21 12.9601 21 12.4V9.66274C21 9.41815 21 9.29586 20.9724 9.18077C20.9479 9.07873 20.9075 8.98119 20.8526 8.89172C20.7908 8.7908 20.7043 8.70432 20.5314 8.53137L18.4686 6.46863C18.2957 6.29568 18.2092 6.2092 18.1083 6.14736C18.0188 6.09253 17.9213 6.05213 17.8192 6.02763C17.7041 6 17.5818 6 17.3373 6H15M8 16.5C8 17.8807 6.88071 19 5.5 19C4.11929 19 3 17.8807 3 16.5C3 15.1193 4.11929 14 5.5 14C6.88071 14 8 15.1193 8 16.5ZM19 16.5C19 17.8807 17.8807 19 16.5 19C15.1193 19 14 17.8807 14 16.5C14 15.1193 15.1193 14 16.5 14C17.8807 14 19 15.1193 19 16.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
    },
    {
        title: 'المواد المنقولة',
        value: 2,
        icon: `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.5005 6.13379L10.0005 10.856M10.0005 10.856L1.50046 6.13379M10.0005 10.856L10.0005 20.356M19.0005 14.9146V6.79749C19.0005 6.45484 19.0005 6.28352 18.95 6.13072C18.9053 5.99555 18.8323 5.87147 18.7359 5.76678C18.6268 5.64844 18.477 5.56524 18.1775 5.39883L10.7775 1.28772C10.4939 1.13017 10.3521 1.05139 10.2019 1.0205C10.069 0.993166 9.93195 0.993166 9.79904 1.0205C9.64887 1.05139 9.50707 1.13017 9.22346 1.28772L1.82346 5.39884C1.52394 5.56524 1.37417 5.64844 1.26512 5.76678C1.16865 5.87147 1.09564 5.99555 1.05097 6.13073C1.00049 6.28352 1.00049 6.45485 1.00049 6.79749V14.9146C1.00049 15.2572 1.00049 15.4286 1.05097 15.5814C1.09564 15.7165 1.16865 15.8406 1.26512 15.9453C1.37417 16.0636 1.52394 16.1468 1.82346 16.3132L9.22346 20.4244C9.50707 20.5819 9.64887 20.6607 9.79904 20.6916C9.93195 20.7189 10.069 20.7189 10.2019 20.6916C10.3521 20.6607 10.4939 20.5819 10.7775 20.4244L18.1775 16.3132C18.477 16.1468 18.6268 16.0636 18.7359 15.9453C18.8323 15.8406 18.9053 15.7165 18.95 15.5814C19.0005 15.4286 19.0005 15.2572 19.0005 14.9146Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
    },
]

// Tab helpers
const isTabActive = (tabValue: number) => activeTab.value === tabValue

// Table headers
const logisticsHeaders = [
    { title: 'نوع المواد', key: 'material_type' },
    { title: 'عدد الرحلات', key: 'trip_no' },
    { title: 'مدة التنفيذ', key: 'execution_interval' },
    { title: 'أوقات النقل', key: 'am_pm' },
    { title: 'من تاريخ', key: 'from_date' },
    { title: 'إلى تاريخ', key: 'to_date' },
    { title: 'نوع المركبة', key: 'transport_type' },
    { title: 'عدد المركبات', key: 'transport_no' },
    { title: 'مسؤول التحميل', key: 'loading_party' },
    { title: 'مسؤول التفريغ', key: 'downloading_party' },
]

const itemHeaders = [
    { title: 'اسم المنتج', key: 'item_name' },
    { title: 'الوحدة', key: 'unit_name' },
    { title: 'الكمية', key: 'quantity' },
]

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
