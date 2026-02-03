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
  transport_count: number | null;
  transport_type_name: string;
  notes: string;
  id?: number; // For edit mode
  isAdded?: boolean; // For dialog state
}


const api = useApi();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { success, error, warning } = useNotification();
const { formRef, isFormValid, validate } = useForm();

const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const pickupId = computed(() => route.params.pickupId as string)
const isLoading = ref(false);
const isSubmitting = ref(false);

const tripCode = ref("");

const formData = ref({
  supplier_id: null as number | null,
  transport_company: null,
  loading_datetime: "",
  loading_location: "",
  loading_latitude: "",
  loading_longitude: "",
  company_name: "",
  unloading_location: "",
  unloading_datetime: "",
  unloading_responsible: "",
  update_count: "",
  waybill_number: "",
  density_ton: "",
  density_m3: "",
  trip_cost: "",
  trip_cost_currency: "ريال",
  trip_status: "صائح",
  trip_time: true,
  notes: "",
});

const statusItems = ref<any[]>([]);
const unitItems = ref<any[]>([]);
const transportTypeItems = ref<any[]>([]);

const productTableItems = ref<ProductTableItem[]>([]);
const showAddProductDialog = ref(false);
const editingProduct = ref<ProductTableItem | null>(null);
const showMapDialog = ref(false);

const fetchConstants = async () => {
  try {
    const res = await api.get<any>('/sales/trips/constants');
    const data = res.data;
    if (data) {
      statusItems.value = data.statuses?.map((i: any) => ({ title: i.label, value: i.key })) || [];
      transportTypeItems.value = data.transport_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
    }
  } catch (e) {
    console.error('Error fetching constants:', e);
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

const getTransportTypeName = (typeValue: string | number): string => {
  const found = transportTypeItems.value.find(t => t.value === typeValue);
  return found ? found.title : '';
};

const fetchFormData = async () => {
  if (!isEditMode.value || !routeId.value) return;

  isLoading.value = true;
  try {
    const raw = await api.get<any>(`/sales/trips/${routeId.value}`);
    const data = raw?.data != null ? raw.data : raw;

    if (!data) return;

    tripCode.value = data.code || "";
    formData.value = {
      supplier_id: data.supplier_id || null,
      transport_company: data.transport_company || null,
      loading_datetime: data.loading_datetime || "",
      loading_location: data.loading_location || "",
      loading_latitude: data.loading_latitude || "",
      loading_longitude: data.loading_longitude || "",
      company_name: data.company_name || "",
      unloading_location: data.unloading_location || "",
      unloading_datetime: data.unloading_datetime || "",
      unloading_responsible: data.unloading_responsible || "",
      update_count: data.update_count || "",
      waybill_number: data.waybill_number || "",
      density_ton: data.density_ton || "",
      density_m3: data.density_m3 || "",
      trip_cost: data.trip_cost || "",
      trip_cost_currency: data.trip_cost_currency || "ريال",
      trip_status: data.trip_status || "صائح",
      trip_time: data.trip_time || true,
      notes: data.notes || "",
    };

    // Populate products (items)
    if (data.items && Array.isArray(data.items)) {
      productTableItems.value = data.items.map((item: any) => ({
        item_id: item.item_id,
        item_name: item.item_name || '',
        unit_id: item.unit_id,
        unit_name: item.unit_name || '',
        quantity: item.quantity,
        transport_type: item.transport_type,
        transport_count: item.transport_count,
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

type SubmitOption = 'trips_list' | 'create_new';

const handleSubmit = async (option: SubmitOption) => {
  if (!(await validate())) return;

  if (productTableItems.value.length === 0) {
    warning('يجب إضافة منتج واحد على الأقل');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      ...formData.value,
      items: productTableItems.value.map(item => ({
        item_id: item.item_id,
        unit_id: item.unit_id,
        quantity: item.quantity,
        transport_count: item.transport_count,
        transport_type: item.transport_type,
        notes: item.notes
      })),
    };

    if (isEditMode.value) {
      await api.put(`/sales/trips/${routeId.value}`, payload);
      success('تم تحديث الرحلة بنجاح');
    } else {
      await api.post('/sales/trips', payload);
      success('تم إنشاء الرحلة بنجاح');
    }

    if (option === 'trips_list') {
      router.push({ name: 'SalesTripslist' });
    } else {
      // Reset form for new entry
      formData.value = {
        supplier_id: null,
        transport_company: null,
        loading_datetime: "",
        loading_latitude: "",
        loading_longitude: "",
        loading_location: "",
        company_name: "",
        unloading_location: "",
        unloading_datetime: "",
        unloading_responsible: "",
        update_count: "",
        waybill_number: "",
        density_ton: "",
        density_m3: "",
        trip_cost: "",
        trip_cost_currency: "ریال",
        trip_status: "صائح",
        trip_time: true,
        notes: "",
      };
      productTableItems.value = [];
      tripCode.value = "";
    }
  } catch (err: any) {
    console.error('Error submitting form:', err);
    error(err?.response?.data?.message || 'فشل حفظ الرحلة');
  } finally {
    isSubmitting.value = false;
  }
};

const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
  formData.value.loading_latitude = location.latitude;
  formData.value.loading_longitude = location.longitude;
  formData.value.loading_location = location.address;
};

const openMapDialog = () => {
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
  { title: 'عدد الناقلات', key: 'transport_count' },
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
  unit: item.unit_name,
  transport_type: item.transport_type_name,
  transport_count: item.transport_count,
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

  if (routeId.value) {
    await fetchFormData();
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
        <div class="flex items-center gap-2 text-primary-900 px-6 pt-6">
          <h2 class="text-lg font-bold">معلومات الرحلة</h2>
          <span v-if="tripCode">{{ tripCode }}</span>
        </div>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            <div>
              <selectInput :items="[]" v-model="formData.transport_company" label="شركة النقل" density="comfortable"
                placeholder="اختر" />
            </div>
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block">موقع التحميل</label>
              <div @click="openMapDialog"
                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <span class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                  {{ formData.loading_location || 'حدد الموقع' }}
                </span>
                <div class="flex items-center gap-2">
                  <span v-html="mapMarkerIcon"></span>
                </div>
              </div>
            </div>
            <div>
              <DateTimePickerInput v-model="formData.loading_datetime" label="تاريخ / وقت التحميل" density="comfortable"
                placeholder="2024-03-01 / 02:30 PM" />
            </div>
            <div>
              <TextInput v-model="formData.company_name" label="مسؤول التحميل" density="comfortable"
                placeholder="أدخل اسم مسؤول التحميل" />
            </div>
            <div class="relative">
              <label class="text-sm font-medium text-gray-700 mb-2 block">موقع التنزيل</label>
              <div @click="openMapDialog"
                class="flex items-center justify-between px-4 py-2 min-h-[48px] border !border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <span class="text-base font-medium text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis ">
                  {{ formData.unloading_location || 'حدد الموقع' }}
                </span>
                <div class="flex items-center gap-2">
                  <span v-html="mapMarkerIcon"></span>
                </div>
              </div>
            </div>
            <div>
              <DateTimePickerInput v-model="formData.unloading_datetime" type="datetime" label="تاريخ / وقت التنزيل"
                density="comfortable" placeholder="2024-03-01 / 02:30 PM" />
            </div>
            <div>
              <TextInput v-model="formData.unloading_responsible" label="مسؤول التنزيل" density="comfortable"
                placeholder="أدخل اسم مسؤول التنزيل" />
            </div>
            <div>
              <TextInput v-model="formData.update_count" label="عدد مرات إرسال الإحداثيات" density="comfortable"
                type="number" placeholder="أدخل عدد مرات إرسال الإحداثيات" />
            </div>
            <div>
              <TextInput v-model="formData.waybill_number" label="رقم بوليصة الشحن" density="comfortable"
                placeholder="أدخل رقم بوليصة الشحن" />
            </div>
            <div>
              <TextInput v-model="formData.density_ton" label="الكمية الكلية / طن" density="comfortable" type="number"
                placeholder="أدخل الكمية بالطن" />
            </div>
            <div>
              <TextInput v-model="formData.density_m3" label="الكمية الكلية / م^3" density="comfortable"
                placeholder="أدخل الكمية بالمتر المكعب" />
            </div>
            <div>
              <PriceInput v-model="formData.trip_cost" show-rial-icon label="مبلغ الرحلة" density="comfortable"
                placeholder="أدخل مبلغ الرحلة" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">توقيت الرحلة</label>
              <v-radio-group v-model="formData.trip_time" inline hide-details>
                <v-radio :value="true" color="primary">
                  <template #label>
                    <span :class="formData.trip_time ? 'text-primary font-semibold' : 'text-gray-600'">
                      صباحاً
                    </span>
                  </template>
                </v-radio>
                <v-radio :value="false" color="primary">
                  <template #label>
                    <span :class="!formData.trip_time ? 'text-primary font-semibold' : 'text-gray-600'">
                      مساءً
                    </span>
                  </template>
                </v-radio>
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
        <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
          <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
            custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
            label="حفظ والعودة الى قائمة الحجوزات" :loading="isSubmitting" :disabled="isSubmitting"
            @click="handleSubmit('trips_list')" to="/sales/so-pickups/list" />
          <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
            custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="returnIcon"
            label="حفظ والعودة لجدول الرحلات" :loading="isSubmitting" :disabled="isSubmitting"
            @click="handleSubmit('create_new')" to="/sales/trips/list" />
          <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
            custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
            label="حفظ وانشاء جديد" :loading="isSubmitting" :disabled="isSubmitting"
            @click="handleSubmit('create_new')" />
        </div>
      </div>
    </div>

    <!-- Add Product Dialog -->
    <AddProductDialog v-model="showAddProductDialog" request-type="trips" :transport-types="transportTypeItems"
      :unit-items="unitItems" :supplier-id="formData.supplier_id" :edit-product="editingProduct"
      :existing-products="productTableItems" @saved="handleProductSaved" @product-updated="handleProductUpdated" />

    <Map v-model="showMapDialog" :latitude="formData.loading_latitude" :longitude="formData.loading_longitude"
      :address="formData.loading_location" @location-selected="handleLocationSelected" />

  </default-layout>
</template>

<style scoped></style>
