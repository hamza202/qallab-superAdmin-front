<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import AddProductDialog, { type ProductToAdd } from '@/components/price-offers/AddProductDialog.vue';
import EditProductsDialog from '@/components/price-offers/EditProductsDialog.vue';
import AddLogisticsDetailDialog, { type LogisticsDetail } from './components/AddLogisticsDetailDialog.vue';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import DateTimePickerInput from '@/components/common/forms/DateTimePickerInput.vue';
import TelInput from '@/components/common/forms/TelInput.vue';
import { useApi } from '@/composables/useApi';
import { useCalculations, type CalculationItem } from '@/composables/useCalculations';
import { fileIcon, mapMarkerIcon, packageIcon, busIcon, globeIcon, CoinHandIcon, messagePlusIcon } from '@/components/icons/priceOffersIcons';
import { useForm } from '@/composables/useForm';
import { useNotification as useNotify } from '@/composables/useNotification';
import { binIcon, fileCheckIcon, HelpCircleIcon, returnIcon, saveIcon, rialIcon } from "@/components/icons/globalIcons";
import AppFormBreadcrumb from "@/components/common/AppFormBreadcrumb.vue";
import { required, numeric, positive } from '@/utils/validators';


const { formRef, isFormValid, validate } = useForm();
const { success, error, warning } = useNotify();

const { t } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
// Check if creating order from quotation
const fromQuotationId = computed(() => route.query.from_quotation as string | undefined);
const fromQuotationCode = computed(() => route.query.quotation_code as string | undefined);
const purchaseQuotationId = computed(() => route.query.purchase_quotation_id as string | undefined);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isFormDataLoaded = ref(false);
const isFromQuotation = ref(false);

const paymentMethodItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);
const amPmIntervalItems = ref<any[]>([]);
const unitItems = ref<any[]>([]);
const categoriesItems = ref<any[]>([]);
const poTypeItems = ref<any[]>([]);
const feeTypeItems = ref<any[]>([]);
const currencyItems = ref<any[]>([]);
const approvedAmountItems = ref<any[]>([]);


/** Extract validation error messages from API response (data.errors: { "field.key": ["..."] }). */
function getApiErrorDisplayMessage(e: any, fallback: string): string {
  const data = e?.response?.data;
  if (!data || typeof data !== 'object') return fallback;
  const errors = data.errors;
  if (errors && typeof errors === 'object') {
    const messages: string[] = [];
    for (const value of Object.values(errors)) {
      if (Array.isArray(value)) {
        value.forEach((v) => { if (typeof v === 'string') messages.push(v); });
      } else if (typeof value === 'string') {
        messages.push(value);
      }
    }
    if (messages.length > 0) return messages.join(' ');
  }
  return (typeof data.message === 'string' && data.message) ? data.message : fallback;
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
};

const fetchConstants = async () => {
  try {
    const res = await api.get<any>('/purchases/constants');
    const data = res.data;
    if (data) {
      paymentMethodItems.value = data.payment_methods?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      transportTypeItems.value = data.transport_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      amPmIntervalItems.value = data.am_pm_interval?.map((i: any) => ({ title: i.label, value: i.key })) || [];
    }
  } catch (e) {
    console.error('Error fetching constants:', e);
  }
};

const fetchOrdersConstants = async () => {
  try {
    const res = await api.get<any>('/purchases/orders/constants');
    const data = res.data;
    if (data) {
      poTypeItems.value = data.po_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      feeTypeItems.value = data.fee_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      currencyItems.value = data.currencies?.map((i: any) => ({ title: i.label || i.code, value: i.key || i.code })) || [];
      approvedAmountItems.value = data.approved_amounts?.map((i: any) => ({ title: i.label, value: String(i.key) })) || [];
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
};

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

interface ProductTableItem {
  item_id: number;
  item_name: string;
  unit_id: number | null;
  unit_name: string;
  quantity: number | null;
  id?: number | null;
  from_date?: string;
  trip_no?: number | null;
  transport_type?: number | number[] | null;
  transport_type_name?: string;
  notes: string;
  isAdded?: boolean;
}

interface TripTableItem {
  id?: number | null;
  item_id: number;
  item_name: string;
  unit_id: number | null;
  unit_name: string;
  quantity: number | null;
  trip_date: string | null;
  trip_no?: number | null;
  trip_price: number | null;
  sub_total?: number | null;
  discount_val?: number | null;
  discount_type?: number | null;
  quotation_logistics_detail_id?: number | null;
  transport_type: number[];
  transport_type_names?: string;
  notes?: string;
  isAdded?: boolean;
}

const formData = ref({
  supplier_id: null as number | null,
  code: '' as string,
  po_datetime: '' as string,
  responsible_person: '',
  responsible_phone: '',
  project_name: '',
  target_location: null as string | null,
  target_latitude: null as string | null,
  target_longitude: null as string | null,
  source_location: null as string | null,
  source_latitude: null as string | null,
  source_longitude: null as string | null,
  payment_method: null as string | null,
  upfront_payment: null as number | null,
  po_type: 'others' as string,
  invoice_interval: null as number | null,
  payment_term_no: null as number | null,
  late_fee_type: null as string | null,
  late_fee: null as number | null,
  cancel_fee_type: null as string | null,
  cancel_fee: null as number | null,
  purchase_quotation_code: null as string | null,
  approved_amount: null as string | null,
  final_logistics_service_amount: null as number | null,
  final_logistics_trip: null as number | null,
});

const productTableItems = ref<ProductTableItem[]>([]);
const logisticsDetails = ref<LogisticsDetail[]>([]);
const tripTableItems = ref<TripTableItem[]>([]);

const showAddProductDialog = ref(false);
const showEditProductsDialog = ref(false);
const showEditTripsDialog = ref(false);
const editingProduct = ref<ProductToAdd | null>(null);
const productDialogMode = ref<'logistics' | 'logistics-trips'>('logistics');

const originalProductIds = ref<Record<number, number>>({});
const originalTripIds = ref<Record<number, number>>({});

const formatValidationFieldKey = (key: string): string => {
  return key.split('.').map(part => {
    const index = Number(part);
    if (!Number.isNaN(index)) {
      return `#${index + 1}`;
    }
    return part.replace(/_/g, ' ');
  }).join(' › ');
};

// Fetch quotation data and pre-fill form when creating order from quotation
const fetchQuotationForOrder = async () => {
  if (!fromQuotationId.value) return;

  // Set quotation code from query param
  if (fromQuotationCode.value) {
    formData.value.purchase_quotation_code = fromQuotationCode.value;
  }

  isLoading.value = true;

  try {
    const res = await api.get<any>(`/purchases/quotations/logistics/${fromQuotationId.value}`);
    const data = res.data;

    if (data) {
      isFromQuotation.value = true;

      // Map quotation fields to order form fields
      formData.value.supplier_id = data.supplier_id != null ? Number(data.supplier_id) : null;
      // Set flag immediately after supplier_id is populated
      isFormDataLoaded.value = true;
      formData.value.responsible_person = data.responsible_person || '';
      formData.value.responsible_phone = data.responsible_phone || '';
      formData.value.project_name = data.project_name || '';
      formData.value.payment_method = data.payment_method || null;
      formData.value.upfront_payment = data.upfront_payment ?? null;
      formData.value.target_location = data.target_location || null;
      formData.value.target_latitude = data.target_latitude ?? null;
      formData.value.target_longitude = data.target_longitude ?? null;
      formData.value.source_location = data.source_location || null;
      formData.value.source_latitude = data.source_latitude ?? null;
      formData.value.source_longitude = data.source_longitude ?? null;
      formData.value.invoice_interval = data.invoice_interval ?? null;
      formData.value.payment_term_no = data.payment_term_no ?? null;
      formData.value.late_fee_type = data.late_fee_type || null;
      formData.value.late_fee = data.late_fee ?? null;
      formData.value.cancel_fee_type = data.cancel_fee_type || null;
      formData.value.cancel_fee = data.cancel_fee ?? null;
      formData.value.approved_amount = data.approved_amount != null ? String(data.approved_amount) : null;
      formData.value.final_logistics_service_amount = data.final_logistics_service_amount != null ? Number(data.final_logistics_service_amount) : null;
      formData.value.final_logistics_trip = data.final_logistics_trip != null ? Number(data.final_logistics_trip) : null;
      formData.value.final_logistics_service_amount = data.final_logistics_service_amount != null ? Number(data.final_logistics_service_amount) : null;
      formData.value.final_logistics_trip = data.final_logistics_trip != null ? Number(data.final_logistics_trip) : null;

      const mapToNumberArray = (value: any): number[] => {
        if (Array.isArray(value)) return value.map((v: any) => Number(v));
        if (value != null && value !== '') return [Number(value)];
        return [];
      };

      // Map logistics details from quotation
      if (Array.isArray(data.quotation_logistics_details)) {
        logisticsDetails.value = data.quotation_logistics_details.map((d: any) => ({
          id: null,
          material_type: mapToNumberArray(d.material_type),
          trip_no: d.trip_no != null ? Number(d.trip_no) : null,
          actual_execution_interval: d.actual_execution_interval != null ? Number(d.actual_execution_interval) : null,
          am_pm_interval: d.am_pm_interval || '',
          from_date: d.from_date || '',
          to_date: d.to_date || '',
          transport_type: mapToNumberArray(d.transport_type),
          transport_no: d.transport_no != null ? Number(d.transport_no) : null,
          loading_responsible_party: d.loading_responsible_party || '',
          downloading_responsible_party: d.downloading_responsible_party || '',
          target_location: d.target_location || '',
          target_latitude: d.target_latitude ?? '',
          target_longitude: d.target_longitude ?? '',
          source_location: d.source_location || '',
          source_latitude: d.source_latitude ?? '',
          source_longitude: d.source_longitude ?? '',
          transport_amount: d.transport_amount != null ? Number(d.transport_amount) : null,
          discount_val: d.discount_val != null ? Number(d.discount_val) : null,
          discount_type: d.discount_type != null ? Number(d.discount_type) : null,
        }));
      }

      // Map products from quotation
      if (Array.isArray(data.quotation_product_details)) {
        productTableItems.value = data.quotation_product_details.map((item: any) => {
          const itemId = Number(item.item_id ?? item.item?.id);
          const unitId = item.unit_id ?? item.unit?.id ?? null;
          const transportType = item.transport_type != null ? Number(item.transport_type) : null;

          return {
            id: null,
            item_id: itemId,
            item_name: item.item_name || item.item?.name || '',
            unit_id: unitId,
            unit_name: item.unit_name || item.unit?.name,
            quantity: item.quantity != null ? Number(item.quantity) : null,
            from_date: item.from_date || null,
            trip_no: item.trip_no != null ? Number(item.trip_no) : null,
            transport_type: transportType,
            transport_type_name: transportType != null ? getTransportTypeName(transportType) : '',
            notes: item.notes ?? '',
          };
        });
      }

      // Map trip details from quotation
      if (Array.isArray(data.quotation_trip_details) && data.quotation_trip_details.length > 0) {
        tripTableItems.value = data.quotation_trip_details.map((t: any) => {
          const transportTypes = mapToNumberArray(t.transport_type);
          return {
            id: null,
            item_id: Number(t.item_id),
            item_name: t.item_name || '',
            unit_id: Number(t.unit_id),
            unit_name: t.unit_name || '',
            quantity: t.quantity != null ? Number(t.quantity) : null,
            trip_date: t.trip_date || null,
            trip_no: t.trip_no != null ? Number(t.trip_no) : null,
            trip_price: t.trip_price != null ? Number(t.trip_price) : null,
            sub_total: t.sub_total != null ? Number(t.sub_total) : null,
            discount_val: t.discount_val != null ? Number(t.discount_val) : null,
            discount_type: t.discount_type != null ? Number(t.discount_type) : null,
            quotation_logistics_detail_id: t.quotation_logistics_detail_id != null ? Number(t.quotation_logistics_detail_id) : null,
            transport_type: transportTypes,
            transport_type_names: getTransportTypeNames(transportTypes),
            notes: t.notes ?? '',
          } as TripTableItem;
        });
      } else {
        // Derive from products if no trip details
        tripTableItems.value = productTableItems.value.map(p => ({
          item_id: p.item_id,
          item_name: p.item_name,
          unit_id: p.unit_id,
          unit_name: p.unit_name,
          quantity: p.quantity,
          trip_date: (p as any).from_date ?? null,
          trip_price: null,
          transport_type: (p as any).transport_type != null ? [(p as any).transport_type as number] : [],
          transport_type_names: (p as any).transport_type_name ?? '',
          notes: (p as any).notes ?? '',
        }));
      }
    }
  } catch (e: any) {
    console.error('Error fetching quotation data:', e);
    error(getApiErrorDisplayMessage(e, t('purchases.orders.shared.warnings.loadQuotationError')));
    isFormDataLoaded.value = true;
  } finally {
    isLoading.value = false;
  }
};

const fetchFormData = async () => {
  if (!isEditMode.value || !routeId.value) return;
  isLoading.value = true;
  try {
    const res = await api.get<any>(`/purchases/orders/logistics/${routeId.value}`);
    const data = res.data;
    if (data) {
      formData.value.supplier_id = data.supplier_id != null ? Number(data.supplier_id) : null;
      // Set flag immediately after supplier_id is populated
      isFormDataLoaded.value = true;
      formData.value.po_datetime = data.po_datetime ? String(data.po_datetime) : '';
      formData.value.responsible_person = data.responsible_person || '';
      formData.value.responsible_phone = data.responsible_phone || '';
      formData.value.project_name = data.project_name || '';
      formData.value.payment_method = data.payment_method || null;
      formData.value.upfront_payment = data.upfront_payment ?? null;
      formData.value.target_location = data.target_location || null;
      formData.value.target_latitude = data.target_latitude ?? null;
      formData.value.target_longitude = data.target_longitude ?? null;
      formData.value.source_location = data.source_location || null;
      formData.value.source_latitude = data.source_latitude ?? null;
      formData.value.source_longitude = data.source_longitude ?? null;
      formData.value.code = data.code ? String(data.code) : '';
      formData.value.invoice_interval = data.invoice_interval ?? null;
      formData.value.payment_term_no = data.payment_term_no ?? null;
      formData.value.late_fee_type = data.late_fee_type || null;
      formData.value.late_fee = data.late_fee ?? null;
      formData.value.cancel_fee_type = data.cancel_fee_type || null;
      formData.value.cancel_fee = data.cancel_fee ?? null;
      formData.value.approved_amount = data.approved_amount != null ? String(data.approved_amount) : null;

      if (data.po_logistics_details && Array.isArray(data.po_logistics_details)) {
        logisticsDetails.value = data.po_logistics_details.map((d: any) => ({
          id: d.id,
          material_type: Array.isArray(d.material_type) ? d.material_type.map(Number) : (d.material_type != null ? [Number(d.material_type)] : []),
          trip_no: d.trip_no ?? null,
          actual_execution_interval: d.actual_execution_interval ?? null,
          am_pm_interval: d.am_pm_interval || '',
          from_date: d.from_date || '',
          to_date: d.to_date || '',
          transport_type: Array.isArray(d.transport_type) ? d.transport_type.map(Number) : (d.transport_type != null ? [Number(d.transport_type)] : []),
          transport_no: d.transport_no ?? null,
          loading_responsible_party: d.loading_responsible_party || '',
          downloading_responsible_party: d.downloading_responsible_party || '',
          target_location: d.target_location || '',
          target_latitude: d.target_latitude ?? '',
          target_longitude: d.target_longitude ?? '',
          source_location: d.source_location || '',
          source_latitude: d.source_latitude ?? '',
          source_longitude: d.source_longitude ?? '',
          transport_amount: d.transport_amount ?? null,
          discount_val: d.discount_val != null ? Number(d.discount_val) : null,
          discount_type: d.discount_type != null ? Number(d.discount_type) : null,
        }));
      }
      if (data.po_product_details && Array.isArray(data.po_product_details)) {
        productTableItems.value = data.po_product_details.map((item: any) => {
          const itemId = Number(item.item_id);
          if (item.id && itemId) {
            originalProductIds.value[itemId] = item.id;
          }
          return {
            id: item.id,
            item_id: itemId,
            item_name: item.item_name || '',
            unit_id: item.unit_id,
            unit_name: item.unit_name || '',
            quantity: item.quantity,
            from_date: item.from_date,
            trip_no: item.trip_no,
            transport_type: item.transport_type,
            transport_type_name: item.transport_type_label,
            notes: item.notes ?? '',
          };
        });
      }
      if (data.po_trip_details && Array.isArray(data.po_trip_details) && data.po_trip_details.length > 0) {
        tripTableItems.value = data.po_trip_details.map((t: any) => {
          const transportTypes = Array.isArray(t.transport_type) ? t.transport_type.map(Number) : (t.transport_type != null ? [Number(t.transport_type)] : []);
          const tripItemId = Number(t.item_id);
          if (t.id && tripItemId) {
            originalTripIds.value[tripItemId] = t.id;
          }
          return {
            id: t.id,
            item_id: tripItemId,
            item_name: t.item_name || '',
            unit_id: t.unit_id,
            unit_name: t.unit_name || '',
            quantity: t.quantity,
            trip_date: t.trip_date || null,
            trip_no: t.trip_no != null ? Number(t.trip_no) : null,
            trip_price: t.trip_price ?? null,
            sub_total: t.sub_total != null ? Number(t.sub_total) : null,
            discount_val: t.discount_val != null ? Number(t.discount_val) : null,
            discount_type: t.discount_type != null ? Number(t.discount_type) : null,
            quotation_logistics_detail_id: t.quotation_logistics_detail_id != null ? Number(t.quotation_logistics_detail_id) : null,
            transport_type: transportTypes,
            transport_type_names: getTransportTypeNames(transportTypes),
            notes: t.notes ?? '',
          } as TripTableItem;
        });
      } else if (!data.po_trip_details || data.po_trip_details.length === 0) {
        // Derive from products
        tripTableItems.value = productTableItems.value.map(p => ({
          item_id: p.item_id,
          item_name: p.item_name,
          unit_id: p.unit_id,
          unit_name: p.unit_name,
          quantity: p.quantity,
          trip_date: (p as any).from_date ?? null,
          trip_price: null,
          transport_type: (p as any).transport_type != null ? [(p as any).transport_type as number] : [],
          transport_type_names: (p as any).transport_type_name ?? '',
          notes: (p as any).notes ?? '',
        }));
      }
    }
  } catch (e: any) {
    console.error('Error fetching form data:', e);
    error(getApiErrorDisplayMessage(e, t('purchases.orders.shared.warnings.loadDataError')));
    isFormDataLoaded.value = true;
  } finally {
    isLoading.value = false;
  }
};

const handleAddProduct = () => {
  editingProduct.value = null;
  productDialogMode.value = 'logistics';
  showAddProductDialog.value = true;
};

// Helper function to get transport type name from id
const getTransportTypeName = (transportTypeId: number | string | null): string => {
  if (!transportTypeId) return '';
  const id = Number(transportTypeId);
  const item = transportTypeItems.value.find((i: any) => i.value === id);
  return item?.title || '';
};

const handleProductSaved = async (products: any[]) => {
  if (productDialogMode.value === 'logistics-trips') {
    const newTripItems: TripTableItem[] = [];
    products.forEach(p => {
      const existingTrip = tripTableItems.value.find(e => e.item_id === p.item_id);
      const restoredTripId =
        p.id ?? existingTrip?.id ?? originalTripIds.value[p.item_id];
      newTripItems.push({
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        trip_date: p.trip_date ?? null,
        trip_no: p.trip_no ?? null,
        trip_price: p.trip_price ?? null,
        transport_type: Array.isArray(p.transport_type) ? p.transport_type : (p.transport_type != null ? [p.transport_type] : []),
        transport_type_names: p.transport_type_names ?? '',
        discount_val: p.discount ?? null,
        discount_type: p.discount_type ?? null,
        notes: p.notes || '',
        isAdded: p.isAdded,
        id: restoredTripId,
        quotation_logistics_detail_id: existingTrip?.quotation_logistics_detail_id ?? p.quotation_logistics_detail_id ?? null,
      });
    });
    for (let i = 0; i < newTripItems.length; i++) {
      newTripItems[i].sub_total = await calculateTripItemSubTotal(newTripItems[i]);
    }
    tripTableItems.value = newTripItems;
  } else {
    const newItems: ProductTableItem[] = [];
    const newTripItems: TripTableItem[] = [];
    products.forEach(p => {
      const existing = productTableItems.value.find(e => e.item_id === p.item_id);
      const restoredId = p.id ?? existing?.id ?? originalProductIds.value[p.item_id];
      newItems.push({
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        id: restoredId,
        from_date: p.from_date,
        trip_no: p.trip_no,
        transport_type: p.transport_type,
        transport_type_name: getTransportTypeName(p.transport_type),
        notes: existing?.notes || p.notes || '',
        isAdded: p.isAdded,
      });

      const existingTrip = tripTableItems.value.find(e => e.item_id === p.item_id);
      if (existingTrip) {
        newTripItems.push({
          ...existingTrip,
          item_name: p.item_name,
          unit_id: p.unit_id,
          unit_name: p.unit_name,
          quantity: p.quantity,
          id: existingTrip.id ?? originalTripIds.value[p.item_id],
        });
      } else {
        const transportArr = p.transport_type != null ? [p.transport_type as number] : [];
        newTripItems.push({
          item_id: p.item_id,
          item_name: p.item_name,
          unit_id: p.unit_id,
          unit_name: p.unit_name,
          quantity: p.quantity,
          trip_date: p.from_date ?? null,
          trip_no: p.trip_no ?? null,
          trip_price: null,
          transport_type: transportArr,
          transport_type_names: getTransportTypeNames(transportArr),
          notes: '',
          id: originalTripIds.value[p.item_id],
        });
      }
    });
    productTableItems.value = newItems;
    tripTableItems.value = newTripItems;
  }
};

const handleEditProductsBulk = (updatedProducts: any[]) => {
  const newItems: ProductTableItem[] = updatedProducts.map((p: any) => {
    const tt = p.transport_type;
    const single = Array.isArray(tt) ? tt[0] : tt;
    return {
      item_id: p.item_id,
      item_name: p.item_name,
      unit_id: p.unit_id,
      unit_name: p.unit_name ?? '',
      quantity: p.quantity,
      from_date: p.from_date ?? '',
      trip_no: p.trip_no ?? null,
      transport_type: single ?? null,
      transport_type_name: getTransportTypeName(single),
      notes: p.notes ?? '',
      id:
        productTableItems.value.find((x) => x.item_id === p.item_id)?.id
        ?? originalProductIds.value[p.item_id]
        ?? p.id,
      isAdded: true,
    };
  });
  productTableItems.value = newItems;

  const newTripItems: TripTableItem[] = [];
  newItems.forEach((p) => {
    const existingTrip = tripTableItems.value.find((e) => e.item_id === p.item_id);
    if (existingTrip) {
      newTripItems.push({
        ...existingTrip,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        trip_no: p.trip_no ?? existingTrip.trip_no ?? null,
        trip_date: (p.from_date as string | null) ?? existingTrip.trip_date ?? null,
      });
    } else {
      const transportArr = p.transport_type != null ? [p.transport_type as number] : [];
      newTripItems.push({
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        trip_date: (p.from_date as string | null) ?? null,
        trip_no: p.trip_no ?? null,
        trip_price: null,
        transport_type: transportArr,
        transport_type_names: getTransportTypeNames(transportArr),
        notes: '',
        id: originalTripIds.value[p.item_id],
        quotation_logistics_detail_id: null,
      });
    }
  });
  tripTableItems.value = newTripItems;
};

const handleEditTripsBulk = async (updatedProducts: any[]) => {
  const newTripItems: TripTableItem[] = [];
  for (const p of updatedProducts) {
    const transportTypes = Array.isArray(p.transport_type)
      ? p.transport_type
      : (p.transport_type != null ? [p.transport_type] : []);
    const existingTrip = tripTableItems.value.find((e) => e.item_id === p.item_id);
    const trip: TripTableItem = {
      item_id: p.item_id,
      item_name: p.item_name,
      unit_id: p.unit_id,
      unit_name: p.unit_name,
      quantity: p.quantity,
      trip_date: p.trip_date ?? null,
      trip_no: p.trip_no ?? null,
      trip_price: p.trip_price ?? null,
      transport_type: transportTypes,
      transport_type_names: p.transport_type_names ?? getTransportTypeNames(transportTypes),
      discount_val: p.discount ?? null,
      discount_type: p.discount_type ?? null,
      notes: p.notes || '',
      isAdded: p.isAdded,
      id: existingTrip?.id ?? originalTripIds.value[p.item_id] ?? p.id,
      quotation_logistics_detail_id: existingTrip?.quotation_logistics_detail_id ?? p.quotation_logistics_detail_id ?? null,
    };
    trip.sub_total = await calculateTripItemSubTotal(trip);
    newTripItems.push(trip);
  }
  tripTableItems.value = newTripItems;

  newTripItems.forEach((t) => {
    const pi = productTableItems.value.findIndex((pr) => pr.item_id === t.item_id);
    if (pi !== -1) {
      productTableItems.value[pi].quantity = t.quantity;
      productTableItems.value[pi].unit_id = t.unit_id;
      productTableItems.value[pi].unit_name = t.unit_name;
      productTableItems.value[pi].trip_no = t.trip_no ?? null;
    }
  });
};

const handleEditProduct = (item: any) => {
  const productToEdit = productTableItems.value.find(px => px.item_id === item.item_id);
  if (productToEdit) {
    editingProduct.value = { ...productToEdit, isAdded: true, discount_type: (productToEdit as any).discount_type ?? 2 } as any;
    productDialogMode.value = 'logistics';
    showAddProductDialog.value = true;
  }
};

const handleEditTrip = (item: any) => {
  const tripToEdit = tripTableItems.value.find(t => t.item_id === item.item_id);
  if (tripToEdit) {
    editingProduct.value = {
      ...tripToEdit,
      isAdded: true,
      discount: tripToEdit.discount_val ?? null,
      discount_type: tripToEdit.discount_type ?? 2,
    } as unknown as ProductToAdd;
    productDialogMode.value = 'logistics-trips';
    showAddProductDialog.value = true;
  }
};

const calculateTripItemSubTotal = async (tripItem: TripTableItem) => {
  const calcItems = ref<CalculationItem[]>([{
    item_id: tripItem.item_id,
    quantity: tripItem.trip_no ? Number(tripItem.trip_no) : 0,
    price_per_unit: tripItem.trip_price ? Number(tripItem.trip_price) : 0,
    discount_type: tripItem.discount_type ?? 1,
    discount_val: tripItem.discount_val ? Number(tripItem.discount_val) : 0,
  }]);

  const { fetchCalculations } = useCalculations(calcItems);
  const results = await fetchCalculations();
  if (results) {
    const itemResult = Object.values(results)[0];
    if (itemResult) {
      return itemResult.subtotal_after_discount;
    }
  }
  return Number(tripItem.trip_no ?? 0) * Number(tripItem.trip_price ?? 0);
};

const handleProductUpdated = async (updatedProduct: any) => {
  if (productDialogMode.value === 'logistics-trips') {
    const index = tripTableItems.value.findIndex(t => t.item_id === updatedProduct.item_id);
    if (index !== -1) {
      const prevTrip = tripTableItems.value[index];
      const preservedTripId =
        prevTrip.id ?? originalTripIds.value[updatedProduct.item_id] ?? updatedProduct.id;
      tripTableItems.value[index] = {
        item_id: updatedProduct.item_id,
        item_name: updatedProduct.item_name,
        unit_id: updatedProduct.unit_id,
        unit_name: updatedProduct.unit_name,
        quantity: updatedProduct.quantity,
        trip_date: updatedProduct.trip_date ?? null,
        trip_no: updatedProduct.trip_no ?? null,
        trip_price: updatedProduct.trip_price ?? null,
        transport_type: Array.isArray(updatedProduct.transport_type) ? updatedProduct.transport_type : (updatedProduct.transport_type != null ? [updatedProduct.transport_type] : []),
        transport_type_names: updatedProduct.transport_type_names ?? '',
        discount_val: updatedProduct.discount ?? null,
        discount_type: updatedProduct.discount_type ?? null,
        notes: updatedProduct.notes || '',
        isAdded: updatedProduct.isAdded,
        id: preservedTripId,
        quotation_logistics_detail_id: prevTrip.quotation_logistics_detail_id ?? updatedProduct.quotation_logistics_detail_id ?? null,
      };
      tripTableItems.value[index].sub_total = await calculateTripItemSubTotal(tripTableItems.value[index]);
      // Sync quantity back to product table
      const productIndex = productTableItems.value.findIndex(p => p.item_id === updatedProduct.item_id);
      if (productIndex !== -1) {
        productTableItems.value[productIndex].quantity = updatedProduct.quantity;
        productTableItems.value[productIndex].unit_id = updatedProduct.unit_id;
        productTableItems.value[productIndex].unit_name = updatedProduct.unit_name;
        productTableItems.value[productIndex].trip_no = updatedProduct.trip_no ?? null;
      }
    }
  } else {
    const index = productTableItems.value.findIndex(p => p.item_id === updatedProduct.item_id);
    if (index !== -1) {
      const existingNotes = productTableItems.value[index].notes;
      const prevRow = productTableItems.value[index];
      const preservedId =
        prevRow.id ?? originalProductIds.value[updatedProduct.item_id] ?? updatedProduct.id;
      productTableItems.value[index] = {
        item_id: updatedProduct.item_id,
        item_name: updatedProduct.item_name,
        unit_id: updatedProduct.unit_id,
        unit_name: updatedProduct.unit_name,
        quantity: updatedProduct.quantity,
        notes: existingNotes || updatedProduct.notes || '',
        id: preservedId,
        from_date: updatedProduct.from_date,
        trip_no: updatedProduct.trip_no,
        transport_type: updatedProduct.transport_type,
        transport_type_name: getTransportTypeName(updatedProduct.transport_type),
      };
      // Sync to trip table
      const tripIndex = tripTableItems.value.findIndex(t => t.item_id === updatedProduct.item_id);
      if (tripIndex !== -1) {
        tripTableItems.value[tripIndex].quantity = updatedProduct.quantity;
        tripTableItems.value[tripIndex].unit_id = updatedProduct.unit_id;
        tripTableItems.value[tripIndex].unit_name = updatedProduct.unit_name;
      }
    }
  }
  editingProduct.value = null;
};

const handleDeleteProduct = (item: any) => {
  productTableItems.value = productTableItems.value.filter(p => p.item_id !== item.item_id);
  tripTableItems.value = tripTableItems.value.filter(t => t.item_id !== item.item_id);
};

const handleNewRequest = () => {
  router.push({ name: 'OrdersLogisticsCreate' });
};

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
  if (editingLogisticsIndex.value >= 0) {
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

const handleDeleteLogisticsDetail = (_item: any, index: number) => {
  logisticsDetails.value.splice(index, 1);
};

const getCategoriesNames = (categories: number[]): string => {
  if (!categories || categories.length === 0) return '';
  return categories.map(categoryId => {
    const item = categoriesItems.value.find((i: any) => i.value === categoryId);
    return item?.title || '';
  }).filter(Boolean).join(', ');
};

const getTransportTypeNames = (transportTypes: number[]): string => {
  if (!transportTypes || transportTypes.length === 0) return '';
  return transportTypes.map(typeId => {
    const item = transportTypeItems.value.find((i: any) => i.value === typeId);
    return item?.title || '';
  }).filter(Boolean).join(', ');
};

const currentLogisticsIndex = ref<number>(-1);
const currentLogisticsLocationType = ref<'source' | 'target'>('source');
const showLogisticsLocationDialog = ref(false);

const openLogisticsLocationDialog = (index: number, type: 'source' | 'target') => {
  currentLogisticsIndex.value = index;
  currentLogisticsLocationType.value = type;
  showLogisticsLocationDialog.value = true;
};

const handleLogisticsLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
  if (currentLogisticsIndex.value >= 0 && logisticsDetails.value[currentLogisticsIndex.value]) {
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

const showMapDialog = ref(false);
const currentMapType = ref<'target' | 'source'>('target');

const openMapDialog = (type: 'target' | 'source' = 'target') => {
  currentMapType.value = type;
  showMapDialog.value = true;
};

const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
  if (currentMapType.value === 'target') {
    formData.value.target_latitude = location.latitude;
    formData.value.target_longitude = location.longitude;
    formData.value.target_location = location.address;
    locationError.value = null;
  } else {
    formData.value.source_latitude = location.latitude;
    formData.value.source_longitude = location.longitude;
    formData.value.source_location = location.address;
    sourceLocationError.value = null;
  }
};

const toPoDateTime = (value: string): string => {
  const v = (value || '').trim();
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
    const [datePart, timePart] = v.split(/\s+/);
    const time = timePart && /^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(timePart) ? timePart : '00:00:00';
    return `${datePart} ${time}`;
  }
  return v;
};

const buildPayload = () => {
  const payload: Record<string, any> = {
    supplier_id: formData.value.supplier_id,
    po_datetime: toPoDateTime(formData.value.po_datetime),
    responsible_person: formData.value.responsible_person || '',
    responsible_phone: formData.value.responsible_phone || '',
    target_location: formData.value.target_location || '',
    target_latitude: formData.value.target_latitude ?? '',
    target_longitude: formData.value.target_longitude ?? '',
    source_location: formData.value.source_location || '',
    source_latitude: formData.value.source_latitude ?? '',
    source_longitude: formData.value.source_longitude ?? '',
    project_name: formData.value.project_name || '',
    po_type: formData.value.po_type,
    payment_method: formData.value.payment_method || 'cash',
    upfront_payment: formData.value.upfront_payment ?? 0,
    invoice_interval: formData.value.invoice_interval ?? null,
    payment_term_no: formData.value.payment_term_no ?? null,
    late_fee_type: formData.value.late_fee_type ?? null,
    late_fee: formData.value.late_fee ?? null,
    cancel_fee_type: formData.value.cancel_fee_type ?? null,
    cancel_fee: formData.value.cancel_fee ?? null,
    approved_amount: formData.value.approved_amount ?? null,
    final_logistics_service_amount: formData.value.final_logistics_service_amount ?? null,
    final_logistics_trip: formData.value.final_logistics_trip ?? null,
  };

  // Include purchase_quotation_id if creating order from quotation
  if (purchaseQuotationId.value) {
    payload.purchase_quotation_id = Number(purchaseQuotationId.value);
  }

  payload.po_logistics_details = logisticsDetails.value.map((d, index) => {
      const useMainFormLocations =
        logisticsDetails.value.length === 1 &&
        formData.value.source_location &&
        formData.value.target_location;
      const applyMainLocations = useMainFormLocations && index === 0;
      return {
        id: isEditMode.value ? (d.id ?? null) : null,
        material_type: d.material_type,
        trip_no: d.trip_no,
        actual_execution_interval: d.actual_execution_interval,
        am_pm_interval: d.am_pm_interval,
        from_date: d.from_date,
        to_date: d.to_date,
        transport_type: d.transport_type,
        transport_no: d.transport_no,
        loading_responsible_party: d.loading_responsible_party,
        downloading_responsible_party: d.downloading_responsible_party,
        target_location: applyMainLocations ? (formData.value.target_location || '') : (d.target_location ?? ''),
        target_latitude: applyMainLocations ? (formData.value.target_latitude ?? '') : (d.target_latitude ?? ''),
        target_longitude: applyMainLocations ? (formData.value.target_longitude ?? '') : (d.target_longitude ?? ''),
        source_location: applyMainLocations ? (formData.value.source_location || '') : (d.source_location ?? ''),
        source_latitude: applyMainLocations ? (formData.value.source_latitude ?? '') : (d.source_latitude ?? ''),
        source_longitude: applyMainLocations ? (formData.value.source_longitude ?? '') : (d.source_longitude ?? ''),
        transport_amount: d.transport_amount ?? 0,
        discount_val: d.discount_val ?? null,
        discount_type: d.discount_type ?? null,
      };
    });

  payload.po_product_details = productTableItems.value.map(p => ({
    id: p.id ?? null,
    item_id: p.item_id,
    unit_id: p.unit_id,
    quantity: p.quantity ?? 0,
    from_date: (p as any).from_date || null,
    trip_no: (p as any).trip_no ?? null,
    transport_type: Array.isArray((p as any).transport_type) ? (p as any).transport_type[0] : ((p as any).transport_type ?? null),
    notes: p.notes || '',
  }));

  payload.po_trip_details = tripTableItems.value.map(t => ({
    id: t.id ?? null,
    item_id: t.item_id,
    unit_id: t.unit_id,
    quantity: t.quantity,
    trip_date: t.trip_date,
    trip_no: t.trip_no ?? null,
    trip_price: t.trip_price ?? 0,
    sub_total: t.sub_total ?? 0,
    quotation_logistics_detail_id: t.quotation_logistics_detail_id ?? -1,
    discount_val: t.discount_val ?? null,
    discount_type: t.discount_type ?? null,
    transport_type: t.transport_type,
  }));

  return payload;
};

const locationError = ref<string | null>(null);
const sourceLocationError = ref<string | null>(null);

const handleSubmit = async (type: string) => {
  if (!await validate()) return;

  locationError.value = null;
  sourceLocationError.value = null;
  if (!formData.value.source_location?.trim()) {
    sourceLocationError.value = t('purchases.orders.shared.warnings.sourceLocationRequired');
    warning(t('purchases.orders.shared.warnings.sourceLocationRequired'));
    return;
  }
  if (!formData.value.target_location?.trim()) {
    locationError.value = t('purchases.orders.shared.warnings.projectLocationRequired');
    warning(t('purchases.orders.shared.warnings.projectLocationRequired'));
    return;
  }

  if (productTableItems.value.length === 0) {
    warning(t('purchases.shared.forms.common.warnings.atLeastOneProduct'));
    return;
  }

  if (logisticsDetails.value.length === 0) {
    warning(t('purchases.shared.forms.common.warnings.atLeastOneTransportService'));
    return;
  }

  if (tripTableItems.value.length === 0) {
    warning(t('purchases.orders.shared.warnings.atLeastOneTripLeg'));
    return;
  }

  // Validate logistics details locations
  // skip validation for the first logistics detail (index 0)
  for (let i = 1; i < logisticsDetails.value.length; i++) {
    const detail = logisticsDetails.value[i];
    if (!detail.source_location?.trim()) {
      warning(t('purchases.orders.shared.warnings.pickupRequiredForService', { n: i + 1 }));
      return;
    }
    if (!detail.target_location?.trim()) {
      warning(t('purchases.orders.shared.warnings.deliveryRequiredForService', { n: i + 1 }));
      return;
    }
  }


  isSubmitting.value = true;
  try {
    const payload = buildPayload();
    if (isEditMode.value && routeId.value) {
      await api.put(`/purchases/orders/logistics/${routeId.value}`, payload);
      success(t('purchases.orders.shared.success.poUpdated'));
    } else {
      await api.post('/purchases/orders/logistics', payload);
      success(t('purchases.orders.shared.success.poCreated'));
    }
    if (type === 'return_to_list') {
      router.push({ name: 'OrdersLogisticsList' });
    } else if (type === 'create_new') {
      router.push({ name: 'OrdersLogisticsCreate' });
    }
  } catch (e: any) {
    console.error('Error submitting form:', e);
    const validationErrors = e?.response?.data?.errors;
    if (validationErrors && typeof validationErrors === 'object') {
      const messages: string[] = [];
      Object.entries(validationErrors).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          value.forEach((msg) => messages.push(`${formatValidationFieldKey(field)}: ${msg}`));
        } else if (value) {
          messages.push(`${formatValidationFieldKey(field)}: ${value}`);
        }
      });
      if (messages.length) {
        messages.forEach(msg => error(msg));
      } else {
        error(e?.response?.data?.message || t('purchases.orders.shared.warnings.savePoError'));
      }
    } else {
      error(e?.response?.data?.message || t('purchases.orders.shared.warnings.savePoError'));
    }
  } finally {
    isSubmitting.value = false;
  }
};

const headers = computed(() => [
  { title: t('purchases.shared.forms.common.tableHeaders.productName'), key: 'name' },
  { title: t('purchases.shared.forms.common.tableHeaders.unit'), key: 'unit' },
  { title: t('purchases.shared.forms.common.tableHeaders.quantity'), key: 'quantity' },
  { title: t('purchases.orders.shared.tableHeaders.transportStartDate'), key: 'from_date' },
  { title: t('purchases.requests.logistics.form.productsTable.tripNo'), key: 'trip_no' },
  { title: t('purchases.shared.forms.common.tableHeaders.notes'), key: 'notes' },
]);

const tableItems = computed(() => productTableItems.value.map(item => ({
  id: item.item_id,
  item_id: item.item_id,
  name: item.item_name,
  unit: item.unit_name,
  quantity: item.quantity,
  from_date: item.from_date || '—',
  trip_no: item.trip_no ?? '—',
  notes: item.notes,
})));

// Trip details table headers and computed items
const tripHeaders = computed(() => [
  { title: t('purchases.shared.forms.common.tableHeaders.productName'), key: 'name' },
  { title: t('purchases.shared.forms.common.tableHeaders.unit'), key: 'unit' },
  { title: t('purchases.shared.forms.common.tableHeaders.quantity'), key: 'quantity' },
  { title: t('purchases.orders.shared.tableHeaders.tripDate'), key: 'trip_date' },
  { title: t('purchases.orders.shared.tableHeaders.transportTypes'), key: 'transport_type_names' },
  { title: t('purchases.requests.logistics.form.productsTable.tripNo'), key: 'trip_no' },
  { title: t('purchases.orders.shared.tableHeaders.tripPrice'), key: 'trip_price' },
  { title: t('purchases.orders.shared.tableHeaders.discount'), key: 'discount_display' },
  { title: t('purchases.orders.shared.tableHeaders.subTotal'), key: 'sub_total' },
]);

const tripItems = computed(() => tripTableItems.value.map(item => ({
  id: item.item_id,
  item_id: item.item_id,
  name: item.item_name,
  unit: item.unit_name,
  quantity: item.quantity,
  trip_date: item.trip_date || '—',
  trip_no: item.trip_no ?? '—',
  trip_price: item.trip_price ?? '—',
  discount_val: item.discount_val ?? null,
  discount_type: item.discount_type ?? null,
  discount_display: '—',
  sub_total: item.sub_total ?? '—',
  transport_type_names: item.transport_type_names || getTransportTypeNames(item.transport_type) || '—',
})));

const timeOfDayLabel = (interval: string | null | undefined) => {
  if (interval === 'am') return t('purchases.shared.forms.common.timeOfDay.am');
  if (interval === 'pm') return t('purchases.shared.forms.common.timeOfDay.pm');
  if (interval === 'both') return t('purchases.shared.forms.common.timeOfDay.both');
  if (interval) return String(interval);
  return '—';
};

const formatVehicleCount = (n: number | string | null | undefined) => {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  return t('purchases.shared.forms.common.vehicleCount', { count: num });
};

const summaryTotals = computed(() => {
  const transportValue = logisticsDetails.value.reduce((total, detail) => {
    const amount = detail.transport_amount != null ? Number(detail.transport_amount) : 0;
    let finalAmount = isNaN(amount) ? 0 : amount;
    if (finalAmount > 0 && detail.discount_val) {
      const discountVal = Number(detail.discount_val);
      const discountType = Number(detail.discount_type || 2);
      if (!isNaN(discountVal) && discountVal > 0) {
        if (discountType === 1) {
          finalAmount = finalAmount - (finalAmount * (discountVal / 100));
        } else {
          finalAmount = finalAmount - discountVal;
        }
      }
    }
    return total + Math.max(0, finalAmount);
  }, 0);

  const taxRatePercent = 15;
  const taxAmount = transportValue * (taxRatePercent / 100);
  const finalTotal = transportValue + taxAmount;

  return {
    transportValue,
    taxRatePercent,
    taxAmount,
    finalTotal,
  };
});

const computedFinalLogisticsServiceAmount = computed(() => {
  return logisticsDetails.value.reduce((total, detail) => {
    const amount = detail.transport_amount != null ? Number(detail.transport_amount) : 0;
    let finalAmount = isNaN(amount) ? 0 : amount;
    if (finalAmount > 0 && detail.discount_val) {
      const discountVal = Number(detail.discount_val);
      const discountType = Number(detail.discount_type || 2);
      if (!isNaN(discountVal) && discountVal > 0) {
        if (discountType === 1) {
          finalAmount = finalAmount - (finalAmount * (discountVal / 100));
        } else {
          finalAmount = finalAmount - discountVal;
        }
      }
    }
    return total + Math.max(0, finalAmount);
  }, 0);
});

const computedFinalLogisticsTrip = computed(() => {
  return tripTableItems.value.reduce((total, item) => {
    const subTotal = item.sub_total != null ? Number(item.sub_total) : 0;
    return total + (isNaN(subTotal) ? 0 : subTotal);
  }, 0);
});

watch(computedFinalLogisticsServiceAmount, (newVal) => {
  formData.value.final_logistics_service_amount = newVal;
}, { immediate: true });

watch(computedFinalLogisticsTrip, (newVal) => {
  formData.value.final_logistics_trip = newVal;
}, { immediate: true });

const logisticsDiscountTypeOptions = computed(() => [
  { title: t('purchases.orders.shared.labels.percentSymbol'), value: 1 },
  { title: t('purchases.orders.shared.labels.currencyRial'), value: 2 },
]);

const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) return '0.00';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

onMounted(async () => {
  fetchConstants();
  fetchOrdersConstants();
  fetchUnits();
  fetchCategories();
  if (isEditMode.value) {
    await fetchFormData();
  } else if (fromQuotationId.value) {
    // Fetch quotation data if creating order from quotation
    await fetchQuotationForOrder();
  } else {
    isFormDataLoaded.value = true;
  }
});
</script>

<template>
  <default-layout>
    <div class="request-material-product-page -mx-6 bg-qallab-dashboard-bg space-y-4">
      <AppFormBreadcrumb
        list-path="/purchases/orders/logistics/list"
        module-root-key="breadcrumb.purchases.root"
        list-label-key="breadcrumb.purchases.orders.logistics.list"
        create-label-key="breadcrumb.purchases.orders.logistics.create"
        edit-label-key="breadcrumb.purchases.orders.logistics.edit"
        :is-edit-mode="isEditMode"
        :code="isEditMode ? (formData.code || '') : ''"
      />
      <TopHeader :icon="fileCheckIcon" title-key="pages.OrdersLogistics.FormTitle"
        description-key="pages.OrdersLogistics.FormDescription" :show-action="false"
        code-label-key="purchases.orders.shared.labels.purchaseOrderCode"
        :code="isEditMode ? (formData.code || '') : ''" :code-icon="fileIcon" @action="handleNewRequest" />

      <div class="p-6 bg-white rounded-3xl border !border-gray-100">
        <div class="flex items-center mb-6 gap-2 text-primary-600">
          <span class="w-4" v-html="fileCheckIcon"></span>
          <h2 class="text-base font-bold">{{ t('purchases.shared.forms.common.sections.basicInfo') }}</h2>
        </div>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <!-- اسم المورد (يُستخدم لجلب المنتجات وإرسال supplier_id) -->
            <SelectInput v-model="formData.supplier_id" :disabled="isFromQuotation" :items="[]"
              :placeholder="t('purchases.orders.shared.placeholders.selectSupplierPo')" :label="t('purchases.shared.forms.common.labels.supplierName')" :rules="[required()]" density="comfortable"
              item-title="title" item-value="value" :server-side="true" :fetch-function="fetchSuppliers"
              item-title-key="full_name" item-value-key="id" :debounce-time="500" />

            <TextInput v-model="formData.responsible_person" :label="t('purchases.shared.forms.common.labels.responsibleName')" :placeholder="t('purchases.shared.forms.common.placeholders.enterResponsibleName')"
              :rules="[required()]" density="comfortable" />
            <DateTimePickerInput v-model="formData.po_datetime" :label="t('purchases.orders.shared.labels.poDate')" :placeholder="t('purchases.shared.forms.common.placeholders.selectDateTime')"
              density="comfortable" />
            <TelInput v-model="formData.responsible_phone" :label="t('purchases.shared.forms.common.labels.responsiblePhone')" :placeholder="t('purchases.shared.forms.common.placeholders.phoneSample')" :rules="[required(), saudiPhone()]"
              density="comfortable" />
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block">{{ t('purchases.requests.logistics.form.labels.sourceMaterialsLocation') }} <span
                  class="text-red-500">*</span></label>
              <div @click="openMapDialog('source')"
                :class="['flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer', sourceLocationError ? '!border-error-500 bg-error-50' : '!border-blue-400 hover:bg-blue-100']">
                <span class="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  :class="sourceLocationError ? 'text-error-700' : 'text-blue-900'">
                  {{ formData.source_location || t('purchases.shared.forms.common.pickLocation') }}
                </span>
                <span v-html="mapMarkerIcon"></span>
              </div>
              <p v-if="sourceLocationError" class="text-error-600 text-xs mt-1">{{ sourceLocationError }}</p>
            </div>
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block">{{ t('purchases.requests.logistics.form.labels.projectLocation') }} <span
                  class="text-red-500">*</span></label>
              <div @click="openMapDialog('target')"
                :class="locationError ? '!border-error-500 bg-error-50' : '!border-blue-400 hover:bg-blue-100'" class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg
                cursor-pointer hover:bg-blue-100">
                <span class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis"
                  :class="locationError ? 'text-error-700' : 'text-blue-900'">
                  {{ formData.target_location || t('purchases.shared.forms.common.pickLocation') }}
                </span>
                <span v-html="mapMarkerIcon"></span>
              </div>
              <p v-if="locationError" class="text-error-600 text-xs mt-1">{{ locationError }}</p>

            </div>
            <TextInput v-model="formData.project_name" :label="t('purchases.requests.logistics.form.labels.projectName')" :placeholder="t('purchases.requests.logistics.form.placeholders.enterProjectName')"
              :rules="[required()]" density="comfortable" />
            <TextInput disabled v-model="formData.purchase_quotation_code" v-if="formData.purchase_quotation_code"
              readonly :label="t('purchases.orders.shared.labels.quotationCode')" density="comfortable" :hide-details="true">
              <template #append-inner>
                <v-tooltip location="top" content-class="custom-tooltip">
                  <template #activator="{ props: tooltipProps }">
                    <ButtonWithIcon variant="text" size="small" density="compact" custom-class="!min-w-0 p-0"
                      :prepend-icon="HelpCircleIcon" v-bind="tooltipProps" />
                  </template>
                  <div>{{ t('purchases.orders.shared.labels.quotationCode') }}</div>
                </v-tooltip>
              </template>
            </TextInput>

          </div>
        </v-form>
      </div>

      <!-- Logistics Details -->
      <div class="mb-8 bg-white rounded-3xl border !border-gray-100">
        <div class="flex flex-wrap gap-3 items-center justify-between px-6 py-3">
          <div class="flex items-center gap-2 text-primary-600">
            <span v-html="busIcon"></span>
            <h2 class="text-base font-bold">{{ t('purchases.requests.logistics.form.transportDetails') }}</h2>
          </div>
          <ButtonWithIcon color="primary-600" variant="flat" rounded="lg" @click="handleAddLogisticsDetail">
            {{ t('purchases.requests.logistics.form.addTransportService') }}
          </ButtonWithIcon>
        </div>
        <!-- Logistics Details Cards (نفس هيكل طلبات خدمة النقل) -->
        <div class="px-6 pb-6 space-y-4">
          <div v-for="(detail, index) in logisticsDetails" :key="index" class="border !border-gray-200 rounded-3xl p-6">
            <div class="flex gap-4 items-stretch">
              <div class="flex flex-wrap gap-x-2 gap-y-0">
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.materialType') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ getCategoriesNames(detail.material_type) }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.tripCount') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.trip_no }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.executionDuration') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.actual_execution_interval ?? '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.transportTimes') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ timeOfDayLabel(detail.am_pm_interval) }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.fromDate') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.from_date || '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.toDate') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.to_date || '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.orders.shared.tableHeaders.vehicleType') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ getTransportTypeNames(detail.transport_type) }}
                  </p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.vehicleCount') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ formatVehicleCount(detail.transport_no) }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.orders.shared.labels.logisticsTransportAmount') }}</label>
                  <p class="text-base font-semibold text-gray-900 flex items-center gap-2">
                    {{ detail.transport_amount ?? '—' }} <span v-html="rialIcon"> </span>
                  </p>
                </div>
                <v-divider vertical class="my-6" v-if="detail.discount_val"></v-divider>
                <div class="info-item-bordered px-4 py-2" v-if="detail.discount_val">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.orders.shared.labels.discountRow') }}</label>
                  <p class="text-base font-semibold text-gray-900 flex items-center gap-1">
                    {{ detail.discount_val }}
                    <span v-if="detail.discount_type == 1">%</span>
                    <span v-if="detail.discount_type == 2" v-html="rialIcon"></span>
                  </p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.unloadingResponsible') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.loading_responsible_party || '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.loadingResponsible') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.downloading_responsible_party || '—' }}</p>
                </div>
                <v-divider vertical class="my-6" v-if="detail.target_location"></v-divider>
                <div class="info-item-bordered px-4 py-2" v-if="detail.target_location">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.deliveryLocation') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.target_location }}</p>
                </div>
                <v-divider vertical class="my-6" v-if="detail.source_location"></v-divider>
                <div class="info-item-bordered px-4 py-2" v-if="detail.source_location">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('purchases.requests.logistics.form.detailCard.pickupLocation') }}</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.source_location }}</p>
                </div>
              </div>
              <ButtonWithIcon :icon="binIcon" icon-only @click="handleEditLogisticsDetail(detail)" size="x-small"
                rounded="lg" color="primary" variant="text" />
            </div>
            <div class="flex justify-end gap-2 mt-2">
              <ButtonWithIcon color="primary-800" variant="flat" class="text-white" rounded="lg"
                :prepend-icon="globeIcon" @click="openLogisticsLocationDialog(index, 'source')">{{ t('purchases.requests.logistics.form.map.pickup') }}
              </ButtonWithIcon>
              <ButtonWithIcon color="primary-800" variant="flat" class="text-white" rounded="lg"
                :prepend-icon="globeIcon" @click="openLogisticsLocationDialog(index, 'target')">{{ t('purchases.requests.logistics.form.map.delivery') }}
              </ButtonWithIcon>
            </div>
          </div>
          <div v-if="logisticsDetails.length === 0" class="text-center py-12">
            <p class="text-gray-500 text-lg">{{ t('purchases.requests.logistics.form.emptyTransportTitle') }}</p>
            <p class="text-gray-400 text-sm mt-2">{{ t('purchases.requests.logistics.form.emptyTransportHint') }}</p>
          </div>
        </div>
      </div>

      <!-- Products -->
      <div class="mb-8 bg-white rounded-3xl border !border-gray-100">
        <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3">
          <div class="flex items-center gap-2 text-primary-600">
            <span v-html="packageIcon"></span>
            <h2 class="text-xl font-bold">{{ t('purchases.shared.forms.common.sections.products') }}</h2>
          </div>
        </div>
        <div class="mb-4">
          <DataTable :headers="headers" :items="tableItems" show-actions force-show-edit force-show-delete
            @edit="handleEditProduct" @delete="handleDeleteProduct">
            <template #item.notes="{ item }">
              <v-menu
                attach="request-material-product-page"
                location="bottom"
                offset="8"
                :close-on-content-click="false"
                transition="slide-y-transition"
              >
                <template #activator="{ props }">
                  <div class="flex items-center gap-2 cursor-pointer" v-bind="props">
                    <v-icon size="20" color="primary" v-html="messagePlusIcon"></v-icon>
                    <span class="text-gray-900">{{ item.notes || t('purchases.shared.forms.common.placeholders.addNote') }}</span>
                  </div>
                </template>

                <v-card
                  class="pa-4 shadow-[rgba(149,157,165,0.2)_0px_8px_24px] overflow-hidden px-3 py-3"
                  color="white"
                  rounded="lg"
                  width="300"
                >
                  <div class="!flex flex-nowrap items-center gap-3">
                    <TextInput
                      v-model="productTableItems[productTableItems.findIndex((p) => p.item_id === item.item_id)].notes"
                      :placeholder="t('purchases.shared.forms.common.placeholders.addNote')"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      autofocus
                      class="flex-1"
                    />
                    <ButtonWithIcon :icon="messagePlusIcon" color="primary" icon-only size="x-small" />
                  </div>
                </v-card>
              </v-menu>
            </template>
          </DataTable>
        </div>
        <div class="flex justify-center gap-3 mx-auto md:w-3/4">
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

      <!-- Trip Details Section -->
      <div class="bg-white rounded-3xl border !border-gray-100">
        <div class="px-6 py-6">
          <div class="flex items-center gap-2 mb-2">
            <span v-html="busIcon"></span>
            <h2 class="text-base font-bold text-primary-600">{{ t('purchases.orders.shared.labels.tripDetailsSection') }}</h2>
          </div>
        </div>

        <!-- Trip Details Table -->
        <DataTable :headers="tripHeaders" :items="tripItems" show-actions force-show-edit
          @edit="handleEditTrip">
          <template #item.discount_display="{ item }">
            <span v-if="item.discount_val != null && Number(item.discount_val) > 0" class="flex items-center gap-1">
              {{ item.discount_val }}
              <span v-if="item.discount_type == 1">%</span>
              <span v-if="item.discount_type == 2" v-html="rialIcon"></span>
            </span>
            <span v-else>—</span>
          </template>
        </DataTable>
        <div v-if="tripTableItems.length > 0" class="flex justify-center py-4">
          <ButtonWithIcon
            color="primary-100"
            variant="flat"
            class="!text-primary-900 font-bold w-full max-w-md"
            @click="showEditTripsDialog = true"
          >
            {{ t('purchases.orders.shared.actions.editTrips') }}
          </ButtonWithIcon>
        </div>
      </div>

      <!-- بيانات الدفع وملخص المبالغ (آخر قسم قبل أزرار الحفظ) -->
      <div class="grid grid-cols-1 xl:grid-cols-3 justify-between gap-4 bg-qallab-dashboard-bg py-5 px-2">
        <div class="bg-white rounded-2xl xl:col-span-2">
          <div class="flex items-center gap-2 p-6 border-b !border-gray-200">
            <span v-html="CoinHandIcon"></span>
            <h2 class="text-base font-bold text-primary-600">{{ t('purchases.orders.shared.labels.paymentData') }}</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PriceInput showRialIcon v-model="formData.final_logistics_service_amount" density="comfortable"
                :label="t('purchases.orders.shared.labels.logisticsTransportTotal')" placeholder="0" disabled />

              <PriceInput showRialIcon v-model="formData.final_logistics_trip" density="comfortable"
                :label="t('purchases.orders.shared.labels.logisticsTripsTotal')" placeholder="0" disabled />

              <div class="md:col-span-1" v-if="approvedAmountItems.length > 0">
                <label class="font-semibold text-sm text-gray-700 mb-2 block">{{ t('purchases.orders.shared.labels.approvedOfferTotal') }}</label>
                <v-radio-group v-model="formData.approved_amount" inline density="comfortable" hide-details>
                  <v-radio
                    v-for="item in approvedAmountItems"
                    :key="item.value"
                    :label="item.title"
                    :value="item.value"
                    color="primary"
                  />
                </v-radio-group>
              </div>

              <SelectInput v-model="formData.payment_method" :items="paymentMethodItems" density="comfortable"
                :placeholder="t('purchases.shared.forms.common.placeholders.selectPaymentMethod')" :label="t('purchases.shared.forms.common.labels.paymentMethod')" item-title="title" item-value="value"
                :rules="[required()]" />
              <PriceInput showRialIcon v-model="formData.upfront_payment" density="comfortable" :label="t('purchases.shared.forms.common.labels.advancePayment')"
                :placeholder="t('purchases.shared.forms.common.placeholders.enterAdvanceAmount')" />

              <PriceInput :label="t('purchases.orders.shared.labels.invoiceUploadDuration')" v-model="formData.invoice_interval" :placeholder="t('purchases.orders.shared.placeholders.enterDurationDays')"
                :rules="[numeric()]" density="comfortable">
                <template #append-inner>
                  <span class="text-gray-500 text-sm"> {{ t('purchases.shared.forms.common.day') }} </span>
                </template>
              </PriceInput>
              <PriceInput :label="t('purchases.orders.shared.labels.paymentDuration')" v-model="formData.payment_term_no" :placeholder="t('purchases.orders.shared.placeholders.enterDurationDays')"
                :rules="[numeric()]" density="comfortable">
                <template #append-inner>
                  <span class="text-gray-500 text-sm"> {{ t('purchases.shared.forms.common.day') }} </span>
                </template>
              </PriceInput>

              <TextInputWithSelect v-model="formData.late_fee" v-model:selectValue="formData.late_fee_type"
                :label="t('purchases.orders.shared.labels.lateFee')" :placeholder="t('purchases.orders.shared.placeholders.enterFeeAmount')" type="number" :rules="[numeric(), positive()]"
                select-width="110px" :select-items="feeTypeItems" :select-placeholder="t('purchases.shared.forms.common.select')" />

              <TextInputWithSelect v-model="formData.cancel_fee" v-model:selectValue="formData.cancel_fee_type"
                :label="t('purchases.orders.shared.labels.cancelFee')" :placeholder="t('purchases.orders.shared.placeholders.enterFeeAmount')" type="number" :rules="[numeric(), positive()]"
                select-width="110px" :select-items="feeTypeItems" :select-placeholder="t('purchases.shared.forms.common.select')" />
            </div>
          </div>
        </div>

        <div class="bg-primary-25 rounded-2xl overflow-hidden border !border-gray-200">
          <table class="w-full">
            <thead>
              <tr class="bg-primary-400">
                <th class="text-white font-semibold text-base py-3 px-4 text-center border-l !border-gray-200">
                  {{ t('purchases.orders.shared.labels.summaryItem') }}
                </th>
                <th class="text-white font-semibold text-base py-3 px-4 text-center">
                  {{ t('purchases.orders.shared.labels.summaryAmount') }}
                </th>
              </tr>
            </thead>
            <tbody class="text-sm bg-primary-25">
              <tr class="border-b !border-gray-200">
                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                  {{ t('purchases.orders.shared.labels.transportValueLabel') }}
                </td>
                <td class="py-5 px-4 text-center text-gray-600">
                  <span class="font-semibold text-gray-900">{{ formatCurrency(summaryTotals.transportValue) }}</span>
                </td>
              </tr>

              <tr class="border-b !border-gray-200">
                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                  {{ t('purchases.orders.shared.labels.taxRow') }}
                </td>
                <td class="py-5 px-4 text-center text-gray-600">
                  {{ summaryTotals.taxRatePercent }}%
                </td>
              </tr>

              <tr class="border-b !border-gray-200">
                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                  {{ t('purchases.orders.shared.labels.totalTaxRow') }}
                </td>
                <td class="py-5 px-4 text-center text-gray-600">
                  <span class="font-semibold text-gray-900">{{ formatCurrency(summaryTotals.taxAmount) }}</span>
                </td>
              </tr>

              <tr class="border-b !border-gray-200">
                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                  {{ t('purchases.orders.shared.labels.finalTotalRow') }}
                </td>
                <td class="py-5 px-4 font-bold text-center text-gray-900">
                  <span class="font-semibold text-gray-900">{{ formatCurrency(summaryTotals.finalTotal) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-center gap-3">
        <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
          <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
            custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon" :label="t('purchases.orders.shared.labels.saveReturnToList')"
            :loading="isSubmitting" @click="handleSubmit('return_to_list')" />
          <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
            custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
            :label="t('purchases.orders.shared.labels.saveAndCreateNewPo')" :loading="isSubmitting" @click="handleSubmit('create_new')" />
        </div>
      </div>
    </div>

    <Map v-model="showMapDialog"
      :latitude="String(currentMapType === 'target' ? (formData.target_latitude || '') : (formData.source_latitude || ''))"
      :longitude="String(currentMapType === 'target' ? (formData.target_longitude || '') : (formData.source_longitude || ''))"
      :address="String(currentMapType === 'target' ? (formData.target_location || '') : (formData.source_location || ''))"
      @location-selected="handleLocationSelected" />

    <!-- مودال المنتجات: بدون supplier_id ولا material_type — /categories/list و /items/list فقط -->
    <AddProductDialog
      v-model="showAddProductDialog"
      :request-type="productDialogMode"
      :unit-items="unitItems"
      :transport-types="transportTypeItems"
      :edit-product="(editingProduct as any)"
      :existing-products="(productDialogMode === 'logistics' ? productTableItems : tripTableItems) as any[]"
      @saved="handleProductSaved"
      @product-updated="handleProductUpdated"
    />

    <EditProductsDialog
      v-model="showEditProductsDialog"
      request-type="logistics"
      :products="productTableItems"
      :transport-types="transportTypeItems"
      :unit-items="unitItems"
      @products-updated="handleEditProductsBulk"
    />

    <EditProductsDialog
      v-model="showEditTripsDialog"
      request-type="logistics-trips"
      :products="tripTableItems as any"
      :transport-types="transportTypeItems"
      :unit-items="unitItems"
      :discount-type-items="logisticsDiscountTypeOptions"
      @products-updated="handleEditTripsBulk"
    />

    <AddLogisticsDetailDialog v-model="showAddLogisticsDialog" :transport-types="transportTypeItems"
      :am-pm-interval-options="amPmIntervalItems" :categories-items="categoriesItems"
      :discount-type-options="logisticsDiscountTypeOptions"
      :edit-detail="editingLogisticsDetail" @saved="handleLogisticsDetailSaved"
      @updated="handleLogisticsDetailUpdated" />

    <Map v-model="showLogisticsLocationDialog"
      :latitude="String(currentLogisticsIndex >= 0 && logisticsDetails[currentLogisticsIndex] ? (currentLogisticsLocationType === 'target' ? (logisticsDetails[currentLogisticsIndex].target_latitude || '') : (logisticsDetails[currentLogisticsIndex].source_latitude || '')) : '')"
      :longitude="String(currentLogisticsIndex >= 0 && logisticsDetails[currentLogisticsIndex] ? (currentLogisticsLocationType === 'target' ? (logisticsDetails[currentLogisticsIndex].target_longitude || '') : (logisticsDetails[currentLogisticsIndex].source_longitude || '')) : '')"
      :address="String(currentLogisticsIndex >= 0 && logisticsDetails[currentLogisticsIndex] ? (currentLogisticsLocationType === 'target' ? (logisticsDetails[currentLogisticsIndex].target_location || '') : (logisticsDetails[currentLogisticsIndex].source_location || '')) : '')"
      @location-selected="handleLogisticsLocationSelected" />

    <v-overlay :model-value="isLoading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>
  </default-layout>
</template>

<style scoped>
.info-item-bordered {
  min-width: 150px;
}
</style>
