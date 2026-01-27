<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from 'vue-i18n'
import AddProductDialog from '../../../../components/price-offers/AddProductDialog.vue';
import TopHeader from '../../../../components/price-offers/TopHeader.vue';

import { fileIcon, mapMarkerIcon, packageIcon, messagePlusIcon, downloadIcon, fileQuestionIcon, microphoneIcon, UploadedFileIcon, fileCheckIcon } from '../../../../components/icons/priceOffersIcons';
const { t } = useI18n()

interface ProductItem {
    id: number;
    image: string;
    productName: string;
    quantity: number;
    unit: string;
    packageType: string;
    deliveryCount: number;
    notes: string;
    actions: string;
}

// Form data with static values
const formData = ref({
    requestNumber: '#12520226',
    requestType: 'ثنائي',
    supplierName: null,
    issueDate: '',
    requestStatus: 'جديد',
    paymentMethod: 'آجل',
    projectLocation: 'شارع الدكتور عبد القادر كوشك',
    advancePayment: '1550 ريال',
    textNote: '',
    image: null
});

// Static product items
const productItems = ref<ProductItem[]>([
    {
        id: 1,
        image: '/images/products/cement.jpg',
        productName: 'اسمنت بايز كرايت',
        quantity: 30,
        unit: 'طن',
        packageType: 'شكارة 10',
        deliveryCount: 5,
        notes: 'لا يوجد',
        actions: ''
    },
    {
        id: 2,
        image: '/images/products/tiles.jpg',
        productName: 'البلاط / السيراميك',
        quantity: 500,
        unit: 'متر مربع (m2)',
        packageType: 'شكارة 12',
        deliveryCount: 5,
        notes: 'حتى 100 طن لكل وحدها',
        actions: ''
    }
]);

// Summary data
const summaryData = ref({
    productsCount: 2,
    servicesCount: 0,
    paymentMethod: 'كاش',
    advancePayment: '50.000'
});

const showAddProductDialog = ref(false);

const handleAddProduct = () => {
    showAddProductDialog.value = true;
};

const handleProductSaved = (products: any[]) => {
    console.log('Products saved:', products);
    // Add logic to add products to the list
};

const handleEditProduct = (item: ProductItem) => {
    console.log('Edit product:', item);
};

const handleDeleteProduct = (item: ProductItem) => {
    const index = productItems.value.findIndex(p => p.id === item.id);
    if (index !== -1) {
        productItems.value.splice(index, 1);
    }
};

const handleNewRequest = () => {
    console.log('New Request clicked');
};

const handleSubmit = () => {
    console.log('Submit request');
};

const handleConvertToPrice = () => {
    console.log('Convert to price offer');
};

const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
    console.log('latitude : ', location.latitude);
    console.log('longitude : ', location.longitude);
    console.log('address : ', location.address);
};

const showMapDialog = ref(false);
const openMapDialog = () => {
    showMapDialog.value = true;
};

const headers = [
    { title: 'اسم المنتج', key: 'name' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'الوحدة', key: 'unit' },
    { title: 'نوع الناقلة', key: 'transport_type' },
    { title: 'عدد الرحلات اليومية', key: 'daily_trips' },
    { title: 'ملاحظات', key: 'notes' },
]
const items = [
    {
        id: 1,
        name: 'اسمنت باور كريت',
        quantity: 30,
        unit: 'طن',
        transport_type: 'شحن 10',
        daily_trips: 5,
        notes: 'لا يوجد',
    },
    {
        id: 2,
        name: 'البلاط / السيراميك',
        quantity: 500,
        unit: 'متر مربع (m2)',
        transport_type: 'شحن 12',
        daily_trips: 5,
        notes: 'كل 100 طن لوحدها',
    },
]

</script>

<template>
    <default-layout>
        <div class="request-material-product-page -mx-6">
            <!-- Page Header -->
            <TopHeader :icon="fileQuestionIcon" title-key="pages.requestForQuotationFuel.FormTitle"
                description-key="pages.requestForQuotationFuel.FormDescription" action-label="طلب جديد"
                :action-icon="fileIcon" @action="handleNewRequest" />

            <!-- Request Information Section -->
            <div class="p-6">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span v-html="fileCheckIcon"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <!-- Supplier Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">اسم المورد</label>
                        <SelectInput v-model="formData.supplierName" placeholder="اختر المورد"
                            :items="[{ title: 'حدد المورد', value: 'حدد المورد' }]" item-title="title"
                            item-value="value" density="comfortable" />
                    </div>

                    <!-- Issue Date -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">تاريخ الطلب</label>
                        <DatePickerInput v-model="formData.issueDate" type="date" density="comfortable"
                            placeholder="اختر التاريخ" />
                    </div>

                    <!-- Supplier Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">اسم المسؤول</label>
                        <TextInput v-model="formData.supplierName" placeholder="أدخل اسم المسؤول" item-title="title"
                            item-value="value" density="comfortable" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">هاتف المسؤول</label>
                        <TelInput v-model="formData.supplierName" placeholder="5XX XXX XXXX" item-title="title"
                            item-value="value" density="comfortable" />
                    </div>

                    <!-- Payment Method -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                        <SelectInput v-model="formData.paymentMethod"
                            :items="[{ title: 'آجل', value: 'آجل' }, { title: 'كاش', value: 'كاش' }]" item-title="title"
                            item-value="value" density="comfortable" />
                    </div>

                    <!-- Advance Payment -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">دفعة مقدمة</label>
                        <div class="flex items-center gap-2">
                            <PriceInput showRialIcon v-model="formData.advancePayment" density="comfortable"
                                class="flex-1" placeholder="أدخل قيمة الدفعة" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">طريقة التسليم</label>
                        <SelectInput v-model="formData.paymentMethod"
                            :items="[{ title: 'آجل', value: 'آجل' }, { title: 'كاش', value: 'كاش' }]" item-title="title"
                            item-value="value" density="comfortable" />
                    </div>

                    <!-- Project Location -->
                    <div class="relative">
                        <label class="text-sm font-medium text-gray-700 mb-2 block">موقع تسليم المواد</label>
                        <div @click="openMapDialog"
                            class="flex items-center justify-between px-4 py-2 bg-blue-50/60 border-2 border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                            <span class="text-base font-medium text-blue-900">
                                {{ formData.projectLocation || 'حدد الموقع' }}
                            </span>
                            <div class="flex items-center gap-2">
                                <span v-html="mapMarkerIcon"></span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Products Section -->
            <div class="mb-8">
                <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3">
                    <div class="flex items-center gap-2">
                        <span v-html="packageIcon"></span>
                        <h2 class="text-xl font-bold text-primary-900">المنتجات</h2>
                    </div>
                    <ButtonWithIcon color="primary-100" variant="flat" :prepend-icon="downloadIcon"
                        class="!text-primary-900 font-bold">
                        استيراد من ملف إكسل
                    </ButtonWithIcon>
                </div>

                <!-- Products Table -->
                <div class="mb-4">
                    <DataTable :headers="headers" :items="items" show-actions force-show-edit force-show-delete>
                        <template #item.notes="{ item }">
                            <v-menu attach="request-material-product-page" location="bottom" offset="8"
                                :close-on-content-click="false" transition="slide-y-transition">
                                <template #activator="{ props }">
                                    <div class="flex items-center gap-2 cursor-pointer" v-bind="props">
                                        <v-icon size="20" color="primary" v-html="messagePlusIcon"></v-icon>
                                        <span class="text-gray-900">{{ item.notes }}</span>
                                    </div>
                                </template>

                                <!-- Popup content -->
                                <v-card
                                    class="pa-4 shadow-[rgba(149,157,165,0.2)_0px_8px_24px] overflow-hidden px-3 py-3"
                                    color="white" rounded="lg" width="300">
                                    <div class="!flex flex-nowrap items-center gap-3">
                                        <TextInput v-model="item.notes" placeholder="أضف ملاحظة" variant="outlined"
                                            density="comfortable" hide-details autofocus class="flex-1" />
                                        <ButtonWithIcon :icon="messagePlusIcon" color="primary" icon-only
                                            size="x-small" />

                                    </div>
                                </v-card>
                            </v-menu>
                        </template>
                    </DataTable>
                </div>

                <!-- Add Product Button -->
                <div class="flex justify-center">
                    <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold w-75"
                        @click="handleAddProduct">
                        + إضافة منتج جديد
                    </ButtonWithIcon>
                </div>
            </div>

            <!-- Attachments and Summary Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 justify-between lg:gap-20 bg-qallab-dashboard-bg">
                <!-- Attachments (Right Side) -->
                <div class=" p-6">
                    <div class="flex items-center gap-2 mb-6 px-6 py-4 bg-primary-500 rounded-lg text-white">
                        <span v-html="UploadedFileIcon"></span>
                        <h3 class="text-lg font-bold">مرفقات</h3>
                    </div>

                    <!-- Voice Message -->
                    <div class="rounded-xl bg-white px-4 py-6 mb-3 flex items-center justify-between">
                        <div>
                            <p class="text-primary-600 font-bold text-sm mb-2">رسالة صوتية</p>
                            <p class="text-gray-400 font-medium text-sm">هل تود إرفاق بعض الملاحظات</p>
                            <p class="text-blue-900 font-medium text-sm">قم بتسجيل رسالتك الصوتية إلى</p>
                        </div>
                        <ButtonWithIcon color="primary-500" iconOnly :icon="microphoneIcon" height="75" variant="flat"
                            class="!text-primary-900 font-bold" customClass="!h-unset" />

                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        <!-- Text Note -->
                        <div class="rounded-xl bg-white lg:col-span-2">
                            <p class="text-primary-600 font-bold text-sm mb-2 px-4 mt-2">ملاحظة نصية</p>
                            <TextareaInput v-model="formData.textNote" density="comfortable"
                                :input-props="{ class: '!rounded-none' }"
                                placeholder="هل تود إرفاق بعض الملاحظات، قم بكتابتها هنا من فضلك وسيتم إرفاقها مع طلب عرض السعر المرسل" />
                        </div>

                        <FileUploadInput v-model="formData.image" class="!mb-0 h-full"
                            hint="PNG, JPG or GIF (max. 400x400px)" :max-files="1" />
                    </div>
                </div>

                <!-- Summary (Left Side) -->
                <div class=" p-6">
                    <div class="flex items-center gap-2 mb-2 px-6 py-4 bg-primary-500 rounded-lg text-white">
                        <span v-html="fileCheckIcon"></span>
                        <h3 class="text-lg font-bold">ملخص الطلب</h3>
                    </div>

                    <div class="space-y-0 bg-white border border-slate-100 rounded-lg !text-blue-900 text-lg font-bold">
                        <div class="flex justify-between items-center py-4 px-6 border-b border-gray-200 ">
                            <span class="">المنتجات</span>
                            <span class="">{{ summaryData.productsCount }}</span>
                        </div>
                        <div class="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                            <span class="">الخدمات</span>
                            <span class="">{{ summaryData.servicesCount }}</span>
                        </div>
                        <div class="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                            <span class="">طريقة الدفع</span>
                            <span class="">{{ summaryData.paymentMethod }}</span>
                        </div>
                        <div class="flex justify-between items-center py-4 px-6">
                            <span class="">دفعة مقدمة</span>
                            <span class="">{{ summaryData.advancePayment }}</span>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="mt-3 flex items-center gap-3">
                        <ButtonWithIcon color="primary-50" class="flex-1 text-primary-700" height="48" size="large"
                            @click="handleConvertToPrice" label="تحويل إلى عرض سعر" />
                        <ButtonWithIcon color="primary" class="flex-1" label="إرسال الطلب" height="48" size="large"
                            @click="handleSubmit" />
                    </div>
                </div>

            </div>
        </div>

        <Map v-model="showMapDialog" @location-selected="handleLocationSelected" />

        <!-- Add Product Dialog -->
        <AddProductDialog v-model="showAddProductDialog" request-type="fuel" @saved="handleProductSaved" />
    </default-layout>
</template>

<style scoped></style>
