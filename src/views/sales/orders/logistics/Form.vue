<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AddProductDialog, { type ProductToAdd } from "@/components/price-offers/AddProductDialog.vue";
import TopHeader from "@/components/price-offers/TopHeader.vue";
import { useApi } from "@/composables/useApi";
import {
  fileIcon,
  mapMarkerIcon,
  messagePlusIcon,
  filePlusIcon,
  busIcon,
  listIcon,
  CoinHandIcon,
  fileCheckIcon,
  globeIcon,
} from "@/components/icons/priceOffersIcons";
import {
  returnIcon,
  saveIcon,
  binIcon,
  rialIcon,
  packageIcon,
} from "@/components/icons/globalIcons";
import { useForm } from "@/composables/useForm";
import { useNotification as useNotify } from "@/composables/useNotification";
import AddLogisticsDetailDialog from "@/views/sales/quotations/logistics/components/AddLogisticsDetailDialog.vue";
import { useNotification } from "@/composables/useNotification";
import { required, saudiPhone } from "@/utils/validators";

const { warning } = useNotification();
const { formRef, isFormValid, validate } = useForm();
const { success, apiError } = useNotify();

const { t } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const isLoading = ref(false);
const isSubmitting = ref(false);

// Query params for creating order from quotation
const fromQuotationId = computed(() => route.query.from_quotation as string | undefined);
const fromQuotationCode = computed(() => route.query.quotation_code as string | undefined);
const saleQuotationId = computed(() => route.query.sale_quotation_id as string | undefined);

// Dropdown items
const paymentMethodItems = ref<any[]>([]);
const feeTypeItems = ref<any[]>([]);
const unitItems = ref<any[]>([]);
const customerItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);
const categoriesItems = ref<any[]>([]);
const amPmIntervalItems = ref<any[]>([]);
const actualExecutionIntervalItems = ref<any[]>([]);
const requestTypeItems = ref<any[]>([]);

// Interface for logistics details (matching request-body.json so_logistics_details)
interface LogisticsDetail {
  id?: number;
  material_type: number[];
  trip_no: number | null;
  actual_execution_interval: number | null;
  am_pm_interval: string | null;
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
  transport_amount: string | number;
}

// Interface for product items (matching request-body.json so_product_details)
interface ProductTableItem {
  id?: number;
  item_id: number;
  item_name: string;
  unit_id: number | null;
  unit_name: string;
  quantity: number | null;
  from_date: string | null;
  trip_no: number | null;
  transport_type: number | null;
  transport_type_name?: string;
  notes: string;
  isAdded?: boolean;
}

// Interface for trip details (matching request-body.json so_trip_details)
interface TripTableItem {
  id?: number;
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

// Logistics details array
const logisticsDetails = ref<LogisticsDetail[]>([]);

// Products table items
const productTableItems = ref<ProductTableItem[]>([]);

// Trip details table items
const tripTableItems = ref<TripTableItem[]>([]);

// Form data
const formData = ref({
  code: "" as string,
  customer_id: null as number | null,
  so_datetime: "" as string,
  so_type: null as string | null,
  responsible_person: "" as string,
  responsible_phone: null as string | null,
  target_location: null as string | null,
  target_latitude: null as string | null,
  target_longitude: null as string | null,
  source_location: null as string | null,
  source_latitude: null as string | null,
  source_longitude: null as string | null,
  project_name: "",
  po_reference: null as string | null,
  payment_method: null as string | null,
  upfront_payment: null as number | string | null,
  invoice_interval: null as number | string | null,
  payment_term_no: null as number | string | null,
  late_fee_type: null as string | null,
  late_fee: null as number | string | null,
  cancel_fee_type: null as string | null,
  cancel_fee: null as number | string | null,
  sale_quotation_code: null as string | null,
});

// Fetch constants from API
const fetchConstants = async () => {
  try {
    const res = await api.get<any>("/sales/orders/constants");
    const data = res.data;
    if (data) {
      transportTypeItems.value = data.transport_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      amPmIntervalItems.value = data.am_pm_interval?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      paymentMethodItems.value = data.payment_methods?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      feeTypeItems.value = data.fee_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      requestTypeItems.value = data.so_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      if (data.actual_execution_interval && Array.isArray(data.actual_execution_interval)) {
        actualExecutionIntervalItems.value = data.actual_execution_interval.map((i: any) => ({ title: i.label, value: i.key }));
      }
    }
  } catch (e) {
    console.error("Error fetching constants:", e);
  }
};

const fetchUnits = async () => {
  try {
    const res = await api.get<any>("/units/list");
    if (Array.isArray(res.data)) {
      unitItems.value = res.data.map((i: any) => ({ title: i.name, value: i.id }));
    }
  } catch (e) {
    console.error("Error fetching units:", e);
  }
};

const fetchCategories = async () => {
  try {
    const res = await api.get<any>("/categories/list");
    if (Array.isArray(res.data)) {
      categoriesItems.value = res.data.map((i: any) => ({ title: i.name, value: i.id }));
    }
  } catch (e) {
    console.error("Error fetching categories:", e);
  }
};

const fetchCustomers = async () => {
  try {
    const res = await api.get<any>("/customers/list");
    if (Array.isArray(res.data)) {
      customerItems.value = res.data.map((i: any) => ({ title: i.full_name, value: i.id }));
    }
  } catch (e) {
    console.error("Error fetching customers:", e);
  }
};

// Helper function to get material type names
const getCategoriesNames = (categories: number[]): string => {
  if (!categories || categories.length === 0) return "";
  return categories
    .map((categoryId) => {
      const item = categoriesItems.value.find((i: any) => i.value === categoryId);
  return item?.title || "";
    })
    .filter(Boolean)
    .join(", ");
};

// Helper function to get transport type names
const getTransportTypeNames = (transportTypes: number[]): string => {
  if (!transportTypes || transportTypes.length === 0) return "";
  return transportTypes
    .map((typeId) => {
      const item = transportTypeItems.value.find((i: any) => i.value === typeId);
  return item?.title || "";
    })
    .filter(Boolean)
    .join(", ");
};

// Format date to DD-MM-YYYY
const formatDate = (date: string | Date): string => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateDdMmYyyy = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Fetch form data for edit mode
const fetchFormData = async () => {
  if (!isEditMode.value || !routeId.value) return;

  isLoading.value = true;
  try {
    const raw = await api.get<any>(`/sales/orders/logistics/${routeId.value}`);
    const data = raw?.data != null ? raw.data : raw;

    if (!data) return;

      // Populate form data
    formData.value.code = data.code ? String(data.code) : "";
    formData.value.customer_id = data.customer_id ?? null;
    formData.value.so_datetime = data.so_datetime ? String(data.so_datetime) : "";
    formData.value.so_type = data.so_type ?? null;
    formData.value.responsible_person = data.responsible_person ?? "";
    formData.value.responsible_phone = data.responsible_phone ?? null;
    formData.value.target_location = data.target_location ?? null;
    formData.value.target_latitude = data.target_latitude ?? null;
    formData.value.target_longitude = data.target_longitude ?? null;
      formData.value.source_location = data.source_location ?? null;
      formData.value.source_latitude = data.source_latitude ?? null;
      formData.value.source_longitude = data.source_longitude ?? null;
    formData.value.project_name = data.project_name ?? "";
    formData.value.po_reference = data.po_reference ?? null;
    formData.value.payment_method = data.payment_method ?? null;
    formData.value.upfront_payment = data.upfront_payment ?? null;
    formData.value.invoice_interval = data.invoice_interval ?? null;
    formData.value.payment_term_no = data.payment_term_no ?? null;
      formData.value.late_fee_type = data.late_fee_type ?? null;
      formData.value.late_fee = data.late_fee ?? null;
      formData.value.cancel_fee_type = data.cancel_fee_type ?? null;
      formData.value.cancel_fee = data.cancel_fee ?? null;
    formData.value.sale_quotation_code = data.sale_quotation_code ?? null;

    // Populate logistics details (so_logistics_details)
    if (Array.isArray(data.so_logistics_details) && data.so_logistics_details.length > 0) {
      logisticsDetails.value = data.so_logistics_details.map((detail: any) => ({
        id: detail.id,
        material_type: Array.isArray(detail.material_type)
          ? detail.material_type.map((type: any) => Number(type))
          : [],
        trip_no: detail.trip_no != null ? Number(detail.trip_no) : null,
        actual_execution_interval: detail.actual_execution_interval != null ? Number(detail.actual_execution_interval) : null,
        am_pm_interval: detail.am_pm_interval ?? null,
        from_date: detail.from_date ?? "",
        to_date: detail.to_date ?? "",
        transport_type: Array.isArray(detail.transport_type)
          ? detail.transport_type.map((type: any) => Number(type))
          : [],
        transport_no: detail.transport_no != null ? Number(detail.transport_no) : null,
        loading_responsible_party: detail.loading_responsible_party ?? "",
        downloading_responsible_party: detail.downloading_responsible_party ?? "",
        target_location: detail.target_location ?? "",
        target_latitude: detail.target_latitude ?? "",
        target_longitude: detail.target_longitude ?? "",
        source_location: detail.source_location ?? "",
        source_latitude: detail.source_latitude ?? "",
        source_longitude: detail.source_longitude ?? "",
        transport_amount: detail.transport_amount != null ? detail.transport_amount : "",
      }));
    } else {
      logisticsDetails.value = [];
    }

    // Populate products (so_product_details)
    const productsList = data.so_product_details ?? data.items;
    if (Array.isArray(productsList) && productsList.length > 0) {
      productTableItems.value = productsList.map((item: any) => ({
        id: item.id,
        item_id: Number(item.item_id),
        item_name: item.item_name ?? "",
        unit_id: item.unit_id ?? null,
        unit_name: item.unit_name ?? "",
        quantity: item.quantity ?? null,
        from_date: item.from_date ?? null,
        trip_no: item.trip_no ?? null,
        transport_type: item.transport_type != null ? Number(item.transport_type) : null,
        transport_type_name: item.transport_type_name ?? "",
        notes: item.notes ?? "",
      }));
    } else {
      productTableItems.value = [];
    }

    // Populate trip details (so_trip_details)
    if (Array.isArray(data.so_trip_details) && data.so_trip_details.length > 0) {
      tripTableItems.value = data.so_trip_details.map((item: any) => {
        const transportTypes = Array.isArray(item.transport_type)
          ? item.transport_type.map((type: any) => Number(type))
          : [];

          return {
            id: item.id,
          item_id: Number(item.item_id),
          item_name: item.item_name ?? "",
            unit_id: item.unit_id ?? null,
          unit_name: item.unit_name ?? "",
            quantity: item.quantity ?? null,
          trip_date: item.trip_date ?? null,
          trip_price: item.trip_price != null ? Number(item.trip_price) : null,
          transport_type: transportTypes,
          transport_type_names: getTransportTypeNames(transportTypes),
        } as TripTableItem;
      });
          } else {
      tripTableItems.value = [];
    }
  } catch (e) {
    console.error("Error fetching form data:", e);
  } finally {
    isLoading.value = false;
  }
};

// Fetch quotation data and pre-fill form when creating order from quotation
const fetchQuotationForOrder = async () => {
  if (!fromQuotationId.value) return;

  // Set quotation code from query param
  if (fromQuotationCode.value) {
    formData.value.sale_quotation_code = fromQuotationCode.value;
  }

  isLoading.value = true;
  try {
    const res = await api.get<any>(`/sales/quotations/logistics/${fromQuotationId.value}`);
    const data = res.data;

    if (data) {
      // Set quotation code from API response if not already set
      if (data.code && !fromQuotationCode.value) {
        formData.value.sale_quotation_code = data.code;
      }
      
      // Map quotation fields to order form fields
      formData.value.customer_id = data.customer_id != null ? Number(data.customer_id) : null;
      formData.value.responsible_person = data.responsible_person || "";
      formData.value.responsible_phone = data.responsible_phone || null;
      formData.value.target_location = data.target_location || null;
      formData.value.target_latitude = data.target_latitude || null;
      formData.value.target_longitude = data.target_longitude || null;
      formData.value.project_name = data.project_name || "";
      formData.value.payment_method = data.payment_method || null;
      formData.value.upfront_payment = data.upfront_payment || null;
      formData.value.invoice_interval = data.invoice_interval != null ? Number(data.invoice_interval) : null;
      formData.value.payment_term_no = data.payment_term_no != null ? Number(data.payment_term_no) : null;
      formData.value.late_fee_type = data.late_fee_type || null;
      formData.value.late_fee = data.late_fee != null ? Number(data.late_fee) : null;
      formData.value.cancel_fee_type = data.cancel_fee_type || null;
      formData.value.cancel_fee = data.cancel_fee != null ? Number(data.cancel_fee) : null;
      
      // Map quotation_type to so_type if available
      if (data.quotation_type) {
        formData.value.so_type = data.quotation_type;
      }

      // Map logistics product details (logistics_product_details -> productTableItems with logistics info)
      // Based on respons.json structure: logistics_product_details contains item logistics info
      const logisticsProductDetails = data.logistics_product_details ?? data.quotation_logistics_details;
      if (Array.isArray(logisticsProductDetails) && logisticsProductDetails.length > 0) {
        // Create logistics details from logistics_product_details
        logisticsDetails.value = logisticsProductDetails.map((detail: any) => {
          const transportTypes = Array.isArray(detail.transport_type)
            ? detail.transport_type.map((type: any) => Number(type))
            : [];
          
          return {
            id: undefined,
            material_type: detail.item_id ? [Number(detail.item_id)] : [],
            trip_no: detail.number_of_trips != null ? Number(detail.number_of_trips) : null,
            actual_execution_interval: detail.actual_execution_interval != null ? Number(detail.actual_execution_interval) : null,
            am_pm_interval: detail.am_pm_interval ?? null,
            from_date: detail.trip_start ?? detail.from_date ?? "",
            to_date: detail.to_date ?? "",
            transport_type: transportTypes,
            transport_no: detail.transport_no != null ? Number(detail.transport_no) : null,
            loading_responsible_party: detail.loading_responsible_party ?? "",
            downloading_responsible_party: detail.downloading_responsible_party ?? "",
            target_location: detail.target_location ?? "",
            target_latitude: detail.target_latitude ?? "",
            target_longitude: detail.target_longitude ?? "",
            source_location: detail.source_location ?? "",
            source_latitude: detail.source_latitude ?? "",
            source_longitude: detail.source_longitude ?? "",
            transport_amount: detail.transport_amount != null ? detail.transport_amount : "",
          };
        });
      }

      // Map products (items -> productTableItems)
      // Based on respons.json structure: items contains product details
      const productItems = data.items ?? data.quotation_product_details;
      if (Array.isArray(productItems) && productItems.length > 0) {
        productTableItems.value = productItems.map((item: any) => ({
          id: undefined,
          item_id: Number(item.item_id),
          item_name: item.item_name ?? "",
          unit_id: item.unit_id ?? null,
          unit_name: item.unit_name ?? "",
          quantity: item.quantity ?? null,
          from_date: item.from_date ?? null,
          trip_no: item.trip_no ?? null,
          transport_type: item.transport_type != null ? Number(item.transport_type) : null,
          transport_type_name: item.transport_type_name ?? "",
          notes: item.notes ?? "",
        }));
      }

      // Map trip details (quotation_trip_details -> tripTableItems)
      const tripDetails = data.quotation_trip_details;
      if (Array.isArray(tripDetails) && tripDetails.length > 0) {
        tripTableItems.value = tripDetails.map((item: any) => {
          const transportTypes = Array.isArray(item.transport_type)
            ? item.transport_type.map((type: any) => Number(type))
            : [];

          return {
            id: undefined,
            item_id: Number(item.item_id),
            item_name: item.item_name ?? item.item?.name ?? "",
            unit_id: item.unit_id ?? null,
            unit_name: item.unit_name ?? "",
            quantity: item.quantity ?? null,
            trip_date: item.trip_date ?? null,
            trip_price: item.trip_price != null ? Number(item.trip_price) : null,
            transport_type: transportTypes,
            transport_type_names: getTransportTypeNames(transportTypes),
            notes: item.notes ?? "",
          } as TripTableItem;
        });
      }
    }
  } catch (e) {
    console.error("Error fetching quotation data:", e);
  } finally {
    isLoading.value = false;
  }
};

// Build FormData for submission (matching request-body.json structure)
const buildFormData = (): FormData => {
  const fd = new FormData();

  if (isEditMode.value) {
    fd.append("_method", "PUT");
  }

  // Include sale_quotation_id if creating order from quotation
  if (saleQuotationId.value) {
    fd.append("sale_quotation_id", saleQuotationId.value);
  }

  // Basic fields
  fd.append("customer_id", String(formData.value.customer_id || ""));
  fd.append("so_datetime", formData.value.so_datetime || "");
  fd.append("so_type", formData.value.so_type || "");
  fd.append("responsible_person", formData.value.responsible_person || "");
  if (formData.value.responsible_phone) fd.append("responsible_phone", formData.value.responsible_phone);
  fd.append("target_location", formData.value.target_location || "");
  fd.append("target_latitude", String(formData.value.target_latitude || ""));
  fd.append("target_longitude", String(formData.value.target_longitude || ""));
  fd.append("source_location", formData.value.source_location || "");
  fd.append("source_latitude", String(formData.value.source_latitude || ""));
  fd.append("source_longitude", String(formData.value.source_longitude || ""));
  fd.append("project_name", formData.value.project_name || "");
  fd.append("po_reference", formData.value.po_reference || "");
  fd.append("payment_method", formData.value.payment_method || "");
  fd.append("upfront_payment", String(formData.value.upfront_payment ?? ""));
  fd.append("invoice_interval", String(formData.value.invoice_interval ?? "1"));
  fd.append("payment_term_no", String(formData.value.payment_term_no ?? "1"));
  fd.append("late_fee_type", formData.value.late_fee_type || "");
  fd.append("late_fee", String(formData.value.late_fee ?? ""));
  fd.append("cancel_fee_type", formData.value.cancel_fee_type || "");
  fd.append("cancel_fee", String(formData.value.cancel_fee ?? ""));

  // so_logistics_details (array)
  logisticsDetails.value.forEach((detail, index) => {
    if (isEditMode.value && detail.id) {
      fd.append(`so_logistics_details[${index}][id]`, String(detail.id));
    }

    // Material types array
    if (detail.material_type && detail.material_type.length > 0) {
      detail.material_type.forEach((type, typeIndex) => {
        fd.append(`so_logistics_details[${index}][material_type][${typeIndex}]`, String(type));
      });
    }

    fd.append(`so_logistics_details[${index}][trip_no]`, String(detail.trip_no || ""));
    fd.append(`so_logistics_details[${index}][actual_execution_interval]`, String(detail.actual_execution_interval || ""));
    fd.append(`so_logistics_details[${index}][am_pm_interval]`, detail.am_pm_interval || "");
    fd.append(`so_logistics_details[${index}][from_date]`, formatDate(detail.from_date));
    fd.append(`so_logistics_details[${index}][to_date]`, formatDate(detail.to_date));

    // Transport types array
    if (detail.transport_type && detail.transport_type.length > 0) {
      detail.transport_type.forEach((type, typeIndex) => {
        fd.append(`so_logistics_details[${index}][transport_type][${typeIndex}]`, String(type));
      });
    }

    fd.append(`so_logistics_details[${index}][transport_no]`, String(detail.transport_no || ""));
    fd.append(`so_logistics_details[${index}][loading_responsible_party]`, detail.loading_responsible_party || "");
    fd.append(`so_logistics_details[${index}][downloading_responsible_party]`, detail.downloading_responsible_party || "");
    fd.append(`so_logistics_details[${index}][target_location]`, detail.target_location || "");
    fd.append(`so_logistics_details[${index}][target_latitude]`, String(detail.target_latitude || ""));
    fd.append(`so_logistics_details[${index}][target_longitude]`, String(detail.target_longitude || ""));
    fd.append(`so_logistics_details[${index}][source_location]`, detail.source_location || "");
    fd.append(`so_logistics_details[${index}][source_latitude]`, String(detail.source_latitude || ""));
    fd.append(`so_logistics_details[${index}][source_longitude]`, String(detail.source_longitude || ""));
    fd.append(`so_logistics_details[${index}][transport_amount]`, String(detail.transport_amount || ""));
  });

  // so_product_details (array)
  productTableItems.value.forEach((item, index) => {
    if (isEditMode.value && item.id != null) {
      fd.append(`so_product_details[${index}][id]`, String(item.id));
    }
    fd.append(`so_product_details[${index}][item_id]`, String(item.item_id));
    fd.append(`so_product_details[${index}][unit_id]`, String(item.unit_id || ""));
    fd.append(`so_product_details[${index}][quantity]`, String(item.quantity || ""));
    if (item.from_date) {
      fd.append(`so_product_details[${index}][from_date]`, formatDateDdMmYyyy(item.from_date));
    }
    fd.append(`so_product_details[${index}][trip_no]`, String(item.trip_no ?? ""));
    fd.append(`so_product_details[${index}][transport_type]`, String(item.transport_type ?? ""));
  });

  // so_trip_details (array)
  tripTableItems.value.forEach((item, index) => {
    if (isEditMode.value && item.id != null) {
      fd.append(`so_trip_details[${index}][id]`, String(item.id));
    }
    fd.append(`so_trip_details[${index}][item_id]`, String(item.item_id));
    fd.append(`so_trip_details[${index}][unit_id]`, String(item.unit_id || ""));
    fd.append(`so_trip_details[${index}][quantity]`, String(item.quantity || ""));
    if (item.trip_date) {
      fd.append(`so_trip_details[${index}][trip_date]`, formatDateDdMmYyyy(item.trip_date));
    }
    fd.append(`so_trip_details[${index}][trip_price]`, String(item.trip_price ?? ""));
    // Transport types array
    if (item.transport_type && item.transport_type.length > 0) {
      item.transport_type.forEach((type, typeIndex) => {
        fd.append(`so_trip_details[${index}][transport_type][${typeIndex}]`, String(type));
      });
    }
  });

  return fd;
};

const getInitialFormData = () => ({
  code: "" as string,
  customer_id: null as number | null,
  so_datetime: "" as string,
  so_type: null as string | null,
  responsible_person: "" as string,
  responsible_phone: null as string | null,
  target_location: null as string | null,
  target_latitude: null as string | null,
  target_longitude: null as string | null,
  source_location: null as string | null,
  source_latitude: null as string | null,
  source_longitude: null as string | null,
    project_name: "",
  po_reference: null as string | null,
  payment_method: null as string | null,
  upfront_payment: null as number | string | null,
  invoice_interval: null as number | string | null,
  payment_term_no: null as number | string | null,
  late_fee_type: null as string | null,
  late_fee: null as number | string | null,
  cancel_fee_type: null as string | null,
  cancel_fee: null as number | string | null,
  sale_quotation_code: null as string | null,
});

const resetForm = () => {
  formData.value = getInitialFormData();
  productTableItems.value = [];
  tripTableItems.value = [];
  logisticsDetails.value = [];
  formRef.value?.reset();
};

const handleSubmit = async (afterSuccess?: "reset" | "navigate") => {
  if (!(await validate())) return;

  sourceLocationError.value = null;
  targetLocationError.value = null;

  if (!formData.value.source_location?.trim()) {
    sourceLocationError.value = "يجب تحديد موقع التحميل";
    warning("يجب تحديد موقع التحميل");
    return;
  }

  if (!formData.value.target_location?.trim()) {
    targetLocationError.value = "يجب تحديد موقع التنزيل";
    warning("يجب تحديد موقع التنزيل");
    return;
  }

  if (productTableItems.value.length === 0) {
    warning("يجب إضافة منتج واحد على الأقل");
    return;
  }

  if (logisticsDetails.value.length === 0) {
    warning("يجب إضافة خدمة نقل واحدة على الأقل");
    return;
  }

  if (tripTableItems.value.length === 0) {
    warning("يجب إضافة تفاصيل رحلة واحدة على الأقل");
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
    const fd = buildFormData();
    const url = isEditMode.value && routeId.value
      ? `/sales/orders/logistics/${routeId.value}`
      : "/sales/orders/logistics";

    await api.post(url, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    success(isEditMode.value ? "تم تحديث الطلب بنجاح" : "تم إنشاء الطلب بنجاح");

    if (afterSuccess === "reset") {
      resetForm();
      router.push({ name: "SalesOrdersLogisticsCreate" });
    } else if (afterSuccess === "navigate") {
      router.push({ name: "SalesOrdersLogisticsList" });
    }
  } catch (e: any) {
    console.error("Error submitting form:", e);
    apiError(e, "حدث خطأ أثناء حفظ الطلب");
  } finally {
    isSubmitting.value = false;
  }
};

// Summary totals (transport-based like quotation)
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

// Unified location handling
type LocationType = "source" | "target" | "logistics-source" | "logistics-target";
const currentLocationType = ref<LocationType>("source");
const currentLogisticsIndex = ref<number>(-1);
const showMapDialog = ref(false);
const sourceLocationError = ref<string | null>(null);
const targetLocationError = ref<string | null>(null);

// Unified method to open map dialog
const openMapDialog = (type: LocationType = "source", logisticsIndex: number = -1) => {
  currentLocationType.value = type;
  currentLogisticsIndex.value = logisticsIndex;
  showMapDialog.value = true;
};

// Unified location selection handler
const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
  if (currentLocationType.value === "source") {
    formData.value.source_latitude = location.latitude;
    formData.value.source_longitude = location.longitude;
    formData.value.source_location = location.address;
    sourceLocationError.value = null;
  } else if (currentLocationType.value === "target") {
    formData.value.target_latitude = location.latitude;
    formData.value.target_longitude = location.longitude;
    formData.value.target_location = location.address;
    targetLocationError.value = null;
  } else if (currentLocationType.value === "logistics-source" && currentLogisticsIndex.value !== -1) {
    const detail = logisticsDetails.value[currentLogisticsIndex.value];
    detail.source_latitude = location.latitude;
    detail.source_longitude = location.longitude;
    detail.source_location = location.address;
  } else if (currentLocationType.value === "logistics-target" && currentLogisticsIndex.value !== -1) {
    const detail = logisticsDetails.value[currentLogisticsIndex.value];
    detail.target_latitude = location.latitude;
    detail.target_longitude = location.longitude;
    detail.target_location = location.address;
  }
};

// Computed properties for map dialog
const mapLatitude = computed(() => {
  if (currentLocationType.value === "source") {
    return String(formData.value.source_latitude || "");
  } else if (currentLocationType.value === "target") {
    return String(formData.value.target_latitude || "");
  } else if (currentLogisticsIndex.value !== -1 && logisticsDetails.value[currentLogisticsIndex.value]) {
    const detail = logisticsDetails.value[currentLogisticsIndex.value];
    return String(currentLocationType.value === "logistics-target" ? (detail.target_latitude || "") : (detail.source_latitude || ""));
  }
  return "";
});

const mapLongitude = computed(() => {
  if (currentLocationType.value === "source") {
    return String(formData.value.source_longitude || "");
  } else if (currentLocationType.value === "target") {
    return String(formData.value.target_longitude || "");
  } else if (currentLogisticsIndex.value !== -1 && logisticsDetails.value[currentLogisticsIndex.value]) {
    const detail = logisticsDetails.value[currentLogisticsIndex.value];
    return String(currentLocationType.value === "logistics-target" ? (detail.target_longitude || "") : (detail.source_longitude || ""));
  }
  return "";
});

const mapAddress = computed(() => {
  if (currentLocationType.value === "source") {
    return String(formData.value.source_location || "");
  } else if (currentLocationType.value === "target") {
    return String(formData.value.target_location || "");
  } else if (currentLogisticsIndex.value !== -1 && logisticsDetails.value[currentLogisticsIndex.value]) {
    const detail = logisticsDetails.value[currentLogisticsIndex.value];
    return String(currentLocationType.value === "logistics-target" ? (detail.target_location || "") : (detail.source_location || ""));
  }
  return "";
});

// Logistics details dialog handlers
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
  const index = logisticsDetails.value.findIndex((d) => d === detail);
  if (index !== -1) {
    editingLogisticsDetail.value = { ...detail };
    editingLogisticsIndex.value = index;
    showAddLogisticsDialog.value = true;
  }
};

// Product dialog handlers
const showAddProductDialog = ref(false);
const editingProduct = ref<ProductToAdd | null>(null);
const productDialogMode = ref<"logistics" | "logistics-trips">("logistics");

const handleAddProduct = () => {
  editingProduct.value = null;
  productDialogMode.value = "logistics";
  showAddProductDialog.value = true;
};

const handleAddTrip = () => {
  editingProduct.value = null;
  productDialogMode.value = "logistics-trips";
  showAddProductDialog.value = true;
};

const handleProductSaved = (products: any[]) => {
  if (productDialogMode.value === "logistics-trips") {
    // Handle trip details
    const newTripItems: TripTableItem[] = [];
    products.forEach((p) => {
      newTripItems.push({
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        trip_date: p.trip_date ?? null,
        trip_price: p.trip_price ?? null,
        transport_type: p.transport_type ?? [],
        transport_type_names: p.transport_type_names ?? "",
        isAdded: p.isAdded,
        id: p.id,
      });
    });
    tripTableItems.value = newTripItems;
  } else {
    // Handle logistics products
    const newItems: ProductTableItem[] = [];
    products.forEach((p) => {
      const existing = productTableItems.value.find((existing) => existing.item_id === p.item_id);
      newItems.push({
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id,
        unit_name: p.unit_name,
        quantity: p.quantity,
        from_date: p.from_date ?? null,
        trip_no: p.trip_no ?? null,
        transport_type: p.transport_type ?? null,
        transport_type_name: p.transport_type_name ?? "",
        notes: existing?.notes || p.notes || "",
        isAdded: p.isAdded,
        id: p.id,
      });
    });
    productTableItems.value = newItems;
  }
};

const handleEditProduct = (item: any) => {
  const productToEdit = productTableItems.value.find((p) => p.item_id === item.item_id);
  if (productToEdit) {
    editingProduct.value = { ...productToEdit, isAdded: true } as any;
    productDialogMode.value = "logistics";
    showAddProductDialog.value = true;
  }
};

const handleEditTrip = (item: any) => {
  const tripToEdit = tripTableItems.value.find((p) => p.item_id === item.item_id);
  if (tripToEdit) {
    editingProduct.value = { ...tripToEdit, isAdded: true } as any;
    productDialogMode.value = "logistics-trips";
    showAddProductDialog.value = true;
  }
};

const handleProductUpdated = (updatedProduct: any) => {
  if (productDialogMode.value === "logistics-trips") {
    // Handle trip update
    const index = tripTableItems.value.findIndex((p) => p.item_id === updatedProduct.item_id);
    if (index !== -1) {
      tripTableItems.value[index] = {
        item_id: updatedProduct.item_id,
        item_name: updatedProduct.item_name,
        unit_id: updatedProduct.unit_id,
        unit_name: updatedProduct.unit_name,
        quantity: updatedProduct.quantity,
        trip_date: updatedProduct.trip_date ?? null,
        trip_price: updatedProduct.trip_price ?? null,
        transport_type: updatedProduct.transport_type ?? [],
        transport_type_names: updatedProduct.transport_type_names ?? "",
        isAdded: updatedProduct.isAdded,
        id: updatedProduct.id,
      };
    }
  } else {
    // Handle logistics product update
    const index = productTableItems.value.findIndex((p) => p.item_id === updatedProduct.item_id);
    if (index !== -1) {
      const existingNotes = productTableItems.value[index].notes;
      productTableItems.value[index] = {
        item_id: updatedProduct.item_id,
        item_name: updatedProduct.item_name,
        unit_id: updatedProduct.unit_id,
        unit_name: updatedProduct.unit_name,
        quantity: updatedProduct.quantity,
        from_date: updatedProduct.from_date ?? null,
        trip_no: updatedProduct.trip_no ?? null,
        transport_type: updatedProduct.transport_type ?? null,
        transport_type_name: updatedProduct.transport_type_name ?? "",
        notes: existingNotes || updatedProduct.notes || "",
        isAdded: updatedProduct.isAdded,
        id: updatedProduct.id,
      };
    }
  }
  editingProduct.value = null;
};

const handleDeleteProduct = (item: any) => {
  const index = productTableItems.value.findIndex((p) => p.item_id === item.item_id);
  if (index !== -1) {
    productTableItems.value.splice(index, 1);
  }
};

const handleDeleteTrip = (item: any) => {
  const index = tripTableItems.value.findIndex((p) => p.item_id === item.item_id);
  if (index !== -1) {
    tripTableItems.value.splice(index, 1);
  }
};

// Table headers for products
const headers = [
  { title: "اسم المنتج", key: "name" },
  { title: "الوحدة", key: "unit" },
  { title: "الكمية", key: "quantity" },
  { title: "تاريخ بدء النقل", key: "from_date" },
  { title: "عدد الرحلات", key: "trip_no" },
  { title: "نوع الناقلة", key: "transport_type_name" },
  { title: "ملاحظات", key: "notes" },
];

// Computed items for the products DataTable
const tableItems = computed(() =>
  productTableItems.value.map((item) => ({
    id: item.item_id,
    item_id: item.item_id,
    name: item.item_name,
    unit: item.unit_name,
    quantity: item.quantity,
    from_date: item.from_date ? formatDateDdMmYyyy(item.from_date) : "—",
    trip_no: item.trip_no ?? "—",
    transport_type_name: item.transport_type_name || getTransportTypeNames(item.transport_type ? [item.transport_type] : []) || "—",
    notes: item.notes,
  }))
);

// Trip details table headers and items
const tripHeaders = [
  { title: "اسم المنتج", key: "name" },
  { title: "الوحدة", key: "unit" },
  { title: "الكمية", key: "quantity" },
  { title: "تاريخ الرحلة", key: "trip_date" },
  { title: "سعر الرحلة", key: "trip_price" },
  { title: "نوع المركبات", key: "transport_type_names" },
];

const tripItems = computed(() =>
  tripTableItems.value.map((item) => ({
      id: item.item_id,
      item_id: item.item_id,
    name: item.item_name,
    unit: item.unit_name,
    quantity: item.quantity,
    trip_date: item.trip_date ? formatDateDdMmYyyy(item.trip_date) : "—",
    trip_price: item.trip_price ?? "—",
    transport_type_names: item.transport_type_names || getTransportTypeNames(item.transport_type) || "—",
  }))
);

// Page loading
const pageLoading = ref(false);

onMounted(async () => {
  pageLoading.value = true;
  await Promise.all([
    fetchConstants(),
    fetchUnits(),
    fetchCustomers(),
    fetchCategories(),
  ]);

  if (isEditMode.value) {
    await fetchFormData();
  } else if (fromQuotationId.value) {
    await fetchQuotationForOrder();
  }
  pageLoading.value = false;
});
</script>

<template>
  <default-layout>
    <div class="request-material-product-page -mx-6 bg-qallab-dashboard-bg space-y-4">
      <!-- Page Header -->
      <TopHeader
        :icon="filePlusIcon"
        title-key="pages.SalesOrdersLogistics.FormTitle"
        :description-key="isEditMode ? 'pages.SalesOrdersLogistics.FormDescriptionEdit' : 'pages.SalesOrdersLogistics.FormDescriptionCreate'"
        :show-action="false"
        :code="isEditMode ? (formData.code || '') : ''"
        :code-icon="fileIcon"
      />

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
              <SelectInput
                v-model="formData.customer_id"
                :items="customerItems"
                label="اسم العميل"
                item-title="title"
                :rules="[required()]"
                item-value="value"
                density="comfortable"
                placeholder="حدد العميل"
              />
            </div>

            <!-- Responsible Person -->
            <div>
              <TextInput
                v-model="formData.responsible_person"
                placeholder="أدخل اسم المسؤول"
                label="اسم المسؤول"
                :rules="[required()]"
                density="comfortable"
              />
            </div>

            <!-- Responsible Phone -->
            <div>
              <TelInput
                label="هاتف المسؤول"
                v-model="formData.responsible_phone"
                placeholder="5XX XXX XXXX"
                density="comfortable"
                :rules="[required(), saudiPhone()]"
              />
            </div>

            <!-- Order Date -->
            <div>
              <DateTimePickerInput
                v-model="formData.so_datetime"
                density="comfortable"
                placeholder="اختر التاريخ"
                label="تاريخ الطلبية"
              />
            </div>

            <!-- Order Type -->
            <div>
              <SelectInput
                v-model="formData.so_type"
                :items="requestTypeItems"
                label="نوع الطلبية"
                density="comfortable"
                placeholder="اختر"
              />
            </div>

            <!-- Source Location (موقع التحميل) -->
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block"
                >موقع التحميل <span class="text-error-600">*</span></label
              >
              <div
                @click="openMapDialog('source')"
                class="flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer transition-colors"
                :class="sourceLocationError ? '!border-error-500 bg-error-50' : '!border-blue-400 hover:bg-blue-100'"
              >
                <span
                  class="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  :class="sourceLocationError ? 'text-error-700' : 'text-blue-900'"
                >
                  {{ formData.source_location || "حدد الموقع" }}
                </span>
                <div class="flex items-center gap-2">
                  <span v-html="mapMarkerIcon"></span>
                </div>
              </div>
              <p v-if="sourceLocationError" class="text-error-600 text-xs mt-1">{{ sourceLocationError }}</p>
            </div>

            <!-- Target Location (موقع التنزيل) -->
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block"
                >موقع التنزيل <span class="text-error-600">*</span></label
              >
              <div
                @click="openMapDialog('target')"
                class="flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer transition-colors"
                :class="targetLocationError ? '!border-error-500 bg-error-50' : '!border-blue-400 hover:bg-blue-100'"
              >
                <span
                  class="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  :class="targetLocationError ? 'text-error-700' : 'text-blue-900'"
                >
                  {{ formData.target_location || "حدد الموقع" }}
                </span>
                <div class="flex items-center gap-2">
                  <span v-html="mapMarkerIcon"></span>
                </div>
              </div>
              <p v-if="targetLocationError" class="text-error-600 text-xs mt-1">{{ targetLocationError }}</p>
            </div>            

            <!-- Project Name -->
            <div>
              <TextInput
                v-model="formData.project_name"
                label="اسم المشروع"
                placeholder="أدخل الإسم"
                density="comfortable"
              />
            </div>

            <!-- Quotation Code (readonly) -->
            <TextInput
              v-model="formData.sale_quotation_code"
              v-if="formData.sale_quotation_code"
              readonly
              label="كود عرض السعر"
              density="comfortable"
              :hide-details="true"
            />

            <!-- PO Reference -->
            <TextInput
              v-model="formData.po_reference"
              label="الرقم المرجعي"
              density="comfortable"
              placeholder="أدخل الرقم المرجعي"
              :hide-details="true"
            />
          </div>
        </v-form>
      </div>

      <!-- Logistics Details Section -->
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

        <!-- Logistics Details Cards -->
        <div class="px-6 pb-6 space-y-4">
          <div
            v-for="(detail, index) in logisticsDetails"
            :key="index"
            class="border !border-gray-200 rounded-3xl p-6"
          >
            <div class="flex gap-4 items-stretch">
              <!-- Card Content Grid -->
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
                  <p class="text-base font-semibold text-gray-900">{{ detail.actual_execution_interval }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">أوقات النقل</label>
                  <p class="text-base font-semibold text-gray-900">
                    {{ detail.am_pm_interval === "am" ? "صباحاً" : detail.am_pm_interval === "pm" ? "مساءً" : "كلاهما" }}
                  </p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ بدء النقل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.from_date }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ انتهاء النقل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.to_date }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع مركبة النقل</label>
                  <p class="text-base font-semibold text-gray-900">{{ getTransportTypeNames(detail.transport_type) }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد مركبات النقل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.transport_no }} مركبة</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التفريغ</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.loading_responsible_party }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التحميل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail.downloading_responsible_party }}</p>
                </div>
                <v-divider vertical class="my-6" v-if="detail.target_location"></v-divider>
                <div class="info-item-bordered px-4 py-2">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">مبلغ النقل</label>
                  <p class="text-base font-semibold text-gray-900 flex items-center gap-2">
                    {{ detail.transport_amount }} <span v-html="rialIcon"></span>
                  </p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
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

                    <ButtonWithIcon
                :icon="binIcon"
                icon-only
                @click="handleEditLogisticsDetail(detail)"
                size="x-small"
                rounded="lg"
              />
          </div>

            <!-- Location Buttons -->
            <div class="flex justify-end gap-2">
              <ButtonWithIcon
                color="primary-800"
                variant="flat"
                class="text-white"
                rounded="lg"
                :prepend-icon="globeIcon"
                @click="openMapDialog('logistics-source', index)"
              >
                موقع الاستلام
              </ButtonWithIcon>
              <ButtonWithIcon
                color="primary-800"
                variant="flat"
                class="text-white"
                rounded="lg"
                :prepend-icon="globeIcon"
                @click="openMapDialog('logistics-target', index)"
              >
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
            <span v-html="packageIcon"></span>
            <h2 class="text-base font-bold text-primary-600">تفاصيل المنتجات</h2>
          </div>
        </div>

        <!-- Products Table -->
        <DataTable
          :headers="headers"
          :items="tableItems"
          show-actions
          force-show-edit
          force-show-delete
          @edit="handleEditProduct"
          @delete="handleDeleteProduct"
        >
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
                  <span class="text-gray-900">{{ item.notes || "أضف ملاحظة" }}</span>
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
                    placeholder="أضف ملاحظة"
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

        <!-- Add Product Button -->
        <div class="flex justify-center my-6">
          <ButtonWithIcon
            color="primary-100"
            variant="flat"
            class="!text-primary-900 font-bold w-75"
            @click="handleAddProduct"
          >
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
        <DataTable
          :headers="tripHeaders"
          :items="tripItems"
          show-actions
          force-show-edit
          force-show-delete
          @edit="handleEditTrip"
          @delete="handleDeleteTrip"
        />

        <!-- Add Trip Button -->
        <div class="flex justify-center my-6">
          <ButtonWithIcon
            color="primary-100"
            variant="flat"
            class="!text-primary-900 font-bold w-75"
            @click="handleAddTrip"
          >
            + إضافة تفاصيل رحلة
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
              <SelectInput
                v-model="formData.payment_method"
                :items="paymentMethodItems"
                density="comfortable"
                placeholder="حدد طريقة الدفع"
                label="طريقة الدفع"
              />
              <!-- Upfront Payment -->
              <PriceInput
                showRialIcon
                v-model="formData.upfront_payment"
                density="comfortable"
                label="دفعة مقدمة"
                placeholder="أدخل قيمة الدفعة"
              />

              <!-- Invoice Interval -->
              <PriceInput
                label="مدة رفع الفاتورة"
                v-model="formData.invoice_interval"
                placeholder="أدخل المدة بالأيام"
                density="comfortable"
              >
                <template #append-inner>
                  <span class="text-gray-500 text-sm">يوم</span>
                </template>
              </PriceInput>
              <!-- Payment Term -->
              <PriceInput
                label="مدة السداد"
                v-model="formData.payment_term_no"
                placeholder="أدخل المدة بالأيام"
                density="comfortable"
              >
                <template #append-inner>
                  <span class="text-gray-500 text-sm">يوم</span>
                </template>
              </PriceInput>

              <!-- Late Fee -->
              <TextInputWithSelect
                v-model="formData.late_fee"
                v-model:selectValue="formData.late_fee_type"
                label="غرامة التأخير"
                placeholder="أدخل المبلغ"
                type="number"
                select-width="110px"
                :select-items="feeTypeItems"
                select-placeholder="اختر"
              />

              <!-- Cancel Fee -->
              <TextInputWithSelect
                v-model="formData.cancel_fee"
                v-model:selectValue="formData.cancel_fee_type"
                label="غرامة الإلغاء"
                placeholder="أدخل المبلغ"
                type="number"
                select-width="110px"
                :select-items="feeTypeItems"
                select-placeholder="اختر"
              />
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

      <!-- Action Buttons -->
      <div class="mt-3 flex items-center justify-center gap-3">
        <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
          <ButtonWithIcon
            variant="flat"
            color="primary"
            height="48"
            rounded="4"
            custom-class="font-semibold text-base px-6 md:!px-10"
            :prepend-icon="returnIcon"
            label="حفظ والعودة للرئيسية"
            :loading="isSubmitting"
            @click="handleSubmit('navigate')"
          />

          <ButtonWithIcon
            variant="flat"
            color="primary-50"
            height="48"
            rounded="4"
            custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10"
            :prepend-icon="saveIcon"
            label="حفظ وإنشاء جديد"
            :loading="isSubmitting"
            @click="handleSubmit('reset')"
          />
        </div>
      </div>
    </div>

    <!-- Unified Map Dialog -->
    <Map
      v-model="showMapDialog"
      :latitude="mapLatitude"
      :longitude="mapLongitude"
      :address="mapAddress"
      @location-selected="handleLocationSelected"
    />

    <!-- Add Logistics Detail Dialog -->
    <AddLogisticsDetailDialog
      v-model="showAddLogisticsDialog"
      :transport-types="transportTypeItems"
      :am-pm-interval-options="amPmIntervalItems"
      :categories-items="categoriesItems"
      :actual-execution-interval-options="actualExecutionIntervalItems"
      :edit-detail="editingLogisticsDetail"
      @saved="handleLogisticsDetailSaved"
      @updated="handleLogisticsDetailUpdated"
    />

    <!-- Add Product Dialog -->
    <AddProductDialog
      v-model="showAddProductDialog"
      :request-type="productDialogMode"
      variant="sales"
      :showUnitPriceAndDiscount="false"
      :transport-types="transportTypeItems"
      :unit-items="unitItems"
      :customer-id="formData.customer_id"
      :edit-product="editingProduct"
      :existing-products="productDialogMode === 'logistics' ? productTableItems : tripTableItems"
      @saved="handleProductSaved"
      @product-updated="handleProductUpdated"
    />

    <v-overlay :model-value="pageLoading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>
  </default-layout>
</template>

<style scoped></style>
