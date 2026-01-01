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
                <v-btn color="primary" @click="fetchProduct">إعادة المحاولة</v-btn>
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

                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ product.translations?.name?.ar || product.name }}</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="productIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ product.translations?.name?.ar || product.name }}</h1>
                                <p class="text-sm text-gray-600">{{ product.translations?.description?.ar || product.description || 'لا يوجد وصف' }}</p>
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
                            <p class="text-base font-semibold text-gray-900">{{ product.translations?.name?.ar || product.name || '-' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الاسم بالانجليزية</label>
                            <p class="text-base font-semibold text-gray-900">{{ product.translations?.name?.en || product.name || '-' }}</p>
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
                            <p class="text-sm text-gray-700 leading-relaxed">{{ product.translations?.description?.en || product.description || '-' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الوصف عربي</label>
                            <p class="text-sm text-gray-700 leading-relaxed">{{ product.translations?.description?.ar || product.description || '-' }}</p>
                        </div>

                    </div>
                </div>

                <!-- Tax Section -->
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-bold text-primary-900 mb-6">معلومات الضريبة</h2>
                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم الضريبة</label>
                            <p class="text-base font-semibold text-gray-900">{{ product.tax_name || '-' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">نسبة الضريبة</label>
                            <p class="text-base font-semibold text-gray-900">{{ product.tax_percentage ? product.tax_percentage + '%' : '-' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الحد الأدنى للضريبة</label>
                            <p class="text-base font-semibold text-gray-900">{{ product.min_tax_amount || '-' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">الأولوية</label>
                            <p class="text-base font-semibold text-gray-900">{{ product.priority || '-' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Product Relations Section -->
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-bold text-primary-900 mb-6">التوريد والعلاقات الداخلية للمنتج</h2>
                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-4 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">العلامة التجارية</label>
                            <p class="text-base font-semibold text-gray-900">{{ product.brands || '-' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-4 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">بلد المنشأ</label>
                            <p class="text-base font-semibold text-gray-900">{{ product.country_of_origin || '-' }}</p>
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
    translations: {
        name: {
            ar: string
            en: string
        }
        description: any
    }
    description: string | null
    code: string
    brands: string | null
    country_of_origin: string | null
    image: string | null
    allow_negative_sales: number
    is_rentable: number
    is_manufacturable: number
    purchase_price: number
    sell_price: number
    min_sell_price: number | null
    max_sell_price: number | null
    branch_price: number | null
    wholesale_price: number | null
    semi_wholesale_price: number | null
    discount_type: string | null
    discount_value: number | null
    tax_name: string | null
    tax_percentage: number | null
    min_tax_amount: number | null
    priority: number | null
    is_active: number
    created_at: string
    updated_at: string
    parent: any
    children: any[]
    user: {
        id: number
        name: string
        email: string
    }
    has_children: boolean
}

const route = useRoute()
const api = useApi()
const { showError } = useNotification()

const loading = ref(false)
const error = ref<string | null>(null)

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
    translations: {
        name: { ar: '', en: '' },
        description: []
    },
    description: null,
    code: '',
    brands: null,
    country_of_origin: null,
    image: null,
    allow_negative_sales: 0,
    is_rentable: 0,
    is_manufacturable: 0,
    purchase_price: 0,
    sell_price: 0,
    min_sell_price: null,
    max_sell_price: null,
    branch_price: null,
    wholesale_price: null,
    semi_wholesale_price: null,
    discount_type: null,
    discount_value: null,
    tax_name: null,
    tax_percentage: null,
    min_tax_amount: null,
    priority: null,
    is_active: 0,
    created_at: '',
    updated_at: '',
    parent: null,
    children: [],
    user: { id: 0, name: '', email: '' },
    has_children: false
})

const fetchProduct = async () => {
    try {
        loading.value = true
        error.value = null
        const productId = route.params.id
        
        const response = await api.get<{
            status: boolean
            code: number
            message: string
            data: ProductData
            errors: any
        }>(`/api/items/${productId}`)
        
        if (response.status && response.data) {
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