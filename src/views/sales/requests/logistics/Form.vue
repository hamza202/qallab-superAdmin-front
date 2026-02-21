<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import AddProductDialog from '@/components/price-offers/AddProductDialog.vue';
import AddLogisticsDetailDialog from './components/AddLogisticsDetailDialog.vue';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import { useApi } from '@/composables/useApi';
import { fileIcon, mapMarkerIcon, packageIcon, downloadIcon, fileQuestionIcon, busIcon, globeIcon } from '@/components/icons/priceOffersIcons';
import { useForm } from '@/composables/useForm';
import { useNotification } from '@/composables/useNotification';
import { binIcon, fileCheckIcon, returnIcon, saveIcon } from "@/components/icons/globalIcons";
const { formRef, isFormValid, validate } = useForm();
const { success, warning, apiError } = useNotification();

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
const actualExecutionIntervalItems = ref<any[]>([]);
const categoriesItems = ref<any[]>([]);

const fetchCategories = async () => {
    try {
        const res = await api.get<any>('/categories/list');
        if (Array.isArray(res.data)) {
            categoriesItems.value = res.data.map((i: any) => ({ title: i.name, value: i.id }));
        }
    } catch (e) {
        console.error('Error fetching categories:', e);
    }
}

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/sales/constants');
        const data = res.data;
        if (data) {
            requestTypeItems.value = data.request_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            paymentMethodItems.value = data.payment_methods?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            transportTypeItems.value = data.transport_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            amPmIntervalItems.value = data.am_pm_interval?.map((i: any) => ({ title: i.label, value: i.key })) || [];

            // Actual execution interval - use from API or fallback
            if (data.actual_execution_interval && Array.isArray(data.actual_execution_interval)) {
                actualExecutionIntervalItems.value = data.actual_execution_interval.map((i: any) => ({ title: i.label, value: i.key }));
            }
        }
    } catch (e) {
        console.error('Error fetching constants:', e);
    }
}

const fetchSuppliers = async () => {
    try {
        const res = await api.get<any>('/suppliers/list', {
            params: {
                service_type: 'logistic_company'
            }
        });
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
        const res = await api.get<any>(`/sales/logistics/${routeId.value}`);
        const data = res.data;

        if (data) {
            // Populate form data
            formData.value.responsible_person = data.responsible_person || '';
            formData.value.responsible_phone = data.responsible_phone || '';
            formData.value.issueDate = data.request_datetime ? data.request_datetime.split(' ')[0] : '';
            formData.value.request_datetime = data.request_datetime ? String(data.request_datetime) : '';
            formData.value.project_name = data.project_name || '';
            formData.value.paymentMethod = data.payment_method;
            formData.value.advancePayment = data.upfront_payment;
            formData.value.target_location = data.target_location;
            formData.value.target_latitude = data.target_latitude;
            formData.value.target_longitude = data.target_longitude;
            formData.value.source_location = data.source_location;
            formData.value.source_latitude = data.source_latitude;
            formData.value.source_longitude = data.source_longitude;
            formData.value.textNote = data.notes || '';
            formData.value.code = data.code ? String(data.code) : '';

            // Populate products (items)
            if (data.items && Array.isArray(data.items)) {
                productTableItems.value = data.items.map((item: any) => ({
                    id: item.id,
                    item_id: item.item_id,
                    item_name: item.item_name || '',
                    unit_id: item.unit_id,
                    unit_name: item.unit_name || '',
                    quantity: item.quantity
                }));
            }

            // Populate logistics details (array)
            if (data.logistics_detail && Array.isArray(data.logistics_detail)) {
                logisticsDetails.value = data.logistics_detail.map((detail: any) => {
                    // Convert transport_type and material_type to arrays
                    let transportTypes: number[] = [];
                    if (detail.transport_type) {
                        transportTypes = Array.isArray(detail.transport_type)
                            ? detail.transport_type.map((t: string | number) => Number(t))
                            : [Number(detail.transport_type)];
                    }

                    let materialTypes: number[] = [];
                    if (detail.material_type) {
                        materialTypes = Array.isArray(detail.material_type)
                            ? detail.material_type.map((t: string | number) => Number(t))
                            : [Number(detail.material_type)];
                    }

                    return {
                        id: detail.id,
                        material_type: materialTypes,
                        trip_no: detail.trip_no,
                        actual_execution_interval: detail.actual_execution_interval,
                        am_pm_interval: detail.am_pm_interval || '',
                        from_date: detail.from_date || '',
                        to_date: detail.to_date || '',
                        transport_type: transportTypes,
                        transport_no: detail.transport_no,
                        loading_responsible_party: detail.loading_responsible_party || '',
                        downloading_responsible_party: detail.downloading_responsible_party || '',
                        target_location: detail.target_location || '',
                        target_latitude: detail.target_latitude || '',
                        target_longitude: detail.target_longitude || '',
                        source_location: detail.source_location || '',
                        source_latitude: detail.source_latitude || '',
                        source_longitude: detail.source_longitude || ''
                    };
                });
            }
        }
    } catch (e) {
        console.error('Error fetching form data:', e);
    } finally {
        isLoading.value = false;
    }
}

// Interface for product items in the table
interface ProductTableItem {
    item_id: number;
    item_name: string;
    unit_id: number | null;
    unit_name: string;
    quantity: number | null;
    id?: number; // For edit mode
    isAdded?: boolean; // For dialog state
}

interface LogisticsDetail {
    id?: number;
    material_type: number[];
    trip_no: number | null;
    actual_execution_interval: number | null;
    am_pm_interval: string;
    from_date: string;
    to_date: string;
    transport_type: number[];
    transport_no: number | null;
    loading_responsible_party: string;
    downloading_responsible_party: string;
    target_location: string;
    target_latitude: string | number;
    target_longitude: string | number;
    source_location: string;
    source_latitude: string | number;
    source_longitude: string | number;
}

// Form data with static values
const formData = ref({
    requestNumber: '#12520226',
    responsible_person: '',
    responsible_phone: '',
    project_name: '',
    target_location: null as string | null,
    target_latitude: null as string | null,
    target_longitude: null as string | null,
    source_location: null as string | null,
    source_latitude: null as string | null,
    source_longitude: null as string | null,
    issueDate: '',
    request_datetime: '' as string,
    paymentMethod: null,
    advancePayment: null,
    textNote: '',
    image: null,
    voice_attachment: null,
    code: '' as string
});

// Products table items (dynamically populated from dialog)
const productTableItems = ref<ProductTableItem[]>([]);

// Logistics details (array - dynamically populated from dialog)
const logisticsDetails = ref<LogisticsDetail[]>([]);

// Computed: check if logistics details exist
const hasLogisticsDetails = computed(() => logisticsDetails.value.length > 0);

// Summary data
const summaryData = computed(() => ({
    productsCount: productTableItems.value.length,
    logisticsCount: logisticsDetails.value.length,
    paymentMethod: paymentMethodItems.value.find((i: any) => i.value === formData.value.paymentMethod)?.title || '',
    advancePayment: formData.value.advancePayment || 'لا يوجد'
}));



const showAddProductDialog = ref(false);
const editingProduct = ref<ProductTableItem | null>(null);

const handleAddProduct = () => {
    editingProduct.value = null; // Reset edit mode
    showAddProductDialog.value = true;
};

const handleProductSaved = (products: ProductTableItem[]) => {
    productTableItems.value = products;
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
        productTableItems.value[index] = updatedProduct;
    }
    editingProduct.value = null;
};

const handleDeleteProduct = (item: any) => {
    const index = productTableItems.value.findIndex(p => p.item_id === item.item_id);
    if (index !== -1) {
        productTableItems.value.splice(index, 1);
    }
};

const showAddLogisticsDialog = ref(false);
const editingLogisticsDetail = ref<LogisticsDetail | null>(null);
const editingLogisticsIndex = ref<number>(-1);

const handleAddLogisticsDetail = () => {
    editingLogisticsDetail.value = null;
    editingLogisticsIndex.value = -1;
    showAddLogisticsDialog.value = true;
};

const handleLogisticsDetailSaved = (detail: LogisticsDetail) => {
    logisticsDetails.value.push(detail);
};

const handleLogisticsDetailUpdated = (detail: LogisticsDetail) => {
    if (editingLogisticsIndex.value !== -1) {
        logisticsDetails.value[editingLogisticsIndex.value] = detail;
    }
    editingLogisticsDetail.value = null;
    editingLogisticsIndex.value = -1;
};

const handleEditLogisticsDetail = (detail: LogisticsDetail) => {
    const index = logisticsDetails.value.findIndex(d => d === detail);
    if (index !== -1) {
        editingLogisticsDetail.value = { ...detail };
        editingLogisticsIndex.value = index;
        showAddLogisticsDialog.value = true;
    }
};

const handleDeleteLogisticsDetail = (item: any, index: number) => {
    logisticsDetails.value.splice(index, 1);
};

// Helper function to get material type names
const getCategoriesNames = (categories: number[]): string => {
    if (!categories || categories.length === 0) return '';
    return categories.map(categoryId => {
        const item = categoriesItems.value.find((i: any) => i.value === categoryId);
        return item?.title || '';
    }).filter(Boolean).join(', ');
};

// Helper function to get transport type names
const getTransportTypeNames = (transportTypes: number[]): string => {
    if (!transportTypes || transportTypes.length === 0) return '';
    return transportTypes.map(typeId => {
        const item = transportTypeItems.value.find((i: any) => i.value === typeId);
        return item?.title || '';
    }).filter(Boolean).join(', ');
};

// Logistics location dialog handling
const currentLogisticsIndex = ref<number>(-1);
const currentLogisticsLocationType = ref<'source' | 'target'>('source');
const showLogisticsLocationDialog = ref(false);

const openLogisticsLocationDialog = (index: number, type: 'source' | 'target') => {
    currentLogisticsIndex.value = index;
    currentLogisticsLocationType.value = type;
    showLogisticsLocationDialog.value = true;
};

const handleLogisticsLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
    if (currentLogisticsIndex.value !== -1) {
        const detail = logisticsDetails.value[currentLogisticsIndex.value];
        if (currentLogisticsLocationType.value === 'target') {
            detail.target_latitude = location.latitude;
            detail.target_longitude = location.longitude;
            detail.target_location = location.address;
        } else {
            detail.source_latitude = location.latitude;
            detail.source_longitude = location.longitude;
            detail.source_location = location.address;
        }
    }
};

const resetForm = () => {
    // Reset main form data
    formData.value = {
        requestNumber: '#12520226',
        responsible_person: '',
        responsible_phone: '',
        project_name: '',
        target_location: null,
        target_latitude: null,
        target_longitude: null,
        source_location: null,
        source_latitude: null,
        source_longitude: null,
        issueDate: '',
        request_datetime: '',
        paymentMethod: null,
        advancePayment: null,
        textNote: '',
        image: null,
        voice_attachment: null,
        code: ''
    };

    // Clear products and logistics details
    productTableItems.value = [];
    logisticsDetails.value = [];

    // Reset form validation
    if (formRef.value) {
        formRef.value.reset();
        formRef.value.resetValidation();
    }

    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
};


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

const getCurrentDateTimeFormatted = (): string => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

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

    // Add _method: PUT for edit mode
    if (isEditMode.value) {
        fd.append('_method', 'PUT');
    }

    // Basic fields
    fd.append('responsible_person', formData.value.responsible_person || '');
    fd.append('responsible_phone', formData.value.responsible_phone || '');
    fd.append('request_datetime', isEditMode.value ? formatDateTime(formData.value.request_datetime || new Date()) : getCurrentDateTimeFormatted());
    fd.append('project_name', formData.value.project_name || '');
    fd.append('upfront_payment', String(formData.value.advancePayment || ''));
    fd.append('payment_method', formData.value.paymentMethod || '');
    fd.append('target_location', formData.value.target_location || '');
    fd.append('target_latitude', String(formData.value.target_latitude || ''));
    fd.append('target_longitude', String(formData.value.target_longitude || ''));
    fd.append('source_location', formData.value.source_location || '');
    fd.append('source_latitude', String(formData.value.source_latitude || ''));
    fd.append('source_longitude', String(formData.value.source_longitude || ''));
    fd.append('notes', formData.value.textNote || '');

    // Logistics details (array)
    logisticsDetails.value.forEach((detail, index) => {
        if (isEditMode.value && detail.id) {
            fd.append(`logistics_detail[${index}][id]`, String(detail.id));
        }

        // Material types array
        if (detail.material_type && detail.material_type.length > 0) {
            detail.material_type.forEach((type, typeIndex) => {
                fd.append(`logistics_detail[${index}][material_type][${typeIndex}]`, String(type));
            });
        }

        fd.append(`logistics_detail[${index}][trip_no]`, String(detail.trip_no || ''));
        fd.append(`logistics_detail[${index}][actual_execution_interval]`, String(detail.actual_execution_interval || ''));
        fd.append(`logistics_detail[${index}][am_pm_interval]`, detail.am_pm_interval || '');
        fd.append(`logistics_detail[${index}][from_date]`, formatDate(detail.from_date));
        fd.append(`logistics_detail[${index}][to_date]`, formatDate(detail.to_date));

        // Transport types array
        if (detail.transport_type && detail.transport_type.length > 0) {
            detail.transport_type.forEach((type, typeIndex) => {
                fd.append(`logistics_detail[${index}][transport_type][${typeIndex}]`, String(type));
            });
        }

        fd.append(`logistics_detail[${index}][transport_no]`, String(detail.transport_no || ''));
        fd.append(`logistics_detail[${index}][loading_responsible_party]`, detail.loading_responsible_party || '');
        fd.append(`logistics_detail[${index}][downloading_responsible_party]`, detail.downloading_responsible_party || '');
        fd.append(`logistics_detail[${index}][target_location]`, detail.target_location || '');
        fd.append(`logistics_detail[${index}][target_latitude]`, String(detail.target_latitude || ''));
        fd.append(`logistics_detail[${index}][target_longitude]`, String(detail.target_longitude || ''));
        fd.append(`logistics_detail[${index}][source_location]`, detail.source_location || '');
        fd.append(`logistics_detail[${index}][source_latitude]`, String(detail.source_latitude || ''));
        fd.append(`logistics_detail[${index}][source_longitude]`, String(detail.source_longitude || ''));
    });

    // Items (products)
    productTableItems.value.forEach((item, index) => {
        if (isEditMode.value && item.id) {
            fd.append(`items[${index}][id]`, String(item.id));
        }
        fd.append(`items[${index}][item_id]`, String(item.item_id));
        fd.append(`items[${index}][unit_id]`, String(item.unit_id || ''));
        fd.append(`items[${index}][quantity]`, String(item.quantity || ''));
    });

    // File attachments
    if (formData.value.image) {
        fd.append('image', formData.value.image);
    }

    return fd;
}

const handleSubmit = async (type: any) => {
    if (!await validate()) return;

    if (productTableItems.value.length === 0) {
        warning('يجب إضافة منتج واحد على الأقل');
        return;
    }

    if (logisticsDetails.value.length === 0) {
        warning('يجب إضافة خدمة نقل واحدة على الأقل');
        return;
    }

    isSubmitting.value = true;

    try {
        const fd = buildFormData();

        let response;
        if (isEditMode.value && routeId.value) {
            // Edit mode - POST with _method: PUT and UUID in URL
            response = await api.post(`/sales/logistics/${routeId.value}`, fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } else {
            // Create mode - POST request
            response = await api.post('/sales/logistics', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }

        success(isEditMode.value ? 'تم تحديث الطلب بنجاح' : 'تم إنشاء الطلب بنجاح');

        // Navigate back to list or reset form based on type
        if (type === 'return_to_list') {
            router.push({ name: 'SalesRequestsLogisticsList' });
        } else if (type === 'create_new') {
            resetForm();
        }

    } catch (e: any) {
        console.error('Error submitting form:', e);

        apiError(e);
    } finally {
        isSubmitting.value = false;
    }
};

// Main form location handler
const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
    if (currentMapType.value === 'target') {
        formData.value.target_latitude = location.latitude;
        formData.value.target_longitude = location.longitude;
        formData.value.target_location = location.address;
    } else {
        formData.value.source_latitude = location.latitude;
        formData.value.source_longitude = location.longitude;
        formData.value.source_location = location.address;
    }
};

const showMapDialog = ref(false);
const currentMapType = ref<'target' | 'source'>('target');

const openMapDialog = (type: 'target' | 'source' = 'target') => {
    currentMapType.value = type;
    showMapDialog.value = true;
};

const headers = [
    { title: 'اسم المنتج', key: 'name' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'الوحدة', key: 'unit' }
]

// Computed items for the DataTable (mapped from productTableItems)
const tableItems = computed(() => productTableItems.value.map(item => ({
    id: item.item_id,
    item_id: item.item_id,
    name: item.item_name,
    quantity: item.quantity,
    unit: item.unit_name
})));


const handleNewRequest = () => {
    router.push({ name: 'SalesRequestsLogisticsCreate' });
};

onMounted(async () => {
    fetchConstants()
    fetchUnits()
    fetchSuppliers()
    fetchCategories()

    // Fetch form data if in edit mode
    if (isEditMode.value) {
        await fetchFormData();
    }
});
</script>

<template>
    <default-layout>
        <div class="request-material-product-page  -mx-6 bg-qallab-dashboard-bg space-y-4">
            <!-- Page Header -->
            <TopHeader :icon="fileQuestionIcon" title-key="pages.SalesRequestsLogistics.FormTitle"
                description-key="pages.SalesRequestsLogistics.edit" :show-action="false"
                :code="isEditMode ? (formData.code || '') : ''" :code-icon="fileIcon" @action="handleNewRequest" />

            <!-- Request Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span class="w-4" v-html="fileCheckIcon"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <!-- Responsible Person Name -->
                        <div>
                            <TextInput v-model="formData.responsible_person" label="اسم المسؤول"
                                placeholder="أدخل اسم المسؤول" :rules="[required()]" density="comfortable" />
                        </div>

                        <!-- Request Date -->
                        <div>
                            <DatePickerInput v-model="formData.request_datetime" label="تاريخ الطلب"
                                placeholder="2024-03-01" density="comfortable" :disabled="isEditMode" />
                        </div>

                        <!-- Responsible Phone -->
                        <div>
                            <TelInput v-model="formData.responsible_phone" label="هاتف المسؤول"
                                :rules="[required(), saudiPhone()]" density="comfortable" />
                        </div>

                        <!-- Source Material Location -->
                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">موقع مصدر المواد <span
                                    class="text-red-500">*</span></label>
                            <div @click="openMapDialog('source')"
                                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                <span
                                    class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                                    {{ formData.source_location || 'حدد الموقع' }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span v-html="mapMarkerIcon"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Project Location -->
                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">موقع المشروع <span
                                    class="text-red-500">*</span></label>
                            <div @click="openMapDialog('target')"
                                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                <span
                                    class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                                    {{ formData.target_location || 'حدد الموقع' }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span v-html="mapMarkerIcon"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Payment Method -->
                        <div>
                            <SelectInput v-model="formData.paymentMethod" label="طريقة الدفع"
                                :items="paymentMethodItems" item-title="title" placeholder="نقدي" :rules="[required()]"
                                item-value="value" density="comfortable" />
                        </div>

                        <!-- Project Name -->
                        <div>
                            <TextInput v-model="formData.project_name" label="اسم المشروع"
                                placeholder="أدخل اسم المشروع" :rules="[required()]" density="comfortable" />
                        </div>

                        <!-- Advance Payment -->
                        <div>
                            <div class="flex items-center gap-2">
                                <PriceInput showRialIcon v-model="formData.advancePayment" label="دفعة مقدمة"
                                    density="comfortable" class="flex-1" placeholder="أدخل قيمة الدفعة المقدمة" />
                            </div>
                        </div>
                    </div>
                </v-form>
            </div>


            <!-- Logistics Details Section -->
            <div class="mb-8 bg-white rounded-3xl border !border-gray-100">
                <div class="flex flex-wrap gap-3 items-center justify-between px-6 py-3">
                    <div class="flex items-center gap-2 text-primary-600">
                        <span v-html="busIcon"></span>
                        <h2 class="text-base font-bold ">تفاصيل النقل</h2>
                    </div>
                    <ButtonWithIcon color="primary-600" variant="flat" rounded="lg" @click="handleAddLogisticsDetail">
                        أضف خدمة نقل
                    </ButtonWithIcon>
                </div>

                <!-- Logistics Details Cards -->
                <div class="px-6 pb-6 space-y-4">
                    <div v-for="(detail, index) in logisticsDetails" :key="index"
                        class="border !border-gray-200 rounded-3xl p-6">
                        <div class="flex gap-4 items-stretch">
                            <!-- Card Content Grid -->
                            <div class="flex flex-wrap gap-x-2 gap-y-0">
                                <div class="info-item-bordered px-4 py-2">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع المواد
                                        المنقولة</label>
                                    <p class="text-base font-semibold text-gray-900">{{
                                        getCategoriesNames(detail.material_type) }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered  px-4 py-2">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد الرحلات</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.trip_no }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered  px-4 py-2">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">مدة التنفيذ</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.actual_execution_interval
                                        }}
                                    </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered  px-4 py-2">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">أوقات النقل</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.am_pm_interval === 'am' ?
                                        'صباحاً' : detail.am_pm_interval === 'pm' ? 'مساءً' : 'كلاهما' }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered  px-4 py-2">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ بدء
                                        النقل</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.from_date }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered  px-4 py-2">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ انتهاء
                                        النقل</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.to_date }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered  px-4 py-2">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع مركبة
                                        النقل</label>
                                    <p class="text-base font-semibold text-gray-900">{{
                                        getTransportTypeNames(detail.transport_type) }}</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered px-4 py-2">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد مركبات
                                        النقل</label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.transport_no }} مركبة</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered px-4 py-2">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التفريغ
                                    </label>
                                    <p class="text-base font-semibold text-gray-900">{{ detail.loading_responsible_party
                                        }} </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered px-4 py-2">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التحميل
                                    </label>
                                    <p class="text-base font-semibold text-gray-900">{{
                                        detail.downloading_responsible_party }} </p>
                                </div>
                                <v-divider vertical class="my-6" v-if="detail.target_location"></v-divider>
                                <div class="info-item-bordered px-4 py-2" v-if="detail.target_location">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع التسليم
                                    </label>
                                    <p class="text-base font-semibold text-gray-900">{{
                                        detail.target_location }} </p>
                                </div>
                                <v-divider vertical class="my-6" v-if="detail.source_location"></v-divider>
                                <div class="info-item-bordered px-4 py-2" v-if="detail.source_location">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع الإستلام
                                    </label>
                                    <p class="text-base font-semibold text-gray-900">{{
                                        detail.source_location }} </p>
                                </div>
                            </div>

                            <ButtonWithIcon :icon="binIcon" icon-only @click="handleEditLogisticsDetail(detail)"
                                size="x-small" rounded="lg" />
                        </div>

                        <!-- Location Buttons -->
                        <div class="flex justify-end gap-2">
                            <ButtonWithIcon color="primary-800" variant="flat" class="text-white" rounded="lg"
                                :prepend-icon="globeIcon" @click="openLogisticsLocationDialog(index, 'source')">
                                موقع الاستلام
                            </ButtonWithIcon>
                            <ButtonWithIcon color="primary-800" variant="flat" class="text-white" rounded="lg"
                                :prepend-icon="globeIcon" @click="openLogisticsLocationDialog(index, 'target')">
                                موقع التسليم
                            </ButtonWithIcon>

                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="logisticsDetails.length === 0" class="text-center py-12">
                        <p class="text-gray-500 text-lg">لا توجد تفاصيل نقل مضافة</p>
                        <p class="text-gray-400 text-sm mt-2">اضغط على "أضف خدمة نقل" لإضافة تفاصيل جديدة</p>
                    </div>
                </div>
            </div>

            <!-- Products Section -->
            <div class="mb-8 bg-white rounded-3xl border !border-gray-100">
                <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3">
                    <div class="flex items-center gap-2 text-primary-900">
                        <span v-html="packageIcon"></span>
                        <h2 class="text-xl font-bold ">المنتجات</h2>
                    </div>
                    <ButtonWithIcon color="primary-100" variant="flat" :prepend-icon="downloadIcon"
                        class="!text-primary-900 font-bold ">
                        استيراد من ملف إكسل
                    </ButtonWithIcon>
                </div>

                <!-- Products Table -->
                <div class="mb-4">
                    <DataTable :headers="headers" :items="tableItems" show-actions force-show-edit force-show-delete
                        @edit="handleEditProduct" @delete="handleDeleteProduct" />
                </div>

                <!-- Add Product Button -->
                <div class="flex justify-center">
                    <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold w-75 mb-4"
                        @click="handleAddProduct">
                        + إضافة منتج جديد
                    </ButtonWithIcon>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-3 flex items-center justify-center gap-3">
                <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                    <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                        custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                        label="حفظ والعودة للرئيسية" :loading="isSubmitting" @click="handleSubmit('return_to_list')" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        label="حفظ وانشاء جديد" :loading="isSubmitting" @click="handleSubmit('create_new')" />
                </div>
            </div>

        </div>

        <!-- Map Dialog for Main Form -->
        <Map v-model="showMapDialog"
            :latitude="String(currentMapType === 'target' ? (formData.target_latitude || '') : (formData.source_latitude || ''))"
            :longitude="String(currentMapType === 'target' ? (formData.target_longitude || '') : (formData.source_longitude || ''))"
            :address="String(currentMapType === 'target' ? (formData.target_location || '') : (formData.source_location || ''))"
            @location-selected="handleLocationSelected" />

        <!-- Add Product Dialog -->
        <AddProductDialog v-model="showAddProductDialog" :unit-items="unitItems"
            :edit-product="editingProduct" :existing-products="productTableItems" @saved="handleProductSaved"
            @product-updated="handleProductUpdated" />

        <!-- Add Logistics Detail Dialog -->
        <AddLogisticsDetailDialog v-model="showAddLogisticsDialog" :transport-types="transportTypeItems"
            :am-pm-interval-options="amPmIntervalItems" :categories-items="categoriesItems"
            :actual-execution-interval-options="actualExecutionIntervalItems" :edit-detail="editingLogisticsDetail"
            @saved="handleLogisticsDetailSaved" @updated="handleLogisticsDetailUpdated" />

        <!-- Map Dialog for Logistics Locations -->
        <Map v-model="showLogisticsLocationDialog"
            :latitude="String(currentLogisticsIndex !== -1 && logisticsDetails[currentLogisticsIndex] ?
                (currentLogisticsLocationType === 'target' ? (logisticsDetails[currentLogisticsIndex].target_latitude || '') : (logisticsDetails[currentLogisticsIndex].source_latitude || '')) : '')"
            :longitude="String(currentLogisticsIndex !== -1 && logisticsDetails[currentLogisticsIndex] ?
                (currentLogisticsLocationType === 'target' ? (logisticsDetails[currentLogisticsIndex].target_longitude || '') : (logisticsDetails[currentLogisticsIndex].source_longitude || '')) : '')"
            :address="String(currentLogisticsIndex !== -1 && logisticsDetails[currentLogisticsIndex] ?
                (currentLogisticsLocationType === 'target' ? (logisticsDetails[currentLogisticsIndex].target_location || '') : (logisticsDetails[currentLogisticsIndex].source_location || '')) : '')"
            @location-selected="handleLogisticsLocationSelected" />

        <!-- Loading Overlay -->
        <v-overlay :model-value="isLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>

    </default-layout>
</template>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
