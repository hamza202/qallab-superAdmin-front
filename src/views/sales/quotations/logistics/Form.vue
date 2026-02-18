<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import AddProductDialog from '@/components/price-offers/AddProductDialog.vue';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import DateTimePickerInput from '@/components/common/forms/DateTimePickerInput.vue';
import TelInput from '@/components/common/forms/TelInput.vue';
import { useApi } from '@/composables/useApi';
import { fileIcon, mapMarkerIcon, messagePlusIcon, filePlusIcon, listIcon, CoinHandIcon, fileCheckIcon, busIcon, globeIcon } from '@/components/icons/priceOffersIcons';
import { returnIcon, saveIcon, binIcon } from '@/components/icons/globalIcons';
import { useForm } from '@/composables/useForm';
import { useNotification as useNotify } from '@/composables/useNotification';
import AddLogisticsDetailDialog from './components/AddLogisticsDetailDialog.vue';

const { formRef, isFormValid, validate } = useForm();
const { success, apiError } = useNotify();

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

useI18n()
const api = useApi();
const route = useRoute();
const router = useRouter();

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const isLoading = ref(false);
const isSubmitting = ref(false);

// Query params for creating quotation from request
const fromRequestId = computed(() => route.query.from_request as string | undefined);
const saleRequestsId = computed(() => route.query.sale_requests_id as string | undefined);

const paymentMethodItems = ref<any[]>([]);
const feeTypeItems = ref<any[]>([]);
const unitItems = ref<any[]>([]);
const customerItems = ref<any[]>([]);
const deliveryMethodItems = ref<any[]>([]);
const supplyTypeItems = ref<any[]>([]);
const itemUsingItems = ref<any[]>([]); // الاستخدام
const discountTypeItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);
const categoriesItems = ref<any[]>([]);
const amPmIntervalItems = ref<any[]>([]);
const actualExecutionIntervalItems = ref<any[]>([]);

// Logistics details (array - dynamically populated from dialog)
const logisticsDetails = ref<LogisticsDetail[]>([]);

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/sales/quotations/constants');
        const data = res.data;
        if (data) {
            transportTypeItems.value = data.transport_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            amPmIntervalItems.value = data.am_pm_interval?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            paymentMethodItems.value = data.payment_methods?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            feeTypeItems.value = data.fee_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            if (data.delivered_methods?.length) deliveryMethodItems.value = data.delivered_methods.map((i: any) => ({ title: i.label, value: i.key }));
            if (data.supply_types?.length) supplyTypeItems.value = data.supply_types.map((i: any) => ({ title: i.label, value: i.key }));
            if (data.item_usings?.length) itemUsingItems.value = data.item_usings.map((i: any) => ({ title: i.label, value: i.key }));
            if (data.discount_types?.length) discountTypeItems.value = data.discount_types.map((i: any) => ({ title: i.label, value: i.key }));

            // Actual execution interval - use from API or fallback
            if (data.actual_execution_interval && Array.isArray(data.actual_execution_interval)) {
                actualExecutionIntervalItems.value = data.actual_execution_interval.map((i: any) => ({ title: i.label, value: i.key }));
            }
        }
    } catch (e) {
        console.error('Error fetching constants:', e);
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

const fetchCustomers = async () => {
    try {
        const res = await api.get<any>('/customers/list');
        if (Array.isArray(res.data)) {
            customerItems.value = res.data.map((i: any) => ({ title: i.full_name, value: i.id }));
        }
    } catch (e) {
        console.error('Error fetching customers:', e);
    }
}

// Helper: الاستخدام (item_using) label from constants.item_usings
const getItemUsingName = (key: string | null): string => {
    if (key == null) return '';
    const item = itemUsingItems.value.find((i: any) => i.value === key);
    return item?.title || '';
};

// Fetch form data for edit mode
const fetchFormData = async () => {
    if (!isEditMode.value || !routeId.value) return;

    isLoading.value = true;
    try {
        const raw = await api.get<any>(`/sales/quotations/fuels/${routeId.value}`);
        const data = raw?.data != null ? raw.data : raw;

        if (!data) return;

        // Populate form data
        formData.value.customer_id = data.customer_id ?? null;
        formData.value.quotations_datetime = data.quotations_datetime ? String(data.quotations_datetime) : '';
        formData.value.quotation_name = data.quotation_name ?? '';
        formData.value.quotation_validity_no = data.quotation_validity_no ?? null;
        formData.value.responsible_person = data.responsible_person ?? '';
        formData.value.responsible_phone = data.responsible_phone ?? null;
        formData.value.target_location = data.target_location ?? null;
        formData.value.target_latitude = data.target_latitude ?? null;
        formData.value.target_longitude = data.target_longitude ?? null;
        formData.value.project_name = data.project_name ?? '';
        formData.value.quotation_from_date = data.quotation_from_date ?? data.from_date ?? '';
        formData.value.supply_type = data.supply_type ?? null;
        formData.value.supply_interval = data.supply_interval ?? null;
        formData.value.delivered_interval = data.delivered_interval ?? null;
        formData.value.delivered_method = data.delivered_method ?? null;
        formData.value.payment_method = data.payment_method ?? null;
        formData.value.upfront_payment = data.upfront_payment ?? null;
        formData.value.invoice_interval = data.invoice_interval ?? null;
        formData.value.payment_term_no = data.payment_term_no ?? null;
        formData.value.late_fee_type = data.late_fee_type ?? null;
        formData.value.late_fee = data.late_fee ?? null;
        formData.value.cancel_fee_type = data.cancel_fee_type ?? null;
        formData.value.cancel_fee = data.cancel_fee ?? null;
        formData.value.code = data.code ? String(data.code) : '';

        // Populate products (items)
        if (Array.isArray(data.items) && data.items.length > 0) {
            productTableItems.value = data.items.map((item: any) => ({
                id: item.id,
                item_id: Number(item.item_id),
                item_name: item.item_name ?? '',
                unit_id: item.unit_id ?? null,
                unit_name: item.unit_name ?? '',
                quantity: item.quantity ?? null,
                item_using: item.item_using ?? null,
                item_using_name: getItemUsingName(item.item_using),
                unit_price: item.price_per_unit ?? null,
                discount: item.discount_val ?? null,
                discount_type: item.discount_type ?? 2, // 1 = percentage, 2 = fixed
                tax_amount: item.total_tax ?? null,
                notes: item.note ?? item.notes ?? '',
            }));
        }
    } catch (e) {
        console.error('Error fetching form data:', e);
    } finally {
        isLoading.value = false;
    }
}

// Fetch request data and pre-fill form when creating quotation from request
const fetchRequestForQuotation = async () => {
    if (!fromRequestId.value) return;

    isLoading.value = true;
    try {
        const res = await api.get<any>(`/sales/fuels/${fromRequestId.value}`);
        const data = res.data;

        if (data) {
            // Map request fields to quotation form fields (matching respons.json)
            formData.value.customer_id = data.customer_id != null ? Number(data.customer_id) : null;
            formData.value.responsible_person = data.responsible_person || '';
            formData.value.responsible_phone = data.responsible_phone || null;
            formData.value.target_location = data.target_location || null;
            formData.value.target_latitude = data.target_latitude || null;
            formData.value.target_longitude = data.target_longitude || null;
            formData.value.project_name = data.project_name || '';
            formData.value.payment_method = data.payment_method || null;
            formData.value.upfront_payment = data.upfront_payment || null;
            formData.value.invoice_interval = data.invoice_interval != null ? Number(data.invoice_interval) : null;
            formData.value.payment_term_no = data.payment_term_no != null ? Number(data.payment_term_no) : null;
            formData.value.late_fee_type = data.late_fee_type || null;
            formData.value.late_fee = data.late_fee != null ? Number(data.late_fee) : null;
            formData.value.cancel_fee_type = data.cancel_fee_type || null;
            formData.value.cancel_fee = data.cancel_fee != null ? Number(data.cancel_fee) : null;

            // Map logistics_detail fields
            if (data.logistics_detail) {
                formData.value.quotation_from_date = data.logistics_detail.from_date || '';
                formData.value.supply_type = data.logistics_detail.supply_type || null;
                formData.value.supply_interval = data.logistics_detail.supply_interval != null ? Number(data.logistics_detail.supply_interval) : null;
                formData.value.delivered_interval = data.logistics_detail.delivered_interval != null ? Number(data.logistics_detail.delivered_interval) : null;
                formData.value.delivered_method = data.logistics_detail.delivered_method || null;
            }

            // Map products (items) from request to quotation
            if (data.items && Array.isArray(data.items)) {
                productTableItems.value = data.items.map((item: any) => ({
                    item_id: Number(item.item_id),
                    item_name: item.item_name || item.item?.name || '',
                    unit_id: item.unit_id ?? null,
                    unit_name: item.unit_name || '',
                    quantity: item.quantity ?? null,
                    item_using: item.item_using ?? null,
                    item_using_name: getItemUsingName(item.item_using ?? null),
                    unit_price: item.price_per_unit ?? null,
                    discount: item.discount_val ?? null,
                    discount_type: item.discount_type ?? 2,
                    tax_amount: item.total_tax ?? null,
                    notes: item.note || item.notes || '',
                    id: item.id,
                }));
            }
        }
    } catch (e) {
        console.error('Error fetching request data:', e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await Promise.all([
        fetchConstants(),
        fetchUnits(),
        fetchCustomers()
    ]);

    if (isEditMode.value) {
        await fetchFormData();
    } else if (fromRequestId.value) {
        await fetchRequestForQuotation();
    }
});

// Interface for product items in the table
interface ProductTableItem {
    item_id: number;
    item_name: string;
    unit_id: number | null;
    unit_name: string;
    quantity: number | null;
    item_using: string | null; // الاستخدام
    item_using_name?: string;
    notes: string;
    id?: number;
    isAdded?: boolean;
    unit_price: number | null;
    discount: number | null;
    discount_type: number | string | null; // 1 = percentage, 2 = fixed
    tax_amount: number | null;
}

// Form data
const formData = ref({
    customer_id: null as number | null,
    quotations_datetime: '' as string,
    quotation_name: '',
    quotation_validity_no: null as number | string | null,
    responsible_person: '' as string,
    responsible_phone: null as string | null,
    target_location: null as string | null,
    target_latitude: null as string | null,
    target_longitude: null as string | null,
    project_name: '',
    quotation_from_date: '' as string, // تاريخ بدء التسليم
    supply_type: null as string | null,
    supply_interval: null as number | string | null,
    delivered_interval: null as number | string | null,
    delivered_method: null as string | null,
    payment_method: null as string | null,
    upfront_payment: null as number | string | null,
    invoice_interval: null as number | string | null,
    payment_term_no: null as number | string | null,
    late_fee_type: null as string | null,
    late_fee: null as number | string | null,
    cancel_fee_type: null as string | null,
    cancel_fee: null as number | string | null,
    code: '' as string
});

// Products table items
const productTableItems = ref<ProductTableItem[]>([]);

// Summary data
const summaryData = computed(() => ({
    productsCount: productTableItems.value.length,
    payment_method: paymentMethodItems.value.find((i: any) => i.value === formData.value.payment_method)?.title || '',
    upfront_payment: formData.value.upfront_payment ?? 'لا يوجد'
}));

import { useNotification } from '@/composables/useNotification';
import { required } from '@/utils/validators';

const { warning } = useNotification();

const showAddProductDialog = ref(false);
const editingProduct = ref<ProductTableItem | null>(null);

// Convert editingProduct to the dialog's expected type
const editProductForDialog = computed<FuelQuotationProductToAdd | null>(() => {
    const p = editingProduct.value;
    if (!p) return null;
    return {
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        item_using: p.item_using,
        item_using_name: p.item_using_name,
        unit_price: p.unit_price,
        discount: p.discount,
        discount_type: p.discount_type,
        tax_amount: p.tax_amount,
        notes: p.notes,
        isAdded: p.isAdded,
        id: p.id,
    };
});

// Convert existing products to the dialog's expected type
const existingProductsForDialog = computed<FuelQuotationProductToAdd[]>(() =>
    productTableItems.value.map(p => ({
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        item_using: p.item_using,
        item_using_name: p.item_using_name,
        unit_price: p.unit_price,
        discount: p.discount,
        discount_type: p.discount_type,
        tax_amount: p.tax_amount,
        notes: p.notes,
        isAdded: p.isAdded,
        id: p.id,
    }))
);

const handleAddProduct = () => {
    editingProduct.value = null;
    showAddProductDialog.value = true;
};

const handleProductSaved = (products: FuelQuotationProductToAdd[]) => {
    const newItems: ProductTableItem[] = [];
    products.forEach(p => {
        const existing = productTableItems.value.find(existing => existing.item_id === p.item_id);
        newItems.push({
            item_id: p.item_id,
            item_name: p.item_name,
            unit_id: p.unit_id,
            unit_name: p.unit_name,
            quantity: p.quantity,
            item_using: p.item_using,
            item_using_name: p.item_using_name,
            unit_price: p.unit_price ?? null,
            discount: p.discount ?? null,
            discount_type: p.discount_type ?? 2, // 1 = percentage, 2 = fixed
            tax_amount: p.tax_amount ?? null,
            notes: existing?.notes || p.notes || '',
            isAdded: p.isAdded,
            id: p.id,
        });
    });
    productTableItems.value = newItems;
};

const handleEditProduct = (item: any) => {
    const productToEdit = productTableItems.value.find(p => p.item_id === item.item_id);
    if (productToEdit) {
        editingProduct.value = { ...productToEdit, isAdded: true };
        showAddProductDialog.value = true;
    }
};

const handleProductUpdated = (updatedProduct: FuelQuotationProductToAdd) => {
    const index = productTableItems.value.findIndex(p => p.item_id === updatedProduct.item_id);
    if (index !== -1) {
        const existingNotes = productTableItems.value[index].notes;
        productTableItems.value[index] = {
            item_id: updatedProduct.item_id,
            item_name: updatedProduct.item_name,
            unit_id: updatedProduct.unit_id,
            unit_name: updatedProduct.unit_name,
            quantity: updatedProduct.quantity,
            item_using: updatedProduct.item_using,
            item_using_name: updatedProduct.item_using_name,
            unit_price: updatedProduct.unit_price ?? null,
            discount: updatedProduct.discount ?? null,
            discount_type: updatedProduct.discount_type ?? 2, // 1 = percentage, 2 = fixed
            tax_amount: updatedProduct.tax_amount ?? null,
            notes: existingNotes || updatedProduct.notes || '',
            isAdded: updatedProduct.isAdded,
            id: updatedProduct.id,
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

// Logistics location dialog handling
const currentLogisticsIndex = ref<number>(-1);
const currentLogisticsLocationType = ref<'source' | 'target'>('source');
const showLogisticsLocationDialog = ref(false);

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

// Format date to DD-MM-YYYY
const formatDate = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

// Format date to DD-MM-YYYY
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

    if (isEditMode.value) {
        fd.append('_method', 'PUT');
    }

    // Include sale_requests_id if creating quotation from request
    if (saleRequestsId.value) {
        fd.append('sale_requests_id', saleRequestsId.value);
    }

    fd.append('customer_id', String(formData.value.customer_id || ''));

    // Basic fields from Postman API
    fd.append('responsible_person', formData.value.responsible_person || '');
    if (formData.value.responsible_phone) fd.append('responsible_phone', formData.value.responsible_phone);
    fd.append('quotations_datetime', formData.value.quotations_datetime || '');
    fd.append('quotation_name', formData.value.quotation_name || '');
    fd.append('quotation_validity_no', String(formData.value.quotation_validity_no ?? '1'));
    fd.append('target_location', formData.value.target_location || '');
    fd.append('target_latitude', String(formData.value.target_latitude || ''));
    fd.append('target_longitude', String(formData.value.target_longitude || ''));
    fd.append('project_name', formData.value.project_name || '');
    fd.append('quotation_from_date', formatDateDdMmYyyy(formData.value.quotation_from_date) || '');
    fd.append('supply_type', formData.value.supply_type || '');
    fd.append('supply_interval', String(formData.value.supply_interval ?? ''));
    fd.append('delivered_interval', String(formData.value.delivered_interval ?? ''));
    fd.append('delivered_method', formData.value.delivered_method || '');
    fd.append('payment_method', formData.value.payment_method || '');
    fd.append('upfront_payment', String(formData.value.upfront_payment ?? ''));
    fd.append('invoice_interval', String(formData.value.invoice_interval ?? '1'));
    fd.append('payment_term_no', String(formData.value.payment_term_no ?? '1'));
    fd.append('late_fee_type', formData.value.late_fee_type || '');
    fd.append('late_fee', String(formData.value.late_fee ?? ''));
    fd.append('cancel_fee_type', formData.value.cancel_fee_type || '');
    fd.append('cancel_fee', String(formData.value.cancel_fee ?? ''));

    // Items (products) – keys per Postman: item_id, unit_id, quantity, item_using, price_per_unit, discount_type, discount_val, total_tax, note
    // discount_type: 1 = percentage, 2 = fixed
    productTableItems.value.forEach((item, index) => {
        if (isEditMode.value && item.id != null) {
            fd.append(`items[${index}][id]`, String(item.id));
        }
        fd.append(`items[${index}][item_id]`, String(item.item_id));
        fd.append(`items[${index}][unit_id]`, String(item.unit_id || ''));
        fd.append(`items[${index}][quantity]`, String(item.quantity || ''));
        fd.append(`items[${index}][item_using]`, String(item.item_using || 'heavy_equipment'));
        fd.append(`items[${index}][price_per_unit]`, String(item.unit_price ?? ''));
        fd.append(`items[${index}][discount_type]`, String(item.discount_type ?? 2));
        fd.append(`items[${index}][discount_val]`, String(item.discount ?? ''));
        fd.append(`items[${index}][total_tax]`, String(item.tax_amount ?? ''));
        fd.append(`items[${index}][note]`, item.notes || '');
    });

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


    return fd;
}

const getInitialFormData = () => ({
    customer_id: null as number | null,
    quotations_datetime: '' as string,
    quotation_name: '',
    quotation_validity_no: null as number | string | null,
    responsible_person: '' as string,
    responsible_phone: null as string | null,
    target_location: null as string | null,
    target_latitude: null as string | null,
    target_longitude: null as string | null,
    project_name: '',
    quotation_from_date: '' as string,
    supply_type: null as string | null,
    supply_interval: null as number | string | null,
    delivered_interval: null as number | string | null,
    delivered_method: null as string | null,
    payment_method: null as string | null,
    upfront_payment: null as number | string | null,
    invoice_interval: null as number | string | null,
    payment_term_no: null as number | string | null,
    late_fee_type: null as string | null,
    late_fee: null as number | string | null,
    cancel_fee_type: null as string | null,
    cancel_fee: null as number | string | null,
    code: '' as string
});

const resetForm = () => {
    formData.value = getInitialFormData();
    productTableItems.value = [];
    formRef.value?.reset();
    logisticsDetails.value = [];

};

const handleSubmit = async (afterSuccess?: 'reset' | 'navigate') => {
    if (!await validate()) return;

    locationError.value = null;
    if (!formData.value.target_location?.trim()) {
        locationError.value = 'يجب تحديد موقع المشروع';
        warning('يجب تحديد موقع المشروع');
        return;
    }

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
        const url = isEditMode.value && routeId.value
            ? `/sales/quotations/fuels/${routeId.value}`
            : '/sales/quotations/fuels';

        await api.post(url, fd, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        success(isEditMode.value ? 'تم تحديث عرض السعر بنجاح' : 'تم إنشاء عرض السعر بنجاح');

        if (afterSuccess === 'reset') {
            resetForm();
        } else if (afterSuccess === 'navigate') {
            router.push({ name: 'SalesQuotationsFuelsList' });
        }
    } catch (e: any) {
        console.error('Error submitting form:', e);
        apiError(e, 'حدث خطأ أثناء حفظ عرض السعر');
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

const showMapDialog = ref(false);
const locationError = ref<string | null>(null);

const openMapDialog = () => {
    showMapDialog.value = true;
};

const headers = [
    { title: 'اسم المنتج', key: 'name' },
    { title: 'الوحدة', key: 'unit' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'الاستخدام', key: 'item_using_name' },
    { title: 'سعر الوحدة', key: 'unit_price' },
    { title: 'خصم', key: 'discount' },
    { title: 'مبلغ الضريبة', key: 'tax_amount' },
    { title: 'إجمالي المبلغ', key: 'total_amount' },
    { title: 'ملاحظات', key: 'notes' },
]

// Tax calculation (15%)
const TAX_RATE = 0.15;

const getSubtotalBeforeTax = (item: ProductTableItem): number => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const disc = Number(item.discount) || 0;
    return qty * price - disc;
};

const getTaxAmount = (item: ProductTableItem): number => {
    const subtotal = getSubtotalBeforeTax(item);
    return Math.round(subtotal * TAX_RATE * 100) / 100;
};

const getTotalAmount = (item: ProductTableItem): number => {
    const subtotal = getSubtotalBeforeTax(item);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    return Math.round((subtotal + tax) * 100) / 100;
};

const summaryTotals = computed(() => {
    const items = productTableItems.value;
    const subtotalBeforeDiscount = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        return sum + qty * price;
    }, 0);
    const totalDiscount = items.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
    const subtotalAfterDiscount = Math.round((subtotalBeforeDiscount - totalDiscount) * 100) / 100;
    const totalTaxAmount = items.reduce((sum, item) => sum + (item.tax_amount ?? getTaxAmount(item)), 0);
    const finalTotal = Math.round((subtotalAfterDiscount + totalTaxAmount) * 100) / 100;
    return {
        subtotalBeforeDiscount: Math.round(subtotalBeforeDiscount * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        subtotalAfterDiscount,
        totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
        finalTotal
    };
});

// Computed items for the DataTable
const tableItems = computed(() => productTableItems.value.map(item => ({
    id: item.item_id,
    item_id: item.item_id,
    name: item.item_name,
    unit: item.unit_name,
    quantity: item.quantity,
    item_using_name: item.item_using_name || getItemUsingName(item.item_using ?? null) || '—',
    unit_price: item.unit_price ?? 0,
    discount: item.discount ?? 0,
    tax_amount: item.tax_amount ?? getTaxAmount(item),
    total_amount: getTotalAmount(item),
    notes: item.notes,
})));

</script>

<template>
    <default-layout>
        <div class="request-material-product-page -mx-6 bg-qallab-dashboard-bg space-y-4">
            <!-- Page Header -->
            <TopHeader :icon="filePlusIcon" title-key="pages.SalesQuotationsLogistics.FormTitle"
                description-key="pages.SalesQuotationsLogistics.FormDescription" :show-action="false"
                :code="isEditMode ? (formData.code || '') : ''" :code-icon="fileIcon" />

            <!-- Basic Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span v-html="fileCheckIcon"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
                        <!-- Customer Name -->
                        <div>
                            <SelectInput v-model="formData.customer_id" :items="customerItems" label="اسم العميل"
                                item-title="title" :rules="[required()]" item-value="value" density="comfortable"
                                placeholder="حدد العميل" />
                        </div>

                        <!-- Responsible Person -->
                        <div>
                            <TextInput v-model="formData.responsible_person" placeholder="أدخل اسم المسؤول"
                                label="اسم المسؤول" :rules="[required()]" density="comfortable" />
                        </div>

                        <!-- Responsible Phone -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">هاتف المسؤول <span
                                    class="text-error-600">*</span></label>
                            <TelInput v-model="formData.responsible_phone" placeholder="5XX XXX XXXX"
                                density="comfortable" :rules="[required()]" />
                        </div>

                        <!-- Quotation Name -->
                        <div>
                            <TextInput v-model="formData.quotation_name" placeholder="أدخل الإسم" label="اسم عرض السعر"
                                :rules="[required()]" density="comfortable" />
                        </div>

                        <!-- Quotation Date -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">تاريخ العرض</label>
                            <DateTimePickerInput v-model="formData.quotations_datetime" density="comfortable"
                                placeholder="اختر التاريخ والوقت" />
                        </div>

                        <!-- Quotation Validity -->
                        <div>
                            <PriceInput v-model="formData.quotation_validity_no" placeholder="أدخل المدة بالأيام"
                                label="صلاحية عرض السعر" :rules="[required()]" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">يوم</span>
                                </template>
                            </PriceInput>
                        </div>

                        <!-- Project Location -->
                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">موقع المشروع <span
                                    class="text-error-600">*</span></label>
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

                        <!-- Project Name -->
                        <div>
                            <TextInput v-model="formData.project_name" label="اسم المشروع" placeholder="أدخل الإسم"
                                density="comfortable" />
                        </div>

                        <!-- From Date (تاريخ بدء التسليم) -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">تاريخ بدء التسليم</label>
                            <DatePickerInput v-model="formData.quotation_from_date" type="date" density="comfortable"
                                placeholder="اختر التاريخ" />
                        </div>

                        <!-- Supply Type -->
                        <div>
                            <SelectInput v-model="formData.supply_type" :items="supplyTypeItems" label="نوع التوريد"
                                item-title="title" item-value="value" density="comfortable"
                                placeholder="حدد نوع التوريد" />
                        </div>

                        <!-- Supply Interval -->
                        <div>
                            <TextInput v-model="formData.supply_interval" placeholder="أدخل المدة" label="مدة التوريد"
                                type="number" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">يوم</span>
                                </template>
                            </TextInput>
                        </div>

                        <!-- Delivered Interval -->
                        <div>
                            <TextInput v-model="formData.delivered_interval" placeholder="أدخل المدة"
                                label="مدة التسليم" type="number" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">يوم</span>
                                </template>
                            </TextInput>
                        </div>

                        <!-- Delivered Method -->
                        <div>
                            <SelectInput v-model="formData.delivered_method" :items="deliveryMethodItems"
                                label="طريقة التسليم" item-title="title" item-value="value" density="comfortable"
                                placeholder="حدد طريقة التسليم" />
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
            <div class="bg-white rounded-3xl border !border-gray-100">
                <div class="px-6 py-6">
                    <div class="flex items-center gap-2 mb-2">
                        <span v-html="listIcon"></span>
                        <h2 class="text-base font-bold text-primary-600">جدول عناصر عرض السعر</h2>
                    </div>
                    <p class="text-emerald-500 text-sm font-bold ms-7">** الأسعار شاملة للنقل</p>
                </div>

                <!-- Products Table -->
                <DataTable :headers="headers" :items="tableItems" show-actions force-show-edit force-show-delete
                    @edit="handleEditProduct" @delete="handleDeleteProduct">
                    <template #item.notes="{ item }">
                        <v-menu attach="request-material-product-page" location="bottom" offset="8"
                            :close-on-content-click="false" transition="slide-y-transition">
                            <template #activator="{ props }">
                                <div class="flex items-center gap-2 cursor-pointer" v-bind="props">
                                    <v-icon size="20" color="primary" v-html="messagePlusIcon"></v-icon>
                                    <span class="text-gray-900">{{ item.notes || 'أضف ملاحظة' }}</span>
                                </div>
                            </template>

                            <v-card class="pa-4 shadow-[rgba(149,157,165,0.2)_0px_8px_24px] overflow-hidden px-3 py-3"
                                color="white" rounded="lg" width="300">
                                <div class="!flex flex-nowrap items-center gap-3">
                                    <TextInput
                                        v-model="productTableItems[productTableItems.findIndex(p => p.item_id === item.item_id)].notes"
                                        placeholder="أضف ملاحظة" variant="outlined" density="comfortable" hide-details
                                        autofocus class="flex-1" />
                                    <ButtonWithIcon :icon="messagePlusIcon" color="primary" icon-only size="x-small" />
                                </div>
                            </v-card>
                        </v-menu>
                    </template>
                </DataTable>

                <!-- Add Product Button -->
                <div class="flex justify-center my-6">
                    <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold w-75"
                        @click="handleAddProduct">
                        + إضافة منتج جديد
                    </ButtonWithIcon>
                </div>
            </div>

            <!-- Payment and Summary Section -->
            <div class="grid grid-cols-1 xl:grid-cols-3 justify-between gap-4 bg-qallab-dashboard-bg py-5 px-2">
                <div class="bg-white rounded-2xl xl:col-span-2">
                    <div class="flex items-center gap-2 p-6 border-b !border-gray-200">
                        <span v-html="CoinHandIcon"></span>
                        <h2 class="text-base font-bold text-primary-600">بيانات الدفع</h2>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Payment Method -->
                            <SelectInput v-model="formData.payment_method" :items="paymentMethodItems"
                                density="comfortable" placeholder="حدد طريقة الدفع" label="طريقة الدفع" />
                            <!-- Upfront Payment -->
                            <PriceInput showRialIcon v-model="formData.upfront_payment" density="comfortable"
                                label="دفعة مقدمة" placeholder="أدخل قيمة الدفعة" />

                            <!-- Invoice Interval -->
                            <PriceInput label="مدة رفع المستخلص" v-model="formData.invoice_interval"
                                placeholder="أدخل المدة بالأيام" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">يوم</span>
                                </template>
                            </PriceInput>
                            <!-- Payment Term -->
                            <PriceInput label="مدة السداد" v-model="formData.payment_term_no"
                                placeholder="أدخل المدة بالأيام" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">يوم</span>
                                </template>
                            </PriceInput>

                            <!-- Late Fee -->
                            <TextInputWithSelect v-model="formData.late_fee"
                                v-model:selectValue="formData.late_fee_type" label="غرامة التأخير"
                                placeholder="أدخل المبلغ" type="number" select-width="110px"
                                :select-items="feeTypeItems" select-placeholder="اختر" />

                            <!-- Cancel Fee -->
                            <TextInputWithSelect v-model="formData.cancel_fee"
                                v-model:selectValue="formData.cancel_fee_type" label="غرامة الإلغاء"
                                placeholder="أدخل المبلغ" type="number" select-width="110px"
                                :select-items="feeTypeItems" select-placeholder="اختر" />
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl overflow-hidden border !border-gray-200">
                    <table class="w-full">
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
                        <tbody class="text-sm bg-primary-25">
                            <tr class="border-b !border-gray-200">
                                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    المجموع قبل الخصم
                                </td>
                                <td class="py-5 px-4 text-center text-gray-600">
                                    {{ summaryTotals.subtotalBeforeDiscount }}
                                </td>
                            </tr>

                            <tr class="border-b !border-gray-200">
                                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    الخصم
                                </td>
                                <td class="py-5 px-4 text-center text-gray-600">
                                    {{ summaryTotals.totalDiscount }}
                                </td>
                            </tr>

                            <tr class="border-b !border-gray-200">
                                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    المجموع بعد الخصم
                                </td>
                                <td class="py-5 px-4 text-center text-gray-600">
                                    {{ summaryTotals.subtotalAfterDiscount }}
                                </td>
                            </tr>

                            <tr class="border-b !border-gray-200">
                                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    الضريبة
                                </td>
                                <td class="py-5 px-4 text-center text-gray-600">
                                    15%
                                </td>
                            </tr>

                            <tr class="border-b !border-gray-200">
                                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    اجمالي الضريبة
                                </td>
                                <td class="py-5 px-4 text-center text-gray-600">
                                    {{ summaryTotals.totalTaxAmount }}
                                </td>
                            </tr>

                            <tr>
                                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    الإجمالي النهائي
                                </td>
                                <td class="py-5 px-4 font-bold text-center text-gray-900">
                                    {{ summaryTotals.finalTotal }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-3 flex items-center justify-center gap-3">
                <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                    <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                        custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                        label="حفظ والعودة للرئيسية" :loading="isSubmitting" @click="handleSubmit('navigate')" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        label="حفظ وإنشاء جديد" :loading="isSubmitting" @click="handleSubmit('reset')" />
                </div>
            </div>
        </div>

        <!-- Map Dialog for Logistics Locations -->
        <Map v-model="showLogisticsLocationDialog"
            :latitude="String(currentLogisticsIndex !== -1 && logisticsDetails[currentLogisticsIndex] ?
                (currentLogisticsLocationType === 'target' ? (logisticsDetails[currentLogisticsIndex].target_latitude || '') : (logisticsDetails[currentLogisticsIndex].source_latitude || '')) : '')"
            :longitude="String(currentLogisticsIndex !== -1 && logisticsDetails[currentLogisticsIndex] ?
                (currentLogisticsLocationType === 'target' ? (logisticsDetails[currentLogisticsIndex].target_longitude || '') : (logisticsDetails[currentLogisticsIndex].source_longitude || '')) : '')"
            :address="String(currentLogisticsIndex !== -1 && logisticsDetails[currentLogisticsIndex] ?
                (currentLogisticsLocationType === 'target' ? (logisticsDetails[currentLogisticsIndex].target_location || '') : (logisticsDetails[currentLogisticsIndex].source_location || '')) : '')"
            @location-selected="handleLogisticsLocationSelected" />


        <!-- Add Logistics Detail Dialog -->
        <AddLogisticsDetailDialog v-model="showAddLogisticsDialog" :transport-types="transportTypeItems"
            :am-pm-interval-options="amPmIntervalItems" :categories-items="categoriesItems"
            :actual-execution-interval-options="actualExecutionIntervalItems" :edit-detail="editingLogisticsDetail"
            @saved="handleLogisticsDetailSaved" @updated="handleLogisticsDetailUpdated" />

        <!-- Add Product Dialog -->
        <AddProductDialog v-model="showAddProductDialog" request-type="logistics"
            variant="sales"
            :items-query-params="{ material_type: 1 }"
            :transport-types="transportTypeItems" :unit-items="unitItems" :customer-id="formData.customer_id"
            :edit-product="editingProduct" :existing-products="productTableItems" @saved="handleProductSaved"
            @product-updated="handleProductUpdated" />

    </default-layout>
</template>

<style scoped></style>
