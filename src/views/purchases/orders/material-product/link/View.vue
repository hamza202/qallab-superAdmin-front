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
                    <router-link :to="`/purchases/orders/material-product/list`"
                        class="text-gray-600 hover:text-primary-600">
                        طلبيات مواد بناء أولية
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span @click="goBackToForm"
                        class="text-gray-600 hover:text-primary-600 cursor-pointer">#{{ orderNumber
                        }}</span>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">
                        الربط مع طلبيات العملاء
                    </span>

                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="archiveIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ purchaseOrderData?.customer?.name }}
                                </h1>
                                <p class="text-sm text-gray-600">
                                    {{ purchaseOrderData?.customer?.type === 'admin' ?
                                        'مدير النظام' : purchaseOrderData?.customer?.type === 'contractor' ? 'مقاول' : '' }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <!-- Linked Orders Section -->
                <div v-for="(linkedOrder, index) in linkedOrders" :key="linkedOrder.uuid" class="mb-6">
                    <!-- Order Header -->
                    <div class="px-6 py-3 mt-4">
                        <div>
                            <div class="flex gap-2 text-primary-600">
                                <span v-html="documentIcon"
                                    :class="linkedOrder.type === 'purchase' ? 'mt-1' : ''"></span>
                                <div>
                                    <h2 class="text-base font-bold">
                                        {{ linkedOrder.type === 'purchase' ? 'كود طلبية مشتريات قلاب'
                                            : 'كود طلبية مبيعات العميل' }}
                                        {{ linkedOrder.code }}
                                    </h2>
                                    <p class="text-slate-600 text-sm font-bold" v-if="linkedOrder.type === 'purchase'">
                                        المورد / {{ linkedOrder.supplier_name }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Products Table -->
                    <div>
                        <div class="bg-primary-50 px-6 py-3">
                            <div class="flex items-center gap-2 text-primary-900">
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
import { homeIcon, archiveIcon, documentIcon } from '@/components/icons/globalIcons'
import { packageIcon } from '@/components/icons/priceOffersIcons'
import SarIcon from "@/components/icons/SarIcon.vue";


const route = useRoute()
const router = useRouter()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const salesOrderData = ref<any>(null)
const purchaseOrderData = ref<any>(null)

// Get route params
const salesCode = computed(() => route.query.codes as string)
const purchaseUuid = computed(() => route.query.purchase_uuid as string)
const category = computed(() => route.query.category as string)
const sall_orders_code_from_index = computed(() => route.query.sall_orders_code_from_index as string)
const po_datetime = computed(() => route.query.po_datetime as string)
const orderNumber = computed(() => salesCode.value || '')

// Fetch sales order data
const fetchSalesOrder = async () => {
    if (!salesCode.value || !category.value) return

    try {
        const res = await api.get<any>(
            `/purchases/orders/building-materials/link?category=${category.value}&codes=${salesCode.value}&with_items=true`
        )
        salesOrderData.value = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null
    } catch (e: any) {
        console.error('Error fetching sales order:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات طلبية المبيعات')
    }
}

// Fetch purchase order data
const fetchPurchaseOrder = async () => {
    if (!purchaseUuid.value) return

    try {
        const res = await api.get<any>(
            `/purchases/orders/building-materials/link/${purchaseUuid.value}/details?with_items=true`
        )
        purchaseOrderData.value = res.data || null
    } catch (e: any) {
        console.error('Error fetching purchase order:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات طلبية المشتريات')
    }
}

// Fetch both orders
const fetchOrders = async () => {
    isLoading.value = true
    try {
        await Promise.all([fetchSalesOrder(), fetchPurchaseOrder()])
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchOrders()
})

// Computed properties for display
const linkedOrders = computed(() => {
    const orders = []

    // Add purchase order if available
    if (purchaseOrderData.value) {
        orders.push({
            uuid: purchaseOrderData.value.uuid || '',
            code: purchaseOrderData.value.code || '—',
            type: 'purchase',
            datetime: purchaseOrderData.value.po_datetime || '',
            status_name: purchaseOrderData.value.status_name || '—',
            supplier_name: purchaseOrderData.value.supplier.name || '—',
            customer_name: purchaseOrderData.value.customer.name || '—',
            target_location: purchaseOrderData.value.target_location || '—',
            items: (purchaseOrderData.value.items || []).map((item: any) => ({
                id: item.id,
                item_name: item.item_name || '—',
                unit_name: item.unit_name || '—',
                quantity: item.quantity || 0,
                unit_price: item.price_per_unit || 0,
                discount: item.discount_val || 0,
                tax: item.total_tax || 0,
                subtotal: item.subtotal_after_tax || 0,
            }))
        })
    }

    // Add sales order if available
    if (salesOrderData.value) {
        orders.push({
            uuid: salesOrderData.value.uuid || '',
            code: salesOrderData.value.code || '—',
            type: 'sales',
            datetime: salesOrderData.value.so_datetime || '',
            status_name: salesOrderData.value.status_name || '—',
            customer_name: salesOrderData.value.customer?.name || salesOrderData.value.customer_name || '—',
            target_location: salesOrderData.value.target_location || '—',
            items: (salesOrderData.value.items || []).map((item: any) => ({
                id: item.id,
                item_name: item.item_name || '—',
                unit_name: item.unit_name || '—',
                quantity: item.quantity || 0,
                unit_price: item.price_per_unit || 0,
                discount: item.discount_val || 0,
                tax: item.total_tax || 0,
                subtotal: item.subtotal_after_tax || 0,
            }))
        })
    }

    return orders
})

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

// ── Navigation ───────────────────────────────────────────────────
const goBackToForm = () => {
    if (purchaseUuid.value) {
        router.push({
            name: "OrdersMaterialProductLinkForm",
            params: { id: purchaseUuid.value },
            query: {
                sall_orders_code_from_index: sall_orders_code_from_index.value,
                category: category.value ?? undefined,
                po_datetime: po_datetime.value ?? undefined,
            },
        });
    } else {
        router.back();
    }
};

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
