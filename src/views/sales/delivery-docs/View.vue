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
                        المبيعات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/sales/delivery-docs/list" class="text-gray-600 hover:text-primary-600">
                        قائمة سندات التسليم
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ documentCode ||
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
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ documentCode || '--' }}</h1>
                                <p class="text-sm text-gray-600">تفاصيل سند التسليم والمعلومات الخاصة به</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <!-- Receiving Document Information Section -->
                <div class="p-6">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">البيانات الأساسية</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">كود طلبية المشتريات</label>
                            <p class="text-base font-semibold text-gray-900">{{ purchaseOrderCode }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">كود سند التسليم</label>
                            <p class="text-base font-semibold text-gray-900">{{ documentCode }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ التسليم</label>
                            <p class="text-base font-semibold text-gray-900">{{ receivingDocData?.receiving_date }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">حالة الإستلام</label>
                            <p class="text-base font-semibold text-gray-900">{{ statusLabel }}</p>
                        </div>
                    </div>
                </div>

                <!-- Items Table Section -->
                <div>
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span class="w-4" v-html="fileCheckIcon"></span>
                            <h2 class="text-base font-bold">جدول عناصر سند التسليم</h2>
                        </div>
                    </div>
                    <div>
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
const receivingDocData = ref<any>(null)

// Get route ID
const routeId = computed(() => route.params.id as string)

// Fetch receiving document data
const fetchReceivingDocData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/sales/delivery-docs/${routeId.value}`)
        receivingDocData.value = res.data
    } catch (e: any) {
        console.error('Error fetching receiving document data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات سند التسليم')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchReceivingDocData()
})

// Computed properties for display
const documentCode = computed(() => receivingDocData.value?.code || '—')
const purchaseOrderCode = computed(() => receivingDocData.value?.purchase_order_code || '—')
const statusLabel = computed(() => {
    const status = receivingDocData.value?.status_name
    if (status) return status
    return '—'
})

// Items table
const itemsData = computed(() => {
    if (!receivingDocData.value?.items) return []
    return receivingDocData.value.items.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        base_quantity: item.base_quantity || 0,
        quantity_from_supplier: item.quantity_from_supplier || 0,
        quantity_from_transport: item.quantity_from_transport || 0,
        quantity_from_customer: item.quantity_from_customer || 0,
    }))
})

// Table headers
const itemHeaders = [
    { title: 'اسم المنتج', key: 'item_name' },
    { title: 'الكمية الأساسية', key: 'base_quantity' },
    { title: 'الكمية من المورد', key: 'quantity_from_supplier' },
    { title: 'الكمية من النقل', key: 'quantity_from_transport' },
    { title: 'الكمية من العميل', key: 'quantity_from_customer' },
]

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
