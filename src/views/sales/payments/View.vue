<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNotification } from '@/composables/useNotification'
import TopHeader from '@/components/price-offers/TopHeader.vue'
import SarIcon from '@/components/icons/SarIcon.vue'
import { fileCheckIcon, fileIcon, packageIcon, fileAttachment } from '@/components/icons/globalIcons'
import { fileQuestionIcon } from '@/components/icons/priceOffersIcons'

const route = useRoute()
const { error } = useNotification()

const isLoading = ref(false)
const paymentData = ref<any>(null)

const routeId = computed(() => route.params.id as string)

const fetchPaymentData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        // Demo payment data
        paymentData.value = {
            code: '#123456',
            amount: 325412,
            created_at: '13/03/2026',
            created_time: '13:05:20',
            invoices_count: 2,
            client_balance: 325412,
            customer_name: 'شركة البناء الحديث',
            payment_method: 'تحويل بنكي',
            branch: 'الفرع الرئيسي',
            notes: 'دفعة مقدمة للفواتير المستحقة',
            invoices: [
                {
                    id: '1',
                    created_at: '25/02/2026',
                    invoice_code: 'PURCHASE-INVOICE-00061',
                    invoice_type: 'مشتريات',
                    amount: 300,
                    currency: 'ريال',
                    bank_id: '—'
                },
                {
                    id: '2',
                    created_at: '25/02/2026',
                    invoice_code: 'SALES-INVOICE-00061',
                    invoice_type: 'مبيعات',
                    amount: 500,
                    currency: 'ريال',
                    bank_id: '5'
                }
            ],
            attached_invoices: [
                {
                    id: '3',
                    created_at: '25/02/2026',
                    invoice_code: 'PURCHASE-INVOICE-00061',
                    invoice_type: 'مشتريات',
                    amount: 300,
                    currency: 'ريال',
                    bank_id: '—'
                }
            ],
            balance_history: [
                {
                    created_at: '25/02/2026',
                    payment_datetime: '25/02/2026',
                    currency: 'ريال',
                    amount: 2535,
                    direction: 'صادر'
                },
                {
                    created_at: '25/02/2026',
                    payment_datetime: '25/02/2026',
                    currency: 'ريال',
                    amount: 5355,
                    direction: 'وارد'
                }
            ]
        }
    } catch (e: any) {
        console.error('Error fetching payment data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات الدفعة')
    } finally {
        isLoading.value = false
    }
}

const paymentCode = computed(() => paymentData.value?.code || '—')
const totalInvoices = computed(() => paymentData.value?.invoices_count || 0)
const clientBalance = computed(() => paymentData.value?.client_balance || 0)

const invoiceHeaders = [
    { title: 'تاريخ الإنشاء', key: 'created_at' },
    { title: 'المبلغ', key: 'amount' },
    { title: 'العملة', key: 'currency' },
    { title: 'كود الفاتورة', key: 'invoice_code' },
    { title: 'مصرف الفاتورة', key: 'bank_id' },
    { title: 'نوع الفاتورة', key: 'invoice_type' },
]

const balanceHeaders = [
    { title: 'تاريخ الإنشاء', key: 'created_at' },
    { title: 'تاريخ الإنشاء', key: 'payment_datetime' },
    { title: 'الاتجاه', key: 'direction' },
    { title: 'المبلغ', key: 'amount' },
    { title: 'العملة', key: 'currency' },
]

const invoicesData = computed(() => {
    if (!paymentData.value?.invoices) return []
    return paymentData.value.invoices.map((item: any, index: number) => ({
        id: index,
        created_at: item.created_at || '—',
        invoice_type: item.invoice_type || 'مبيعات',
        invoice_code: item.invoice_code || '—',
        currency: item.currency || 'ريال',
        amount: item.amount || 0,
        bank_id: item.bank_id || '—',
    }))
})

const attachedInvoicesData = computed(() => {
    if (!paymentData.value?.attached_invoices) return []
    return paymentData.value.attached_invoices.map((item: any, index: number) => ({
        id: index,
        created_at: item.created_at || '—',
        invoice_type: item.invoice_type || 'مشتريات',
        invoice_code: item.invoice_code || '—',
        currency: item.currency || 'ريال',
        amount: item.amount || 0,
        bank_id: item.bank_id || '—',
    }))
})

const balanceData = computed(() => {
    if (!paymentData.value?.balance_history) return []
    return paymentData.value.balance_history.map((item: any, index: number) => ({
        id: index,
        created_at: item.created_at || '—',
        payment_datetime: item.payment_datetime || item.date || '—',
        currency: item.currency || 'ريال',
        amount: item.amount || 0,
        direction: item.direction || 'وارد',
    }))
})

const getDirectionClass = (direction: string) => {
    return direction === 'وارد' ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700';
}

const getInvoiceTypeClass = (type: string) => {
    return type === 'مبيعات' ? 'bg-success-100 text-success-700' : 'bg-primary-100 text-primary-700';
}

const getDotTypeClass = (type: string) => {
    return type === 'مبيعات' ? 'bg-success-700' : 'bg-primary-700';
}

onMounted(() => {
    fetchPaymentData()
})

</script>

<template>
    <default-layout>
        <div class="-mx-6 bg-qallab-dashboard-bg space-y-4">
            <TopHeader :icon="fileQuestionIcon" title-key="pages.SalesPayments.view"
                description-key="pages.SalesPayments.viewDescription" :code="paymentCode" code-label="رقم الدفعة"
                :show-action="false" />

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    class="bg-white rounded-3xl border !border-gray-100 !border-t-4 !border-t-primary-600 p-5 flex items-center justify-center gap-2 flex-col">
                    <p class="font-semibold text-gray-500">المبلغ الإجمالي</p>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-bold text-primary-600">{{ clientBalance.toLocaleString() }}</span>
                        <SarIcon :width="19" :height="18" color="#1570EF" />
                    </div>
                </div>

                <div
                    class="bg-white rounded-3xl text-gray-500 border !border-gray-100 !border-t-4 !border-t-success-600 p-5 flex items-center justify-center gap-2 flex-col">
                    <p class="font-semibold">عدد الفواتير المرتبطة</p>
                    <p class="text-2xl">
                        <span class="text-success-600 font-bold">
                            {{ totalInvoices }}
                        </span>
                        فواتير
                    </p>
                </div>

                <div
                    class="bg-white text-gray-500 rounded-3xl border !border-gray-100 !border-t-4 !border-t-[#194185] p-5 flex items-center justify-center gap-2 flex-col">
                    <p class="font-semibold">تاريخ الإنشاء</p>

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
                        <h2 class="text-base font-bold">الفاتورة الأساسية</h2>
                    </div>
                </div>
                <div class="mx-4 rounded-3xl overflow-hidden border border-gray-100">
                    <DataTable :headers="invoiceHeaders" :items="invoicesData">
                        <template #item.invoice_type="{ item }">
                            <span
                                :class="['inline-block px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1', getInvoiceTypeClass(item.invoice_type)]">
                                <span
                                    :class="['w-[6px] h-[6px] rounded-circle inline-block', getDotTypeClass(item.invoice_type)]"></span>
                                {{ item.invoice_type }}
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
                        <h2 class="text-base font-bold">الفاتورة الملحقة</h2>
                    </div>
                </div>
                <div class="mx-4 rounded-3xl overflow-hidden border border-gray-100">
                    <DataTable :headers="invoiceHeaders" :items="attachedInvoicesData">
                        <template #item.invoice_type="{ item }">
                            <span
                                :class="['inline-block px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1', getInvoiceTypeClass(item.invoice_type)]">
                                <span
                                    :class="['w-[6px] h-[6px] rounded-circle inline-block', getDotTypeClass(item.invoice_type)]"></span>
                                {{ item.invoice_type }}
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
                        <h2 class="text-base font-bold">الرصيد</h2>
                    </div>
                </div>
                <div class="mx-4 rounded-3xl overflow-hidden border border-gray-100">
                    <DataTable :headers="balanceHeaders" :items="balanceData">
                        <template #item.direction="{ item }">
                            <span
                                :class="['inline-block px-3 py-1.5 rounded-lg text-sm font-medium', getDirectionClass(item.direction)]">
                                {{ item.direction }}
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
