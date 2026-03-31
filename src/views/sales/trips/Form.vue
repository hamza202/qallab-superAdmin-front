<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { useNotification } from '@/composables/useNotification';
import { useForm } from '@/composables/useForm';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import AppFormBreadcrumb from '@/components/common/AppFormBreadcrumb.vue';
import AddProductDialog from '@/components/price-offers/AddProductDialog.vue';
import EditProductsDialog from '@/components/price-offers/EditProductsDialog.vue';
import Map from '@/components/common/Map.vue';
import AddTripDetailsDialog, { type TripLogisticsDetail } from '@/components/trips/AddTripDetailsDialog.vue';
import EditTripDetailsDialog from '@/components/trips/EditTripDetailsDialog.vue';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon } from '@/components/icons/globalIcons';
import { mapMarkerIcon, packageIcon, downloadIcon, messagePlusIcon, busIcon } from '@/components/icons/priceOffersIcons';

// Interface for product items in the table
interface ProductTableItem {
  item_id: number;
  item_name: string;
  unit_id: number | null;
  unit_name: string;
  quantity: number | null;
  transport_type: number | null;
  transport_no: number | null;
  transport_type_name: string;
  notes: string;
  id?: number; // For edit mode
  isAdded?: boolean; // For dialog state
}

const { t } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();
const { success, error, warning, apiError } = useNotification();
const { formRef, isFormValid, validate } = useForm();

const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const pickupId = computed(() => route.params.pickupId as string)
const isLoading = ref(false);
const isSubmitting = ref(false);
const isFormDataLoaded = ref(false);
const saleOrderId = computed(() => route.query.sale_order_id as string | undefined);
const routeFrom = computed(() => route.query.from as string | undefined);

const tripCode = ref("");

// Check if coming from material-product page (has sale_order_id but not from=logistics)
const isFromMaterialProduct = computed(() => !!saleOrderId.value && routeFrom.value !== 'logistics');

// Logistics orders list for material-product flow
const soLogisticItems = ref<{ title: string; value: number; code: string }[]>([]);
const selectedSoLogisticId = ref<number | null>(null);
const loadingSoLogistics = ref(false);

// Edit mode specific fields
const selectedCustomerId = ref<number | null>(null);
const customerSaleOrderItems = ref<{ title: string; value: number }[]>([]);
const selectedCustomerSaleOrderId = ref<number | null>(null);
const loadingCustomerSaleOrders = ref(false);
const tripCategory = ref<string | null>(null); // Category from API response for edit mode
const hasCustomerDataFromApi = ref(false); // Track if customer data came from API in edit mode

const productDialogQueryParams = computed(() => {
  if (isEditMode.value) {
    return tripCategory.value === 'logistics' ? undefined : { material_type: 1 };
  }
  return routeFrom.value === 'logistics' ? undefined : { material_type: 1 };
});

const formData = ref({
  so_pickup_id: null as number | null,
  sale_order_id: null as number | null,
  supplier_logistic_id: null as number | null,
  planned_arrival_loading: "",
  planned_arrival_downloading: "",
  total_quantity_ton: null as number | null,
  total_quantity_m3: null as number | null,
  total_quantities: 1 as number | null,
  tracking_no_point: null as number | null,
  bill_of_lading: null as number | null,
  am_pm_interval: "" as string,
  loading_responsible_party: "",
  downloading_responsible_party: "",
  customer_total_trip_value: null as number | null,
  logistic_company_total_trip_value: null as number | null,
  target_location: "",
  target_latitude: null as number | null,
  target_longitude: null as number | null,
  source_location: "",
  source_latitude: null as number | null,
  source_longitude: null as number | null,
  notes: "",
});

const unitItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);
const productTableItems = ref<ProductTableItem[]>([]);
const originalProductIds = ref<Record<number, number>>({});
const showAddProductDialog = ref(false);
const showEditProductsDialog = ref(false);
const editingProduct = ref<any>(null);

const customerTripDetails = ref<TripLogisticsDetail[]>([]);
const logisticCompanyTripDetails = ref<TripLogisticsDetail[]>([]);
const availableTripDetails = ref<TripLogisticsDetail[]>([]);
const showEditCustomerDetailsDialog = ref(false);
const showEditLogisticDetailsDialog = ref(false);
const showCustomerRowDetailsDialog = ref(false);
const showLogisticRowDetailsDialog = ref(false);
const editingTripDetail = ref<TripLogisticsDetail | null>(null);

const showMapDialog = ref(false);
const amPmIntervalItems = ref<any[]>([]);
const formErrors = ref<Record<string, string[]>>({});

const fetchConstants = async () => {
  try {
    const res = await api.get<any>('/sales/trips/constants');
    const data = res.data;
    if (data) {
      amPmIntervalItems.value = data.am_pm_interval?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      transportTypeItems.value = data.transport_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
    }
  } catch (e) {
    console.error('Error fetching constants:', e);
  }
}

const fetchSuppliers = async (search = '', cursor?: string, perPage = 15) => {
  if (isEditMode.value && !isFormDataLoaded.value) {
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (isFormDataLoaded.value) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(true);
      }, 5000);
    });
  }

  const params: any = { 
    per_page: perPage,
    service_type: 'logistic_company'
  };
  if (search) {
    params.name = search;
  }
  if (cursor) {
    params.cursor = cursor;
  }
  if (formData.value.supplier_logistic_id) {
    params.order_by_id = formData.value.supplier_logistic_id;
  }

  const res = await api.get<any>('/suppliers/list', { params });

  return {
    data: res.data || [],
    next_cursor: res.pagination?.next_cursor || null,
  };
};

const waitForCustomerData = async () => {
  if (!isEditMode.value) return;

  if (isFormDataLoaded.value && selectedCustomerId.value) {
    return;
  }

  await new Promise(resolve => {
    const checkInterval = setInterval(() => {
      if (isFormDataLoaded.value && selectedCustomerId.value) {
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

// Fetch customers for edit mode
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
  if (selectedCustomerId.value) {
    params.order_by_id = selectedCustomerId.value;
  }

  const res = await api.get<any>('/customers/list', { params });

  return {
    data: res.data || [],
    next_cursor: res.pagination?.next_cursor || null,
  };
};

// Fetch customer sale orders for edit mode
const fetchCustomerSaleOrders = async () => {
  if (!isEditMode.value || !selectedCustomerId.value) return;
  
  loadingCustomerSaleOrders.value = true;
  try {
    const res = await api.get<any>('/sales/orders/list', {
      params: {
        customer_id: selectedCustomerId.value,
        // so_type: 'so_with_logistics',
        // category: tripCategory.value || 'building_material'
        category: 'logistics,building_material'
      }
    });
    if (Array.isArray(res.data)) {
      customerSaleOrderItems.value = res.data.map((item: any) => ({
        title: item.code,
        value: item.id
      }));
    }
  } catch (e) {
    console.error('Error fetching customer sale orders:', e);
  } finally {
    loadingCustomerSaleOrders.value = false;
  }
}

const fetchUnits = async () => {
  try {
    const res = await api.get<any>('/units/list');
    if (Array.isArray(res.data)) {
      unitItems.value = res.data.map((i: any) => ({
        title: i.name,
        value: i.id,
      }));
    }
  } catch (e) {
    console.error('Error fetching units:', e);
  }
};

const getTransportTypeName = (typeValue: string | number | null): string => {
  if (typeValue === null || typeValue === undefined) return '';
  const found = transportTypeItems.value.find(t => t.value == typeValue);
  return found ? found.title : '';
};

const vehicleTypesFromTransportField = (transportType: unknown): { transport_type: number; transport_no: number | null }[] => {
  if (transportType == null) return [];
  if (Array.isArray(transportType)) {
    return transportType
      .map((t: any) => {
        const n = parseInt(String(t), 10);
        return Number.isNaN(n) ? null : { transport_type: n, transport_no: null as number | null };
      })
      .filter((x): x is { transport_type: number; transport_no: number | null } => x != null);
  }
  const n = parseInt(String(transportType), 10);
  return Number.isNaN(n) ? [] : [{ transport_type: n, transport_no: null }];
};

/** ملء المنتجات وجداول تفاصيل الرحلة من استجابة طلبية النقل (so_trip_details أو items + so_logistics_product_details) */
const populateTripFormFromLogisticsOrderData = (data: any): boolean => {
  if (!data) return false;

  if (data.so_trip_details && Array.isArray(data.so_trip_details) && data.so_trip_details.length > 0) {
    const availableDetails: TripLogisticsDetail[] = [];
    const productItems: ProductTableItem[] = [];

    data.so_trip_details.forEach((item: any) => {
      const vehicleTypes = vehicleTypesFromTransportField(item.transport_type);

      availableDetails.push({
        item_id: item.item_id,
        item_name: item.item_name || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || '',
        quantity: item.quantity || null,
        transport_type: [],
        vehicle_type_no: vehicleTypes,
        price: null
      });

      const existingIndex = productItems.findIndex(p => p.item_id === item.item_id);
      if (existingIndex === -1) {
        const firstT = vehicleTypes.length > 0 ? vehicleTypes[0].transport_type : null;
        productItems.push({
          item_id: item.item_id,
          item_name: item.item_name || '',
          unit_id: item.unit_id,
          unit_name: item.unit_name || '',
          quantity: item.quantity || null,
          transport_type: firstT,
          transport_no: null,
          transport_type_name: getTransportTypeName(firstT),
          notes: '',
          isAdded: true
        });
      }
    });

    availableTripDetails.value = JSON.parse(JSON.stringify(availableDetails));
    customerTripDetails.value = JSON.parse(JSON.stringify(availableDetails));

    const logistcDetails = JSON.parse(JSON.stringify(availableDetails));
    logistcDetails.forEach((ld: any) => { ld.price = null; });
    logisticCompanyTripDetails.value = logistcDetails;

    productTableItems.value = productItems;
    return true;
  }

  if (data.items && Array.isArray(data.items) && data.items.length > 0) {
    const logisticsList = data.so_logistics_product_details ?? data.logistics_product_details;
    const logisticsByItemId: Record<number, any> = {};
    if (Array.isArray(logisticsList)) {
      logisticsList.forEach((log: any) => {
        const iid = Number(log.item_id);
        if (!Number.isNaN(iid) && logisticsByItemId[iid] === undefined) {
          logisticsByItemId[iid] = log;
        }
      });
    }

    const availableDetails: TripLogisticsDetail[] = [];
    const productItems: ProductTableItem[] = [];

    data.items.forEach((item: any) => {
      const itemId = Number(item.item_id);
      const log = logisticsByItemId[itemId];
      const vehicleTypes =
        log != null
          ? vehicleTypesFromTransportField(log.transport_type)
          : vehicleTypesFromTransportField(item.transport_type);

      availableDetails.push({
        item_id: itemId,
        item_name: item.item_name || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || '',
        quantity: item.quantity ?? null,
        transport_type: [],
        vehicle_type_no: vehicleTypes,
        price: null
      });

      const firstT =
        vehicleTypes.length > 0
          ? vehicleTypes[0].transport_type
          : (item.transport_type != null
            ? (Array.isArray(item.transport_type)
              ? parseInt(String(item.transport_type[0]), 10)
              : parseInt(String(item.transport_type), 10))
            : null);

      productItems.push({
        item_id: itemId,
        item_name: item.item_name || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || '',
        quantity: item.quantity ?? null,
        transport_type: Number.isNaN(firstT as number) ? null : firstT,
        transport_no: null,
        transport_type_name: getTransportTypeName(Number.isNaN(firstT as number) ? null : firstT),
        notes: '',
        isAdded: true
      });
    });

    availableTripDetails.value = JSON.parse(JSON.stringify(availableDetails));
    customerTripDetails.value = JSON.parse(JSON.stringify(availableDetails));

    const logistcDetails = JSON.parse(JSON.stringify(availableDetails));
    logistcDetails.forEach((ld: any) => { ld.price = null; });
    logisticCompanyTripDetails.value = logistcDetails;

    productTableItems.value = productItems;
    return true;
  }

  return false;
};

// Fetch logistics orders list for material-product flow
const fetchSoLogisticsList = async () => {
  if (!isFromMaterialProduct.value || !formData.value.supplier_logistic_id) return;
  
  loadingSoLogistics.value = true;
  try {
    const res = await api.get<any>('/sales/orders/list', {
      params: {
        supplier_id: formData.value.supplier_logistic_id,
        category: 'logistics'
      }
    });
    if (Array.isArray(res.data)) {
      soLogisticItems.value = res.data.map((item: any) => ({
        title: item.code,
        value: item.id,
        code: item.code
      }));
    }
  } catch (e) {
    console.error('Error fetching logistics orders:', e);
  } finally {
    loadingSoLogistics.value = false;
  }
};

// Fetch logistics orders list for edit mode (without isFromMaterialProduct check)
const fetchSoLogisticsListForEdit = async () => {
  if (!formData.value.supplier_logistic_id) return;
  
  loadingSoLogistics.value = true;
  try {
    const res = await api.get<any>('/sales/orders/list', {
      params: {
        supplier_id: formData.value.supplier_logistic_id,
        category: 'logistics'
      }
    });
    if (Array.isArray(res.data)) {
      soLogisticItems.value = res.data.map((item: any) => ({
        title: item.code,
        value: item.id,
        code: item.code
      }));
    }
  } catch (e) {
    console.error('Error fetching logistics orders:', e);
  } finally {
    loadingSoLogistics.value = false;
  }
};

// Fetch logistics order details when selected
const fetchSoLogisticDetails = async () => {
  if (!selectedSoLogisticId.value || !formData.value.supplier_logistic_id) return;
  
  const selectedItem = soLogisticItems.value.find(item => item.value === selectedSoLogisticId.value);
  if (!selectedItem) return;
  
  isLoading.value = true;
  try {
    const res = await api.get<any>('/sales/orders/list', {
      params: {
        supplier_id: formData.value.supplier_logistic_id,
        category: 'logistics',
        with_so_trip_details: true,
        with_so_logistics_product_details: true,
        code: selectedItem.code
      }
    });
    
    const data = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
    if (!data) return;

    if (populateTripFormFromLogisticsOrderData(data)) {
      syncProductsToTripDetails();
    }
  } catch (err: any) {
    console.error('Error fetching logistics order details:', err);
    error(err?.response?.data?.message || t('sales.forms.common.messages.loadLogisticsOrderFailed'));
  } finally {
    isLoading.value = false;
  }
};

// Fetch logistics order details for edit mode (similar to fetchSoLogisticDetails but for edit)
const fetchSoLogisticDetailsForEdit = async () => {
  if (!selectedSoLogisticId.value || !formData.value.supplier_logistic_id) return;
  
  const selectedItem = soLogisticItems.value.find(item => item.value === selectedSoLogisticId.value);
  if (!selectedItem) return;
  
  isLoading.value = true;
  try {
    const res = await api.get<any>('/sales/orders/list', {
      params: {
        supplier_id: formData.value.supplier_logistic_id,
        category: 'logistics',
        with_so_trip_details: true,
        with_so_logistics_product_details: true,
        code: selectedItem.code
      }
    });
    
    const data = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
    if (!data) return;

    if (populateTripFormFromLogisticsOrderData(data)) {
      syncProductsToTripDetails();
    }
  } catch (err: any) {
    console.error('Error fetching logistics order details for edit:', err);
    error(err?.response?.data?.message || t('sales.forms.common.messages.loadLogisticsOrderFailed'));
  } finally {
    isLoading.value = false;
  }
};

const fetchSoPickupData = async () => {
  if (!pickupId.value) return;
  console.log('sss');

  isLoading.value = true;
  try {
    const res = await api.get<any>(`/sales/so-pickups/${pickupId.value}`);
    const data = res?.data != null ? res.data : res;

    if (!data) return;

    // Set the so_pickup_id in formData
    formData.value.so_pickup_id = data.id || null;

    // Populate products from SO pickup items
    if (data.items && Array.isArray(data.items)) {
      productTableItems.value = data.items.map((item: any) => ({
        item_id: item.item_id,
        item_name: item.item_name || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || '',
        quantity: item.quantity || null,
        transport_type: null,
        transport_no: '',
        transport_type_name: '',
        notes: '',
        isAdded: true
      }));
      syncProductsToTripDetails();
    }
  } catch (err: any) {
    console.error('Error fetching SO pickup data:', err);
    error(err?.response?.data?.message || t('sales.forms.common.messages.loadReceivingFailed'));
  } finally {
    isLoading.value = false;
  }
};

const fetchSaleOrderData = async () => {
  if (!saleOrderId.value) return;

  isLoading.value = true;
  try {
    const endpointUrl = routeFrom.value === 'logistics' 
      ? `/sales/orders/logistics/${saleOrderId.value}` 
      : `/sales/orders/building-materials/${saleOrderId.value}`;
    const res = await api.get<any>(endpointUrl);
    const data = res?.data != null ? res.data : res;

    if (!data) return;

    formData.value.sale_order_id = data.id || null;

    if (routeFrom.value === 'logistics') {
      // Handle logistics order response
      formData.value.source_location = data.source_location || "";
      formData.value.source_latitude = data.source_latitude ? parseFloat(data.source_latitude) : null;
      formData.value.source_longitude = data.source_longitude ? parseFloat(data.source_longitude) : null;
      formData.value.target_location = data.target_location || "";
      formData.value.target_latitude = data.target_latitude ? parseFloat(data.target_latitude) : null;
      formData.value.target_longitude = data.target_longitude ? parseFloat(data.target_longitude) : null;

      // Populate products from so_product_details and so_trip_details
      const productItems: ProductTableItem[] = [];

      // Add items from so_product_details
      if (data.so_product_details && Array.isArray(data.so_product_details)) {
        data.so_product_details.forEach((item: any) => {
          productItems.push({
            item_id: item.item_id,
            item_name: item.item_name || '',
            unit_id: item.unit_id,
            unit_name: item.unit_name || '',
            quantity: item.quantity || null,
            transport_type: item.transport_type ?? null,
            transport_no: item.trip_no || null,
            transport_type_name: getTransportTypeName(item.transport_type ?? null),
            notes: '',
            isAdded: true
          });
        });
      }

      // Add items from so_trip_details
      if (data.so_trip_details && Array.isArray(data.so_trip_details)) {
        const availableDetails: TripLogisticsDetail[] = [];

        data.so_trip_details.forEach((item: any) => {
          const vehicleTypes = Array.isArray(item.transport_type) 
            ? item.transport_type.map((t: any) => ({ transport_type: parseInt(t), transport_no: null }))
            : (item.transport_type != null ? [{ transport_type: parseInt(item.transport_type), transport_no: null }] : []);
            
          availableDetails.push({
            item_id: item.item_id,
            item_name: item.item_name || '',
            unit_id: item.unit_id,
            unit_name: item.unit_name || '',
            quantity: item.quantity || null,
            transport_type: [],
            vehicle_type_no: vehicleTypes,
            price: null
          });

          // Check if item already exists in productItems
          const existingIndex = productItems.findIndex(p => p.item_id === item.item_id);
          if (existingIndex === -1) {
            // Add new item
            productItems.push({
              item_id: item.item_id,
              item_name: item.item_name || '',
              unit_id: item.unit_id,
              unit_name: item.unit_name || '',
              quantity: item.quantity || null,
              transport_type: Array.isArray(item.transport_type) && item.transport_type.length > 0 
                ? parseInt(item.transport_type[0]) 
                : (item.transport_type != null ? parseInt(item.transport_type) : null),
              transport_no: null,
              transport_type_name: Array.isArray(item.transport_type) && item.transport_type.length > 0 
                ? getTransportTypeName(parseInt(item.transport_type[0])) 
                : (item.transport_type != null ? getTransportTypeName(parseInt(item.transport_type)) : ''),
              notes: '',
              isAdded: true
            });
          }
        });

        availableTripDetails.value = JSON.parse(JSON.stringify(availableDetails));
        customerTripDetails.value = JSON.parse(JSON.stringify(availableDetails));
        
        const logistcDetails = JSON.parse(JSON.stringify(availableDetails));
        logistcDetails.forEach((ld: any) => ld.price = null);
        logisticCompanyTripDetails.value = logistcDetails;
      }

      if (productItems.length > 0) {
        productTableItems.value = productItems;
      } else if (!populateTripFormFromLogisticsOrderData(data)) {
        productTableItems.value = [];
      }
      if (productTableItems.value.length > 0) {
        syncProductsToTripDetails();
      }
    } else {
      // Handle building materials order response
      formData.value.source_location = data.source_location || "";
      formData.value.source_latitude = data.source_latitude ? parseFloat(data.source_latitude) : null;
      formData.value.source_longitude = data.source_longitude ? parseFloat(data.source_longitude) : null;
      formData.value.target_location = data.target_location || "";
      formData.value.target_latitude = data.target_latitude ? parseFloat(data.target_latitude) : null;
      formData.value.target_longitude = data.target_longitude ? parseFloat(data.target_longitude) : null;

      // Populate products from sale order items
      if (data.items && Array.isArray(data.items)) {
        productTableItems.value = data.items.map((item: any) => ({
          item_id: item.item_id,
          item_name: item.item_name || '',
          unit_id: item.unit_id,
          unit_name: item.unit_name || '',
          quantity: item.quantity || null,
          transport_type: null,
          transport_no: '',
          transport_type_name: '',
          notes: '',
          isAdded: true
        }));
        
        // Populate available details too
        syncProductsToTripDetails();
        availableTripDetails.value = JSON.parse(JSON.stringify(customerTripDetails.value));
      }
    }
  } catch (err: any) {
    console.error('Error fetching sale order data:', err);
    error(err?.response?.data?.message || t('sales.forms.common.messages.loadOrderDataFailed'));
  } finally {
    isLoading.value = false;
  }
};

const getUnitName = (unit_id: any): string => {
  const found = unitItems.value.find(u => u.value === unit_id);
  return found ? found.title : '';
}
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

const fetchFormData = async () => {
  if (!isEditMode.value || !routeId.value) return;
  isLoading.value = true;
  try {
    const raw = await api.get<any>(`/sales/trips/${routeId.value}`);
    const data = raw?.data != null ? raw.data : raw;

    if (!data) return;
    tripCode.value = data.code || "";
    tripCategory.value = data.category || 'building_material';
    formData.value = {
      sale_order_id: data.sale_order_id || null,
      so_pickup_id: data.so_pickup_id || null,
      supplier_logistic_id: data.supplier_logistic_id || null,
      planned_arrival_loading: normalizePoDateTime(String(data.planned_arrival_loading)) || "",
      planned_arrival_downloading: normalizePoDateTime(String(data.planned_arrival_downloading)) || "",
      total_quantity_ton: data.total_quantity_ton || null,
      total_quantity_m3: data.total_quantity_m3 || null,
      total_quantities: data.total_quantities || 1,
      tracking_no_point: data.tracking_no_point || null,
      bill_of_lading: data.bill_of_lading || null,
      am_pm_interval: data.am_pm_interval || "",
      loading_responsible_party: data.loading_responsible_party || "",
      downloading_responsible_party: data.downloading_responsible_party || "",
      customer_total_trip_value: data.customer_total_trip_value || null,
      logistic_company_total_trip_value: data.logistic_company_total_trip_value || null,
      target_location: data.target_location || "",
      target_latitude: data.target_latitude || null,
      target_longitude: data.target_longitude || null,
      source_location: data.source_location || "",
      source_latitude: data.source_latitude || null,
      source_longitude: data.source_longitude || null,
      notes: data.notes || "",
    };

    // Populate products (items)
    if (data.items && Array.isArray(data.items)) {
      productTableItems.value = data.items.map((item: any) => {
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
          transport_type: item.transport_type,
          transport_no: item.transport_no,
          transport_type_name: getTransportTypeName(item.transport_type),
          notes: item.notes || '',
          isAdded: true
        };
      });
    }

    // Populate customer trip logistics details
    if (data.customer_trip_logistics_details && Array.isArray(data.customer_trip_logistics_details)) {
      customerTripDetails.value = data.customer_trip_logistics_details.map((item: any) => ({
        id: item.id,
        item_id: item.item_id,
        item_name: item.item_name || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || '',
        quantity: item.quantity,
        transport_type: Array.isArray(item.vehicle_type_no)
          ? item.vehicle_type_no.map((v: any) => v.transport_type)
          : [],
        vehicle_type_no: Array.isArray(item.vehicle_type_no)
          ? item.vehicle_type_no.map((v: any) => ({
              transport_type: v.transport_type,
              transport_no: v.transport_no != null ? parseFloat(v.transport_no) : null
            }))
          : [],
        price: item.customer_price != null ? parseFloat(item.customer_price) : null,
        isAdded: true
      }));
    }

    // Populate logistic company trip logistics details
    if (data.logistic_company_trip_logistics_details && Array.isArray(data.logistic_company_trip_logistics_details)) {
      logisticCompanyTripDetails.value = data.logistic_company_trip_logistics_details.map((item: any) => ({
        id: item.id,
        item_id: item.item_id,
        item_name: item.item_name || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || '',
        quantity: item.quantity,
        transport_type: Array.isArray(item.vehicle_type_no)
          ? item.vehicle_type_no.map((v: any) => v.transport_type)
          : [],
        vehicle_type_no: Array.isArray(item.vehicle_type_no)
          ? item.vehicle_type_no.map((v: any) => ({
              transport_type: v.transport_type,
              transport_no: v.transport_no != null ? parseFloat(v.transport_no) : null
            }))
          : [],
        price: item.logistics_company_price != null ? parseFloat(item.logistics_company_price) : null,
        isAdded: true
      }));
    }

    if (productTableItems.value.length > 0) {
      syncProductsToTripDetails();
    }
    
    // Populate edit mode: always fetch logistics orders list when supplier_logistic_id exists (from API or any change)
    if (formData.value.supplier_logistic_id) {
      await fetchSoLogisticsListForEdit();
    }
    if (data.so_logistic_id) {
      selectedSoLogisticId.value = data.so_logistic_id;
    }
    
    if (data.customer_id) {
      selectedCustomerId.value = data.customer_id;
      hasCustomerDataFromApi.value = true; // Mark that customer data came from API
      // Allow customer select to fetch once customer_id is ready
      isFormDataLoaded.value = true;
      // Fetch customer sale orders list after setting customer
      await fetchCustomerSaleOrders();
    }
    
    if (data.sale_order_id) {
      selectedCustomerSaleOrderId.value = data.sale_order_id;
    }
  } catch (err: any) {
    console.error('Error fetching trip data:', err);
    error(err?.response?.data?.message || t('sales.forms.common.messages.loadTripFailed'));
    isFormDataLoaded.value = true;
  } finally {
    isLoading.value = false;
    isFormDataLoaded.value = true;
  }
};

type SubmitOption = 'trips_list' | 'create_new' | 'pickup_list';

const handleSubmit = async (option: SubmitOption) => {
  if (!(await validate())) return;

  if (productTableItems.value.length === 0) {
    warning(t('sales.forms.common.validation.atLeastOneProduct'));
    return;
  }

  // Clear previous errors
  formErrors.value = {};

  // Validate required fields
  if (!formData.value.supplier_logistic_id) {
    formErrors.value['supplier_logistic_id'] = [t('sales.forms.common.validation.supplierLogisticIdError')];
  }
  if (!formData.value.target_location) {
    formErrors.value['target_location'] = [t('sales.forms.common.validation.deliveryLocationRequired')];
  }
  if (!formData.value.target_latitude) {
    formErrors.value['target_latitude'] = [t('sales.forms.common.validation.deliveryLatRequired')];
  }
  if (!formData.value.target_longitude) {
    formErrors.value['target_longitude'] = [t('sales.forms.common.validation.deliveryLngRequired')];
  }
  if (!formData.value.source_location) {
    formErrors.value['source_location'] = [t('sales.forms.common.validation.sourceLocationRequiredShort')];
  }
  if (!formData.value.source_latitude) {
    formErrors.value['source_latitude'] = [t('sales.forms.common.validation.sourceLatRequired')];
  }
  if (!formData.value.source_longitude) {
    formErrors.value['source_longitude'] = [t('sales.forms.common.validation.sourceLngRequired')];
  }

  if (Object.keys(formErrors.value).length > 0) {
    error(t('sales.forms.common.validation.fillAllRequired'));
    return;
  }

  isSubmitting.value = true;
  try {
    const payload: Record<string, any> = {
      ...formData.value,
      items: productTableItems.value.map(item => ({
        id: isEditMode.value ? item.id : null,
        item_id: item.item_id,
        unit_id: item.unit_id,
        quantity: item.quantity,
        transport_no: item.transport_no,
        transport_type: item.transport_type,
        notes: item.notes
      })),
      customer_trip_logistics_details: customerTripDetails.value.map(item => ({
        ...(isEditMode.value && item.id != null ? { id: item.id } : {}),
        item_id: item.item_id,
        unit_id: item.unit_id,
        quantity: item.quantity,
        customer_price: item.price,
        vehicle_type_no: item.vehicle_type_no
      })),
      logistic_company_trip_logistics_details: logisticCompanyTripDetails.value.map(item => ({
        ...(isEditMode.value && item.id != null ? { id: item.id } : {}),
        item_id: item.item_id,
        unit_id: item.unit_id,
        quantity: item.quantity,
        logistics_company_price: item.price,
        vehicle_type_no: item.vehicle_type_no
      }))
    };
    
    // Add so_logistic_id when coming from material-product page or in edit mode
    if ((isFromMaterialProduct.value || isEditMode.value) && selectedSoLogisticId.value) {
      payload.so_logistic_id = selectedSoLogisticId.value;
    }
    
    // Add customer_id and sale_order_id in edit mode
    if (isEditMode.value) {
      if (selectedCustomerId.value) {
        payload.customer_id = selectedCustomerId.value;
      }
      if (selectedCustomerSaleOrderId.value) {
        payload.sale_order_id = selectedCustomerSaleOrderId.value;
      }
    }
    
    // Add category based on routeFrom
    payload.category = routeFrom.value === 'logistics' ? 'logistics' : 'building_material';

    if (isEditMode.value) {
      await api.put(`/sales/trips/${routeId.value}`, payload);
      success(t('sales.forms.common.messages.tripUpdated'));
    } else {
      await api.post(`/sales/trips`, payload);
      success(t('sales.forms.common.messages.tripCreated'));
    }

    if (option === 'trips_list') {
      router.push({ name: 'SalesTripslist' });
    } else if (option === 'pickup_list') {
      router.push({ name: 'SalesSoPickupsList' });
    } else {
      // Reset form for new entry
      formData.value = {
        sale_order_id: null,
        so_pickup_id: null,
        supplier_logistic_id: null,
        planned_arrival_loading: "",
        planned_arrival_downloading: "",
        total_quantity_ton: null,
        total_quantity_m3: null,
        total_quantities: 1,
        tracking_no_point: null,
        bill_of_lading: null,
        am_pm_interval: "",
        loading_responsible_party: "",
        downloading_responsible_party: "",
        customer_total_trip_value: null,
        logistic_company_total_trip_value: null,
        target_location: "",
        target_latitude: null,
        target_longitude: null,
        source_location: "",
        source_latitude: null,
        source_longitude: null,
        notes: "",
      };
      productTableItems.value = [];
      tripCode.value = "";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (err: any) {
    console.error('Error submitting form:', err);
    apiError(err);
  } finally {
    isSubmitting.value = false;
  }
};

const currentMapType = ref<'source' | 'target'>('source');

const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
  if (currentMapType.value === 'target') {
    formData.value.target_latitude = parseFloat(location.latitude);
    formData.value.target_longitude = parseFloat(location.longitude);
    formData.value.target_location = location.address;
  } else {
    formData.value.source_latitude = parseFloat(location.latitude);
    formData.value.source_longitude = parseFloat(location.longitude);
    formData.value.source_location = location.address;
  }
};

const openMapDialog = (type: 'source' | 'target' = 'source') => {
  currentMapType.value = type;
  showMapDialog.value = true;
};

const addProduct = () => {
  editingProduct.value = null;
  showAddProductDialog.value = true;
};

const headers = computed(() => [
  { title: t('common.form.productName'), key: 'name' },
  { title: t('sales.forms.common.labels.quantity'), key: 'quantity' },
  { title: t('common.form.unit'), key: 'unit' },
  { title: t('sales.forms.common.labels.notes'), key: 'notes' },
]);

const syncProductsToTripDetails = () => {
  const syncToDetails = (
    existingDetails: TripLogisticsDetail[],
    products: ProductTableItem[]
  ): TripLogisticsDetail[] => {
    return products.map(product => {
      const existing = existingDetails.find(d => d.item_id === product.item_id);
      if (existing) {
        return {
          ...existing,
          item_name: product.item_name,
          unit_id: product.unit_id,
          unit_name: product.unit_name || getUnitName(product.unit_id),
          quantity: product.quantity,
        };
      }
      return {
        item_id: product.item_id,
        item_name: product.item_name,
        unit_id: product.unit_id,
        unit_name: product.unit_name || getUnitName(product.unit_id),
        quantity: product.quantity,
        transport_type: [],
        vehicle_type_no: [],
        price: null,
      };
    });
  };

  customerTripDetails.value = syncToDetails(customerTripDetails.value, productTableItems.value);
  logisticCompanyTripDetails.value = syncToDetails(logisticCompanyTripDetails.value, productTableItems.value);
};

const handleProductSaved = (products: any[]) => {
  const newItems: ProductTableItem[] = products.map(p => {
    const existing = productTableItems.value.find(e => e.item_id === p.item_id);
    const restoredId = existing?.id ?? originalProductIds.value[p.item_id] ?? p.id;
    return {
      ...p,
      id: restoredId,
      transport_type: p.transport_type ?? null,
      transport_type_name: getTransportTypeName(p.transport_type ?? null),
      notes: existing?.notes || p.notes || ''
    } as ProductTableItem;
  });
  productTableItems.value = newItems;
  syncProductsToTripDetails();
};

const tableItems = computed(() => productTableItems.value.map(item => ({
  id: item.item_id,
  item_id: item.item_id,
  name: item.item_name,
  quantity: item.quantity,
  unit: item.unit_name || getUnitName(item.unit_id),
  transport_type: item.transport_type_name,
  transport_no: item.transport_no || '--',
  notes: item.notes,
})));

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
    const existingNotes = productTableItems.value[index].notes;
    productTableItems.value[index] = {
      ...updatedProduct,
      transport_type: updatedProduct.transport_type ?? null,
      transport_type_name: getTransportTypeName(updatedProduct.transport_type ?? null),
      notes: existingNotes || updatedProduct.notes || ''
    } as ProductTableItem;
  }
  editingProduct.value = null;
  syncProductsToTripDetails();
};

const tripDetailsHeaders = computed(() => [
  { title: t('sales.forms.tables.tripProducts.itemName'), key: "item_name" },
  { title: t('sales.forms.common.labels.quantity'), key: "quantity" },
  { title: t('common.form.unit'), key: "unit_name" },
  { title: t('sales.forms.common.labels.itemVehicles'), key: "vehicle_type_no" },
  { title: t('sales.forms.common.labels.itemPrice'), key: "price" },
]);

const handleEditCustomerTripDetail = (item: any) => {
  const toEdit = customerTripDetails.value.find(p => p.item_id === item.item_id);
  if (toEdit) {
    editingTripDetail.value = { ...toEdit, isAdded: true };
    showCustomerRowDetailsDialog.value = true;
  }
};

const handleCustomerTripDetailRowUpdated = (updatedProduct: TripLogisticsDetail) => {
  const index = customerTripDetails.value.findIndex(p => p.item_id === updatedProduct.item_id);
  if (index !== -1) {
    customerTripDetails.value[index] = { ...updatedProduct };
  }
  editingTripDetail.value = null;
};

const handleEditLogisticTripDetail = (item: any) => {
  const toEdit = logisticCompanyTripDetails.value.find(p => p.item_id === item.item_id);
  if (toEdit) {
    editingTripDetail.value = { ...toEdit, isAdded: true };
    showLogisticRowDetailsDialog.value = true;
  }
};

const handleLogisticTripDetailRowUpdated = (updatedProduct: TripLogisticsDetail) => {
  const index = logisticCompanyTripDetails.value.findIndex(p => p.item_id === updatedProduct.item_id);
  if (index !== -1) {
    logisticCompanyTripDetails.value[index] = { ...updatedProduct };
  }
  editingTripDetail.value = null;
};

const handleCustomerDetailsUpdated = (details: TripLogisticsDetail[]) => {
  customerTripDetails.value = details;
};

const handleLogisticDetailsUpdated = (details: TripLogisticsDetail[]) => {
  logisticCompanyTripDetails.value = details;
};

const handleEditProductsBulk = (updatedProducts: any[]) => {
  productTableItems.value = updatedProducts.map((updated: any) => {
    const existing = productTableItems.value.find(p => p.item_id === updated.item_id);
    return {
      item_id: updated.item_id,
      item_name: updated.item_name,
      unit_id: updated.unit_id,
      unit_name: updated.unit_name,
      quantity: updated.quantity,
      transport_type: updated.transport_type ?? existing?.transport_type ?? null,
      transport_no: updated.transport_no ?? existing?.transport_no ?? null,
      transport_type_name: getTransportTypeName(updated.transport_type ?? existing?.transport_type ?? null),
      notes: existing?.notes ?? updated.notes ?? '',
      id: existing?.id ?? updated.id,
      isAdded: true,
    } as ProductTableItem;
  });
  showEditProductsDialog.value = false;
  syncProductsToTripDetails();
};

const handleDeleteProduct = (item: any) => {
  const index = productTableItems.value.findIndex(p => p.item_id === item.item_id);
  if (index !== -1) {
    productTableItems.value.splice(index, 1);
  }
  syncProductsToTripDetails();
};

// Watch for supplier_logistic_id: fetch logistics list when it exists or changes (edit load handled in fetchFormData)
watch(() => formData.value.supplier_logistic_id, (newVal, oldVal) => {
  if (isFromMaterialProduct.value && newVal) {
    selectedSoLogisticId.value = null;
    soLogisticItems.value = [];
    availableTripDetails.value = [];
    customerTripDetails.value = [];
    logisticCompanyTripDetails.value = [];
    productTableItems.value = [];
    fetchSoLogisticsList();
  } else if (isEditMode.value && newVal && (oldVal !== null && oldVal !== undefined)) {
    // Edit mode: when user changes supplier (not initial load — initial load is handled in fetchFormData)
    selectedSoLogisticId.value = null;
    soLogisticItems.value = [];
    fetchSoLogisticsListForEdit();
  }
});

// Watch for selectedSoLogisticId changes to fetch logistics order details
watch(selectedSoLogisticId, (newVal, oldVal) => {
  if (isFromMaterialProduct.value && newVal) {
    fetchSoLogisticDetails();
  } else if (isEditMode.value && newVal && oldVal !== null) {
    // In edit mode, fetch logistics order details when selection changes (not on initial load)
    fetchSoLogisticDetailsForEdit();
  }
});

// Watch for selectedCustomerId changes to fetch customer sale orders (edit mode only)
watch(selectedCustomerId, (newVal) => {
  if (isEditMode.value && newVal) {
    // Reset selected sale order when customer changes
    selectedCustomerSaleOrderId.value = null;
    customerSaleOrderItems.value = [];
    // Fetch new customer sale orders list
    fetchCustomerSaleOrders();
  }
});

onMounted(async () => {
  fetchUnits();
  fetchConstants();
  
  // Customer data will be loaded via server-side select in edit mode
  
  if (routeId.value) {
    await fetchFormData();
  } else if (pickupId.value) {
    // If pickupId exists, fetch SO pickup data to populate items
    await fetchSoPickupData();
  } else if (saleOrderId.value) {
    // If sale_order_id exists in query, fetch sale order data
    // This will set formData.sale_order_id from the API response
    await fetchSaleOrderData();
  }
});
</script>

<template>
  <default-layout>
    <div class="trips-form-page -mx-6 bg-qallab-dashboard-bg space-y-4"
      :class="{ 'opacity-60 pointer-events-none': isLoading }">
      <AppFormBreadcrumb
        list-path="/sales/trips/list"
        module-root-key="breadcrumb.sales.root"
        list-label-key="breadcrumb.sales.trips.list"
        create-label-key="breadcrumb.sales.trips.create"
        edit-label-key="breadcrumb.sales.trips.edit"
        :is-edit-mode="isEditMode"
        :code="tripCode"
      />
      <!-- Page Header -->
      <TopHeader :icon="fileCheckIcon" title-key="pages.SalesTrips.create"
        description-key="pages.SalesTrips.createDescription" :show-action="false"
        :code-label="t('sales.forms.common.labels.tripCode')"
        :code="tripCode" :code-icon="fileIcon" />

      <!-- Basic Information -->
      <div class="bg-white rounded-3xl border !border-gray-100">
        <div class="flex items-center gap-2 text-primary-900 px-6 pt-6 text-lg font-bold">
          <h2>{{ t('sales.forms.common.sections.tripInfo') }}</h2>
          <span v-if="tripCode" class="dir-ltr">#{{ tripCode }}</span>
        </div>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            <div>
              <selectInput :items="[]" v-model="formData.supplier_logistic_id"
                :label="t('sales.forms.common.labels.logisticsCompany')"
                density="comfortable" :placeholder="t('common.form.choose')" :hide-details="false" :rules="[required()]"
                :error-messages="formErrors['supplier_logistic_id']"
                @update:model-value="delete formErrors['supplier_logistic_id']"
                :server-side="true" :fetch-function="fetchSuppliers"
                item-title-key="full_name" item-value-key="id" :debounce-time="500" />
            </div>
            <!-- Logistics Order Select - Only shown when coming from material-product page OR in edit mode -->
            <div v-if="isFromMaterialProduct || isEditMode">
              <selectInput 
                :items="soLogisticItems" 
                v-model="selectedSoLogisticId" 
                :label="t('sales.forms.common.labels.logisticsSalesOrder')"
                density="comfortable" 
                :placeholder="t('sales.forms.common.labels.selectLogisticsOrder')" 
                :hide-details="false"
                :disabled="!formData.supplier_logistic_id"
                :loading="loadingSoLogistics"
              />
            </div>
            
            <!-- Customer Select - Only shown in edit mode -->
            <div v-if="isEditMode">
              <selectInput 
                :items="[]" 
                v-model="selectedCustomerId" 
                :label="t('sales.forms.common.labels.customer')"
                density="comfortable" 
                :placeholder="t('sales.forms.common.placeholders.selectClient')" 
                item-title="title"
                item-value="value"
                :disabled="hasCustomerDataFromApi"
                :server-side="true"
                :fetch-function="fetchCustomers"
                item-title-key="full_name"
                item-value-key="id"
                :debounce-time="500"
              />
            </div>
            
            <!-- Customer Sale Order Select - Only shown in edit mode -->
            <div v-if="isEditMode">
              <selectInput 
                :items="customerSaleOrderItems" 
                v-model="selectedCustomerSaleOrderId" 
                :label="t('sales.forms.common.labels.customerSalesOrder')"
                density="comfortable" 
                :placeholder="t('sales.forms.common.labels.selectCustomerOrder')" 
                :hide-details="false"
                :disabled="!selectedCustomerId || hasCustomerDataFromApi"
                :loading="loadingCustomerSaleOrders"
              />
            </div>

            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block">{{ t('sales.forms.common.labels.tripLoadingLocation') }}</label>
              <div
                @click="openMapDialog('source'); delete formErrors['source_location']; delete formErrors['source_latitude']; delete formErrors['source_longitude']"
                class="flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                :class="formErrors['source_location'] || formErrors['source_latitude'] || formErrors['source_longitude'] ? '!border-red-500' : '!border-blue-400'">
                <span class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                  {{ formData.source_location || t('sales.forms.common.misc.pickLocation') }}
                </span>
                <div class="flex items-center gap-2">
                  <span v-html="mapMarkerIcon"></span>
                </div>
              </div>
              <div
                v-if="formErrors['source_location'] || formErrors['source_latitude'] || formErrors['source_longitude']"
                class="text-red-500 text-xs mt-1">
                {{ formErrors['source_location']?.[0] || formErrors['source_latitude']?.[0] ||
                  formErrors['source_longitude']?.[0] }}
              </div>
            </div>
            <div>
              <DateTimePickerInput v-model="formData.planned_arrival_downloading"
                :label="t('sales.forms.common.labels.loadingDateTime')"
                density="comfortable" :placeholder="t('sales.forms.common.placeholders.dateTimeSample')" />
            </div>
            <div>
              <TextInput v-model="formData.downloading_responsible_party"
                :label="t('sales.forms.common.labels.loadingOfficer')" density="comfortable"
                :placeholder="t('sales.forms.common.placeholders.enterLoadingResponsible')" />
            </div>
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block">{{ t('sales.forms.common.labels.tripUnloadingLocation') }}</label>
              <div
                @click="openMapDialog('target'); delete formErrors['target_location']; delete formErrors['target_latitude']; delete formErrors['target_longitude']"
                class="flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                :class="formErrors['target_location'] || formErrors['target_latitude'] || formErrors['target_longitude'] ? '!border-red-500' : '!border-blue-400'">
                <span class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                  {{ formData.target_location || t('sales.forms.common.misc.pickLocation') }}
                </span>
                <div class="flex items-center gap-2">
                  <span v-html="mapMarkerIcon"></span>
                </div>
              </div>
              <div
                v-if="formErrors['target_location'] || formErrors['target_latitude'] || formErrors['target_longitude']"
                class="text-red-500 text-xs mt-1">
                {{ formErrors['target_location']?.[0] || formErrors['target_latitude']?.[0] ||
                  formErrors['target_longitude']?.[0] }}
              </div>
            </div>
            <div>
              <DateTimePickerInput v-model="formData.planned_arrival_loading"
                :label="t('sales.forms.common.labels.unloadingDateTime')"
                density="comfortable" :placeholder="t('sales.forms.common.placeholders.dateTimeSample')" />
            </div>
            <div>
              <TextInput v-model="formData.loading_responsible_party"
                :label="t('sales.forms.common.labels.unloadingOfficerTrip')" density="comfortable"
                :placeholder="t('sales.forms.common.placeholders.enterUnloadingResponsibleTrip')" />
            </div>
            <div>
              <PriceInput v-model="formData.tracking_no_point"
                :label="t('sales.forms.common.labels.coordSendCount')" density="comfortable"
                :placeholder="t('sales.forms.common.placeholders.enterCoordinatesCount')" />
            </div>
            <div>
              <PriceInput v-model="formData.bill_of_lading"
                :label="t('sales.forms.common.labels.billOfLading')" density="comfortable"
                :placeholder="t('sales.forms.common.placeholders.enterBillOfLading')" />
            </div>
            <div>
              <PriceInput v-model="formData.total_quantity_ton"
                :label="t('sales.forms.common.labels.totalQtyTon')" density="comfortable"
                :placeholder="t('sales.forms.common.placeholders.enterQtyTon')" />
            </div>
            <div>
              <PriceInput v-model="formData.total_quantity_m3"
                :label="t('sales.forms.common.labels.totalQtyM3')" density="comfortable"
                :placeholder="t('sales.forms.common.placeholders.enterQtyM3')" />
            </div>
            <div v-show="false">
              <PriceInput v-model="formData.total_quantities"
                :label="t('sales.forms.common.labels.tripsCount')" density="comfortable"
                :placeholder="t('sales.forms.common.placeholders.enterTripCount')" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">{{ t('sales.forms.common.labels.tripTiming') }}</label>
              <v-radio-group v-model="formData.am_pm_interval" inline hide-details>
                <v-radio :value="item.value" color="primary" v-for="item in amPmIntervalItems" :key="item.value">
                  <template #label>
                    <span
                      :class="formData.am_pm_interval === item.value ? 'text-primary font-semibold' : 'text-gray-600'">
                      {{ item.title }}
                    </span>
                  </template>
                </v-radio>
                <!-- legacy evening-only radio removed -->
              </v-radio-group>
            </div>
            <div>
              <PriceInput v-model="formData.customer_total_trip_value" show-rial-icon
                :label="t('sales.forms.common.labels.customerTripAmount')" density="comfortable"
                :placeholder="t('sales.forms.common.placeholders.enterTripAmount')" />
            </div>
            <div>
              <PriceInput v-model="formData.logistic_company_total_trip_value" show-rial-icon
                :label="t('sales.forms.common.labels.logisticsTripAmount')" density="comfortable"
                :placeholder="t('sales.forms.common.placeholders.enterTripAmount')" />
            </div>
            <div class="md:col-span-2">
              <TextareaInput v-model="formData.notes"
                :label="t('sales.forms.common.labels.notes')" density="comfortable"
                :placeholder="t('sales.forms.common.placeholders.notesHere')" />
            </div>
          </div>
        </v-form>

        <!-- Products Table -->
        <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3">
          <div class="flex items-center text-primary-900 gap-2">
            <span v-html="packageIcon"></span>
            <h2 class="text-xl font-bold">{{ t('sales.forms.common.sections.products') }}</h2>
          </div>
          <ButtonWithIcon color="primary-100" variant="flat" :prepend-icon="downloadIcon"
            class="!text-primary-900 font-bold">
            {{ t('sales.forms.common.misc.excelImportFile') }}
          </ButtonWithIcon>
        </div>
        <!-- Products Table -->
        <div class="mb-4">
          <DataTable :headers="headers" :items="tableItems" show-actions force-show-edit force-show-delete
            @edit="handleEditProduct" @delete="handleDeleteProduct">
            <template #item.notes="{ item }">
              <v-menu attach="request-material-product-page" location="bottom" offset="8"
                :close-on-content-click="false" transition="slide-y-transition">
                <template #activator="{ props }">
                  <div class="flex items-center gap-2 cursor-pointer" v-bind="props">
                    <v-icon size="20" color="primary" v-html="messagePlusIcon"></v-icon>
                    <span class="text-gray-900">{{ item.notes || t('sales.forms.common.misc.addNote') }}</span>
                  </div>
                </template>

                <!-- Popup content -->
                <v-card class="pa-4 shadow-[rgba(149,157,165,0.2)_0px_8px_24px] overflow-hidden px-3 py-3" color="white"
                  rounded="lg" width="300">
                  <div class="!flex flex-nowrap items-center gap-3">
                    <TextInput
                      v-model="productTableItems[productTableItems.findIndex(p => p.item_id === item.item_id)].notes"
                      :placeholder="t('sales.forms.common.misc.addNote')" variant="outlined" density="comfortable" hide-details autofocus
                      class="flex-1" />
                    <ButtonWithIcon :icon="messagePlusIcon" color="primary" icon-only size="x-small" />

                  </div>
                </v-card>
              </v-menu>
            </template>
          </DataTable>
        </div>

        <div class="flex justify-center gap-3 my-6 md:w-3/4 mx-auto">
          <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold flex-1"
            @click="addProduct">
            {{ t('sales.forms.common.misc.addProductLineAlt') }}
          </ButtonWithIcon>
          <ButtonWithIcon
            v-if="productTableItems.length > 0"
            color="primary-100"
            variant="flat"
            class="!text-primary-900 font-bold flex-1"
            @click="showEditProductsDialog = true"
          >
            {{ t('sales.forms.common.misc.editProducts') }}
          </ButtonWithIcon>
        </div>

        <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3 mt-4">
          <div class="flex items-center text-primary-700 gap-2">
            <span v-html="busIcon"></span>
            <h2 class="text-lg font-bold">{{ t('sales.forms.common.sections.tripDetailsTipperCustomer') }}</h2>
          </div>
        </div>
        <div class="mb-4">
          <DataTable :headers="tripDetailsHeaders" :items="customerTripDetails" show-actions force-show-edit
            @edit="handleEditCustomerTripDetail">
            <template #item.vehicle_type_no="{ item }">
              <div class="flex gap-2 my-2">
                <div v-for="(vehicle, index) in item.vehicle_type_no" :key="index" class="w-[180px]">
                  <PriceInput
                    v-model="vehicle.transport_no"
                    density="compact"
                    hide-details
                    placeholder=""
                    class="!rounded-lg"
                  >
                    <template #append-inner>
                      <div class="bg-gray-50 border-r border-gray-200 h-full flex items-center justify-center px-3" style="margin-left: -12px;">
                        <span class="text-xs font-semibold text-gray-700 whitespace-nowrap">{{ getTransportTypeName(vehicle.transport_type) }}</span>
                      </div>
                    </template>
                  </PriceInput>
                </div>
              </div>
            </template>
            <template #item.price="{ item }">
              <div class="flex">
                <PriceInput v-model="item.price" density="compact" hide-details showRialIcon />
              </div>
            </template>
          </DataTable>
        </div>
        <div class="flex my-6 justify-center md:w-3/4 mx-auto">
          <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold flex-1"
            @click="showEditCustomerDetailsDialog = true"
            :disabled="customerTripDetails.length === 0">
            {{ t('sales.forms.tripsForm.editDetailsCustomer') }}
          </ButtonWithIcon>
        </div>

        <!-- Logistics Company Trip Details Table -->
        <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3 mt-4">
          <div class="flex items-center text-primary-600 gap-2">
            <span v-html="busIcon"></span>
            <h2 class="text-lg font-bold">{{ t('sales.forms.common.sections.tripDetailsTipperLogistics') }}</h2>
          </div>  
        </div>
        <div class="mb-4">
          <DataTable :headers="tripDetailsHeaders" :items="logisticCompanyTripDetails" show-actions force-show-edit
            @edit="handleEditLogisticTripDetail">
            <template #item.vehicle_type_no="{ item }">
              <div class="flex gap-2 my-2 items-center">
                <div v-for="(vehicle, index) in item.vehicle_type_no" :key="index" class="w-[180px]">
                  <PriceInput 
                    v-model="vehicle.transport_no" 
                    density="compact" 
                    hide-details 
                    placeholder=""
                    class="!rounded-lg"
                  >
                    <template #append-inner>
                      <div class="bg-gray-50 border-r border-gray-200 h-full flex items-center justify-center px-3" style="margin-left: -12px;">
                        <span class="text-xs font-semibold text-gray-700 whitespace-nowrap">{{ getTransportTypeName(vehicle.transport_type) }}</span>
                      </div>
                    </template>
                  </PriceInput>
                </div>
              </div>
            </template>
            <template #item.price="{ item }">
              <div class="flex">
                <PriceInput v-model="item.price" density="compact" hide-details showRialIcon />
              </div>
            </template>
          </DataTable>
        </div>
        <div class="flex justify-center my-6 md:w-3/4 mx-auto">
          <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold flex-1"
            @click="showEditLogisticDetailsDialog = true"
            :disabled="logisticCompanyTripDetails.length === 0">
            {{ t('sales.forms.tripsForm.editDetailsLogistics') }}
          </ButtonWithIcon>
        </div>

      </div>

      <!-- Action Buttons -->
      <div class="mt-3 flex items-center justify-center gap-3 flex-wrap">
        <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
          custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
          :label="t('sales.forms.common.actions.saveBackPickupsList')" :loading="isSubmitting" :disabled="isSubmitting"
          @click="handleSubmit('pickup_list')" />
        <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
          custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="returnIcon"
          :label="t('sales.forms.common.actions.saveBackTripsTable')" :loading="isSubmitting" :disabled="isSubmitting"
          @click="handleSubmit('trips_list')" />
        <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
          custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
          :label="t('sales.forms.common.actions.saveCreateNew')" :loading="isSubmitting" :disabled="isSubmitting"
          @click="handleSubmit('create_new')" />
      </div>
    </div>

    <!-- Add Product Dialog -->
    <AddProductDialog
      v-model="showAddProductDialog"
      request-type="trips"
      :items-query-params="productDialogQueryParams"
      :transport-types="transportTypeItems"
      :unit-items="unitItems"
      :edit-product="editingProduct"
      :existing-products="productTableItems"
      @saved="handleProductSaved"
      @product-updated="handleProductUpdated"
    />

    <!-- Edit Products Dialog -->
    <EditProductsDialog
      v-model="showEditProductsDialog"
      :products="productTableItems"
      :unit-items="unitItems"
      request-type="transfer_service"
      @products-updated="handleEditProductsBulk"
    />

    <AddTripDetailsDialog
      v-model="showCustomerRowDetailsDialog"
      :transport-types="transportTypeItems"
      :unit-items="unitItems"
      :edit-item="editingTripDetail"
      :available-items="availableTripDetails.length ? availableTripDetails : customerTripDetails"
      :existing-items="customerTripDetails"
      @product-updated="handleCustomerTripDetailRowUpdated"
    />

    <AddTripDetailsDialog
      v-model="showLogisticRowDetailsDialog"
      :transport-types="transportTypeItems"
      :unit-items="unitItems"
      :edit-item="editingTripDetail"
      :available-items="availableTripDetails.length ? availableTripDetails : logisticCompanyTripDetails"
      :existing-items="logisticCompanyTripDetails"
      @product-updated="handleLogisticTripDetailRowUpdated"
    />

    <!-- Customer Trip Details Edit Dialog -->
    <EditTripDetailsDialog
      v-model="showEditCustomerDetailsDialog"
      :trip-details="customerTripDetails"
      :transport-types="transportTypeItems"
      :unit-items="unitItems"
      :title="t('sales.forms.tripsForm.editDetailsCustomer')"
      @details-updated="handleCustomerDetailsUpdated"
    />

    <!-- Logistic Company Trip Details Edit Dialog -->
    <EditTripDetailsDialog
      v-model="showEditLogisticDetailsDialog"
      :trip-details="logisticCompanyTripDetails"
      :transport-types="transportTypeItems"
      :unit-items="unitItems"
      :title="t('sales.forms.tripsForm.editDetailsLogistics')"
      @details-updated="handleLogisticDetailsUpdated"
    />

    <Map v-model="showMapDialog"
      :latitude="String(currentMapType === 'target' ? (formData.target_latitude || '') : (formData.source_latitude || ''))"
      :longitude="String(currentMapType === 'target' ? (formData.target_longitude || '') : (formData.source_longitude || ''))"
      :address="String(currentMapType === 'target' ? (formData.target_location || '') : (formData.source_location || ''))"
      @location-selected="handleLocationSelected" />

  </default-layout>
</template>

<style scoped></style>
