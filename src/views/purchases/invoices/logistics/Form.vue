<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import AppFormBreadcrumb from '@/components/common/AppFormBreadcrumb.vue';
import { useApi } from '@/composables/useApi';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon_2 } from '@/components/icons/globalIcons';
import { useForm } from '@/composables/useForm';
import { useNotification } from '@/composables/useNotification';

const { formRef, isFormValid, validate } = useForm();
const { success, warning, apiError } = useNotification();

const api = useApi();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const isLoading = ref(false);
const pageLoading = ref(false);
const isSubmitting = ref(false);
const fetchItemOptions = ref<any[]>([]);
const ordersItems = ref<any[]>([]);
const salesInvoicesItems = ref<any[]>([]);
const InvoiceCode = ref('')
const summaryData = ref<any>(null);
const isPopulatingForm = ref(false);
const skipNextSaleOrderItemsFetch = ref(false);
const skipNextSalesInvoicesFetch = ref(false);
const skipNextSupplierRefresh = ref(false);
const formErrors = reactive<Record<string, string>>({});

const clearFieldError = (field: string) => {
    delete formErrors[field];
};

const clearAllErrors = () => {
    Object.keys(formErrors).forEach((key) => delete formErrors[key]);
};

const assignFieldErrors = (err: any) => {
    const errors = err?.response?.data?.errors;
    if (!errors || typeof errors !== 'object') return;

    Object.entries(errors).forEach(([field, fieldErrors]: [string, any]) => {
        const list = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
        const firstMessage = list.find((m: any) => typeof m === 'string' && m.trim());
        if (firstMessage) {
            formErrors[field] = firstMessage;
        }
    });
};

const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    const container = document.querySelector('.main-scroll');
    if (container instanceof HTMLElement) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Interface for product items in the table
interface ProductTableItem {
    item_id: number;
    item_name: string;
    unit_id: number | null;
    unit_name: string;
    code?: string;
    source_location?: string;
    target_location?: string;
    quantity: number | null;
    price_per_unit: number | null;
    discount_type: number | string | null;
    discount_val: number | null;
    total_tax: number | null;
    taxable_amount: number | null;
    total_out_taxes: number | null;
    subtotal_after_tax: number | null;
    id?: number; // For edit mode
    trip_management_id?: number;
    isAdded?: boolean; // For dialog state
}

// Form data with static values
const getDefaultFormData = () => ({
    category: 'logistics' as string,
    supplier_id: null as number | string | null,
    purchase_order_id: null as number | string | null,
    fetch_item: 'from_sales_invoice' as string,
    sales_ids: [] as (number | string)[],
    invoice_issues_datetime: null as string | null,
    invoice_due_datetime: null as string | null,
    invoice_creation_date: null as string | null,
    project_name: null as string | null,
    notes: null as string | null,
});

const formData = ref(getDefaultFormData());

// Products table items (dynamically populated from dialog)
const productTableItems = ref<ProductTableItem[]>([]);


interface MapOptions {
    preserveId?: boolean;
}

const mapOrderItemsToProducts = (items: any[] = [], options: MapOptions = { preserveId: true }) => {
    const { preserveId = true } = options;
    return items.map((item: any) => ({
        id: preserveId ? item.id : null,
        item_id: item.item_id,
        item_name: item.item_name || item.name || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || item.unit?.name || '',
        code: item.code || '-',
        source_location: item.source_location || '-',
        target_location: item.target_location || '-',
        trip_management_id: item.trip_management_id,
        quantity: item.total_quantities ?? item.quantity_from_customer ?? item.quantity,
        price_per_unit: item.price_per_unit || 0,
        discount_type: item.discount_type,
        discount_val: item.discount_val,
        total_tax: item.total_tax,
        taxable_amount: item.taxable_amount ?? item.total_applied_taxes,
        total_out_taxes: item.total_out_taxes ?? item.taxable_amount ?? (item.subtotal_after_tax != null && item.total_tax != null ? Number(item.subtotal_after_tax) - Number(item.total_tax) : null),
        subtotal_after_tax: item.subtotal_after_tax ?? item.subtotal_after_discount,
    }));
};

const mergeItemsFromSalesInvoices = (salesIds: (number | string)[]) => {
    if (!salesIds || salesIds.length === 0) {
        productTableItems.value = [];
        summaryData.value = null;
        return;
    }

    const allItems: any[] = [];
    const selectedInvoices = salesIds
        .map((salesId) => salesInvoicesItems.value.find((inv) => inv.value === salesId))
        .filter((inv) => inv != null);

    selectedInvoices.forEach((invoice) => {
        if (invoice && invoice.items) {
            allItems.push(...invoice.items);
        }
    });

    if (allItems.length > 0) {
        productTableItems.value = mapOrderItemsToProducts(allItems, { preserveId: false });

        // Sum summaries from all selected invoices
        const totalSummary = selectedInvoices.reduce((acc, invoice) => {
            if (invoice.summary) {
                return {
                    total_quantity: (acc.total_quantity || 0) + (invoice.summary.total_quantity || 0),
                    total_discount: (acc.total_discount || 0) + (invoice.summary.total_discount || 0),
                    total_out_taxes: (acc.total_out_taxes || 0) + (invoice.summary.total_out_taxes || 0),
                    total_applied_taxes: (acc.total_applied_taxes || 0) + (invoice.summary.total_applied_taxes || 0),
                    total_taxes: (acc.total_taxes || 0) + (invoice.summary.total_taxes || 0),
                    final_total: (acc.final_total || 0) + (invoice.summary.final_total || 0),
                };
            }
            return acc;
        }, {
            total_quantity: 0,
            total_discount: 0,
            total_out_taxes: 0,
            total_applied_taxes: 0,
            total_taxes: 0,
            final_total: 0,
        });

        summaryData.value = totalSummary;
    } else {
        productTableItems.value = [];
        summaryData.value = null;
    }
};

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/purchases/invoices/constants');
        const data = res.data || {};

        if (Array.isArray(data.purchase_invoice_fetch_items) && data.purchase_invoice_fetch_items.length) {
            fetchItemOptions.value = data.purchase_invoice_fetch_items.map((i: any) => ({ label: i.label, value: i.key }));
        }
    } catch (e) {
        console.error('Error fetching constants:', e);
    }
};

const fetchSuppliers = async (search = '', cursor?: string, perPage = 15) => {
    const params: any = { per_page: perPage, service_type: 'logistic_company' };
    if (search) {
        params.name = search;
    }
    if (cursor) {
        params.cursor = cursor;
    }
    if (formData.value.supplier_id) {
        params.order_by_id = formData.value.supplier_id;
    }

    const res = await api.get<any>('/suppliers/list', { params });

    return {
        data: res.data || [],
        next_cursor: res.pagination?.next_cursor || null,
    };
};

const fetchOrdersByCategory = async (
    category: number | string | null,
    withItems = true,
) => {
    if (!category) {
        ordersItems.value = [];
        return;
    }

    try {
        const params: Record<string, string | number | boolean> = {
            category,
            with_items: withItems,
        };

        const res = await api.get<any>('/purchases/orders/list', {
            params,
        });

        const rawData = Array.isArray(res.data) ? res.data : res.data?.data;
        const list = Array.isArray(rawData) ? rawData : [];
        ordersItems.value = list.map((order: any) => ({
            title: order.code || `طلبية #${order.id ?? order.uuid ?? ''}`,
            value: order.id ?? order.uuid ?? order.code,
            code: order.code
        }));
    } catch (e) {
        console.error('Error fetching orders list:', e);
        ordersItems.value = [];
    }
};

const fetchSalesInvoicesByPurchaseOrder = async (
    purchaseOrderId: number | string | null,
    category: number | string | null
) => {
    if (!purchaseOrderId || !category) {
        salesInvoicesItems.value = [];
        return;
    }

    const selectedOrder = ordersItems.value.find(order => order.value === purchaseOrderId);
    const poReference = selectedOrder?.code || purchaseOrderId;

    try {
        const params: Record<string, string | number | boolean> = {
            with_logistic_items: true,
            category,
            po_reference: poReference,
            modules: 'purchases',
            ...(formData.value.supplier_id ? { supplier_id: formData.value.supplier_id } : {}),
        };

        const res = await api.get<any>('/sales/invoices/list', {
            params,
        });

        const rawData = Array.isArray(res.data) ? res.data : res.data?.data;
        const list = Array.isArray(rawData) ? rawData : [];
        salesInvoicesItems.value = list.map((invoice: any) => ({
            title: invoice.code || t('purchases.invoices.form.fallbacks.invoiceTitle', { id: String(invoice.id ?? invoice.uuid ?? '') }),
            value: invoice.id ?? invoice.uuid ?? invoice.code,
            items: invoice.logistic_items || [],
            summary: {
                total_quantity: invoice.total_quantity || 0,
                total_discount: invoice.total_discount || 0,
                total_out_taxes: invoice.total_out_taxes || 0,
                total_applied_taxes: invoice.total_applied_taxes || 0,
                total_taxes: invoice.total_taxes || 0,
                final_total: invoice.final_total || 0,
            },
        }));
    } catch (e) {
        console.error('Error fetching sales invoices list:', e);
        salesInvoicesItems.value = [];
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
        const res = await api.get<any>(`/purchases/invoices/logistics/${routeId.value}`);
        const data = res.data;

        if (data) {
            // Populate form data
            skipNextSupplierRefresh.value = true;
            formData.value.supplier_id = data.supplier_id ?? null;
            formData.value.purchase_order_id = data.purchase_order_id;
            formData.value.category = 'logistics';
            formData.value.fetch_item = data.fetch_item;
            skipNextSaleOrderItemsFetch.value = true;
            skipNextSalesInvoicesFetch.value = true;
            formData.value.invoice_issues_datetime = normalizePoDateTime(data.invoice_issues_datetime) || '';
            formData.value.invoice_due_datetime = normalizePoDateTime(data.invoice_due_datetime) || '';
            formData.value.invoice_creation_date = data.invoice_creation_date || '';
            formData.value.project_name = data.project_name || '';
            formData.value.notes = data.notes;
            InvoiceCode.value = data.code || '';
            if (data.category) {
                await fetchOrdersByCategory(data.category);
                if (data.purchase_order_id) {
                    const exists = ordersItems.value.some(order => order.value === data.purchase_order_id);
                    if (!exists) {
                        ordersItems.value.push({
                            title: data.purchase_order_code || t('purchases.invoices.form.fallbacks.poById', { id: String(data.purchase_order_id) }),
                            value: data.purchase_order_id,
                        });
                    }
                    // Fetch sales invoices for the purchase order
                    await fetchSalesInvoicesByPurchaseOrder(data.purchase_order_id, data.category);
                }
            }
            formData.value.sales_ids = data.sales_ids.map((e: String) => Number(e)) || [];
            if (data.items && Array.isArray(data.items)) {
                productTableItems.value = mapOrderItemsToProducts(data.items);
            }
            summaryData.value = {
                total_quantity: data.total_quantity,
                total_discount: data.total_discount,
                total_out_taxes: data.total_out_taxes,
                total_applied_taxes: data.total_applied_taxes,
                total_taxes: data.total_taxes,
                final_total: data.final_total,
            };
            console.log(summaryData.value);

        }
    } catch (e) {
        console.error('Error fetching form data:', e);
    } finally {
        isLoading.value = false;
        isPopulatingForm.value = false;
        skipNextSupplierRefresh.value = false;
    }
}

// Build FormData for submission
const buildFormData = (): FormData => {
    const fd = new FormData();

    if (isEditMode.value) {
        fd.append('_method', 'PUT');
    }

    fd.append('purchase_order_id', String(formData.value.purchase_order_id || ''));
    fd.append('supplier_id', String(formData.value.supplier_id || ''));
    fd.append('fetch_item', String(formData.value.fetch_item || ''));
    fd.append('category', String(formData.value.category || ''));
    if (formData.value.sales_ids?.length) {
        formData.value.sales_ids.forEach((id, index) => {
            fd.append(`sales_ids[${index}]`, String(id));
        });
    }
    fd.append('invoice_issues_datetime', String(formData.value.invoice_issues_datetime || ''));
    fd.append('invoice_due_datetime', String(formData.value.invoice_due_datetime || ''));
    fd.append('project_name', formData.value.project_name || '');
    fd.append('notes', formData.value.notes || '');

    productTableItems.value.forEach((item, index) => {
        if (isEditMode.value && item.id) {
            fd.append(`logisticItems[${index}][id]`, String(item.id));
        }
        fd.append(`logisticItems[${index}][trip_management_id]`, String(item.trip_management_id || ''));
    });

    return fd;
}

const resetFormState = async () => {
    formData.value = getDefaultFormData();
    productTableItems.value = [];
    InvoiceCode.value = '';
    ordersItems.value = [];
    salesInvoicesItems.value = [];
    summaryData.value = null;
    skipNextSaleOrderItemsFetch.value = false;
    skipNextSalesInvoicesFetch.value = false;
    clearAllErrors();
    await nextTick();
    scrollToTop();
    if (formRef.value?.resetValidation) {
        formRef.value.resetValidation();
    }
};

const handleSubmit = async (type: any) => {
    if (!await validate()) return;

    if (productTableItems.value.length === 0) {
        warning(t('purchases.invoices.form.messages.atLeastOneProduct'));
        return;
    }

    clearAllErrors();
    isSubmitting.value = true;
    try {
        const fd = buildFormData();
        if (isEditMode.value) {
            await api.post(`/purchases/invoices/logistics/${routeId.value}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } else {
            await api.post('/purchases/invoices/logistics', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }

        success(isEditMode.value ? t('purchases.invoices.form.messages.updated') : t('purchases.invoices.form.messages.created'));

        // Post-submit handling
        if (type === 'createNew') {
            await resetFormState();
        } else if (type === 'backToList') {
            router.push({ name: 'PurchaseInvoicesLogisticsList' });
        }

    } catch (e: any) {
        console.error('Error submitting form:', e);
        assignFieldErrors(e);
        apiError(e, t('purchases.invoices.form.messages.saveError'));
    } finally {
        isSubmitting.value = false;
    }
};

const headers = computed(() => [
    { title: t('purchases.invoices.logistics.form.tripTableHeaders.tripCode'), key: 'code' },
    { title: t('purchases.invoices.logistics.form.tripTableHeaders.pickupLocation'), key: 'source_location' },
    { title: t('purchases.invoices.logistics.form.tripTableHeaders.deliveryLocation'), key: 'target_location' },
    { title: t('purchases.invoices.logistics.form.tripTableHeaders.tripCount'), key: 'quantity' },
    { title: t('purchases.invoices.logistics.form.tripTableHeaders.tripPrice'), key: 'price_per_unit' },
    { title: t('purchases.invoices.logistics.form.tripTableHeaders.taxableAmount'), key: 'taxable_amount' },
    { title: t('purchases.invoices.logistics.form.tripTableHeaders.taxAmount'), key: 'total_tax' },
    { title: t('purchases.invoices.logistics.form.tripTableHeaders.totalAmount'), key: 'subtotal_after_tax' },
]);

// Computed items for the DataTable (mapped from productTableItems)
const tableItems = computed(() => productTableItems.value.map((item, index) => ({
    id: item.trip_management_id || item.item_id || index,
    code: item.code,
    source_location: item.source_location,
    target_location: item.target_location,
    quantity: item.quantity,
    price_per_unit: item.price_per_unit,
    discount_val: item.discount_val ?? 0,
    discount_type: item.discount_type ?? null,
    taxable_amount: item.taxable_amount,
    total_tax: item.total_tax,
    subtotal_after_tax: item.subtotal_after_tax,
})));

const summaryTotalQuantities = computed(() =>
    summaryData.value?.total_quantity ??
    0
);
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
const summaryTotalTax = computed(() =>
    (summaryData.value?.total_taxes ? Number(summaryData.value?.total_taxes).toFixed(2) : 0) ??
    0
);
const summaryTotalDue = computed(() =>
    (summaryData.value?.final_total ? Number(summaryData.value?.final_total).toFixed(2) : 0) ??
    0
);


watch(
    () => formData.value.category,
    (category) => {
        if (!isPopulatingForm.value) {
            formData.value.purchase_order_id = null;
            summaryData.value = null
            formData.value.sales_ids = [];
        }
        if (!category) {
            ordersItems.value = [];
            return;
        }
        fetchOrdersByCategory(category);
    }
);


watch(
    () => formData.value.purchase_order_id,
    (purchaseOrderId) => {
        if (skipNextSaleOrderItemsFetch.value) {
            skipNextSaleOrderItemsFetch.value = false;
            return;
        }

        // Clear sales invoices and sales_ids when purchase order changes
        if (!isPopulatingForm.value) {
            formData.value.sales_ids = [];
            salesInvoicesItems.value = [];
            summaryData.value = null
        }

        // Fetch sales invoices for the selected purchase order
        if (purchaseOrderId && formData.value.category) {
            fetchSalesInvoicesByPurchaseOrder(purchaseOrderId, formData.value.category);
        }
    }
);

watch(
    () => formData.value.sales_ids,
    (salesIds) => {
        if (skipNextSalesInvoicesFetch.value) {
            skipNextSalesInvoicesFetch.value = false;
            return;
        }

        // Merge items from selected sales invoices
        if (salesIds && salesIds.length > 0) {
            mergeItemsFromSalesInvoices(salesIds);
        } else {
            productTableItems.value = [];
        }
    },
    { deep: true }
);


onMounted(async () => {
    pageLoading.value = true
    await Promise.all([
        fetchConstants(),
    ]);

    await fetchOrdersByCategory(formData.value.category);

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
            <AppFormBreadcrumb
                list-path="/purchases/invoices/logistics/list"
                module-root-key="breadcrumb.purchases.root"
                list-label-key="breadcrumb.purchases.invoices.logistics.list"
                create-label-key="breadcrumb.purchases.invoices.logistics.create"
                edit-label-key="breadcrumb.purchases.invoices.logistics.edit"
                :is-edit-mode="isEditMode"
                :code="InvoiceCode"
            />
            <TopHeader :icon="fileCheckIcon" title-key="pages.PurchaseInvoicesLogistics.FormTitle"
                description-key="pages.PurchaseInvoicesLogistics.FormDescription" :code="InvoiceCode" code-label-key="purchases.invoices.form.codeLabel"
                :show-action="false" />

            <!-- Request Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100 ">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span class="w-4" v-html="fileIcon_2"></span>
                    <h2 class="text-base font-bold">{{ t('purchases.invoices.form.sections.basicInfo') }}</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6">
                        <div>
                            <SelectInput v-model="formData.supplier_id" :items="[]" :placeholder="t('purchases.shared.forms.common.placeholders.selectSupplier')"
                                :label="t('purchases.invoices.form.labels.supplierName')" :rules="[required()]" density="comfortable" item-title="title"
                                item-value="value" :server-side="true" :fetch-function="fetchSuppliers"
                                item-title-key="full_name" item-value-key="id" :debounce-time="500"
                                :error-messages="formErrors['supplier_id']"
                                @update:model-value="clearFieldError('supplier_id')" />
                        </div>

                        <div class="lg:col-span-2 xl:col-span-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">{{ t('purchases.invoices.form.labels.pullProducts') }}</label>
                            <div class="mt-1">
                                <v-radio-group v-model="formData.fetch_item" inline hide-details
                                    :error-messages="formErrors['fetch_item']"
                                    @update:model-value="clearFieldError('fetch_item')">
                                    <v-radio v-for="option in fetchItemOptions" :key="option.value"
                                        :value="option.value" color="primary">
                                        <template #label>
                                            <span
                                                :class="formData.fetch_item === option.value ? 'text-primary font-semibold' : 'text-gray-600'">
                                                {{ option.label }}
                                            </span>
                                        </template>
                                    </v-radio>
                                </v-radio-group>
                            </div>
                        </div>

                        <!-- Purchase Order Code -->
                        <div>
                            <SelectInput v-model="formData.purchase_order_id" :placeholder="t('purchases.invoices.form.placeholders.selectOrder')"
                                :label="t('purchases.invoices.form.labels.purchaseOrderCode')" :items="ordersItems" density="comfortable"
                                :rules="[required()]" :error-messages="formErrors['purchase_order_id']"
                                @update:model-value="clearFieldError('purchase_order_id')" clearable
                                :disabled="!formData.category" />
                        </div>

                        <!-- Sales Invoices Multi-Select -->
                        <div v-if="formData.purchase_order_id">
                            <MultipleSelectInput v-model="formData.sales_ids" :placeholder="t('purchases.invoices.form.placeholders.selectSalesInvoices')"
                                :label="t('purchases.invoices.form.labels.salesInvoices')" :items="salesInvoicesItems" density="comfortable"
                                :error-messages="formErrors['sales_ids']"
                                @update:model-value="clearFieldError('sales_ids')" multiple chips clearable />
                        </div>

                        <!-- Invoice Creation Date -->
                        <div v-if="formData.invoice_creation_date">
                            <DatePickerInput v-model="formData.invoice_creation_date" type="date" density="comfortable"
                                :placeholder="t('purchases.invoices.form.placeholders.dateSample')" :label="t('purchases.invoices.form.labels.invoiceCreatedAt')" />
                        </div>

                        <!-- Invoice Date -->
                        <div>
                            <DateTimePickerInput v-model="formData.invoice_issues_datetime" type="date"
                                :error-messages="formErrors['invoice_issues_datetime']"
                                @update:model-value="clearFieldError('invoice_issues_datetime')" density="comfortable"
                                :placeholder="t('purchases.invoices.form.placeholders.dateSample')" :label="t('purchases.invoices.form.labels.invoiceIssueDate')" />
                        </div>

                        <!-- Invoice Recipient Date -->
                        <div>
                            <DateTimePickerInput v-model="formData.invoice_due_datetime" :error-messages="formErrors['invoice_due_datetime']"
                                @update:model-value="clearFieldError('invoice_due_datetime')" type="date"
                                density="comfortable" :placeholder="t('purchases.invoices.form.placeholders.dateSample')" :label="t('purchases.invoices.form.labels.invoiceDueDate')" />
                        </div>

                        <!-- Project -->
                        <div>
                            <TextInput v-model="formData.project_name" :placeholder="t('purchases.invoices.form.placeholders.projectName')" :label="t('purchases.invoices.form.labels.project')"
                                density="comfortable" />
                        </div>

                        <!-- Statement (Full width) -->
                        <div class="lg:col-span-2">
                            <TextInput v-model="formData.notes" :placeholder="t('purchases.invoices.form.placeholders.notes')" :label="t('purchases.invoices.form.labels.statement')"
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
                        <h2 class="text-base font-bold ">{{ t('purchases.invoices.form.sections.itemsTable') }}</h2>
                    </div>
                </div>

                <!-- Products Table -->
                <DataTable :headers="headers" :items="tableItems" />

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
                                    {{ t('purchases.invoices.form.summary.item') }}
                                </th>
                                <th class="text-white font-semibold text-base py-3 px-4 text-center">
                                    {{ t('purchases.invoices.form.summary.amount') }}
                                </th>
                            </tr>
                        </thead>
                        <!-- Table Body -->
                        <tbody class="text-sm bg-primary-25">
                            <!-- Total Quantities -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.invoices.form.summary.totalQty') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalQuantities }}
                                </td>
                            </tr>

                            <!-- Total (Excluding Tax) -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.invoices.form.summary.totalExclTax') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalExcludingTax }}
                                </td>
                            </tr>

                            <!-- Total Discounts -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.invoices.form.summary.totalDiscounts') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalDiscounts }}
                                </td>
                            </tr>

                            <!-- Total Tax Amount -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.invoices.form.summary.totalTaxable') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalTaxable }}
                                </td>
                            </tr>

                            <!-- Tax Total -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.invoices.form.summary.tax') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    15%
                                </td>
                            </tr>

                            <!-- Tax Total -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.invoices.form.summary.totalTax') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalTax }}
                                </td>
                            </tr>

                            <!-- Total Due Amount -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.invoices.form.summary.totalDue') }}
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
                    <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4" :loading="isSubmitting"
                        custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                        :label="t('purchases.invoices.form.actions.saveReturnMain')" @click="handleSubmit('backToList')" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4" :loading="isSubmitting"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        :label="t('purchases.invoices.form.actions.saveCreateNew')" @click="handleSubmit('createNew')" />
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <v-overlay :model-value="pageLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>

    </default-layout>
</template>
