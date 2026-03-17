<template>
    <default-layout>
        <div class="product-view-page -mx-6 bg-qallab-dashboard-bg space-y-4">
            <!-- Page Header -->
            <TopHeader :icon="financeIcon" title-key="pages.banks.create" description-key="pages.banks.formDescription"
                :show-action="false" :code="isEditMode ? (code || '') : ''" :code-icon="fileIcon" />

            <!-- Basic Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100 m">
                <div class="flex items-center mb-4 gap-2 text-primary-600">
                    <span class="w-[18px]" v-html="fileCheckIcon"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>
                <div class="mb-2">
                    <v-form ref="formRef" class="space-y-4" v-model="isFormValid" @submit.prevent>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6">
                            <!-- Bank Name with Language Tabs -->
                            <div>
                                <LanguageTabs :languages="availableLanguages" label="الاسم">
                                    <template #en>
                                        <TextInput v-model="nameEn" placeholder="Enter bank name e.g. Al Rajhi Bank"
                                            :error-messages="formErrors['name.en']"
                                            @input="delete formErrors['name.en']" />
                                    </template>
                                    <template #ar>
                                        <TextInput v-model="nameAr" placeholder="أدخل اسم البنك"
                                            :error-messages="formErrors['name.ar']"
                                            @input="delete formErrors['name.ar']" />
                                    </template>
                                </LanguageTabs>
                            </div>

                            <!-- Code -->
                            <div>
                                <TextInput v-model="formData.code" label="الكود" placeholder="أدخل كود البنك"
                                    density="comfortable" variant="outlined" :error-messages="formErrors['code']"
                                    @input="delete formErrors['code']" />
                            </div>

                            <!-- SWIFT Code -->
                            <div>
                                <TextInput v-model="formData.swift_code" label="كود SWIFT" placeholder="125558966558"
                                    density="comfortable" variant="outlined" :error-messages="formErrors['swift_code']"
                                    @input="delete formErrors['swift_code']" />
                            </div>

                            <!-- Country Code -->
                            <div>
                                <SelectInput v-model="formData.country_code" label="الدولة" placeholder="اختر"
                                    :items="countryItems" density="comfortable" variant="outlined"
                                    :error-messages="formErrors['country_code']"
                                    @update:model-value="delete formErrors['country_code']" />
                            </div>

                            <!-- Currency (Multiple) -->
                            <div>
                                <MultipleSelectInput v-model="formData.currency" label="العملة"
                                    placeholder="اختر العملات" :items="currencyItems" density="comfortable"
                                    variant="outlined" :error-messages="formErrors['currency']"
                                    @update:model-value="delete formErrors['currency']" />
                            </div>

                            <!-- Status -->
                            <div>
                                <span class="text-sm font-semibold text-gray-700 mb-2 block">الحالة</span>
                                <v-radio-group v-model="formData.is_active" inline hide-details
                                    @update:model-value="delete formErrors['is_active']">
                                    <v-radio label="غير فعال" :value="0" color="primary" />
                                    <v-radio label="فعال" :value="1" color="primary" />
                                </v-radio-group>
                                <div v-if="formErrors['is_active']" class="text-error text-xs mt-1">
                                    {{ formErrors['is_active'] }}
                                </div>
                            </div>

                            <!-- Notes -->
                            <div class="md:col-span-2">
                                <TextareaInput v-model="formData.notes" placeholder="ملاحظات" label="ملاحظات"
                                    :error-messages="formErrors['notes']" @input="delete formErrors['notes']" />
                            </div>
                        </div>
                    </v-form>
                </div>
                <!-- Action Buttons -->
                <div class="mt-3 flex items-center justify-center gap-3">
                    <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                        <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                            custom-class="font-semibold text-base px-6 md:!px-10 min-w-56" :prepend-icon="saveIcon"
                            label="حفظ " @click="handleSubmit" :loading="loading" :disabled="loading" />

                        <ButtonWithIcon variant="flat" color="primary-50" rounded="4" height="48"
                            prepend-icon="mdi-close" :disabled="loading"
                            custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق"
                            @click="handleCancel" />
                    </div>
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

interface BankFormData {
    code: string
    swift_code: string
    country_code: string | null
    currency: string[]
    bank_branch: string[]
    is_active: number | boolean
    notes: string
}

interface BankPayload extends Omit<BankFormData, 'is_active'> {
    name: {
        en: string
        ar: string
    }
    is_active: number
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

const formData = ref<BankFormData>({
    code: '',
    swift_code: '',
    country_code: null,
    currency: [],
    bank_branch: ['1'],
    is_active: 1,
    notes: ''
})

const formErrors = ref<Record<string, string>>({})

const availableLanguages = ref<Language[]>([
    { code: 'en', name: 'En', flag: '/img/en.svg', dir: 'ltr' },
    { code: 'ar', name: 'AR', flag: '/img/sa.svg', dir: 'rtl' }
])

const currencyItems = ref<{ title: string; value: string | number }[]>([])
const countryItems = ref<{ title: string; value: string | number }[]>([])

const isEditMode = computed(() => !!route.params.id)

const fetchCountriesList = async () => {
    try {
        const response = await api.get('/countries/list')
        if (response.data && Array.isArray(response.data)) {
            countryItems.value = response.data.map((country: any) => ({
                title: country.name || country.title,
                value: String(country.id ?? country.value ?? '')
            }))
        }
    } catch (err: any) {
        console.error('Error fetching countries list:', err)
    }
}

const fetchCurrenciesList = async () => {
    try {
        const response = await api.get('/currencies/list')
        const list = Array.isArray(response.data) ? response.data : response.data?.data
        if (list && Array.isArray(list)) {
            currencyItems.value = list.map((currency: any) => ({
                title: currency.name || currency.title,
                value: String(currency.id ?? currency.value ?? '')
            }))
        }
    } catch (err: any) {
        console.error('Error fetching currencies list:', err)
    }
}

const fetchBank = async () => {
    if (!isEditMode.value) return

    try {
        loading.value = true
        const response = await api.get(`/banks/${route.params.id}`)
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
            nameAr.value = data.name || ''
            nameEn.value = nameEn.value || data.name || ''
        }
        formData.value.code = data.code || ''
        formData.value.swift_code = data.swift_code || ''
        formData.value.country_code = data.country_code != null ? String(data.country_code) : null
        formData.value.currency = Array.isArray(data.currency)
            ? data.currency.map((cur: any) => String(cur))
            : []
        formData.value.bank_branch = ['1']
        if (typeof data.is_active === 'boolean') {
            formData.value.is_active = data.is_active ? 1 : 0
        } else if (typeof data.is_active === 'number') {
            formData.value.is_active = data.is_active
        } else {
            formData.value.is_active = 1
        }
        formData.value.notes = data.notes || ''
        code.value = data.code || ''
    } catch (err: any) {
        console.error('Error fetching bank:', err)
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
        const payload: BankPayload = {
            name: {
                en: nameEn.value,
                ar: nameAr.value
            },
            code: formData.value.code,
            swift_code: formData.value.swift_code,
            notes: formData.value.notes,
            bank_branch: formData.value.bank_branch,
            currency: formData.value.currency.map(cur => String(cur)),
            country_code: formData.value.country_code != null ? String(formData.value.country_code) : null,
            is_active: Number(formData.value.is_active)
        }

        if (isEditMode.value) {
            payload._method = 'PUT';
            await api.put(`/banks/${route.params.id}`, payload)
            success('تم تحديث البنك بنجاح')
        } else {
            await api.post('/banks', payload)
            success('تم إضافة البنك بنجاح')
        }

        router.push({ name: 'BanksList' })
    } catch (err: any) {
        console.error('Error saving bank:', err)
        if (err?.response?.data?.errors) {
            formErrors.value = err.response.data.errors
        }
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات')
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    router.push({ name: 'BanksList' })
}

const financeIcon = `<svg width="47" height="42" viewBox="0 0 47 42" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.3333 5.83333C25.3333 8.22657 19.9981 10.1667 13.4167 10.1667C6.83527 10.1667 1.5 8.22657 1.5 5.83333M25.3333 5.83333C25.3333 3.4401 19.9981 1.5 13.4167 1.5C6.83527 1.5 1.5 3.4401 1.5 5.83333M25.3333 5.83333V9.08333M1.5 5.83333V31.8333C1.5 34.2266 6.83527 36.1667 13.4167 36.1667M13.4167 18.8333C13.0515 18.8333 12.6901 18.8274 12.3333 18.8157C6.25962 18.6166 1.5 16.7604 1.5 14.5M13.4167 27.5C6.83527 27.5 1.5 25.5599 1.5 23.1667M44.8333 19.9167C44.8333 22.3099 39.4981 24.25 32.9167 24.25C26.3353 24.25 21 22.3099 21 19.9167M44.8333 19.9167C44.8333 17.5234 39.4981 15.5833 32.9167 15.5833C26.3353 15.5833 21 17.5234 21 19.9167M44.8333 19.9167V36.1667C44.8333 38.5599 39.4981 40.5 32.9167 40.5C26.3353 40.5 21 38.5599 21 36.1667V19.9167M44.8333 28.0417C44.8333 30.4349 39.4981 32.375 32.9167 32.375C26.3353 32.375 21 30.4349 21 28.0417" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

onMounted(() => {
    fetchCountriesList()
    fetchCurrenciesList()
    fetchBank()
})
</script>
