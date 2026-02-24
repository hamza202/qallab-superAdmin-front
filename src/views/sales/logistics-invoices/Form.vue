<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, reactive } from "vue";
import { useRoute, useRouter } from 'vue-router';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import { useApi } from '@/composables/useApi';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon_2 } from '@/components/icons/globalIcons';
import { useForm } from '@/composables/useForm';
import { useNotification as useNotify } from '@/composables/useNotification';

const { formRef, isFormValid, validate } = useForm();
const { success, warning, apiError } = useNotify();

const api = useApi();
const route = useRoute();
const router = useRouter();

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const isLoading = ref(false);
const pageLoading = ref(false);
const isSubmitting = ref(false);

const ordersItems = ref<any[]>([]);
const customerItems = ref<any[]>([]);
const InvoiceCode = ref('')
const customerData = ref<any>(null);
const customerName = computed(() => customerData.value?.full_name || customerData.value?.name || '—');
const customerCommercialRegister = computed(() => customerData.value?.commercial_register || '—');
const customerAddress = computed(() => customerData.value?.address || {});
const unitItems = ref<any[]>([]);
const discountTypeItems = ref<any[]>([]);
const summaryData = ref<any>(null);
const isPopulatingForm = ref(false);
const skipNextSaleOrderItemsFetch = ref(false);
const formErrors = reactive<Record<string, string>>({});

const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    const container = document.querySelector('.main-scroll');
    if (container instanceof HTMLElement) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const clearFieldError = (field: string) => {
    if (formErrors[field]) {
        delete formErrors[field];
    }
};

// Interface for product items in the table
interface ProductTableItem {
    id?: number; // For edit mode
    trip_id?: number | string;
    trip_code?: string;
    date?: string;
    loading_location?: string;
    unloading_location?: string;
    quantity?: number | null;
    price?: number | null;
    discount?: number | null;
    taxable_amount?: number | null;
    tax_amount?: number | null;
    total_amount?: number | null;
    isAdded?: boolean; // For dialog state
}

// Form data with static values
const getDefaultFormData = () => ({
    customer_id: null as number | string | null,
    sale_order_id: null,
    invoice_issues_datetime: null as string | null,
    invoice_due_datetime: null as string | null,
    invoice_creation_date: null as string | null,
    project_name: null as string | null,
    notes: null as string | null,
});

const formData = ref(getDefaultFormData());

// Products table items (dynamically populated from dialog)
const productTableItems = ref<ProductTableItem[]>([]);


const fetchTripsBySaleOrder = async (saleOrderId: number | string | null) => {
    if (!saleOrderId) {
        productTableItems.value = [];
        return;
    }

    try {
        const res = await api.get<any>('/sales/trips/by-sale-order', {
            params: {
                so_reference: saleOrderId,
            },
        });

        const trips = Array.isArray(res.data) ? res.data : res.data?.data || [];
        
        if (trips.length <= 0) {
            warning('لا توجد رحلات لهذه الطلبية لإتمام الفاتورة')
        }
        
        productTableItems.value = trips.map((trip: any) => ({
            id: trip.id,
            trip_id: trip.id,
            trip_code: trip.code || '-',
            date: trip.date || trip.created_at || '-',
            loading_location: trip.loading_location_name || trip.pickup_location?.name || trip.loading_location?.name || '-',
            unloading_location: trip.unloading_location_name || trip.dropoff_location?.name || trip.unloading_location?.name || '-',
            quantity: trip.quantity_from_customer ?? trip.quantity ?? 1,
            price: trip.trip_price ?? trip.price ?? trip.price_per_unit ?? 0,
            discount: trip.discount_val ?? trip.discount ?? 0,
            taxable_amount: trip.taxable_amount ?? trip.total_applied_taxes ?? 0,
            tax_amount: trip.total_tax ?? trip.tax_amount ?? 0,
            total_amount: trip.total_out_taxes ?? trip.final_total ?? trip.total_amount ?? 0,
        }));

        summaryData.value = {
            total_quantity: productTableItems.value.reduce((sum, trip) => sum + Number(trip.quantity || 0), 0),
            total_discount: productTableItems.value.reduce((sum, trip) => sum + Number(trip.discount || 0), 0),
            total_applied_taxes: productTableItems.value.reduce((sum, trip) => sum + Number(trip.taxable_amount || 0), 0),
            total_taxes: productTableItems.value.reduce((sum, trip) => sum + Number(trip.tax_amount || 0), 0),
            final_total: productTableItems.value.reduce((sum, trip) => sum + Number(trip.total_amount || 0), 0),
            total_out_taxes: productTableItems.value.reduce((sum, trip) => sum + Number(trip.total_amount || 0), 0),
        };
        
    } catch (e) {
        console.error('Error fetching trips:', e);
    }
};

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/sales/invoices/logistics/constants');
        const data = res.data;

        if (data.discount_types?.length) discountTypeItems.value = data.discount_types.map((i: any) => ({ title: i.label, value: i.key }));

    } catch (e) {
        console.error('Error fetching constants:', e);
    }
};

const fetchCustomers = async () => {
    try {
        const res = await api.get<any>('/customers/list');
        if (Array.isArray(res.data)) {
            customerItems.value = res.data.map((i: any) => ({
                title: i.full_name,
                value: i.id,
            }));
        }
    } catch (e) {
        console.error('Error fetching customers:', e);
    }
};

const fetchUnits = async () => {
    try {
        const res = await api.get<any>("/units/list");
        if (Array.isArray(res.data)) {
            unitItems.value = res.data.map((i: any) => ({
                title: i.name,
                value: i.id,
            }));
        }
    } catch (e) {
        console.error("Error fetching units:", e);
    }
};

const fetchOrdersByCustomer = async (
    customerId: number | string | null
) => {
    if (!customerId) {
        ordersItems.value = [];
        return;
    }

    try {
        const params: Record<string, string | number> = { category: 'logistics', customer_id: customerId };
        const res = await api.get<any>('/sales/orders/list', {
            params,
        });

        const rawData = Array.isArray(res.data) ? res.data : res.data?.data;
        const list = Array.isArray(rawData) ? rawData : [];
        ordersItems.value = list.map((order: any) => ({
            title: order.code || `طلب #${order.id ?? order.uuid ?? ''}`,
            value: order.id ?? order.uuid ?? order.code,
        }));
    } catch (e) {
        console.error('Error fetching orders list:', e);
        ordersItems.value = [];
    }
};

const fetchCustomerDetails = async (customerId: number | string | null) => {
    if (!customerId) {
        customerData.value = null;
        return;
    }

    try {
        const res = await api.get<any>(`/customers/${customerId}`);
        customerData.value = res.data || null;
    } catch (e) {
        console.error('Error fetching customer details:', e);
        customerData.value = null;
    }
};

const formatDateTimeDmy = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const normalizePoDateTime = (value: string): string => {
    if (!value) return "";
    const trimmed = value.trim();
    if (/^\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
        return trimmed;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const [datePart, timePart] = trimmed.split(" ");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hours, minutes, seconds] = (timePart || "00:00:00")
            .split(":")
            .map(Number);
        if (year && month && day) {
            const d = new Date(
                year,
                month - 1,
                day,
                hours || 0,
                minutes || 0,
                seconds || 0,
            );
            return formatDateTimeDmy(d);
        }
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
        return formatDateTimeDmy(parsed);
    }
    return trimmed;
};

// Fetch form data for edit mode
const fetchFormData = async () => {
    if (!isEditMode.value || !routeId.value) return;

    isLoading.value = true;
    isPopulatingForm.value = true;
    try {
        const res = await api.get<any>(`/sales/invoices/logistics/${routeId.value}`);
        const data = res.data;

        if (data) {
            // Populate form data
            formData.value.customer_id = data.customer_id;
            formData.value.sale_order_id = data.sale_order_id;
            skipNextSaleOrderItemsFetch.value = true;
            formData.value.invoice_issues_datetime = normalizePoDateTime(data.invoice_issues_datetime) || '';
            formData.value.invoice_due_datetime = normalizePoDateTime(data.invoice_due_datetime) || '';
            formData.value.invoice_creation_date = data.invoice_creation_date || ''
            formData.value.project_name = data.project_name || '';
            formData.value.notes = data.notes;
            InvoiceCode.value = data.code || ''
            fetchCustomerDetails(data.customer_id);
            if (data.customer_id) {
                await fetchOrdersByCustomer(data.customer_id);
                if (data.sale_order_id) {
                    const exists = ordersItems.value.some(order => order.value === data.sale_order_id);
                    if (!exists) {
                        ordersItems.value.push({
                            title: data.sale_order_code || `طلب #${data.sale_order_id}`,
                            value: data.sale_order_id,
                        });
                    }
                }
            }
            // For saved invoices, map saved terms to display logic:
            if (data.items && Array.isArray(data.items)) {
                productTableItems.value = data.items.map((trip: any) => ({
                    id: trip.id,
                    trip_id: trip.trip_id || trip.item_id || trip.id,
                    trip_code: trip.code || trip.trip_code || '-',
                    date: trip.date || trip.created_at || '-',
                    loading_location: trip.loading_location_name || trip.pickup_location?.name || trip.loading_location?.name || '-',
                    unloading_location: trip.unloading_location_name || trip.dropoff_location?.name || trip.unloading_location?.name || '-',
                    quantity: trip.quantity_from_customer ?? trip.quantity ?? 1,
                    price: trip.trip_price ?? trip.price ?? trip.price_per_unit ?? 0,
                    discount: trip.discount_val ?? trip.discount ?? 0,
                    taxable_amount: trip.taxable_amount ?? trip.total_applied_taxes ?? 0,
                    tax_amount: trip.total_tax ?? trip.tax_amount ?? 0,
                    total_amount: trip.total_out_taxes ?? trip.final_total ?? trip.total_amount ?? 0,
                }));
            }
            summaryData.value = {
                total_quantity: data.total_quantity,
                total_discount: data.total_discount,
                total_out_taxes: data.total_out_taxes,
                total_applied_taxes: data.total_applied_taxes,
                total_taxes: data.total_taxes,
                final_total: data.final_total,
            };
        }
    } catch (e) {
        console.error('Error fetching form data:', e);
    } finally {
        isLoading.value = false;
        isPopulatingForm.value = false;
    }
}

// Build FormData for submission
const buildFormData = (): FormData => {
    const fd = new FormData();

    // Basic fields
    fd.append('customer_id', String(formData.value.customer_id || ''));
    fd.append('project_name', formData.value.project_name || '');
    fd.append('invoice_issues_datetime', String(formData.value.invoice_issues_datetime || ''));
    fd.append('invoice_due_datetime', String(formData.value.invoice_due_datetime || 1));
    fd.append('sale_order_id', String(formData.value.sale_order_id || ''));
    fd.append('notes', formData.value.notes || '');

    // Items (products)
    productTableItems.value.forEach((item, index) => {
        // Only include id in edit mode
        if (isEditMode.value && item.id) {
            fd.append(`items[${index}][id]`, String(item.id));
        }
        fd.append(`items[${index}][item_id]`, String(item.trip_id || item.id));
        fd.append(`items[${index}][trip_id]`, String(item.trip_id || item.id));
        fd.append(`items[${index}][quantity]`, String(item.quantity || ''));
        fd.append(`items[${index}][price_per_unit]`, String(item.price || ''));
        fd.append(`items[${index}][price]`, String(item.price || ''));
        fd.append(`items[${index}][discount_val]`, String(item.discount || ''));
        fd.append(`items[${index}][total_tax]`, String(item.tax_amount || ''));
        fd.append(`items[${index}][taxable_amount]`, String(item.taxable_amount || ''));
    });

    // if (formData.value.voice_attachment) {
    //     fd.append('voice_attachment', formData.value.voice_attachment);
    // }

    return fd;
}

const resetFormState = async () => {
    formData.value = getDefaultFormData();
    customerData.value = null;
    productTableItems.value = [];
    InvoiceCode.value = '';
    ordersItems.value = [];
    summaryData.value = null;
    skipNextSaleOrderItemsFetch.value = false;
    Object.keys(formErrors).forEach(key => delete formErrors[key]);
    await nextTick();
    scrollToTop();
    if (formRef.value?.resetValidation) {
        formRef.value.resetValidation();
    }
};

const handleSubmit = async (type: any) => {
    if (!await validate()) return;

    if (productTableItems.value.length === 0) {
        warning('يجب أن تكون الطلبية تحتوي على منتج واحد على الأقل');
        return;
    }

    Object.keys(formErrors).forEach(key => delete formErrors[key]);
    isSubmitting.value = true;
    try {
        const fd = buildFormData();
        if (isEditMode.value) {
            // Edit mode - PUT request
            await api.put(`/sales/invoices/logistics/${routeId.value}`, fd);
        } else {
            // Create mode - POST request
            await api.post('/sales/invoices/logistics/', fd);
        }

        success(isEditMode.value ? 'تم تحديث الفاتورة بنجاح' : 'تم إنشاء الفاتورة بنجاح');

        // Post-submit handling
        if (type === 'createNew') {
            await resetFormState();
        } else if (type === 'backToList') {
            router.push({ name: 'SalesLogisticsInvoicesList' });
        }

    } catch (e: any) {
        console.error('Error submitting form:', e);
        apiError(e, 'حدث خطأ أثناء حفظ الفاتورة');
    } finally {
        isSubmitting.value = false;
    }
};

const headers = [
    { title: 'كود الرحلة', key: 'trip_code' },
    { title: 'موقع الإستلام', key: 'loading_location' },
    { title: 'موقع التسليم', key: 'unloading_location' },
    { title: 'العدد', key: 'quantity' },
    { title: 'سعر الرحلة', key: 'price' },
    { title: 'خصم', key: 'discount' },
    { title: 'المبلغ الخاضع للضريبة', key: 'taxable_amount' },
    { title: 'مبلغ الضريبة', key: 'tax_amount' },
    { title: 'إجمالي المبلغ', key: 'total_amount' },
]

// Computed items for the DataTable (mapped from productTableItems)
const tableItems = computed(() => productTableItems.value.map((item, index) => ({
    id: item.trip_id || item.id || index, // Required for DataTable
    trip_code: `${item.trip_code}\n${item.date}`,
    loading_location: item.loading_location,
    unloading_location: item.unloading_location,
    quantity: item.quantity,
    price: item.price,
    discount: item.discount,
    taxable_amount: item.taxable_amount,
    tax_amount: item.tax_amount,
    total_amount: item.total_amount,
})));


const summaryTotalExcludingTax = computed(() =>
    summaryData.value?.total_out_taxes ??
    0
);
const summaryTotalDiscounts = computed(() =>
    summaryData.value?.total_discount ??
    0
);
const summaryTotalTaxable = computed(() =>
    summaryData.value?.total_applied_taxes ??
    0
);
const summaryTotalTax = computed(() => {
    const val = summaryData.value?.total_taxes;
    return val != null ? Number(val).toFixed(2) : 0;
});
const summaryTotalDue = computed(() => {
    const val = summaryData.value?.final_total;
    return val != null ? Number(val).toFixed(2) : 0;
});

watch(
    () => formData.value.customer_id,
    (customerId) => {
        fetchCustomerDetails(customerId);
        if (!isPopulatingForm.value) {
            formData.value.sale_order_id = null;
        }
        fetchOrdersByCustomer(customerId);
    }
);


watch(
    () => formData.value.sale_order_id,
    (saleOrderId) => {
        if (skipNextSaleOrderItemsFetch.value) {
            skipNextSaleOrderItemsFetch.value = false;
            return;
        }
        fetchTripsBySaleOrder(saleOrderId);
    }
);


onMounted(async () => {
    pageLoading.value = true
    await Promise.all([
        fetchConstants(),
        fetchUnits(),
        fetchCustomers()
    ]);

    // Fetch form data if in edit mode
    if (isEditMode.value) {
        await fetchFormData();
    }
    pageLoading.value = false
});

</script>

<template>
    <default-layout>
        <div class="-mx-6 bg-qallab-dashboard-bg space-y-4">
            <TopHeader :icon="fileCheckIcon" :title-key="isEditMode ? 'pages.SalesLogisticsInvoices.FormTitleEdit' : 'pages.SalesLogisticsInvoices.FormTitle'"
                :description-key="isEditMode ? 'pages.SalesLogisticsInvoices.FormDescriptionEdit' : 'pages.SalesLogisticsInvoices.FormDescription'" :code="InvoiceCode" code-label="كود الفاتورة"
                :show-action="false" />

            <!-- Request Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100 ">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span class="w-4" v-html="fileIcon_2"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6">
                        <!-- اسم العميل -->
                        <div>
                            <SelectInput v-model="formData.customer_id" :items="customerItems" placeholder="اختر العميل"
                                label="اسم العميل" density="comfortable" :rules="[required()]"
                                item-title="title" item-value="value" />
                        </div>

                        <!-- Purchase Request Code -->
                        <div>
                            <SelectInput v-model="formData.sale_order_id" placeholder="اختر الطلبية"
                                label="كود طلبية المبيعات" :items="ordersItems" density="comfortable"
                                :rules="[required()]" :error-messages="formErrors['sale_order_id']" 
                                @update:model-value="clearFieldError('sale_order_id')" clearable />
                        </div>

                        <!-- Invoice Creation Date -->
                        <div v-if="formData.invoice_creation_date">
                            <DatePickerInput v-model="formData.invoice_creation_date" type="date" density="comfortable"
                                placeholder="2024-03-01" label="تاريخ إنشاء الفاتورة" />
                        </div>

                        <div v-if="customerData"
                            class="bg-gray-50 rounded-2xl p-6 md:col-span-2 lg:col-span-3 xl:col-span-4 gap-4 text-gray-700 text-xs border border-gray-300 border-dashed grid grid-cols-1  md:grid-cols-3">
                            <!-- Name (Read-only) -->
                            <div>
                                <p class="mb-2 font-semibold mb-1">الاسم:</p>
                                <p class="font-bold">{{ customerName }}</p>
                            </div>

                            <!-- Tax Number (Read-only) -->
                            <div>
                                <p class="mb-2 font-semibold">السجل التجاري:</p>
                                <p class=" font-bold">{{ customerCommercialRegister }}</p>
                            </div>

                            <!-- Address (Read-only) -->
                            <div>
                                <p class="mb-2 font-semibold ">العنوان:</p>
                                <p class=" font-bold">{{ (customerAddress?.address_1 || '') + '—' +
                                    (customerAddress?.address_2 || '') }}</p>
                            </div>
                        </div>

                        <!-- Invoice Date -->
                        <div>
                            <DateTimePickerInput v-model="formData.invoice_issues_datetime" type="date"
                                density="comfortable" placeholder="2024-03-01" label="تاريخ إصدار الفاتورة" />
                        </div>

                        <!-- Invoice Recipient Date -->
                        <div>
                            <DateTimePickerInput v-model="formData.invoice_due_datetime" type="date"
                                density="comfortable" placeholder="2024-03-01" label="تاريخ استحقاق الفاتورة" />
                        </div>


                        <!-- Project -->
                        <div>
                            <TextInput v-model="formData.project_name" placeholder="أدخل اسم المشروع" label="المشروع"
                                density="comfortable" />
                        </div>

                        <!-- Statement (Full width) -->
                        <div class="lg:col-span-2">
                            <TextareaInput v-model="formData.notes" placeholder="أدخل البيان هنا" label="البيان"
                                density="comfortable" rows="3" />
                        </div>
                    </div>
                </v-form>
            </div>

            <!-- Products Section -->
            <div class="bg-white rounded-3xl border !border-gray-100">
                <div class="p-6">
                    <div class="flex items-center gap-2 text-primary-600">
                        <span class="w-4" v-html="fileCheckIcon"></span>
                        <h2 class="text-base font-bold ">جدول عناصر فاتورة المبيعات</h2>
                    </div>
                </div>

                <!-- Products Table -->
                <DataTable :headers="headers" :items="tableItems">
                    <template #item.trip_code="{ item }">
                        <div class="whitespace-pre-line">{{ item.trip_code }}</div>
                    </template>
                </DataTable>
            </div>

            <!-- Summary Table Section -->
            <div class="flex justify-end gap-4 bg-qallab-dashboard-bg py-5 px-2">
                <div class="rounded-2xl overflow-hidden border !border-gray-200 bg-primary-25 w-full max-w-md">
                    <table class="w-full">
                        <!-- Table Header -->
                        <thead>
                            <tr class="bg-primary-400">
                                <th
                                    class="text-white font-semibold text-base py-3 px-4 text-center border-l !border-gray-200">
                                    العنصر
                                </th>
                                <th class="text-white font-semibold text-base py-3 px-4 text-center">
                                    المبلغ
                                </th>
                            </tr>
                        </thead>
                        <!-- Table Body -->
                        <tbody class="text-sm bg-primary-25">
                            <!-- Total Trips -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    إجمالي الرحلات
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ productTableItems.length }}
                                </td>
                            </tr>

                            <!-- Total (Excluding Tax) -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    الإجمالي (غير شامل الضريبة)
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalExcludingTax }}
                                </td>
                            </tr>

                            <!-- Total Discounts -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    مجموع الخصومات
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalDiscounts }}
                                </td>
                            </tr>

                            <!-- Total Taxable Amount -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    الإجمالي الخاضع للضريبة
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalTaxable }}
                                </td>
                            </tr>

                            <!-- Tax Total -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    مجموع الضريبة
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalTax }}
                                </td>
                            </tr>

                            <!-- Total Due Amount -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    إجمالي المبلغ المستحق
                                </td>
                                <td class="py-4 px-4 text-center text-gray-900 font-bold">
                                    {{ summaryTotalDue }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-3 flex items-center justify-center gap-3">
                <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                    <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4" :loading="isSubmitting"
                        custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                        label="حفظ والعودة للرئيسية" @click="handleSubmit('backToList')" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4" :loading="isSubmitting"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        label="حفظ وإنشاء جديد" @click="handleSubmit('createNew')" />
                </div>
            </div>
        </div>

        <!-- Add Product Dialog -->
        <!-- <EditProductDialogInvoices v-model="showAddProductDialog" variant="sales" :unit-items="unitItems"
            :discount-type-options="discountTypeItems" :edit-product="editProductForDialog"
            :existing-products="existingProductsForDialog" @product-updated="handleProductUpdated" /> -->
        <!-- Loading Overlay -->
        <v-overlay :model-value="pageLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>

    </default-layout>
</template>
