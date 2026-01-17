<template>
    <default-layout>
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
            <div class="text-center">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="mt-4 text-gray-600">جاري تحميل بيانات الخدمة...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center min-h-[400px]">
            <div class="text-center">
                <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
                <p class="mt-4 text-red-600 text-lg">{{ error }}</p>
            </div>
        </div>

        <!-- Content -->
        <div v-else class="service-view-page -mx-6">
            <!-- Breadcrumb -->
            <div class="flex items-center gap-3 mb-6 text-sm px-6">
                <router-link to="/" class="text-gray-500 hover:text-primary-600">
                    <span v-html="homeIcon"></span>
                </router-link>
                <span class="text-lg text-gray-300">/</span>
                <router-link to="/simple-products/list" class="text-gray-600 hover:text-primary-600">
                    الخدمات
                </router-link>
                <span class="text-lg text-gray-300">/</span>
                <router-link to="/simple-products/list" class="text-gray-600 hover:text-primary-600">
                    جدول الخدمات
                </router-link>
                <span class="text-lg text-gray-300">/</span>

                <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ service.arabicName }}</span>
            </div>

            <!-- Page Header -->
            <div class="bg-white px-6 py-4 border-y border-gray-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                            <span v-html="serviceIcon" class="text-primary-600"></span>
                        </div>
                        <div>
                            <h1 class="text-lg font-bold text-gray-900 mb-1">{{ service.arabicName }}</h1>
                            <p class="text-sm text-gray-600">{{ service.arabicDescription }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- General Information Section -->
            <div class="p-6 border-b border-gray-200">
                <h2 class="text-xl font-bold text-primary-900 mb-6">المعلومات العامة</h2>

                <div class="flex flex-wrap gap-4">
                    <div class="info-item-bordered flex-1 px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">الاسم بالعربية</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.arabicName }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">الاسم بالانجليزية</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.englishName }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">كود الخدمة</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.serviceCode }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">حالة الخدمة</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.status }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">فئة الخدمة</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.category }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع الخدمة</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.serviceType }}</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="info-item-bordered flex-1 px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">الوصف بالانجليزي</label>
                        <p class="text-sm text-gray-700 leading-relaxed">{{ service.englishDescription }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">الوصف عربي</label>
                        <p class="text-sm text-gray-700 leading-relaxed">{{ service.arabicDescription }}</p>
                    </div>

                </div>
            </div>

            <!-- Tax Section -->
            <div class="p-6 border-b border-gray-200">
                <h2 class="text-xl font-bold text-primary-900 mb-6">الموعد والمدة</h2>
                <div class="flex flex-wrap gap-4">
                    <div class="info-item-bordered flex-1 px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">هل تحتاج موعد</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.requiresScheduling ? 'نعم' : 'لا' }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">مدة الخدمة</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.serviceDuration }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered px-6 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ التفعيل</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.activationDate }}</p>
                    </div>
                </div>
            </div>

            <!-- Service Status Section -->
            <div class="p-6 border-b border-gray-200">
                <h2 class="text-xl font-bold text-primary-900 mb-6">حالة الخدمة</h2>
                <div class="flex flex-wrap gap-4">
                    <div class="info-item-bordered flex-1 px-4 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">تتطلب موافقة</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.requiresApproval ? 'نعم' : 'لا' }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-4 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">قابلة للمقايضة</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.isBarter ? 'نعم' : 'لا' }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-4 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">قابلة للتجزئة</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.isPartialAllowed ? 'نعم' : 'لا' }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-4 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">متاحة للبيع</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.salesEnabled ? 'نعم' : 'لا' }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-4 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">متاحة للشراء</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.purchaseEnabled ? 'نعم' : 'لا' }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-4 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">متاحة للمشاريع</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.projectEnabled ? 'نعم' : 'لا' }}</p>
                    </div>
                    <v-divider vertical class="my-6"></v-divider>
                    <div class="info-item-bordered flex-1 px-4 py-4">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">مستوى الرؤية</label>
                        <p class="text-base font-semibold text-gray-900">{{ service.visibilityLevel }}</p>
                    </div>
                </div>
            </div>

            <!-- Additional Information Section -->
            <div class="p-6 border-b border-gray-200">
                <h2 class="text-xl font-bold text-primary-900 mb-6">بيانات اضافية </h2>
                <div class="flex gap-6 flex-wrap flex-column sm:!flex-row">
                    <div class="flex-1">
                        <label class="font-semibold text-sm text-gray-500 mb-2 block">ملاحظات</label>
                        <p class="text-sm font-semibold text-gray-900">
                            {{ service.notes || 'لا توجد ملاحظات' }}
                        </p>
                    </div>
                    <v-divider vertical class="hidden sm:block"></v-divider>
                    <div class="flex-1">
                        <div>
                            <div class="info-item">
                                <label class="font-semibold text-sm text-gray-500 mb-2 block">مستندات مرفقة</label>
                                <div
                                    class="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-gray-50">
                                    <div class="flex items-center gap-3">
                                        <v-icon size="24" class="text-primary-600">mdi-file-document-outline</v-icon>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">ملف مشروع البيت</p>
                                            <p class="text-xs text-gray-500">200 KB - 100% uploaded</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    </default-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const { get } = useApi()

interface ServiceResponse {
    status: number
    code: number
    locale: string
    message: string
    data: {
        id: number
        service_code: string
        name: string
        name_translations: {
            ar: string
            en: string
        }
        description: string
        description_translations: {
            ar: string
            en: string
        }
        service_domain: string | null
        service_category_id: number | null
        service_category: string | null
        service_type: string
        unit_id: number
        unit: string
        pricing_method: string
        unit_price: string
        min_quantity: number
        is_taxable: boolean
        tax_id: number
        tax: string
        tax_percentage: string
        requires_scheduling: boolean
        service_duration: number
        service_duration_unit: string
        requires_approval: boolean
        is_barter: boolean
        is_partial_allowed: boolean
        sales_enabled: boolean
        purchase_enabled: boolean
        project_enabled: boolean
        visibility_level: string
        is_active: boolean
        notes: string
        activation_date: string | null
    }
}

const loading = ref(false)
const error = ref<string | null>(null)

const serviceIcon = `<svg width="43" height="35" viewBox="0 0 43 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 8.5L28 8.5M28 8.5C28 12.0899 30.9102 15 34.5 15C38.0899 15 41 12.0899 41 8.5C41 4.91015 38.0899 2 34.5 2C30.9102 2 28 4.91015 28 8.5ZM15 25.8333L41 25.8333M15 25.8333C15 29.4232 12.0899 32.3333 8.5 32.3333C4.91015 32.3333 2 29.4232 2 25.8333C2 22.2435 4.91015 19.3333 8.5 19.3333C12.0899 19.3333 15 22.2435 15 25.8333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const service = ref({
    arabicName: '',
    englishName: '',
    serviceCode: '',
    status: '',
    category: '',
    serviceType: '',
    englishDescription: '',
    arabicDescription: '',
    unit: '',
    pricingMethod: '',
    unitPrice: '',
    minQuantity: 0,
    isTaxable: false,
    tax: '',
    taxPercentage: '',
    requiresScheduling: false,
    serviceDuration: '',
    serviceDurationUnit: '',
    activationDate: '',
    requiresApproval: false,
    isBarter: false,
    isPartialAllowed: false,
    salesEnabled: false,
    purchaseEnabled: false,
    projectEnabled: false,
    visibilityLevel: '',
    isActive: false,
    notes: ''
})

const fetchServiceDetails = async () => {
    const serviceId = route.params.id
    if (!serviceId) {
        error.value = 'Service ID is required'
        return
    }

    loading.value = true
    error.value = null

    try {
        const response = await get<ServiceResponse>(`/services/${serviceId}`)
        const data = response.data

        service.value = {
            arabicName: data.name_translations.ar,
            englishName: data.name_translations.en,
            serviceCode: data.service_code,
            status: data.is_active ? 'فعالة' : 'غير فعالة',
            category: data.service_category || 'غير محدد',
            serviceType: data.service_type === 'internal' ? 'داخلية' : 'خارجية',
            englishDescription: data.description_translations.en,
            arabicDescription: data.description_translations.ar,
            unit: data.unit,
            pricingMethod: data.pricing_method === 'fixed' ? 'ثابت' : 'متغير',
            unitPrice: data.unit_price,
            minQuantity: data.min_quantity,
            isTaxable: data.is_taxable,
            tax: data.tax,
            taxPercentage: data.tax_percentage,
            requiresScheduling: data.requires_scheduling,
            serviceDuration: `${data.service_duration} ${data.service_duration_unit === 'minute' ? 'دقيقة' : data.service_duration_unit === 'hour' ? 'ساعة' : data.service_duration_unit === 'day' ? 'يوم' : data.service_duration_unit === 'week' ? 'أسبوع' : 'شهر'}`,
            serviceDurationUnit: data.service_duration_unit,
            activationDate: data.activation_date || 'غير محدد',
            requiresApproval: data.requires_approval,
            isBarter: data.is_barter,
            isPartialAllowed: data.is_partial_allowed,
            salesEnabled: data.sales_enabled,
            purchaseEnabled: data.purchase_enabled,
            projectEnabled: data.project_enabled,
            visibilityLevel: data.visibility_level === 'public' ? 'عام' : 'خاص',
            isActive: data.is_active,
            notes: data.notes
        }
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to fetch service details'
        console.error('Error fetching service details:', err)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchServiceDetails()
})
</script>