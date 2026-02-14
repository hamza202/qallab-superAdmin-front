<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import AddProductDialogFuels, { type FuelProductToAdd } from '@/components/price-offers/AddProductDialogFuels.vue';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import VoiceRecorder from '@/components/common/forms/VoiceRecorder.vue';
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import DateTimePickerInput from '@/components/common/forms/DateTimePickerInput.vue';
import TelInput from '@/components/common/forms/TelInput.vue';
import { useApi } from '@/composables/useApi';
import { fileIcon, fileCheckIcon, mapMarkerIcon, downloadIcon, packageIcon, UploadedFileIcon, fileQuestionIcon, messagePlusIcon } from '@/components/icons/priceOffersIcons';

useI18n()
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
const deliveryMethodItems = ref<any[]>([]);
const supplyTypeItems = ref<any[]>([]);
const fillingsItems = ref<any[]>([]);
const supplierItems = ref<any[]>([]);

const fetchSuppliers = async () => {
    try {
        const res = await api.get<any>('/suppliers/list');
        if (Array.isArray(res.data)) {
            supplierItems.value = res.data.map((i: any) => ({ title: i.full_name, value: i.id }));
        }
    } catch (e) {
        console.error('Error fetching suppliers:', e);
    }
};

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/purchases/constants');
        const data = res.data;
        if (data) {
             requestTypeItems.value = data.request_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
             paymentMethodItems.value = data.payment_methods?.map((i: any) => ({ title: i.label, value: i.key })) || [];
             transportTypeItems.value = data.transport_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
             amPmIntervalItems.value = data.am_pm_interval?.map((i: any) => ({ title: i.label, value: i.key })) || [];
             const deliveryMethods = data.delivered_methods ?? data.delivery_methods;
             if (deliveryMethods?.length) deliveryMethodItems.value = deliveryMethods.map((i: any) => ({ title: i.label, value: i.key }));
             if (data.supply_types?.length) supplyTypeItems.value = data.supply_types.map((i: any) => ({ title: i.label, value: i.key }));
             if (data.fillings?.length) fillingsItems.value = data.fillings.map((i: any) => ({ title: i.label, value: i.key }));
        }
    } catch(e) {
        console.error('Error fetching constants:', e);
    }
}

const fetchUnits = async () => {
    try {
        const res = await api.get<any>('/units/list');
        if (Array.isArray(res.data)) {
            unitItems.value = res.data.map((i: any) => ({ title: i.name, value: i.id }));
        }
    } catch(e) {
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

// Helper: التعبئة (Packaging) label from constants.fillings
const getFillingName = (key: number | string | null): string => {
    if (key == null) return '';
    const item = fillingsItems.value.find((i: any) => i.value === key || i.value === Number(key));
    return item?.title || '';
};

// Fetch form data for edit mode
const fetchFormData = async () => {
    if (!isEditMode.value || !routeId.value) return;
    
    isLoading.value = true;
    try {
        const res = await api.get<any>(`/purchases/fuels/${routeId.value}`);
        const data = res.data;
        
        if (data) {
            const logistics = data.logistics_detail || {};
            // Populate form data (top-level and logistics_detail)
            formData.value.requestType = data.request_type ?? null;
            formData.value.request_datetime = data.request_datetime ? String(data.request_datetime) : '';
            formData.value.deliveryStartDate = (data.delivery_start_date || logistics.from_date || '')
                .toString().split(' ')[0] || '';
            formData.value.paymentMethod = data.payment_method ?? null;
            formData.value.advancePayment = data.upfront_payment != null ? data.upfront_payment : null;
            formData.value.responsibleName = data.responsible_person ?? data.responsible_name ?? '';
            formData.value.responsiblePhone = data.responsible_phone ?? null;
            formData.value.deliveryMethod = (data.delivery_method ?? logistics.delivered_method) ?? null;
            formData.value.supplyType = (data.supply_type ?? logistics.supply_type) ?? null;
            formData.value.supplier_id = data.supplier_id ?? null;
            formData.value.target_location = data.target_location ?? null;
            formData.value.target_latitude = data.target_latitude ?? null;
            formData.value.target_longitude = data.target_longitude ?? null;
            formData.value.source_location = data.source_location ?? null;
            formData.value.source_latitude = data.source_latitude ?? null;
            formData.value.source_longitude = data.source_longitude ?? null;
            formData.value.supplyDuration = (data.supply_duration ?? logistics.supply_interval) ?? null;
            formData.value.deliveryDuration = (data.delivery_duration ?? logistics.delivered_interval) ?? null;
            formData.value.textNote = data.notes || '';
            formData.value.code = data.code != null ? String(data.code) : '';

            // Populate products (items): API returns filling, form uses transport_type for packaging
            if (data.items && Array.isArray(data.items)) {
                productTableItems.value = data.items.map((item: any) => {
                    const transportType = item.filling ?? item.transport_type;
                    return {
                        id: item.id,
                        item_id: item.item_id,
                        item_name: item.item_name || '',
                        unit_id: item.unit_id,
                        unit_name: item.unit_name || '',
                        quantity: item.quantity != null ? (typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity) : null,
                        transport_type: transportType,
                        transport_type_name: getFillingName(transportType) || getTransportTypeName(transportType),
                        supply_type: item.supply_type ?? null,
                        supply_type_name: supplyTypeItems.value.find((s: any) => s.value === item.supply_type)?.title || '',
                        trip_no: item.trip_no ?? null,
                        notes: item.notes || ''
                    };
                });
            }
        }
    } catch(e) {
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
    transport_type_name?: string;
    supply_type?: string | null;
    supply_type_name?: string;
    trip_no: number | null;
    notes: string;
    id?: number; // For edit mode
    isAdded?: boolean; // For dialog state
    unit_price: number | null;
    discount: number | null;
}

// Form data (request date, delivery start, responsible, phone, delivery method, supply type, location, durations)
const formData = ref({
    requestNumber: '#12520226',
    requestType: null as string | null,
    supplier_id: null as number | null,
    deliveryStartDate: '' as string,
    request_datetime: '' as string,
    paymentMethod: null as string | null,
    advancePayment: null as number | string | null,
    responsibleName: '' as string,
    responsiblePhone: null as string | null,
    deliveryMethod: null as string | null,
    supplyType: null as string | null,
    target_location: null as string | null,
    target_latitude: null as string | null,
    target_longitude: null as string | null,
    source_location: null as string | null,
    source_latitude: null as string | null,
    source_longitude: null as string | null,
    supplyDuration: null as number | string | null,
    deliveryDuration: null as number | string | null,
    textNote: '',
    image: null as File[] | null,
    voice_attachment: null as File | null,
    code: '' as string
});

// Products table items (dynamically populated from dialog)
const productTableItems = ref<ProductTableItem[]>([]);

// Summary data
const summaryData = computed(() => ({
    productsCount: productTableItems.value.length,
    servicesCount: 0,
    paymentMethod: paymentMethodItems.value.find((i: any) => i.value === formData.value.paymentMethod)?.title || '',
    advancePayment: formData.value.advancePayment != null && formData.value.advancePayment !== '' ? String(formData.value.advancePayment) : 'لا يوجد'
}));



import { useNotification } from '@/composables/useNotification';
import { required } from '@/utils/validators';

const { success, warning, apiError } = useNotification();

const showAddProductDialog = ref(false);
const editingProduct = ref<ProductTableItem | null>(null);

// Items endpoint for modal: same pattern as material-product (supplier items by supplier_id)
const fuelsItemsEndpoint = computed(() =>
    formData.value.supplier_id
        ? `/items/supplier-items?supplier_id=${formData.value.supplier_id}&material_type=2`
        : ''
);

const handleAddProduct = () => {
    if (!formData.value.supplier_id) {
        warning('يجب عليك اختيار اسم المورد أولاً');
        return;
    }
    editingProduct.value = null; // Reset edit mode
    showAddProductDialog.value = true;
};

const handleProductSaved = (products: FuelProductToAdd[]) => {
    const newItems: ProductTableItem[] = [];
    products.forEach(p => {
        const existing = productTableItems.value.find(existing => existing.item_id === p.item_id);
        newItems.push({
            ...p,
            // Recalculate names to ensure fresh data
            transport_type_name: getFillingName(p.transport_type),
            supply_type_name: supplyTypeItems.value.find((s: any) => s.value === p.supply_type)?.title || '',
            trip_no: p.trip_no ?? null,
            unit_price: p.unit_price ?? null,
            discount: p.discount ?? null,
            notes: existing?.notes || p.notes || ''
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

const handleProductUpdated = (updatedProduct: FuelProductToAdd) => {
    const index = productTableItems.value.findIndex(p => p.item_id === updatedProduct.item_id);
    if (index !== -1) {
        const existingNotes = productTableItems.value[index].notes;
        productTableItems.value[index] = {
            ...updatedProduct,
            // Ensure names are correct using local lookup
            transport_type_name: getFillingName(updatedProduct.transport_type),
            supply_type_name: supplyTypeItems.value.find((s: any) => s.value === updatedProduct.supply_type)?.title || '',
            trip_no: updatedProduct.trip_no ?? null,
            unit_price: updatedProduct.unit_price ?? null,
            discount: updatedProduct.discount ?? null,
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

import { useForm } from '@/composables/useForm';

const { formRef, isFormValid, validate } = useForm();

// Format date to DD-MM-YYYY for logistics_detail[from_date]
const formatDateDdMmYyyy = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

// Build FormData for submission
const buildFormData = (): FormData => {
    const fd = new FormData();
    
    // Add _method: PUT for edit mode
    if (isEditMode.value) {
        fd.append('_method', 'PUT');
    }
    
    // Basic fields (aligned with Store endpoint)
    fd.append('request_type', formData.value.requestType || '');
    fd.append('request_datetime', formData.value.request_datetime || '');
    if (formData.value.deliveryStartDate) fd.append('delivery_start_date', formData.value.deliveryStartDate);
    fd.append('upfront_payment', String(formData.value.advancePayment || ''));
    fd.append('payment_method', formData.value.paymentMethod || '');
    fd.append('responsible_person', formData.value.responsibleName || '');
    if (formData.value.responsiblePhone) fd.append('responsible_phone', formData.value.responsiblePhone);
    if (formData.value.deliveryMethod) fd.append('delivery_method', formData.value.deliveryMethod);
    if (formData.value.supplyType) fd.append('supply_type', formData.value.supplyType);
    if (formData.value.supplier_id != null) fd.append('supplier_id', String(formData.value.supplier_id));
    fd.append('target_location', formData.value.target_location || '');
    fd.append('target_latitude', String(formData.value.target_latitude ?? ''));
    fd.append('target_longitude', String(formData.value.target_longitude ?? ''));
    fd.append('source_location', formData.value.source_location || '');
    fd.append('source_latitude', String(formData.value.source_latitude ?? ''));
    fd.append('source_longitude', String(formData.value.source_longitude ?? ''));
    if (formData.value.supplyDuration != null) fd.append('supply_duration', String(formData.value.supplyDuration));
    if (formData.value.deliveryDuration != null) fd.append('delivery_duration', String(formData.value.deliveryDuration));

    // logistics_detail (required by API – Postman keys)
    fd.append('logistics_detail[from_date]', formatDateDdMmYyyy(formData.value.deliveryStartDate) || '');
    fd.append('logistics_detail[supply_type]', formData.value.supplyType || '');
    fd.append('logistics_detail[supply_interval]', formData.value.supplyDuration != null && formData.value.supplyDuration !== '' ? String(formData.value.supplyDuration) : '');
    fd.append('logistics_detail[delivered_interval]', formData.value.deliveryDuration != null && formData.value.deliveryDuration !== '' ? String(formData.value.deliveryDuration) : '');
    fd.append('logistics_detail[delivered_method]', formData.value.deliveryMethod || '');
    fd.append('notes', formData.value.textNote || '');
    
    // Items (products) – keys per Postman: item_id, unit_id, quantity, supply_type, filling, notes
    productTableItems.value.forEach((item, index) => {
        if (isEditMode.value && item.id) {
            fd.append(`items[${index}][id]`, String(item.id));
        }
        fd.append(`items[${index}][item_id]`, String(item.item_id));
        fd.append(`items[${index}][unit_id]`, String(item.unit_id || ''));
        fd.append(`items[${index}][quantity]`, String(item.quantity || ''));
        if (item.supply_type) fd.append(`items[${index}][supply_type]`, String(item.supply_type));
        if (item.transport_type != null && String(item.transport_type).trim() !== '') fd.append(`items[${index}][filling]`, String(item.transport_type));
        fd.append(`items[${index}][notes]`, item.notes || '');
    });
    
    // File attachments
    if (formData.value.image?.length) {
        fd.append('image', formData.value.image[0]);
    }
    
    // if (formData.value.voice_attachment) {
    //     fd.append('voice_attachment', formData.value.voice_attachment);
    // }
    
    return fd;
}

const handleSubmit = async () => {
    if (!await validate()) return;
    
    locationError.value = null;
    if (!formData.value.target_location?.trim()) {
        locationError.value = 'يجب تحديد موقع تسليم المواد';
        warning('يجب تحديد موقع تسليم المواد');
        return;
    }
    
    if (productTableItems.value.length === 0) {
        warning('يجب إضافة منتج واحد على الأقل');
        return;
    }
    
    isSubmitting.value = true;
    
    try {
        const fd = buildFormData();
        
        if (isEditMode.value && routeId.value) {
            // Edit mode - POST with _method: PUT and UUID in URL
            await api.post(`/purchases/fuels/${routeId.value}`, fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } else {
            // Create mode - POST request
            await api.post('/purchases/fuels', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }
        
        success(isEditMode.value ? 'تم تحديث الطلب بنجاح' : 'تم إنشاء الطلب بنجاح');
        
        // Navigate back to fuels list
        router.push({ name: 'RequestForQuotationFuelList' });
        
    } catch (e: any) {
        console.error('Error submitting form:', e);
        apiError(e);
    } finally {
        isSubmitting.value = false;
    }
};

const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
    formData.value.target_latitude = location.latitude;
    formData.value.target_longitude = location.longitude;
    formData.value.target_location = location.address;
    locationError.value = null;
};

const handleSourceLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
    formData.value.source_latitude = location.latitude;
    formData.value.source_longitude = location.longitude;
    formData.value.source_location = location.address;
};

const showMapDialog = ref(false);
const showSourceMapDialog = ref(false);
const locationError = ref<string | null>(null);

const openMapDialog = () => {
    showMapDialog.value = true;
};

const openSourceMapDialog = () => {
    showSourceMapDialog.value = true;
};

const headers = [
    { title: 'اسم المنتج', key: 'name' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'الوحدة', key: 'unit' },
    { title: 'التعبئة', key: 'packaging' },
    { title: 'نوع التوريد', key: 'supply_type' },
    { title: 'ملاحظات', key: 'notes' },
]

// Computed items for the DataTable (mapped from productTableItems; packaging = transport_type_name, supply_type from item)
const tableItems = computed(() => productTableItems.value.map(item => ({
    id: item.item_id,
    item_id: item.item_id,
    name: item.item_name,
    quantity: item.quantity,
    unit: item.unit_name,
    packaging: item.transport_type_name || '—',
    supply_type: item.supply_type_name || supplyTypeItems.value.find((s: any) => s.value === item.supply_type)?.title || '—',
    notes: item.notes,
})));

</script>

<template>
    <default-layout>
        <div class="request-material-product-page -mx-6">
            <!-- Page Header (كود العرض #124098) -->
            <TopHeader :icon="fileQuestionIcon" title-key="pages.PurchasesRequestsFuels.FormTitle"
                description-key="pages.PurchasesRequestsFuels.FormDescription" :show-action="false"
                :code="isEditMode ? (formData.code ? '#' + formData.code : '') : '#124098'" :code-icon="fileIcon" />

            <!-- البيانات الأساسية -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span v-html="fileCheckIcon"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <!-- Row 1: تاريخ الطلب, اسم المورد, اسم المسؤول*, هاتف المسؤول* -->
                        <div>
                            <DateTimePickerInput v-model="formData.request_datetime"
                                label="تاريخ الطلب"
                                density="comfortable"
                                placeholder="اختر التاريخ والوقت"
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">اسم المورد <span class="text-error-600">*</span></label>
                            <SelectInput v-model="formData.supplier_id"
                                :items="supplierItems" item-title="title" item-value="value"
                                placeholder="حدد المورد" density="comfortable" :rules="[required()]" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">اسم المسؤول <span class="text-error-600">*</span></label>
                            <TextInput v-model="formData.responsibleName" placeholder="أدخل اسم المسؤول"
                                density="comfortable" :rules="[required()]" hide-details />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">هاتف المسؤول <span class="text-error-600">*</span></label>
                            <TelInput v-model="formData.responsiblePhone" placeholder="5XX XXX XXXX"
                                density="comfortable" :rules="[required()]" />
                        </div>

                        <!-- Row 2: طريقة الدفع*, دفعة مقدمة, طريقة التسليم, موقع تسليم المواد* -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع <span class="text-error-600">*</span></label>
                            <SelectInput v-model="formData.paymentMethod"
                                :items="paymentMethodItems" item-title="title" placeholder="حدد طريقة الدفع"
                                :rules="[required()]"
                                item-value="value" density="comfortable" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">دفعة مقدمة</label>
                            <PriceInput showRialIcon v-model="formData.advancePayment" density="comfortable"
                                class="flex-1" placeholder="أدخل قيمة الدفعة" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">طريقة التسليم</label>
                            <SelectInput v-model="formData.deliveryMethod"
                                :items="deliveryMethodItems" item-title="title" placeholder="حدد طريقة التسليم"
                                item-value="value" density="comfortable" />
                        </div>

                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">موقع تسليم المواد <span class="text-error-600">*</span></label>
                            <div @click="openMapDialog"
                                class="flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer transition-colors"
                                :class="locationError ? '!border-error-500 bg-error-50' : '!border-blue-400 hover:bg-blue-100'">
                                <span class="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                                    :class="locationError ? 'text-error-700' : 'text-blue-900'">
                                    {{ formData.target_location || 'حدد الموقع' }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span v-html="mapMarkerIcon"></span>
                                </div>
                            </div>
                            <p v-if="locationError" class="text-error-600 text-xs mt-1">{{ locationError }}</p>
                        </div>

                        <!-- موقع استلام المواد -->
                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">موقع استلام المواد</label>
                            <div @click="openSourceMapDialog"
                                class="flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer transition-colors !border-blue-400 hover:bg-blue-100">
                                <span class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {{ formData.source_location || 'حدد الموقع' }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span v-html="mapMarkerIcon"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Row 3: تاريخ بدء التسليم*, نوع التوريد*, مدة التوريد, مدة التسليم -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">تاريخ بدء التسليم <span class="text-error-600">*</span></label>
                            <DatePickerInput v-model="formData.deliveryStartDate" type="date" density="comfortable"
                                placeholder="اختر التاريخ" :rules="[required()]" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">نوع التوريد <span class="text-error-600">*</span></label>
                            <SelectInput v-model="formData.supplyType"
                                :items="supplyTypeItems" item-title="title" placeholder="حدد نوع التوريد"
                                :rules="[required()]"
                                item-value="value" density="comfortable" />
                        </div>

                        <div>
                            <PriceInput
                                label="مدة التوريد"
                                v-model="formData.supplyDuration"
                                placeholder="أدخل المدة"
                                density="comfortable"
                                hide-details
                            >
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm"> يوم </span>
                                </template>
                            </PriceInput>
                        </div>

                        <div>
                            <PriceInput
                                label="مدة التسليم"
                                v-model="formData.deliveryDuration"
                                placeholder="أدخل المدة"
                                density="comfortable"
                                hide-details
                            >
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm"> يوم </span>
                                </template>
                            </PriceInput>
                        </div>
                    </div>
                </v-form>
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
                    <DataTable :headers="headers" :items="tableItems" show-actions force-show-edit force-show-delete
                        @edit="handleEditProduct"
                        @delete="handleDeleteProduct">
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
                                <v-card
                                    class="pa-4 shadow-[rgba(149,157,165,0.2)_0px_8px_24px] overflow-hidden px-3 py-3"
                                    color="white" rounded="lg" width="300">
                                    <div class="!flex flex-nowrap items-center gap-3">
                                        <TextInput v-model="productTableItems[productTableItems.findIndex(p => p.item_id === item.item_id)].notes" 
                                            placeholder="أضف ملاحظة" variant="outlined"
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

                    <!-- Voice Message -->
                    <VoiceRecorder v-model="formData.voice_attachment" />

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
                    <div class="mt-3">
                        <ButtonWithIcon color="primary" class="w-full" label="إرسال الطلب" height="48" size="large"
                            @click="handleSubmit" />
                    </div>
                </div>

            </div>
        </div>

        <Map v-model="showMapDialog" 
            :latitude="formData.target_latitude"
            :longitude="formData.target_longitude"
            :address="formData.target_location"
            @location-selected="handleLocationSelected" />

        <Map v-model="showSourceMapDialog"
            :latitude="formData.source_latitude"
            :longitude="formData.source_longitude"
            :address="formData.source_location"
            @location-selected="handleSourceLocationSelected" />

        <!-- Add Product Dialog (items based on supplier_id, same as material-product) -->
        <AddProductDialogFuels v-model="showAddProductDialog"
            :fillings-options="fillingsItems"
            :unit-items="unitItems"

            :supply-type-options="supplyTypeItems"
            :items-endpoint="fuelsItemsEndpoint"
            :edit-product="editingProduct"
            :existing-products="productTableItems"
            @saved="handleProductSaved"
            @product-updated="handleProductUpdated" />

    </default-layout>
</template>

<style scoped>
</style>
