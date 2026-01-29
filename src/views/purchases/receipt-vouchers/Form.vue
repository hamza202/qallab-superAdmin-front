<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import { useApi } from '@/composables/useApi';
import { fileIcon } from '@/components/icons/priceOffersIcons';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon_2 } from '@/components/icons/globalIcons';
import { useForm } from '@/composables/useForm';
import { useNotification } from '@/composables/useNotification';
import { required } from '@/utils/validators';

const { t } = useI18n()
const api = useApi();
const route = useRoute();
const router = useRouter();
const { formRef, isFormValid, validate } = useForm();
const { success, error, warning } = useNotification();

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const isLoading = ref(false);
const isSubmitting = ref(false);

// Interface for receipt items
interface ReceiptItem {
    id?: number;
    item_name: string;
    base_quantity: number;
    actual_quantity: number;
    unit: string;
}

// Form data
const formData = ref({
    purchase_order_code: '#124098',
    voucher_code: '#124098',
    voucher_date: '',
    receipt_date: '',
    status: 'كاملة',
});

// Receipt items table
const receiptItems = ref<ReceiptItem[]>([
    {
        item_name: 'اسمنت',
        base_quantity: 100,
        actual_quantity: 150,
        unit: 'طن'
    },
    {
        item_name: 'سيراميك',
        base_quantity: 43,
        actual_quantity: 150,
        unit: 'طن'
    },
    {
        item_name: 'رمل عادي',
        base_quantity: 56,
        actual_quantity: 150,
        unit: 'طن'
    }
]);

const headers: Array<{
    key: string;
    title: string;
    align?: "start" | "center" | "end";
    sortable?: boolean;
    width?: string;
}> = [
    { title: 'اسم المنتج', key: 'item_name', width: '550px' },
    { title: 'الكمية الأساسية', key: 'base_quantity', align: 'center' },
    { title: 'الكمية الفعلية', key: 'actual_quantity' },
]

// Computed items for the DataTable
const tableItems = computed(() => receiptItems.value.map((item, index) => ({
    id: index,
    item_name: item.item_name,
    base_quantity: item.base_quantity + ' ' + item.unit,
    actual_quantity: item.actual_quantity,
})));

// Fetch form data for edit mode
const fetchFormData = async () => {
    if (!isEditMode.value || !routeId.value) return;

    isLoading.value = true;
    try {
        const res = await api.get<any>(`/purchases/receipt-vouchers/${routeId.value}`);
        const data = res.data;

        if (data) {
            formData.value.purchase_order_code = data.purchase_order_code || '';
            formData.value.voucher_code = data.voucher_code || '';
            formData.value.voucher_date = data.voucher_date || '';
            formData.value.receipt_date = data.receipt_date || '';
            formData.value.status = data.status || '';

            if (data.items && Array.isArray(data.items)) {
                receiptItems.value = data.items;
            }
        }
    } catch (e) {
        console.error('Error fetching form data:', e);
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
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

// Build FormData for submission
const buildFormData = (): FormData => {
    const fd = new FormData();

    fd.append('purchase_order_code', formData.value.purchase_order_code);
    fd.append('voucher_code', formData.value.voucher_code);
    fd.append('voucher_date', formatDate(formData.value.voucher_date));
    fd.append('receipt_date', formatDate(formData.value.receipt_date));
    fd.append('status', formData.value.status);

    // Items
    receiptItems.value.forEach((item, index) => {
        if (isEditMode.value && item.id) {
            fd.append(`items[${index}][id]`, String(item.id));
        }
        fd.append(`items[${index}][item_name]`, item.item_name);
        fd.append(`items[${index}][base_quantity]`, String(item.base_quantity));
        fd.append(`items[${index}][actual_quantity]`, String(item.actual_quantity));
        fd.append(`items[${index}][unit]`, item.unit);
    });

    return fd;
}

const handleSubmit = async () => {
    if (!await validate()) return;

    if (receiptItems.value.length === 0) {
        warning('يجب إضافة عنصر واحد على الأقل');
        return;
    }

    isSubmitting.value = true;

    try {
        const fd = buildFormData();

        let response;
        if (isEditMode.value) {
            response = await api.post(`/purchases/receipt-vouchers/${routeId.value}`, fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } else {
            response = await api.post('/purchases/receipt-vouchers', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }

        success(isEditMode.value ? 'تم تحديث السند بنجاح' : 'تم إنشاء السند بنجاح');
        router.push({ name: 'ReceiptVouchersList' });

    } catch (e: any) {
        console.error('Error submitting form:', e);
        error(e?.response?.data?.message || 'حدث خطأ أثناء حفظ السند');
    } finally {
        isSubmitting.value = false;
    }
};

const handleSaveAndNew = async () => {
    if (!await validate()) return;

    if (receiptItems.value.length === 0) {
        warning('يجب إضافة عنصر واحد على الأقل');
        return;
    }

    isSubmitting.value = true;

    try {
        const fd = buildFormData();

        await api.post('/purchases/receipt-vouchers', fd, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        success('تم إنشاء السند بنجاح');

        // Reset form
        formData.value = {
            purchase_order_code: '#124098',
            voucher_code: '#124098',
            voucher_date: '',
            receipt_date: '',
            status: 'كاملة',
        };
        receiptItems.value = [];

    } catch (e: any) {
        console.error('Error submitting form:', e);
        error(e?.response?.data?.message || 'حدث خطأ أثناء حفظ السند');
    } finally {
        isSubmitting.value = false;
    }
};

</script>

<template>
    <default-layout>
        <div class="receipt-voucher-page -mx-6 bg-qallab-dashboard-bg space-y-4">
            <!-- Page Header -->
            <TopHeader :icon="fileCheckIcon" title-key="pages.ReceiptVouchers.FormTitle"
                description-key="pages.ReceiptVouchers.FormDescription" :show-action="false" />

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
                            <TextInput v-model="formData.purchase_order_code" placeholder="#124098"
                                label="كود طلبية المشتريات" :rules="[required()]" density="comfortable" disabled />
                        </div>

                        <!-- Voucher Code -->
                        <div>
                            <TextInput v-model="formData.voucher_code" placeholder="#124098" label="كود سند الاستلام"
                                :rules="[required()]" density="comfortable" disabled />
                        </div>

                        <!-- Voucher Date -->
                        <div>
                            <DatePickerInput v-model="formData.voucher_date" type="date" density="comfortable"
                                placeholder="اختر" label="تاريخ إنشاء سند الاستلام" :rules="[required()]" />
                        </div>

                        <!-- Receipt Date -->
                        <div>
                            <DatePickerInput v-model="formData.receipt_date" type="date" density="comfortable"
                                placeholder="اختر" label="تاريخ الاستلام" :rules="[required()]" />
                        </div>

                        <!-- Status -->
                        <div>
                            <SelectInput v-model="formData.status" :items="['كاملة', 'جزئية']" label="حالة الاستلام"
                                :rules="[required()]" density="comfortable" placeholder="اختر" />
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

                <DataTable :headers="headers" :items="tableItems" :showActions="false">
                    <template #item.base_quantity="{ item }">
                        <div
                            class=" bg-gray-200 h-[40px] min-w-32 font-semibold text-base flex items-center justify-center border border-gray-300 rounded-md ">
                            {{ item.base_quantity }}
                        </div>
                    </template>
                    <template #item.actual_quantity="{ item }">
                        <TextInput
                            v-model="receiptItems[receiptItems.findIndex(r => r.item_name === item.item_name)].actual_quantity"
                            placeholder="أدخل الكمية" variant="outlined" density="comfortable" hide-details
                            type="number" class="w-52" :input-props="{ class: '!text-center' }" />
                    </template>
                </DataTable>
            </div>

            <!-- Action Buttons -->
            <div class="mt-3 flex items-center justify-center gap-3">
                <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                    <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                        custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                        label="حفظ والعودة لقائمة سندات الاستلام" :loading="isSubmitting" @click="handleSubmit" />

                    <ButtonWithIcon v-if="!isEditMode" variant="flat" color="primary-50" height="48" rounded="4"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        label="حفظ والعودة لقائمة المشتريات" :loading="isSubmitting" @click="handleSaveAndNew" />
                </div>
            </div>

        </div>
    </default-layout>
</template>

<style scoped></style>
