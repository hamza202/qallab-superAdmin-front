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
                <ButtonWithIcon color="primary" label="إعادة المحاولة" @click="fetchCategory" />
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
                    <router-link to="/settings/services-categories" class="text-gray-600 hover:text-primary-600">
                        تصنيفات الخدمات
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
                                <p class="text-sm text-gray-600">{{ category.name_translations?.en || 'تصنيف رئيسي من قائمة تصنيفات الخدمات' }}</p>
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
                            <p class="text-sm text-gray-700 leading-relaxed" v-html="category.description_translations?.en || category.description || '-'"></p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الوصف عربي</label>
                            <p class="text-sm text-gray-700 leading-relaxed" v-html="category.description_translations?.ar || category.description || '-'"></p>
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
                                    <p class="text-sm font-semibold text-gray-900">{{ attachment.name || 'خدمة المشروع' }}</p>
                                    <p class="text-xs text-gray-500">{{ attachment.size || '200 KB' }} — {{ attachment.uploaded ? '100% uploaded' : 'جاري الرفع' }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <ButtonWithIcon :icon="'mdi-download'" icon-only size="small" variant="text" color="success" />
                                <ButtonWithIcon :icon="'mdi-pencil'" icon-only size="small" variant="text" color="primary" />
                                <ButtonWithIcon :icon="'mdi-link-variant'" icon-only size="small" variant="text" color="error" />
                                <ButtonWithIcon :icon="'mdi-code-tags'" icon-only size="small" variant="text" color="success" />
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

const categoryIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 30.1667C27.2565 30.1667 30.1667 27.2565 30.1667 23.6667C30.1667 20.0768 27.2565 17.1667 23.6667 17.1667C20.0768 17.1667 17.1667 20.0768 17.1667 23.6667C17.1667 27.2565 20.0768 30.1667 23.6667 30.1667Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M38.2424 29.5758C37.9802 30.1698 37.902 30.8289 38.0179 31.4678C38.1337 32.1068 38.4383 32.6964 38.8924 33.1606L39.0106 33.2788C39.3769 33.6446 39.6674 34.0791 39.8657 34.5574C40.0639 35.0356 40.166 35.5482 40.166 36.0659C40.166 36.5836 40.0639 37.0962 39.8657 37.5745C39.6674 38.0527 39.3769 38.4872 39.0106 38.853C38.6447 39.2193 38.2103 39.5099 37.732 39.7081C37.2538 39.9064 36.7412 40.0084 36.2235 40.0084C35.7058 40.0084 35.1932 39.9064 34.7149 39.7081C34.2367 39.5099 33.8022 39.2193 33.4364 38.853L33.3182 38.7348C32.854 38.2808 32.2644 37.9761 31.6254 37.8603C30.9864 37.7444 30.3274 37.8226 29.7333 38.0848C29.1508 38.3345 28.6539 38.7491 28.3039 39.2776C27.954 39.806 27.7662 40.4253 27.7636 41.0591V41.3939C27.7636 42.4387 27.3486 43.4407 26.6098 44.1795C25.871 44.9183 24.869 45.3333 23.8242 45.3333C22.7794 45.3333 21.7774 44.9183 21.0387 44.1795C20.2999 43.4407 19.8848 42.4387 19.8848 41.3939V41.2167C19.8696 40.5647 19.6586 39.9324 19.2792 39.402C18.8998 38.8716 18.3696 38.4675 17.7576 38.2424C17.1635 37.9802 16.5045 37.902 15.8655 38.0179C15.2265 38.1337 14.6369 38.4383 14.1727 38.8924L14.0545 39.0106C13.6887 39.3769 13.2542 39.6674 12.776 39.8657C12.2977 40.0639 11.7851 40.166 11.2674 40.166C10.7497 40.166 10.2371 40.0639 9.75887 39.8657C9.28064 39.6674 8.84617 39.3769 8.4803 39.0106C8.11403 38.6447 7.82347 38.2103 7.62522 37.732C7.42697 37.2538 7.32493 36.7412 7.32493 36.2235C7.32493 35.7058 7.42697 35.1932 7.62522 34.7149C7.82347 34.2367 8.11403 33.8022 8.4803 33.4364L8.59848 33.3182C9.05257 32.854 9.35718 32.2644 9.47304 31.6254C9.58889 30.9864 9.51068 30.3274 9.24848 29.7333C8.9988 29.1508 8.58422 28.6539 8.05576 28.3039C7.52731 27.954 6.90806 27.7662 6.27424 27.7636H5.93939C4.8946 27.7636 3.8926 27.3486 3.15382 26.6098C2.41504 25.871 2 24.869 2 23.8242C2 22.7794 2.41504 21.7774 3.15382 21.0387C3.8926 20.2999 4.8946 19.8848 5.93939 19.8848H6.11667C6.76863 19.8696 7.40092 19.6586 7.93135 19.2792C8.46177 18.8998 8.8658 18.3696 9.09091 17.7576C9.35311 17.1635 9.43132 16.5045 9.31546 15.8655C9.19961 15.2265 8.895 14.6369 8.44091 14.1727L8.32273 14.0545C7.95646 13.6887 7.66589 13.2542 7.46764 12.776C7.2694 12.2977 7.16736 11.7851 7.16736 11.2674C7.16736 10.7497 7.2694 10.2371 7.46764 9.75887C7.66589 9.28064 7.95646 8.84617 8.32273 8.4803C8.68859 8.11403 9.12306 7.82347 9.6013 7.62522C10.0795 7.42697 10.5922 7.32493 11.1098 7.32493C11.6275 7.32493 12.1402 7.42697 12.6184 7.62522C13.0966 7.82347 13.5311 8.11403 13.897 8.4803L14.0152 8.59848C14.4794 9.05257 15.069 9.35718 15.7079 9.47304C16.3469 9.58889 17.0059 9.51068 17.6 9.24848H17.7576C18.3402 8.9988 18.837 8.58422 19.187 8.05576C19.5369 7.52731 19.7247 6.90806 19.7273 6.27424V5.93939C19.7273 4.8946 20.1423 3.8926 20.8811 3.15382C21.6199 2.41504 22.6219 2 23.6667 2C24.7115 2 25.7135 2.41504 26.4522 3.15382C27.191 3.8926 27.6061 4.8946 27.6061 5.93939V6.11667C27.6086 6.75049 27.7964 7.36974 28.1464 7.89819C28.4963 8.42664 28.9932 8.84122 29.5758 9.09091C30.1698 9.35311 30.8289 9.43132 31.4678 9.31546C32.1068 9.19961 32.6964 8.895 33.1606 8.44091L33.2788 8.32273C33.6446 7.95646 34.0791 7.66589 34.5574 7.46764C35.0356 7.2694 35.5482 7.16736 36.0659 7.16736C36.5836 7.16736 37.0962 7.2694 37.5745 7.46764C38.0527 7.66589 38.4872 7.95646 38.853 8.32273C39.2193 8.68859 39.5099 9.12306 39.7081 9.6013C39.9064 10.0795 40.0084 10.5922 40.0084 11.1098C40.0084 11.6275 39.9064 12.1402 39.7081 12.6184C39.5099 13.0966 39.2193 13.5311 38.853 13.897L38.7348 14.0152C38.2808 14.4794 37.9761 15.069 37.8603 15.7079C37.7444 16.3469 37.8226 17.0059 38.0848 17.6V17.7576C38.3345 18.3402 38.7491 18.837 39.2776 19.187C39.806 19.5369 40.4253 19.7247 41.0591 19.7273H41.3939C42.4387 19.7273 43.4407 20.1423 44.1795 20.8811C44.9183 21.6199 45.3333 22.6219 45.3333 23.6667C45.3333 24.7115 44.9183 25.7135 44.1795 26.4522C43.4407 27.191 42.4387 27.6061 41.3939 27.6061H41.2167C40.5828 27.6086 39.9636 27.7964 39.4351 28.1464C38.9067 28.4963 38.4921 28.9932 38.2424 29.5758Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

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
        }>(`/service-categories/${categoryId}`)
        
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
