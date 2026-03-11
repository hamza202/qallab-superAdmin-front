<template>
    <default-layout>
        <div class="product-view-page -mx-6 bg-qallab-dashboard-bg space-y-4">
            <!-- Page Header -->
            <TopHeader :icon="financeIcon" title-key="pages.treasuries.create"
                description-key="pages.treasuries.formDescription" :show-action="false" 
                :code="isEditMode ? (code || '') : ''" :code-icon="fileIcon"/>

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

                            <!-- Branch -->
                            <div>
                                <SelectInput v-model="formData.branch_id" label="الفرع" placeholder="اختر الفرع"
                                    :items="branchOptions" density="comfortable" variant="outlined"
                                    :error-messages="formErrors['branch_id']"
                                    @update:model-value="delete formErrors['branch_id']" />
                            </div>

                            <!-- Currency -->
                            <div>
                                <SelectInput v-model="formData.currency_id" label="العملة" placeholder="اختر العملة"
                                    :items="currencyOptions" density="comfortable" variant="outlined"
                                    :error-messages="formErrors['currency_id']"
                                    @update:model-value="delete formErrors['currency_id']" />
                            </div>

                            <!-- Account -->
                            <div>
                                <SelectInput v-model="formData.account_id" label="الحساب"
                                    placeholder="اختر الحساب" :items="accountOptions" density="comfortable"
                                    variant="outlined" :error-messages="formErrors['account_id']"
                                    @update:model-value="delete formErrors['account_id']" />
                            </div>

                            <!-- Deposit -->
                            <div>
                                <span class="text-sm font-semibold text-gray-700 mb-2 block">إيداع</span>
                                <v-radio-group v-model="formData.deposit" inline hide-details
                                    @update:model-value="delete formErrors['deposit']">
                                    <v-radio label="لا" :value="0" color="primary" />
                                    <v-radio label="نعم" :value="1" color="primary" />
                                </v-radio-group>
                                <div v-if="formErrors['deposit']" class="text-error text-xs mt-1">
                                    {{ formErrors['deposit'] }}
                                </div>
                            </div>

                            <!-- Withdraw -->
                            <div>
                                <span class="text-sm font-semibold text-gray-700 mb-2 block">سحب</span>
                                <v-radio-group v-model="formData.withdraw" inline hide-details
                                    @update:model-value="delete formErrors['withdraw']">
                                    <v-radio label="لا" :value="0" color="primary" />
                                    <v-radio label="نعم" :value="1" color="primary" />
                                </v-radio-group>
                                <div v-if="formErrors['withdraw']" class="text-error text-xs mt-1">
                                    {{ formErrors['withdraw'] }}
                                </div>
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

                            <!-- Notes -->
                            <div class="md:col-span-3">
                                <TextareaInput v-model="formData.notes" placeholder="ملاحظات" label="ملاحظات"
                                    :error-messages="formErrors['notes']" @input="delete formErrors['notes']" />
                            </div>
                        </div>
                    </v-form>
                </div>
            </div>

            <!-- Balance and Verification Section -->
            <div class="bg-white rounded-3xl border !border-gray-100 pb-10">
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
                        label="حفظ " @click="handleSubmit" />

                    <ButtonWithIcon variant="flat" color="primary-50" rounded="4" height="48" prepend-icon="mdi-close"
                        custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق"
                        @click="handleCancel" />
                </div>
            </div>

        </div>
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
    deposit: number
    withdraw: number
    account_id: number | null
    is_settlement: number
    notes: string
    currency_id: number | null
}

interface TreasuryPayload extends TreasuryFormData {
    name: {
        en: string
        ar: string
    }
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

const nameEn = ref('')
const nameAr = ref('')

const formData = ref<TreasuryFormData>({
    branch_id: null,
    deposit: 1,
    withdraw: 1,
    account_id: null,
    is_settlement: 1,
    notes: '',
    currency_id: null
})

const formErrors = ref<Record<string, string>>({})

const availableLanguages = ref<Language[]>([
    { code: 'en', name: 'En', flag: '/img/en.svg', dir: 'ltr' },
    { code: 'ar', name: 'AR', flag: '/img/sa.svg', dir: 'rtl' }
])

const currencyOptions = ref([
    { title: 'ريال سعودي', value: 1 },
    { title: 'دولار أمريكي', value: 2 },
    { title: 'يورو', value: 3 },
    { title: 'جنيه إسترليني', value: 4 }
])

const branchOptions = ref([
    { title: 'فرع الرياض', value: 1 },
    { title: 'فرع جدة', value: 2 },
    { title: 'فرع مكة المكرمة', value: 3 },
    { title: 'فرع الدمام', value: 4 }
])

const accountOptions = ref([
    { title: 'حساب النقدية', value: 1 },
    { title: 'حساب البنك', value: 2 },
    { title: 'حساب المبيعات', value: 3 },
    { title: 'حساب المشتريات', value: 4 }
])

const isEditMode = computed(() => !!route.params.id)

const fetchTreasury = async () => {
    if (!isEditMode.value) return

    try {
        loading.value = true
        const response = await api.get(`/treasuries/${route.params.id}`)
        const data = response.data
        
        // Populate form data
        if (data.name) {
            nameEn.value = data.name.en || ''
            nameAr.value = data.name.ar || ''
        }
        formData.value.branch_id = data.branch_id || null
        formData.value.deposit = data.deposit ?? 1
        formData.value.withdraw = data.withdraw ?? 1
        formData.value.account_id = data.account_id || null
        formData.value.is_settlement = data.is_settlement ?? 1
        formData.value.notes = data.notes || ''
        formData.value.currency_id = data.currency_id || null
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
            branch_id: formData.value.branch_id,
            deposit: formData.value.deposit,
            withdraw: formData.value.withdraw,
            account_id: formData.value.account_id,
            is_settlement: formData.value.is_settlement,
            notes: formData.value.notes,
            currency_id: formData.value.currency_id
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

const balanceRecords = ref([
    {
        id: 1,
        balance: 15000,
        currency: 'SAR',
        verification_date: '2026-03-10',
    },
    {
        id: 2,
        balance: 8200,
        currency: 'USD',
        verification_date: '2026-03-08',
    },
]);

const tableItems = computed(() =>
    balanceRecords.value.map(record => ({
        id: record.id ?? '—',
        balance: record.balance ?? '—',
        currency: record.currency ?? '—',
        verification_date: record.verification_date ?? '—',
    }))
);
onMounted(() => {
    fetchTreasury()
})
</script>
