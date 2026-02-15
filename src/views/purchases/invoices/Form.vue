<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, reactive } from "vue";
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
const categoryOptions = ref<any[]>([]);
const fetchItemOptions = ref<any[]>([]);
const ordersItems = ref<any[]>([]);
const supplierItems = ref<any[]>([]);
const salesInvoicesItems = ref<any[]>([]);
const InvoiceCode = ref('')
const supplierData = ref<any>(null);
const supplierName = computed(() => supplierData.value?.full_name || supplierData.value?.name || '—');
const supplierTaxNo = computed(() => supplierData.value?.taxno || '—');
const supplierAddress = computed(() => supplierData.value?.address || {});
const unitItems = ref<any[]>([]);
const discountTypeItems = ref<any[]>([]);
const summaryData = ref<any>(null);
const isPopulatingForm = ref(false);
const skipNextSaleOrderItemsFetch = ref(false);
const skipNextSalesInvoicesFetch = ref(false);
const skipNextSupplierRefresh = ref(false);
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
    total_out_taxes: number | null;
    subtotal_after_tax: number | null;
    id?: number; // For edit mode
    isAdded?: boolean; // For dialog state
}

// Form data with static values
const getDefaultFormData = () => ({
    supplier_id: null as number | string | null,
    category: null as string | null,
    purchase_order_id: null as number | string | null,
    fetch_item: null as string | null,
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
        quantity: item.quantity_from_customer ?? item.quantity,
        price_per_unit: item.price_per_unit || 0,
        discount_type: item.discount_type,
        discount_val: item.discount_val,
        total_tax: item.total_tax,
        taxable_amount: item.total_applied_taxes,
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

        if (Array.isArray(data.request_categories) && data.request_categories.length) {
            categoryOptions.value = data.request_categories.map((c: any) => ({ title: c.label, value: c.key }));
        }

        if (Array.isArray(data.purchase_invoice_fetch_items) && data.purchase_invoice_fetch_items.length) {
            fetchItemOptions.value = data.purchase_invoice_fetch_items.map((i: any) => ({ label: i.label, value: i.key }));
        }

        if (data.discount_types?.length) {
            discountTypeItems.value = data.discount_types.map((i: any) => ({ title: i.label, value: i.key }));
        }

    } catch (e) {
        console.error('Error fetching constants:', e);
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

        if (formData.value.supplier_id) {
            params.supplier_id = formData.value.supplier_id;
        }

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

const fetchSuppliers = async () => {
    try {
        const res = await api.get<any>('/suppliers/list');
        const list = Array.isArray(res.data) ? res.data : res.data?.data;
        const suppliers = Array.isArray(list) ? list : [];
        supplierItems.value = suppliers.map((supplier: any) => ({
            title: supplier.full_name,
            value: supplier.id,
        }));
    } catch (e) {
        console.error('Error fetching suppliers list:', e);
        supplierItems.value = [];
    }
};

const fetchSupplierDetails = async (supplierId: number | string | null) => {
    if (!supplierId) {
        supplierData.value = null;
        return;
    }

    try {
        const res = await api.get<any>(`/suppliers/${supplierId}`);
        supplierData.value = res.data || null;
    } catch (e) {
        console.error('Error fetching supplier details:', e);
        supplierData.value = null;
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
            with_items: true,
            category,
            po_reference: poReference,
            modules: 'purchases'
        };

        if (formData.value.supplier_id) {
            params.supplier_id = formData.value.supplier_id;
        }

        const res = await api.get<any>('/sales/invoices/list', {
            params,
        });

        const rawData = Array.isArray(res.data) ? res.data : res.data?.data;
        const list = Array.isArray(rawData) ? rawData : [];
        salesInvoicesItems.value = list.map((invoice: any) => ({
            title: invoice.code || `فاتورة #${invoice.id ?? invoice.uuid ?? ''}`,
            value: invoice.id ?? invoice.uuid ?? invoice.code,
            items: invoice.items || [],
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
        const res = await api.get<any>(`/purchases/invoices/${routeId.value}`);
        const data = res.data;

        if (data) {
            // Populate form data
            skipNextSupplierRefresh.value = true;
            formData.value.supplier_id = data.supplier_id;
            formData.value.purchase_order_id = data.purchase_order_id;
            formData.value.category = data.category;
            formData.value.fetch_item = data.fetch_item;
            skipNextSaleOrderItemsFetch.value = true;
            skipNextSalesInvoicesFetch.value = true;
            formData.value.invoice_issues_datetime = normalizePoDateTime(data.invoice_issues_datetime) || '';
            formData.value.invoice_due_datetime = normalizePoDateTime(data.invoice_due_datetime) || '';
            formData.value.invoice_creation_date = data.invoice_creation_date || '';
            formData.value.project_name = data.project_name || '';
            formData.value.notes = data.notes;
            InvoiceCode.value = data.code || '';
            await fetchSupplierDetails(data.supplier_id);
            if (data.category) {
                await fetchOrdersByCategory(data.category);
                if (data.purchase_order_id) {
                    const exists = ordersItems.value.some(order => order.value === data.purchase_order_id);
                    if (!exists) {
                        ordersItems.value.push({
                            title: data.purchase_order_code || `طلبية #${data.purchase_order_id}`,
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

    // Basic fields
    fd.append('supplier_id', String(formData.value.supplier_id || ''));
    fd.append('purchase_order_id', String(formData.value.purchase_order_id || ''));
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
    supplierData.value = null;
    productTableItems.value = [];
    InvoiceCode.value = '';
    ordersItems.value = [];
    salesInvoicesItems.value = [];
    summaryData.value = null;
    skipNextSaleOrderItemsFetch.value = false;
    skipNextSalesInvoicesFetch.value = false;
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
        warning('يجب أن تحتوي الفاتورة على منتج واحد على الأقل');
        return;
    }

    Object.keys(formErrors).forEach(key => delete formErrors[key]);
    isSubmitting.value = true;
    try {
        const fd = buildFormData();
        let response;
        if (isEditMode.value) {
            // Edit mode - PUT request
            response = await api.put(`/purchases/invoices/${routeId.value}`, fd);
        } else {
            // Create mode - POST request
            response = await api.post('/purchases/invoices', fd);
        }

        success(isEditMode.value ? 'تم تحديث الفاتورة بنجاح' : 'تم إنشاء الفاتورة بنجاح');

        // Post-submit handling
        if (type === 'createNew') {
            await resetFormState();
        } else if (type === 'backToList') {
            router.push({ name: 'PurchaseInvoicesList' });
        }

    } catch (e: any) {
        console.error('Error submitting form:', e);
        if (e?.response?.data?.errors) {
            const apiErrors = e.response.data.errors;
            Object.keys(apiErrors).forEach((key) => {
                formErrors[key] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key];
            });
        }
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
        total_out_taxes: p.total_out_taxes,
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
            total_out_taxes: updatedProduct.total_out_taxes ?? (updatedProduct.taxable_amount != null ? updatedProduct.taxable_amount : null),
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
        total_out_taxes: p.total_out_taxes,
        isAdded: p.isAdded,
        id: p.id,
    }))
);


const headers = [
    { title: 'اسم المنتج', key: 'name' },
    { title: 'الوحدة', key: 'unit' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'سعر الوحدة', key: 'price_per_unit' },
    { title: 'الخصم', key: 'discount_val' },
    { title: 'المبلغ الخاضع للضريبة', key: 'taxable_amount' },
    { title: 'مبلغ الضريبة', key: 'total_tax' },
    { title: 'إجمالي المبلغ', key: 'total_out_taxes' },
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
    total_out_taxes: item.total_out_taxes,
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
    () => formData.value.supplier_id,
    (newVal) => {
        fetchSupplierDetails(newVal);
        if (!isPopulatingForm.value) {
            formData.value.purchase_order_id = null;
            formData.value.sales_ids = [];
            ordersItems.value = [];
            salesInvoicesItems.value = [];
            productTableItems.value = [];
            summaryData.value = null;
            console.log('fff');

            if (formData.value.category) {
                fetchOrdersByCategory(formData.value.category);
            }
        }
    }
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
        fetchUnits(),
        fetchSuppliers()
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
            <TopHeader :icon="fileCheckIcon" title-key="pages.PurchaseInvoices.FormTitle"
                description-key="pages.PurchaseInvoices.FormDescription" :code="InvoiceCode" code-label="كود الفاتورة"
                :show-action="false" />

            <!-- Request Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100 ">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span class="w-4" v-html="fileIcon_2"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6">
                        <div>
                            <SelectInput v-model="formData.supplier_id" :items="supplierItems" placeholder="اختر"
                                label="اسم المورد" density="comfortable" :rules="[required()]"
                                :error-messages="formErrors['category']"
                                @update:model-value="clearFieldError('category')" clearable />
                        </div>

                        <div>
                            <SelectInput v-model="formData.category" :items="categoryOptions" placeholder="اختر"
                                label="نوع الطلبية" density="comfortable" :rules="[required()]"
                                :error-messages="formErrors['category']"
                                @update:model-value="clearFieldError('category')" clearable />
                        </div>

                        <div class="col-span-2">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">سحب المنتجات</label>
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

                        <div v-if="supplierData"
                            class="bg-gray-50 rounded-2xl p-6 md:col-span-2 lg:col-span-3 xl:col-span-4 gap-4 text-gray-700 text-xs border border-gray-300 border-dashed grid grid-cols-1  md:grid-cols-3">
                            <!-- Name (Read-only) -->
                            <div>
                                <p class="mb-2 font-semibold mb-1">الاسم:</p>
                                <p class="font-bold">{{ supplierName }}</p>
                            </div>

                            <!-- Tax Number (Read-only) -->
                            <div>
                                <p class="mb-2 font-semibold">الرقم الضريبي:</p>
                                <p class=" font-bold">{{ supplierTaxNo }}</p>
                            </div>

                            <!-- Address (Read-only) -->
                            <div>
                                <p class="mb-2 font-semibold ">العنوان:</p>
                                <p class=" font-bold">{{ (supplierAddress?.address_1 || '') + '—' +
                                    (supplierAddress?.address_2 || '') }}</p>
                            </div>
                        </div>

                        <!-- Purchase Order Code -->
                        <div>
                            <SelectInput v-model="formData.purchase_order_id" placeholder="اختر الطلبية"
                                label="كود طلبية المشتريات" :items="ordersItems" density="comfortable"
                                :rules="[required()]" :error-messages="formErrors['purchase_order_id']"
                                @update:model-value="clearFieldError('purchase_order_id')" clearable
                                :disabled="!formData.category" />
                        </div>

                        <!-- Sales Invoices Multi-Select -->
                        <div v-if="formData.purchase_order_id">
                            <MultipleSelectInput v-model="formData.sales_ids" placeholder="اختر فواتير المبيعات"
                                label="فواتير المبيعات" :items="salesInvoicesItems" density="comfortable"
                                :error-messages="formErrors['sales_ids']"
                                @update:model-value="clearFieldError('sales_ids')" multiple chips clearable />
                        </div>

                        <!-- Invoice Creation Date -->
                        <div v-if="formData.invoice_creation_date">
                            <DatePickerInput v-model="formData.invoice_creation_date" type="date" density="comfortable"
                                placeholder="2024-03-01" label="تاريخ إنشاء الفاتورة" />
                        </div>

                        <!-- Invoice Date -->
                        <div>
                            <DateTimePickerInput v-model="formData.invoice_issues_datetime" type="date"
                                :error-messages="formErrors['invoice_issues_datetime']"
                                @update:model-value="clearFieldError('invoice_issues_datetime')" density="comfortable"
                                placeholder="2024-03-01" label="تاريخ إصدار الفاتورة" />
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
                            <TextInput v-model="formData.notes" placeholder="أدخل البيان هنا" label="البيان"
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
                        <h2 class="text-base font-bold ">جدول عناصر فاتورة المشتريات</h2>
                    </div>
                </div>

                <!-- Products Table -->
                <DataTable :headers="headers" @edit="handleEditProduct" :items="tableItems" />
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
