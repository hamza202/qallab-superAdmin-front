<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from "vue";
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import AppFormBreadcrumb from '@/components/common/AppFormBreadcrumb.vue';
import { useApi } from '@/composables/useApi';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon_2, globeIcon } from '@/components/icons/globalIcons';
import { useForm } from '@/composables/useForm';
import { useNotification } from '@/composables/useNotification';
import { required } from '@/utils/validators';
import DocumentUploadInput from '@/components/common/forms/DocumentUploadInput.vue';

const { t } = useI18n()
const api = useApi();
const route = useRoute();
const router = useRouter();
const { formRef, isFormValid, validate, scrollToFirstError } = useForm();
const { success, error, warning, apiError } = useNotification();

// Table form ref for validation
const tableFormRef = ref<any>(null);

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const isLoading = ref(false);
const isSubmitting = ref(false);

// Interface for vehicle type
interface VehicleType {
    transport_type: string;
    transport_type_label: string;
    transport_no: string;
}

// Interface for receipt items
interface ReceiptItem {
    id?: number;
    item_id: number;
    item_name: string;
    base_quantity: number | null;
    received_quantity: number | null;
    vehicle_type_no_from_transport_label: VehicleType[];
    vehicle_type_no_from_customer_label: VehicleType[];
}

// Form data
const formData = ref({
    purchase_order_id: null as number | null,
    purchase_order_code: '',
    code: '',
    receiving_date: '',
    created_at: '',
    target_location: '',
    source_location: '',
});

const attachments = ref<(File | string)[]>([]);

// Receipt items table
const receiptItems = ref<ReceiptItem[]>([]);

const headers: Array<{
    key: string;
    title: string;
    align?: "start" | "center" | "end";
    sortable?: boolean;
    width?: string;
}> = [
        { title: 'اسم المنتج', key: 'item_name', width: '200px', align: 'center' },
        { title: 'الكمية الأساسية', key: 'base_quantity', width: '150px', align: 'center' },
        { title: 'الكمية المستلمة', key: 'received_quantity', width: '180px', align: 'center' },
        { title: 'المركبات الناقلة المرسلة', key: 'vehicle_type_no_from_transport_label', width: '400px', align: 'center' },
        { title: 'المركبات الناقلة المستلمة', key: 'vehicle_type_no_from_customer_label', width: '400px', align: 'center' },
    ]

// Computed items for the DataTable
const tableItems = computed(() => receiptItems.value.map((item, index) => ({
    id: index,
    item_id: item.item_id,
    item_name: item.item_name,
    base_quantity: item.base_quantity,
    received_quantity: item.received_quantity,
    vehicle_type_no_from_transport_label: item.vehicle_type_no_from_transport_label,
    vehicle_type_no_from_customer_label: item.vehicle_type_no_from_customer_label,
})));

// Helper to get item index
const getItemIndex = (item: { id: string | number }): number => {
    return Number(item.id);
};

// Fetch form data for edit mode
const fetchFormData = async () => {
    if (!isEditMode.value || !routeId.value) return;

    isLoading.value = true;
    try {
        const res = await api.get<any>(`/sales/logistics/delivery-docs/${routeId.value}`);
        const data = res.data;

        if (data) {
            formData.value.purchase_order_id = data.purchase_order_id || null;
            formData.value.purchase_order_code = data.purchase_order_code || '';
            formData.value.code = data.code || '';
            formData.value.receiving_date = data.receiving_date || '';
            formData.value.created_at = data.created_at || '';
            formData.value.target_location = data.target_location || '';
            formData.value.source_location = data.source_location || '';

            if (data.logistic_items && Array.isArray(data.logistic_items)) {
                receiptItems.value = data.logistic_items.map((item: any) => ({
                    id: item.id,
                    item_id: item.item_id,
                    item_name: item.item_name || '',
                    base_quantity: item.base_quantity,
                    received_quantity: item.received_quantity,
                    vehicle_type_no_from_transport_label: item.vehicle_type_no_from_transport_label || [],
                    vehicle_type_no_from_customer_label: item.vehicle_type_no_from_customer_label || [],
                }));
            }
            if (data.attachment_file && Array.isArray(data.attachment_file)) {
                attachments.value = [...data.attachment_file];
            }
        }
    } catch (e) {
        console.error('Error fetching form data:', e);
        error('فشل تحميل بيانات سند التسليم');
    } finally {
        isLoading.value = false;
    }
}

onMounted(async () => {
    if (isEditMode.value) {
        await fetchFormData();
    }
});

// Format date to DD-MM-YYYY
const formatDate = (date: string | Date): string => {
    if (!date) return '';
    // If already in DD-MM-YYYY format, return as is
    if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
        return date;
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

// Build FormData for submission
const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append('_method', 'PUT');
    fd.append('purchase_order_id', String(formData.value.purchase_order_id || ''));
    fd.append('receiving_date', formatDate(formData.value.receiving_date));

    // Items
    receiptItems.value.forEach((item, index) => {
        if (isEditMode.value && item.id) {
            fd.append(`logistic_items[${index}][id]`, String(item.id));
        }
        fd.append(`logistic_items[${index}][item_id]`, String(item.item_id));
        fd.append(`logistic_items[${index}][base_quantity]`, String(item.base_quantity || ''));
        fd.append(`logistic_items[${index}][received_quantity]`, String(item.received_quantity || ''));

        // Vehicle type from transport
        if (item.vehicle_type_no_from_transport_label && item.vehicle_type_no_from_transport_label.length > 0) {
            item.vehicle_type_no_from_transport_label.forEach((vehicle, vIndex) => {
                fd.append(`logistic_items[${index}][vehicle_type_no_from_transport][${vIndex}][transport_type]`, vehicle.transport_type);
                fd.append(`logistic_items[${index}][vehicle_type_no_from_transport][${vIndex}][transport_no]`, vehicle.transport_no);
            });
        }

        // Vehicle type from customer
        if (item.vehicle_type_no_from_customer_label && item.vehicle_type_no_from_customer_label.length > 0) {
            item.vehicle_type_no_from_customer_label.forEach((vehicle, vIndex) => {
                fd.append(`logistic_items[${index}][vehicle_type_no_from_customer][${vIndex}][transport_type]`, vehicle.transport_type);
                fd.append(`logistic_items[${index}][vehicle_type_no_from_customer][${vIndex}][transport_no]`, vehicle.transport_no);
            });
        }
    });

    // Attachments
    if (attachments.value && attachments.value.length > 0) {
        attachments.value.forEach((fileProxy, index) => {
            const rawFile = toRaw(fileProxy);
            if (typeof rawFile === 'string') {
                fd.append(`attachment_file[${index}]`, rawFile);
            } else {
                fd.append(`attachment_file[${index}]`, rawFile);
            }
        });
    }

    return fd;
}

// Validate all forms (basic info + table items)
const validateAllForms = async (): Promise<boolean> => {
    // Validate basic info form
    const basicFormValid = await validate();

    // Validate table form
    let tableFormValid = true;
    if (tableFormRef.value) {
        const result = await tableFormRef.value.validate();
        tableFormValid = result.valid;
    }

    // If any validation fails, scroll to first error
    if (!basicFormValid || !tableFormValid) {
        await scrollToFirstError();
        return false;
    }

    return true;
};

// Submit and navigate to receiving docs list
const handleSubmitToDeliveryDocs = async () => {
    if (!await validateAllForms()) return;

    if (receiptItems.value.length === 0) {
        warning('يجب إضافة عنصر واحد على الأقل');
        return;
    }

    isSubmitting.value = true;

    try {
        const fd = buildFormData();

        if (isEditMode.value) {
            await api.post(`/sales/logistics/delivery-docs/${routeId.value}`, fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } else {
            await api.post('/sales/logistics/delivery-docs', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }

        success(isEditMode.value ? 'تم تحديث سند التسليم بنجاح' : 'تم إنشاء سند التسليم بنجاح');
        router.push({ name: 'DeliveryDocsLogisticsList' });

    } catch (e: any) {
        console.error('Error submitting form:', e);
        apiError(e);
    } finally {
        isSubmitting.value = false;
    }
};

// Submit and navigate to orders list
const handleSubmitToOrdersList = async () => {
    if (!await validateAllForms()) return;

    if (receiptItems.value.length === 0) {
        warning('يجب إضافة عنصر واحد على الأقل');
        return;
    }

    isSubmitting.value = true;

    try {
        const fd = buildFormData();

        if (isEditMode.value) {
            await api.post(`/sales/logistics/delivery-docs/${routeId.value}`, fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } else {
            await api.post('/sales/logistics/delivery-docs', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }

        success(isEditMode.value ? 'تم تحديث سند التسليم بنجاح' : 'تم إنشاء سند التسليم بنجاح');
        router.push({ name: 'SalesOrdersMaterialProductList' });

    } catch (e: any) {
        console.error('Error submitting form:', e);
        apiError(e);
    } finally {
        isSubmitting.value = false;
    }
};

</script>

<template>
    <default-layout>
        <div class="receiving-docs-page -mx-6 bg-qallab-dashboard-bg space-y-4">
            <AppFormBreadcrumb
                list-path="/sales/delivery-docs-logistics/list"
                module-root-key="breadcrumb.sales.root"
                list-label-key="breadcrumb.sales.deliveryDocs.logistics.list"
                create-label-key="breadcrumb.sales.deliveryDocs.logistics.create"
                edit-label-key="breadcrumb.sales.deliveryDocs.logistics.edit"
                :is-edit-mode="isEditMode"
                :code="isEditMode ? formData.code : ''"
            />
            <!-- Page Header -->
            <TopHeader :icon="fileCheckIcon" title-key="pages.DeliveryDocsLogistics.title"
                :description-key="isEditMode ? 'pages.DeliveryDocsLogistics.edit' : 'pages.DeliveryDocsLogistics.create'"
                :show-action="false" :code="isEditMode ? formData.code : ''" />

            <!-- Loading State -->
            <div v-if="isLoading" class="flex justify-center py-10">
                <v-progress-circular indeterminate color="primary" />
            </div>

            <template v-else>
                <!-- Basic Information Section -->
                <div class="p-6 bg-white rounded-3xl border !border-gray-100">
                    <div class="flex items-center mb-6 gap-2 text-primary-600">
                        <span class="w-4" v-html="fileIcon_2"></span>
                        <h2 class="text-base font-bold">البيانات الأساسية</h2>
                    </div>

                    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <!-- Purchase Order Code -->
                            <div>
                                <TextInput v-model="formData.purchase_order_code" placeholder="كود طلبية المشتريات"
                                    label="كود طلبية المشتريات" density="comfortable" disabled />
                            </div>

                            <!-- Delivery Doc Code -->
                            <div>
                                <TextInput v-model="formData.code" placeholder="كود سند التسليم" label="كود سند التسليم"
                                    density="comfortable" disabled />
                            </div>

                            <!-- Delivery Date -->
                            <div>
                                <DatePickerInput v-model="formData.receiving_date" type="date" density="comfortable"
                                    placeholder="اختر" label="تاريخ التسليم" :rules="[required()]" />
                            </div>

                            <!-- Created At (display only) -->
                            <div v-if="isEditMode">
                                <TextInput v-model="formData.created_at" label="تاريخ الإنشاء" density="comfortable"
                                    disabled />
                            </div>
                        </div>
                        <!-- Attachments Row -->
                        <div class="mt-6">
                            <h3 class="text-sm font-semibold text-gray-700 mb-3 tracking-wide">المرفقات</h3>
                            <DocumentUploadInput v-model="attachments" hint="PNG, JPG , PDF, XLS" :max-files="5"
                                :multiple="true" />
                        </div>
                    </v-form>
                </div>

                <div class="p-6 bg-white rounded-3xl border !border-gray-100 ">
                    <div class="flex items-center gap-2 text-primary-600 mb-2">
                        <span v-html="globeIcon"></span>
                        <h2 class="text-base font-bold">موقع التسليم والإستلام</h2>
                    </div>
                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                            <label class="font-semibold text-sm  text-gray-900 mb-2 block">موقع التسليم</label>
                            <p class="text-base font-semibold text-gray-500">{{ formData.target_location || '--' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4 md:max-w-[400px]">
                            <label class="font-semibold text-sm  text-gray-900 mb-2 block">موقع الإستلام</label>
                            <p class="text-base font-semibold text-gray-500 ">{{ formData.source_location || '--' }}</p>
                        </div>
                    </div>

                </div>


                <!-- Receipt Items Table Section -->
                <div class="bg-white rounded-3xl border !border-gray-100">
                    <div class="px-6 py-6">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span class="w-5" v-html="fileCheckIcon"></span>
                            <h2 class="text-base font-bold">جدول عناصر سند التسليم</h2>
                        </div>
                    </div>

                    <v-form ref="tableFormRef" @submit.prevent>
                        <DataTable :headers="headers" :items="tableItems" :showActions="false">
                            <!-- Item Name -->
                            <template #item.item_name="{ item }">
                                <div class="font-medium text-center text-gray-900">
                                    {{ item.item_name }}
                                </div>
                            </template>

                            <!-- Base Quantity - Input -->
                            <template #item.base_quantity="{ item }">
                                <PriceInput v-model="receiptItems[getItemIndex(item)].base_quantity" disabled
                                    placeholder="الكمية الأساسية" density="comfortable" class="w-32 text-center"
                                    :input-props="{ class: 'text-center' }" :rules="[required()]" />
                            </template>

                            <!-- Received Quantity -->
                            <template #item.received_quantity="{ item }">
                                <PriceInput v-model="receiptItems[getItemIndex(item)].received_quantity"
                                    placeholder="الكمية المستلمة" density="comfortable" class="w-32 text-center"
                                    :input-props="{ class: 'text-center' }" :rules="[required()]" />
                            </template>

                            <!-- المركبات الناقلة المرسلة (Sent Transport Vehicles) -->
                            <template #item.vehicle_type_no_from_transport_label="{ item }">
                                <div class="grid grid-cols-2 gap-2 md:min-w-[300px]">
                                    <div v-for="(vehicle, vIndex) in receiptItems[getItemIndex(item)].vehicle_type_no_from_transport_label"
                                        :key="`transport-${vIndex}`"
                                        class="border border-gray-200 rounded-lg overflow-hidden grid grid-cols-5 items-center">
                                        <div
                                            class="bg-gray-100 px-2 py-2 h-100 flex items-center justify-center col-span-2">
                                            <span class="text-xs font-medium text-gray-900">{{
                                                vehicle.transport_type_label }}</span>
                                        </div>
                                        <div class="bg-white col-span-3 h-full flex items-center">
                                            <PriceInput v-model="vehicle.transport_no" placeholder="أدخل"
                                                density="comfortable" variant="solo" hide-details class="text-center"
                                                :input-props="{ class: 'text-center shadow-none' }" />
                                        </div>
                                    </div>
                                </div>
                            </template>

                            <!-- المركبات الناقلة المستلمة (Received Transport Vehicles) -->
                            <template #item.vehicle_type_no_from_customer_label="{ item }">
                                <div class="grid grid-cols-2 gap-2 md:min-w-[300px]">
                                    <div v-for="(vehicle, vIndex) in receiptItems[getItemIndex(item)].vehicle_type_no_from_customer_label"
                                        :key="`customer-${vIndex}`"
                                        class="border border-gray-200 rounded-lg overflow-hidden grid grid-cols-5 items-center">
                                        <div
                                            class="bg-gray-100 px-2 py-2 h-100 flex items-center justify-center col-span-2">
                                            <span class="text-xs font-medium text-gray-900">{{
                                                vehicle.transport_type_label }}</span>
                                        </div>
                                        <div class="bg-white col-span-3 h-full flex items-center">
                                            <PriceInput v-model="vehicle.transport_no" placeholder="أدخل"
                                                density="comfortable" variant="solo" hide-details class="text-center"
                                                :input-props="{ class: 'text-center shadow-none' }" />
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </DataTable>
                    </v-form>
                </div>

                <!-- Action Buttons -->
                <div class="mt-3 flex items-center justify-center gap-3">
                    <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                        <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                            custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                            label="حفظ والعودة لقائمة سندات التسليم" :loading="isSubmitting"
                            @click="handleSubmitToDeliveryDocs" />

                        <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                            custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10"
                            :prepend-icon="saveIcon" label="حفظ والعودة لقائمة طلبيات المبيعات" :loading="isSubmitting"
                            @click="handleSubmitToOrdersList" />
                    </div>
                </div>
            </template>

        </div>
    </default-layout>
</template>

<style scoped></style>
