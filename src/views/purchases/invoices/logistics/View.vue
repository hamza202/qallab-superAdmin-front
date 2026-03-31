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
                        {{ t('purchases.invoices.view.shared.purchasesBreadcrumb') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/purchases/invoices/logistics/list" class="text-gray-600 hover:text-primary-600">
                        {{ t('purchases.invoices.view.shared.invoicesListCrumb') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ invoiceCode
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
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ invoiceCode }}</h1>
                                <p class="text-sm text-gray-600">{{ t('purchases.invoices.view.shared.subtitle') }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab Content -->
                <!-- Tab 1: المعلومات العامة -->
                <!-- General Information Section -->
                <div class="p-6">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">{{ t('purchases.invoices.view.shared.invoiceInfoSection') }}</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.invoices.form.labels.supplierName') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.supplier?.name || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.invoices.form.labels.poCategory') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.category_label || '—'
                                }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.invoices.form.labels.purchaseOrderCode') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.purchase_order_code || '—'
                                }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.invoices.view.shared.salesOrderCode') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.sales_codes.join(',    ') || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.invoices.form.labels.invoiceIssueDate') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.invoice_issues_datetime || '—'
                                }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.invoices.form.labels.invoiceDueDate') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.invoice_due_datetime || '—'
                                }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.invoices.form.labels.project') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.project_name || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.invoices.form.labels.statement') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.notes || '—' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Items Section -->
                <div>
                    <div class="bg-primary-50 px-6 py-4">
                        <div class="flex items-center gap-2 text-primary-600 font-bold">
                            <span class="w-[18px]" v-html="fileCheckIcon"></span>
                            <h2 class="text-base">{{ t('purchases.invoices.form.sections.itemsTable') }}</h2>
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
import { useI18n } from 'vue-i18n'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { rialIcon, archiveIcon, homeIcon, fileCheckIcon } from '@/components/icons/globalIcons'
import { truckIcon, packageIcon } from '@/components/icons/priceOffersIcons'

const route = useRoute()
const api = useApi()
const { error } = useNotification()
const { t } = useI18n()

const isLoading = ref(false)
const invoiceData = ref<any>(null)

// Get route ID
const routeId = computed(() => route.params.id as string)

// Fetch invoice data
const fetchInvoiceData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/purchases/invoices/logistics/${routeId.value}`)
        invoiceData.value = res.data
    } catch (e: any) {
        console.error('Error fetching invoice data:', e)
        error(e?.response?.data?.message || t('purchases.invoices.view.shared.loadError'))
    } finally {
        isLoading.value = false
    }
}

// Computed properties for display
const invoiceCode = computed(() => invoiceData.value?.code || '—')

// Items table
const itemsData = computed(() => {
    if (!invoiceData.value?.items) return []
    return invoiceData.value.items.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        unit_name: item.unit_name || '—',
        quantity: item.quantity || 0,
        price_per_unit: item.price_per_unit || 0,
        discount_val: item.discount_val || 0,
        taxable_amount: item.taxable_amount || 0,
        total_tax: item.total_tax || 0,
        subtotal_after_tax: item.subtotal_after_tax || 0,
    }))
})

const itemHeaders = computed(() => [
    { title: t('purchases.link.shared.table.productName'), key: 'item_name' },
    { title: t('purchases.shared.forms.common.tableHeaders.unit'), key: 'unit_name' },
    { title: t('purchases.link.shared.table.quantity'), key: 'quantity' },
    { title: t('purchases.link.shared.table.unitPrice'), key: 'price_per_unit' },
    { title: t('purchases.link.shared.table.discount'), key: 'discount_val' },
    { title: t('purchases.invoices.form.tableHeaders.taxableAmount'), key: 'taxable_amount' },
    { title: t('purchases.link.shared.table.taxAmount'), key: 'total_tax' },
    { title: t('purchases.link.shared.table.totalAmount'), key: 'subtotal_after_tax' },
])

onMounted(() => {
    fetchInvoiceData()
})

</script>

<style scoped>
.info-item-bordered {
    min-width: 200px;
}
</style>
