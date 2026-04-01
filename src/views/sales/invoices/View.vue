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
                        {{ t('sales.forms.viewPages.breadcrumb.sales') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/sales/invoices/material-product/list" class="text-gray-600 hover:text-primary-600">
                        {{ t('sales.forms.viewPages.lists.salesInvoices') }}
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
                                <p class="text-sm text-gray-600">{{ t('sales.forms.viewPages.subtitles.invoiceDetail') }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-6">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">{{ t('sales.forms.viewPages.sections.invoiceInfo') }}</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.customerName') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.customer_name || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.salesOrderCode') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.sale_order_code || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.invoiceCreatedAt') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.invoice_issues_datetime || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.invoiceIssueDate') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.invoice_due_datetime || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.invoiceDueDate') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.invoice_due_datetime || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.project') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.project_name || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.statement') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ invoiceData?.notes || '—' }}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="bg-primary-50 px-6 py-4">
                        <div class="flex items-center gap-2 text-primary-600 font-bold">
                            <span class="w-[18px]" v-html="fileCheckIcon"></span>
                            <h2 class="text-base">{{ t('sales.forms.common.sections.salesInvoiceItemsTable') }}</h2>
                        </div>
                    </div>

                    <div class="mb-8">
                        <DataTable :headers="itemHeaders" :items="itemsData" />
                    </div>
                </div>
            </div>
        </div>

        <v-overlay :model-value="isLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>
    </default-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { archiveIcon, homeIcon, fileCheckIcon } from '@/components/icons/globalIcons'

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const invoiceData = ref<any>(null)

const routeId = computed(() => route.params.id as string)

const fetchInvoiceData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/sales/invoices/${routeId.value}`)
        invoiceData.value = res.data
    } catch (e: any) {
        console.error('Error fetching invoice data:', e)
        error(e?.response?.data?.message || t('sales.forms.common.messages.loadInvoiceViewFailed'))
    } finally {
        isLoading.value = false
    }
}

const invoiceCode = computed(() => invoiceData.value?.code || '—')

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
    { title: t('common.form.productName'), key: 'item_name' },
    { title: t('common.form.unit'), key: 'unit_name' },
    { title: t('sales.forms.common.labels.quantity'), key: 'quantity' },
    { title: t('sales.forms.tables.invoiceSales.pricePerUnit'), key: 'price_per_unit' },
    { title: t('sales.forms.common.labels.discount'), key: 'discount_val' },
    { title: t('sales.forms.common.labels.taxableAmount'), key: 'taxable_amount' },
    { title: t('sales.forms.tables.invoiceSales.totalTax'), key: 'total_tax' },
    { title: t('sales.forms.tables.invoiceSales.totalOutTaxes'), key: 'subtotal_after_tax' },
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
