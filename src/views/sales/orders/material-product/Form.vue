<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AddProductDialog from "@/components/price-offers/AddProductDialog.vue";
import EditSupplyDetailsDialog from "@/components/price-offers/EditSupplyDetailsDialog.vue";
import TopHeader from "@/components/price-offers/TopHeader.vue";
import { useApi } from "@/composables/useApi";
import {
  fileIcon,
  mapMarkerIcon,
  messagePlusIcon,
  filePlusIcon,
  truckIcon,
  busIcon,
  listIcon,
  CoinHandIcon,
  fileCheckIcon,
} from "@/components/icons/priceOffersIcons";
import {
  returnIcon,
  saveIcon,
  HelpCircleIcon,
} from "@/components/icons/globalIcons";

const { t } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
// Check if creating order from quotation
const fromQuotationId = computed(() => route.query.from_quotation as string | undefined);
const fromQuotationCode = computed(() => route.query.quotation_code as string | undefined);
const saleQuotationId = computed(() => route.query.sale_quotation_id as string | undefined);
const isLoading = ref(false);
const isSubmitting = ref(false);

const requestTypeItems = ref<any[]>([]);
const paymentMethodItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);
const amPmIntervalItems = ref<any[]>([]);
const feeTypeItems = ref<any[]>([]);
const unitItems = ref<any[]>([]);
const customerItems = ref<any[]>([]);

/** /sales/orders/constants – fee_types لغرامة التأخير وغرامة الإلغاء (respons.json) */
const fetchOrdersConstants = async () => {
  try {
    const res = await api.get<any>("/sales/orders/constants");
    const data = res.data;
    if (data) {
      amPmIntervalItems.value =
        data.am_pm_interval?.map((i: any) => ({
          title: i.label,
          value: i.key,
        })) || [];
      transportTypeItems.value =
        data.transport_types?.map((i: any) => ({
          title: i.label,
          value: i.key,
        })) || [];
      paymentMethodItems.value =
        data.payment_methods?.map((i: any) => ({
          title: i.label,
          value: i.key,
        })) || [];
      feeTypeItems.value =
        data.fee_types?.map((i: any) => ({ title: i.label, value: i.key })) ||
        [];
        requestTypeItems.value =
        data.so_types?.map((i: any) => ({
          title: i.label,
          value: i.key,
        })) || [];
    }
  } catch (e) {
    console.error("Error fetching orders constants:", e);
  }
};

const fetchCustomers = async () => {
  try {
    const res = await api.get<any>("/customers/list");
    if (Array.isArray(res.data)) {
      customerItems.value = res.data.map((i: any) => ({
        title: i.full_name,
        value: i.id,
      }));
    }
  } catch (e) {
    console.error("Error fetching customers:", e);
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

// Helper function to get transport type name from id
const getTransportTypeName = (
  transportTypeId: number | string | null,
): string => {
  if (!transportTypeId) return "";
  const id = Number(transportTypeId);
  const item = transportTypeItems.value.find((i: any) => i.value === id);
  return item?.title || "";
};

// Helper function to get am/pm interval label
const getAmPmIntervalLabel = (interval: string | null): string => {
  if (!interval) return "";
  const item = amPmIntervalItems.value.find((i: any) => i.value === interval);
  return item?.title || "";
};

// Fetch form data for edit mode
const fetchFormData = async () => {
  if (!isEditMode.value || !routeId.value) return;

  isLoading.value = true;
  try {
    const res = await api.get<any>(
      `/sales/orders/building-materials/${routeId.value}`,
    );
    const data = res.data;

    if (data) {
      // Populate form data
      formData.value.code = data.code || "";
      formData.value.sale_quotation_code = data.sale_quotation_code || null;
      formData.value.po_reference = data.po_reference || null;
      formData.value.customer_id = data.customer_id;
      formData.value.price_offer_name = data.price_offer_name || "";
      formData.value.project_name = data.project_name || "";
      formData.value.so_type = data.so_type || "";
      formData.value.invoice_interval = data.invoice_interval ?? null;
      formData.value.payment_term_no = data.payment_term_no ?? null;
      formData.value.issueDate = data.request_datetime
        ? data.request_datetime.split(" ")[0]
        : "";
      formData.value.so_datetime = normalizePoDateTime(
        data.so_datetime || data.request_datetime || "",
      );
      formData.value.requestStatus = data.status_id;
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
      formData.value.textNote = data.notes || "";

      const attached = data.so_attached_logistics_detail || null;
      if (attached) {
        formData.value.transport_start_date = attached.from_date || "";
        formData.value.transport_end_date = attached.to_date || "";
        formData.value.execution_period =
          attached.actual_execution_duration ?? null;
        formData.value.daily_trips = attached.trip_no ?? null;
        formData.value.transport_movements = attached.transport_no ?? null;
        formData.value.transport_vehicle_type = Array.isArray(
          attached.transport_type,
        )
          ? attached.transport_type.map((t: string | number) => Number(t))
          : [];
        formData.value.loading_responsible =
          attached.loading_responsible_party || "";
        formData.value.unloading_responsible =
          attached.downloading_responsible_party || "";
      }

      // جدول المنتجات: دمج data.items مع so_logistics_product_details / logistics_product_details (مطابق لكل item_id)
      if (data.items && Array.isArray(data.items)) {
        const logisticsByItemId: Record<number, any> = {};
        const logisticsList =
          data.so_logistics_product_details ?? data.logistics_product_details;
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
                .join(", ")
            : getTransportTypeName(item.transport_type);

          return {
            id: item.id,
            item_id: itemId,
            item_name: item.item_name || "",
            unit_id: item.unit_id ?? null,
            unit_name: item.unit_name || "",
            quantity: item.quantity ?? null,
            transport_type: item.transport_type ?? vehicleTypes[0] ?? null,
            transport_type_name: transportTypeName,
            trip_no: item.trip_no ?? log?.number_of_trips ?? null,
            notes: item.notes || "",
            price_per_unit: item.price_per_unit ?? null,
            discount_type: item.discount_type ?? null,
            discount_val: item.discount_val ?? null,
            // تعيين القيم المحسوبة لـ null لإجبار إعادة الحساب عند التعديل
            total_tax: null,
            subtotal_before_discount: null,
            subtotal_after_discount: null,
            trip_start: log?.trip_start ?? null,
            number_of_trips: log?.number_of_trips ?? null,
            trip_capacity: log?.trip_capacity ?? null,
            am_pm_interval: log?.am_pm_interval ?? null,
            vehicle_types: vehicleTypes.length
              ? vehicleTypes
              : item.transport_type != null
              ? [Number(item.transport_type)]
              : [],
            logistics_detail_id: log?.id ?? null,
          };
        });
      }

      // Populate transport service من logistics_detail أو so_attached_logistics_detail
      const attachedLogistics =
        data.so_attached_logistics_detail ?? data.logistics_detail;
      if (
        attachedLogistics &&
        (attachedLogistics.from_date || attachedLogistics.to_date)
      ) {
        let vehicleTypes: number[] = [];
        if (attachedLogistics.transport_type) {
          if (Array.isArray(attachedLogistics.transport_type)) {
            vehicleTypes = attachedLogistics.transport_type.map(
              (t: string | number) => Number(t),
            );
          } else {
            vehicleTypes = [Number(attachedLogistics.transport_type)];
          }
        }
        const vehicleTypesLabels = vehicleTypes
          .map((id) => getTransportTypeName(id))
          .filter(Boolean)
          .join(", ");

        Supply.value = {
          id: attachedLogistics.id,
          from_date: attachedLogistics.from_date || "",
          to_date: attachedLogistics.to_date || "",
          vehicle_types: vehicleTypes,
          vehicle_types_labels: vehicleTypesLabels,
          am_pm_interval: attachedLogistics.am_pm_interval || "",
          am_pm_interval_label: getAmPmIntervalLabel(
            attachedLogistics.am_pm_interval,
          ),
          notes: attachedLogistics.notes || "",
        };
      }
    }
  } catch (e) {
    console.error("Error fetching form data:", e);
  } finally {
    isLoading.value = false;
  }
};

// Helper function to get unit name from id
const getUnitName = (unitId: number | null): string => {
  if (unitId == null) return "";
  const unit = unitItems.value.find((u: any) => u.value === unitId || u.value === Number(unitId));
  return unit?.title || "";
};

// Fetch quotation data and pre-fill form when creating order from quotation
const fetchQuotationForOrder = async () => {
  if (!fromQuotationId.value) return;

  // Set quotation code from query param
  if (fromQuotationCode.value) {
    formData.value.sale_quotation_code = fromQuotationCode.value as any;
  }

  isLoading.value = true;
  try {
    const res = await api.get<any>(`/sales/quotations/building-materials/${fromQuotationId.value}`);
    const data = res.data;

    if (data) {
      // Set quotation code from API response if not already set from query param
      if (data.code && !fromQuotationCode.value) {
        formData.value.sale_quotation_code = data.code;
      }
      
      // Map quotation fields to order form fields
      formData.value.customer_id = data.customer_id != null ? Number(data.customer_id) : null;
      formData.value.project_name = data.project_name || "";
      formData.value.target_location = data.target_location || null;
      formData.value.target_latitude = data.target_latitude || null;
      formData.value.target_longitude = data.target_longitude || null;
      formData.value.paymentMethod = data.payment_method || null;
      formData.value.advancePayment = data.upfront_payment || null;
      formData.value.invoice_interval = data.invoice_interval != null ? Number(data.invoice_interval) : null;
      formData.value.payment_term_no = data.payment_term_no != null ? Number(data.payment_term_no) : null;
      formData.value.late_fee_type = data.late_fee_type || null;
      formData.value.late_fee = data.late_fee != null ? Number(data.late_fee) : null;
      formData.value.cancel_fee_type = data.cancel_fee_type || null;
      formData.value.cancel_fee = data.cancel_fee != null ? Number(data.cancel_fee) : null;
      formData.value.textNote = data.notes || "";
      
      // Map quotation_type to so_type if available
      if (data.quotation_type) {
        formData.value.so_type = data.quotation_type;
      }

      // Map products (items) from quotation to order
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
                .join(", ")
            : "";

          // Get unit name from unitItems if not provided in response
          const unitName = item.unit_name || item.unit?.name || getUnitName(item.unit_id);

          return {
            item_id: itemId,
            item_name: item.item_name || item.item?.name || "",
            unit_id: item.unit_id ?? null,
            unit_name: unitName,
            quantity: item.quantity ?? null,
            transport_type: vehicleTypes[0] ?? null,
            transport_type_name: transportTypeName,
            trip_no: log?.number_of_trips ?? null,
            notes: item.note || item.notes || "",
            price_per_unit: item.price_per_unit ?? null,
            unit_price: item.price_per_unit ?? null,
            discount: item.discount_val ?? null,
            discount_type: item.discount_type ?? null,
            discount_val: item.discount_val ?? null,
            // Use exact values from API without recalculation
            total_tax: item.total_tax ?? null,
            subtotal_before_discount: item.subtotal_before_discount ?? null,
            subtotal_after_discount: item.subtotal_after_tax ?? item.subtotal_after_discount ?? null,
            trip_start: log?.trip_start ?? null,
            number_of_trips: log?.number_of_trips ?? null,
            trip_capacity: log?.trip_capacity ?? null,
            am_pm_interval: log?.am_pm_interval ?? null,
            vehicle_types: vehicleTypes,
          };
        });
      }
    }
  } catch (e) {
    console.error("Error fetching quotation data:", e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([
    fetchOrdersConstants(),
    fetchUnits(),
    fetchCustomers(),
  ]);

  // Fetch form data if in edit mode
  if (isEditMode.value) {
    await fetchFormData();
  } else if (fromQuotationId.value) {
    // Fetch quotation data if creating order from quotation
    await fetchQuotationForOrder();
  }
});

// Interface for product items (مطابق لـ request-body items + so_logistics_product_details مرتبط بـ item_id)
interface ProductTableItem {
  item_id: number;
  item_name: string;
  unit_id: number | null;
  unit_name: string;
  quantity: number | null;
  transport_type?: number | null;
  transport_type_name?: string;
  trip_no?: number | null;
  notes: string;
  id?: number; // For edit mode
  isAdded?: boolean; // For dialog state
  // حقول من request-body items (وسعر/خصم من المودال)
  price_per_unit?: number | null;
  unit_price?: number | null;
  discount?: number | null;
  discount_type?: number | null;
  discount_val?: number | null;
  total_tax?: number | null;
  subtotal_before_discount?: number | null;
  subtotal_after_discount?: number | null;
  // تفاصيل التوريد لكل منتج (ربط so_logistics_product_details بـ item_id)
  trip_start?: string | null;
  number_of_trips?: number | null;
  trip_capacity?: number | null;
  am_pm_interval?: string | null;
  vehicle_types?: number[];
  logistics_detail_id?: number | null;
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

// Form data with static values
const formData = ref({
  sale_quotation_code: null,
  po_reference: null,
  code: "",
  source_location: null as string | null,
  source_latitude: null as string | null,
  source_longitude: null as string | null,
  target_location: null as string | null,
  target_latitude: null as string | null,
  target_longitude: null as string | null,
  customer_id: null as number | null,
  customer_name: null,
  so_datetime: "",

  // Supply Additional Info Section
  transport_movements: null,
  daily_trips: null,
  loading_responsible: "",
  unloading_responsible: "",
  transport_start_date: "",
  transport_end_date: "",
  execution_period: null,
  execution_period_unit: null as string | null,
  transport_vehicle_type: [] as (string | number)[],

  // مطابقة request-body.json
  so_type: null as string | null,
  invoice_interval: null as number | null,
  payment_term_no: null as number | null,
  late_fee_type: null as string | null,
  late_fee: null as number | null,
  cancel_fee_type: null as string | null,
  cancel_fee: null as number | null,
  // Old fields (keeping for compatibility)
  price_offer_name: "",
  project_name: "",
  issueDate: "",
  requestStatus: null,
  paymentMethod: null,
  advancePayment: null,
  delay_fine: null,
  delay_fine_unit: null,
  cancel_fine: null,
  cancel_fine_unit: null,
  textNote: "",
  image: null,
  // account: null,
  voice_attachment: null,
});

// Products table items (dynamically populated from dialog)
const productTableItems = ref<ProductTableItem[]>([]);

// Transport service (single item - dynamically populated from dialog)
const Supply = ref<Supply | null>(null);

import { useNotification } from "@/composables/useNotification";
import { required, numeric, positive } from "@/utils/validators";



const showAddProductDialog = ref(false);
const editingProduct = ref<ProductTableItem | null>(null);

const handleAddProduct = () => {
  editingProduct.value = null; // Reset edit mode
  showAddProductDialog.value = true;
};

const handleProductSaved = (products: any[]) => {
  // Merge new products while preserving existing notes
  const newItems: ProductTableItem[] = [];

  products.forEach((p) => {
    // Find if this product already exists in the table
    const existing = productTableItems.value.find(
      (existing) => existing.item_id === p.item_id,
    );

    newItems.push({
      ...p,
      notes: existing?.notes || p.notes || "", // Preserve existing notes
      // Clear cached values to force recalculation
      total_tax: null,
      subtotal_before_discount: null,
      subtotal_after_discount: null,
    } as ProductTableItem);
  });

  productTableItems.value = newItems;
};

const handleEditProduct = (item: any) => {
  // Find the full product data
  const productToEdit = productTableItems.value.find(
    (p) => p.item_id === item.item_id,
  );
  if (productToEdit) {
    editingProduct.value = { ...productToEdit, isAdded: true } as any;
    showAddProductDialog.value = true;
  }
};

const handleProductUpdated = (updatedProduct: any) => {
  const index = productTableItems.value.findIndex(
    (p) => p.item_id === updatedProduct.item_id,
  );
  if (index !== -1) {
    // Preserve the notes from the table
    const existingNotes = productTableItems.value[index].notes;
    productTableItems.value[index] = {
      ...updatedProduct,
      notes: existingNotes || updatedProduct.notes || "",
      // Clear cached values to force recalculation
      total_tax: null,
      subtotal_before_discount: null,
      subtotal_after_discount: null,
    } as ProductTableItem;
  }
  editingProduct.value = null;
};

const handleDeleteProduct = (item: any) => {
  const index = productTableItems.value.findIndex(
    (p) => p.item_id === item.item_id,
  );
  if (index !== -1) {
    productTableItems.value.splice(index, 1);
  }
};

const handleNewRequest = () => {
  console.log("New Request clicked");
};

import { useForm } from "@/composables/useForm";

const { formRef, isFormValid, validate } = useForm();
const { success, warning, apiError } = useNotification();

// Format date to DD-MM-YYYY
const formatDate = (date: string | Date): string => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
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

// Build FormData for submission (مفاتيح مطابقة لـ request-body.json مستقبلاً)
const buildFormData = (): FormData => {
  const fd = new FormData();

  // Include sale_quotation_id if creating order from quotation
  if (saleQuotationId.value) {
    fd.append("sale_quotation_id", saleQuotationId.value);
  }

  // Basic fields (مطابقة request-body: so_type, so_datetime, customer_id, ...)
  fd.append("so_type", formData.value.so_type || "");
  fd.append(
    "so_datetime",
    normalizePoDateTime(formData.value.so_datetime || ""),
  );
  if (isEditMode.value) {
        fd.append('_method', 'PUT');
    }
  fd.append("customer_id", String(formData.value.customer_id || ""));
  fd.append("source_location", formData.value.source_location || "");
  fd.append("source_latitude", String(formData.value.source_latitude ?? ""));
  fd.append("source_longitude", String(formData.value.source_longitude ?? ""));
  fd.append("target_location", formData.value.target_location || "");
  fd.append("target_latitude", String(formData.value.target_latitude ?? ""));
  fd.append("target_longitude", String(formData.value.target_longitude ?? ""));
  fd.append("project_name", formData.value.project_name || "");
  fd.append("po_reference", formData.value.po_reference || "");
  fd.append("payment_method", formData.value.paymentMethod || "");
  fd.append("upfront_payment", String(formData.value.advancePayment ?? ""));
  fd.append("invoice_interval", String(formData.value.invoice_interval ?? 1));
  fd.append("payment_term_no", String(formData.value.payment_term_no ?? 3));
  fd.append("late_fee_type", String(formData.value.late_fee_type ?? ""));
  fd.append("late_fee", String(formData.value.late_fee ?? ""));
  fd.append("cancel_fee_type", String(formData.value.cancel_fee_type ?? ""));
  fd.append("cancel_fee", String(formData.value.cancel_fee ?? ""));
  fd.append("notes", formData.value.textNote || "");

  // so_attached_logistics_detail (بيانات التوريد الإضافية من الفورم - مطابق request-body.json)
  fd.append(
    "so_attached_logistics_detail[from_date]",
    formatDate(formData.value.transport_start_date),
  );
  fd.append(
    "so_attached_logistics_detail[to_date]",
    formatDate(formData.value.transport_end_date),
  );
  fd.append(
    "so_attached_logistics_detail[actual_execution_duration]",
    String(formData.value.execution_period ?? ""),
  );
  fd.append(
    "so_attached_logistics_detail[trip_no]",
    String(formData.value.daily_trips ?? ""),
  );
  fd.append(
    "so_attached_logistics_detail[transport_no]",
    String(formData.value.transport_movements ?? ""),
  );
  if (formData.value.transport_vehicle_type && formData.value.transport_vehicle_type.length > 0) {
    formData.value.transport_vehicle_type.forEach((type, index) => {
      fd.append(
        `so_attached_logistics_detail[transport_type][${index}]`,
        String(type),
      );
    });
  }
  fd.append(
    "so_attached_logistics_detail[loading_responsible_party]",
    formData.value.loading_responsible || "",
  );
  fd.append(
    "so_attached_logistics_detail[downloading_responsible_party]",
    formData.value.unloading_responsible || "",
  );

  // items (مطابقة request-body: إرسال قيم من جدول المنتجات مع حساب الاحتياطي كجدول العرض)
  productTableItems.value.forEach((item, index) => {
    const pricePerUnit = item.price_per_unit ?? item.unit_price ?? 0;
    const discountVal = item.discount_val ?? item.discount ?? 0;
    const subtotalBefore = item.subtotal_before_discount ?? getSubtotalBeforeTax(item);
    const taxAmount = item.total_tax ?? getTaxAmount(item);
    const subtotalAfter = item.subtotal_after_discount ?? getTotalAmount(item);

    if (isEditMode.value && item.id) {
      fd.append(`items[${index}][id]`, String(item.id));
    }
    fd.append(`items[${index}][item_id]`, String(item.item_id));
    fd.append(`items[${index}][unit_id]`, String(item.unit_id || ""));
    fd.append(`items[${index}][quantity]`, String(item.quantity ?? ""));
    fd.append(`items[${index}][price_per_unit]`, String(pricePerUnit));
    fd.append(`items[${index}][discount_type]`, String(item.discount_type ?? ""));
    fd.append(`items[${index}][discount_val]`, String(discountVal));
    fd.append(`items[${index}][total_tax]`, String(taxAmount));
    fd.append(`items[${index}][subtotal_before_discount]`, String(subtotalBefore));
    fd.append(`items[${index}][subtotal_after_discount]`, String(subtotalAfter));
    fd.append(`items[${index}][notes]`, item.notes ?? "");
  });

  // so_logistics_product_details (تفاصيل توريد لكل منتج - مرتبط بـ item_id)
  productTableItems.value.forEach((item, index) => {
    if (isEditMode.value && item.logistics_detail_id) {
      fd.append(
        `so_logistics_product_details[${index}][id]`,
        String(item.logistics_detail_id),
      );
    }
    fd.append(
      `so_logistics_product_details[${index}][item_id]`,
      String(item.item_id),
    );
    fd.append(
      `so_logistics_product_details[${index}][quantity]`,
      String(item.quantity || ""),
    );
    fd.append(
      `so_logistics_product_details[${index}][trip_start]`,
      item.trip_start || "",
    );
    fd.append(
      `so_logistics_product_details[${index}][number_of_trips]`,
      String(item.number_of_trips ?? item.trip_no ?? ""),
    );
    fd.append(
      `so_logistics_product_details[${index}][trip_capacity]`,
      String(item.trip_capacity ?? ""),
    );
    fd.append(
      `so_logistics_product_details[${index}][am_pm_interval]`,
      item.am_pm_interval || "",
    );
    if (item.vehicle_types && item.vehicle_types.length > 0) {
      item.vehicle_types.forEach((t: number, i: number) => {
        fd.append(
          `so_logistics_product_details[${index}][transport_type][${i}]`,
          String(t),
        );
      });
    }
  });

  // File attachments
  if (formData.value.image) {
    fd.append("image", formData.value.image);
  }

  // if (formData.value.voice_attachment) {
  //     fd.append('voice_attachment', formData.value.voice_attachment);
  // }

  return fd;
};

/** إعادة تعيين النموذج بالكامل (للوضع "حفظ وإنشاء جديد") */
const resetForm = () => {
  formData.value = {
    sale_quotation_code: null,
    po_reference: null,
    code: "",
    source_location: null,
    source_latitude: null,
    source_longitude: null,
    target_location: null,
    target_latitude: null,
    target_longitude: null,
    customer_id: null,
    customer_name: null,
    so_datetime: "",
    transport_movements: null,
    daily_trips: null,
    loading_responsible: "",
    unloading_responsible: "",
    transport_start_date: "",
    transport_end_date: "",
    execution_period: null,
    execution_period_unit: null,
    transport_vehicle_type: [],
    so_type: null,
    invoice_interval: null,
    payment_term_no: null,
    late_fee_type: null,
    late_fee: null,
    cancel_fee_type: null,
    cancel_fee: null,
    price_offer_name: "",
    project_name: "",
    issueDate: "",
    requestStatus: null,
    paymentMethod: null,
    advancePayment: null,
    delay_fine: null,
    delay_fine_unit: null,
    cancel_fine: null,
    cancel_fine_unit: null,
    textNote: "",
    image: null,
    voice_attachment: null,
  };
  productTableItems.value = [];
  Supply.value = null;
  editingProduct.value = null;
  showAddProductDialog.value = false;
  showAddSupplyDialog.value = false;
};

/** options.redirectToList: بعد النجاح الانتقال لصفحة القائمة؛ وإلا (حفظ وإنشاء جديد) إعادة تعيين النموذج ثم التوجيه لصفحة الإنشاء */
const handleSubmit = async (options?: { redirectToList?: boolean }) => {
  if (!(await validate())) return;

  if (productTableItems.value.length === 0) {
    warning("يجب إضافة منتج واحد على الأقل");
    return;
  }

  isSubmitting.value = true;

  try {
    const fd = buildFormData();

    let response;
    if (isEditMode.value) {
      response = await api.post(
        `/sales/orders/building-materials/${routeId.value}`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    } else {
      response = await api.post("/sales/orders/building-materials", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    success(isEditMode.value ? "تم تحديث الطلب بنجاح" : "تم إنشاء الطلب بنجاح");

    if (options?.redirectToList) {
      router.push({ name: "SalesOrdersMaterialProductList" });
    } else {
      resetForm();
      router.push({ name: "SalesOrdersMaterialProductCreate" });
    }
  } catch (e: any) {
    console.error("Error submitting form:", e);
    apiError(e);
  } finally {
    isSubmitting.value = false;
  }
};

const handleConvertToPrice = () => {
  console.log("Convert to price offer");
};

const handleLocationSelected = (location: {
  latitude: string;
  longitude: string;
  address: string;
}) => {
  if (mapDialogMode.value === "source") {
    formData.value.source_latitude = location.latitude;
    formData.value.source_longitude = location.longitude;
    formData.value.source_location = location.address;
  } else {
    formData.value.target_latitude = location.latitude;
    formData.value.target_longitude = location.longitude;
    formData.value.target_location = location.address;
  }
};

const showAddSupplyDialog = ref(false);
const editingSupplyProductId = ref<number | null>(null);
const editingSupply = ref<Supply | null>(null);

// جدول تفاصيل التوريد: يعكس المنتجات المضافة (مثل المبيعات) – كل منتج = صف واحد
const supplyDialogProducts = computed(() =>
  productTableItems.value.map((p) => ({
    item_id: p.item_id,
    item_name: p.item_name,
    quantity: p.quantity ?? null,
    unit_name: p.unit_name || "",
    transport_start_date: p.trip_start || "",
    trip_no: p.number_of_trips ?? p.trip_no ?? null,
    vehicle_types: Array.isArray(p.vehicle_types)
      ? p.vehicle_types
      : p.transport_type != null
        ? [p.transport_type]
        : [],
    trip_capacity: p.trip_capacity ?? null,
    am_pm_interval: p.am_pm_interval ?? null,
  }))
);

const getTransportTypeNameFromIds = (ids: (string | number)[]): string => {
  if (!ids?.length) return "";
  return ids
    .map((id) =>
      transportTypeItems.value.find(
        (i: any) => i.value === id || i.value === Number(id)
      )?.title
    )
    .filter(Boolean)
    .join(", ");
};

const handleAddSupply = () => {
  editingSupplyProductId.value = null;
  showAddSupplyDialog.value = true;
};

const handleSupplyDetailsSaved = (
  rows: {
    item_id: number;
    transport_start_date: string;
    trip_no: number | null;
    vehicle_types: (string | number)[];
    trip_capacity?: number | null;
    am_pm_interval?: string | null;
  }[]
) => {
  rows.forEach((row) => {
    const product = productTableItems.value.find(
      (p) => p.item_id === row.item_id
    );
    if (product) {
      product.trip_start = row.transport_start_date || null;
      product.number_of_trips = row.trip_no;
      product.trip_no = row.trip_no;
      product.vehicle_types = (row.vehicle_types || []).map((v) => Number(v));
      product.transport_type_name =
        getTransportTypeNameFromIds(row.vehicle_types);
      if (row.vehicle_types?.length)
        product.transport_type = Number(row.vehicle_types[0]);
      product.trip_capacity = Number(row.trip_capacity) ?? null;
      product.am_pm_interval = row.am_pm_interval ?? null;
    }
  });
  showAddSupplyDialog.value = false;
  editingSupplyProductId.value = null;
};

const handleEditSupply = (row: { item_id?: number; id?: string | number }) => {
  const itemId = row.item_id ?? row.id;
  const product = productTableItems.value.find(
    (p) => p.item_id === itemId || p.item_id === Number(itemId)
  );
  if (product) {
    editingSupplyProductId.value = product.item_id;
    showAddSupplyDialog.value = true;
  }
};

const handleDeleteSupply = () => {
  Supply.value = null;
};

const handleSupplySaved = (service: Supply) => {
  Supply.value = service;
};

const handleSupplyUpdated = (service: Supply) => {
  Supply.value = service;
  editingSupply.value = null;
};

const showMapDialog = ref(false);
/** 'target' = موقع المشروع (target_*), 'source' = موقع مصدر المواد (source_*) */
const mapDialogMode = ref<"target" | "source">("target");
const openMapDialog = (mode: "target" | "source") => {
  mapDialogMode.value = mode;
  showMapDialog.value = true;
};

// نفس أعمدة جدول المنتجات في فورم المبيعات: اسم المنتج، الوحدة، الكمية، سعر الوحدة، خصم، مبلغ الضريبة، إجمالي المبلغ، ملاحظات
const headers = [
  { title: "اسم المنتج", key: "name" },
  { title: "الوحدة", key: "unit" },
  { title: "الكمية", key: "quantity" },
  { title: "سعر الوحدة", key: "unit_price" },
  { title: "خصم", key: "discount" },
  { title: "مبلغ الضريبة", key: "tax_amount" },
  { title: "إجمالي المبلغ", key: "total_amount" },
  { title: "ملاحظات", key: "notes" },
];

// الضريبة ثابتة 15% (مثل المبيعات)
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

// Computed items for the DataTable (مطابق لجدول المبيعات)
const tableItems = computed(() =>
  productTableItems.value.map((item) => ({
    id: item.item_id,
    item_id: item.item_id,
    name: item.item_name,
    unit: item.unit_name,
    quantity: item.quantity,
    unit_price: item.price_per_unit ?? item.unit_price ?? 0,
    discount: item.discount_val ?? item.discount ?? 0,
    tax_amount: item.total_tax ?? getTaxAmount(item),
    total_amount: item.subtotal_after_discount ?? getTotalAmount(item),
    notes: item.notes,
  })),
);

// ملخص المبالغ من جدول المنتجات (للجدول الجانبي - مثل فورم المبيعات)
const summaryTotals = computed(() => {
  const items = productTableItems.value;
  // المجموع قبل الخصم = الكمية × سعر الوحدة
  const subtotalBeforeDiscount = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price_per_unit ?? item.unit_price) || 0;
    return sum + qty * price;
  }, 0);
  // الخصم الكلي
  const totalDiscount = items.reduce(
    (sum, item) => sum + (Number(item.discount_val ?? item.discount) || 0),
    0,
  );
  // المجموع بعد الخصم
  const subtotalAfterDiscount =
    Math.round((subtotalBeforeDiscount - totalDiscount) * 100) / 100;
  // إجمالي الضريبة
  const totalTaxAmount = items.reduce(
    (sum, item) => sum + (item.total_tax ?? getTaxAmount(item)),
    0,
  );
  // الإجمالي النهائي
  const finalTotal =
    Math.round((subtotalAfterDiscount + totalTaxAmount) * 100) / 100;
  return {
    subtotalBeforeDiscount: Math.round(subtotalBeforeDiscount * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    subtotalAfterDiscount,
    totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
    finalTotal,
  };
});

// جدول تفاصيل التوريد: يعكس المنتجات المضافة أعلاه (المنتج، الكمية، تاريخ بداية النقل، نوع المركبة، عدد الرحلات، سعة الرحلة، توقيت الرحلة)
const ServicesHeaders = [
  { title: "المنتج", key: "product_name" },
  { title: "الكمية", key: "quantity_display" },
  { title: "تاريخ بداية النقل", key: "transport_start_date" },
  { title: "نوع مركبة النقل", key: "transport_type_name" },
  { title: "عدد الرحلات", key: "trip_no" },
  { title: "سعة الرحلة", key: "trip_capacity" },
  { title: "توقيت الرحلة", key: "am_pm_interval_label" },
];

// عناصر الجدول مبنية على جدول المنتجات: كل منتج = صف واحد (زر التعديل فقط، بدون حذف)
const serviceTableItems = computed(() =>
  productTableItems.value.map((item) => {
    const qty = item.quantity != null ? String(item.quantity) : "";
    const unit = item.unit_name || "";
    const quantity_display = [qty, unit].filter(Boolean).join(" ") || "—";
    return {
      id: item.item_id,
      item_id: item.item_id,
      product_name: item.item_name,
      quantity_display,
      transport_start_date: item.trip_start || "—",
      transport_type_name: item.transport_type_name || "—",
      trip_no:
        item.number_of_trips != null
          ? item.number_of_trips
          : item.trip_no != null
            ? item.trip_no
            : "—",
      trip_capacity: item.trip_capacity ?? "—",
      am_pm_interval_label: getAmPmIntervalLabel(item.am_pm_interval ?? null) || "—",
      actions: { can_update: true, can_delete: false },
    };
  })
);
</script>

<template>
  <default-layout>
    <div
      class="request-material-product-page -mx-6 bg-qallab-dashboard-bg space-y-4"
    >
      <!-- Page Header -->
      <TopHeader
        :icon="filePlusIcon"
        title-key="pages.SalesRequests.FormTitle"
        description-key="pages.SalesRequests.FormDescription"
        :show-action="false"
        :code="isEditMode ? formData.code : ''"
        :code-icon="fileIcon"
        @action="handleNewRequest"
      />

      <!-- Request Information Section -->
      <div class="p-6 bg-white rounded-3xl border !border-gray-100">
        <div class="flex items-center mb-6 gap-2 text-primary-600">
          <span v-html="fileCheckIcon"></span>
          <h2 class="text-base font-bold">البيانات الأساسية</h2>
        </div>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <!-- اسم العميل -->
            <div>
              <SelectInput
                v-model="formData.customer_id"
                :items="customerItems"
                placeholder="اختر العميل"
                label="اسم العميل"
                :rules="[required()]"
                density="comfortable"
                item-title="title"
                item-value="value"
              />
            </div>

            <!-- Request Date -->
            <div>
              <DateTimePickerInput
                v-model="formData.so_datetime"
                density="comfortable"
                placeholder="اختر التاريخ والوقت"
                label="تاريخ الطلبية"
              />
            </div>

            <!-- Request Type -->
            <div>
              <SelectInput
                v-model="formData.so_type"
                :items="requestTypeItems"
                label="نوع الطلبية"
                density="comfortable"
                placeholder="اختر"
              />
            </div>

            <!-- موقع المشروع → target_location (مثل فورم عروض الأسعار) -->
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block"
                >موقع المشروع</label
              >
              <div
                @click="openMapDialog('target')"
                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <span
                  class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {{ formData.target_location || "حدد الموقع" }}
                </span>
                <div class="flex items-center gap-2">
                  <span v-html="mapMarkerIcon"></span>
                </div>
              </div>
            </div>

            <!-- موقع مصدر المواد → source_location -->
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block"
                >موقع مصدر المواد</label
              >
              <div
                @click="openMapDialog('source')"
                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <span
                  class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {{ formData.source_location || "حدد الموقع" }}
                </span>
                <div class="flex items-center gap-2">
                  <span v-html="mapMarkerIcon"></span>
                </div>
              </div>
            </div>            

            <!-- Project -->
            <div>
              <TextInput
                v-model="formData.project_name"
                label="المشروع"
                density="comfortable"
                placeholder="ادخل اسم المشروع"
              />
            </div>

            <!-- Delegation Method -->
            <!-- <div>
              <label class="text-gray-700 text-sm font-semibold mb-2 block"
                >طلبية تعويض</label
              >
              <v-switch
                :model-value="formData.delegation_method"
                hide-details
                inset
                density="compact"
                color="primary"
                class="small-switch"
              />
            </div> -->

            <TextInput
              v-model="formData.sale_quotation_code"
              v-if="formData.sale_quotation_code"
              readonly
              label="كود عرض السعر"
              density="comfortable"
              :hide-details="true"
            >
              <template #append-inner>
                <v-tooltip location="top" content-class="custom-tooltip">
                  <template #activator="{ props: tooltipProps }">
                    <ButtonWithIcon
                      variant="text"
                      size="small"
                      density="compact"
                      custom-class="!min-w-0 p-0"
                      :prepend-icon="HelpCircleIcon"
                      v-bind="tooltipProps"
                    />
                  </template>
                  <div>كود عرض السعر</div>
                </v-tooltip>
              </template>
            </TextInput>

            <TextInput
              v-model="formData.po_reference"
              label="الرقم المرجعي"
              density="comfortable"
              placeholder="أدخل الرقم المرجعي"
              :hide-details="true"
            >
              <template #append-inner>
                <v-tooltip location="top" content-class="custom-tooltip">
                  <template #activator="{ props: tooltipProps }">
                    <ButtonWithIcon
                      variant="text"
                      size="small"
                      density="compact"
                      custom-class="!min-w-0 p-0"
                      :prepend-icon="HelpCircleIcon"
                      v-bind="tooltipProps"
                    />
                  </template>
                  <div>الرقم المرجعي</div>
                </v-tooltip>
              </template>
            </TextInput>
          </div>
        </v-form>
      </div>

      <!-- Products Section -->
      <div class="bg-white rounded-3xl border !border-gray-100">
        <div class="px-6 py-6">
          <div class="flex items-center gap-2 mb-2">
            <span v-html="listIcon"></span>
            <h2 class="text-base font-bold text-primary-600">
              جدول عناصر الطللبية
            </h2>
          </div>
          <p class="text-emerald-500 text-sm font-bold ms-7">
            ** الأسعار شاملة للنقل
          </p>
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
                <div
                  class="flex items-center gap-2 cursor-pointer"
                  v-bind="props"
                >
                  <v-icon
                    size="20"
                    color="primary"
                    v-html="messagePlusIcon"
                  ></v-icon>
                  <span class="text-gray-900">{{
                    item.notes || "أضف ملاحظة"
                  }}</span>
                </div>
              </template>

              <!-- Popup content -->
              <v-card
                class="pa-4 shadow-[rgba(149,157,165,0.2)_0px_8px_24px] overflow-hidden px-3 py-3"
                color="white"
                rounded="lg"
                width="300"
              >
                <div class="!flex flex-nowrap items-center gap-3">
                  <TextInput
                    v-model="
                      productTableItems[
                        productTableItems.findIndex(
                          (p) => p.item_id === item.item_id,
                        )
                      ].notes
                    "
                    placeholder="أضف ملاحظة"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    autofocus
                    class="flex-1"
                  />
                  <ButtonWithIcon
                    :icon="messagePlusIcon"
                    color="primary"
                    icon-only
                    size="x-small"
                  />
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

      <!-- Suppliers details Section -->
      <div class="bg-white rounded-3xl border !border-gray-100">
        <div class="px-6 py-6">
          <div class="flex items-center gap-2">
            <span v-html="busIcon"></span>
            <h2 class="text-base font-bold text-primary-600">تفاصيل التوريد</h2>
          </div>
        </div>

        <DataTable
          :headers="ServicesHeaders"
          :items="serviceTableItems"
          show-actions
          force-show-edit
          @edit="handleEditSupply"
        />

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

      <!-- Supply Additional Information Section -->
      <div class="p-6 bg-white rounded-3xl border !border-gray-100">
        <div class="flex items-center mb-6 gap-2 text-primary-600">
          <span v-html="truckIcon"></span>
          <h2 class="text-base font-bold">بيانات التوريد الإضافية</h2>
        </div>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <!-- Transport Start Date -->
            <div>
              <DatePickerInput
                v-model="formData.transport_start_date"
                type="date"
                density="comfortable"
                placeholder="اختر"
                label="تاريخ بدء النقل"
              />
            </div>

            <!-- Transport End Date -->
            <div>
              <DatePickerInput
                v-model="formData.transport_end_date"
                type="date"
                density="comfortable"
                placeholder="اختر"
                label="تاريخ انتهاء النقل"
                :rules="[required()]"
              />
            </div>

            <!-- Execution Period -->
            <div>
              <PriceInput
                v-model="formData.execution_period"
                label="مدة التنفيذ"
                placeholder="أدخل المدة بالأيام"
                :rules="[required()]"
                density="comfortable"
              >
                <template #append-inner>
                  <span class="text-gray-500 text-sm"> يوم </span>
                </template>
              </PriceInput>
            </div>

            <!-- Transport Vehicle Type -->
            <div>
              <MultipleSelectInput
                v-model="formData.transport_vehicle_type"
                :items="transportTypeItems"
                label="نوع مركبة النقل"
                density="comfortable"
                placeholder="اختر"
                item-title="title"
                item-value="value"
              />
            </div>
            <!-- Number of Transport Movements -->
            <div>
              <PriceInput
                v-model="formData.transport_movements"
                placeholder="أدخل العدد"
                label="عدد مركبات النقل"
                density="comfortable"
              />
            </div>

            <!-- Number of Daily Trips -->
            <div>
              <PriceInput
                v-model="formData.daily_trips"
                placeholder="أدخل العدد"
                label="عدد الرحلات الكلي"
                :rules="[required()]"
                density="comfortable"
              />
            </div>

            <!-- Responsible for Loading -->
            <div>
              <TextInput
                v-model="formData.loading_responsible"
                placeholder="أدخل اسم مسؤول التحميل"
                label="مسؤول التحميل"
                density="comfortable"
              />
            </div>

            <!-- Responsible for Unloading -->
            <div>
              <TextInput
                v-model="formData.unloading_responsible"
                placeholder="أدخل اسم مسؤول التفريغ"
                label="مسؤول التفريغ"
                density="comfortable"
              />
            </div>
          </div>
        </v-form>
      </div>

      <!-- Attachments and Summary Section -->
      <div
        class="grid grid-cols-1 xl:grid-cols-3 justify-between gap-4 bg-qallab-dashboard-bg py-5 px-2"
      >
        <div class="bg-white rounded-2xl xl:col-span-2">
          <div class="flex items-center gap-2 p-6 border-b !border-gray-200">
            <span v-html="CoinHandIcon"></span>
            <h2 class="text-base font-bold text-primary-600">بيانات الدفع</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput
                v-model="formData.paymentMethod"
                :items="paymentMethodItems"
                density="comfortable"
                placeholder="حدد طريقة الدفع"
                label="طريقة الدفع"
              />
              <PriceInput
                showRialIcon
                v-model="formData.advancePayment"
                density="comfortable"
                label="دفعة مقدمة"
                placeholder="أدخل قيمة الدفعة"
              />

              <TextInput
                label="مدة رفع المستخلص"
                v-model="formData.invoice_interval"
                placeholder="أدخل المدة بالأيام"
                :rules="[required(), numeric()]"
                density="comfortable"
              >
                <template #append-inner>
                  <span class="text-gray-500 text-sm"> يوم </span>
                </template>
              </TextInput>
              <TextInput
                label="مدة السداد"
                v-model="formData.payment_term_no"
                placeholder="أدخل المدة بالأيام"
                :rules="[required(), numeric()]"
                density="comfortable"
              >
                <template #append-inner>
                  <span class="text-gray-500 text-sm"> يوم </span>
                </template>
              </TextInput>

              <!-- late_fee / late_fee_type: غرامة التأخير (من /sales/orders/constants fee_types) -->
              <TextInputWithSelect
                v-model="formData.late_fee"
                v-model:selectValue="formData.late_fee_type"
                label="غرامة التأخير"
                placeholder="أدخل المبلغ"
                type="number"
                :rules="[numeric(), positive()]"
                select-width="110px"
                :select-items="feeTypeItems"
                select-placeholder="اختر"
              />

              <!-- cancel_fee / cancel_fee_type: غرامة الإلغاء -->
              <TextInputWithSelect
                v-model="formData.cancel_fee"
                v-model:selectValue="formData.cancel_fee_type"
                label="غرامة الإلغاء"
                placeholder="أدخل المبلغ"
                type="number"
                :rules="[numeric(), positive()]"
                select-width="110px"
                :select-items="feeTypeItems"
                select-placeholder="اختر"
              />

              <!-- <SelectInput v-model="formData.account" :items="customerItems" label="الحساب"
                                :rules="[required()]" density="comfortable" placeholder="حدد الحساب" /> -->
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl overflow-hidden border !border-gray-200 bg-primary-25"
        >
          <table class="w-full">
            <!-- Table Header -->
            <thead>
              <tr class="bg-primary-400">
                <th
                  class="text-white font-semibold text-base py-3 px-4 text-center border-l !border-gray-200"
                >
                  نوع الخصم
                </th>
                <th
                  class="text-white font-semibold text-base py-3 px-4 text-center"
                >
                  المبلغ
                </th>
              </tr>
            </thead>
            <!-- Table Body -->
            <tbody class="text-sm bg-primary-25">
              <!-- المجموع قبل الخصم -->
              <tr class="border-b !border-gray-200">
                <td
                  class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200"
                >
                  المجموع قبل الخصم
                </td>
                <td class="py-6 px-4 text-center text-gray-600">
                  {{ summaryTotals.subtotalBeforeDiscount }}
                </td>
              </tr>

              <!-- الخصم -->
              <tr class="border-b !border-gray-200">
                <td
                  class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200"
                >
                  الخصم
                </td>
                <td class="py-6 px-4 text-center text-gray-600">
                  {{ summaryTotals.totalDiscount }}
                </td>
              </tr>

              <!-- المجموع بعد الخصم -->
              <tr class="border-b !border-gray-200">
                <td
                  class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200"
                >
                  المجموع بعد الخصم
                </td>
                <td class="py-6 px-4 text-center text-gray-600">
                  {{ summaryTotals.subtotalAfterDiscount }}
                </td>
              </tr>

              <!-- الضريبة -->
              <tr class="border-b !border-gray-200">
                <td
                  class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200"
                >
                  الضريبة
                </td>
                <td class="py-6 px-4 text-center text-gray-600">15%</td>
              </tr>

              <!-- اجمالي الضريبة -->
              <tr class="border-b !border-gray-200">
                <td
                  class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200"
                >
                  اجمالي الضريبة
                </td>
                <td class="py-6 px-4 text-center text-gray-600">
                  {{ summaryTotals.totalTaxAmount }}
                </td>
              </tr>

              <!-- الإجمالي النهائي -->
              <tr class="">
                <td
                  class="py-6 px-4 text-center font-bold text-gray-900 border-l !border-gray-200"
                >
                  الإجمالي النهائي
                </td>
                <td class="py-6 px-4 font-bold text-center text-gray-900">
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
          <ButtonWithIcon
            variant="flat"
            color="primary"
            height="48"
            rounded="4"
            custom-class="font-semibold text-base px-6 md:!px-10"
            :prepend-icon="returnIcon"
            label="حفظ والعودة للرئيسية"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="handleSubmit({ redirectToList: true })"
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
            :disabled="isSubmitting"
            @click="handleSubmit({ redirectToList: false })"
          />
        </div>
      </div>
    </div>

    <Map
      v-model="showMapDialog"
      :latitude="mapDialogMode === 'source' ? formData.source_latitude : formData.target_latitude"
      :longitude="mapDialogMode === 'source' ? formData.source_longitude : formData.target_longitude"
      :address="mapDialogMode === 'source' ? formData.source_location : formData.target_location"
      @location-selected="handleLocationSelected"
    />

    <!-- Add Product Dialog -->
    <AddProductDialog
      v-model="showAddProductDialog"
      request-type="raw_materials"
      show-unit-price-and-discount
      :transport-types="transportTypeItems"
      :items-query-params="{ material_type: 1 }"
      :unit-items="unitItems"
      :edit-product="editingProduct"
      :existing-products="productTableItems"
      @saved="handleProductSaved"
      @product-updated="handleProductUpdated"
    />

    <!-- Edit Supply Details Dialog – تفاصيل التوريد لكل منتج (نفس لوجيك المبيعات) -->
    <EditSupplyDetailsDialog
      v-model="showAddSupplyDialog"
      :products="supplyDialogProducts"
      :transport-type-items="transportTypeItems"
      :single-product-item-id="editingSupplyProductId"
      show-trip-capacity
      :am-pm-interval-items="amPmIntervalItems"
      @saved="handleSupplyDetailsSaved"
    />
  </default-layout>
</template>

<style scoped></style>
