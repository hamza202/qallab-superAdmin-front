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
                    <router-link to="/sales/quotations/fuels/list" class="text-gray-600 hover:text-primary-600">
                        عروض أسعار المحروقات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ quotationName }}</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="archiveIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ quotationName }}</h1>
                                <p class="text-sm text-gray-600">تفاصيل عرض السعر والمعلومات الخاصة به</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs Navigation -->
                <div class="flex lg:items-center lg:justify-between py-4 border-b border-gray-200 flex-col lg:flex-row gap-3 px-6">
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
                            <h2 class="text-xl font-bold text-primary-900 mb-6">معلومات عرض السعر</h2>

                            <div class="flex flex-wrap gap-4">
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم عرض السعر</label>
                                    <p class="text-base font-semibold text-gray-900">{{ quotationName }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المسؤول</label>
                                    <p class="text-base font-semibold text-gray-900">{{ responsiblePerson }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">هاتف المسؤول</label>
                                    <p class="text-base font-semibold text-gray-900">{{ responsiblePhone }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ عرض السعر</label>
                                    <p class="text-base font-semibold text-gray-900">{{ quotationDateTime }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">صلاحية عرض السعر</label>
                                    <p class="text-base font-semibold text-gray-900">{{ quotationValidityNo }} يوم</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المشروع</label>
                                    <p class="text-base font-semibold text-gray-900">{{ projectName }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع المشروع</label>
                                    <p class="text-base font-semibold text-gray-900">{{ targetLocation }}</p>
                                </div>
                            </div>
                            <div class="flex gap-4 mt-4">
                                <div class="info-item-bordered px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">طريقة الدفع</label>
                                    <p class="text-sm text-gray-700 leading-relaxed">{{ paymentMethodLabel }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">دفعة مقدمة</label>
                                    <p class="text-sm text-gray-700 leading-relaxed flex gap-1 items-center">{{ upfrontPayment }} <span v-html="rialIcon"></span></p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">مدة رفع المستخلص</label>
                                    <p class="text-sm text-gray-700 leading-relaxed">{{ invoiceInterval }} يوم</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">مدة السداد</label>
                                    <p class="text-sm text-gray-700 leading-relaxed">{{ paymentTermNo }} يوم</p>
                                </div>
                            </div>
                            <div class="flex gap-4 mt-4">
                                <div class="info-item-bordered px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">غرامة التأخير</label>
                                    <p class="text-sm text-gray-700 leading-relaxed">{{ lateFeeFormatted }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">غرامة الإلغاء</label>
                                    <p class="text-sm text-gray-700 leading-relaxed">{{ cancelFeeFormatted }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Summary Section -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 justify-between lg:gap-20">
                            <!-- Summary (Right Side) -->
                            <div class="p-6">
                                <div class="flex items-center gap-2 mb-2 px-6 py-4 bg-primary-500 rounded-lg text-white">
                                    <span v-html="fileCheckIcon"></span>
                                    <h3 class="text-lg font-bold">ملخص عرض السعر</h3>
                                </div>

                                <div class="space-y-0 bg-white border !border-gray-100 rounded-lg !text-blue-900 text-lg font-bold">
                                    <div class="flex justify-between items-center py-4 px-6 border-b !border-gray-100">
                                        <span>المنتجات</span>
                                        <span>{{ summaryData.productsCount }}</span>
                                    </div>
                                    <div class="flex justify-between items-center py-4 px-6 border-b !border-gray-100">
                                        <span>طريقة الدفع</span>
                                        <span>{{ summaryData.paymentMethod }}</span>
                                    </div>
                                    <div class="flex justify-between items-center py-4 px-6">
                                        <span>دفعة مقدمة</span>
                                        <span>{{ summaryData.advancePayment }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Totals Table (Left Side) -->
                            <div class="p-6">
                                <div class="flex items-center gap-2 mb-2 px-6 py-4 bg-primary-500 rounded-lg text-white">
                                    <span v-html="CoinHandIcon"></span>
                                    <h3 class="text-lg font-bold">إجمالي المبالغ</h3>
                                </div>

                                <div class="bg-white rounded-2xl overflow-hidden border !border-gray-200">
                                    <table class="w-full">
                                        <thead>
                                            <tr class="bg-primary-400">
                                                <th class="text-white font-semibold text-base py-3 px-4 text-center border-l !border-gray-200">البند</th>
                                                <th class="text-white font-semibold text-base py-3 px-4 text-center">المبلغ</th>
                                            </tr>
                                        </thead>
                                        <tbody class="text-sm bg-primary-25">
                                            <tr class="border-b !border-gray-200">
                                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">المجموع قبل الخصم</td>
                                                <td class="py-4 px-4 text-center text-gray-600">{{ summaryTotals.subtotalBeforeDiscount }}</td>
                                            </tr>
                                            <tr class="border-b !border-gray-200">
                                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">الخصم</td>
                                                <td class="py-4 px-4 text-center text-gray-600">{{ summaryTotals.totalDiscount }}</td>
                                            </tr>
                                            <tr class="border-b !border-gray-200">
                                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">المجموع بعد الخصم</td>
                                                <td class="py-4 px-4 text-center text-gray-600">{{ summaryTotals.subtotalAfterDiscount }}</td>
                                            </tr>
                                            <tr class="border-b !border-gray-200">
                                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">اجمالي الضريبة</td>
                                                <td class="py-4 px-4 text-center text-gray-600">{{ summaryTotals.totalTaxAmount }}</td>
                                            </tr>
                                            <tr>
                                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">الإجمالي النهائي</td>
                                                <td class="py-4 px-4 font-bold text-center text-gray-900">{{ summaryTotals.finalTotal }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </v-tabs-window-item>

                    <!-- Tab 2: المنتجات المضافة -->
                    <v-tabs-window-item :value="1">
                        <div class="mb-8">
                            <div class="bg-primary-50 px-6 py-3">
                                <div class="flex items-center gap-2 text-primary-900">
                                    <span v-html="packageIcon"></span>
                                    <h2 class="text-lg font-bold">المنتجات</h2>
                                </div>
                            </div>

                            <!-- Products Table -->
                            <div class="mb-4">
                                <DataTable :headers="productHeaders" :items="productItems" />
                            </div>
                        </div>
                    </v-tabs-window-item>

                    <!-- Tab 3: بيانات التوريد -->
                    <v-tabs-window-item :value="2">
                        <div class="mb-8">
                            <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3">
                                <div class="flex items-center gap-2 text-primary-900">
                                    <span v-html="truckIcon"></span>
                                    <h2 class="text-lg font-bold">بيانات التوريد</h2>
                                </div>
                            </div>

                            <div class="mb-4">
                                <DataTable :headers="logisticsHeaders" :items="logisticsItems" />
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
import { rialIcon, archiveIcon, homeIcon, fileCheckIcon } from '@/components/icons/globalIcons'
import { truckIcon, packageIcon, CoinHandIcon } from '@/components/icons/priceOffersIcons'

const route = useRoute()
const api = useApi()
const { error } = useNotification()

const activeTab = ref(0)
const isLoading = ref(false)
const quotationData = ref<any>(null)
const paymentMethodItems = ref<{ title: string; value: string }[]>([])
const supplyTypeItems = ref<{ title: string; value: string }[]>([])
const deliveryMethodItems = ref<{ title: string; value: string }[]>([])
const itemUsingItems = ref<{ title: string; value: string }[]>([])
const feeTypeItems = ref<{ title: string; value: string }[]>([])

// Get route ID
const routeId = computed(() => route.params.id as string)

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/sales/quotations/constants')
        const data = res.data
        if (data) {
            if (data.payment_methods?.length) paymentMethodItems.value = data.payment_methods.map((i: any) => ({ title: i.label, value: i.key }))
            if (data.supply_types?.length) supplyTypeItems.value = data.supply_types.map((i: any) => ({ title: i.label, value: i.key }))
            if (data.delivered_methods?.length) deliveryMethodItems.value = data.delivered_methods.map((i: any) => ({ title: i.label, value: i.key }))
            if (data.item_usings?.length) itemUsingItems.value = data.item_usings.map((i: any) => ({ title: i.label, value: i.key }))
            if (data.fee_types?.length) feeTypeItems.value = data.fee_types.map((i: any) => ({ title: i.label, value: i.key }))
        }
    } catch (e) {
        console.error('Error fetching constants:', e)
    }
}

// Fetch quotation data
const fetchQuotationData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/sales/quotations/fuels/${routeId.value}`)
        quotationData.value = res.data
    } catch (e: any) {
        console.error('Error fetching quotation data:', e)
        error(e?.response?.data?.message || 'فشل تحميل بيانات عرض السعر')
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    await fetchConstants()
    await fetchQuotationData()
})

// Helper functions
const getPaymentMethodLabel = (key: string | null | undefined) => {
    if (!key) return '—'
    const item = paymentMethodItems.value.find((i: any) => i.value === key)
    return item?.title || key
}

const getSupplyTypeLabel = (key: string | null | undefined) => {
    if (!key) return '—'
    const item = supplyTypeItems.value.find((i: any) => i.value === key)
    return item?.title || key
}

const getDeliveredMethodLabel = (key: string | null | undefined) => {
    if (!key) return '—'
    const item = deliveryMethodItems.value.find((i: any) => i.value === key)
    return item?.title || key
}

const getItemUsingLabel = (key: string | null | undefined) => {
    if (!key) return '—'
    const item = itemUsingItems.value.find((i: any) => i.value === key)
    return item?.title || key
}

const getFeeTypeLabel = (key: string | null | undefined) => {
    if (!key) return ''
    const item = feeTypeItems.value.find((i: any) => i.value === key)
    return item?.title || key
}

// Format date to DD-MM-YYYY HH:mm
const formatDateTime = (dt: string | null | undefined): string => {
    if (!dt) return '—'
    const d = new Date(dt)
    if (isNaN(d.getTime())) return '—'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}-${month}-${year} ${hours}:${minutes}`
}

// Computed properties for display
const quotationName = computed(() => quotationData.value?.quotation_name || '—')
const projectName = computed(() => quotationData.value?.project_name || '—')
const responsiblePerson = computed(() => quotationData.value?.responsible_person || '—')
const responsiblePhone = computed(() => quotationData.value?.responsible_phone || '—')
const quotationDateTime = computed(() => formatDateTime(quotationData.value?.quotations_datetime))
const quotationValidityNo = computed(() => quotationData.value?.quotation_validity_no || '—')
const targetLocation = computed(() => quotationData.value?.target_location || '—')
const paymentMethodLabel = computed(() => getPaymentMethodLabel(quotationData.value?.payment_method))
const upfrontPayment = computed(() => quotationData.value?.upfront_payment ?? 0)
const invoiceInterval = computed(() => quotationData.value?.invoice_interval || '—')
const paymentTermNo = computed(() => quotationData.value?.payment_term_no || '—')

const lateFeeFormatted = computed(() => {
    const fee = quotationData.value?.late_fee
    const type = quotationData.value?.late_fee_type
    if (fee == null) return '—'
    const typeLabel = getFeeTypeLabel(type)
    return `${fee} ${typeLabel}`
})

const cancelFeeFormatted = computed(() => {
    const fee = quotationData.value?.cancel_fee
    const type = quotationData.value?.cancel_fee_type
    if (fee == null) return '—'
    const typeLabel = getFeeTypeLabel(type)
    return `${fee} ${typeLabel}`
})

// Products table
const productItems = computed(() => {
    if (!quotationData.value?.items) return []
    return quotationData.value.items.map((item: any) => ({
        id: item.id,
        item_name: item.item?.name || item.item_name || '—',
        unit: item.unit?.name || item.unit_name || '—',
        quantity: item.quantity || 0,
        item_using: getItemUsingLabel(item.item_using),
        unit_price: item.price_per_unit ?? '—',
        discount: item.discount_val ?? '—',
        tax: item.total_tax ?? '—',
        subtotal: item.subtotal_after_tax ?? '—',
    }))
})

// Logistics detail table
const logisticsItems = computed(() => {
    const data = quotationData.value
    if (!data) return []

    return [{
        id: 1,
        supply_type: getSupplyTypeLabel(data.supply_type),
        supply_interval: data.supply_interval ?? '—',
        delivered_interval: data.delivered_interval ?? '—',
        delivered_method: getDeliveredMethodLabel(data.delivered_method),
    }]
})

// Summary data
const summaryData = computed(() => ({
    productsCount: productItems.value.length,
    paymentMethod: paymentMethodLabel.value,
    advancePayment: upfrontPayment.value
}))

// Summary totals
const summaryTotals = computed(() => {
    const items = quotationData.value?.items || []
    const subtotalBeforeDiscount = items.reduce((sum: number, item: any) => {
        return sum + (Number(item.subtotal_before_discount) || 0)
    }, 0)
    const totalDiscount = items.reduce((sum: number, item: any) => sum + (Number(item.discount_val) || 0), 0)
    const subtotalAfterDiscount = items.reduce((sum: number, item: any) => {
        return sum + (Number(item.subtotal_after_discount) || 0)
    }, 0)
    const totalTaxAmount = items.reduce((sum: number, item: any) => sum + (Number(item.total_tax) || 0), 0)
    const finalTotal = items.reduce((sum: number, item: any) => {
        return sum + (Number(item.subtotal_after_tax) || 0)
    }, 0)

    return {
        subtotalBeforeDiscount: Math.round(subtotalBeforeDiscount * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        subtotalAfterDiscount: Math.round(subtotalAfterDiscount * 100) / 100,
        totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100
    }
})

// Tabs configuration
const tabs = [
    {
        title: 'المعلومات العامة',
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
        title: 'بيانات التوريد',
        value: 2,
        icon: `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 14V4.2C15 3.0799 15 2.51984 14.782 2.09202C14.5903 1.71569 14.2843 1.40973 13.908 1.21799C13.4802 1 12.9201 1 11.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V10.8C1 11.9201 1 12.4802 1.21799 12.908C1.40973 13.2843 1.71569 13.5903 2.09202 13.782C2.51984 14 3.0799 14 4.2 14H15ZM15 14H19.4C19.9601 14 20.2401 14 20.454 13.891C20.6422 13.7951 20.7951 13.6422 20.891 13.454C21 13.2401 21 12.9601 21 12.4V9.66274C21 9.41815 21 9.29586 20.9724 9.18077C20.9479 9.07873 20.9075 8.98119 20.8526 8.89172C20.7908 8.7908 20.7043 8.70432 20.5314 8.53137L18.4686 6.46863C18.2957 6.29568 18.2092 6.2092 18.1083 6.14736C18.0188 6.09253 17.9213 6.05213 17.8192 6.02763C17.7041 6 17.5818 6 17.3373 6H15M8 16.5C8 17.8807 6.88071 19 5.5 19C4.11929 19 3 17.8807 3 16.5C3 15.1193 4.11929 14 5.5 14C6.88071 14 8 15.1193 8 16.5ZM19 16.5C19 17.8807 17.8807 19 16.5 19C15.1193 19 14 17.8807 14 16.5C14 15.1193 15.1193 14 16.5 14C17.8807 14 19 15.1193 19 16.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
    },
]

// Tab helpers
const isTabActive = (tabValue: number) => activeTab.value === tabValue

// Table headers
const productHeaders = [
    { title: 'اسم المنتج', key: 'item_name' },
    { title: 'الوحدة', key: 'unit' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'الاستخدام', key: 'item_using' },
    { title: 'سعر الوحدة', key: 'unit_price' },
    { title: 'الخصم', key: 'discount' },
    { title: 'الضريبة', key: 'tax' },
    { title: 'إجمالي المبلغ', key: 'subtotal' },
]

const logisticsHeaders = [
    { title: 'نوع التوريد', key: 'supply_type' },
    { title: 'مدة التوريد (يوم)', key: 'supply_interval' },
    { title: 'مدة التسليم (يوم)', key: 'delivered_interval' },
    { title: 'طريقة التسليم', key: 'delivered_method' },
]
</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
