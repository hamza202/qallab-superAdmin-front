<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { useNotification } from '@/composables/useNotification';
import { useForm } from '@/composables/useForm';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import AddProductDialog from '@/components/price-offers/AddProductDialog.vue';
import Map from '@/components/common/Map.vue';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon } from '@/components/icons/globalIcons';
import { listIcon, mapMarkerIcon, packageIcon, downloadIcon, messagePlusIcon } from '@/components/icons/priceOffersIcons';

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

const api = useApi();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { success, error, warning, apiError } = useNotification();
const { formRef, isFormValid, validate } = useForm();

const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const pickupId = computed(() => route.params.pickupId as string)
const isLoading = ref(false);
const isSubmitting = ref(false);

const tripCode = ref("");

const formData = ref({
  so_pickup_id: null as number | null,
  supplier_logistic_id: null as number | null,
  planned_arrival_loading: "",
  planned_arrival_downloading: "",
  total_quantity_ton: null as number | null,
  total_quantity_m3: null as number | null,
  tracking_no_point: null as number | null,
  bill_of_lading: null as number | null,
  am_pm_interval: "" as string,
  loading_responsible_party: "",
  downloading_responsible_party: "",
  trip_value: null as number | null,
  target_location: "",
  target_latitude: null as number | null,
  target_longitude: null as number | null,
  source_location: "",
  source_latitude: null as number | null,
  source_longitude: null as number | null,
  notes: "",
});

const statusItems = ref<any[]>([]);
const unitItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);
const supplierItems = ref<any[]>([]);
const productTableItems = ref<ProductTableItem[]>([]);
const showAddProductDialog = ref(false);
const editingProduct = ref<ProductTableItem | null>(null);
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
    }
  } catch (err: any) {
    console.error('Error fetching SO pickup data:', err);
    error(err?.response?.data?.message || 'فشل تحميل بيانات طلب الاستلام');
  } finally {
    isLoading.value = false;
  }
};

const getTransportTypeName = (typeValue: string | number): string => {
  const found = transportTypeItems.value.find(t => t.value === typeValue);
  return found ? found.title : '';
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
  console.log('ttt');

  isLoading.value = true;
  try {
    const raw = await api.get<any>(`/sales/trips/${routeId.value}`);
    const data = raw?.data != null ? raw.data : raw;

    if (!data) return;
    tripCode.value = data.code || "";
    formData.value = {
      so_pickup_id: data.so_pickup_id || null,
      supplier_logistic_id: data.supplier_logistic_id || null,
      planned_arrival_loading: normalizePoDateTime(String(data.planned_arrival_loading)) || "",
      planned_arrival_downloading: normalizePoDateTime(String(data.planned_arrival_downloading)) || "",
      total_quantity_ton: data.total_quantity_ton || null,
      total_quantity_m3: data.total_quantity_m3 || null,
      tracking_no_point: data.tracking_no_point || null,
      bill_of_lading: data.bill_of_lading || null,
      am_pm_interval: data.am_pm_interval || "",
      loading_responsible_party: data.loading_responsible_party || "",
      downloading_responsible_party: data.downloading_responsible_party || "",
      trip_value: data.trip_value || null,
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
      productTableItems.value = data.items.map((item: any) => ({
        id: item.id,
        item_id: item.item_id,
        item_name: item.item_name || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || '',
        quantity: item.quantity,
        transport_type: item.transport_type,
        transport_no: item.transport_no,
        transport_type_name: getTransportTypeName(item.transport_type),
        notes: item.notes || '',
        isAdded: true
      }));
    }
  } catch (err: any) {
    console.error('Error fetching trip data:', err);
    error(err?.response?.data?.message || 'فشل تحميل بيانات الرحلة');
  } finally {
    isLoading.value = false;
  }
};

type SubmitOption = 'trips_list' | 'create_new' | 'pickup_list';

const handleSubmit = async (option: SubmitOption) => {
  if (!(await validate())) return;

  if (productTableItems.value.length === 0) {
    warning('يجب إضافة منتج واحد على الأقل');
    return;
  }

  // Clear previous errors
  formErrors.value = {};

  // Validate required fields
  if (!formData.value.supplier_logistic_id) {
    formErrors.value['supplier_logistic_id'] = ['الحقل supplier logistic id مطلوب.'];
  }
  if (!formData.value.target_location) {
    formErrors.value['target_location'] = ['الحقل موقع التسليم مطلوب.'];
  }
  if (!formData.value.target_latitude) {
    formErrors.value['target_latitude'] = ['الحقل خط عرض موقع التسليم مطلوب.'];
  }
  if (!formData.value.target_longitude) {
    formErrors.value['target_longitude'] = ['الحقل خط طول موقع التسليم مطلوب.'];
  }
  if (!formData.value.source_location) {
    formErrors.value['source_location'] = ['الحقل موقع الانطلاق مطلوب.'];
  }
  if (!formData.value.source_latitude) {
    formErrors.value['source_latitude'] = ['الحقل خط عرض موقع الانطلاق مطلوب.'];
  }
  if (!formData.value.source_longitude) {
    formErrors.value['source_longitude'] = ['الحقل خط طول موقع الانطلاق مطلوب.'];
  }

  if (Object.keys(formErrors.value).length > 0) {
    error('يرجى ملء جميع الحقول المطلوبة');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
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
    };

    if (isEditMode.value) {
      await api.put(`/sales/trips/${routeId.value}`, payload);
      success('تم تحديث الرحلة بنجاح');
    } else {
      await api.put(`/sales/trips/${routeId.value}`, payload);
      success('تم إنشاء الرحلة بنجاح');
    }

    if (option === 'trips_list') {
      router.push({ name: 'SalesTripslist' });
    } else if (option === 'pickup_list') {
      router.push({ name: 'SalesSoPickupsList' });
    } else {
      // Reset form for new entry
      formData.value = {
        so_pickup_id: null,
        supplier_logistic_id: null,
        planned_arrival_loading: "",
        planned_arrival_downloading: "",
        total_quantity_ton: null,
        total_quantity_m3: null,
        tracking_no_point: null,
        bill_of_lading: null,
        am_pm_interval: "",
        loading_responsible_party: "",
        downloading_responsible_party: "",
        trip_value: null,
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

const headers = [
  { title: 'اسم المنتج', key: 'name' },
  { title: 'الكمية', key: 'quantity' },
  { title: 'الوحدة', key: 'unit' },
  { title: 'نوع الناقلة', key: 'transport_type' },
  { title: 'عدد الناقلات', key: 'transport_no' },
  { title: 'ملاحظات', key: 'notes' },
];

const handleProductSaved = (products: ProductTableItem[]) => {
  const newItems: ProductTableItem[] = products.map(p => {
    const existing = productTableItems.value.find(existing => existing.item_id === p.item_id);
    return {
      ...p,
      notes: existing?.notes || p.notes || ''
    };
  });
  productTableItems.value = newItems;
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

const handleProductUpdated = (updatedProduct: ProductTableItem) => {
  const index = productTableItems.value.findIndex(p => p.item_id === updatedProduct.item_id);
  if (index !== -1) {
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

onMounted(async () => {
  fetchUnits();
  fetchConstants();
  fetchSuppliers();
  if (routeId.value) {
    await fetchFormData();
  } else if (pickupId.value) {
    // If pickupId exists, fetch SO pickup data to populate items
    await fetchSoPickupData();
  }
});
</script>

<template>
  <default-layout>
    <div class="trips-form-page -mx-6 bg-qallab-dashboard-bg space-y-4"
      :class="{ 'opacity-60 pointer-events-none': isLoading }">
      <!-- Page Header -->
      <TopHeader :icon="fileCheckIcon" title-key="pages.SalesTrips.create"
        description-key="pages.SalesTrips.createDescription" :show-action="false" code-label="كود الرحلة"
        :code="tripCode" :code-icon="fileIcon" />

      <!-- Basic Information -->
      <div class="bg-white rounded-3xl border !border-gray-100">
        <div class="flex items-center gap-2 text-primary-900 px-6 pt-6 text-lg font-bold">
          <h2>معلومات الرحلة</h2>
          <span v-if="tripCode" class="dir-ltr">#{{ tripCode }}</span>
        </div>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            <div>
              <selectInput :items="supplierItems" v-model="formData.supplier_logistic_id" label="شركة النقل"
                density="comfortable" placeholder="اختر" :hide-details="false" :rules="[required()]"
                :error-messages="formErrors['supplier_logistic_id']"
                @update:model-value="delete formErrors['supplier_logistic_id']" />
            </div>
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block">موقع التحميل</label>
              <div
                @click="openMapDialog('source'); delete formErrors['source_location']; delete formErrors['source_latitude']; delete formErrors['source_longitude']"
                class="flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                :class="formErrors['source_location'] || formErrors['source_latitude'] || formErrors['source_longitude'] ? '!border-red-500' : '!border-blue-400'">
                <span class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                  {{ formData.source_location || 'حدد الموقع' }}
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
              <DateTimePickerInput v-model="formData.planned_arrival_downloading" label="تاريخ / وقت التحميل"
                density="comfortable" placeholder="2024-03-01 / 02:30 PM" />
            </div>
            <div>
              <TextInput v-model="formData.downloading_responsible_party" label="مسؤول التحميل" density="comfortable"
                placeholder="أدخل اسم مسؤول التحميل" />
            </div>
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block">موقع التنزيل</label>
              <div
                @click="openMapDialog('target'); delete formErrors['target_location']; delete formErrors['target_latitude']; delete formErrors['target_longitude']"
                class="flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                :class="formErrors['target_location'] || formErrors['target_latitude'] || formErrors['target_longitude'] ? '!border-red-500' : '!border-blue-400'">
                <span class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                  {{ formData.target_location || 'حدد الموقع' }}
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
              <DateTimePickerInput v-model="formData.planned_arrival_loading" label="تاريخ / وقت التنزيل"
                density="comfortable" placeholder="2024-03-01 / 02:30 PM" />
            </div>
            <div>
              <TextInput v-model="formData.loading_responsible_party" label="مسؤول التنزيل" density="comfortable"
                placeholder="أدخل اسم مسؤول التنزيل" />
            </div>
            <div>
              <PriceInput v-model="formData.tracking_no_point" label="عدد مرات إرسال الإحداثيات" density="comfortable"
                placeholder="أدخل عدد مرات إرسال الإحداثيات" />
            </div>
            <div>
              <PriceInput v-model="formData.bill_of_lading" label="رقم بوليصة الشحن" density="comfortable"
                placeholder="أدخل رقم بوليصة الشحن" />
            </div>
            <div>
              <PriceInput v-model="formData.total_quantity_ton" label="الكمية الكلية / طن" density="comfortable"
                placeholder="أدخل الكمية بالطن" />
            </div>
            <div>
              <PriceInput v-model="formData.total_quantity_m3" label="الكمية الكلية / م^3" density="comfortable"
                placeholder="أدخل الكمية بالمتر المكعب" />
            </div>
            <div>
              <PriceInput v-model="formData.trip_value" show-rial-icon label="مبلغ الرحلة" density="comfortable"
                placeholder="أدخل مبلغ الرحلة" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">توقيت الرحلة</label>
              <v-radio-group v-model="formData.am_pm_interval" inline hide-details>
                <v-radio :value="item.value" color="primary" v-for="item in amPmIntervalItems" :key="item.value">
                  <template #label>
                    <span
                      :class="formData.am_pm_interval === item.value ? 'text-primary font-semibold' : 'text-gray-600'">
                      {{ item.title }}
                    </span>
                  </template>
                </v-radio>
                <!-- <v-radio :value="false" color="primary">
                  <template #label>
                    <span :class="!formData.trip_time ? 'text-primary font-semibold' : 'text-gray-600'">
                      مساءً
                    </span>
                  </template>
                </v-radio> -->
              </v-radio-group>
            </div>

            <div class="md:col-span-2">
              <TextareaInput v-model="formData.notes" label="الملاحظات" density="comfortable"
                placeholder="ادخل الملاحظات هنا" />
            </div>
          </div>
        </v-form>

        <!-- Products Table -->
        <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3">
          <div class="flex items-center text-primary-900 gap-2">
            <span v-html="packageIcon"></span>
            <h2 class="text-xl font-bold">المنتجات</h2>
          </div>
          <ButtonWithIcon color="primary-100" variant="flat" :prepend-icon="downloadIcon"
            class="!text-primary-900 font-bold">
            استيراد من ملف إكسل
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
                    <span class="text-gray-900">{{ item.notes || 'أضف ملاحظة' }}</span>
                  </div>
                </template>

                <!-- Popup content -->
                <v-card class="pa-4 shadow-[rgba(149,157,165,0.2)_0px_8px_24px] overflow-hidden px-3 py-3" color="white"
                  rounded="lg" width="300">
                  <div class="!flex flex-nowrap items-center gap-3">
                    <TextInput
                      v-model="productTableItems[productTableItems.findIndex(p => p.item_id === item.item_id)].notes"
                      placeholder="أضف ملاحظة" variant="outlined" density="comfortable" hide-details autofocus
                      class="flex-1" />
                    <ButtonWithIcon :icon="messagePlusIcon" color="primary" icon-only size="x-small" />

                  </div>
                </v-card>
              </v-menu>
            </template>
          </DataTable>
        </div>

        <div class="flex justify-center my-6">
          <ButtonWithIcon color="primary-100" variant="flat" class="!text-primary-900 font-bold w-75"
            @click="addProduct">
            + اضافة منتج جديد
          </ButtonWithIcon>
        </div>

      </div>

      <!-- Action Buttons -->
      <div class="mt-3 flex items-center justify-center gap-3 flex-wrap">
        <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
          custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
          label="حفظ والعودة الى قائمة الحجوزات" :loading="isSubmitting" :disabled="isSubmitting"
          @click="handleSubmit('pickup_list')" />
        <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
          custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="returnIcon"
          label="حفظ والعودة لجدول الرحلات" :loading="isSubmitting" :disabled="isSubmitting"
          @click="handleSubmit('trips_list')" />
        <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
          custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
          label="حفظ وانشاء جديد" :loading="isSubmitting" :disabled="isSubmitting"
          @click="handleSubmit('create_new')" />
      </div>
    </div>

    <!-- Add Product Dialog -->
    <AddProductDialog v-model="showAddProductDialog" request-type="trips" :transport-types="transportTypeItems"
      :unit-items="unitItems" :edit-product="editingProduct" :existing-products="productTableItems"
      @saved="handleProductSaved" @product-updated="handleProductUpdated" />

    <Map v-model="showMapDialog"
      :latitude="String(currentMapType === 'target' ? (formData.target_latitude || '') : (formData.source_latitude || ''))"
      :longitude="String(currentMapType === 'target' ? (formData.target_longitude || '') : (formData.source_longitude || ''))"
      :address="String(currentMapType === 'target' ? (formData.target_location || '') : (formData.source_location || ''))"
      @location-selected="handleLocationSelected" />

  </default-layout>
</template>

<style scoped></style>
