<template>
    <default-layout>
        <div class="product-view-page -mx-6">
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
                <v-progress-circular indeterminate color="primary" size="64" />
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] px-6">
                <v-icon size="64" class="text-red-500 mb-4">mdi-alert-circle-outline</v-icon>
                <h3 class="text-xl font-bold text-gray-900 mb-2">حدث خطأ في تحميل البيانات</h3>
                <p class="text-gray-600 mb-4">{{ error }}</p>
                <ButtonWithIcon color="primary" label="إعادة المحاولة" @click="fetchProduct" />
            </div>

            <!-- Content -->
            <div v-else>
                <!-- Breadcrumb -->
                <div class="flex items-center gap-3 mb-6 text-sm px-6">
                    <router-link to="/" class="text-gray-500 hover:text-primary-600">
                        <span v-html="homeIcon"></span>
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/simple-products/list" class="text-gray-600 hover:text-primary-600">
                        المنتجات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/simple-products/list" class="text-gray-600 hover:text-primary-600">
                        جدول المنتجات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>

                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ product.name_translations?.ar || product.name }}</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="productIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ product.name_translations?.ar || product.name }}</h1>
                                <p class="text-sm text-gray-600"><span v-html="product.description_translations?.ar || product.description || 'لا يوجد وصف'"></span></p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs Navigation -->
                <div class="flex lg:items-center lg:justify-between py-4 border-b border-gray-200 flex-col lg:flex-row gap-3 px-6">
                    <div class="flex gap-2 overflow-y-auto">
                        <button
                            v-for="tab in tabs"
                            :key="tab.value"
                            @click="activeTab = tab.value"
                            :class="[
                                'flex items-center gap-2 px-3.5 py-2.5 rounded-md transition-all',
                                isTabActive(tab.value)
                                    ? 'bg-primary-500 text-white'
                                    : 'text-gray-400 hover:bg-gray-50',
                            ]"
                        >
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
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-xl font-bold text-primary-900 mb-6">المعلومات العامة</h2>

                            <div class="flex flex-wrap gap-4">
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">الاسم بالعربية</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.name_translations?.ar || product.name || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">الاسم بالانجليزية</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.name_translations?.en || product.name || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">كود المنتج</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.code || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">حالة المنتج</label>
                                    <p class="text-base font-semibold text-gray-900">
                                        <span :class="product.is_active ? 'text-green-600' : 'text-red-600'">
                                            {{ product.is_active ? 'فعال' : 'غير فعال' }}
                                        </span>
                                    </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">المنتج الأب</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.parent?.name || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">له منتجات فرعية</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.has_children ? 'نعم' : 'لا' }}</p>
                                </div>
                            </div>
                            <div class="flex gap-4">
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">الوصف بالانجليزي</label>
                                    <p class="text-sm text-gray-700 leading-relaxed"><span v-html="product.description_translations?.en || product.description || '-'"></span></p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">الوصف عربي</label>
                                    <p class="text-sm text-gray-700 leading-relaxed"><span v-html="product.description_translations?.ar || product.description || '-'"></span></p>
                                </div>

                            </div>
                        </div>

                        <!-- Tax Section -->
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-xl font-bold text-primary-900 mb-6">معلومات الضريبة</h2>
                            <div v-if="product.taxes && product.taxes.length > 0" class="flex flex-col gap-4">
                                <div v-for="tax in product.taxes" :key="tax.id" class="flex flex-wrap gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <div class="info-item-bordered flex-1 px-6 py-4">
                                        <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم الضريبة</label>
                                        <p class="text-base font-semibold text-gray-900">{{ tax.tax_name || '-' }}</p>
                                    </div>
                                    <v-divider vertical class="my-6"></v-divider>
                                    <div class="info-item-bordered flex-1 px-6 py-4">
                                        <label class="font-semibold text-sm text-gray-500 mb-2 block">نسبة الضريبة</label>
                                        <p class="text-base font-semibold text-gray-900">{{ tax.percentage ? tax.percentage + '%' : '-' }}</p>
                                    </div>
                                    <v-divider vertical class="my-6"></v-divider>
                                    <div class="info-item-bordered flex-1 px-6 py-4">
                                        <label class="font-semibold text-sm text-gray-500 mb-2 block">الحد الأدنى للضريبة</label>
                                        <p class="text-base font-semibold text-gray-900">{{ tax.minimum || '-' }}</p>
                                    </div>
                                    <v-divider vertical class="my-6"></v-divider>
                                    <div class="info-item-bordered flex-1 px-6 py-4">
                                        <label class="font-semibold text-sm text-gray-500 mb-2 block">الأولوية</label>
                                        <p class="text-base font-semibold text-gray-900">{{ tax.priority || '-' }}</p>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-gray-500 text-center py-4">لا توجد معلومات ضريبية</div>
                        </div>

                        <!-- Product Relations Section -->
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-xl font-bold text-primary-900 mb-6">التوريد والعلاقات الداخلية للمنتج</h2>
                            <div class="flex flex-wrap gap-4">
                                <div class="info-item-bordered flex-1 px-4 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">العلامة التجارية</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.brand?.name || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-4 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">بلد المنشأ</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.country_of_origin?.name || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-4 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">المنتجات الفرعية</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.children?.length || 0 }}</p>
                                </div>
                            </div>

                        </div>

                        <!-- Additional Information Section -->
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex gap-6 flex-wrap flex-column sm:!flex-row">
                                <div class="flex-1">
                                    <h2 class="text-xl font-bold text-primary-900 mb-6">سمات / خصائص المنتج المتقدمة </h2>
                                    <div class="flex flex-wrap gap-4 text-center">
                                        <div v-if="product.is_manufacturable" class="info-item-bordered">
                                            <p class="text-base font-semibold text-gray-900 py-4">منتج تصنيع</p>
                                        </div>
                                        <v-divider v-if="product.is_manufacturable" vertical class="my-2"></v-divider>
                                        <div v-if="product.allow_negative_sales" class="info-item-bordered">
                                            <p class="text-base font-semibold text-gray-900 py-4">البيع بالسالب</p>
                                        </div>
                                        <v-divider v-if="product.allow_negative_sales" vertical class="my-2"></v-divider>
                                        <div v-if="product.is_rentable" class="info-item-bordered">
                                            <p class="text-base font-semibold text-gray-900 py-4">قابل للايجار</p>
                                        </div>
                                    </div>

                                </div>
                                <v-divider vertical class="hidden sm:block"></v-divider>
                                <div class="flex-1">
                                    <h2 class="text-xl font-bold text-primary-900 mb-6">صورة المنتج</h2>
                                    <div v-if="product.image">
                                        <img :src="product.image" :alt="product.name" class="w-full max-w-xs rounded-lg shadow-md" />
                                    </div>
                                    <div v-else class="text-gray-500 text-sm">
                                        لا توجد صورة
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Pricing Section -->
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-xl font-bold text-primary-900 mb-6">معلومات الأسعار</h2>
                            <div class="flex flex-wrap gap-4">
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">سعر الشراء</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.purchase_price || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">سعر البيع</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.sell_price || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">الحد الأدنى لسعر البيع</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.min_sell_price || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">الحد الأقصى لسعر البيع</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.max_sell_price || '-' }}</p>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-4 mt-4">
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">سعر الفرع</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.branch_price || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">سعر الجملة</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.wholesale_price || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">سعر نصف الجملة</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.semi_wholesale_price || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع الخصم</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.discount_type || '-' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">قيمة الخصم</label>
                                    <p class="text-base font-semibold text-gray-900">{{ product.discount_value || '-' }}</p>
                                </div>
                            </div>
                        </div>
                    </v-tabs-window-item>

                    <!-- Tab 2: الاختبارات -->
                    <v-tabs-window-item :value="1">
                        <div class="p-6">
                            <div v-for="test in testsData" :key="test.id" class="mb-6 last:mb-0">
                                <div class="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 class="text-lg font-bold text-primary-900 mb-4">{{ test.name }}</h3>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div class="text-center">
                                            <label class="block text-sm font-medium text-gray-500 mb-2">عدد الاختبارات</label>
                                            <p class="text-2xl font-bold text-gray-900">{{ test.testsCount }} اختبارات</p>
                                        </div>
                                        <div class="text-center">
                                            <label class="block text-sm font-medium text-gray-500 mb-2">عدد العينات</label>
                                            <p class="text-2xl font-bold text-gray-900">{{ test.samplesCount }} عينات</p>
                                        </div>
                                        <div class="text-center">
                                            <label class="block text-sm font-medium text-gray-500 mb-2">كمية العينات</label>
                                            <p class="text-2xl font-bold text-gray-900">{{ test.sampleQuantity }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-tabs-window-item>
                </v-tabs-window>
            </div>
        </div>
    </default-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'

interface ProductData {
    id: number
    name: string
    name_translations: {
        ar: string
        en: string
    }
    code: string
    description: string | null
    description_translations: {
        ar: string
        en: string
    }
    image: string | null
    country_of_origin: { name: string } | null
    is_active: boolean
    allow_negative_sales: boolean
    is_rentable: boolean
    is_manufacturable: boolean
    purchase_price: string
    sell_price: string
    min_sell_price: string | null
    max_sell_price: string | null
    branch_price: string | null
    wholesale_price: string | null
    semi_wholesale_price: string | null
    discount_type: string | null
    discount_value: string | null
    brand: { name: string } | null
    category: { name: string } | null
    manufacturer: { name: string } | null
    unit: { name: string } | null
    taxes: Array<{
        id: number
        tax_id: number
        tax_name: string
        percentage: string
        minimum: string
        priority: number
        is_custom: boolean
    }>
    tests: any[]
    parent: { name: string } | null
    children: any[]
    has_children: boolean
}

const route = useRoute()
const api = useApi()
const { showError } = useNotification()

const loading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref(0)

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
        title: 'الاختبارات',
        value: 1,
        icon: `<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 1.26953V5.40007C11 5.96012 11 6.24015 11.109 6.45406C11.2049 6.64222 11.3578 6.7952 11.546 6.89108C11.7599 7.00007 12.0399 7.00007 12.6 7.00007H16.7305M13 12H5M13 16H5M7 8H5M11 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H12.2C13.8802 21 14.7202 21 15.362 20.673C15.9265 20.3854 16.3854 19.9265 16.673 19.362C17 18.7202 17 17.8802 17 16.2V7L11 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
    },
]

// Tab helpers
const isTabActive = (tabValue: number) => activeTab.value === tabValue

// Mock tests data
const testsData = ref([
    {
        id: 1,
        name: 'اختبار التدرج الحبيبي',
        testsCount: 5,
        samplesCount: 10,
        sampleQuantity: '50 كجم تقريبا للعينة الواحدة'
    },
    {
        id: 2,
        name: 'اختبار الصلبة',
        testsCount: 5,
        samplesCount: 10,
        sampleQuantity: '50 كجم تقريبا للعينة الواحدة'
    },
    {
        id: 3,
        name: 'اختبار التحمل',
        testsCount: 5,
        samplesCount: 10,
        sampleQuantity: '50 كجم تقريبا للعينة الواحدة'
    }
])

const productIcon = `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.12" d="M9.33337 18.6667H46.6667V37.8001C46.6667 41.7205 46.6667 43.6806 45.9038 45.178C45.2326 46.4952 44.1618 47.566 42.8446 48.2371C41.3473 49.0001 39.3871 49.0001 35.4667 49.0001H20.5334C16.613 49.0001 14.6528 49.0001 13.1554 48.2371C11.8383 47.566 10.7674 46.4952 10.0963 45.178C9.33337 43.6806 9.33337 41.7204 9.33337 37.8001V18.6667Z" fill="#1570EF"/>
<path d="M9.33329 18.6587C8.95061 18.6488 8.67272 18.6267 8.42287 18.577C6.57165 18.2088 5.12453 16.7616 4.75629 14.9104C4.66663 14.4596 4.66663 13.9175 4.66663 12.8333C4.66663 11.7491 4.66663 11.207 4.75629 10.7562C5.12453 8.90502 6.57165 7.4579 8.42287 7.08967C8.87367 7 9.41576 7 10.5 7H45.5C46.5842 7 47.1263 7 47.5771 7.08967C49.4283 7.4579 50.8754 8.90502 51.2436 10.7562C51.3333 11.207 51.3333 11.7491 51.3333 12.8333C51.3333 13.9175 51.3333 14.4596 51.2436 14.9104C50.8754 16.7616 49.4283 18.2088 47.5771 18.577C47.3272 18.6267 47.0493 18.6488 46.6666 18.6587M23.3333 30.3333H32.6666M9.33329 18.6667H46.6666V37.8C46.6666 41.7204 46.6666 43.6805 45.9037 45.1779C45.2326 46.4951 44.1617 47.5659 42.8446 48.237C41.3472 49 39.387 49 35.4666 49H20.5333C16.6129 49 14.6527 49 13.1554 48.237C11.8382 47.5659 10.7674 46.4951 10.0962 45.1779C9.33329 43.6805 9.33329 41.7204 9.33329 37.8V18.6667Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const product = ref<ProductData>({
    id: 0,
    name: '',
    name_translations: { ar: '', en: '' },
    description: null,
    description_translations: { ar: '', en: '' },
    code: '',
    brand: null,
    country_of_origin: null,
    image: null,
    allow_negative_sales: false,
    is_rentable: false,
    is_manufacturable: false,
    purchase_price: '0',
    sell_price: '0',
    min_sell_price: null,
    max_sell_price: null,
    branch_price: null,
    wholesale_price: null,
    semi_wholesale_price: null,
    discount_type: null,
    discount_value: null,
    category: null,
    manufacturer: null,
    unit: null,
    taxes: [],
    tests: [],
    is_active: false,
    parent: null,
    children: [],
    has_children: false
})

const fetchProduct = async () => {
    try {
        loading.value = true
        error.value = null
        const productId = route.params.id
        
        const response = await api.get<{
            status: number
            code: number
            message: string
            data: ProductData
            locale: string
        }>(`/items/${productId}`)
        
        if (response.status === 200 && response.data) {
            product.value = response.data
        } else {
            throw new Error(response.message || 'فشل في تحميل بيانات المنتج')
        }
    } catch (err: any) {
        error.value = err.response?.data?.message || err.message || 'حدث خطأ أثناء تحميل البيانات'
        showError(error.value)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchProduct()
})
</script>