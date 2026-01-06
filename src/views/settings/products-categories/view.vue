<template>
    <default-layout>
        <div class="category-view-page -mx-6">
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
                <v-progress-circular indeterminate color="primary" size="64" />
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] px-6">
                <v-icon size="64" class="text-red-500 mb-4">mdi-alert-circle-outline</v-icon>
                <h3 class="text-xl font-bold text-gray-900 mb-2">حدث خطأ في تحميل البيانات</h3>
                <p class="text-gray-600 mb-4">{{ error }}</p>
                <v-btn color="primary" @click="fetchCategory">إعادة المحاولة</v-btn>
            </div>

            <!-- Content -->
            <div v-else>
                <!-- Breadcrumb -->
                <div class="flex items-center gap-3 mb-6 text-sm px-6">
                    <router-link to="/" class="text-gray-500 hover:text-primary-600">
                        <span v-html="homeIcon"></span>
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/settings" class="text-gray-600 hover:text-primary-600">
                        الإعدادات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/settings/products-categories" class="text-gray-600 hover:text-primary-600">
                        تصنيفات المنتجات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ category.name_translations?.ar || category.name }}</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="categoryIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ category.name_translations?.ar || category.name }}</h1>
                                <p class="text-sm text-gray-600">{{ category.name_translations?.en || 'تصنيف رئيسي من قائمة تصنيفات المنتجات' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- General Information Section -->
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-bold text-primary-900 mb-6">المعلومات العامة للتصنيف</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الاسم بالعربية</label>
                            <p class="text-base font-semibold text-gray-900">{{ category.name_translations?.ar || category.name || '-' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الاسم بالانجليزية</label>
                            <p class="text-base font-semibold text-gray-900">{{ category.name_translations?.en || '-' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">التصنيف الرئيسي</label>
                            <p class="text-base font-semibold text-gray-900">{{ category.parent_name || '-' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الحالة</label>
                            <p class="text-base font-semibold text-gray-900">
                                <span :class="category.is_active ? 'text-green-600' : 'text-red-600'">
                                    {{ category.is_active ? 'فعال' : 'غير فعال' }}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-4 mt-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الوصف بالانجليزي</label>
                            <p class="text-sm text-gray-700 leading-relaxed">{{ category.description_translations?.en || category.description || '-' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الوصف عربي</label>
                            <p class="text-sm text-gray-700 leading-relaxed">{{ category.description_translations?.ar || category.description || '-' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Tax Rules Section -->
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-bold text-primary-900 mb-6">الضرائب المضافة</h2>
                    
                    <div v-if="category.taxes && category.taxes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Tax 1 -->
                        <div v-for="(tax, index) in category.taxes" :key="tax.id" class="border border-gray-200 rounded-lg p-4">
                            <h3 class="text-lg font-bold text-primary-700 mb-4">ضريبة {{ index + 1 }}</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">الضريبة</span>
                                    <span class="text-base font-semibold text-gray-900">{{ tax.tax_name || 'ضريبة القيمة المضافة' }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">نسبة الضريبة</span>
                                    <span class="text-base font-semibold text-gray-900">{{ tax.percentage || '25' }} %</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">اقل قيمة</span>
                                    <span class="text-base font-semibold text-gray-900">{{ tax.minimum || '0' }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">الاولوية</span>
                                    <span class="text-base font-semibold" :class="tax.is_active ? 'text-green-600' : 'text-gray-400'">
                                        {{ tax.priority_label || (tax.is_active ? 'عالية' : 'غير فعال') }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center py-8 text-gray-500">
                        لا توجد ضرائب مضافة لهذا التصنيف
                    </div>
                </div>

                <!-- Attachments Section -->
                <div class="p-6">
                    <h2 class="text-xl font-bold text-primary-900 mb-6">المرفقات</h2>
                    
                    <div v-if="category.attachments && category.attachments.length > 0" class="space-y-3">
                        <p class="text-sm text-gray-600 mb-4">مستندات مرفقة</p>
                        <div v-for="attachment in category.attachments" :key="attachment.id" 
                             class="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                                    <v-icon color="primary">mdi-file-document-outline</v-icon>
                                </div>
                                <div>
                                    <p class="text-sm font-semibold text-gray-900">{{ attachment.name || 'منتج المشروع' }}</p>
                                    <p class="text-xs text-gray-500">{{ attachment.size || '200 KB' }} — {{ attachment.uploaded ? '100% uploaded' : 'جاري الرفع' }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <v-btn icon size="small" variant="text" color="success">
                                    <v-icon>mdi-download</v-icon>
                                </v-btn>
                                <v-btn icon size="small" variant="text" color="primary">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                                <v-btn icon size="small" variant="text" color="error">
                                    <v-icon>mdi-link-variant</v-icon>
                                </v-btn>
                                <v-btn icon size="small" variant="text" color="success">
                                    <v-icon>mdi-code-tags</v-icon>
                                </v-btn>
                            </div>
                        </div>
                    </div>
                    <div v-else class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <v-icon size="48" class="text-gray-400 mb-2">mdi-file-document-outline</v-icon>
                        <p class="text-gray-500">لا توجد مرفقات</p>
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
import { useNotification } from '@/composables/useNotification'

interface CategoryData {
    id: number
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
    image: string | null
    parent_id: number | null
    parent_name: string | null
    is_active: boolean
    taxes?: Array<{
        id: number
        tax_name: string
        tax_id: number
        percentage: string
        minimum: string | null
        priority: number
        priority_label: string
        is_active: boolean
    }>
    attachments?: Array<{
        id: number
        name: string
        size: string
        uploaded: boolean
    }>
}

const route = useRoute()
const api = useApi()
const { error: showError } = useNotification()

const loading = ref(false)
const error = ref<string | null>(null)

const categoryIcon = `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.12" d="M9.33337 18.6667H46.6667V37.8001C46.6667 41.7205 46.6667 43.6806 45.9038 45.178C45.2326 46.4952 44.1618 47.566 42.8446 48.2371C41.3473 49.0001 39.3871 49.0001 35.4667 49.0001H20.5334C16.613 49.0001 14.6528 49.0001 13.1554 48.2371C11.8383 47.566 10.7674 46.4952 10.0963 45.178C9.33337 43.6806 9.33337 41.7204 9.33337 37.8001V18.6667Z" fill="#1570EF"/>
<path d="M9.33329 18.6587C8.95061 18.6488 8.67272 18.6267 8.42287 18.577C6.57165 18.2088 5.12453 16.7616 4.75629 14.9104C4.66663 14.4596 4.66663 13.9175 4.66663 12.8333C4.66663 11.7491 4.66663 11.207 4.75629 10.7562C5.12453 8.90502 6.57165 7.4579 8.42287 7.08967C8.87367 7 9.41576 7 10.5 7H45.5C46.5842 7 47.1263 7 47.5771 7.08967C49.4283 7.4579 50.8754 8.90502 51.2436 10.7562C51.3333 11.207 51.3333 11.7491 51.3333 12.8333C51.3333 13.9175 51.3333 14.4596 51.2436 14.9104C50.8754 16.7616 49.4283 18.2088 47.5771 18.577C47.3272 18.6267 47.0493 18.6488 46.6666 18.6587M23.3333 30.3333H32.6666M9.33329 18.6667H46.6666V37.8C46.6666 41.7204 46.6666 43.6805 45.9037 45.1779C45.2326 46.4951 44.1617 47.5659 42.8446 48.237C41.3472 49 39.387 49 35.4666 49H20.5333C16.6129 49 14.6527 49 13.1554 48.237C11.8382 47.5659 10.7674 46.4951 10.0962 45.1779C9.33329 43.6805 9.33329 41.7204 9.33329 37.8V18.6667Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const category = ref<CategoryData>({
    id: 0,
    name: '',
    name_translations: { ar: '', en: '' },
    description: '',
    description_translations: { ar: '', en: '' },
    image: null,
    parent_id: null,
    parent_name: null,
    is_active: true,
    taxes: [],
    attachments: []
})

const fetchCategory = async () => {
    try {
        loading.value = true
        error.value = null
        const categoryId = route.params.id
        
        // TODO: Replace with actual API endpoint when backend is ready
        const response = await api.get<{
            status: boolean
            code: number
            message: string
            data: CategoryData
        }>(`/admin/api/categories/${categoryId}`)
        
        if (response.status && response.data) {
            category.value = response.data
        } else {
            throw new Error(response.message || 'فشل في تحميل بيانات التصنيف')
        }
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء تحميل البيانات'
        error.value = errorMessage
        showError(errorMessage)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchCategory()
})
</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
