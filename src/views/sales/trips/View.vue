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
                    <router-link to="/sales/trips" class="text-gray-600 hover:text-primary-600">
                        قائمة الرحلات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ tripCode
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
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ tripCode }}</h1>
                                <p class="text-sm text-gray-600">تفاصيل الرحلة والمعلومات الخاصة بها</p>
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
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">شركة النقل</label>
                            <p class="text-base font-semibold text-gray-900">{{
                                tripData?.supplier_logistic_name || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع التحميل</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.source_location || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ / وقت التحميل</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.planned_arrival_loading || '—'
                                }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع التفريغ</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.target_location || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ / وقت التفريغ</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.planned_arrival_downloading ||
                                '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التحميل</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.loading_responsible_party ||
                                '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التفريغ</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.downloading_responsible_party
                                || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الكمية الكلية / طن</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.total_quantity_ton || 0 }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الكمية الكلية / م³</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.total_quantity_m3 || 0 }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">رقم بوليصة الشحن</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.bill_of_lading || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد مرات ارسال
                                الاحداثيات</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.tracking_no_point || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الفترة الزمنية</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.am_pm_interval_label || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">قيمة الرحلة</label>
                            <p class="text-base font-semibold text-gray-900 flex gap-1 items-center">{{
                                tripData?.trip_value || 0 }} <span v-html="rialIcon"></span></p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">ملاحظات</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.notes || 'لا يوجد' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Tab 3: المواد المنقولة -->
                <div>
                    <div class="bg-primary-50 px-6 py-4">
                        <div class="flex items-center gap-2 text-primary-900 font-bold">
                            <span class="w-[18px]" v-html="packageIcon"></span>
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
import { rialIcon, archiveIcon, homeIcon, fileCheckIcon } from '@/components/icons/globalIcons'
import { truckIcon, packageIcon } from '@/components/icons/priceOffersIcons'

const route = useRoute()
const api = useApi()
const { error } = useNotification()

const activeTab = ref(0)
const isLoading = ref(false)
const tripData = ref<any>(null)

// Get route ID
const routeId = computed(() => route.params.id as string)

// Fetch trip data
const fetchTripData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/sales/trips/${routeId.value}`)
        tripData.value = res.data
    } catch (e: any) {
        console.error('Error fetching trip data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات الرحلة')
    } finally {
        isLoading.value = false
    }
}

// Computed properties for display
const tripCode = computed(() => tripData.value?.code || '—')

// Items table
const itemsData = computed(() => {
    if (!tripData.value?.items) return []
    return tripData.value.items.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        quantity: item.quantity || 0,
        transport_type_label: item.transport_type_label || '—',
        transport_no: item.transport_no || '—',
        notes: item.notes || '—',
    }))
})


const itemHeaders = [
    { title: 'اسم المنتج', key: 'item_name' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'نوع النقل', key: 'transport_type_label' },
    { title: 'عدد النقلات', key: 'transport_no' },
    { title: 'ملاحظات', key: 'notes' },
]

onMounted(() => {
    fetchTripData()
})

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
