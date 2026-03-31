<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, reactive } from "vue";
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import AppFormBreadcrumb from '@/components/common/AppFormBreadcrumb.vue';
import { useApi } from '@/composables/useApi';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon_2, rialIcon } from '@/components/icons/globalIcons';
import { useForm } from '@/composables/useForm';
import { useNotification as useNotify } from '@/composables/useNotification';

const { t } = useI18n();
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
const isFormDataLoaded = ref(false);

const ordersItems = ref<any[]>([]);
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
// Cache: { [saleOrderId]: { [tripId]: invoiceItemId } }
const itemsIdCache = ref<Record<string | number, Record<string | number, number>>>({});

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
    discount_type: number | string | null;
    discount_val: number | null;
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
            warning(t('sales.forms.common.validation.noTripsForInvoice'))
        }

        const cachedIds = isEditMode.value ? itemsIdCache.value[saleOrderId as string | number] : null;

        productTableItems.value = trips.map((trip: any) => ({
            id: cachedIds?.[trip.id] ?? null,
            trip_id: trip.id,
            trip_code: trip.code || '-',
            date: trip.date || trip.created_at || '-',
            loading_location: trip.source_location || trip.loading_location_name || trip.loading_location?.name || '-',
            unloading_location: trip.target_location || trip.unloading_location_name || trip.unloading_location?.name || '-',
            quantity: trip.total_quantities ?? trip.quantity_from_customer ?? trip.quantity ?? 1,
            price: trip.trip_value ?? trip.trip_price ?? trip.price ?? 0,
            discount: trip.discount_val ?? trip.discount ?? 0,
            taxable_amount: trip.taxable_amount ?? 0,
            tax_amount: trip.total_tax ?? trip.tax_amount ?? 0,
            total_amount: trip.final_total ?? trip.total_out_taxes ?? trip.total_amount ?? 0,
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

const waitForCustomerData = async () => {
    if (!isEditMode.value) return;

    if (isFormDataLoaded.value && formData.value.customer_id) {
        return;
    }

    await new Promise(resolve => {
        const checkInterval = setInterval(() => {
            if (isFormDataLoaded.value && formData.value.customer_id) {
                clearInterval(checkInterval);
                clearTimeout(timeoutId);
                resolve(true);
            }
        }, 10);

        const timeoutId = setTimeout(() => {
            clearInterval(checkInterval);
            resolve(true);
        }, 5000);
    });
};

const fetchCustomers = async (search = '', cursor?: string, perPage = 15) => {
    if (isEditMode.value) {
        await waitForCustomerData();
    }

    const params: any = { per_page: perPage };
    if (search) {
        params.name = search;
    }
    if (cursor) {
        params.cursor = cursor;
    }
    if (formData.value.customer_id) {
        params.order_by_id = formData.value.customer_id;
    }

    const res = await api.get<any>('/customers/list', { params });

    return {
        data: res.data || [],
        next_cursor: res.pagination?.next_cursor || null,
    };
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
            title: order.code || t('sales.forms.common.misc.orderRef', { id: order.id ?? order.uuid ?? '' }),
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
            // Allow customer select to fetch once customer_id is ready
            isFormDataLoaded.value = true;
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
                            title: data.sale_order_code || t('sales.forms.common.misc.orderRef', { id: data.sale_order_id }),
                            value: data.sale_order_id,
                        });
                    }
                }
            }
            // Populate table from invoice items
            if (data.items && Array.isArray(data.items)) {
                productTableItems.value = data.items.map((item: any) => ({
                    id: item.id,
                    trip_id: item.trip_management_id,
                    trip_code: item.code || '-',
                    date: '-',
                    loading_location: item.source_location || '-',
                    unloading_location: item.target_location || '-',
                    quantity: item.total_quantities ?? item.quantity ?? 1,
                    price: item.trip_value ?? item.price_per_unit ?? 0,
                    discount: item.discount_val ?? 0,
                    taxable_amount: item.taxable_amount ?? 0,
                    tax_amount: item.total_tax ?? 0,
                    total_amount: item.subtotal_after_tax ?? item.total_out_taxes ?? 0,
                }));

                if (data.sale_order_id) {
                    const idMap: Record<string | number, number> = {};
                    data.items.forEach((item: any) => {
                        if (item.trip_management_id && item.id) {
                            idMap[item.trip_management_id] = item.id;
                        }
                    });
                    itemsIdCache.value[data.sale_order_id] = idMap;
                }
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
        isFormDataLoaded.value = true;
    } finally {
        isLoading.value = false;
        isPopulatingForm.value = false;
    }
}

// Build FormData for submission
const buildFormData = (): FormData => {
    const fd = new FormData();

    if (isEditMode.value) {
        fd.append('_method', 'PUT');
    }

    fd.append('customer_id', String(formData.value.customer_id || ''));
    fd.append('project_name', formData.value.project_name || '');
    fd.append('invoice_issues_datetime', String(formData.value.invoice_issues_datetime || ''));
    fd.append('invoice_due_datetime', String(formData.value.invoice_due_datetime || ''));
    fd.append('sale_order_id', String(formData.value.sale_order_id || ''));
    fd.append('notes', formData.value.notes || '');

    productTableItems.value.forEach((item, index) => {
        if (isEditMode.value && item.id) {
            fd.append(`items[${index}][id]`, String(item.id));
        }
        fd.append(`items[${index}][trip_management_id]`, String(item.trip_id || item.id));
    });

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
    itemsIdCache.value = {};
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
        warning(t('sales.forms.common.validation.atLeastOneOrderProduct'));
        return;
    }

    Object.keys(formErrors).forEach(key => delete formErrors[key]);
    isSubmitting.value = true;
    try {
        const fd = buildFormData();
        if (isEditMode.value) {
            await api.post(`/sales/invoices/logistics/${routeId.value}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } else {
            await api.post('/sales/invoices/logistics/', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }

        success(isEditMode.value ? t('sales.forms.common.messages.invoiceUpdated') : t('sales.forms.common.messages.invoiceCreated'));

        // Post-submit handling
        if (type === 'createNew') {
            await resetFormState();
        } else if (type === 'backToList') {
            router.push({ name: 'SalesLogisticsInvoicesList' });
        }

    } catch (e: any) {
        console.error('Error submitting form:', e);
        apiError(e, t('sales.forms.common.messages.saveInvoiceError'));
    } finally {
        isSubmitting.value = false;
    }
};

const headers = computed(() => [
    { title: t('sales.forms.common.labels.tripCode'), key: 'trip_code' },
    { title: t('sales.forms.common.labels.loadingSite'), key: 'loading_location' },
    { title: t('sales.forms.common.labels.unloadingSite'), key: 'unloading_location' },
    { title: t('sales.forms.common.labels.count'), key: 'quantity' },
    { title: t('sales.forms.common.labels.tripPriceCol'), key: 'price' },
    { title: t('sales.forms.common.labels.taxableAmount'), key: 'taxable_amount' },
    { title: t('sales.forms.tables.invoiceLogistics.taxAmount'), key: 'tax_amount' },
    { title: t('sales.forms.tables.invoiceLogistics.totalAmount'), key: 'total_amount' },
]);

// Computed items for the DataTable (mapped from productTableItems)
const tableItems = computed(() => productTableItems.value.map((item, index) => ({
    id: item.trip_id || item.id || index, // Required for DataTable
    trip_code: `${item.trip_code}\n${item.date}`,
    loading_location: item.loading_location,
    unloading_location: item.unloading_location,
    quantity: item.quantity,
    price: item.price,
    discount: item.discount,
    discount_val: item.discount_val ?? 0,
    discount_type: item.discount_type ?? null,
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
        fetchUnits()
    ]);

    // Fetch form data if in edit mode
    if (isEditMode.value) {
        await fetchFormData();
    }
    pageLoading.value = false
    isFormDataLoaded.value = true
});

</script>

<template>
    <default-layout>
        <div class="-mx-6 bg-qallab-dashboard-bg space-y-4">
            <AppFormBreadcrumb
                list-path="/sales/logistics-invoices/list"
                module-root-key="breadcrumb.sales.root"
                list-label-key="breadcrumb.sales.logisticsInvoices.list"
                create-label-key="breadcrumb.sales.logisticsInvoices.create"
                edit-label-key="breadcrumb.sales.logisticsInvoices.edit"
                :is-edit-mode="isEditMode"
                :code="InvoiceCode"
            />
            <TopHeader :icon="fileCheckIcon"
                :title-key="isEditMode ? 'pages.SalesLogisticsInvoices.FormTitleEdit' : 'pages.SalesLogisticsInvoices.FormTitle'"
                :description-key="isEditMode ? 'pages.SalesLogisticsInvoices.FormDescriptionEdit' : 'pages.SalesLogisticsInvoices.FormDescription'"
                :code="InvoiceCode" :code-label="t('sales.forms.common.labels.invoiceCode')" :show-action="false" />

            <!-- Request Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100 ">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span class="w-4" v-html="fileIcon_2"></span>
                    <h2 class="text-base font-bold">{{ t('sales.forms.common.sections.basicData') }}</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6">
                        <!-- اسم العميل -->
                        <div>
                            <SelectInput v-model="formData.customer_id" :items="[]" :placeholder="t('sales.forms.common.placeholders.selectClient')"
                                :label="t('sales.forms.common.labels.customerName')" density="comfortable" :rules="[required()]" item-title="title"
                                item-value="value" :server-side="true" :fetch-function="fetchCustomers"
                                item-title-key="full_name" item-value-key="id" :debounce-time="500" />
                        </div>

                        <!-- Purchase Request Code -->
                        <div>
                            <SelectInput v-model="formData.sale_order_id" :placeholder="t('sales.forms.common.placeholders.selectSalesOrder')"
                                :label="t('sales.forms.common.labels.salesOrderCode')" :items="ordersItems" density="comfortable"
                                :rules="[required()]" :error-messages="formErrors['sale_order_id']"
                                @update:model-value="clearFieldError('sale_order_id')" clearable />
                        </div>

                        <!-- Invoice Creation Date -->
                        <div v-if="formData.invoice_creation_date">
                            <DatePickerInput v-model="formData.invoice_creation_date" type="date" density="comfortable"
                                :placeholder="t('sales.forms.common.placeholders.dateSample')" :label="t('sales.forms.common.labels.invoiceCreatedAt')" />
                        </div>

                        <div v-if="customerData"
                            class="bg-gray-50 rounded-2xl p-6 md:col-span-2 lg:col-span-3 xl:col-span-4 gap-4 text-gray-700 text-xs border border-gray-300 border-dashed grid grid-cols-1  md:grid-cols-3">
                            <!-- Name (Read-only) -->
                            <div>
                                <p class="mb-2 font-semibold">{{ t('sales.forms.common.customerCard.name') }}</p>
                                <p class="font-bold">{{ customerName }}</p>
                            </div>

                            <!-- Tax Number (Read-only) -->
                            <div>
                                <p class="mb-2 font-semibold">{{ t('sales.forms.common.customerCard.commercialRegister') }}</p>
                                <p class=" font-bold">{{ customerCommercialRegister }}</p>
                            </div>

                            <!-- Address (Read-only) -->
                            <div>
                                <p class="mb-2 font-semibold ">{{ t('sales.forms.common.customerCard.address') }}</p>
                                <p class=" font-bold">{{ (customerAddress?.address_1 || '') + '—' +
                                    (customerAddress?.address_2 || '') }}</p>
                            </div>
                        </div>

                        <!-- Invoice Date -->
                        <div>
                            <DateTimePickerInput v-model="formData.invoice_issues_datetime" type="date"
                                density="comfortable" :placeholder="t('sales.forms.common.placeholders.dateSample')" :label="t('sales.forms.common.labels.invoiceIssueDate')" />
                        </div>

                        <!-- Invoice Recipient Date -->
                        <div>
                            <DateTimePickerInput v-model="formData.invoice_due_datetime" type="date"
                                density="comfortable" :placeholder="t('sales.forms.common.placeholders.dateSample')" :label="t('sales.forms.common.labels.invoiceDueDate')" />
                        </div>


                        <!-- Project -->
                        <div>
                            <TextInput v-model="formData.project_name" :placeholder="t('sales.forms.common.placeholders.enterProjectName')" :label="t('sales.forms.common.labels.project')"
                                density="comfortable" />
                        </div>

                        <!-- Statement (Full width) -->
                        <div class="lg:col-span-2">
                            <TextareaInput v-model="formData.notes" :placeholder="t('sales.forms.common.labels.statementHere')" :label="t('sales.forms.common.labels.statement')"
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
                        <h2 class="text-base font-bold ">{{ t('sales.forms.common.sections.salesInvoiceItemsTable') }}</h2>
                    </div>
                </div>

                <!-- Products Table -->
                <DataTable :headers="headers" :items="tableItems">
                    <template #item.trip_code="{ item }">
                        <div class="whitespace-pre-line">{{ item.trip_code }}</div>
                    </template>
                    <template #item.discount_display="{ item }">
                        <span v-if="item.discount_val != null && Number(item.discount_val) > 0"
                            class="flex items-center gap-1">
                            {{ item.discount_val }}
                            <span v-if="item.discount_type == 1">%</span>
                            <span v-if="item.discount_type == 2" v-html="rialIcon"></span>
                        </span>
                        <span v-else>—</span>
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
                                    {{ t('sales.forms.stats.item') }}
                                </th>
                                <th class="text-white font-semibold text-base py-3 px-4 text-center">
                                    {{ t('sales.forms.stats.amount') }}
                                </th>
                            </tr>
                        </thead>
                        <!-- Table Body -->
                        <tbody class="text-sm bg-primary-25">
                            <!-- Total Trips -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('common.financial.totalTrips') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ productTableItems.length }}
                                </td>
                            </tr>

                            <!-- Total (Excluding Tax) -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('common.financial.totalExcludingTax') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalExcludingTax }}
                                </td>
                            </tr>

                            <!-- Total Discounts -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('common.financial.totalDiscounts') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalDiscounts }}
                                </td>
                            </tr>

                            <!-- Total Taxable Amount -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('common.financial.totalTaxable') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalTaxable }}
                                </td>
                            </tr>

                            <!-- Tax Total -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('sales.forms.stats.taxTotal') }}
                                </td>
                                <td class="py-4 px-4 text-center text-gray-600">
                                    {{ summaryTotalTax }}
                                </td>
                            </tr>

                            <!-- Total Due Amount -->
                            <tr class="border-b !border-gray-200">
                                <td class="py-4 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('common.financial.totalAmountDue') }}
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
                        :label="t('sales.forms.common.actions.saveBackHome')" @click="handleSubmit('backToList')" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4" :loading="isSubmitting"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        :label="t('sales.forms.common.actions.saveCreateNew')" @click="handleSubmit('createNew')" />
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
