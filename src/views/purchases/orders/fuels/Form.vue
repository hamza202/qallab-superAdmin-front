<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import AddProductDialogFuels, { type FuelProductToAdd } from '@/components/price-offers/AddProductDialogFuels.vue';
import EditProductsDialog from '@/components/price-offers/EditProductsDialog.vue';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import DateTimePickerInput from '@/components/common/forms/DateTimePickerInput.vue';
import TelInput from '@/components/common/forms/TelInput.vue';
import { useApi } from '@/composables/useApi';
import { useCalculations } from "@/composables/useCalculations";

import {
    fileIcon,
    fileCheckIcon,
    mapMarkerIcon,
    messagePlusIcon,
    filePlusIcon,
    listIcon,
    CoinHandIcon,
    fileQuestionIcon,
} from '@/components/icons/priceOffersIcons';
import {
    returnIcon,
    saveIcon,
    rialIcon,
} from '@/components/icons/globalIcons';
import AppFormBreadcrumb from '@/components/common/AppFormBreadcrumb.vue';

const { t } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isFormDataLoaded = ref(false);
// Check if creating order from quotation
const fromQuotationId = computed(() => route.query.from_quotation as string | undefined);
const fromQuotationCode = computed(() => route.query.quotation_code as string | undefined);
const purchaseQuotationId = computed(() => route.query.purchase_quotation_id as string | undefined);
// Track if data is loaded from quotation (to disable supplier select)
const isFromQuotation = ref(false);

const requestTypeItems = ref<any[]>([]);
const paymentMethodItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);
const amPmIntervalItems = ref<any[]>([]);
const feeTypeItems = ref<any[]>([]);
const unitItems = ref<any[]>([]);
const deliveryMethodItems = ref<any[]>([]);
const supplyTypeItems = ref<any[]>([]);
const fillingsItems = ref<any[]>([]);

const waitForSupplierData = async () => {
    if (!isEditMode.value && !fromQuotationId.value) return;

    if (isFormDataLoaded.value && formData.value.supplier_id) {
        return;
    }

    await new Promise(resolve => {
        const checkInterval = setInterval(() => {
            if (isFormDataLoaded.value && formData.value.supplier_id) {
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

const fetchSuppliers = async (search = '', cursor?: string, perPage = 15) => {
    if (isEditMode.value || fromQuotationId.value) {
        await waitForSupplierData();
    }

    const params: any = { per_page: perPage, business_type: 'fuel_merchant' };
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

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/purchases/constants');
        const data = res.data;
        if (data) {
            requestTypeItems.value = data.request_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            paymentMethodItems.value = data.payment_methods?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            transportTypeItems.value = data.transport_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            amPmIntervalItems.value = data.am_pm_interval?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            const deliveryMethods = data.delivered_methods ?? data.delivery_methods;
            if (deliveryMethods?.length) deliveryMethodItems.value = deliveryMethods.map((i: any) => ({ title: i.label, value: i.key }));
            if (data.supply_types?.length) supplyTypeItems.value = data.supply_types.map((i: any) => ({ title: i.label, value: i.key }));
            if (data.fillings?.length) fillingsItems.value = data.fillings.map((i: any) => ({ title: i.label, value: i.key }));
        }
    } catch (e) {
        console.error('Error fetching constants:', e);
    }
}

/** /purchases/orders/constants – fee_types */
const fetchOrdersConstants = async () => {
    try {
        const res = await api.get<any>('/purchases/orders/constants');
        const data = res.data;
        if (data) {
            feeTypeItems.value = data.fee_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
        }
    } catch (e) {
        console.error('Error fetching orders constants:', e);
    }
};

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

const getFillingName = (key: number | string | null): string => {
    if (key == null || key === '') return '';
    const item = fillingsItems.value.find((i: any) => i.value === key || i.value === Number(key));
    return item?.title || '';
};

// Fetch form data for edit mode
const fetchFormData = async () => {
    if (!isEditMode.value || !routeId.value) return;

    isLoading.value = true;
    try {
        const res = await api.get<any>(`/purchases/orders/fuels/${routeId.value}`);
        const data = res.data;

        if (data) {
            // Populate form data
            formData.value.code = data.code || '';
            formData.value.supplier_id = data.supplier_id;
            // Set flag immediately after supplier_id is populated
            isFormDataLoaded.value = true;
            formData.value.project_name = data.project_name || '';
            formData.value.invoice_interval = data.invoice_interval ?? null;
            formData.value.payment_term_no = data.payment_term_no ?? null;

            formData.value.po_datetime = normalizePoDateTime(
                data.po_datetime || data.request_datetime || ''
            );
            formData.value.paymentMethod = data.payment_method;
            formData.value.advancePayment = data.upfront_payment;
            formData.value.target_location = data.target_location;
            formData.value.target_latitude = data.target_latitude;
            formData.value.target_longitude = data.target_longitude;
            formData.value.source_location = data.source_location ?? null;
            formData.value.source_latitude = data.source_latitude ?? null;
            formData.value.source_longitude = data.source_longitude ?? null;
            formData.value.late_fee_type = data.late_fee_type ?? null;
            formData.value.late_fee = data.late_fee ?? null;
            formData.value.cancel_fee_type = data.cancel_fee_type ?? null;
            formData.value.cancel_fee = data.cancel_fee ?? null;
            formData.value.textNote = data.notes || '';
            formData.value.responsibleName = data.responsible_person || '';
            formData.value.responsiblePhone = data.responsible_phone || '';

            const attached = data.po_attached_logistics_detail || data.logistics_detail || null;
            if (attached) {
                formData.value.transport_start_date = attached.from_date || '';
                formData.value.supplyType = attached.supply_type || null;
                formData.value.supplyDuration = attached.supply_interval ?? null;
                formData.value.deliveryDuration = attached.delivered_interval ?? null;
                formData.value.deliveryMethod = attached.delivered_method ?? null;
                logisticsDetailId.value = attached.id ?? null;
            }

            // Products table
            if (data.items && Array.isArray(data.items)) {
                productTableItems.value = data.items.map((item: any) => {
                    const filling = item.filling ?? item.transport_type;
                    const itemId = Number(item.item_id);
                    if (item.id && itemId) {
                        originalProductIds.value[itemId] = item.id;
                    }
                    return {
                        id: item.id,
                        item_id: itemId,
                        item_name: item.item_name || '',
                        unit_id: item.unit_id ?? null,
                        unit_name: item.unit_name || '',
                        quantity: item.quantity ?? null,
                        transport_type: filling ?? null,
                        transport_type_name: getFillingName(filling) || getTransportTypeName(filling),
                        supply_type: item.supply_type ?? null,
                        supply_type_name: supplyTypeItems.value.find((s: any) => s.value === item.supply_type)?.title || '',
                        trip_no: item.trip_no ?? null,
                        notes: item.notes || '',
                        price_per_unit: item.price_per_unit ?? null,
                        unit_price: item.price_per_unit ?? null,
                        discount_type: item.discount_type ?? null,
                        discount_val: item.discount_val ?? null,
                        discount: item.discount_val ?? null,
                        total_tax: item.total_tax ?? null,
                        subtotal_before_discount: item.subtotal_before_discount ?? null,
                        subtotal_after_discount: item.subtotal_after_discount ?? null,
                        isAdded: true,
                    };
                });
            }


            // Fetch calculations for loaded items
            if (productTableItems.value.length > 0) {
                await fetchCalculations();
            }

        }
    } catch (e) {
        console.error('Error fetching form data:', e);
        isFormDataLoaded.value = true;
    } finally {
        isLoading.value = false;
    }
}

// Helper function to get unit name from id
const getUnitName = (unitId: number | null): string => {
    if (unitId == null) return '';
    const unit = unitItems.value.find((u: any) => u.value === unitId || u.value === Number(unitId));
    return unit?.title || '';
};

// Fetch quotation data and pre-fill form when creating order from quotation
const fetchQuotationForOrder = async () => {
    if (!fromQuotationId.value) return;

    // Set quotation code from query param
    if (fromQuotationCode.value) {
        formData.value.purchase_quotation_code = fromQuotationCode.value as any;
    }

    isLoading.value = true;
    try {
        const res = await api.get<any>(`/purchases/quotations/fuels/${fromQuotationId.value}`);
        const data = res.data;

        if (data) {
            // Mark as loaded from quotation to disable supplier select
            isFromQuotation.value = true;

            // Set quotation code from API response if not already set from query param
            if (data.code && !fromQuotationCode.value) {
                formData.value.purchase_quotation_code = data.code;
            }

            // Map quotation fields to order form fields
            formData.value.supplier_id = data.supplier?.id != null
                ? Number(data.supplier.id)
                : (data.supplier_id != null ? Number(data.supplier_id) : null);
            // Set flag immediately after supplier_id is populated
            isFormDataLoaded.value = true;
            formData.value.project_name = data.project_name || '';
            formData.value.target_location = data.target_location || null;
            formData.value.target_latitude = data.target_latitude || null;
            formData.value.target_longitude = data.target_longitude || null;
            formData.value.source_location = data.source_location || null;
            formData.value.source_latitude = data.source_latitude || null;
            formData.value.source_longitude = data.source_longitude || null;
            formData.value.paymentMethod = data.payment_method || null;
            formData.value.advancePayment = data.upfront_payment || null;
            formData.value.invoice_interval = data.invoice_interval != null ? Number(data.invoice_interval) : null;
            formData.value.payment_term_no = data.payment_term_no != null ? Number(data.payment_term_no) : null;
            formData.value.late_fee_type = data.late_fee_type || null;
            formData.value.late_fee = data.late_fee != null ? Number(data.late_fee) : null;
            formData.value.cancel_fee_type = data.cancel_fee_type || null;
            formData.value.cancel_fee = data.cancel_fee != null ? Number(data.cancel_fee) : null;
            formData.value.textNote = data.notes || '';
            formData.value.responsibleName = data.responsible_person || '';
            formData.value.responsiblePhone = data.responsible_phone || null;

            formData.value.responsibleName = data.responsible_person || '';
            formData.value.responsiblePhone = data.responsible_phone || null;

            formData.value.supplyType = data.supply_type || null;
            formData.value.supplyDuration = data.supply_interval ?? null;
            formData.value.deliveryDuration = data.delivered_interval ?? null;
            formData.value.deliveryMethod = data.delivered_method ?? null;

            // Map products (items) from quotation to order
            if (data.items && Array.isArray(data.items)) {
                productTableItems.value = data.items.map((item: any) => {
                    const itemId = Number(item.item?.id || item.item_id);
                    const unitId = item.unit?.id || item.unit_id;
                    const unitName = item.unit?.name || item.unit_name || getUnitName(unitId);
                    const filling = item.filling ?? item.transport_type;

                    return {
                        item_id: itemId,
                        item_name: item.item?.name || item.item_name || item.name || '',
                        unit_id: unitId ?? null,
                        unit_name: unitName,
                        quantity: item.quantity ?? null,
                        transport_type: filling ?? null,
                        transport_type_name: getFillingName(filling) || getTransportTypeName(filling),
                        supply_type: item.supply_type ?? null,
                        supply_type_name: supplyTypeItems.value.find((s: any) => s.value === item.supply_type)?.title || '',
                        trip_no: item.trip_no ?? null,
                        notes: item.note || item.notes || '',
                        price_per_unit: item.price_per_unit ?? null,
                        unit_price: item.price_per_unit ?? null,
                        discount: item.discount_val ?? null,
                        discount_type: item.discount_type ?? null,
                        discount_val: item.discount_val ?? null,
                        total_tax: null,
                        subtotal_before_discount: null,
                        subtotal_after_discount: null,
                        isAdded: true,
                    };
                });
            }

            // Fetch calculations for loaded items
            if (productTableItems.value.length > 0) {
                await fetchCalculations();
            }

        }
    } catch (e) {
        console.error('Error fetching quotation data:', e);
        isFormDataLoaded.value = true;
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await Promise.all([
        fetchConstants(),
        fetchOrdersConstants(),
        fetchUnits()
    ]);

    // Fetch form data if in edit mode
    if (isEditMode.value) {
        await fetchFormData();
    } else if (fromQuotationId.value) {
        // Fetch quotation data if creating order from quotation
        await fetchQuotationForOrder();
    } else {
        isFormDataLoaded.value = true;
    }
});

// Interface for product items in the table
interface ProductTableItem {
    item_id: number;
    item_name: string;
    unit_id: number | null;
    unit_name: string;
    quantity: number | null;
    transport_type?: number | null;
    transport_type_name?: string;
    supply_type?: string | null;
    supply_type_name?: string;
    trip_no?: number | null;
    notes: string;
    id?: number;
    isAdded?: boolean;
    price_per_unit?: number | null;
    unit_price?: number | null;
    discount?: number | null;
    discount_type?: number | null;
    discount_val?: number | null;
    total_tax?: number | null;
    subtotal_before_discount?: number | null;
    subtotal_after_discount?: number | null;
}

// For tracking logistics_detail id in edit mode
const logisticsDetailId = ref<number | null>(null);
const originalProductIds = ref<Record<number, number>>({});

// Form data (matching JSON payload)
const formData = ref({
    code: '',
    purchase_quotation_code: null as string | null,
    source_location: null as string | null,
    source_latitude: null as string | null,
    source_longitude: null as string | null,
    target_location: null as string | null,
    target_latitude: null as string | null,
    target_longitude: null as string | null,
    supplier_id: null as number | null,
    supplier_name: null,
    po_datetime: '',
    responsibleName: '' as string,
    responsiblePhone: null as string | null,

    // Logistics
    transport_start_date: '',
    supplyType: null as string | null,
    supplyDuration: null as number | string | null,
    deliveryDuration: null as number | string | null,
    deliveryMethod: null as string | null,

    // Payment & Terms
    invoice_interval: null as number | null,
    payment_term_no: null as number | null,
    late_fee_type: null as string | null,
    late_fee: null as number | null,
    cancel_fee_type: null as string | null,
    cancel_fee: null as number | null,
    paymentMethod: null,
    advancePayment: null,
    project_name: '',
    textNote: '',
});

// Products table items (dynamically populated from dialog)
const productTableItems = ref<ProductTableItem[]>([]);

// API-driven calculations via composable
const { vatRate, fetchCalculations: _fetchCalc, summaryTotals } = useCalculations(productTableItems);

const fetchCalculations = async () => {
    const calcItems = await _fetchCalc();
    if (calcItems) {
        productTableItems.value = productTableItems.value.map((item) => {
            const calc = calcItems[String(item.item_id)];
            if (calc) {
                return {
                    ...item,
                    subtotal_before_discount: calc.subtotal_before_discount,
                    discount_amount: calc.discount_amount,
                    subtotal_after_discount: calc.subtotal_after_discount,
                    total_tax: calc.total_tax,
                    item_final: calc.final,
                };
            }
            return item;
        });
    }
};

import { useNotification } from '@/composables/useNotification';
import { required, numeric, positive } from '@/utils/validators';

const { success, warning, apiError } = useNotification();

const showAddProductDialog = ref(false);
const showEditProductsDialog = ref(false);
const editingProduct = ref<ProductTableItem | null>(null);

const handleAddProduct = () => {
    if (!formData.value.supplier_id) {
        warning(t('purchases.shared.forms.common.warnings.selectSupplierFirst'));
        return;
    }
    editingProduct.value = null;
    showAddProductDialog.value = true;
};

const handleProductSaved = async (products: FuelProductToAdd[]) => {
    const newItems: ProductTableItem[] = products.map((p) => {
        const existing = productTableItems.value.find((e) => e.item_id === p.item_id);
        const restoredId = p.id ?? existing?.id ?? originalProductIds.value[p.item_id];
        return {
            ...p,
            transport_type_name:
                getFillingName(p.transport_type) || getTransportTypeName(p.transport_type),
            supply_type_name:
                supplyTypeItems.value.find((s: any) => s.value === p.supply_type)?.title ||
                existing?.supply_type_name ||
                '',
            trip_no: p.trip_no ?? null,
            price_per_unit: p.unit_price ?? p.price_per_unit ?? existing?.price_per_unit ?? null,
            unit_price: p.unit_price ?? p.price_per_unit ?? existing?.unit_price ?? null,
            discount_val: p.discount ?? p.discount_val ?? existing?.discount_val ?? null,
            discount: p.discount ?? p.discount_val ?? existing?.discount ?? null,
            discount_type: p.discount_type ?? existing?.discount_type ?? 1,
            notes: existing?.notes || p.notes || '',
            id: restoredId,
            isAdded: true,
        } as ProductTableItem;
    });
    productTableItems.value = newItems;
    await fetchCalculations();
};

const handleEditProductsBulk = async (updatedProducts: any[]) => {
    productTableItems.value = updatedProducts.map((p: any) => ({
        ...p,
        transport_type_name:
            getFillingName(p.transport_type) || getTransportTypeName(p.transport_type),
        supply_type_name:
            supplyTypeItems.value.find((s: any) => s.value === p.supply_type)?.title ||
            p.supply_type_name ||
            '',
        price_per_unit: p.unit_price ?? p.price_per_unit ?? null,
        discount_val: p.discount ?? p.discount_val ?? null,
        discount: p.discount ?? p.discount_val ?? null,
        id:
            productTableItems.value.find((x) => x.item_id === p.item_id)?.id ??
            originalProductIds.value[p.item_id] ??
            p.id,
    }));
    await fetchCalculations();
};

const handleEditProduct = (item: any) => {
    const productToEdit = productTableItems.value.find(
        (p) => p.item_id === item.item_id,
    );
    if (productToEdit) {
        editingProduct.value = {
            ...productToEdit,
            unit_price: productToEdit.price_per_unit ?? productToEdit.unit_price ?? null,
            discount: productToEdit.discount_val ?? productToEdit.discount ?? null,
            discount_type: productToEdit.discount_type ?? 1,
            isAdded: true,
        } as ProductTableItem;
        showAddProductDialog.value = true;
    }
};

const handleProductUpdated = async (updatedProduct: FuelProductToAdd) => {
    const index = productTableItems.value.findIndex(
        (p) => p.item_id === updatedProduct.item_id,
    );
    if (index !== -1) {
        const existingNotes = productTableItems.value[index].notes;
        const preservedId =
            productTableItems.value[index].id ??
            originalProductIds.value[updatedProduct.item_id] ??
            updatedProduct.id;
        productTableItems.value[index] = {
            ...updatedProduct,
            transport_type_name:
                getFillingName(updatedProduct.transport_type) ||
                getTransportTypeName(updatedProduct.transport_type),
            supply_type_name:
                supplyTypeItems.value.find((s: any) => s.value === updatedProduct.supply_type)?.title || '',
            price_per_unit: updatedProduct.unit_price ?? updatedProduct.price_per_unit ?? null,
            unit_price: updatedProduct.unit_price ?? updatedProduct.price_per_unit ?? null,
            discount_val: updatedProduct.discount ?? updatedProduct.discount_val ?? null,
            discount: updatedProduct.discount ?? updatedProduct.discount_val ?? null,
            discount_type: updatedProduct.discount_type ?? productTableItems.value[index].discount_type ?? 1,
            notes: existingNotes || updatedProduct.notes || '',
            id: preservedId,
        } as ProductTableItem;
    }
    editingProduct.value = null;
    await fetchCalculations();
};

const handleDeleteProduct = async (item: any) => {
    const index = productTableItems.value.findIndex(
        (p) => p.item_id === item.item_id,
    );
    if (index !== -1) {
        productTableItems.value.splice(index, 1);
        await fetchCalculations();
    }
};

import { useForm } from '@/composables/useForm';

const { formRef, isFormValid, validate } = useForm();

const formatDate = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

const formatDateTimeDmy = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const normalizePoDateTime = (value: string): string => {
    if (!value) return '';
    const trimmed = value.trim();
    if (/^\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
        return trimmed;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const [datePart, timePart] = trimmed.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = (timePart || '00:00:00').split(':').map(Number);
        if (year && month && day) {
            const d = new Date(year, month - 1, day, hours || 0, minutes || 0, seconds || 0);
            return formatDateTimeDmy(d);
        }
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
        return formatDateTimeDmy(parsed);
    }
    return trimmed;
};

// Build FormData for submission
const buildFormData = (): FormData => {
    const fd = new FormData();

    // Include purchase_quotation_id if creating order from quotation
    if (purchaseQuotationId.value) {
        fd.append('sale_quotation_id', purchaseQuotationId.value);
    }

    fd.append('po_datetime', normalizePoDateTime(formData.value.po_datetime || ''));
    if (isEditMode.value) {
        fd.append('_method', 'PUT');
    }
    fd.append('supplier_id', String(formData.value.supplier_id || ''));
    fd.append('responsible_person', formData.value.responsibleName || '');
    if (formData.value.responsiblePhone) fd.append('responsible_phone', formData.value.responsiblePhone);

    fd.append('source_location', formData.value.source_location || '');
    fd.append('source_latitude', String(formData.value.source_latitude ?? ''));
    fd.append('source_longitude', String(formData.value.source_longitude ?? ''));
    fd.append('target_location', formData.value.target_location || '');
    fd.append('target_latitude', String(formData.value.target_latitude ?? ''));
    fd.append('target_longitude', String(formData.value.target_longitude ?? ''));
    fd.append('project_name', formData.value.project_name || '');
    fd.append('payment_method', formData.value.paymentMethod || '');
    fd.append('upfront_payment', String(formData.value.advancePayment ?? ''));
    fd.append('invoice_interval', String(formData.value.invoice_interval ?? ''));
    fd.append('payment_term_no', String(formData.value.payment_term_no ?? ''));
    fd.append('late_fee_type', String(formData.value.late_fee_type ?? ''));
    fd.append('late_fee', String(formData.value.late_fee ?? ''));
    fd.append('cancel_fee_type', String(formData.value.cancel_fee_type ?? ''));
    fd.append('cancel_fee', String(formData.value.cancel_fee ?? ''));
    fd.append('notes', formData.value.textNote || '');

    // po_attached_logistics_detail
    if (isEditMode.value && logisticsDetailId.value) {
        fd.append('po_attached_logistics_detail[id]', String(logisticsDetailId.value));
    }
    fd.append('po_attached_logistics_detail[from_date]', formatDate(formData.value.transport_start_date));
    fd.append('po_attached_logistics_detail[supply_type]', formData.value.supplyType || '');
    fd.append('po_attached_logistics_detail[supply_interval]', String(formData.value.supplyDuration ?? ''));
    fd.append('po_attached_logistics_detail[delivered_interval]', String(formData.value.deliveryDuration ?? ''));
    fd.append('po_attached_logistics_detail[delivered_method]', formData.value.deliveryMethod || '');

    // Items
    productTableItems.value.forEach((item, index) => {
        const pricePerUnit = item.price_per_unit ?? item.unit_price ?? 0;
        const discountVal = item.discount_val ?? item.discount ?? 0;
        const taxAmount = item.total_tax ?? getTaxAmount(item);

        if (isEditMode.value && item.id) {
            fd.append(`items[${index}][id]`, String(item.id));
        }
        fd.append(`items[${index}][item_id]`, String(item.item_id));
        fd.append(`items[${index}][unit_id]`, String(item.unit_id || ''));
        fd.append(`items[${index}][quantity]`, String(item.quantity ?? ''));
        fd.append(`items[${index}][price_per_unit]`, String(pricePerUnit));
        fd.append(`items[${index}][discount_type]`, String(item.discount_type ?? 1));
        fd.append(`items[${index}][discount_val]`, String(discountVal));
        fd.append(`items[${index}][total_tax]`, String(taxAmount));
        fd.append(`items[${index}][notes]`, item.notes ?? '');
        if (item.supply_type) {
            fd.append(`items[${index}][supply_type]`, String(item.supply_type));
        }
        if (item.transport_type != null && String(item.transport_type).trim() !== '') {
            fd.append(`items[${index}][filling]`, String(item.transport_type));
        }
    });

    return fd;
}

const resetForm = () => {
    formData.value = {
        code: '',
        purchase_quotation_code: null,
        source_location: null,
        source_latitude: null,
        source_longitude: null,
        target_location: null,
        target_latitude: null,
        target_longitude: null,
        supplier_id: null,
        supplier_name: null,
        po_datetime: '',
        responsibleName: '',
        responsiblePhone: null,
        transport_start_date: '',
        supplyType: null,
        supplyDuration: null,
        deliveryDuration: null,
        deliveryMethod: null,
        invoice_interval: null,
        payment_term_no: null,
        late_fee_type: null,
        late_fee: null,
        cancel_fee_type: null,
        cancel_fee: null,
        paymentMethod: null,
        advancePayment: null,
        project_name: '',
        textNote: '',
    };
    productTableItems.value = [];
    originalProductIds.value = {};
    logisticsDetailId.value = null;
    editingProduct.value = null;
    showAddProductDialog.value = false;
};

const handleSubmit = async (options?: { redirectToList?: boolean }) => {
    if (!await validate()) return;

    if (productTableItems.value.length === 0) {
        warning(t('purchases.shared.forms.common.warnings.atLeastOneProduct'));
        return;
    }

    isSubmitting.value = true;

    try {
        const fd = buildFormData();

        if (isEditMode.value && routeId.value) {
            await api.post(`/purchases/orders/fuels/${routeId.value}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            await api.post('/purchases/orders/fuels', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }

        success(
            isEditMode.value
                ? t('purchases.orders.shared.success.poUpdated')
                : t('purchases.orders.shared.success.poCreated')
        );

        if (options?.redirectToList) {
            router.push({ name: 'OrdersFuelsList' });
        } else {
            resetForm();
            if (isEditMode.value) {
                router.push({ name: 'OrdersFuelsCreate' });
            }
        }

    } catch (e: any) {
        console.error('Error submitting form:', e);
        apiError(e);
    } finally {
        isSubmitting.value = false;
    }
};

const showMapDialog = ref(false);
const mapDialogMode = ref<'target' | 'source'>('target');
const openMapDialog = (mode: 'target' | 'source') => {
    mapDialogMode.value = mode;
    showMapDialog.value = true;
};

const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
    if (mapDialogMode.value === 'source') {
        formData.value.source_latitude = location.latitude;
        formData.value.source_longitude = location.longitude;
        formData.value.source_location = location.address;
    } else {
        formData.value.target_latitude = location.latitude;
        formData.value.target_longitude = location.longitude;
        formData.value.target_location = location.address;
    }
};

const headers = computed(() => [
    { title: t('purchases.shared.forms.common.tableHeaders.productName'), key: 'name' },
    { title: t('purchases.shared.forms.common.tableHeaders.unit'), key: 'unit' },
    { title: t('purchases.shared.forms.common.tableHeaders.quantity'), key: 'quantity' },
    { title: t('purchases.orders.shared.tableHeaders.unitPrice'), key: 'unit_price' },
    { title: t('purchases.orders.shared.tableHeaders.discount'), key: 'discount_display' },
    { title: t('purchases.orders.shared.tableHeaders.taxAmount'), key: 'tax_amount' },
    { title: t('purchases.orders.shared.tableHeaders.totalAmount'), key: 'total_amount' },
    { title: t('purchases.shared.forms.common.tableHeaders.notes'), key: 'notes' },
]);

// Tax rate 15%
const TAX_RATE = 0.15;
const getSubtotalBeforeTax = (item: ProductTableItem): number => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price_per_unit ?? item.unit_price ?? 0) || 0;
    const disc = Number(item.discount_val ?? item.discount ?? 0) || 0;
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

const tableItems = computed(() =>
    productTableItems.value.map((item) => ({
        id: item.item_id,
        item_id: item.item_id,
        name: item.item_name,
        unit: item.unit_name,
        quantity: item.quantity,
        unit_price: item.price_per_unit ?? item.unit_price ?? 0,
        discount: item.discount_val ?? item.discount ?? 0,
        discount_val: item.discount_val ?? item.discount ?? 0,
        discount_type: item.discount_type ?? null,
        tax_amount: item.total_tax ?? getTaxAmount(item),
        total_amount: item.subtotal_after_discount ?? getTotalAmount(item),
        notes: item.notes,
    })),
);

// Summary totals for the side table
// const summaryTotals = computed(() => {
//     const items = productTableItems.value;
//     const subtotalBeforeDiscount = items.reduce((sum, item) => {
//         const qty = Number(item.quantity) || 0;
//         const price = Number(item.price_per_unit ?? item.unit_price) || 0;
//         return sum + qty * price;
//     }, 0);
//     const totalDiscount = items.reduce(
//         (sum, item) => sum + (Number(item.discount_val ?? item.discount) || 0),
//         0,
//     );
//     const subtotalAfterDiscount = Math.round((subtotalBeforeDiscount - totalDiscount) * 100) / 100;
//     const totalTaxAmount = items.reduce(
//         (sum, item) => sum + (item.total_tax ?? getTaxAmount(item)),
//         0,
//     );
//     const finalTotal = Math.round((subtotalAfterDiscount + totalTaxAmount) * 100) / 100;
//     return {
//         subtotalBeforeDiscount: Math.round(subtotalBeforeDiscount * 100) / 100,
//         totalDiscount: Math.round(totalDiscount * 100) / 100,
//         subtotalAfterDiscount,
//         totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
//         finalTotal,
//     };
// });
</script>

<template>
    <default-layout>
        <div class="request-material-product-page -mx-6 bg-qallab-dashboard-bg space-y-4">
            <AppFormBreadcrumb
                list-path="/purchases/orders/fuels/list"
                module-root-key="breadcrumb.purchases.root"
                list-label-key="breadcrumb.purchases.orders.fuels.list"
                create-label-key="breadcrumb.purchases.orders.fuels.create"
                edit-label-key="breadcrumb.purchases.orders.fuels.edit"
                :is-edit-mode="isEditMode"
                :code="isEditMode ? (formData.code ? '#' + formData.code : '') : ''"
            />
            <!-- Page Header -->
            <TopHeader :icon="filePlusIcon" title-key="pages.OrdersFuels.FormTitle"
                :description-key="isEditMode ? 'pages.OrdersFuels.FormDescriptionEdit' : 'pages.OrdersFuels.FormDescriptionCreate'"
                :show-action="false" code-label-key="purchases.orders.shared.labels.purchaseOrderCode"
                :code="isEditMode ? (formData.code ? '#' + formData.code : '') : ''"
                :code-icon="fileIcon" />

            <!-- البيانات الأساسية -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span v-html="fileCheckIcon"></span>
                    <h2 class="text-base font-bold">{{ t('purchases.shared.forms.common.sections.basicInfo') }}</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <!-- تاريخ الطلبية -->
                        <div>
                            <DateTimePickerInput v-model="formData.po_datetime" density="comfortable"
                                :placeholder="t('purchases.shared.forms.common.placeholders.selectDateTime')" :label="t('purchases.orders.shared.labels.poDate')" />
                        </div>

                        <!-- اسم المورد -->
                        <div>
                            <SelectInput v-model="formData.supplier_id" :items="[]" :placeholder="t('purchases.orders.shared.placeholders.selectSupplierPo')"
                                :label="t('purchases.shared.forms.common.labels.supplierName')" :rules="[required()]" density="comfortable" item-title="title"
                                item-value="value" :server-side="true" :fetch-function="fetchSuppliers"
                                item-title-key="full_name" item-value-key="id" :debounce-time="500"
                                :disabled="isFromQuotation" />
                        </div>

                        <!-- اسم المسؤول -->
                        <div>
                            <TextInput v-model="formData.responsibleName" :placeholder="t('purchases.shared.forms.common.placeholders.enterResponsibleName')"
                                :label="t('purchases.shared.forms.common.labels.responsibleName')" density="comfortable" :rules="[required()]" />
                        </div>

                        <!-- هاتف المسؤول -->
                        <div>
                            <TelInput v-model="formData.responsiblePhone" :placeholder="t('purchases.shared.forms.common.placeholders.phoneSample')"
                                :label="t('purchases.shared.forms.common.labels.responsiblePhone')" density="comfortable" :rules="[required()]" />
                        </div>

                        <!-- المشروع -->
                        <div>
                            <TextInput v-model="formData.project_name" :label="t('purchases.orders.shared.labels.project')" :rules="[required()]"
                                density="comfortable" :placeholder="t('purchases.orders.shared.placeholders.enterProjectNameAlt')" />
                        </div>

                        <!-- موقع مصدر المواد -->
                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">{{ t('purchases.requests.logistics.form.labels.sourceMaterialsLocation') }}</label>
                            <div @click="openMapDialog('source')"
                                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                <span
                                    class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {{ formData.source_location || t('purchases.shared.forms.common.pickLocation') }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span v-html="mapMarkerIcon"></span>
                                </div>
                            </div>
                        </div>

                        <!-- موقع المشروع -->
                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">{{ t('purchases.requests.logistics.form.labels.projectLocation') }}</label>
                            <div @click="openMapDialog('target')"
                                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                <span
                                    class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {{ formData.target_location || t('purchases.shared.forms.common.pickLocation') }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span v-html="mapMarkerIcon"></span>
                                </div>
                            </div>
                        </div>

                        <!-- تاريخ بدء التسليم -->
                        <div>
                            <DatePickerInput v-model="formData.transport_start_date" type="date" density="comfortable"
                                :placeholder="t('purchases.shared.forms.common.placeholders.selectDate')" :label="t('purchases.requests.fuels.form.labels.deliveryStartDate')" />
                        </div>

                        <!-- نوع التوريد -->
                        <div>
                            <SelectInput v-model="formData.supplyType" :items="supplyTypeItems" :label="t('purchases.requests.fuels.form.labels.supplyType')"
                                density="comfortable" :placeholder="t('purchases.shared.forms.common.select')" item-title="title" item-value="value" />
                        </div>

                        <!-- مدة التوريد -->
                        <div>
                            <PriceInput :label="t('purchases.requests.fuels.form.labels.supplyDuration')" v-model="formData.supplyDuration"
                                :placeholder="t('purchases.orders.shared.placeholders.enterDurationDays')" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm"> {{ t('purchases.shared.forms.common.day') }} </span>
                                </template>
                            </PriceInput>
                        </div>

                        <!-- مدة التسليم -->
                        <div>
                            <PriceInput :label="t('purchases.requests.fuels.form.labels.deliveryDuration')" v-model="formData.deliveryDuration"
                                :placeholder="t('purchases.orders.shared.placeholders.enterDurationDays')" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm"> {{ t('purchases.shared.forms.common.day') }} </span>
                                </template>
                            </PriceInput>
                        </div>

                        <!-- طريقة التسليم -->
                        <div>
                            <SelectInput v-model="formData.deliveryMethod" :items="deliveryMethodItems"
                                :label="t('purchases.requests.fuels.form.labels.deliveryMethod')" density="comfortable" :placeholder="t('purchases.shared.forms.common.select')" item-title="title"
                                item-value="value" />
                        </div>
                    </div>
                </v-form>
            </div>

            <!-- Products Table -->
            <div class="bg-white rounded-3xl border !border-gray-100">
                <div class="px-6 py-6">
                    <div class="flex items-center gap-2 mb-2">
                        <span v-html="listIcon"></span>
                        <h2 class="text-base font-bold text-primary-600">{{ t('purchases.orders.shared.labels.itemsTableTitle') }}</h2>
                    </div>
                    <p class="text-emerald-500 text-sm font-bold ms-7">{{ t('purchases.orders.shared.labels.pricesIncludeTransport') }}</p>
                </div>

                <DataTable :headers="headers" :items="tableItems" show-actions force-show-edit force-show-delete
                    @edit="handleEditProduct" @delete="handleDeleteProduct">
                    <template #item.discount_display="{ item }">
                        <span v-if="item.discount_val != null && Number(item.discount_val) > 0"
                            class="flex items-center gap-1">
                            {{ item.discount_val }}
                            <span v-if="item.discount_type == 1">%</span>
                            <span v-if="item.discount_type == 2" v-html="rialIcon"></span>
                        </span>
                        <span v-else>—</span>
                    </template>

                    <template #item.notes="{ item }">
                        <div class="flex items-center gap-2">
                            <v-icon size="20" color="primary" v-html="messagePlusIcon" :title="item.notes"></v-icon>
                            <span class="text-gray-900 truncate max-w-[150px]">{{ item.notes || t('purchases.orders.shared.placeholders.noNotesProduct')
                                }}</span>
                        </div>
                    </template>
                </DataTable>

                <div class="flex justify-center gap-3 my-6 mx-auto md:w-3/4">
                    <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold flex-1"
                        @click="handleAddProduct">
                        {{ t('purchases.shared.forms.common.actions.addProduct') }}
                    </ButtonWithIcon>
                    <ButtonWithIcon
                        v-if="productTableItems.length > 0"
                        color="primary-100"
                        variant="flat"
                        class="!text-primary-900 font-bold flex-1"
                        @click="showEditProductsDialog = true"
                    >
                        {{ t('purchases.shared.forms.common.actions.editProducts') }}
                    </ButtonWithIcon>
                </div>
            </div>

            <!-- Payment & Summary Section -->
            <div class="grid grid-cols-1 xl:grid-cols-3 justify-between gap-4 bg-qallab-dashboard-bg py-5 px-2">
                <!-- بيانات الدفع -->
                <div class="bg-white rounded-2xl xl:col-span-2">
                    <div class="flex items-center gap-2 p-6 border-b !border-gray-200">
                        <span v-html="CoinHandIcon"></span>
                        <h2 class="text-base font-bold text-primary-600">{{ t('purchases.orders.shared.labels.paymentData') }}</h2>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectInput v-model="formData.paymentMethod" :items="paymentMethodItems"
                                density="comfortable" :placeholder="t('purchases.shared.forms.common.placeholders.selectPaymentMethod')" :label="t('purchases.shared.forms.common.labels.paymentMethod')" />
                            <PriceInput showRialIcon v-model="formData.advancePayment" density="comfortable"
                                :label="t('purchases.shared.forms.common.labels.advancePayment')" :placeholder="t('purchases.shared.forms.common.placeholders.enterAdvanceAmount')" />

                            <TextInput :label="t('purchases.orders.shared.labels.invoiceUploadDuration')" v-model="formData.invoice_interval"
                                :placeholder="t('purchases.orders.shared.placeholders.enterDurationDays')" :rules="[required(), numeric()]" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm"> {{ t('purchases.shared.forms.common.day') }} </span>
                                </template>
                            </TextInput>
                            <TextInput :label="t('purchases.orders.shared.labels.paymentDuration')" v-model="formData.payment_term_no"
                                :placeholder="t('purchases.orders.shared.placeholders.enterDurationDays')" :rules="[required(), numeric()]" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm"> {{ t('purchases.shared.forms.common.day') }} </span>
                                </template>
                            </TextInput>

                            <!-- غرامة التأخير -->
                            <TextInputWithSelect v-model="formData.late_fee"
                                v-model:selectValue="formData.late_fee_type" :label="t('purchases.orders.shared.labels.lateFee')"
                                :placeholder="t('purchases.orders.shared.placeholders.enterFeeAmount')" type="number" :rules="[numeric(), positive()]"
                                select-width="110px" :select-items="feeTypeItems" :select-placeholder="t('purchases.shared.forms.common.select')" />

                            <!-- غرامة الإلغاء -->
                            <TextInputWithSelect v-model="formData.cancel_fee"
                                v-model:selectValue="formData.cancel_fee_type" :label="t('purchases.orders.shared.labels.cancelFee')"
                                :placeholder="t('purchases.orders.shared.placeholders.enterFeeAmount')" type="number" :rules="[numeric(), positive()]"
                                select-width="110px" :select-items="feeTypeItems" :select-placeholder="t('purchases.shared.forms.common.select')" />
                        </div>
                    </div>
                </div>

                <!-- ملخص الطلب (جدول المبالغ) -->
                <div class="rounded-2xl overflow-hidden border !border-gray-200 bg-primary-25">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-primary-400">
                                <th
                                    class="text-white font-semibold text-base py-3 px-4 text-center border-l !border-gray-200">
                                    {{ t('purchases.orders.shared.labels.summaryItem') }}</th>
                                <th class="text-white font-semibold text-base py-3 px-4 text-center">{{ t('purchases.orders.shared.labels.summaryAmount') }}</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm bg-primary-25">
                            <tr class="border-b !border-gray-200">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.orders.shared.labels.subtotalBeforeDiscount') }}</td>
                                <td class="py-6 px-4 text-center text-gray-600">{{ summaryTotals.subtotalBeforeDiscount
                                    }}</td>
                            </tr>
                            <tr class="border-b !border-gray-200">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.orders.shared.labels.discountRow') }}</td>
                                <td class="py-6 px-4 text-center text-gray-600">{{ summaryTotals.totalDiscount }}</td>
                            </tr>
                            <tr class="border-b !border-gray-200">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.orders.shared.labels.subtotalAfterDiscount') }}</td>
                                <td class="py-6 px-4 text-center text-gray-600">{{ summaryTotals.subtotalAfterDiscount
                                    }}</td>
                            </tr>
                            <tr class="border-b !border-gray-200">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.orders.shared.labels.taxRow') }}</td>
                                <td class="py-6 px-4 text-center text-gray-600">{{ t('purchases.orders.shared.labels.taxPercentDisplay') }}</td>
                            </tr>
                            <tr class="border-b !border-gray-200">
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.orders.shared.labels.totalTaxRow') }}
                                </td>
                                <td class="py-6 px-4 text-center text-gray-600">{{ summaryTotals.totalTaxAmount }}</td>
                            </tr>
                            <tr>
                                <td class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                                    {{ t('purchases.orders.shared.labels.finalTotalRow') }}
                                </td>
                                <td class="py-6 px-4 font-bold text-center text-gray-900">{{ summaryTotals.finalTotal }}
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
                        :label="t('purchases.orders.shared.labels.saveReturnToMain')" :loading="isSubmitting" :disabled="isSubmitting"
                        @click="handleSubmit({ redirectToList: true })" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        :label="t('purchases.orders.shared.labels.saveAndCreateNewPo')" :loading="isSubmitting" :disabled="isSubmitting"
                        @click="handleSubmit({ redirectToList: false })" />
                </div>
            </div>

        </div>

        <!-- Map Dialog -->
        <Map v-model="showMapDialog"
            :latitude="mapDialogMode === 'source' ? formData.source_latitude : formData.target_latitude"
            :longitude="mapDialogMode === 'source' ? formData.source_longitude : formData.target_longitude"
            :address="mapDialogMode === 'source' ? formData.source_location : formData.target_location"
            @location-selected="handleLocationSelected" />

        <!-- إضافة منتجات وقود: material_type=0 + supplier_id على التصنيفات و /items/supplier-items -->
        <AddProductDialogFuels
            v-model="showAddProductDialog"
            :material-type="2"
            :supplier-id="formData.supplier_id"
            items-endpoint="/items/supplier-items"
            show-unit-price-and-discount
            :fillings-options="fillingsItems"
            :unit-items="unitItems"
            :supply-type-options="supplyTypeItems"
            :edit-product="editingProduct"
            :existing-products="productTableItems"
            @saved="handleProductSaved"
            @product-updated="handleProductUpdated"
        />

        <EditProductsDialog
            v-model="showEditProductsDialog"
            request-type="fuel"
            :show-unit-price-and-discount="true"
            :products="productTableItems"
            :transport-types="transportTypeItems"
            :unit-items="unitItems"
            :fillings-items="fillingsItems"
            :supply-type-items="supplyTypeItems"
            @products-updated="handleEditProductsBulk"
        />

    </default-layout>
</template>

<style scoped></style>
