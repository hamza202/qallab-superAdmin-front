<template>
    <default-layout>
        <div class="linked-view-page -mx-6">
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
                        طلبات مواد أولية
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">عرض الطلبيات
                        المرتبطة</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="linkIcon" class="text-primary-600 w-50"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">#{{ orderNumber }}</h1>
                                <p class="text-sm text-gray-600">عرض الطلبيات المرتبطة</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <!-- Linked Orders Section -->
                <div v-for="(linkedOrder, index) in linkedOrders" :key="linkedOrder.uuid" class="mb-6">
                    <!-- Order Header -->
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-primary-600">
                                <span v-html="documentIcon"></span>
                                <h2 class="text-base font-bold">
                                    تفاصيل الطلبية
                                </h2>
                            </div>
                        </div>
                    </div>

                    <!-- Order Information -->
                    <div class="p-6 border-b !border-gray-200">
                        <div class="flex flex-wrap gap-4">
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">كود طلبية مشتريات
                                    قلاب</label>
                                <p class="text-base font-semibold text-gray-900">{{ linkedOrder.purchase_code || '—' }}
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">كود طلبية مبيعات
                                    العميل</label>
                                <p class="text-base font-semibold text-gray-900">{{ linkedOrder.sales_code || '—' }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ الطلبية</label>
                                <p class="text-base font-semibold text-gray-900">{{ formatDate(linkedOrder.datetime) }}
                                </p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع المشروع</label>
                                <p class="text-base font-semibold text-gray-900">{{ linkedOrder.target_location }}</p>
                            </div>
                            <v-divider vertical class="my-6"></v-divider>
                            <div class="info-item-bordered flex-1 px-6 py-4">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد المنتجات</label>
                                <p class="text-base font-semibold text-gray-900">{{ linkedOrder.items?.length ?? 0 }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Products Table -->
                    <div>
                        <div class="bg-primary-50 px-6 py-3">
                            <div class="flex items-center gap-2 text-primary-600">
                                <span v-html="packageIcon"></span>
                                <h2 class="text-base font-bold">المنتجات</h2>
                            </div>
                        </div>
                        <div>
                            <DataTable :headers="productHeaders" :items="linkedOrder.items">
                                <template #item.discount="{ item }">
                                    <div class="flex items-center justify-start gap-1">
                                        <span class="text-gray-900 font-medium">{{ item.discount_val || 0 }}</span>
                                        <SarIcon :width="13" :height="15" color="#697586" />
                                    </div>
                                </template>
                            </DataTable>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="linkedOrders.length === 0 && !isLoading"
                    class="flex flex-col items-center justify-center py-16">
                    <span v-html="documentIcon" class="text-gray-300 mb-4"></span>
                    <p class="text-gray-500 text-lg">لا توجد طلبيات مرتبطة</p>
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
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { homeIcon, linkIcon, documentIcon, packageIcon } from '@/components/icons/globalIcons'
import SarIcon from "@/components/icons/SarIcon.vue";

const route = useRoute()
const router = useRouter()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const linkedOrdersData = ref<any[]>([])

// Get route params
const codes = computed(() => {
    const codesParam = route.query.codes as string
    return codesParam ? codesParam.split(',') : []
})

const category = computed(() => route.query.category as string)
const orderNumber = computed(() => codes.value[0] || '')

// Fetch linked orders data
const fetchLinkedOrders = async () => {
    if (codes.value.length === 0 || !category.value) return

    isLoading.value = true
    try {
        const codesQuery = codes.value.join(',')
        const res = await api.get<any>(
            `/purchases/orders/building-materials/link?category=${category.value}&codes=${codesQuery}&with_items=true`
        )
        linkedOrdersData.value = Array.isArray(res.data) ? res.data : []
    } catch (e: any) {
        console.error('Error fetching linked orders:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات الطلبيات المرتبطة')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchLinkedOrders()
})

// Computed properties for display
const linkedOrders = computed(() => {
    // Separate purchase and sales codes from the codes array
    const purchaseCode = codes.value.find(code => code.includes('PURCHASE')) || '—'
    const salesCode = codes.value.find(code => code.includes('SALES')) || '—'

    return linkedOrdersData.value.map((order: any) => {
        // Determine if it's a purchase or sales order
        const isPurchase = order.code?.includes('PURCHASE')

        return {
            uuid: order.uuid || '',
            code: order.code || '—',
            type: isPurchase ? 'purchase' : 'sales',
            datetime: order.po_datetime || order.so_datetime || '',
            status_name: order.status_name || '—',
            // Add both purchase and sales codes for display
            purchase_code: purchaseCode,
            sales_code: salesCode,
            // For sales orders, customer data might be in different format
            client_name: order.supplier_name || order.customer?.name || order.customer_name || '—',
            project_name: order.project_name || '—',
            target_location: order.target_location || '—',
            // Additional sales order fields
            product_building_no: order.product_building_no || '—',
            product_fuel_no: order.product_fuel_no || '—',
            items: (order.items || []).map((item: any) => ({
                id: item.id,
                item_name: item.item_name || '—',
                unit_name: item.unit_name || '—',
                quantity: item.quantity || 0,
                unit_price: item.price_per_unit || 0,
                discount: item.discount_val || 0,
                tax: item.total_tax || 0,
                subtotal: item.subtotal_after_tax || 0,
            }))
        }
    })
})

// Helper functions
const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US')
}

// Table headers
const productHeaders = [
    { title: 'اسم المنتج', key: 'item_name' },
    { title: 'الوحدة', key: 'unit_name' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'سعر الوحدة', key: 'unit_price' },
    { title: 'الخصم', key: 'discount' },
    { title: 'الضريبة', key: 'tax' },
    { title: 'إجمالي المبلغ', key: 'subtotal' },
]
</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
