<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from 'vue-router';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import { useApi } from '@/composables/useApi';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon_2 } from '@/components/icons/globalIcons';
import { useForm } from '@/composables/useForm';
import { useNotification as useNotify } from '@/composables/useNotification';

const { formRef, isFormValid, validate } = useForm();
const { success, error, warning } = useNotify();

const api = useApi();
const route = useRoute();
const router = useRouter();

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const isLoading = ref(false);
const pageLoading = ref(false);
const isSubmitting = ref(false);
const customerItems = ref<any[]>([]);
const orderTypes = ref<any[]>([]);
const ordersItems = ref<any[]>([]);
const InvoiceCode = ref('')
const customerData = ref<any>(null);
const customerName = computed(() => customerData.value?.full_name || customerData.value?.name || '—');
const customerCommercialRegister = computed(() => customerData.value?.commercial_register || '—');
const customerAddress = computed(() => customerData.value?.address || {});
const unitItems = ref<any[]>([]);
const discountTypeItems = ref<any[]>([]);

// Interface for product items in the table
interface ProductTableItem {
    item_id: number;
    item_name: string;
    unit_id: number | null;
    unit_name: string;
    quantity: number | null;
    price_per_unit: number | null;
    discount_type: number | string | null;
    discount_val: number | null;
    total_tax: number | null;
    taxable_amount: number | null;
    subtotal_after_tax: number | null;
    id?: number; // For edit mode
    isAdded?: boolean; // For dialog state
}

// Form data with static values
const getDefaultFormData = () => ({
    customer_id: null,
    order_type: null,
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


const fetchCustomers = async () => {
    try {
        const res = await api.get<any>("/customers/list");
        if (Array.isArray(res.data)) {
            customerItems.value = res.data.map((i: any) => ({
                title: i.full_name,
                value: i.id,
            }));
        }
    } catch (e) {
        console.error("Error fetching customers:", e);
    }
};

const mapOrderItemsToProducts = (items: any[] = []) => {
    return items.map((item: any) => ({
        id: item.id,
        item_id: item.item_id,
        item_name: item.item_name || item.name || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || item.unit?.name || '',
        quantity: item.quantity_from_customer ?? item.quantity,
        price_per_unit: item.price_per_unit || 0,
        discount_type: item.discount_type,
        discount_val: item.discount_val,
        total_tax: item.total_tax,
        taxable_amount: item.taxable_amount,
        subtotal_after_tax: item.subtotal_after_tax ?? item.subtotal_after_discount,
    }));
};

const fetchOrderItems = async (saleOrderId: number | string | null) => {
    if (!saleOrderId) {
        productTableItems.value = [];
        return;
    }

    try {
        const res = await api.get<any>('/sales/orders/list-with-receiving-docs-items', {
            params: {
                sale_order_id: saleOrderId,
                with_items: true,
            },
        });

        const orders = Array.isArray(res.data) ? res.data : res.data?.data;
        const firstOrder = Array.isArray(orders) ? orders[0] : null;
        const items = firstOrder?.items || [];
        if (items.length <= 0)
            warning('يجب أن تحتوي الطلبية على منتج واحد على الأقل لإتمام الفاتورة')
        else
            productTableItems.value = mapOrderItemsToProducts(items);
    } catch (e) {
        console.error('Error fetching sale order items:', e);
    }
};

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/sales/orders/constants');
        const data = res.data;

        if (data.so_types?.length) {
            orderTypes.value = Array.isArray(data.so_types)
                ? data.so_types.map((type: any) => ({ title: type.label, value: type.key }))
                : [];
        }
        if (data.discount_types?.length) discountTypeItems.value = data.discount_types.map((i: any) => ({ title: i.label, value: i.key }));

    } catch (e) {
        console.error('Error fetching order types:', e);
        orderTypes.value = [];
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

const fetchOrdersByCustomerAndType = async (
    customerId: number | string | null,
    orderType: number | string | null
) => {
    if (!customerId || !orderType) {
        ordersItems.value = [];
        return;
    }

    try {
        const res = await api.get<any>('/sales/orders/list', {
            params: {
                customer_id: customerId,
                so_type: orderType,
            },
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
    try {
        const res = await api.get<any>(`/sales/invoices/building-materials/${routeId.value}`);
        const data = res.data;

        if (data) {
            // Populate form data
            formData.value.customer_id = data.customer_id;
            formData.value.sale_order_id = data.sale_order_id;
            formData.value.invoice_issues_datetime = normalizePoDateTime(data.invoice_issues_datetime) || '';
            formData.value.invoice_due_datetime = normalizePoDateTime(data.invoice_due_datetime) || '';
            formData.value.invoice_creation_date = data.invoice_creation_date || ''
            formData.value.project_name = data.project_name || '';
            formData.value.notes = data.notes;
            InvoiceCode.value = data.code || ''
            fetchCustomerDetails(data.customer_id);
            if (data.items && Array.isArray(data.items)) {
                productTableItems.value = mapOrderItemsToProducts(data.items);
            }
        }
    } catch (e) {
        console.error('Error fetching form data:', e);
    } finally {
        isLoading.value = false;
    }
}

// Build FormData for submission
const buildFormData = (): FormData => {
    const fd = new FormData();

    // Basic fields
    fd.append('customer_id', formData.value.customer_id || '');
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
        fd.append(`items[${index}][item_id]`, String(item.item_id));
        fd.append(`items[${index}][unit_id]`, String(item.unit_id || ''));
        fd.append(`items[${index}][quantity]`, String(item.quantity || ''));
        fd.append(`items[${index}][price_per_unit]`, String(item.price_per_unit || ''));
        fd.append(`items[${index}][discount_type]`, String(item.discount_type || ''));
        fd.append(`items[${index}][discount_val]`, String(item.discount_val || ''));
        fd.append(`items[${index}][total_tax]`, String(item.total_tax || ''));
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
    await nextTick();
    if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

    isSubmitting.value = true;
    try {
        const fd = buildFormData();
        let response;
        if (isEditMode.value) {
            // Edit mode - PUT request
            response = await api.put(`/sales/invoices/building-materials/${routeId.value}`, fd);
        } else {
            // Create mode - POST request
            response = await api.post('/sales/invoices/building-materials', fd);
        }

        success(isEditMode.value ? 'تم تحديث الفاتورة بنجاح' : 'تم إنشاء الفاتورة بنجاح');

        // Post-submit handling
        if (type === 'createNew') {
            await resetFormState();
        } else if (type === 'backToList') {
            router.push({ name: 'SalesInvoicesList' });
        }

    } catch (e: any) {
        console.error('Error submitting form:', e);
        error(e?.response?.data?.message || 'حدث خطأ أثناء حفظ الفاتورة');
    } finally {
        isSubmitting.value = false;
    }
};


const showAddProductDialog = ref(false);
const editingProduct = ref<ProductTableItem | null>(null);

// Convert editingProduct to the dialog's expected type
const editProductForDialog = computed<any>(() => {
    const p = editingProduct.value;
    if (!p) return null;
    return {
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        price_per_unit: p.price_per_unit,
        discount_val: p.discount_val,
        discount_type: p.discount_type,
        total_tax: p.total_tax,
        taxable_amount: p.taxable_amount,
        isAdded: p.isAdded,
        id: p.id,
    };
});


const handleEditProduct = (item: any) => {
    const productToEdit = productTableItems.value.find(p => p.item_id === item.item_id);
    if (productToEdit) {
        editingProduct.value = { ...productToEdit, isAdded: true };
        showAddProductDialog.value = true;
    }
};

const handleProductUpdated = (updatedProduct: any) => {
    const index = productTableItems.value.findIndex(p => p.item_id === updatedProduct.item_id);
    if (index !== -1) {
        const existing = productTableItems.value[index];
        productTableItems.value[index] = {
            ...existing,
            unit_id: updatedProduct.unit_id,
            unit_name: updatedProduct.unit_name,
            quantity: updatedProduct.quantity,
            price_per_unit: updatedProduct.price_per_unit ?? null,
            discount_val: updatedProduct.discount_val ?? null,
            discount_type: updatedProduct.discount_type ?? 2,
            total_tax: updatedProduct.total_tax ?? null,
            taxable_amount: updatedProduct.taxable_amount ?? null,
            subtotal_after_tax: updatedProduct.taxable_amount != null && updatedProduct.total_tax != null
                ? +(Number(updatedProduct.taxable_amount) + Number(updatedProduct.total_tax)).toFixed(2)
                : null,
            isAdded: updatedProduct.isAdded,
            id: updatedProduct.id,
        };
    }
    editingProduct.value = null;
};

// Convert existing products to the dialog's expected type
const existingProductsForDialog = computed<any[]>(() =>
    productTableItems.value.map(p => ({
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        price_per_unit: p.price_per_unit,
        discount_val: p.discount_val,
        discount_type: p.discount_type,
        total_tax: p.total_tax,
        taxable_amount: p.taxable_amount,
        isAdded: p.isAdded,
        id: p.id,
    }))
);


const headers = [
    { title: 'اسم المنتج', key: 'name' },
    { title: 'الوحدة', key: 'unit' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'سعر الوحدة', key: 'price_per_unit' },
    { title: 'خصم', key: 'discount_val' },
    { title: 'المبلغ الخاضع للضريبة', key: 'taxable_amount' },
    { title: 'مبلغ الضريبة', key: 'total_tax' },
    { title: 'إجمالي المبلغ', key: 'subtotal_after_tax' },
]

// Computed items for the DataTable (mapped from productTableItems)
const tableItems = computed(() => productTableItems.value.map(item => ({
    id: item.item_id, // Required for DataTable
    item_id: item.item_id,
    name: item.item_name,
    unit: item.unit_name,
    quantity: item.quantity,
    price_per_unit: item.price_per_unit,
    discount_val: item.discount_val,
    taxable_amount: item.taxable_amount,
    total_tax: item.total_tax,
    subtotal_after_tax: item.subtotal_after_tax,
})));

const summaryTotalQuantities = computed(() =>
    productTableItems.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
);
const summaryTotalExcludingTax = computed(() =>
    productTableItems.value.reduce((sum, item) => sum + (Number(item.price_per_unit) || 0), 0)
);
const summaryTotalDiscounts = computed(() =>
    productTableItems.value.reduce((sum, item) => sum + (Number(item.discount_val) || 0), 0).toFixed(2)
);
const summaryTotalTaxable = computed(() =>
    productTableItems.value.reduce((sum, item) => sum + (Number(item.taxable_amount) || 0), 0).toFixed(2)
);
const summaryTotalTax = computed(() =>
    productTableItems.value.reduce((sum, item) => sum + (Number(item.total_tax) || 0), 0).toFixed(2)
);
const summaryTotalDue = computed(() =>
    productTableItems.value.reduce((sum, item) => sum + (Number(item.subtotal_after_tax) || 0), 0).toFixed(2)

);

watch(
    () => formData.value.customer_id,
    (newVal) => {
        fetchCustomerDetails(newVal);
    }
);

watch(
    [() => formData.value.customer_id, () => formData.value.order_type],
    ([customerId, orderType]) => {
        formData.value.sale_order_id = null;
        if (!customerId || !orderType) {
            ordersItems.value = [];
            return;
        }
        fetchOrdersByCustomerAndType(customerId, orderType);
    }
);


watch(
    () => formData.value.sale_order_id,
    (saleOrderId) => {
        fetchOrderItems(saleOrderId);
    }
);


onMounted(async () => {
    pageLoading.value = true
    await Promise.all([
        fetchCustomers(),
        fetchConstants(),
        fetchUnits()
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
            <TopHeader :icon="fileCheckIcon" title-key="pages.SalesInvoices.FormTitle"
                description-key="pages.SalesInvoices.FormDescription" :code="InvoiceCode" code-label="كود الفاتورة"
                :show-action="false" />

            <!-- Request Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100 ">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span class="w-4" v-html="fileIcon_2"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <!-- Customer Name -->
                        <div>
                            <SelectInput v-model="formData.customer_id" :items="customerItems" placeholder="اختر"
                                label="اسم العميل" density="comfortable" />
                        </div>

                        <div>
                            <SelectInput v-model="formData.order_type" :items="orderTypes" placeholder="اختر"
                                label="نوع الطلبية" density="comfortable" />
                        </div>

                        <!-- Purchase Request Code -->
                        <div>
                            <SelectInput v-model="formData.sale_order_id" placeholder="اختر الطلبية"
                                label="كود طلبية المبيعات" :items="ordersItems" density="comfortable" />
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
                <DataTable :headers="headers" @edit="handleEditProduct" :items="tableItems" force-show-edit />
            </div>

            <!-- Summary Table Section -->
            <div class="flex justify-center gap-4 bg-qallab-dashboard-bg py-5 px-2">
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
                            <!-- Total Quantities -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    إجمالي الكميات
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalQuantities }}
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

                            <!-- Total Tax Amount -->
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
                                     الضريبة
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                   15%
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
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalDue }}
                                </td>
                            </tr>

                            <!-- Required Amount in Words -->
                            <!-- <tr class="bg-primary-600">
                                <td colspan="2" class="py-4 px-4 text-center font-bold text-white">
                                    <div class="text-xs mb-1">المبلغ المطلوب:</div>
                                    <div class="text-sm">أربعة وخمسون ألف وثلاثمائة وخمسة وتسعون ريال سعودي</div>
                                </td>
                            </tr> -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-3 flex items-center justify-center gap-3">
                <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                    <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                        custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                        label="حفظ والعودة للرئيسية" @click="handleSubmit('backToList')" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
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
