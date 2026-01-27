<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from 'vue-i18n'
import AddProductDialog from './components/AddProductDialog.vue';
import AddTransportServiceDialog from './components/AddTransportServiceDialog.vue';

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

interface TransportService {
    id: number;
    project: string;
    fromDate: string;
    toDate: string;
    shipmentType: string;
    deliveryTime: string;
    notes: string;
}

// Form data with static values
const formData = ref({
    requestNumber: '#12520226',
    requestType: 'ثنائي',
    supplierName: 'حدد المورد',
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

// Static transport services
const transportServices = ref<TransportService[]>([
    {
        id: 1,
        project: 'مكة',
        fromDate: '22/6/2025',
        toDate: '26/7/2026',
        shipmentType: 'قالب',
        deliveryTime: 'صباحا',
        notes: 'لا يوجد'
    },
    {
        id: 2,
        project: 'القصيم',
        fromDate: '22/6/2025',
        toDate: '26/7/2026',
        shipmentType: 'سطحة',
        deliveryTime: 'مساءا',
        notes: 'مقطعة بالكامل'
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

const handleProductSaved = (product: any) => {
    console.log('Product saved:', product);
    // Add logic to add product to the list
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

const showAddTransportServiceDialog = ref(false);

const handleAddTransportService = () => {
    showAddTransportServiceDialog.value = true;
};

const handleTransportServiceSaved = (service: any) => {
    console.log('Transport service saved:', service);
    // Add logic to add service to the list
};

const handleEditTransportService = (item: TransportService) => {
    console.log('Edit transport service:', item);
};

const handleNewRequest = () => {
    console.log('New Request clicked');
};

const handleDeleteTransportService = (item: TransportService) => {
    const index = transportServices.value.findIndex(s => s.id === item.id);
    if (index !== -1) {
        transportServices.value.splice(index, 1);
    }
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

const ServicesHeaders = [
    { title: 'موقع المشروع', key: 'project_location' },
    { title: 'من تاريخ', key: 'from_date' },
    { title: 'إلى تاريخ', key: 'to_date' },
    { title: 'نوع المركبات', key: 'vehicle_type' },
    { title: 'توقيت الرحلة', key: 'trip_time' },
    { title: 'ملاحظات', key: 'notes' },
]

const ServicesItems = [
    {
        id: 1,
        project_location: 'مكة',
        from_date: '22/6/2025',
        to_date: '26/7/2026',
        vehicle_type: 'قلاب',
        trip_time: 'صباحاً',
        notes: 'لا يوجد',
    },
    {
        id: 2,
        project_location: 'القصيم',
        from_date: '22/6/2025',
        to_date: '26/7/2026',
        vehicle_type: 'سطحة',
        trip_time: 'مساءً',
        notes: 'مغطاة بالكامل',
    },
]


const formIcon = `<svg width="41" height="48" viewBox="0 0 41 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M36.6667 24.75V12.4C36.6667 8.75966 36.6667 6.93949 35.9582 5.54906C35.335 4.32601 34.3407 3.33163 33.1176 2.70846C31.7272 2 29.907 2 26.2667 2H12.4C8.75966 2 6.93949 2 5.54906 2.70846C4.32601 3.33163 3.33163 4.32601 2.70846 5.54906C2 6.93949 2 8.75966 2 12.4V34.9333C2 38.5737 2 40.3938 2.70846 41.7843C3.33163 43.0073 4.32601 44.0017 5.54906 44.6249C6.93949 45.3333 8.75966 45.3333 12.4 45.3333H19.3333M23.6667 21.5H10.6667M15 30.1667H10.6667M28 12.8333H10.6667M24.75 38.8333L29.0833 43.1667L38.8333 33.4167" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const mapMarkerIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_372_60433)">
<path d="M16.6665 9.99996C16.6665 13.6819 13.6817 16.6666 9.99984 16.6666M16.6665 9.99996C16.6665 6.31806 13.6817 3.33329 9.99984 3.33329M16.6665 9.99996H18.3332M9.99984 16.6666C6.31794 16.6666 3.33317 13.6819 3.33317 9.99996M9.99984 16.6666V18.3333M3.33317 9.99996C3.33317 6.31806 6.31794 3.33329 9.99984 3.33329M3.33317 9.99996H1.6665M9.99984 3.33329V1.66663M12.4998 9.99996C12.4998 11.3807 11.3805 12.5 9.99984 12.5C8.61913 12.5 7.49984 11.3807 7.49984 9.99996C7.49984 8.61925 8.61913 7.49996 9.99984 7.49996C11.3805 7.49996 12.4998 8.61925 12.4998 9.99996Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_372_60433">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>
`

const downloadIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.5 12.5V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V12.5M14.1667 8.33333L10 12.5M10 12.5L5.83333 8.33333M10 12.5V2.5" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const packageIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.5 9.5L7.5 4.5" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const truckIcon = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 14V4.2C15 3.0799 15 2.51984 14.782 2.09202C14.5903 1.71569 14.2843 1.40973 13.908 1.21799C13.4802 1 12.9201 1 11.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V10.8C1 11.9201 1 12.4802 1.21799 12.908C1.40973 13.2843 1.71569 13.5903 2.09202 13.782C2.51984 14 3.0799 14 4.2 14H15ZM15 14H19.4C19.9601 14 20.2401 14 20.454 13.891C20.6422 13.7951 20.7951 13.6422 20.891 13.454C21 13.2401 21 12.9601 21 12.4V9.66274C21 9.41815 21 9.29586 20.9724 9.18077C20.9479 9.07873 20.9075 8.98119 20.8526 8.89172C20.7908 8.7908 20.7043 8.70432 20.5314 8.53137L18.4686 6.46863C18.2957 6.29568 18.2092 6.2092 18.1083 6.14736C18.0188 6.09253 17.9213 6.05213 17.8192 6.02763C17.7041 6 17.5818 6 17.3373 6H15M8 16.5C8 17.8807 6.88071 19 5.5 19C4.11929 19 3 17.8807 3 16.5C3 15.1193 4.11929 14 5.5 14C6.88071 14 8 15.1193 8 16.5ZM19 16.5C19 17.8807 17.8807 19 16.5 19C15.1193 19 14 17.8807 14 16.5C14 15.1193 15.1193 14 16.5 14C17.8807 14 19 15.1193 19 16.5Z" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const UploadedFileIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 7V6.8C20 5.11984 20 4.27976 19.673 3.63803C19.3854 3.07354 18.9265 2.6146 18.362 2.32698C17.7202 2 16.8802 2 15.2 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H12.5M12.5 11H8M11.5 15H8M16 7H8M18 18V12.5C18 11.6716 18.6716 11 19.5 11C20.3284 11 21 11.6716 21 12.5V18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18V14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const microphoneIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 12V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const fileCheckIcon = `<svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 11.5V5.8C17 4.11984 17 3.27976 16.673 2.63803C16.3854 2.07354 15.9265 1.6146 15.362 1.32698C14.7202 1 13.8802 1 12.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H9M11 10H5M7 14H5M13 6H5M11.5 18L13.5 20L18 15.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const fileIcon = `<svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.33333 1.22473V4.66685C9.33333 5.13356 9.33333 5.36691 9.42416 5.54517C9.50406 5.70198 9.63154 5.82946 9.78834 5.90935C9.9666 6.00018 10.2 6.00018 10.6667 6.00018H14.1088M9.33333 13.5001H4.33333M11 10.1668H4.33333M14.3333 7.65698V13.6668C14.3333 15.0669 14.3333 15.767 14.0608 16.3018C13.8212 16.7722 13.4387 17.1546 12.9683 17.3943C12.4335 17.6668 11.7335 17.6668 10.3333 17.6668H5C3.59987 17.6668 2.8998 17.6668 2.36502 17.3943C1.89462 17.1546 1.51217 16.7722 1.27248 16.3018C1 15.767 1 15.0669 1 13.6668V5.00012C1 3.59999 1 2.89993 1.27248 2.36515C1.51217 1.89474 1.89462 1.51229 2.36502 1.27261C2.8998 1.00012 3.59987 1.00012 5 1.00012H7.67648C8.28796 1.00012 8.59369 1.00012 8.88141 1.0692C9.1365 1.13044 9.38036 1.23145 9.60405 1.36852C9.85634 1.52313 10.0725 1.73932 10.5049 2.17169L13.1618 4.82855C13.5941 5.26093 13.8103 5.47712 13.9649 5.72941C14.102 5.95309 14.203 6.19695 14.2643 6.45204C14.3333 6.73976 14.3333 7.0455 14.3333 7.65698Z" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const messagePlusIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 10.125V5.625M6.75 7.875H11.25M5.25 13.5V15.2516C5.25 15.6513 5.25 15.8511 5.33192 15.9537C5.40317 16.043 5.5112 16.0949 5.6254 16.0948C5.75672 16.0946 5.91275 15.9698 6.22482 15.7201L8.01391 14.2889C8.37939 13.9965 8.56213 13.8503 8.76561 13.7463C8.94615 13.6541 9.13832 13.5867 9.33691 13.5459C9.56075 13.5 9.79477 13.5 10.2628 13.5H12.15C13.4101 13.5 14.0402 13.5 14.5215 13.2548C14.9448 13.039 15.289 12.6948 15.5048 12.2715C15.75 11.7902 15.75 11.1601 15.75 9.9V5.85C15.75 4.58988 15.75 3.95982 15.5048 3.47852C15.289 3.05516 14.9448 2.71095 14.5215 2.49524C14.0402 2.25 13.4101 2.25 12.15 2.25H5.85C4.58988 2.25 3.95982 2.25 3.47852 2.49524C3.05516 2.71095 2.71095 3.05516 2.49524 3.47852C2.25 3.95982 2.25 4.58988 2.25 5.85V10.5C2.25 11.1975 2.25 11.5462 2.32667 11.8323C2.53472 12.6088 3.1412 13.2153 3.91766 13.4233C4.20378 13.5 4.55252 13.5 5.25 13.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

</script>

<template>
    <default-layout>
        <div class="request-material-product-page -mx-6">
            <!-- Page Header -->
            <div class="bg-primary-500 flex flex-wrap justify-between items-center gap-3 text-white rounded-3xl -mt-6 px-6 py-12">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-[52px] h-[52px] flex items-center justify-center">
                            <span v-html="formIcon"></span>
                        </div>
                        <div>
                            <h1 class="text-lg font-bold">{{ t('pages.requestForQuotationMaterialProduct.FormTitle') }}
                            </h1>
                            <p class="text-sm">{{ t('pages.requestForQuotationMaterialProduct.FormDescription') }}</p>
                        </div>
                    </div>
                </div>
                <ButtonWithIcon color="primary-50" class="!text-primary-900 font-bold" :prepend-icon="fileIcon"
                    @click="handleNewRequest" label="طلب جديد" />

            </div>

            <!-- Request Information Section -->
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-bold text-primary-900">معلومات الطلب : {{ formData.requestNumber }}</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <!-- Request Type -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">نوع الطلب</label>
                        <SelectInput v-model="formData.requestType"
                            :items="[{ title: 'ثنائي', value: 'ثنائي' }, { title: 'فردي', value: 'فردي' }]"
                            item-title="title" item-value="value" density="comfortable" />
                    </div>

                    <!-- Supplier Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">اسم المورد</label>
                        <SelectInput v-model="formData.supplierName"
                            :items="[{ title: 'حدد المورد', value: 'حدد المورد' }]" item-title="title"
                            item-value="value" density="comfortable" />
                    </div>

                    <!-- Issue Date -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">تاريخ إصدار الطلب</label>
                        <DatePickerInput v-model="formData.issueDate" type="date" density="comfortable"
                            placeholder="اختر التاريخ" />
                    </div>

                    <!-- Request Status -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">حالة الطلب</label>
                        <SelectInput v-model="formData.requestStatus"
                            :items="[{ title: 'جديد', value: 'جديد' }, { title: 'قيد المعالجة', value: 'قيد المعالجة' }]"
                            item-title="title" item-value="value" density="comfortable" />
                    </div>

                    <!-- Project Location -->
                    <div class="relative">
                        <label class="text-sm font-medium text-gray-700 mb-2 block">موقع المشروع</label>
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

            <!-- Transport Service Section -->
            <div class="mb-8">
                <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3">
                    <div class="flex items-center gap-2">
                        <span v-html="truckIcon"></span>
                        <h2 class="text-xl font-bold text-primary-900">خدمة النقل</h2>
                    </div>
                    <ButtonWithIcon color="primary-100" variant="flat" :prepend-icon="downloadIcon"
                        class="!text-primary-900 font-bold">
                        استيراد من ملف إكسل
                    </ButtonWithIcon>
                </div>

                <!-- Transport Services Table -->
                <div class="mb-4">
                    <DataTable :headers="ServicesHeaders" :items="ServicesItems" show-actions force-show-edit
                        force-show-delete />
                </div>

                <!-- Add Transport Service Button -->
                <div class="flex justify-center">
                    <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold w-75"
                        @click="handleAddTransportService">
                        + إضافة بيانات نقل جديدة
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
                            class="!text-primary-900 font-bold" customClass="!h-unset"
                            @click="handleAddTransportService" />

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
        <AddProductDialog v-model="showAddProductDialog" @saved="handleProductSaved" />

        <!-- Add Transport Service Dialog -->
        <AddTransportServiceDialog v-model="showAddTransportServiceDialog" @saved="handleTransportServiceSaved" />

    </default-layout>
</template>

<style scoped>
</style>
