<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import { useApi } from '@/composables/useApi';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon_2 } from '@/components/icons/globalIcons';
import { useForm } from '@/composables/useForm';
import { useNotification } from '@/composables/useNotification';
import { required } from '@/utils/validators';

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

// Interface for receipt items
interface ReceiptItem {
    id?: number;
    item_id: number;
    item_name: string;
    base_quantity: number | null;
    quantity_from_supplier: number | null;
    quantity_from_transport: number | null;
    quantity_from_customer: number | null;
}

// Form data
const formData = ref({
    purchase_order_id: null as number | null,
    purchase_order_code: '',
    code: '',
    receiving_date: '',
    created_at: '',
});

// Receipt items table
const receiptItems = ref<ReceiptItem[]>([]);

const headers: Array<{
    key: string;
    title: string;
    align?: "start" | "center" | "end";
    sortable?: boolean;
    width?: string;
}> = [
    { title: 'اسم المنتج', key: 'item_name', width: '200px' },
    { title: 'الكمية الأساسية', key: 'base_quantity', width: '150px' },
    { title: 'الكمية الفعلية من المورد', key: 'quantity_from_supplier', width: '180px' },
    { title: 'الكمية الفعلية من شركة النقل', key: 'quantity_from_transport', width: '180px' },
    { title: 'الكمية الفعلية من العميل', key: 'quantity_from_customer', width: '180px' },
]

// Computed items for the DataTable
const tableItems = computed(() => receiptItems.value.map((item, index) => ({
    id: index,
    item_id: item.item_id,
    item_name: item.item_name,
    base_quantity: item.base_quantity,
    quantity_from_supplier: item.quantity_from_supplier,
    quantity_from_transport: item.quantity_from_transport,
    quantity_from_customer: item.quantity_from_customer,
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
        const res = await api.get<any>(`/purchases/receiving-docs/${routeId.value}`);
        const data = res.data;

        if (data) {
            formData.value.purchase_order_id = data.purchase_order_id || null;
            formData.value.purchase_order_code = data.purchase_order_code || '';
            formData.value.code = data.code || '';
            formData.value.receiving_date = data.receiving_date || '';
            formData.value.created_at = data.created_at || '';

            if (data.items && Array.isArray(data.items)) {
                receiptItems.value = data.items.map((item: any) => ({
                    id: item.id,
                    item_id: item.item_id,
                    item_name: item.item_name || '',
                    base_quantity: item.base_quantity,
                    quantity_from_supplier: item.quantity_from_supplier,
                    quantity_from_transport: item.quantity_from_transport,
                    quantity_from_customer: item.quantity_from_customer,
                }));
            }
        }
    } catch (e) {
        console.error('Error fetching form data:', e);
        error('فشل تحميل بيانات سند الاستلام');
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

    // Add _method: PUT for edit mode
    if (isEditMode.value) {
        fd.append('_method', 'PUT');
    }

    fd.append('purchase_order_id', String(formData.value.purchase_order_id || ''));
    fd.append('receiving_date', formatDate(formData.value.receiving_date));

    // Items
    receiptItems.value.forEach((item, index) => {
        if (isEditMode.value && item.id) {
            fd.append(`items[${index}][id]`, String(item.id));
        }
        fd.append(`items[${index}][item_id]`, String(item.item_id));
        fd.append(`items[${index}][base_quantity]`, String(item.base_quantity || ''));
        fd.append(`items[${index}][quantity_from_supplier]`, String(item.quantity_from_supplier || ''));
        fd.append(`items[${index}][quantity_from_transport]`, String(item.quantity_from_transport || ''));
        fd.append(`items[${index}][quantity_from_customer]`, String(item.quantity_from_customer || ''));
    });

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
const handleSubmitToReceivingDocs = async () => {
    if (!await validateAllForms()) return;

    if (receiptItems.value.length === 0) {
        warning('يجب إضافة عنصر واحد على الأقل');
        return;
    }

    isSubmitting.value = true;

    try {
        const fd = buildFormData();

        if (isEditMode.value) {
            await api.post(`/purchases/receiving-docs/${routeId.value}`, fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } else {
            await api.post('/purchases/receiving-docs', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }

        success(isEditMode.value ? 'تم تحديث سند الاستلام بنجاح' : 'تم إنشاء سند الاستلام بنجاح');
        router.push({ name: 'ReceivingDocsList' });

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
            await api.post(`/purchases/receiving-docs/${routeId.value}`, fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } else {
            await api.post('/purchases/receiving-docs', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }

        success(isEditMode.value ? 'تم تحديث سند الاستلام بنجاح' : 'تم إنشاء سند الاستلام بنجاح');
        router.push({ name: 'OrdersMaterialProductList' });

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
            <!-- Page Header -->
            <TopHeader :icon="fileCheckIcon" title-key="pages.ReceivingDocs.title"
                description-key="pages.ReceivingDocs.description" :show-action="false"
                :code="isEditMode ? formData.code : ''" code-label-key="pages.ReceivingDocs.docCode" />

            <!-- Loading State -->
            <div v-if="isLoading" class="flex justify-center py-10">
                <v-progress-circular indeterminate color="primary" />
            </div>

            <template v-else>
                <!-- Basic Information Section -->
                <div class="p-6 bg-white rounded-3xl border !border-gray-100 ">
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

                            <!-- Receiving Doc Code -->
                            <div>
                                <TextInput v-model="formData.code" placeholder="كود سند الاستلام" label="كود سند الاستلام"
                                    density="comfortable" disabled />
                            </div>

                            <!-- Receiving Date -->
                            <div>
                                <DatePickerInput v-model="formData.receiving_date" type="date" density="comfortable"
                                    placeholder="اختر" label="تاريخ الاستلام" :rules="[required()]" />
                            </div>

                            <!-- Created At (display only) -->
                            <div v-if="isEditMode">
                                <TextInput v-model="formData.created_at" label="تاريخ الإنشاء"
                                    density="comfortable" disabled />
                            </div>
                        </div>
                    </v-form>
                </div>

                <!-- Receipt Items Table Section -->
                <div class="bg-white rounded-3xl border !border-gray-100">
                    <div class="px-6 py-6">
                        <div class="flex items-center gap-2 text-primary-600">
                            <span class="w-5" v-html="fileCheckIcon"></span>
                            <h2 class="text-base font-bold">جدول عناصر سند الاستلام</h2>
                        </div>
                    </div>

                    <v-form ref="tableFormRef" @submit.prevent>
                        <DataTable :headers="headers" :items="tableItems" :showActions="false">
                            <!-- Item Name -->
                            <template #item.item_name="{ item }">
                                <div class="font-medium text-gray-900">
                                    {{ item.item_name }}
                                </div>
                            </template>

                            <!-- Base Quantity - Input -->
                            <template #item.base_quantity="{ item }">
                                <PriceInput
                                    v-model="receiptItems[getItemIndex(item)].base_quantity"
                                    placeholder="الكمية الأساسية" density="comfortable"
                                    class="w-32" :input-props="{ class: '!text-center' }"
                                    :rules="[required()]" />
                            </template>

                            <!-- Quantity from Supplier -->
                            <template #item.quantity_from_supplier="{ item }">
                                <PriceInput
                                    v-model="receiptItems[getItemIndex(item)].quantity_from_supplier"
                                    placeholder="من المورد" density="comfortable" disabled
                                    class="w-32" :input-props="{ class: '!text-center' }"
                                    :rules="[required()]" />
                            </template>

                            <!-- Quantity from Transport -->
                            <template #item.quantity_from_transport="{ item }">
                                <PriceInput
                                    v-model="receiptItems[getItemIndex(item)].quantity_from_transport"
                                    placeholder="من شركة النقل" density="comfortable" disabled
                                    class="w-32" :input-props="{ class: '!text-center' }"
                                    :rules="[required()]" />
                            </template>

                            <!-- Quantity from Customer -->
                            <template #item.quantity_from_customer="{ item }">
                                <PriceInput
                                    v-model="receiptItems[getItemIndex(item)].quantity_from_customer"
                                    placeholder="من العميل" density="comfortable"
                                    class="w-32" :input-props="{ class: '!text-center' }"
                                    :rules="[required()]" />
                            </template>
                        </DataTable>
                    </v-form>
                </div>

                <!-- Action Buttons -->
                <div class="mt-3 flex items-center justify-center gap-3">
                    <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                        <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                            custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                            label="حفظ والعودة لقائمة سندات الاستلام" :loading="isSubmitting" @click="handleSubmitToReceivingDocs" />

                        <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                            custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                            label="حفظ والعودة لقائمة المشتريات" :loading="isSubmitting" @click="handleSubmitToOrdersList" />
                    </div>
                </div>
            </template>

        </div>
    </default-layout>
</template>

<style scoped></style>
