<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import TopHeader from "@/components/price-offers/TopHeader.vue";
import DatePickerInput from "@/components/common/forms/DatePickerInput.vue";
import TextareaInput from "@/components/common/forms/TextareaInput.vue";
import { useApi } from "@/composables/useApi";
import { fileCheckIcon, filePlusIcon, listIcon, messagePlusIcon } from "@/components/icons/priceOffersIcons";
import { returnIcon, saveIcon } from "@/components/icons/globalIcons";
import AddPickupProductDialog from "@/components/sales/AddPickupProductDialog.vue";
import type { PickupProductToAdd } from "@/components/sales/AddPickupProductDialog.vue";
import { useForm } from "@/composables/useForm";
import { useNotification } from "@/composables/useNotification";

const api = useApi();
const route = useRoute();
const router = useRouter();
const { formRef, isFormValid, validate } = useForm();
const { success, error, warning, apiError } = useNotification();

// Edit mode: route has id (pickup uuid). Create mode: route has orderId (sale_order_id).
const routeId = computed(() => route.params.id as string | undefined);
const routeOrderId = computed(() => route.params.orderId as string | undefined);
const isEditMode = computed(() => !!routeId.value);

// In create mode use route orderId; in edit mode use sale_order_id from loaded pickup
const saleOrderIdRef = ref<string>("");
const orderId = computed(() =>
  isEditMode.value ? saleOrderIdRef.value : (routeOrderId.value || "")
);
const pickupItemsEndpoint = computed(() =>
  orderId.value
    ? `/sales/orders/list?with_items=true&sale_order_id=${orderId.value}`
    : ""
);

const isLoading = ref(false);
const isSubmitting = ref(false);

const offerCode = ref("");
const unitItems = ref<{ title: string; value: number }[]>([]);

const formData = ref({
  so_pickup_date: "" as string,
  am_pm_interval: null as string | null,
  po_reference: "",
  loading_responsible_party: "",
  downloading_responsible_party: "",
  notes: "",
});

/** Pickup product row for AddPickupProductDialog */
interface PickupProductItem {
  id?: number;
  item_id: number;
  item_name: string;
  unit_id: number | null;
  unit_name: string;
  quantity: number | null;
  notes: string;
}

const productTableItems = ref<PickupProductItem[]>([]);
const showAddProductDialog = ref(false);
const editingProduct = ref<PickupProductItem | null>(null);

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


/** Show response shape for edit mode */
interface ShowPickupItem {
  id?: number;
  item_id: number;
  item_name?: string;
  unit_id?: number | null;
  unit_name?: string;
  quantity?: number | null;
  notes?: string;
}
interface ShowPickupResponse {
  data?: {
    uuid?: string;
    code?: string;
    sale_order_id?: string | number;
    so_pickup_date?: string;
    am_pm_interval?: string | null;
    po_reference?: string;
    loading_responsible_party?: string;
    downloading_responsible_party?: string;
    notes?: string;
    items?: ShowPickupItem[];
  };
}

const fetchPickupForEdit = async () => {
  const id = routeId.value;
  if (!id) return;
  isLoading.value = true;
  try {
    const res = await api.get<ShowPickupResponse>(`/sales/so-pickups/${id}`);
    const data = (res as any).data ?? res;
    if (!data || typeof data !== "object") return;

    if (data.sale_order_id != null) {
      saleOrderIdRef.value = String(data.sale_order_id);
    }
    if (data.code != null) offerCode.value = String(data.code);
    const raw = data as any;
    formData.value = {
      so_pickup_date: raw.so_pickup_date ?? raw.date ?? "",
      am_pm_interval: raw.am_pm_interval ?? raw.time ?? null,
      po_reference: raw.po_reference ?? "",
      loading_responsible_party: raw.loading_responsible_party ?? raw.loading_responsible ?? "",
      downloading_responsible_party: raw.downloading_responsible_party ?? raw.unloading_responsible ?? "",
      notes: raw.notes ?? "",
    };
    if (Array.isArray(data.items)) {
      productTableItems.value = data.items.map((it: ShowPickupItem) => {
        const unitId = it.unit_id ?? null;
        const resolvedUnitName =
          (it.unit_name && it.unit_name.trim()) ||
          (unitId != null
            ? (unitItems.value.find((u) => u.value === unitId)?.title ?? "")
            : "");
        return {
          id: it.id,
          item_id: it.item_id,
          item_name: it.item_name ?? "",
          unit_id: unitId,
          unit_name: resolvedUnitName,
          quantity: it.quantity ?? null,
          notes: it.notes ?? "",
        };
      });
    }
  } catch (e: any) {
    console.error("Error fetching pickup for edit:", e);
    error(e?.response?.data?.message ?? "فشل تحميل بيانات حجز التسليم");
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchUnits();
  if (isEditMode.value) {
    await fetchPickupForEdit();
  } else if (routeOrderId.value) {
    saleOrderIdRef.value = routeOrderId.value;
  }
});

const timeOptions = [
  { title: "صباحاً", value: "am" },
  { title: "مساءً", value: "pm" },
  { title: "كلاهما", value: "both" },
];

const headers = [
  { title: "اسم المنتج", key: "name" },
  { title: "الكمية", key: "quantity" },
  { title: "الوحدة", key: "unit" },
  { title: "ملاحظات", key: "notes" },
];

const tableItems = computed(() =>
  productTableItems.value.map((item) => ({
    id: item.item_id,
    item_id: item.item_id,
    name: item.item_name,
    quantity: item.quantity,
    unit: item.unit_name,
    notes: item.notes,
  }))
);

const handleAddProduct = () => {
  editingProduct.value = null;
  showAddProductDialog.value = true;
};

const handleProductSaved = (products: PickupProductToAdd[]) => {
  const newItems: PickupProductItem[] = products.map((p) => {
    const existing = productTableItems.value.find((x) => x.item_id === p.item_id);
    return {
      ...(existing?.id && { id: existing.id }),
      item_id: p.item_id,
      item_name: p.item_name || "",
      unit_id: p.unit_id ?? null,
      unit_name: p.unit_name || "",
      quantity: p.quantity ?? null,
      notes: existing?.notes || "",
    };
  });
  productTableItems.value = newItems;
};

const handleEditProduct = (item: { item_id?: number; id?: string | number }) => {
  const id = item.item_id ?? (typeof item.id === "number" ? item.id : undefined);
  if (id == null) return;
  const productToEdit = productTableItems.value.find((p) => p.item_id === id);
  if (productToEdit) {
    editingProduct.value = { ...productToEdit };
    showAddProductDialog.value = true;
  }
};

const handleProductUpdated = (updatedProduct: PickupProductToAdd) => {
  const index = productTableItems.value.findIndex((p) => p.item_id === updatedProduct.item_id);
  if (index !== -1) {
    const existingNotes = productTableItems.value[index].notes;
    const existingId = productTableItems.value[index].id;
    productTableItems.value[index] = {
      ...(existingId && { id: existingId }),
      item_id: updatedProduct.item_id,
      item_name: updatedProduct.item_name || "",
      unit_id: updatedProduct.unit_id ?? null,
      unit_name: updatedProduct.unit_name || "",
      quantity: updatedProduct.quantity ?? null,
      notes: existingNotes || "",
    };
  }
  editingProduct.value = null;
};

const handleDeleteProduct = (item: { item_id?: number; id?: string | number }) => {
  const rawId = item.item_id ?? item.id;
  if (rawId == null) return;
  const id = typeof rawId === "number" ? rawId : Number(rawId);
  if (Number.isNaN(id)) return;
  const index = productTableItems.value.findIndex((p) => p.item_id === id);
  if (index !== -1) productTableItems.value.splice(index, 1);
};

const downloadIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.5 12.5V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V12.5M14.1667 8.33333L10 12.5M10 12.5L5.83333 8.33333M10 12.5V2.5" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const handleImportExcel = () => {
  // Placeholder: wire to file input when API is available
  warning("استيراد من إكسل: قريباً");
};

const buildPayload = () => ({
  ...(orderId.value && { sale_order_id: Number(orderId.value) || orderId.value }),
  po_reference: formData.value.po_reference,
  loading_responsible_party: formData.value.loading_responsible_party,
  downloading_responsible_party: formData.value.downloading_responsible_party,
  am_pm_interval: formData.value.am_pm_interval,
  so_pickup_date: formData.value.so_pickup_date,
  notes: formData.value.notes,
  items: productTableItems.value.map((item) => ({
    ...(item.id && { id: item.id }),
    item_id: item.item_id,
    unit_id: item.unit_id,
    quantity: item.quantity,
  })),
});

type SubmitOption = "appointments_list" | "orders_list" | "create_new";

const handleSubmit = async (option: SubmitOption) => {
  if (!(await validate())) return;
  if (!formData.value.am_pm_interval) {
    warning("يجب اختيار التوقيت (صباحاً / مساءً / كلاهما)");
    return;
  }
  if (productTableItems.value.length === 0) {
    warning("يجب إضافة منتج واحد على الأقل");
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = buildPayload();
    if (isEditMode.value && routeId.value) {
      await api.put(`/sales/so-pickups/${routeId.value}`, payload);
      success("تم تحديث حجز الموعد بنجاح");
    } else {
      await api.post(`/sales/so-pickups`, payload);
      success("تم حفظ حجز الموعد بنجاح");
    }

    if (option === "appointments_list") {
      router.push({ name: "SalesSoPickupsList" });
    } else if (option === "orders_list") {
      router.push({ name: "SalesOrdersMaterialProductList" });
    } else if (isEditMode.value) {
      router.push({ name: "SalesSoPickupsList" });
    } else {
      formData.value.so_pickup_date = "";
      formData.value.am_pm_interval = null;
      formData.value.po_reference = "";
      formData.value.loading_responsible_party = "";
      formData.value.downloading_responsible_party = "";
      formData.value.notes = "";
      productTableItems.value = [];
    }
  } catch (e: any) {
    console.error("Error submitting pickup:", e);
    apiError(e);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <default-layout>
    <div class="pickup-form-page -mx-6 bg-qallab-dashboard-bg space-y-4" :class="{ 'opacity-60 pointer-events-none': isLoading }">
      <!-- Page Header -->
      <TopHeader
        :icon="filePlusIcon"
        title-key="pages.SalesOrdersMaterialProduct.pickupTitle"
        description-key="pages.SalesOrdersMaterialProduct.pickupDescr"
        :show-action="false"
        code-label="كود العرض"
        :code="offerCode"
      />

      <!-- Basic Information -->
      <div class="p-6 bg-white rounded-3xl border !border-gray-100">
        <div class="flex items-center mb-6 gap-2 text-primary-600">
          <span v-html="fileCheckIcon"></span>
          <h2 class="text-base font-bold">البيانات الأساسية</h2>
        </div>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <DatePickerInput
                v-model="formData.so_pickup_date"
                type="date"
                density="comfortable"
                placeholder="اختر التاريخ"
                label="التاريخ"
              />
            </div>
            <!-- مرجع أمر الشراء - مخفي حالياً -->
            <!-- <div>
              <TextInput
                v-model="formData.po_reference"
                label="مرجع أمر الشراء"
                density="comfortable"
                placeholder="أدخل مرجع أمر الشراء"
              />
            </div> -->
            <div>
              <TextInput
                v-model="formData.loading_responsible_party"
                label="مسؤول التحميل"
                density="comfortable"
                placeholder="أدخل اسم مسؤول التحميل"
              />
            </div>
            <div>
              <TextInput
                v-model="formData.downloading_responsible_party"
                label="مسؤول التفريغ"
                density="comfortable"
                placeholder="أدخل اسم مسؤول التفريغ"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">
                التوقيت <span class="text-red-500">*</span>
              </label>
              <v-radio-group
                v-model="formData.am_pm_interval"
                density="comfortable"
                hide-details
                class="mt-0 pt-0 flex flex-row gap-8"
                inline
              >
                <v-radio
                  v-for="opt in timeOptions"
                  :key="opt.value"
                  :label="opt.title"
                  :value="opt.value"
                />
              </v-radio-group>
            </div>
            <div class="md:col-span-2">
              <TextareaInput
                v-model="formData.notes"
                label="الملاحظات"
                density="comfortable"
                placeholder="ادخل الملاحظات هنا"
              />
            </div>
          </div>
        </v-form>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-3xl border !border-gray-100">
        <div class="px-6 py-6">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <span v-html="listIcon"></span>
              <h2 class="text-base font-bold text-primary-600">جدول المنتجات</h2>
            </div>
            <ButtonWithIcon
              color="primary-100"
              variant="flat"
              :prepend-icon="downloadIcon"
              class="!text-primary-900 font-bold"
              @click="handleImportExcel"
            >
              استيراد من ملف إكسل
            </ButtonWithIcon>
            
          </div>
        </div>

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
              attach="pickup-form-page"
              location="bottom"
              offset="8"
              :close-on-content-click="false"
              transition="slide-y-transition"
            >
              <template #activator="{ props: menuProps }">
                <div class="flex items-center gap-2 cursor-pointer" v-bind="menuProps">
                  <span v-html="messagePlusIcon" class="shrink-0"></span>
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
                    :model-value="productTableItems.find((p) => p.item_id === item.item_id)?.notes ?? null"
                    @update:model-value="(v: string | number | null) => { const r = productTableItems.find((p) => p.item_id === item.item_id); if (r) r.notes = v != null ? String(v) : ''; }"
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

        <div class="flex justify-center my-6">
          <ButtonWithIcon
            color="primary-100"
            variant="flat"
            class="!text-primary-900 font-bold w-75"
            @click="handleAddProduct"
          >
            + اضافة منتج جديد
          </ButtonWithIcon>
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
            label="حفظ والعودة الى قائمة الحجوزات"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="handleSubmit('appointments_list')"
          />
          <ButtonWithIcon
            variant="flat"
            color="primary-50"
            height="48"
            rounded="4"
            custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10"
            :prepend-icon="returnIcon"
            label="حفظ والعودة لجدول الطلبيات"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="handleSubmit('orders_list')"
          />
          <ButtonWithIcon
            variant="flat"
            color="primary-50"
            height="48"
            rounded="4"
            custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10"
            :prepend-icon="saveIcon"
            label="حفظ وانشاء جديد"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="handleSubmit('create_new')"
          />
        </div>
      </div>
    </div>

    <AddPickupProductDialog
      v-model="showAddProductDialog"
      :items-endpoint="pickupItemsEndpoint"
      :unit-items="unitItems"
      :edit-product="editingProduct"
      :existing-products="productTableItems"
      @saved="handleProductSaved"
      @product-updated="handleProductUpdated"
    />
  </default-layout>
</template>

<style scoped></style>
