<template>
    <default-layout>
        <div class="product-view-page -mx-6 bg-qallab-dashboard-bg space-y-4">
            <!-- Page Header -->
            <TopHeader :icon="financeIcon" title-key="pages.treasuries.create"
                description-key="pages.treasuries.formDescription" :show-action="false"
                :code="isEditMode ? (code || '') : ''" :code-icon="fileIcon" />

            <!-- Basic Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100">
                <div class="flex items-center mb-4 gap-2 text-primary-600">
                    <span class="w-[18px]" v-html="fileCheckIcon"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>
                <div class="">
                    <v-form ref="formRef" class="space-y-4" v-model="isFormValid" @submit.prevent>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6">
                            <!-- Treasury Name with Language Tabs -->
                            <div>
                                <LanguageTabs :languages="availableLanguages" label="الاسم">
                                    <template #en>
                                        <TextInput v-model="nameEn" placeholder="Enter vault name e.g. Savings Vault"
                                            :error-messages="formErrors['name.en']"
                                            @input="delete formErrors['name.en']" />
                                    </template>
                                    <template #ar>
                                        <TextInput v-model="nameAr" placeholder="أدخل اسم الخزينة"
                                            :error-messages="formErrors['name.ar']"
                                            @input="delete formErrors['name.ar']" />
                                    </template>
                                </LanguageTabs>
                            </div>

                            <!-- Currency -->
                            <div>
                                <SelectInput v-model="formData.currency_id" label="العملة" placeholder="اختر العملة"
                                    :items="currencyItems" density="comfortable" variant="outlined"
                                    :error-messages="formErrors['currency_id']"
                                    @update:model-value="delete formErrors['currency_id']" />
                            </div>

                            <!-- Treasury Responsible -->
                            <div>
                                <SelectInput v-model="formData.manager_id" label="مسؤول الخزنة"
                                    placeholder="اختر الموظف المسؤول مثل علي محمد" :items="userItems"
                                    density="comfortable" variant="outlined"
                                    :error-messages="formErrors['manager_id']"
                                    @update:model-value="delete formErrors['manager_id']" />
                            </div>

                            <!-- Notes -->
                            <div class="md:col-span-2">
                                <TextareaInput v-model="formData.notes" placeholder="ملاحظات" label="ملاحظات"
                                    :error-messages="formErrors['notes']" @input="delete formErrors['notes']" />
                            </div>
                            <!-- Settlement -->
                            <div>
                                <span class="text-sm font-semibold text-gray-700 mb-2 block">خزينة تسوية</span>
                                <v-radio-group v-model="formData.is_settlement" inline hide-details
                                    @update:model-value="delete formErrors['is_settlement']">
                                    <v-radio label="لا" :value="0" color="primary" />
                                    <v-radio label="نعم" :value="1" color="primary" />
                                </v-radio-group>
                                <div v-if="formErrors['is_settlement']" class="text-error text-xs mt-1">
                                    {{ formErrors['is_settlement'] }}
                                </div>
                            </div>

                        </div>
                    </v-form>
                </div>
            </div>

            <!-- Balance and Verification Section (edit mode only) -->
            <div v-if="isEditMode" class="bg-white rounded-3xl border !border-gray-100 pb-10">
                <div class="px-6 pt-6 pb-2 flex items-center mb-4 gap-2 text-primary-600">
                    <span class="w-[18px]" v-html="fileCheckIcon"></span>
                    <h2 class="text-base font-bold">سجل ارصدة الخزينة وتاريخ التحقق</h2>
                </div>
                <div>
                    <!-- Balance Records Table -->
                    <DataTable :headers="headers" :items="tableItems" show-actions />
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-3 flex items-center justify-center gap-3">
                <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                    <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                        custom-class="font-semibold text-base px-6 md:!px-10 min-w-56" :prepend-icon="saveIcon"
                        :loading="loading" :disabled="loading" label="حفظ " @click="handleSubmit" />

                    <ButtonWithIcon variant="flat" color="primary-50" rounded="4" height="48" prepend-icon="mdi-close"
                       :disabled="loading"
                        custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق"
                        @click="handleCancel" />
                </div>
            </div>

        </div>

        <v-overlay :model-value="pageLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>
    </default-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import type { Language } from '@/components/common/forms/LanguageTabs.vue'
import { fileCheckIcon, fileIcon, saveIcon } from '@/components/icons/globalIcons'
import TopHeader from '@/components/price-offers/TopHeader.vue'

interface TreasuryFormData {
    branch_id: number | null
    deposit: number | null
    withdraw: number | null
    account_id: number | null
    is_settlement: number
    notes: string
    currency_id: number | null
    manager_id: number | null
}

interface TreasuryPayload extends Omit<TreasuryFormData, 'is_settlement'> {
    name: {
        en: string
        ar: string
    }
    is_settlement: boolean
    _method?: 'PUT'
}

const api = useApi()
const router = useRouter()
const route = useRoute()
const { success, error: errorNotification } = useNotification()

const loading = ref(false)
const formRef = ref()
const code = ref('')
const isFormValid = ref(false)
const pageLoading = ref(false)

const nameEn = ref('')
const nameAr = ref('')

const formData = ref<TreasuryFormData>({
    branch_id: 1,
    deposit: 1,
    withdraw: 1,
    account_id: 1,
    is_settlement: 1,
    notes: '',
    currency_id: null,
    manager_id: null
})

const formErrors = ref<Record<string, string>>({})

const availableLanguages = ref<Language[]>([
    { code: 'en', name: 'En', flag: '/img/en.svg', dir: 'ltr' },
    { code: 'ar', name: 'AR', flag: '/img/sa.svg', dir: 'rtl' }
])

const currencyItems = ref<{ title: string; value: number | string }[]>([])
const userItems = ref<{ title: string; value: number | string }[]>([])

const isEditMode = computed(() => !!route.params.id)

const fetchCurrenciesList = async () => {
    try {
        const response = await api.get('/currencies/list')
        const list = Array.isArray(response.data) ? response.data : response.data?.data
        if (list && Array.isArray(list)) {
            currencyItems.value = list.map((currency: any) => ({
                title: currency.name || currency.title,
                value: currency.id ?? currency.value
            }))
        }
    } catch (err: any) {
        console.error('Error fetching currencies list:', err)
    }
}

const fetchUsersList = async () => {
    try {
        const response = await api.get('/users')
        const list = Array.isArray(response.data) ? response.data : response.data?.data
        if (list && Array.isArray(list)) {
            userItems.value = list.map((user: any) => ({
                title: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                value: user.id
            }))
        }
    } catch (err: any) {
        console.error('Error fetching users list:', err)
    }
}

const fetchTreasury = async () => {
    if (!isEditMode.value) return

    try {
        loading.value = true
        const response = await api.get(`/treasuries/${route.params.id}`)
        const data = response.data

        // Populate form data
        const translations = data.name_translations
        if (translations && typeof translations === 'object') {
            nameEn.value = translations.en || ''
            nameAr.value = translations.ar || ''
        } else if (data.name && typeof data.name === 'object') {
            nameEn.value = data.name.en || ''
            nameAr.value = data.name.ar || ''
        } else if (typeof data.name === 'string') {
            nameEn.value = data.name
            nameAr.value = data.name
        }
        formData.value.branch_id = data.branch_id != null ? Number(data.branch_id) : 1
        formData.value.deposit = data.deposit != null ? Number(data.deposit) : 1
        formData.value.withdraw = data.withdraw != null ? Number(data.withdraw) : 1
        formData.value.account_id = data.account_id != null ? Number(data.account_id) : 1
        if (typeof data.is_settlement === 'boolean') {
            formData.value.is_settlement = data.is_settlement ? 1 : 0
        } else if (typeof data.is_settlement === 'number') {
            formData.value.is_settlement = data.is_settlement
        } else {
            formData.value.is_settlement = 1
        }
        formData.value.notes = data.notes || ''
        formData.value.currency_id = data.currency_id != null ? Number(data.currency_id) : null
        formData.value.manager_id = data.manager_id != null ? Number(data.manager_id) : null

        if (data.balance !== undefined && data.balance?.length > 1) {
            balanceRecords.value = [{
                id: data.id ?? '—',
                balance: data.balance,
                currency: data.currency ?? data.currency_code ?? null,
                verification_date: data.balance_verified_at ?? data.updated_at ?? null
            }]
        } else {
            balanceRecords.value = []
        }
    } catch (err: any) {
        console.error('Error fetching treasury:', err)
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات')
    } finally {
        loading.value = false
    }
}

const handleSubmit = async () => {
    try {
        loading.value = true
        formErrors.value = {}

        // Prepare payload
        const payload: TreasuryPayload = {
            name: {
                en: nameEn.value,
                ar: nameAr.value
            },
            branch_id: Number(formData.value.branch_id ?? 1),
            deposit: Number(formData.value.deposit ?? 1),
            withdraw: Number(formData.value.withdraw ?? 1),
            account_id: Number(formData.value.account_id ?? 1),
            is_settlement: formData.value.is_settlement === 1,
            notes: formData.value.notes,
            currency_id: formData.value.currency_id != null ? Number(formData.value.currency_id) : null,
            manager_id: formData.value.manager_id != null ? Number(formData.value.manager_id) : null
        }

        if (isEditMode.value) {
            payload._method = 'PUT';
            await api.put(`/treasuries/${route.params.id}`, payload)
            success('تم تحديث الخزينة بنجاح')
        } else {
            await api.post('/treasuries', payload)
            success('تم إضافة الخزينة بنجاح')
        }

        router.push({ name: 'TreasuriesList' })
    } catch (err: any) {
        console.error('Error saving treasury:', err)
        if (err?.response?.data?.errors) {
            formErrors.value = err.response.data.errors
        }
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات')
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    router.push({ name: 'TreasuriesList' })
}

const financeIcon = `<svg width="47" height="42" viewBox="0 0 47 42" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.3333 5.83333C25.3333 8.22657 19.9981 10.1667 13.4167 10.1667C6.83527 10.1667 1.5 8.22657 1.5 5.83333M25.3333 5.83333C25.3333 3.4401 19.9981 1.5 13.4167 1.5C6.83527 1.5 1.5 3.4401 1.5 5.83333M25.3333 5.83333V9.08333M1.5 5.83333V31.8333C1.5 34.2266 6.83527 36.1667 13.4167 36.1667M13.4167 18.8333C13.0515 18.8333 12.6901 18.8274 12.3333 18.8157C6.25962 18.6166 1.5 16.7604 1.5 14.5M13.4167 27.5C6.83527 27.5 1.5 25.5599 1.5 23.1667M44.8333 19.9167C44.8333 22.3099 39.4981 24.25 32.9167 24.25C26.3353 24.25 21 22.3099 21 19.9167M44.8333 19.9167C44.8333 17.5234 39.4981 15.5833 32.9167 15.5833C26.3353 15.5833 21 17.5234 21 19.9167M44.8333 19.9167V36.1667C44.8333 38.5599 39.4981 40.5 32.9167 40.5C26.3353 40.5 21 38.5599 21 36.1667V19.9167M44.8333 28.0417C44.8333 30.4349 39.4981 32.375 32.9167 32.375C26.3353 32.375 21 30.4349 21 28.0417" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const headers = [
    { title: 'الرصيد', key: 'balance' },
    { title: 'العملة', key: 'currency' },
    { title: 'تاريخ التحقق الحالي', key: 'verification_date' },
];

type BalanceRecord = {
    id: number | string
    balance: number | string | null
    currency?: string | null
    verification_date?: string | null
}

const balanceRecords = ref<BalanceRecord[]>([])

const tableItems = computed(() =>
    balanceRecords.value.map(record => ({
        id: record.id ?? '—',
        balance: record.balance ?? '—',
        currency: record.currency ?? '—',
        verification_date: record.verification_date ?? '—',
    }))
)

onMounted(async () => {
    pageLoading.value = true
    await Promise.all([fetchCurrenciesList(), fetchUsersList()])
    await fetchTreasury()
    pageLoading.value = false
})
</script>
