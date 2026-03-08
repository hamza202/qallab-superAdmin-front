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
                    <router-link to="/purchases/receiving-docs-logistics/list"
                        class="text-gray-600 hover:text-primary-600">
                        قائمة سندات استلام خدمات النقل
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
                                <p class="text-sm text-gray-600">تفاصيل سند الاستلام والمعلومات الخاصة به</p>
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
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">كود سند الاستلام</label>
                            <p class="text-base font-semibold text-gray-900">{{ documentCode }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ الاستلام</label>
                            <p class="text-base font-semibold text-gray-900">{{ receivingDocData?.receiving_date || '—'
                                }}</p>
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
                    <div class="bg-white px-6 py-3">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span class="w-4" v-html="fileCheckIcon"></span>
                            <h2 class="text-base font-bold">جدول عناصر سند الاستلام</h2>
                        </div>
                    </div>
                    <div>
                        <DataTable :headers="itemHeaders" :items="itemsData">
                            <template #item.vehicle_type_no_from_transport_label="{ item }">
                                <span v-for="(el, index) in item.vehicle_type_no_from_transport_label" :key="index"
                                    class="text-gray-900 text-sm font-medium">
                                    {{ el.transport_type_label }} : {{ el.transport_no }}
                                    <span v-if="Number(index) < item.vehicle_type_no_from_transport_label.length - 1">،
                                    </span>
                                </span>
                            </template>
                            <template #item.vehicle_type_no_from_customer_label="{ item }">
                                <span v-for="(el, index) in item.vehicle_type_no_from_customer_label" :key="index"
                                    class="text-gray-900 text-sm font-medium">
                                    {{ el.transport_type_label }} : {{ el.transport_no }}
                                    <span v-if="Number(index) < item.vehicle_type_no_from_customer_label.length - 1">،
                                    </span>
                                </span>
                            </template>
                        </DataTable>
                    </div>
                </div>

                <div class="my-6">
                    <h2 class="text-base font-bold text-primary-900 text-lg px-6 mb-3">المرفقات</h2>
                    <div class="px-6">
                        <div v-if="attachmentsData.length" class="space-y-4">
                            <div v-for="attachment in attachmentsData" :key="attachment.id"
                                class="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-primary-50/40 shadow-sm">
                                <div
                                    class="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                                    <span class="w-6" v-html="documentIcon"></span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-semibold text-gray-900 truncate" :title="attachment.name">
                                        {{ attachment.name }}
                                    </p>
                                    <p class="text-xs text-gray-500 mt-1">{{ attachment.meta }}</p>
                                </div>
                                <a v-if="attachment.url" :href="attachment.url" target="_blank" rel="noopener"
                                    class="text-primary-600 text-sm font-medium hover:underline">
                                    عرض
                                </a>
                                <span v-else class="text-xs text-gray-400">—</span>
                            </div>
                        </div>
                        <div v-else class="text-gray-500 text-sm">
                            لا توجد مرفقات لعرضها
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
import { archiveIcon, homeIcon, fileCheckIcon, documentIcon } from '@/components/icons/globalIcons'

interface VehicleLabel {
    transport_type_label: string
    transport_no: string | number
}

interface LogisticItem {
    id: number | string
    item_name?: string
    base_quantity?: number | string
    received_quantity?: number | string
    vehicle_type_no_from_transport_label?: VehicleLabel[] | null
    vehicle_type_no_from_customer_label?: VehicleLabel[] | null
}

interface ReceivingDoc {
    code?: string
    purchase_order_code?: string
    status_name?: string
    receiving_date?: string
    logistic_items?: LogisticItem[] | null
    attachment_file?: (AttachmentFile | string)[] | null
}

interface AttachmentFile {
    id?: number | string
    file_name?: string
    name?: string
    file_size?: number | string
    size?: number | string
    uploaded_percentage?: number
    progress?: number
    url?: string
    path?: string
    file_url?: string
}

interface AttachmentCard {
    id: string
    name: string
    meta: string
    url?: string
}

interface LogisticItemRow {
    id: number | string
    item_name: string
    base_quantity: number
    received_quantity: number
    vehicle_type_no_from_transport_label: VehicleLabel[]
    vehicle_type_no_from_customer_label: VehicleLabel[]
}
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const receivingDocData = ref<ReceivingDoc | null>(null)

// Get route ID
const routeId = computed(() => route.params.id as string)

// Fetch receiving document data
const fetchReceivingDocData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<{ data: ReceivingDoc }>(`/purchases/receiving-logistic-docs/${routeId.value}`)
        receivingDocData.value = res.data
    } catch (e: any) {
        console.error('Error fetching receiving document data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات سند الاستلام')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchReceivingDocData()
})

const formatFileSize = (value?: number | string): string => {
    if (value === undefined || value === null || value === '') return '—'
    if (typeof value === 'number') {
        if (value === 0) return '0 KB'
        const units = ['Bytes', 'KB', 'MB', 'GB']
        const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
        const sized = value / Math.pow(1024, index)
        return `${sized % 1 === 0 ? sized : sized.toFixed(1)} ${units[index]}`
    }
    return value
}

const attachmentsData = computed<AttachmentCard[]>(() => {
    const attachments = receivingDocData.value?.attachment_file
    if (!Array.isArray(attachments)) return []

    return attachments.map((attachment, index) => {
        if (typeof attachment === 'string') {
            const name = attachment.split('/').pop() || `مرفق ${index + 1}`
            return {
                id: String(index),
                name,
                meta: '— — 100% uploaded',
                url: attachment,
            }
        }

        const name = attachment.file_name || attachment.name || `مرفق ${index + 1}`
        const size = formatFileSize(attachment.file_size ?? attachment.size)
        const progress = attachment.uploaded_percentage ?? attachment.progress ?? 100
        const metaParts = [size !== '—' ? size : null, progress !== undefined ? `${progress}% uploaded` : null]
        const url = attachment.url || attachment.path || attachment.file_url || undefined

        return {
            id: String(attachment.id ?? index),
            name,
            meta: metaParts.filter(Boolean).join(' — ') || '—',
            url,
        }
    })
})

// Computed properties for display
const documentCode = computed(() => receivingDocData.value?.code ?? '—')
const purchaseOrderCode = computed(() => receivingDocData.value?.purchase_order_code ?? '—')
const statusLabel = computed(() => {
    const status = receivingDocData.value?.status_name
    if (status) return status
    return '—'
})

// Items table
const itemsData = computed<LogisticItemRow[]>(() => {
    const logisticItems = receivingDocData.value?.logistic_items ?? []
    return logisticItems.map((item) => ({
        id: item.id,
        item_name: item.item_name ?? '—',
        base_quantity: Number(item.base_quantity ?? 0),
        received_quantity: Number(item.received_quantity ?? 0),
        vehicle_type_no_from_transport_label: Array.isArray(item.vehicle_type_no_from_transport_label)
            ? item.vehicle_type_no_from_transport_label
            : [],
        vehicle_type_no_from_customer_label: Array.isArray(item.vehicle_type_no_from_customer_label)
            ? item.vehicle_type_no_from_customer_label
            : [],
    }))
})

// Table headers
const itemHeaders = [
    { title: 'اسم المنتج', key: 'item_name' },
    { title: 'الكمية الأساسية', key: 'base_quantity' },
    { title: 'الكمية الفعلية', key: 'received_quantity' },
    { title: 'المركبات الناقلة المرسلة', key: 'vehicle_type_no_from_transport_label' },
    { title: 'المركبات الناقلة المستلمة', key: 'vehicle_type_no_from_customer_label' },
]

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
