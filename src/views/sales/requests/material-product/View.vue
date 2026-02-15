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
                        المبيعات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/sales/requests/material-product/list"
                        class="text-gray-600 hover:text-primary-600">
                        طلبات عروض أسعار مواد بناء أولية
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
                                <p class="text-sm text-gray-600">طلب عرض سعر مواد بناء أولية</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs Navigation -->
                <div
                    class="flex lg:items-center lg:justify-between py-4 border-b border-gray-200 flex-col lg:flex-row gap-3 px-6">
                    <div class="flex gap-2 overflow-y-auto">
                        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" :class="[
                            'flex items-center gap-2 px-3.5 py-2.5 rounded-md transition-all',
                            isTabActive(tab.value)
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-400 hover:bg-gray-50',
                        ]">
                            <span v-html="tab.icon" class="w-6 h-6"></span>
                            <span class="text-base font-semibold whitespace-nowrap">{{ tab.title }}</span>
                        </button>
                    </div>
                </div>

                <!-- Tab Content -->
                <v-tabs-window v-model="activeTab">
                    <!-- Tab 1: المعلومات العامة -->
                    <v-tabs-window-item :value="0">
                        <!-- General Information Section -->
                        <div class="p-6 border-b !border-gray-200">
                            <h2 class="text-xl font-bold text-primary-900 mb-6">معلومات الطلب</h2>

                            <div class="flex flex-wrap gap-4">
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع الطلب</label>
                                    <p class="text-base font-semibold text-gray-900">{{ requestType }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المورد</label>
                                    <p class="text-base font-semibold text-gray-900">{{ supplierName }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ اصدار
                                        الطلب</label>
                                    <p class="text-base font-semibold text-gray-900">{{ requestDateTime }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">حالة الطلب</label>
                                    <p class="text-base font-semibold text-gray-900">
                                        <span>{{ statusText }}</span>
                                    </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع المشروع</label>
                                    <p class="text-base font-semibold text-gray-900">
                                        <span>{{ targetLocation }}</span>
                                    </p>
                                </div>
                            </div>
                            <div class="flex gap-4 mt-4">
                                <div class="info-item-bordered  px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">طريقة الدفع</label>
                                    <p class="text-sm text-gray-700 leading-relaxed">{{ paymentMethod }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">دفعة مقدمة</label>
                                    <p class="text-sm text-gray-700 leading-relaxed flex gap-1 items-center">{{ upfrontPayment }} <span
                                            v-html="rialIcon"></span></p>
                                </div>
                            </div>
                        </div>

                        <!-- Attachments and Summary Section -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 justify-between lg:gap-20">
                            <!-- Attachments (Right Side) -->
                            <div class=" p-6">
                                <div
                                    class="flex items-center gap-2 mb-6 px-6 py-4 bg-primary-500 rounded-lg text-white">
                                    <span v-html="UploadedFileIcon"></span>
                                    <h3 class="text-lg font-bold">مرفقات</h3>
                                </div>

                                <!-- Voice Message -->
                                <div class="rounded-xl bg-primary-50 px-4 py-6 mb-3 flex items-center justify-between">
                                    <div>
                                        <p class="text-primary-600 font-bold text-sm mb-2">رسالة صوتية</p>
                                        <p class="text-blue-900 font-bold text-base">00:49</p>
                                    </div>
                                    <ButtonWithIcon color="primary-500" iconOnly :icon="playIcon" height="75"
                                        variant="flat" class="!text-primary-900 font-bold" customClass="!h-unset" />

                                </div>
                                <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                                    <!-- Text Note -->
                                    <div class="rounded-lg border border-gray-100 lg:col-span-2 p-4">
                                        <p class="text-primary-600 font-bold text-sm mb-2">ملاحظة نصية</p>
                                        <p class="text-gray-400 font-medium text-sm">
                                            هل تود إرفاق بعض الملاحظات، قم بكتابتها هنا من فضلك وسيتم إرفاقها مع طلب عرض
                                            السعر المرسل
                                        </p>
                                    </div>

                                    <div class="rounded-md overflow-hidden">
                                        <v-img src="https://placehold.co/600x400"
                                            class="w-full h-full object-cover "></v-img>
                                    </div>
                                </div>
                            </div>

                            <!-- Summary (Left Side) -->
                            <div class=" p-6">
                                <div
                                    class="flex items-center gap-2 mb-2 px-6 py-4 bg-primary-500 rounded-lg text-white">
                                    <span v-html="fileCheckIcon"></span>
                                    <h3 class="text-lg font-bold">ملخص الطلب</h3>
                                </div>

                                <div
                                    class="space-y-0 bg-white border !border-gray-100 rounded-lg !text-blue-900 text-lg font-bold">
                                    <div class="flex justify-between items-center py-4 px-6 border-b !border-gray-100 ">
                                        <span class="">المنتجات</span>
                                        <span class="">{{ summaryData.productsCount }}</span>
                                    </div>
                                    <div class="flex justify-between items-center py-4 px-6 border-b !border-gray-100">
                                        <span class="">الخدمات</span>
                                        <span class="">{{ summaryData.servicesCount }}</span>
                                    </div>
                                    <div class="flex justify-between items-center py-4 px-6 border-b !border-gray-100">
                                        <span class="">طريقة الدفع</span>
                                        <span class="">{{ summaryData.paymentMethod }}</span>
                                    </div>
                                    <div class="flex justify-between items-center py-4 px-6">
                                        <span class="">دفعة مقدمة</span>
                                        <span class="">{{ summaryData.advancePayment }}</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </v-tabs-window-item>
                    <v-tabs-window-item :value="1">
                        <div class="mb-8">
                            <div class="bg-primary-50 px-6 py-3">
                                <div class="flex items-center gap-2 text-primary-900">
                                    <span v-html="packageIcon"></span>
                                    <h2 class="text-lg font-bold ">المنتجات</h2>
                                </div>
                            </div>

                            <!-- Products Table -->
                            <div class="mb-4">
                                <DataTable :headers="headers" :items="productItems" />
                            </div>
                        </div>
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="2">
                        <div class="mb-8">
                            <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3">
                                <div class="flex items-center gap-2 text-primary-900">
                                    <span v-html="truckIcon"></span>
                                    <h2 class="text-lg font-bold ">خدمة النقل</h2>
                                </div>
                            </div>

                            <!-- Transport Services Table -->
                            <div class="mb-4">
                                <DataTable :headers="ServicesHeaders" :items="transportServiceItems" />
                            </div>
                        </div>
                    </v-tabs-window-item>
                </v-tabs-window>
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
import { rialIcon , archiveIcon,homeIcon, fileCheckIcon} from '@/components/icons/globalIcons'
import { playIcon, UploadedFileIcon, truckIcon, packageIcon} from '@/components/icons/priceOffersIcons'
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const activeTab = ref(0)
const isLoading = ref(false)
const requestData = ref<any>(null)

// Get route ID
const routeId = computed(() => route.params.id as string)

// Fetch request data
const fetchRequestData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/sales/building-materials/${routeId.value}`)
        requestData.value = res.data
    } catch (e: any) {
        console.error('Error fetching request data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات الطلب')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchRequestData()
})

// Computed properties for display
const requestCode = computed(() => requestData.value?.code || '')
const requestType = computed(() => {
    const type = requestData.value?.request_type
    if (type === 'purchase_request_without_logistics') return 'طلب بدون خدمة نقل'
    if (type === 'purchase_request_with_logistics') return 'طلب مع خدمة نقل'
    return type || ''
})
const supplierName = computed(() => requestData.value?.supplier_name || '')
const requestDateTime = computed(() => {
    const dt = requestData.value?.request_datetime
    return dt ? new Date(dt).toLocaleDateString('en-US') : ''
})
const statusText = computed(() => requestData.value?.status_name || '--')
const targetLocation = computed(() => requestData.value?.target_location || '')
const paymentMethod = computed(() => {
    const method = requestData.value?.payment_method
    if (method === 'cash') return 'كاش'
    if (method === 'deferred') return 'آجل'
    return method || ''
})
const upfrontPayment = computed(() => requestData.value?.upfront_payment || 0)

// Products table
const productItems = computed(() => {
    if (!requestData.value?.items) return []
    return requestData.value.items.map((item: any) => ({
        id: item.id,
        name: item.item_name,
        quantity: item.quantity,
        unit: item.unit_name,
        transport_type: Array.isArray(item.transport_type_label) ? item.transport_type_label.join(', ') : (item.transport_type_label || '—'),
        daily_trips: item.trip_no || 0,
        notes: item.notes || 'لا يوجد',
    }))
})

// Transport service table
const transportServiceItems = computed(() => {
    const logistics = requestData.value?.logistics_detail
    if (!logistics || (!logistics.from_date && !logistics.to_date)) return []

    return [{
        id: 1,
        project_location: targetLocation.value,
        from_date: logistics.from_date ? new Date(logistics.from_date).toLocaleDateString('en-US') : '',
        to_date: logistics.to_date ? new Date(logistics.to_date).toLocaleDateString('en-US') : '',
        vehicle_type: Array.isArray(logistics.transport_type_label) ? logistics.transport_type_label.join(', ') : (logistics.transport_type_label || '—'),
        trip_time: getAmPmIntervalName(logistics.am_pm_interval),
        notes: logistics.notes || 'لا يوجد',
    }]
})

// Helper functions

const getAmPmIntervalName = (interval: any) => {
    if (interval === 'am') return 'صباحاً'
    if (interval === 'pm') return 'مساءً'
    if (interval === 'both') return 'صباحاً ومساءً'
    return interval || ''
}

// Summary data
const summaryData = computed(() => ({
    productsCount: productItems.value.length,
    servicesCount: transportServiceItems.value.length,
    paymentMethod: paymentMethod.value,
    advancePayment: upfrontPayment.value
}))


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
        title: 'المنتجات المضافة',
        value: 1,
        icon: `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.5005 6.13379L10.0005 10.856M10.0005 10.856L1.50046 6.13379M10.0005 10.856L10.0005 20.356M19.0005 14.9146V6.79749C19.0005 6.45484 19.0005 6.28352 18.95 6.13072C18.9053 5.99555 18.8323 5.87147 18.7359 5.76678C18.6268 5.64844 18.477 5.56524 18.1775 5.39883L10.7775 1.28772C10.4939 1.13017 10.3521 1.05139 10.2019 1.0205C10.069 0.993166 9.93195 0.993166 9.79904 1.0205C9.64887 1.05139 9.50707 1.13017 9.22346 1.28772L1.82346 5.39884C1.52394 5.56524 1.37417 5.64844 1.26512 5.76678C1.16865 5.87147 1.09564 5.99555 1.05097 6.13073C1.00049 6.28352 1.00049 6.45485 1.00049 6.79749V14.9146C1.00049 15.2572 1.00049 15.4286 1.05097 15.5814C1.09564 15.7165 1.16865 15.8406 1.26512 15.9453C1.37417 16.0636 1.52394 16.1468 1.82346 16.3132L9.22346 20.4244C9.50707 20.5819 9.64887 20.6607 9.79904 20.6916C9.93195 20.7189 10.069 20.7189 10.2019 20.6916C10.3521 20.6607 10.4939 20.5819 10.7775 20.4244L18.1775 16.3132C18.477 16.1468 18.6268 16.0636 18.7359 15.9453C18.8323 15.8406 18.9053 15.7165 18.95 15.5814C19.0005 15.4286 19.0005 15.2572 19.0005 14.9146Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
    },
    {
        title: 'بيانات النقل',
        value: 2,
        icon: `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 14V4.2C15 3.0799 15 2.51984 14.782 2.09202C14.5903 1.71569 14.2843 1.40973 13.908 1.21799C13.4802 1 12.9201 1 11.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V10.8C1 11.9201 1 12.4802 1.21799 12.908C1.40973 13.2843 1.71569 13.5903 2.09202 13.782C2.51984 14 3.0799 14 4.2 14H15ZM15 14H19.4C19.9601 14 20.2401 14 20.454 13.891C20.6422 13.7951 20.7951 13.6422 20.891 13.454C21 13.2401 21 12.9601 21 12.4V9.66274C21 9.41815 21 9.29586 20.9724 9.18077C20.9479 9.07873 20.9075 8.98119 20.8526 8.89172C20.7908 8.7908 20.7043 8.70432 20.5314 8.53137L18.4686 6.46863C18.2957 6.29568 18.2092 6.2092 18.1083 6.14736C18.0188 6.09253 17.9213 6.05213 17.8192 6.02763C17.7041 6 17.5818 6 17.3373 6H15M8 16.5C8 17.8807 6.88071 19 5.5 19C4.11929 19 3 17.8807 3 16.5C3 15.1193 4.11929 14 5.5 14C6.88071 14 8 15.1193 8 16.5ZM19 16.5C19 17.8807 17.8807 19 16.5 19C15.1193 19 14 17.8807 14 16.5C14 15.1193 15.1193 14 16.5 14C17.8807 14 19 15.1193 19 16.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
    },
]

// Tab helpers
const isTabActive = (tabValue: number) => activeTab.value === tabValue

// Table headers
const headers = [
    { title: 'اسم المنتج', key: 'name' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'الوحدة', key: 'unit' },
    { title: 'نوع الناقلة', key: 'transport_type' },
    { title: 'عدد الرحلات اليومية', key: 'daily_trips' },
    { title: 'ملاحظات', key: 'notes' },
]

const ServicesHeaders = [
    { title: 'موقع المشروع', key: 'project_location' },
    { title: 'من تاريخ', key: 'from_date' },
    { title: 'إلى تاريخ', key: 'to_date' },
    { title: 'نوع المركبات', key: 'vehicle_type' },
    { title: 'توقيت الرحلة', key: 'trip_time' },
    { title: 'ملاحظات', key: 'notes' },
]

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
