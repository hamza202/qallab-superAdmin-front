<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import AddProductDialog from '@/components/price-offers/AddProductDialog.vue';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import { useApi } from '@/composables/useApi';
import { fileIcon, mapMarkerIcon, messagePlusIcon, filePlusIcon, truckIcon, busIcon, listIcon, CoinHandIcon, fileCheckIcon } from '@/components/icons/priceOffersIcons';
import { returnIcon, saveIcon, HelpCircleIcon } from '@/components/icons/globalIcons';

const { t } = useI18n()
const api = useApi();
const route = useRoute();
const router = useRouter();

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const isLoading = ref(false);
const isSubmitting = ref(false);

const requestTypeItems = ref<any[]>([]);
const paymentMethodItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);
const amPmIntervalItems = ref<any[]>([]);
const unitItems = ref<any[]>([]);
const supplierItems = ref<any[]>([]);

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/purchases/constants');
        const data = res.data;
        if (data) {
            requestTypeItems.value = data.request_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            paymentMethodItems.value = data.payment_methods?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            transportTypeItems.value = data.transport_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            amPmIntervalItems.value = data.am_pm_interval?.map((i: any) => ({ title: i.label, value: i.key })) || [];
        }
    } catch (e) {
        console.error('Error fetching constants:', e);
    }
}

const fetchSuppliers = async () => {
    try {
        const res = await api.get<any>('/suppliers/list');
        if (Array.isArray(res.data)) {
            supplierItems.value = res.data.map((i: any) => ({ title: i.full_name, value: i.id }));
        }
    } catch (e) {
        console.error('Error fetching suppliers:', e);
    }
}

const fetchUnits = async () => {
    try {
        const res = await api.get<any>('/units/list');
        if (Array.isArray(res.data)) {
            unitItems.value = res.data.map((i: any) => ({ title: i.name, value: i.id }));
        }
    } catch (e) {
        console.error('Error fetching units:', e);
    }
}

// Helper function to get transport type name from id
const getTransportTypeName = (transportTypeId: number | string | null): string => {
    if (!transportTypeId) return '';
    const id = Number(transportTypeId);
    const item = transportTypeItems.value.find((i: any) => i.value === id);
    return item?.title || '';
};

// Helper function to get am/pm interval label
const getAmPmIntervalLabel = (interval: string | null): string => {
    if (!interval) return '';
    const item = amPmIntervalItems.value.find((i: any) => i.value === interval);
    return item?.title || '';
};

// Fetch form data for edit mode
const fetchFormData = async () => {
    if (!isEditMode.value || !routeId.value) return;

    isLoading.value = true;
    try {
        const res = await api.get<any>(`/purchases/building-materials/${routeId.value}`);
        const data = res.data;

        if (data) {
            // Populate form data
            formData.value.requestType = data.request_type;
            formData.value.supplier_id = data.supplier_id;
            formData.value.price_offer_name = data.price_offer_name || '';
            formData.value.project_name = data.project_name || '';
            formData.value.issueDate = data.request_datetime ? data.request_datetime.split(' ')[0] : '';
            formData.value.requestStatus = data.status_id;
            formData.value.paymentMethod = data.payment_method;
            formData.value.advancePayment = data.upfront_payment;
            formData.value.target_location = data.target_location;
            formData.value.target_latitude = data.target_latitude;
            formData.value.target_longitude = data.target_longitude;
            formData.value.textNote = data.notes || '';

            // Populate products (items)
            if (data.items && Array.isArray(data.items)) {
                productTableItems.value = data.items.map((item: any) => ({
                    id: item.id,
                    item_id: item.item_id,
                    item_name: item.item_name || '',
                    unit_id: item.unit_id,
                    unit_name: item.unit_name || '',
                    quantity: item.quantity,
                    transport_type: item.transport_type,
                    transport_type_name: getTransportTypeName(item.transport_type),
                    trip_no: item.trip_no,
                    notes: item.notes || ''
                }));
            }

            // Populate transport service (logistics_detail)
            if (data.logistics_detail && (data.logistics_detail.from_date || data.logistics_detail.to_date)) {
                // Convert transport_type strings to numbers
                let vehicleTypes: number[] = [];
                if (data.logistics_detail.transport_type) {
                    if (Array.isArray(data.logistics_detail.transport_type)) {
                        vehicleTypes = data.logistics_detail.transport_type.map((t: string | number) => Number(t));
                    } else {
                        vehicleTypes = [Number(data.logistics_detail.transport_type)];
                    }
                }

                // Get labels for vehicle types
                const vehicleTypesLabels = vehicleTypes
                    .map(id => getTransportTypeName(id))
                    .filter(Boolean)
                    .join(', ');

                Supply.value = {
                    id: data.logistics_detail.id,
                    from_date: data.logistics_detail.from_date || '',
                    to_date: data.logistics_detail.to_date || '',
                    vehicle_types: vehicleTypes,
                    vehicle_types_labels: vehicleTypesLabels,
                    am_pm_interval: data.logistics_detail.am_pm_interval || '',
                    am_pm_interval_label: getAmPmIntervalLabel(data.logistics_detail.am_pm_interval),
                    notes: data.logistics_detail.notes || ''
                };
            }
        }
    } catch (e) {
        console.error('Error fetching form data:', e);
    } finally {
        isLoading.value = false;
    }
}

onMounted(async () => {
    await Promise.all([
        fetchConstants(),
        fetchUnits(),
        fetchSuppliers()
    ]);

    // Fetch form data if in edit mode
    if (isEditMode.value) {
        await fetchFormData();
    }
});

// Interface for product items in the table
interface ProductTableItem {
    item_id: number;
    item_name: string;
    unit_id: number | null;
    unit_name: string;
    quantity: number | null;
    transport_type: number | null;
    transport_type_name: string;
    trip_no: number | null;
    notes: string;
    id?: number; // For edit mode
    isAdded?: boolean; // For dialog state
}

interface Supply {
    id?: number;
    from_date: string;
    to_date: string;
    vehicle_types: number[];
    vehicle_types_labels: string;
    am_pm_interval: string;
    am_pm_interval_label: string;
    notes: string;
}

// Form data with static values
const formData = ref({
    requestNumber: '#12520226',
    requestType: null,

    // Main Info Section
    project_id: null,
    contract_id: null,
    delegation_method: null,
    delegation_limit: '#123434',
    source_location: null as string | null,
    project_location: null as string | null,
    source_latitude: null as string | null,
    source_longitude: null as string | null,
    supplier_type: null,
    supplier_id: null,
    supplier_name: null,
    request_creation_date: '',
    request_date: '',

    // Supply Additional Info Section
    transport_movements: null,
    daily_trips: null,
    loading_responsible: '',
    unloading_responsible: '',
    transport_start_date: '',
    transport_end_date: '',
    execution_period: null,
    execution_period_unit: 'day',
    transport_vehicle_type: null,

    // Old fields (keeping for compatibility)
    price_offer_name: '',
    project_name: '',
    target_location: null as string | null,
    target_latitude: null as string | null,
    target_longitude: null as string | null,
    issueDate: '',
    requestStatus: null,
    paymentMethod: null,
    advancePayment: null,
    delay_fine: null,
    delay_fine_unit: null,
    cancel_fine: null,
    cancel_fine_unit: null,
    textNote: '',
    image: null,
    account: null,
    voice_attachment: null
});

// Products table items (dynamically populated from dialog)
const productTableItems = ref<ProductTableItem[]>([]);

// Transport service (single item - dynamically populated from dialog)
const Supply = ref<Supply | null>(null);

// Computed: check if transport service exists
const hasSupply = computed(() => Supply.value !== null);

// Summary data
const summaryData = computed(() => ({
    productsCount: productTableItems.value.length,
    // servicesCount: Supply.value ? 1 : 0,
    paymentMethod: paymentMethodItems.value.find((i: any) => i.value === formData.value.paymentMethod)?.title || '',
    advancePayment: formData.value.advancePayment || 'لا يوجد'
}));

import { useNotification } from '@/composables/useNotification';
import { required } from '@/utils/validators';

const { warning } = useNotification();

const showAddProductDialog = ref(false);
const editingProduct = ref<ProductTableItem | null>(null);

const handleAddProduct = () => {
    if (!formData.value.supplier_id) {
        warning('يجب عليك اختيار اسم العميل أولاً');
        return;
    }
    editingProduct.value = null; // Reset edit mode
    showAddProductDialog.value = true;
};

const handleProductSaved = (products: ProductTableItem[]) => {
    // Merge new products while preserving existing notes
    const newItems: ProductTableItem[] = [];

    products.forEach(p => {
        // Find if this product already exists in the table
        const existing = productTableItems.value.find(existing => existing.item_id === p.item_id);

        newItems.push({
            ...p,
            notes: existing?.notes || p.notes || '' // Preserve existing notes
        });
    });

    productTableItems.value = newItems;
};

const handleEditProduct = (item: any) => {
    // Find the full product data
    const productToEdit = productTableItems.value.find(p => p.item_id === item.item_id);
    if (productToEdit) {
        editingProduct.value = { ...productToEdit, isAdded: true };
        showAddProductDialog.value = true;
    }
};

const handleProductUpdated = (updatedProduct: ProductTableItem) => {
    const index = productTableItems.value.findIndex(p => p.item_id === updatedProduct.item_id);
    if (index !== -1) {
        // Preserve the notes from the table
        const existingNotes = productTableItems.value[index].notes;
        productTableItems.value[index] = {
            ...updatedProduct,
            notes: existingNotes || updatedProduct.notes || ''
        };
    }
    editingProduct.value = null;
};

const handleDeleteProduct = (item: any) => {
    const index = productTableItems.value.findIndex(p => p.item_id === item.item_id);
    if (index !== -1) {
        productTableItems.value.splice(index, 1);
    }
};


const handleNewRequest = () => {
    console.log('New Request clicked');
};

import { useForm } from '@/composables/useForm';
import { useNotification as useNotify } from '@/composables/useNotification';

const { formRef, isFormValid, validate } = useForm();
const { success, error } = useNotify();

// Format date to DD-MM-YYYY HH:mm:ss
const formatDateTime = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// Format date to DD-MM-YYYY
const formatDate = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

// Build FormData for submission
const buildFormData = (): FormData => {
    const fd = new FormData();

    // Basic fields
    fd.append('request_type', formData.value.requestType || '');
    fd.append('price_offer_name', formData.value.price_offer_name || '');
    fd.append('project_name', formData.value.project_name || '');
    fd.append('request_datetime', formatDateTime(formData.value.issueDate || new Date()));
    fd.append('supplier_id', String(formData.value.supplier_id || ''));
    fd.append('status_id', String(formData.value.requestStatus || 1));
    fd.append('upfront_payment', String(formData.value.advancePayment || ''));
    fd.append('payment_method', formData.value.paymentMethod || '');
    fd.append('target_location', formData.value.target_location || '');
    fd.append('target_latitude', formData.value.target_latitude || '');
    fd.append('target_longitude', formData.value.target_longitude || '');
    fd.append('notes', formData.value.textNote || '');

    // Logistics detail (transport service)
    if (Supply.value) {
        fd.append('logistics_detail[from_date]', formatDate(Supply.value.from_date));
        fd.append('logistics_detail[to_date]', formatDate(Supply.value.to_date));

        // Transport types array
        if (Supply.value.vehicle_types && Supply.value.vehicle_types.length > 0) {
            Supply.value.vehicle_types.forEach((type, index) => {
                fd.append(`logistics_detail[transport_type][${index}]`, String(type));
            });
        }

        fd.append('logistics_detail[am_pm_interval]', Supply.value.am_pm_interval || '');
        fd.append('logistics_detail[notes]', Supply.value.notes || '');
    }

    // Items (products)
    productTableItems.value.forEach((item, index) => {
        // Only include id in edit mode
        if (isEditMode.value && item.id) {
            fd.append(`items[${index}][id]`, String(item.id));
        }
        fd.append(`items[${index}][item_id]`, String(item.item_id));
        fd.append(`items[${index}][unit_id]`, String(item.unit_id || ''));
        fd.append(`items[${index}][quantity]`, String(item.quantity || ''));
        fd.append(`items[${index}][transport_type]`, String(item.transport_type || ''));
        fd.append(`items[${index}][trip_no]`, String(item.trip_no || ''));
        fd.append(`items[${index}][notes]`, item.notes || '');
    });

    // File attachments
    if (formData.value.image) {
        fd.append('image', formData.value.image);
    }

    // if (formData.value.voice_attachment) {
    //     fd.append('voice_attachment', formData.value.voice_attachment);
    // }

    return fd;
}

const handleSubmit = async () => {
    if (!await validate()) return;

    if (productTableItems.value.length === 0) {
        warning('يجب إضافة منتج واحد على الأقل');
        return;
    }

    isSubmitting.value = true;

    try {
        const fd = buildFormData();

        let response;
        if (isEditMode.value) {
            // Edit mode - PUT request
            response = await api.post(`/purchases/building-materials/${routeId.value}`, fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } else {
            // Create mode - POST request
            response = await api.post('/purchases/building-materials', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }

        success(isEditMode.value ? 'تم تحديث الطلب بنجاح' : 'تم إنشاء الطلب بنجاح');

        // Navigate back to list or stay on page based on your preference
        // router.push({ name: 'PurchasesRequestsList' });

    } catch (e: any) {
        console.error('Error submitting form:', e);
        error(e?.response?.data?.message || 'حدث خطأ أثناء حفظ الطلب');
    } finally {
        isSubmitting.value = false;
    }
};

const handleConvertToPrice = () => {
    console.log('Convert to price offer');
};

const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
    formData.value.target_latitude = location.latitude;
    formData.value.target_longitude = location.longitude;
    formData.value.target_location = location.address;

    console.log('Location updated:', location);
};

const showAddSupplyDialog = ref(false);
const editingSupply = ref<Supply | null>(null);

const handleDeleteSupply = () => {
    Supply.value = null;
};

const handleAddSupply = () => {
    editingSupply.value = null; // Reset edit mode
    showAddSupplyDialog.value = true;
};

const handleSupplySaved = (service: Supply) => {
    Supply.value = service;
};

const handleSupplyUpdated = (service: Supply) => {
    Supply.value = service;
    editingSupply.value = null;
};

const handleEditSupply = () => {
    if (Supply.value) {
        editingSupply.value = { ...Supply.value };
        showAddSupplyDialog.value = true;
    }
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

// Computed items for the DataTable (mapped from productTableItems)
const tableItems = computed(() => productTableItems.value.map(item => ({
    id: item.item_id, // Required for DataTable
    item_id: item.item_id,
    name: item.item_name,
    quantity: item.quantity,
    unit: item.unit_name,
    transport_type: item.transport_type_name,
    daily_trips: item.trip_no,
    notes: item.notes,
})));

const ServicesHeaders = [
    { title: 'تاريخ بدء النقل', key: 'from_date' },
    { title: 'تاريخ انتهاء النقل', key: 'to_date' },
    { title: 'نوع المركبات', key: 'vehicle_types_labels' },
    { title: 'توقيت النقل', key: 'am_pm_interval_label' },
    { title: 'ملاحظات', key: 'notes' },
]

// Computed items for the Services DataTable
const serviceTableItems = computed(() => {
    if (!Supply.value) return [];
    return [{
        id: 1,
        from_date: Supply.value.from_date,
        to_date: Supply.value.to_date,
        vehicle_types_labels: Supply.value.vehicle_types_labels,
        am_pm_interval_label: Supply.value.am_pm_interval_label,
        notes: Supply.value.notes,
    }];
});


</script>

<template>
    <default-layout>
        <div class="request-material-product-page -mx-6 bg-qallab-dashboard-bg space-y-4">
            <!-- Page Header -->
            <TopHeader :icon="filePlusIcon" title-key="pages.PurchasesRequests.FormTitle"
                description-key="pages.PurchasesRequests.FormDescription" :show-action="false" code="#124098"
                :code-icon="fileIcon" @action="handleNewRequest" />

            <!-- Request Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100 ">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span v-html="fileCheckIcon"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <!-- Supplier Name (Arabic) -->
                        <div>
                            <SelectInput v-model="formData.supplier_name" :items="supplierItems" placeholder="اختر"
                                label="اسم المورد" density="comfortable" />
                        </div>

                        <!-- Request Creation Date -->
                        <div>
                            <DatePickerInput v-model="formData.request_creation_date" type="date" density="comfortable"
                                placeholder="اختر" label="تاريخ إنشاء الطلبية" />
                        </div>

                        <!-- Request Date -->
                        <div>
                            <DatePickerInput v-model="formData.request_date" type="date" density="comfortable"
                                placeholder="اختر" label="تاريخ الطلبية" />
                        </div>

                        <!-- Request Type -->
                        <div>
                            <SelectInput v-model="formData.requestType" :items="requestTypeItems" label="نوع الطلبية"
                                density="comfortable" placeholder="اختر" />
                        </div>

                        <!-- Project Location -->
                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">موقع المشروع</label>
                            <div @click="openMapDialog"
                                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                <span
                                    class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                                    {{ formData.project_location || 'شارع الدكتور عبد القادر كوشك' }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span v-html="mapMarkerIcon"></span>
                                </div>
                            </div>
                        </div>

                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">موقع مصدر المواد</label>
                            <div @click="openMapDialog"
                                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                <span
                                    class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                                    {{ formData.source_location || 'شارع الدكتور عبد القادر كوشك' }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span v-html="mapMarkerIcon"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Supplier Type -->
                        <div>
                            <SelectInput v-model="formData.supplier_type" :items="[]" label="نوع العميل"
                                :rules="[required()]" density="comfortable" placeholder="اختر" />
                        </div>

                        <!-- Supplier Name -->
                        <div>
                            <SelectInput v-model="formData.supplier_id" :items="supplierItems" label="اسم العميل"
                                :rules="[required()]" density="comfortable" placeholder="اختر" />
                        </div>


                        <!-- Project -->
                        <div>
                            <SelectInput v-model="formData.project_id" :items="[]" label="المشروع" :rules="[required()]"
                                density="comfortable" placeholder="اختر" />
                        </div>

                        <!-- Contract -->
                        <div>
                            <SelectInput v-model="formData.contract_id" :items="[]" label="العقد" :rules="[required()]"
                                density="comfortable" placeholder="اختر" />
                        </div>

                        <!-- Delegation Method -->
                        <div>
                            <label class="text-gray-700 text-sm font-semibold mb-2 block">طلبية تعويض</label>
                            <v-switch :model-value="formData.delegation_method" hide-details inset density="compact"
                                color="primary" class="small-switch" />
                        </div>

                        <TextInput v-model="formData.delegation_limit" label="كود عرض السعر" density="comfortable"
                            :hide-details="false">
                            <template #append-inner>
                                <v-tooltip location="top" content-class="custom-tooltip">
                                    <template #activator="{ props: tooltipProps }">
                                        <ButtonWithIcon variant="text" size="small" density="compact"
                                            custom-class="!min-w-0 p-0" :prepend-icon="HelpCircleIcon"
                                            v-bind="tooltipProps" />
                                    </template>
                                    <div>
                                        كود عرض السعر
                                    </div>
                                </v-tooltip>
                            </template>
                        </TextInput>


                    </div>
                </v-form>
            </div>

            <!-- Products Section -->
            <div class="bg-white rounded-3xl border !border-gray-100">
                <div class="px-6 py-6">
                    <div class="flex items-center gap-2 mb-2">
                        <span v-html="listIcon"></span>
                        <h2 class="text-base font-bold text-primary-600">جدول عناصر الطللبية</h2>
                    </div>
                    <p class="text-emerald-500 text-sm font-bold ms-7">** الأسعار شاملة للنقل</p>
                </div>

                <!-- Products Table -->
                <DataTable :headers="headers" :items="tableItems" show-actions force-show-edit force-show-delete
                    @edit="handleEditProduct" @delete="handleDeleteProduct">
                    <template #item.notes="{ item }">
                        <v-menu attach="request-material-product-page" location="bottom" offset="8"
                            :close-on-content-click="false" transition="slide-y-transition">
                            <template #activator="{ props }">
                                <div class="flex items-center gap-2 cursor-pointer" v-bind="props">
                                    <v-icon size="20" color="primary" v-html="messagePlusIcon"></v-icon>
                                    <span class="text-gray-900">{{ item.notes || 'أضف ملاحظة' }}</span>
                                </div>
                            </template>

                            <!-- Popup content -->
                            <v-card class="pa-4 shadow-[rgba(149,157,165,0.2)_0px_8px_24px] overflow-hidden px-3 py-3"
                                color="white" rounded="lg" width="300">
                                <div class="!flex flex-nowrap items-center gap-3">
                                    <TextInput
                                        v-model="productTableItems[productTableItems.findIndex(p => p.item_id === item.item_id)].notes"
                                        placeholder="أضف ملاحظة" variant="outlined" density="comfortable" hide-details
                                        autofocus class="flex-1" />
                                    <ButtonWithIcon :icon="messagePlusIcon" color="primary" icon-only size="x-small" />

                                </div>
                            </v-card>
                        </v-menu>
                    </template>
                </DataTable>

                <!-- Add Product Button -->
                <div class="flex justify-center my-6 ">
                    <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold w-75"
                        @click="handleAddProduct">
                        + إضافة منتج جديد
                    </ButtonWithIcon>
                </div>
            </div>

            <!-- Suppliers details Section -->
            <div class="bg-white rounded-3xl border !border-gray-100">
                <div class="px-6 py-6">
                    <div class="flex items-center gap-2">
                        <span v-html="busIcon"></span>
                        <h2 class="text-base font-bold text-primary-600">تفاصيل التوريد</h2>
                    </div>
                </div>

                <DataTable :headers="ServicesHeaders" :items="serviceTableItems" show-actions force-show-edit
                    force-show-delete @edit="handleEditSupply" @delete="handleDeleteSupply" />

                <div class="flex justify-center my-6">
                    <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold w-75">
                        + إضافة تفاصيل التوريد </ButtonWithIcon>
                </div>
            </div>

            <!-- Supply Additional Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100 ">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span v-html="truckIcon"></span>
                    <h2 class="text-base font-bold">بيانات التوريد الإضافية</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                        <!-- Transport Start Date -->
                        <div>
                            <DatePickerInput v-model="formData.transport_start_date" type="date" density="comfortable"
                                placeholder="اختر" label="تاريخ بدء النقل" />
                        </div>

                        <!-- Transport End Date -->
                        <div>
                            <DatePickerInput v-model="formData.transport_end_date" type="date" density="comfortable"
                                placeholder="اختر" label="تاريخ انتهاء النقل" :rules="[required()]" />
                        </div>

                        <!-- Execution Period -->
                        <div>
                            <TextInputWithSelect v-model="formData.execution_period"
                                v-model:selectValue="formData.execution_period_unit" label="مدة التنفيذ"
                                placeholder="أدخل المدة بالأيام" type="number" :rules="[required()]" select-width="70px"
                                :select-items="[{ value: 'day', title: 'يوم' }, { value: 'week', title: 'أسبوع' }, { value: 'month', title: 'شهر' }]"
                                select-placeholder="يوم" />
                        </div>

                        <!-- Transport Vehicle Type -->
                        <div>
                            <SelectInput v-model="formData.transport_vehicle_type" :items="[]" label="نوع مركبة النقل"
                                density="comfortable" placeholder="اختر" />
                        </div>
                        <!-- Number of Transport Movements -->
                        <div>
                            <TextInput v-model="formData.transport_movements" placeholder="أدخل العدد"
                                label="عدد حركات النقل" type="number" density="comfortable" />
                        </div>

                        <!-- Number of Daily Trips -->
                        <div>
                            <TextInput v-model="formData.daily_trips" placeholder="أدخل العدد" label="عدد الرحلات الكلي"
                                :rules="[required()]" type="number" density="comfortable" />
                        </div>

                        <!-- Responsible for Loading -->
                        <div>
                            <TextInput v-model="formData.loading_responsible" placeholder="أدخل اسم مسؤول التحميل"
                                label="مسؤول التحميل" density="comfortable" />
                        </div>

                        <!-- Responsible for Unloading -->
                        <div>
                            <TextInput v-model="formData.unloading_responsible" placeholder="أدخل اسم مسؤول التفريغ"
                                label="مسؤول التفريغ" density="comfortable" />
                        </div>

                    </div>
                </v-form>
            </div>

            <!-- Attachments and Summary Section -->
            <div class="grid grid-cols-1 xl:grid-cols-3 justify-between gap-4 bg-qallab-dashboard-bg py-5 px-2">
                <div class="bg-white rounded-2xl xl:col-span-2">
                    <div class="flex items-center gap-2 p-6 border-b !border-gray-200">
                        <span v-html="CoinHandIcon"></span>
                        <h2 class="text-base font-bold text-primary-600">بيانات الدفع</h2>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectInput v-model="formData.requestType" :items="requestTypeItems" density="comfortable"
                                placeholder="حدد طريقة الدفع" label="طريقة الدفع" />
                            <PriceInput showRialIcon v-model="formData.requestType" density="comfortable"
                                label="دفعة مقدمة" placeholder="أدخل قيمة الدفعة" />

                            <TextInput label="مدة رفع المستخلص" v-model="formData.price_offer_name"
                                placeholder="أدخل المدة بالأيام" :rules="[required(), numeric()]" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">
                                        يوم
                                    </span>
                                </template>
                            </TextInput>
                            <TextInput label="مدة السداد" v-model="formData.price_offer_name"
                                placeholder="أدخل المدة بالأيام" :rules="[required(), numeric()]" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">
                                        يوم
                                    </span>
                                </template>
                            </TextInput>

                            <TextInputWithSelect v-model="formData.delay_fine"
                                v-model:selectValue="formData.delay_fine_unit" label="غرامة التأخير"
                                placeholder="أدخل المبلغ" type="number" :rules="[numeric(), positive()]"
                                select-width="70px"
                                :select-items="[{ value: 'rial', title: 'ريال' }, { value: 'dolar', title: 'دولار' }]"
                                select-placeholder="اختر" />

                            <TextInputWithSelect v-model="formData.cancel_fine"
                                v-model:selectValue="formData.cancel_fine_unit" label="غرامة الإلغاء"
                                placeholder="أدخل المبلغ" type="number" :rules="[numeric(), positive()]"
                                select-width="70px"
                                :select-items="[{ value: 'rial', title: 'ريال' }, { value: 'dolar', title: 'دولار' }]"
                                select-placeholder="اختر" />

                            <SelectInput v-model="formData.account" :items="supplierItems" label="الحساب"
                                :rules="[required()]" density="comfortable" placeholder="حدد الحساب" />

                        </div>
                    </div>
                </div>

                <div class="rounded-2xl overflow-hidden border !border-gray-200 bg-primary-25">
                    <table class="w-full">
                        <!-- Table Header -->
                        <thead>
                            <tr class="bg-primary-400">
                                <th
                                    class="text-white font-semibold text-base py-3 px-4 text-center border-l !border-gray-200">
                                    نوع الخصم
                                </th>
                                <th class="text-white font-semibold text-base py-3 px-4 text-center">
                                    المبلغ
                                </th>
                            </tr>
                        </thead>
                        <!-- Table Body -->
                        <tbody class="text-sm bg-primary-25">
                            <!-- Received from / Destination -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    المجموع قبل الخصم
                                </td>
                                <td class="py-6 px-4 text-center text-gray-600">
                                    22
                                </td>
                            </tr>

                            <!-- Voucher Number -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    الخصم
                                </td>
                                <td class="py-6 px-4 text-center text-gray-600">
                                    22
                                </td>
                            </tr>

                            <!-- Classification -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    المجموع بعد الخصم
                                </td>
                                <td class="py-6 px-4 text-center text-gray-600">
                                    22
                                </td>
                            </tr>

                            <!-- Total Amount -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    الضريبة
                                </td>
                                <td class="py-6 px-4 text-center text-gray-600">
                                    22
                                </td>
                            </tr>

                            <!-- Current Balance -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    اجمالي الضريبة
                                </td>
                                <td class="py-6 px-4 text-center text-gray-600">
                                    22
                                </td>
                            </tr>

                            <!-- After Operation Balance -->
                            <tr class="">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    الإجمالي النهائي
                                </td>
                                <td class="py-6 px-4 font-bold text-center text-gray-900">
                                    22
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-3 flex items-center justify-center gap-3">
                <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                    <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                        custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                        label="حفظ والعودة للرئيسية" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        label="حفظ وإنشاء جديد" />
                </div>
            </div>

        </div>

        <Map v-model="showMapDialog" :latitude="formData.target_latitude" :longitude="formData.target_longitude"
            :address="formData.target_location" @location-selected="handleLocationSelected" />

        <!-- Add Product Dialog -->
        <AddProductDialog v-model="showAddProductDialog" request-type="raw_materials"
            :transport-types="transportTypeItems" :unit-items="unitItems" :supplier-id="formData.supplier_id"
            :edit-product="editingProduct" :existing-products="productTableItems" @saved="handleProductSaved"
            @product-updated="handleProductUpdated" />
    </default-layout>
</template>

<style scoped></style>
