<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router';
import AddProductDialog from '@/components/price-offers/AddProductDialog.vue';
import EditSupplyDetailsDialog from '@/components/price-offers/EditSupplyDetailsDialog.vue';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import { useApi } from '@/composables/useApi';
import { fileIcon, mapMarkerIcon, messagePlusIcon, filePlusIcon, busIcon, listIcon, CoinHandIcon, fileCheckIcon } from '@/components/icons/priceOffersIcons';
import { returnIcon, saveIcon } from '@/components/icons/globalIcons';
const api = useApi();
const route = useRoute();
const router = useRouter();
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const isLoading = ref(false);
const isSubmitting = ref(false);

// Query params for creating quotation from request
const fromRequestId = computed(() => route.query.from_request as string | undefined);
const saleRequestsId = computed(() => route.query.sale_requests_id as string | undefined);

const requestTypeItems = ref<any[]>([]);
const paymentMethodItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);
const amPmIntervalItems = ref<any[]>([]);
const feeTypeItems = ref<any[]>([]);
const unitItems = ref<any[]>([]);
const customerItems = ref<any[]>([]);

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/sales/quotations/constants');
        const data = res.data;
        if (data) {
            requestTypeItems.value = data.quotation_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            paymentMethodItems.value = data.payment_methods?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            transportTypeItems.value = data.transport_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            amPmIntervalItems.value = data.am_pm_interval?.map((i: any) => ({ title: i.label, value: i.key })) || [];
            feeTypeItems.value = data.fee_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
        }
    } catch (e) {
        console.error('Error fetching constants:', e);
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

// Helper function to get am/pm interval label
const getAmPmIntervalLabel = (interval: string | null): string => {
    if (!interval) return '';
    const item = amPmIntervalItems.value.find((i: any) => i.value === interval);
    return item?.title || '';
};

// مساعد: اسم الوحدة من unit_id
const getUnitName = (unitId: number | null): string => {
    if (unitId == null) return '';
    const u = unitItems.value.find((i: any) => i.value === unitId || i.value === Number(unitId));
    return u?.title ?? '';
};

// Fetch form data for edit mode (استجابة GET /sales/quotations/building-materials/:uuid)
const fetchFormData = async () => {
    if (!isEditMode.value || !routeId.value) return;

    isLoading.value = true;
    try {
        // useApi().get() يرجع جسم الاستجابة مباشرة؛ الباك قد يرجع { data: { ... } } أو الجذر مباشرة
        const raw = await api.get<any>(`/sales/quotations/building-materials/${routeId.value}`);
        const data = raw?.data != null ? raw.data : raw;

        if (!data) return;

        // تعبئة بيانات النموذج (مطابق لـ respons.json)
        formData.value.customer_id = data.customer_id ?? null;
        formData.value.quotations_datetime = data.quotations_datetime ? String(data.quotations_datetime) : '';
        formData.value.quotation_name = data.quotation_name ?? '';
        formData.value.quotation_validity_no = data.quotation_validity_no ?? null;
        formData.value.project_name = data.project_name ?? '';
        formData.value.quotation_type = data.quotation_type ?? null;
        formData.value.payment_method = data.payment_method ?? null;
        formData.value.upfront_payment = data.upfront_payment ?? null;
        formData.value.invoice_interval = data.invoice_interval ?? null;
        formData.value.payment_term_no = data.payment_term_no ?? null;
        formData.value.late_fee_type = data.late_fee_type ?? null;
        formData.value.late_fee = data.late_fee ?? null;
        formData.value.cancel_fee_type = data.cancel_fee_type ?? null;
        formData.value.cancel_fee = data.cancel_fee ?? null;
        formData.value.target_location = data.target_location ?? null;
        formData.value.target_latitude = data.target_latitude ?? null;
        formData.value.target_longitude = data.target_longitude ?? null;
        formData.value.notes = data.notes ?? '';
        formData.value.status_id = data.status_id ?? null;
        formData.value.code = data.code ? String(data.code) : '';

        // جدول المنتجات: دمج data.items مع data.logistics_product_details (مطابق لكل item_id)
        if (Array.isArray(data.items) && data.items.length > 0) {
            const logisticsByItemId: Record<number, any> = {};
            if (Array.isArray(data.logistics_product_details)) {
                data.logistics_product_details.forEach((log: any) => {
                    const iid = Number(log.item_id);
                    if (!logisticsByItemId[iid]) logisticsByItemId[iid] = log;
                });
            }

            productTableItems.value = data.items.map((item: any) => {
                const itemId = Number(item.item_id);
                const log = logisticsByItemId[itemId];
                const vehicleTypes = log?.transport_type
                    ? (Array.isArray(log.transport_type)
                        ? log.transport_type.map((t: string | number) => Number(t))
                        : [Number(log.transport_type)])
                    : [];
                const transportTypeName = vehicleTypes.length
                    ? vehicleTypes.map((id: number) => getTransportTypeName(id)).filter(Boolean).join(', ')
                    : '';

                return {
                    id: item.id,
                    item_id: itemId,
                    item_name: item.item_name ?? '',
                    unit_id: item.unit_id ?? null,
                    unit_name: item.unit_name ?? getUnitName(item.unit_id),
                    quantity: item.quantity ?? null,
                    unit_price: item.price_per_unit ?? null,
                    discount: item.discount_val ?? null,
                    tax_amount: item.total_tax ?? null,
                    total_amount: item.subtotal_after_tax ?? null,
                    notes: item.note ?? item.notes ?? '',
                    trip_no: log?.number_of_trips ?? null,
                    transport_start_date: log?.trip_start ?? null,
                    vehicle_types: vehicleTypes,
                    transport_type_name: transportTypeName,
                    transport_type: vehicleTypes[0] ?? null,
                    logistics_detail_id: log?.id ?? null,
                };
            });
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
        const res = await api.get<any>(`/sales/building-materials/${fromRequestId.value}`);
        const data = res.data;

        if (data) {
            // Map request fields to quotation form fields
            formData.value.customer_id = data.customer_id != null ? Number(data.customer_id) : null;
            formData.value.project_name = data.project_name || '';
            formData.value.target_location = data.target_location || null;
            formData.value.target_latitude = data.target_latitude || null;
            formData.value.target_longitude = data.target_longitude || null;
            formData.value.payment_method = data.payment_method || null;
            formData.value.upfront_payment = data.upfront_payment || null;
            formData.value.invoice_interval = data.invoice_interval != null ? Number(data.invoice_interval) : null;
            formData.value.payment_term_no = data.payment_term_no != null ? Number(data.payment_term_no) : null;
            formData.value.late_fee_type = data.late_fee_type || null;
            formData.value.late_fee = data.late_fee != null ? Number(data.late_fee) : null;
            formData.value.cancel_fee_type = data.cancel_fee_type || null;
            formData.value.cancel_fee = data.cancel_fee != null ? Number(data.cancel_fee) : null;
            formData.value.notes = data.notes || '';
            
            // Map request_type to quotation_type if available
            if (data.request_type) {
                formData.value.quotation_type = data.request_type;
            }

            // Map products (items) from request to quotation
            if (data.items && Array.isArray(data.items)) {
                const logisticsByItemId: Record<number, any> = {};
                const logisticsList = data.logistics_product_details;
                if (Array.isArray(logisticsList)) {
                    logisticsList.forEach((log: any) => {
                        const iid = Number(log.item_id);
                        if (!logisticsByItemId[iid]) logisticsByItemId[iid] = log;
                    });
                }

                productTableItems.value = data.items.map((item: any) => {
                    const itemId = Number(item.item_id);
                    const log = logisticsByItemId[itemId];
                    const vehicleTypes = log?.transport_type
                        ? Array.isArray(log.transport_type)
                            ? log.transport_type.map((t: string | number) => Number(t))
                            : [Number(log.transport_type)]
                        : [];
                    const transportTypeName = vehicleTypes.length
                        ? vehicleTypes
                            .map((id: number) => getTransportTypeName(id))
                            .filter(Boolean)
                            .join(', ')
                        : '';

                    return {
                        item_id: itemId,
                        item_name: item.item_name || item.item?.name || '',
                        unit_id: item.unit_id ?? null,
                        unit_name: item.unit_name || getUnitName(item.unit_id),
                        quantity: item.quantity ?? null,
                        transport_type: vehicleTypes[0] ?? null,
                        transport_type_name: transportTypeName,
                        trip_no: log?.number_of_trips ?? null,
                        notes: item.note || item.notes || '',
                        unit_price: item.price_per_unit ?? null,
                        discount: item.discount_val ?? null,
                        tax_amount: item.total_tax ?? null,
                        total_amount: item.subtotal_after_tax ?? null,
                        transport_start_date: log?.trip_start ?? null,
                        vehicle_types: vehicleTypes,
                    };
                });
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

    // Fetch form data if in edit mode
    if (isEditMode.value) {
        await fetchFormData();
    } else if (fromRequestId.value) {
        // Fetch request data if creating quotation from request
        await fetchRequestForQuotation();
    }
});

// Interface for product items in the table (sales: unit_price, discount, tax_amount, total_amount)
interface ProductTableItem {
    item_id: number;
    item_name: string;
    unit_id: number | null;
    unit_name: string;
    quantity: number | null;
    transport_type?: number | null;
    transport_type_name?: string;
    vehicle_types?: (string | number)[]; // نوع المركبات (متعدد) لتفاصيل التوريد
    trip_no?: number | null;
    transport_start_date?: string | null;
    notes: string;
    id?: number;
    /** من الباك في وضع التعديل لـ items */
    logistics_detail_id?: number | null;
    isAdded?: boolean;
    unit_price?: number | null;
    discount?: number | null;
    tax_amount?: number | null;
    total_amount?: number | null;
}

interface Supply {
    id?: number;
    from_date: string;
    to_date: string;
    vehicle_types: number[];
    vehicle_types_labels: string;
    am_pm_interval: string;
    am_pm_interval_label: string;
    notes: string;
}

// Form data – أسماء المفاتيح مطابقة لـ request-body.json
const formData = ref({
    requestNumber: '#12520226',
    customer_id: null as number | null,
    quotations_datetime: '' as string,
    quotation_name: '',
    quotation_validity_no: null as number | string | null,
    target_location: null as string | null,
    target_latitude: null as string | null,
    target_longitude: null as string | null,
    project_name: '',
    quotation_type: null as string | null,
    payment_method: null as string | null,
    upfront_payment: null as number | string | null,
    invoice_interval: null as number | string | null,
    payment_term_no: null as number | string | null,
    late_fee_type: null as string | null,
    late_fee: null as number | string | null,
    cancel_fee_type: null as string | null,
    cancel_fee: null as number | string | null,
    notes: '',
    status_id: null as number | null,
    image: null as File | null,
    voice_attachment: null as File | null,
    code: '' as string
});

// Products table items (dynamically populated from dialog)
const productTableItems = ref<ProductTableItem[]>([]);

// Transport service (single item - dynamically populated from dialog)
const Supply = ref<Supply | null>(null);

// Computed: check if transport service exists
const hasSupply = computed(() => Supply.value !== null);

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

const handleAddProduct = () => {
    editingProduct.value = null; // Reset edit mode
    showAddProductDialog.value = true;
};

const handleProductSaved = (products: ProductTableItem[]) => {
    // Merge new products while preserving existing notes
    const newItems: ProductTableItem[] = [];

    products.forEach(p => {
        // Find if this product already exists in the table
        const existing = productTableItems.value.find(existing => existing.item_id === p.item_id);

        newItems.push({
            ...p,
            notes: existing?.notes || p.notes || '' // Preserve existing notes
        });
    });

    productTableItems.value = newItems;
};

const handleEditProduct = (item: any) => {
    // Find the full product data
    const productToEdit = productTableItems.value.find(p => p.item_id === item.item_id);
    if (productToEdit) {
        editingProduct.value = { ...productToEdit, isAdded: true };
        showAddProductDialog.value = true;
    }
};

const handleProductUpdated = (updatedProduct: ProductTableItem) => {
    const index = productTableItems.value.findIndex(p => p.item_id === updatedProduct.item_id);
    if (index !== -1) {
        // Preserve the notes from the table
        const existingNotes = productTableItems.value[index].notes;
        productTableItems.value[index] = {
            ...updatedProduct,
            notes: existingNotes || updatedProduct.notes || ''
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


const handleNewRequest = () => {
    console.log('New Request clicked');
};

import { useForm } from '@/composables/useForm';
import { useNotification as useNotify } from '@/composables/useNotification';

const { formRef, isFormValid, validate } = useForm();
const { success, apiError } = useNotify();

// Format date to DD-MM-YYYY HH:mm:ss
const formatDateTime = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/** تاريخ ووقت الإرسال الحالي بصيغة DD-MM-YYYY HH:mm:ss (يُستخدم تلقائياً في وضع الإضافة) */
const getCurrentDateTimeFormatted = (): string => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const dateIconSvg = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.834 7.50016H0.833984M11.6673 0.833496V4.16683M5.00065 0.833496V4.16683M4.83398 17.5002H11.834C13.2341 17.5002 13.9342 17.5002 14.469 17.2277C14.9394 16.988 15.3218 16.6055 15.5615 16.1351C15.834 15.6004 15.834 14.9003 15.834 13.5002V6.50016C15.834 5.10003 15.834 4.39997 15.5615 3.86519C15.3218 3.39478 14.9394 3.01233 14.469 2.77265C13.9342 2.50016 13.2341 2.50016 11.834 2.50016H4.83398C3.43385 2.50016 2.73379 2.50016 2.19901 2.77265C1.7286 3.01233 1.34615 3.39478 1.10647 3.86519C0.833984 4.39997 0.833984 5.10003 0.833984 6.50016V13.5002C0.833984 14.9003 0.833984 15.6004 1.10647 16.1351C1.34615 16.6055 1.7286 16.988 2.19901 17.2277C2.73379 17.5002 3.43385 17.5002 4.83398 17.5002Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Format date to DD-MM-YYYY
const formatDate = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

// Build FormData for submission (sales API: /sales/quotations/building-materials)
const buildFormData = (): FormData => {
    const fd = new FormData();

    // Edit mode: Laravel method spoofing
    if (isEditMode.value) {
        fd.append('_method', 'PUT');
    }

    // Include sale_requests_id if creating quotation from request
    if (saleRequestsId.value) {
        fd.append('sale_requests_id', saleRequestsId.value);
    }

    // Basic fields (request-body.json)
    fd.append('customer_id', String(formData.value.customer_id || ''));
    fd.append('quotations_datetime', isEditMode.value ? formatDateTime(formData.value.quotations_datetime || new Date()) : getCurrentDateTimeFormatted());
    fd.append('quotation_name', formData.value.quotation_name || '');
    fd.append('quotation_validity_no', String(formData.value.quotation_validity_no ?? '1'));
    fd.append('target_location', formData.value.target_location || '');
    fd.append('target_latitude', String(formData.value.target_latitude || ''));
    fd.append('target_longitude', String(formData.value.target_longitude || ''));
    fd.append('project_name', formData.value.project_name || '');
    fd.append('quotation_type', formData.value.quotation_type || '');
    fd.append('payment_method', formData.value.payment_method || '');
    fd.append('upfront_payment', String(formData.value.upfront_payment ?? ''));
    fd.append('invoice_interval', String(formData.value.invoice_interval ?? '1'));
    fd.append('payment_term_no', String(formData.value.payment_term_no ?? '1'));
    fd.append('late_fee_type', formData.value.late_fee_type || '');
    fd.append('late_fee', String(formData.value.late_fee ?? ''));
    fd.append('cancel_fee_type', formData.value.cancel_fee_type || '');
    fd.append('cancel_fee', String(formData.value.cancel_fee ?? ''));
    fd.append('notes', formData.value.notes || '');

    // Items (products) – items[i][id] only in edit mode
    productTableItems.value.forEach((item, index) => {
        if (isEditMode.value && item.id != null) {
            fd.append(`items[${index}][id]`, String(item.id));
        }
        fd.append(`items[${index}][item_id]`, String(item.item_id));
        fd.append(`items[${index}][unit_id]`, String(item.unit_id || ''));
        fd.append(`items[${index}][quantity]`, String(item.quantity || ''));
        fd.append(`items[${index}][item_using]`, 'heavy_equipment');
        fd.append(`items[${index}][price_per_unit]`, String(item.unit_price ?? ''));
        fd.append(`items[${index}][discount_type]`, '1');
        fd.append(`items[${index}][discount_val]`, String(item.discount ?? ''));
        fd.append(`items[${index}][total_tax]`, String(item.tax_amount ?? ''));
        fd.append(`items[${index}][note]`, item.notes || '');
    });

    // Logistics product details (تفاصيل التوريد) – logistics_product_details[i][id] only in edit mode
    productTableItems.value.forEach((item, index) => {
        if (isEditMode.value && item.logistics_detail_id != null) {
            fd.append(`logistics_product_details[${index}][id]`, String(item.logistics_detail_id));
        }
        fd.append(`logistics_product_details[${index}][item_id]`, String(item.item_id));
        fd.append(`logistics_product_details[${index}][number_of_trips]`, String(item.trip_no ?? ''));
        fd.append(`logistics_product_details[${index}][trip_start]`, item.transport_start_date ? formatDate(item.transport_start_date) : '');
        const vehicleTypes = Array.isArray(item.vehicle_types) ? item.vehicle_types : (item.vehicle_types != null ? [item.vehicle_types] : []);
        vehicleTypes.forEach((type, i) => {
            fd.append(`logistics_product_details[${index}][transport_type][${i}]`, String(type));
        });
    });

    if (formData.value.image) {
        fd.append('image', formData.value.image);
    }

    return fd;
}

const getInitialFormData = () => ({
    requestNumber: '#12520226',
    customer_id: null as number | null,
    quotations_datetime: '' as string,
    quotation_name: '',
    quotation_validity_no: null as number | string | null,
    target_location: null as string | null,
    target_latitude: null as string | null,
    target_longitude: null as string | null,
    project_name: '',
    quotation_type: null as string | null,
    payment_method: null as string | null,
    upfront_payment: null as number | string | null,
    invoice_interval: null as number | string | null,
    payment_term_no: null as number | string | null,
    late_fee_type: null as string | null,
    late_fee: null as number | string | null,
    cancel_fee_type: null as string | null,
    cancel_fee: null as number | string | null,
    notes: '',
    status_id: null as number | null,
    image: null as File | null,
    voice_attachment: null as File | null,
    code: '' as string
});

const resetForm = () => {
    formData.value = getInitialFormData();
    productTableItems.value = [];
    formRef.value?.reset();
};

const handleSubmit = async (afterSuccess?: 'reset' | 'navigate') => {
    if (!await validate()) return;

    if (productTableItems.value.length === 0) {
        warning('يجب إضافة منتج واحد على الأقل');
        return;
    }

    isSubmitting.value = true;

    try {
        const fd = buildFormData();
        const url = isEditMode.value && routeId.value
            ? `/sales/quotations/building-materials/${routeId.value}`
            : '/sales/quotations/building-materials';

        await api.post(url, fd, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        success(isEditMode.value ? 'تم تحديث عرض السعر بنجاح' : 'تم إنشاء عرض السعر بنجاح');

        if (afterSuccess === 'reset') {
            resetForm();
        } else if (afterSuccess === 'navigate') {
            router.push({ name: 'PriceOfferMaterialProductList' });
        }
    } catch (e: any) {
        console.error('Error submitting form:', e);
        apiError(e, 'حدث خطأ أثناء حفظ عرض السعر');
    } finally {
        isSubmitting.value = false;
    }
};

const handleConvertToPrice = () => {
    console.log('Convert to price offer');
};

const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
    formData.value.target_latitude = location.latitude;
    formData.value.target_longitude = location.longitude;
    formData.value.target_location = location.address;

    console.log('Location updated:', location);
};

const showAddSupplyDialog = ref(false);
const editingSupplyProductId = ref<number | null>(null);

const supplyDialogProducts = computed(() =>
    productTableItems.value.map((p) => ({
        item_id: p.item_id,
        item_name: p.item_name,
        quantity: p.quantity,
        unit_name: p.unit_name || '',
        transport_start_date: p.transport_start_date || '',
        trip_no: p.trip_no ?? null,
        vehicle_types: Array.isArray(p.vehicle_types) ? p.vehicle_types : (p.transport_type != null ? [p.transport_type] : []),
    }))
);

const getTransportTypeNameFromIds = (ids: (string | number)[]): string => {
    if (!ids?.length) return '';
    return ids
        .map((id) => transportTypeItems.value.find((i: any) => i.value === id || i.value === Number(id))?.title)
        .filter(Boolean)
        .join(', ');
};

const handleAddSupply = () => {
    editingSupplyProductId.value = null;
    showAddSupplyDialog.value = true;
};

const handleSupplyDetailsSaved = (rows: { item_id: number; transport_start_date: string; trip_no: number | null; vehicle_types: (string | number)[] }[]) => {
    rows.forEach((row) => {
        const product = productTableItems.value.find((p) => p.item_id === row.item_id);
        if (product) {
            product.transport_start_date = row.transport_start_date || null;
            product.trip_no = row.trip_no;
            product.vehicle_types = row.vehicle_types;
            product.transport_type_name = getTransportTypeNameFromIds(row.vehicle_types);
            if (row.vehicle_types?.length) product.transport_type = Number(row.vehicle_types[0]);
        }
    });
    showAddSupplyDialog.value = false;
    editingSupplyProductId.value = null;
};

const handleEditSupply = (row: { item_id?: number; id?: string | number }) => {
    const itemId = row.item_id ?? row.id;
    const product = productTableItems.value.find((p) => p.item_id === itemId || p.item_id === Number(itemId));
    if (product) {
        editingSupplyProductId.value = product.item_id;
        showAddSupplyDialog.value = true;
    }
};


const showMapDialog = ref(false);
const openMapDialog = () => {
    showMapDialog.value = true;
};

const headers = [
    { title: 'اسم المنتج', key: 'name' },
    { title: 'الوحدة', key: 'unit' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'سعر الوحدة', key: 'unit_price' },
    { title: 'خصم', key: 'discount' },
    { title: 'مبلغ الضريبة', key: 'tax_amount' },
    { title: 'إجمالي المبلغ', key: 'total_amount' },
    { title: 'ملاحظات', key: 'notes' },
]

// Helper: compute tax and total for a product row (sales)
// الضريبة ثابتة 15%
const TAX_RATE = 0.15;

// المبلغ قبل الضريبة = الكمية * سعر الوحدة - الخصم
const getSubtotalBeforeTax = (item: ProductTableItem): number => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const disc = Number(item.discount) || 0;
    return qty * price - disc;
};

// مبلغ الضريبة = 15% من (الكمية * سعر الوحدة - الخصم)
const getTaxAmount = (item: ProductTableItem): number => {
    const subtotal = getSubtotalBeforeTax(item);
    return Math.round(subtotal * TAX_RATE * 100) / 100;
};

// إجمالي المبلغ = (الكمية * سعر الوحدة - الخصم) + 15%
const getTotalAmount = (item: ProductTableItem): number => {
    const subtotal = getSubtotalBeforeTax(item);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    return Math.round((subtotal + tax) * 100) / 100;
};

// ملخص المبالغ من جدول المنتجات (للجدول الجانبي)
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

// Computed items for the DataTable (mapped from productTableItems)
const tableItems = computed(() => productTableItems.value.map(item => ({
    id: item.item_id,
    item_id: item.item_id,
    name: item.item_name,
    unit: item.unit_name,
    quantity: item.quantity,
    unit_price: item.unit_price ?? 0,
    discount: item.discount ?? 0,
    tax_amount: item.tax_amount ?? getTaxAmount(item),
    total_amount: item.total_amount ?? getTotalAmount(item),
    notes: item.notes,
})));

// جدول تفاصيل التوريد: يعكس المنتجات المضافة أعلاه (المنتج، الكمية، تاريخ بداية النقل، نوع المركبة، عدد الرحلات)
const ServicesHeaders = [
    { title: 'المنتج', key: 'product_name' },
    { title: 'الكمية', key: 'quantity_display' },
    { title: 'تاريخ بداية النقل', key: 'transport_start_date' },
    { title: 'نوع مركبة النقل', key: 'transport_type_name' },
    { title: 'عدد الرحلات', key: 'trip_no' },
];

// عناصر الجدول مبنية على جدول المنتجات: كل منتج = صف واحد (زر التعديل فقط، بدون حذف)
const serviceTableItems = computed(() =>
    productTableItems.value.map((item) => {
        const qty = item.quantity != null ? String(item.quantity) : '';
        const unit = item.unit_name || '';
        const quantity_display = [qty, unit].filter(Boolean).join(' ');
        return {
            id: item.item_id,
            item_id: item.item_id,
            product_name: item.item_name,
            quantity_display: quantity_display || '—',
            transport_start_date: item.transport_start_date || '—',
            transport_type_name: item.transport_type_name || '—',
            trip_no: item.trip_no != null ? item.trip_no : '—',
            actions: { can_update: true, can_delete: false },
        };
    })
);


</script>

<template>
    <default-layout>
        <div class="request-material-product-page -mx-6 bg-qallab-dashboard-bg space-y-4">
            <!-- Page Header -->
            <TopHeader :icon="filePlusIcon" title-key="pages.PricesOffersMaterialProduct.FormTitle"
                description-key="pages.PricesOffersMaterialProduct.FormDescription" :show-action="false"
                :code="isEditMode ? (formData.code || '') : ''" :code-icon="fileIcon" @action="handleNewRequest" />

            <!-- Request Information Section -->
            <div class="p-6 bg-white rounded-3xl border !border-gray-100 ">
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

                        <!-- quotation_name: اسم عرض السعر -->
                        <div>
                            <TextInput v-model="formData.quotation_name" placeholder="أدخل الإسم"
                                label="اسم عرض السعر" :rules="[required()]" density="comfortable" />
                        </div>

                        <!-- quotations_datetime: تاريخ العرض (في الإضافة يُخفى ويُرسل تلقائياً عند الحفظ، في التعديل عرض فقط) -->
                        <div v-if="isEditMode">
                            <TextInput :model-value="formData.quotations_datetime" type="text" disabled
                                label="تاريخ العرض" density="comfortable" hide-details
                                :input-props="{ readonly: true }">
                                <template #prepend-inner>
                                    <span class="text-gray-500" v-html="dateIconSvg"></span>
                                </template>
                            </TextInput>
                        </div>

                        <!-- quotation_validity_no: تاريخ صلاحية عرض السعر (أيام) -->
                        <div>
                            <TextInput v-model="formData.quotation_validity_no" placeholder="أدخل المدة بالأيام"
                                label="تاريخ صلاحية عرض السعر" :rules="[required(), numeric()]" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">
                                        يوم
                                    </span>
                                </template>
                            </TextInput>
                        </div>


                        <!-- Project Location -->
                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">موقع المشروع</label>
                            <div @click="openMapDialog"
                                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                <span
                                    class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                                    {{ formData.target_location || 'حدد الموقع' }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span v-html="mapMarkerIcon"></span>
                                </div>
                            </div>
                        </div>


                        <!-- project name -->
                        <div>
                            <TextInput v-model="formData.project_name" label="اسم المشروع" placeholder="أدخل الإسم"
                                :rules="[required()]" density="comfortable" />
                        </div>

                        <!-- quotation_type: نوع الطلب -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2"></label>
                            <SelectInput v-model="formData.quotation_type" :items="requestTypeItems" label="نوع الطلب"
                                density="comfortable" placeholder="حدد نوع الطلب" />
                        </div>
                    </div>
                </v-form>
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

                            <!-- Popup content -->
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
                <div class="flex justify-center my-6 ">
                    <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold w-75"
                        @click="handleAddProduct">
                        + إضافة منتج جديد
                    </ButtonWithIcon>
                </div>
            </div>

            <!-- Suppliers details Section -->
            <div class="bg-white rounded-3xl border !border-gray-100">
                <div class="px-6 py-6">
                    <div class="flex items-center gap-2">
                        <span v-html="busIcon"></span>
                        <h2 class="text-base font-bold text-primary-600">تفاصيل التوريد</h2>
                    </div>
                </div>

                <DataTable :headers="ServicesHeaders" :items="serviceTableItems" show-actions force-show-edit
                    @edit="handleEditSupply" />

                <div class="flex justify-center my-6">
                    <ButtonWithIcon
                        color="primary-100"
                        variant="flat"
                        class="!text-primary-900 font-bold w-75"
                        :disabled="productTableItems.length === 0"
                        @click="handleAddSupply"
                    >
                        + تعديل تفاصيل التوريد
                    </ButtonWithIcon>
                </div>
            </div>

            <!-- Attachments and Summary Section -->
            <div class="grid grid-cols-1 xl:grid-cols-3 justify-between gap-4 bg-qallab-dashboard-bg py-5 px-2">
                <div class="bg-white rounded-2xl xl:col-span-2">
                    <div class="flex items-center gap-2 p-6 border-b !border-gray-200">
                        <span v-html="CoinHandIcon"></span>
                        <h2 class="text-base font-bold text-primary-600">بيانات الدفع</h2>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- payment_method: طريقة الدفع -->
                            <SelectInput v-model="formData.payment_method" :items="paymentMethodItems" density="comfortable"
                                placeholder="حدد طريقة الدفع" label="طريقة الدفع" />
                            <!-- upfront_payment: دفعة مقدمة -->
                            <PriceInput showRialIcon v-model="formData.upfront_payment" density="comfortable"
                                label="دفعة مقدمة" placeholder="أدخل قيمة الدفعة" />

                            <!-- invoice_interval: مدة رفع المستخلص -->
                            <PriceInput label="مدة رفع المستخلص" v-model="formData.invoice_interval"
                                placeholder="أدخل المدة بالأيام" :rules="[required(), numeric()]" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">
                                        يوم
                                    </span>
                                </template>
                            </PriceInput>
                            <!-- payment_term_no: مدة السداد -->
                            <PriceInput label="مدة السداد" v-model="formData.payment_term_no"
                                placeholder="أدخل المدة بالأيام" :rules="[required(), numeric()]" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">
                                        يوم
                                    </span>
                                </template>
                            </PriceInput>

                            <!-- late_fee / late_fee_type: غرامة التأخير -->
                            <TextInputWithSelect v-model="formData.late_fee"
                                v-model:selectValue="formData.late_fee_type" label="غرامة التأخير"
                                placeholder="أدخل المبلغ" type="number" :rules="[numeric(), positive()]" select-width="110px"
                                :select-items="feeTypeItems" select-placeholder="اختر" />

                            <!-- cancel_fee / cancel_fee_type: غرامة الإلغاء -->
                            <TextInputWithSelect v-model="formData.cancel_fee"
                                v-model:selectValue="formData.cancel_fee_type" label="غرامة الإلغاء"
                                placeholder="أدخل المبلغ" type="number" :rules="[numeric(), positive()]" select-width="110px"
                                :select-items="feeTypeItems" select-placeholder="اختر" />
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl overflow-hidden border !border-gray-200">
                    <table class="w-full">
                        <!-- Table Header -->
                        <thead>
                            <tr class="bg-primary-400">
                                <th
                                    class="text-white font-semibold text-base py-3 px-4 text-center border-l !border-gray-200">
                                    نوع الخصم
                                </th>
                                <th class="text-white font-semibold text-base py-3 px-4 text-center">
                                    المبلغ
                                </th>
                            </tr>
                        </thead>
                        <!-- Table Body -->
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
                        label="حفظ والعودة للرئيسية"
                        :loading="isSubmitting"
                        @click="handleSubmit('navigate')" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        label="حفظ وإنشاء جديد"
                        :loading="isSubmitting"
                        @click="handleSubmit('reset')" />
                </div>
            </div>

        </div>

        <Map v-model="showMapDialog" :latitude="formData.target_latitude" :longitude="formData.target_longitude"
            :address="formData.target_location" @location-selected="handleLocationSelected" />

        <!-- Add Product Dialog -->
        <AddProductDialog v-model="showAddProductDialog" request-type="raw_materials"
            variant="sales"
            :items-query-params="{ material_type: 1 }"
            :transport-types="transportTypeItems" :unit-items="unitItems" :customer-id="formData.customer_id"
            :edit-product="editingProduct" :existing-products="productTableItems" @saved="handleProductSaved"
            @product-updated="handleProductUpdated" />

        <!-- Edit Supply Details Dialog -->
        <EditSupplyDetailsDialog
            v-model="showAddSupplyDialog"
            :products="supplyDialogProducts"
            :transport-type-items="transportTypeItems"
            :single-product-item-id="editingSupplyProductId"
            @saved="handleSupplyDetailsSaved"
        />
    </default-layout>
</template>

<style scoped></style>
