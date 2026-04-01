<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useNotification } from '@/composables/useNotification'
import TopHeader from '@/components/price-offers/TopHeader.vue'
import SarIcon from '@/components/icons/SarIcon.vue'
import { fileCheckIcon, fileIcon, packageIcon, fileAttachment } from '@/components/icons/globalIcons'
import { fileQuestionIcon } from '@/components/icons/priceOffersIcons'

const { t } = useI18n()
const route = useRoute()
const { error } = useNotification()

const isLoading = ref(false)
const paymentData = ref<any>(null)

const routeId = computed(() => route.params.id as string)

const fetchPaymentData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        paymentData.value = {
            code: '#123456',
            amount: 325412,
            created_at: '13/03/2026',
            created_time: '13:05:20',
            invoices_count: 2,
            client_balance: 325412,
            customer_name: t('sales.forms.paymentsDemo.company1'),
            payment_method: t('sales.forms.paymentsDemo.bankTransfer'),
            branch: t('sales.forms.paymentsDemo.branchMain'),
            notes: t('sales.forms.paymentsDemo.noteAdvance'),
            invoices: [
                {
                    id: '1',
                    created_at: '25/02/2026',
                    invoice_code: 'PURCHASE-INVOICE-00061',
                    invoice_type: 'purchases',
                    amount: 300,
                    currency: 'sar',
                    bank_id: '—'
                },
                {
                    id: '2',
                    created_at: '25/02/2026',
                    invoice_code: 'SALES-INVOICE-00061',
                    invoice_type: 'sales',
                    amount: 500,
                    currency: 'sar',
                    bank_id: '5'
                }
            ],
            attached_invoices: [
                {
                    id: '3',
                    created_at: '25/02/2026',
                    invoice_code: 'PURCHASE-INVOICE-00061',
                    invoice_type: 'purchases',
                    amount: 300,
                    currency: 'sar',
                    bank_id: '—'
                }
            ],
            balance_history: [
                {
                    created_at: '25/02/2026',
                    payment_datetime: '25/02/2026',
                    currency: 'sar',
                    amount: 2535,
                    direction: 'outbound'
                },
                {
                    created_at: '25/02/2026',
                    payment_datetime: '25/02/2026',
                    currency: 'sar',
                    amount: 5355,
                    direction: 'inbound'
                }
            ]
        }
    } catch (e: any) {
        console.error('Error fetching payment data:', e)
        error(e?.response?.data?.message || t('sales.forms.common.messages.loadPaymentFailed'))
    } finally {
        isLoading.value = false
    }
}

const paymentCode = computed(() => paymentData.value?.code || '—')
const totalInvoices = computed(() => paymentData.value?.invoices_count || 0)
const clientBalance = computed(() => paymentData.value?.client_balance || 0)

const invoiceHeaders = computed(() => [
    { title: t('sales.forms.common.labels.invoiceCreatedAt'), key: 'created_at' },
    { title: t('sales.forms.common.labels.amount'), key: 'amount' },
    { title: t('sales.forms.common.labels.currency'), key: 'currency' },
    { title: t('sales.forms.common.labels.invoiceCode'), key: 'invoice_code' },
    { title: t('sales.forms.viewPages.paymentView.invoiceBank'), key: 'bank_id' },
    { title: t('sales.forms.viewPages.paymentView.invoiceTypeCol'), key: 'invoice_type' },
])

const balanceHeadersFixed = computed(() => [
    { title: t('sales.forms.common.labels.invoiceCreatedAt'), key: 'created_at' },
    { title: t('sales.forms.viewPages.sections.paymentAt'), key: 'payment_datetime' },
    { title: t('sales.forms.viewPages.paymentView.directionCol'), key: 'direction' },
    { title: t('sales.forms.common.labels.amount'), key: 'amount' },
    { title: t('sales.forms.common.labels.currency'), key: 'currency' },
])

const invoiceTypeLabel = (type: string) => {
    if (type === 'sales') return t('sales.forms.paymentsDemo.invoiceTypeSales')
    if (type === 'purchases') return t('sales.forms.paymentsDemo.invoiceTypePurchases')
    return type
}

const currencyLabel = (c: string) => {
    if (c === 'sar' || c === 'SAR') return t('sales.forms.paymentsDemo.currencySar')
    return c || t('sales.forms.paymentsDemo.currencySar')
}

const invoicesData = computed(() => {
    if (!paymentData.value?.invoices) return []
    return paymentData.value.invoices.map((item: any, index: number) => ({
        id: index,
        created_at: item.created_at || '—',
        invoice_type: item.invoice_type,
        invoice_type_label: invoiceTypeLabel(item.invoice_type),
        invoice_code: item.invoice_code || '—',
        currency: currencyLabel(item.currency),
        amount: item.amount || 0,
        bank_id: item.bank_id || '—',
    }))
})

const attachedInvoicesData = computed(() => {
    if (!paymentData.value?.attached_invoices) return []
    return paymentData.value.attached_invoices.map((item: any, index: number) => ({
        id: index,
        created_at: item.created_at || '—',
        invoice_type: item.invoice_type,
        invoice_type_label: invoiceTypeLabel(item.invoice_type),
        invoice_code: item.invoice_code || '—',
        currency: currencyLabel(item.currency),
        amount: item.amount || 0,
        bank_id: item.bank_id || '—',
    }))
})

const directionLabel = (d: string) => {
    if (d === 'inbound') return t('sales.forms.paymentsDemo.directionInbound')
    if (d === 'outbound') return t('sales.forms.paymentsDemo.directionOutbound')
    return d
}

const balanceData = computed(() => {
    if (!paymentData.value?.balance_history) return []
    return paymentData.value.balance_history.map((item: any, index: number) => ({
        id: index,
        created_at: item.created_at || '—',
        payment_datetime: item.payment_datetime || item.date || '—',
        currency: currencyLabel(item.currency),
        amount: item.amount || 0,
        direction: item.direction,
        direction_label: directionLabel(item.direction),
    }))
})

const getDirectionClass = (direction: string) => {
    return direction === 'inbound' ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
}

const getInvoiceTypeClass = (type: string) => {
    return type === 'sales' ? 'bg-success-100 text-success-700' : 'bg-primary-100 text-primary-700'
}

const getDotTypeClass = (type: string) => {
    return type === 'sales' ? 'bg-success-700' : 'bg-primary-700'
}

onMounted(() => {
    fetchPaymentData()
})

</script>

<template>
    <default-layout>
        <div class="-mx-6 bg-qallab-dashboard-bg space-y-4">
            <TopHeader :icon="fileQuestionIcon" title-key="pages.SalesPayments.view"
                description-key="pages.SalesPayments.viewDescription" :code="paymentCode"
                :code-label="t('sales.forms.viewPages.paymentView.paymentNoLabel')"
                :show-action="false" />

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    class="bg-white rounded-3xl border !border-gray-100 !border-t-4 !border-t-primary-600 p-5 flex items-center justify-center gap-2 flex-col">
                    <p class="font-semibold text-gray-500">{{ t('sales.forms.viewPages.paymentView.grandTotal') }}</p>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-bold text-primary-600">{{ clientBalance.toLocaleString() }}</span>
                        <SarIcon :width="19" :height="18" color="#1570EF" />
                    </div>
                </div>

                <div
                    class="bg-white rounded-3xl text-gray-500 border !border-gray-100 !border-t-4 !border-t-success-600 p-5 flex items-center justify-center gap-2 flex-col">
                    <p class="font-semibold">{{ t('sales.forms.viewPages.paymentView.linkedInvoicesCount') }}</p>
                    <p class="text-2xl">
                        <span class="text-success-600 font-bold">
                            {{ totalInvoices }}
                        </span>
                        {{ t('sales.forms.viewPages.paymentView.invoices') }}
                    </p>
                </div>

                <div
                    class="bg-white text-gray-500 rounded-3xl border !border-gray-100 !border-t-4 !border-t-[#194185] p-5 flex items-center justify-center gap-2 flex-col">
                    <p class="font-semibold">{{ t('sales.forms.viewPages.paymentView.createdAt') }}</p>

                    <p class="text-lg flex items-center justify-center gap-1">
                        {{ paymentData?.created_at || '—' }}
                        <span class="w-[6px] h-[6px] bg-gray-500 rounded-circle inline-block"></span>
                        {{ paymentData?.created_time || '13:05:20' }}
                    </p>
                </div>
            </div>

            <!-- Main Invoice Table -->
            <div v-if="invoicesData.length > 0" class="bg-white pb-4 rounded-3xl border !border-gray-100 mx-2">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-2 text-primary-600">
                        <span v-html="fileIcon"></span>
                        <h2 class="text-base font-bold">{{ t('sales.forms.viewPages.paymentView.primaryInvoice') }}</h2>
                    </div>
                </div>
                <div class="mx-4 rounded-3xl overflow-hidden border border-gray-100">
                    <DataTable :headers="invoiceHeaders" :items="invoicesData">
                        <template #item.invoice_type="{ item }">
                            <span
                                :class="['inline-block px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1', getInvoiceTypeClass(item.invoice_type)]">
                                <span
                                    :class="['w-[6px] h-[6px] rounded-circle inline-block', getDotTypeClass(item.invoice_type)]"></span>
                                {{ item.invoice_type_label }}
                            </span>
                        </template>
                    </DataTable>
                </div>
            </div>

            <!-- Attached Invoice Table -->
            <div v-if="attachedInvoicesData.length > 0" class="bg-white pb-4 rounded-3xl border !border-gray-100 mx-2">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-2 text-primary-600">
                        <span v-html="fileAttachment"></span>
                        <h2 class="text-base font-bold">{{ t('sales.forms.viewPages.paymentView.attachedInvoice') }}</h2>
                    </div>
                </div>
                <div class="mx-4 rounded-3xl overflow-hidden border border-gray-100">
                    <DataTable :headers="invoiceHeaders" :items="attachedInvoicesData">
                        <template #item.invoice_type="{ item }">
                            <span
                                :class="['inline-block px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1', getInvoiceTypeClass(item.invoice_type)]">
                                <span
                                    :class="['w-[6px] h-[6px] rounded-circle inline-block', getDotTypeClass(item.invoice_type)]"></span>
                                {{ item.invoice_type_label }}
                            </span>
                        </template>
                    </DataTable>
                </div>
            </div>

            <!-- Balance Table -->
            <div v-if="balanceData.length > 0" class="bg-white pb-4 rounded-3xl border !border-gray-100 mx-2">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-2 text-primary-600">
                        <span v-html="packageIcon"></span>
                        <h2 class="text-base font-bold">{{ t('sales.forms.viewPages.paymentView.balance') }}</h2>
                    </div>
                </div>
                <div class="mx-4 rounded-3xl overflow-hidden border border-gray-100">
                    <DataTable :headers="balanceHeadersFixed" :items="balanceData">
                        <template #item.direction="{ item }">
                            <span
                                :class="['inline-block px-3 py-1.5 rounded-lg text-sm font-medium', getDirectionClass(item.direction)]">
                                {{ item.direction_label }}
                            </span>
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>

        <v-overlay :model-value="isLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>
    </default-layout>
</template>

<style scoped>
.info-item-bordered {
    min-width: 200px;
}
</style>
