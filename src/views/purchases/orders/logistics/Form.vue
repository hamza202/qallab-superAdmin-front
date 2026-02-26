<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import AddProductDialog, { type ProductToAdd } from '@/components/price-offers/AddProductDialog.vue';
import AddLogisticsDetailDialog, { type LogisticsDetail } from './components/AddLogisticsDetailDialog.vue';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import DateTimePickerInput from '@/components/common/forms/DateTimePickerInput.vue';
import TelInput from '@/components/common/forms/TelInput.vue';
import { useApi } from '@/composables/useApi';
import { fileIcon, mapMarkerIcon, packageIcon, busIcon, globeIcon, CoinHandIcon } from '@/components/icons/priceOffersIcons';
import { useForm } from '@/composables/useForm';
import { useNotification as useNotify } from '@/composables/useNotification';
import { binIcon, fileCheckIcon, HelpCircleIcon, returnIcon, saveIcon } from "@/components/icons/globalIcons";
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
const isFromQuotation = ref(false);

const paymentMethodItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);
const amPmIntervalItems = ref<any[]>([]);
const unitItems = ref<any[]>([]);
const categoriesItems = ref<any[]>([]);
const poTypeItems = ref<any[]>([]);
const feeTypeItems = ref<any[]>([]);
const currencyItems = ref<any[]>([]);
const supplierItems = ref<any[]>([]);

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

const fetchSuppliers = async () => {
  try {
    const res = await api.get<any>('/suppliers/list', {
      params: {
        service_type: 'logistic_company'
      }
    });
    if (Array.isArray(res.data)) {
      supplierItems.value = res.data.map((i: any) => ({ title: i.full_name, value: i.id }));
    }
  } catch (e) {
    console.error('Error fetching suppliers:', e);
  }
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
  trip_price: number | null;
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
  po_type: 'po_with_logistics' as string,
  invoice_interval: null as number | null,
  payment_term_no: null as number | null,
  late_fee_type: null as string | null,
  late_fee: null as number | null,
  cancel_fee_type: null as string | null,
  cancel_fee: null as number | null,
  purchase_quotation_code: null as string | null,
});

const productTableItems = ref<ProductTableItem[]>([]);
const logisticsDetails = ref<LogisticsDetail[]>([]);
const tripTableItems = ref<TripTableItem[]>([]);

const showAddProductDialog = ref(false);
const editingProduct = ref<ProductTableItem | null>(null);
const productDialogMode = ref<'logistics' | 'logistics-trips'>('logistics');

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
            trip_price: t.trip_price != null ? Number(t.trip_price) : null,
            transport_type: transportTypes,
            transport_type_names: getTransportTypeNames(transportTypes),
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
        }));
      }
    }
  } catch (e: any) {
    console.error('Error fetching quotation data:', e);
    error(e?.response?.data?.message || 'فشل تحميل بيانات عرض السعر');
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
      formData.value.po_type = data.po_type || 'po_with_logistics';
      formData.value.invoice_interval = data.invoice_interval ?? null;
      formData.value.payment_term_no = data.payment_term_no ?? null;
      formData.value.late_fee_type = data.late_fee_type || null;
      formData.value.late_fee = data.late_fee ?? null;
      formData.value.cancel_fee_type = data.cancel_fee_type || null;
      formData.value.cancel_fee = data.cancel_fee ?? null;

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
        }));
      }
      if (data.po_product_details && Array.isArray(data.po_product_details)) {
        productTableItems.value = data.po_product_details.map((item: any) => ({
          id: item.id,
          item_id: item.item_id,
          item_name: item.item_name || '',
          unit_id: item.unit_id,
          unit_name: item.unit_name || '',
          quantity: item.quantity,
          from_date: item.from_date,
          trip_no: item.trip_no,
          transport_type: item.transport_type,
          transport_type_name: item.transport_type_label,
        }));
      }
      if (data.po_trip_details && Array.isArray(data.po_trip_details) && data.po_trip_details.length > 0) {
        tripTableItems.value = data.po_trip_details.map((t: any) => {
          const transportTypes = Array.isArray(t.transport_type) ? t.transport_type.map(Number) : (t.transport_type != null ? [Number(t.transport_type)] : []);
          return {
            id: t.id,
            item_id: t.item_id,
            item_name: t.item_name || '',
            unit_id: t.unit_id,
            unit_name: t.unit_name || '',
            quantity: t.quantity,
            trip_date: t.trip_date || null,
            trip_price: t.trip_price ?? null,
            transport_type: transportTypes,
            transport_type_names: getTransportTypeNames(transportTypes),
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
        }));
      }
    }
  } catch (e: any) {
    console.error('Error fetching form data:', e);
    error(e?.response?.data?.message || 'فشل تحميل البيانات');
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

const handleProductSaved = (products: any[]) => {
  if (productDialogMode.value === 'logistics-trips') {
    // Handle trip details update
    const newTripItems: TripTableItem[] = [];
    products.forEach(p => {
      newTripItems.push({
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        trip_date: p.trip_date ?? null,
        trip_price: p.trip_price ?? null,
        transport_type: Array.isArray(p.transport_type) ? p.transport_type : (p.transport_type != null ? [p.transport_type] : []),
        transport_type_names: p.transport_type_names ?? '',
        isAdded: p.isAdded,
        id: p.id,
      });
    });
    tripTableItems.value = newTripItems;
  } else {
    // Handle logistics products - sync trip items too
    const newItems: ProductTableItem[] = [];
    const newTripItems: TripTableItem[] = [];
    products.forEach(p => {
      const existing = productTableItems.value.find(e => e.item_id === p.item_id);
      newItems.push({
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        id: existing?.id || p.id,
        from_date: p.from_date,
        trip_no: p.trip_no,
        transport_type: p.transport_type,
        transport_type_name: getTransportTypeName(p.transport_type),
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
          trip_price: null,
          transport_type: transportArr,
          transport_type_names: getTransportTypeNames(transportArr),
          notes: '',
        });
      }
    });
    productTableItems.value = newItems;
    tripTableItems.value = newTripItems;
  }
};

const handleEditProduct = (item: any) => {
  const productToEdit = productTableItems.value.find(px => px.item_id === item.item_id);
  if (productToEdit) {
    editingProduct.value = { ...productToEdit, isAdded: true };
    productDialogMode.value = 'logistics';
    showAddProductDialog.value = true;
  }
};

const handleEditTrip = (item: any) => {
  const tripToEdit = tripTableItems.value.find(t => t.item_id === item.item_id);
  if (tripToEdit) {
    editingProduct.value = { ...tripToEdit, isAdded: true } as any;
    productDialogMode.value = 'logistics-trips';
    showAddProductDialog.value = true;
  }
};

const handleProductUpdated = (updatedProduct: any) => {
  if (productDialogMode.value === 'logistics-trips') {
    const index = tripTableItems.value.findIndex(t => t.item_id === updatedProduct.item_id);
    if (index !== -1) {
      tripTableItems.value[index] = {
        item_id: updatedProduct.item_id,
        item_name: updatedProduct.item_name,
        unit_id: updatedProduct.unit_id,
        unit_name: updatedProduct.unit_name,
        quantity: updatedProduct.quantity,
        trip_date: updatedProduct.trip_date ?? null,
        trip_price: updatedProduct.trip_price ?? null,
        transport_type: Array.isArray(updatedProduct.transport_type) ? updatedProduct.transport_type : (updatedProduct.transport_type != null ? [updatedProduct.transport_type] : []),
        transport_type_names: updatedProduct.transport_type_names ?? '',
        isAdded: updatedProduct.isAdded,
        id: updatedProduct.id,
      };
      // Sync quantity back to product table
      const productIndex = productTableItems.value.findIndex(p => p.item_id === updatedProduct.item_id);
      if (productIndex !== -1) {
        productTableItems.value[productIndex].quantity = updatedProduct.quantity;
        productTableItems.value[productIndex].unit_id = updatedProduct.unit_id;
        productTableItems.value[productIndex].unit_name = updatedProduct.unit_name;
      }
    }
  } else {
    const index = productTableItems.value.findIndex(p => p.item_id === updatedProduct.item_id);
    if (index !== -1) {
      productTableItems.value[index] = {
        ...productTableItems.value[index],
        item_id: updatedProduct.item_id,
        item_name: updatedProduct.item_name,
        unit_id: updatedProduct.unit_id,
        unit_name: updatedProduct.unit_name,
        quantity: updatedProduct.quantity,
        id: updatedProduct.id,
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
    po_type: formData.value.po_type || 'po_with_logistics',
    payment_method: formData.value.payment_method || 'cash',
    upfront_payment: formData.value.upfront_payment ?? 0,
    invoice_interval: formData.value.invoice_interval ?? null,
    payment_term_no: formData.value.payment_term_no ?? null,
    late_fee_type: formData.value.late_fee_type ?? null,
    late_fee: formData.value.late_fee ?? null,
    cancel_fee_type: formData.value.cancel_fee_type ?? null,
    cancel_fee: formData.value.cancel_fee ?? null,
  };

  // Include purchase_quotation_id if creating order from quotation
  if (purchaseQuotationId.value) {
    payload.sale_quotation_id = Number(purchaseQuotationId.value);
  }

  payload.po_logistics_details = logisticsDetails.value.map(d => ({
    id: d.id ?? null,
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
    target_location: d.target_location,
    target_latitude: d.target_latitude,
    target_longitude: d.target_longitude,
    source_location: d.source_location,
    source_latitude: d.source_latitude,
    source_longitude: d.source_longitude,
    transport_amount: d.transport_amount ?? 0,
  }));

  payload.po_product_details = productTableItems.value.map(p => ({
    id: p.id ?? null,
    item_id: p.item_id,
    unit_id: p.unit_id,
    quantity: p.quantity ?? 0,
    from_date: (p as any).from_date || null,
    trip_no: (p as any).trip_no ?? null,
    transport_type: Array.isArray((p as any).transport_type) ? (p as any).transport_type[0] : ((p as any).transport_type ?? null),
  }));

  payload.po_trip_details = tripTableItems.value.map(t => ({
    id: t.id ?? null,
    item_id: t.item_id,
    unit_id: t.unit_id,
    quantity: t.quantity,
    trip_date: t.trip_date,
    trip_price: t.trip_price ?? 0,
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
    sourceLocationError.value = 'يجب تحديد موقع مصدر المواد';
    warning('يجب تحديد موقع مصدر المواد');
    return;
  }
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

  if (tripTableItems.value.length === 0) {
    warning('يجب إضافة تفاصيل رحلة واحدة على الأقل');
    return;
  }

  // Validate logistics details locations
  for (let i = 0; i < logisticsDetails.value.length; i++) {
    const detail = logisticsDetails.value[i];
    if (!detail.source_location?.trim()) {
      warning(`يجب تحديد موقع الاستلام لخدمة النقل رقم ${i + 1}`);
      return;
    }
    if (!detail.target_location?.trim()) {
      warning(`يجب تحديد موقع التسليم لخدمة النقل رقم ${i + 1}`);
      return;
    }
  }



  isSubmitting.value = true;
  try {
    const payload = buildPayload();
    if (isEditMode.value && routeId.value) {
      await api.put(`/purchases/orders/logistics/${routeId.value}`, payload);
      success('تم تحديث الطلبية بنجاح');
    } else {
      await api.post('/purchases/orders/logistics', payload);
      success('تم إنشاء الطلبية بنجاح');
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
        error(e?.response?.data?.message || 'حدث خطأ أثناء حفظ الطلبية');
      }
    } else {
      error(e?.response?.data?.message || 'حدث خطأ أثناء حفظ الطلبية');
    }
  } finally {
    isSubmitting.value = false;
  }
};

const headers = [
  { title: 'اسم المنتج', key: 'name' },
  { title: 'الوحدة', key: 'unit' },
  { title: 'الكمية', key: 'quantity' },
  { title: 'تاريخ بداية النقل', key: 'from_date' },
  { title: 'عدد الرحلات', key: 'trip_no' },
  { title: 'نوع الناقلة', key: 'transport_type_name' },
];

const tableItems = computed(() => productTableItems.value.map(item => ({
  id: item.item_id,
  item_id: item.item_id,
  name: item.item_name,
  unit: item.unit_name,
  quantity: item.quantity,
  from_date: item.from_date || '—',
  trip_no: item.trip_no ?? '—',
  transport_type_name: item.transport_type_name || getTransportTypeNames(item.transport_type != null ? [item.transport_type as number] : []) || '—',
})));

// Trip details table headers and computed items
const tripHeaders = [
  { title: 'اسم المنتج', key: 'name' },
  { title: 'الوحدة', key: 'unit' },
  { title: 'الكمية', key: 'quantity' },
  { title: 'تاريخ الرحلة', key: 'trip_date' },
  { title: 'سعر الرحلة', key: 'trip_price' },
  { title: 'نوع المركبات', key: 'transport_type_names' },
];

const tripItems = computed(() => tripTableItems.value.map(item => ({
  id: item.item_id,
  item_id: item.item_id,
  name: item.item_name,
  unit: item.unit_name,
  quantity: item.quantity,
  trip_date: item.trip_date || '—',
  trip_price: item.trip_price ?? '—',
  transport_type_names: item.transport_type_names || getTransportTypeNames(item.transport_type) || '—',
})));



const summaryTotals = computed(() => {
  const transportValue = logisticsDetails.value.reduce((total, detail) => {
    const amount = detail.transport_amount != null ? Number(detail.transport_amount) : 0;
    return total + (isNaN(amount) ? 0 : amount);
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
  fetchSuppliers();
  if (isEditMode.value) {
    await fetchFormData();
  } else if (fromQuotationId.value) {
    // Fetch quotation data if creating order from quotation
    await fetchQuotationForOrder();
  }
});
</script>

<template>
  <default-layout>
    <div class="request-material-product-page -mx-6 bg-qallab-dashboard-bg space-y-4">
      <TopHeader :icon="fileCheckIcon" title-key="pages.OrdersLogistics.FormTitle"
        description-key="pages.OrdersLogistics.FormDescription" :show-action="false"
        :code="isEditMode ? (formData.code || '') : ''" :code-icon="fileIcon" @action="handleNewRequest" />

      <div class="p-6 bg-white rounded-3xl border !border-gray-100">
        <div class="flex items-center mb-6 gap-2 text-primary-600">
          <span class="w-4" v-html="fileCheckIcon"></span>
          <h2 class="text-base font-bold">البيانات الأساسية</h2>
        </div>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <!-- اسم المورد (يُستخدم لجلب المنتجات وإرسال supplier_id) -->
            <SelectInput v-model="formData.supplier_id" :disabled="isFromQuotation" :items="supplierItems"
              placeholder="اختر المورد" label="اسم المورد" :rules="[required()]" density="comfortable"
              item-title="title" item-value="value" />

            <TextInput v-model="formData.responsible_person" label="اسم المسؤول" placeholder="أدخل اسم المسؤول"
              :rules="[required()]" density="comfortable" />
            <DateTimePickerInput v-model="formData.po_datetime" label="تاريخ الطلبية" placeholder="اختر التاريخ والوقت"
              density="comfortable" :disabled="isEditMode" />
            <TelInput v-model="formData.responsible_phone" label="هاتف المسؤول" :rules="[required(), saudiPhone()]"
              density="comfortable" />
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block">موقع مصدر المواد <span
                  class="text-red-500">*</span></label>
              <div @click="openMapDialog('source')"
                :class="['flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer', sourceLocationError ? '!border-error-500 bg-error-50' : '!border-blue-400 hover:bg-blue-100']">
                <span class="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  :class="sourceLocationError ? 'text-error-700' : 'text-blue-900'">
                  {{ formData.source_location || 'حدد الموقع' }}
                </span>
                <span v-html="mapMarkerIcon"></span>
              </div>
              <p v-if="sourceLocationError" class="text-error-600 text-xs mt-1">{{ sourceLocationError }}</p>
            </div>
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block">موقع المشروع <span
                  class="text-red-500">*</span></label>
              <div @click="openMapDialog('target')"
                :class="locationError ? '!border-error-500 bg-error-50' : '!border-blue-400 hover:bg-blue-100'" class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg
                cursor-pointer hover:bg-blue-100">
                <span class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis"
                  :class="locationError ? 'text-error-700' : 'text-blue-900'">
                  {{ formData.target_location || 'حدد الموقع' }}
                </span>
                <span v-html="mapMarkerIcon"></span>
              </div>
              <p v-if="locationError" class="text-error-600 text-xs mt-1">{{ locationError }}</p>

            </div>
            <TextInput v-model="formData.project_name" label="اسم المشروع" placeholder="أدخل اسم المشروع"
              :rules="[required()]" density="comfortable" />
            <SelectInput v-model="formData.po_type" label="نوع الطلبية" :items="poTypeItems" item-title="title"
              item-value="value" density="comfortable" />
            <TextInput disabled v-model="formData.purchase_quotation_code" v-if="formData.purchase_quotation_code"
              readonly label="كود عرض السعر" density="comfortable" :hide-details="true">
              <template #append-inner>
                <v-tooltip location="top" content-class="custom-tooltip">
                  <template #activator="{ props: tooltipProps }">
                    <ButtonWithIcon variant="text" size="small" density="compact" custom-class="!min-w-0 p-0"
                      :prepend-icon="HelpCircleIcon" v-bind="tooltipProps" />
                  </template>
                  <div>كود عرض السعر</div>
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
            <h2 class="text-base font-bold">تفاصيل النقل</h2>
          </div>
          <ButtonWithIcon color="primary-600" variant="flat" rounded="lg" @click="handleAddLogisticsDetail">
            أضف خدمة نقل
          </ButtonWithIcon>
        </div>
        <!-- Logistics Details Cards (نفس هيكل طلبات خدمة النقل) -->
        <div class="px-6 pb-6 space-y-4">
          <div v-for="(detail, index) in logisticsDetails" :key="index" class="border !border-gray-200 rounded-3xl p-6">
            <div class="flex gap-4 items-stretch">
              <div class="flex flex-wrap gap-x-2 gap-y-0">
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع المواد المنقولة</label>
                  <p class="text-base font-semibold text-gray-900">{{ getCategoriesNames(detail.material_type) }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد الرحلات</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.trip_no }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">مدة التنفيذ</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.actual_execution_interval ?? '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">أوقات النقل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.am_pm_interval === 'am' ? 'صباحاً' :
                    detail.am_pm_interval === 'pm' ? 'مساءً' : (detail.am_pm_interval || '—') }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ بدء النقل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.from_date || '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ انتهاء النقل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.to_date || '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع مركبة النقل</label>
                  <p class="text-base font-semibold text-gray-900">{{ getTransportTypeNames(detail.transport_type) }}
                  </p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد مركبات النقل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.transport_no != null ? detail.transport_no
                    + ' مركبة' : '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">مبلغ النقل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.transport_amount ?? '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التفريغ</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.loading_responsible_party || '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التحميل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.downloading_responsible_party || '—' }}</p>
                </div>
                <v-divider vertical class="my-6" v-if="detail.target_location"></v-divider>
                <div class="info-item-bordered px-4 py-2" v-if="detail.target_location">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع التسليم</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.target_location }}</p>
                </div>
                <v-divider vertical class="my-6" v-if="detail.source_location"></v-divider>
                <div class="info-item-bordered px-4 py-2" v-if="detail.source_location">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع الإستلام</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.source_location }}</p>
                </div>
              </div>
              <ButtonWithIcon :icon="tableEditIcon" icon-only @click="handleEditLogisticsDetail(detail)" size="x-small"
                rounded="lg" color="primary" variant="text" />
            </div>
            <div class="flex justify-end gap-2 mt-2">
              <ButtonWithIcon color="primary-800" variant="flat" class="text-white" rounded="lg"
                :prepend-icon="globeIcon" @click="openLogisticsLocationDialog(index, 'source')">موقع الاستلام
              </ButtonWithIcon>
              <ButtonWithIcon color="primary-800" variant="flat" class="text-white" rounded="lg"
                :prepend-icon="globeIcon" @click="openLogisticsLocationDialog(index, 'target')">موقع التسليم
              </ButtonWithIcon>
            </div>
          </div>
          <div v-if="logisticsDetails.length === 0" class="text-center py-12">
            <p class="text-gray-500 text-lg">لا توجد تفاصيل نقل مضافة</p>
            <p class="text-gray-400 text-sm mt-2">اضغط على "أضف خدمة نقل" لإضافة تفاصيل جديدة</p>
          </div>
        </div>
      </div>

      <!-- Products -->
      <div class="mb-8 bg-white rounded-3xl border !border-gray-100">
        <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3">
          <div class="flex items-center gap-2 text-primary-600">
            <span v-html="packageIcon"></span>
            <h2 class="text-xl font-bold">المنتجات</h2>
          </div>
        </div>
        <div class="mb-4">
          <DataTable :headers="headers" :items="tableItems" show-actions force-show-edit force-show-delete
            @edit="handleEditProduct" @delete="handleDeleteProduct" />
        </div>
        <div class="flex justify-center">
          <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold w-75"
            @click="handleAddProduct">
            + إضافة منتج جديد
          </ButtonWithIcon>
        </div>
      </div>

      <!-- Trip Details Section -->
      <div class="bg-white rounded-3xl border !border-gray-100">
        <div class="px-6 py-6">
          <div class="flex items-center gap-2 mb-2">
            <span v-html="busIcon"></span>
            <h2 class="text-base font-bold text-primary-600">تفاصيل الرحلات</h2>
          </div>
        </div>

        <!-- Trip Details Table -->
        <DataTable :headers="tripHeaders" :items="tripItems" show-actions force-show-edit
          @edit="handleEditTrip">
        </DataTable>
      </div>

      <!-- بيانات الدفع وملخص المبالغ (آخر قسم قبل أزرار الحفظ) -->
      <div class="grid grid-cols-1 xl:grid-cols-3 justify-between gap-4 bg-qallab-dashboard-bg py-5 px-2">
        <div class="bg-white rounded-2xl xl:col-span-2">
          <div class="flex items-center gap-2 p-6 border-b !border-gray-200">
            <span v-html="CoinHandIcon"></span>
            <h2 class="text-base font-bold text-primary-600">بيانات الدفع</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput v-model="formData.payment_method" :items="paymentMethodItems" density="comfortable"
                placeholder="حدد طريقة الدفع" label="طريقة الدفع" item-title="title" item-value="value"
                :rules="[required()]" />
              <PriceInput showRialIcon v-model="formData.upfront_payment" density="comfortable" label="دفعة مقدمة"
                placeholder="أدخل قيمة الدفعة" />

              <PriceInput label="مدة رفع المستخلص" v-model="formData.invoice_interval" placeholder="أدخل المدة بالأيام"
                :rules="[numeric()]" density="comfortable">
                <template #append-inner>
                  <span class="text-gray-500 text-sm"> يوم </span>
                </template>
              </PriceInput>
              <PriceInput label="مدة السداد" v-model="formData.payment_term_no" placeholder="أدخل المدة بالأيام"
                :rules="[numeric()]" density="comfortable">
                <template #append-inner>
                  <span class="text-gray-500 text-sm"> يوم </span>
                </template>
              </PriceInput>

              <TextInputWithSelect v-model="formData.late_fee" v-model:selectValue="formData.late_fee_type"
                label="غرامة التأخير" placeholder="أدخل المبلغ" type="number" :rules="[numeric(), positive()]"
                select-width="110px" :select-items="feeTypeItems" select-placeholder="اختر" />

              <TextInputWithSelect v-model="formData.cancel_fee" v-model:selectValue="formData.cancel_fee_type"
                label="غرامة الإلغاء" placeholder="أدخل المبلغ" type="number" :rules="[numeric(), positive()]"
                select-width="110px" :select-items="feeTypeItems" select-placeholder="اختر" />
            </div>
          </div>
        </div>

        <div class="bg-primary-25 rounded-2xl overflow-hidden border !border-gray-200">
          <table class="w-full">
            <thead>
              <tr class="bg-primary-400">
                <th class="text-white font-semibold text-base py-3 px-4 text-center border-l !border-gray-200">
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
                  قيمة النقل
                </td>
                <td class="py-5 px-4 text-center text-gray-600">
                  <span class="font-semibold text-gray-900">{{ formatCurrency(summaryTotals.transportValue) }}</span>
                </td>
              </tr>

              <tr class="border-b !border-gray-200">
                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                  الضريبة
                </td>
                <td class="py-5 px-4 text-center text-gray-600">
                  {{ summaryTotals.taxRatePercent }}%
                </td>
              </tr>

              <tr class="border-b !border-gray-200">
                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                  اجمالي الضريبة
                </td>
                <td class="py-5 px-4 text-center text-gray-600">
                  <span class="font-semibold text-gray-900">{{ formatCurrency(summaryTotals.taxAmount) }}</span>
                </td>
              </tr>

              <tr class="border-b !border-gray-200">
                <td class="py-5 px-4 text-center font-bold text-gray-900 border-l !border-gray-200">
                  الإجمالي النهائي
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
            custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon" label="حفظ والعودة للقائمة"
            :loading="isSubmitting" @click="handleSubmit('return_to_list')" />
          <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
            custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
            label="حفظ وإنشاء جديد" :loading="isSubmitting" @click="handleSubmit('create_new')" />
        </div>
      </div>
    </div>

    <Map v-model="showMapDialog"
      :latitude="String(currentMapType === 'target' ? (formData.target_latitude || '') : (formData.source_latitude || ''))"
      :longitude="String(currentMapType === 'target' ? (formData.target_longitude || '') : (formData.source_longitude || ''))"
      :address="String(currentMapType === 'target' ? (formData.target_location || '') : (formData.source_location || ''))"
      @location-selected="handleLocationSelected" />

    <AddProductDialog v-model="showAddProductDialog" :request-type="productDialogMode"
      :unit-items="unitItems" :transport-types="transportTypeItems"
      items-endpoint="/items/list?with_category=true"
      :edit-product="(editingProduct as any)"
      :existing-products="(productDialogMode === 'logistics' ? productTableItems : tripTableItems) as any[]"
      @saved="handleProductSaved" @product-updated="handleProductUpdated" />

    <AddLogisticsDetailDialog v-model="showAddLogisticsDialog" :transport-types="transportTypeItems"
      :am-pm-interval-options="amPmIntervalItems" :categories-items="categoriesItems"
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
