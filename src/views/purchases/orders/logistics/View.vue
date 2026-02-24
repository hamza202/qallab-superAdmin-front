<template>
  <default-layout>
    <div class="category-view-page -mx-6">
      <div>
        <!-- Breadcrumb -->
        <div class="flex flex-wrap items-center gap-3 mb-6 text-sm px-6">
          <router-link to="/" class="text-gray-500 hover:text-primary-600">
            <span v-html="homeIcon"></span>
          </router-link>
          <span class="text-lg text-gray-300">/</span>
          <router-link to="/purchases" class="text-gray-600 hover:text-primary-600">
            المشتريات
          </router-link>
          <span class="text-lg text-gray-300">/</span>
          <router-link to="/purchases/orders/logistics/list" class="text-gray-600 hover:text-primary-600">
            طلبية خدمة النقل
          </router-link>
          <span class="text-lg text-gray-300">/</span>
          <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ orderCode }}</span>
        </div>

        <!-- Page Header -->
        <div class="bg-white px-6 py-4 border-y border-gray-200">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
              <span v-html="archiveIcon" class="text-primary-600"></span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900 mb-1">{{ orderCode }}</h1>
              <p class="text-sm text-gray-600">تفاصيل الطلبية والمعلومات الخاصة بها</p>
            </div>
          </div>
        </div>

        <!-- البيانات الأساسية -->
        <div class="p-6 border-b !border-gray-200">
          <h2 class="text-lg font-bold text-primary-900 mb-6">البيانات الأساسية</h2>
          <div class="flex flex-wrap gap-4">
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المسؤول</label>
              <p class="text-base font-semibold text-gray-900">{{ orderData?.responsible_person || '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">هاتف المسؤول</label>
              <p class="text-base font-semibold text-gray-900 dir-ltr text-end">{{ orderData?.responsible_phone || '—'
                }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ الطلبية</label>
              <p class="text-base font-semibold text-gray-900">{{ orderData?.po_datetime || '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المشروع</label>
              <p class="text-base font-semibold text-gray-900">{{ orderData?.project_name || '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">طريقة الدفع</label>
              <p class="text-base font-semibold text-gray-900">{{ paymentMethodLabel }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">دفعة مقدمة</label>
              <p class="text-base font-semibold text-gray-900 flex gap-1 items-center">
                {{ orderData?.upfront_payment ?? 0 }}  <span v-html="rialIcon"></span>
              </p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع مصدر المواد</label>
              <p class="text-base font-semibold text-gray-900">{{ orderData?.source_location || '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع المشروع</label>
              <p class="text-base font-semibold text-gray-900">{{ orderData?.target_location || '—' }}</p>
            </div>
          </div>
        </div>

        <!-- تفاصيل النقل -->
        <div>
          <div class="bg-primary-50 px-6 py-4">
            <div class="flex items-center gap-2 text-primary-900 font-bold">
              <span v-html="truckIcon"></span>
              <h2 class="text-base">تفاصيل النقل</h2>
            </div>
          </div>
          <div v-for="(detail, index) in logisticsDetails" :key="index" class="p-4">
            <div class="flex flex-wrap gap-4">
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع المواد المنقولة</label>
                <p class="text-base font-semibold text-gray-900">{{ getCategoryName(detail.material_type) }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ بدء النقل</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.from_date || '—' }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ انتهاء النقل</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.to_date || '—' }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">مدة التنفيذ (يوم)</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.actual_execution_interval ?? '—' }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">أوقات النقل</label>
                <p class="text-base font-semibold text-gray-900">{{ getAmPmLabel(detail.am_pm_interval) }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع مركبة النقل</label>
                <p class="text-base font-semibold text-gray-900">{{ getTransportTypeName(detail.transport_type) }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد مركبات النقل</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.transport_no ?? '—' }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">عدد الرحلات</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.trip_no }} رحلة</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">مبلغ النقل</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.transport_amount ?? '—' }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التحميل</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.loading_responsible_party || '—' }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">مسؤول التفريغ</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.downloading_responsible_party || '—' }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع الاستلام</label>
                <p class="text-sm font-semibold text-gray-900">{{ detail.source_location || '—' }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered flex-1 px-6 py-4">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع التسليم</label>
                <p class="text-sm font-semibold text-gray-900">{{ detail.target_location || '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- المنتجات -->
        <div>
          <div class="bg-primary-50 px-6 py-4">
            <div class="flex items-center gap-2 text-primary-900 font-bold">
              <span v-html="packageIcon"></span>
              <h2 class="text-base">المنتجات</h2>
            </div>
          </div>
          <div class="mb-8">
            <DataTable :headers="itemHeaders" :items="itemsData" />
          </div>
        </div>

        <!-- تفاصيل الرحلات -->
        <div>
          <div class="bg-primary-50 px-6 py-4">
            <div class="flex items-center gap-2 text-primary-900 font-bold">
              <span v-html="busIcon"></span>
              <h2 class="text-base">تفاصيل الرحلات</h2>
            </div>
          </div>
          <div class="p-6">
            <DataTable :headers="tripHeaders" :items="tripDetails" />
          </div>
        </div>
      </div>
    </div>

    <v-overlay :model-value="isLoading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>
  </default-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { useNotification } from '@/composables/useNotification';
import { archiveIcon, homeIcon, busIcon, rialIcon} from '@/components/icons/globalIcons';
import { truckIcon, packageIcon } from '@/components/icons/priceOffersIcons';

const route = useRoute();
const api = useApi();
const { error } = useNotification();

const isLoading = ref(false);
const orderData = ref<any>(null);
const constantsData = ref<any>(null);
const categoriesItems = ref<any[]>([]);

const routeId = computed(() => route.params.id as string);

const fetchConstants = async () => {
  try {
    const res = await api.get<any>('/purchases/constants');
    constantsData.value = res.data;
  } catch (e: any) {
    console.error('Error fetching constants:', e);
  }
};

const fetchOrderData = async () => {
  if (!routeId.value) return;
  isLoading.value = true;
  try {
    const res = await api.get<any>(`/purchases/orders/logistics/${routeId.value}`);
    orderData.value = res.data;
  } catch (e: any) {
    console.error('Error fetching order data:', e);
    error(e?.response?.data?.message || 'فشل تحميل بيانات الطلبية');
  } finally {
    isLoading.value = false;
  }
};

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

const orderCode = computed(() => orderData.value?.code || '—');

const paymentMethodLabel = computed(() => {
  const method = orderData.value?.payment_method;
  if (method === 'cash') return 'نقدي';
  if (method === 'deferred') return 'آجل';
  return '—';
});

const logisticsDetails = computed(() => orderData.value?.po_logistics_details || []);

const getCategoryName = (categories: number[]) => {
  if (!categories || categories.length === 0) return '—';
  return categories.map(categoryId => {
    const item = categoriesItems.value.find((t: any) => t.value == categoryId);
    return item?.title || categoryId.toString();
  }).join(', ');
};

const getTransportTypeName = (types: number[]) => {
  if (!types || types.length === 0) return '—';
  const transportTypes = constantsData.value?.transport_types || [];
  return types.map((typeId: number) => {
    const t = transportTypes.find((x: any) => x.key == typeId);
    return t?.label || typeId.toString();
  }).join(', ');
};

const getAmPmLabel = (key: string | null | undefined) => {
  if (!key) return '—';
  const options = constantsData.value?.am_pm_interval || [];
  const item = options.find((x: any) => x.key === key);
  return item?.label ?? (key === 'am' ? 'صباحاً' : key === 'pm' ? 'مساءً' : key);
};

const itemsData = computed(() => {
  const items = orderData.value?.po_product_details || orderData.value?.items;
  if (!items || !Array.isArray(items)) return [];
  return items.map((item: any) => ({
    id: item.id,
    item_name: item.item_name || '—',
    unit_name: item.unit_name || '—',
    quantity: item.quantity ?? 0,
    from_date: item.from_date ?? '—',
    trip_no: item.trip_no ?? 0,
    transport_type: item.transport_type_label ?? '—',
  }));
});

const tripDetails = computed(() => {
  const trips = orderData.value?.po_trip_details;
  if (!trips || !Array.isArray(trips)) return [];
  return trips.map((t: any) => ({
    id: t.id,
    item_name: t.item_name || '—',
    unit_name: t.unit_name || '—',
    quantity: t.quantity ?? 0,
    trip_date: t.trip_date || '—',
    trip_price: t.trip_price ?? '—',
    transport_type_names: getTransportTypeName(Array.isArray(t.transport_type) ? t.transport_type : (t.transport_type != null ? [t.transport_type] : [])),
  }));
});

const itemHeaders = [
  { title: 'اسم المنتج', key: 'item_name' },
  { title: 'الوحدة', key: 'unit_name' },
  { title: 'الكمية', key: 'quantity' },
  { title: 'تاريخ بداية النقل', key: 'from_date' },
  { title: 'عدد الرحلات', key: 'trip_no' },
  { title: 'نوع الناقلة', key: 'transport_type' },
];

const tripHeaders = [
  { title: 'اسم المنتج', key: 'item_name' },
  { title: 'الوحدة', key: 'unit_name' },
  { title: 'الكمية', key: 'quantity' },
  { title: 'تاريخ الرحلة', key: 'trip_date' },
  { title: 'سعر الرحلة', key: 'trip_price' },
  { title: 'نوع المركبات', key: 'transport_type_names' },
];

onMounted(() => {
  fetchConstants();
  fetchCategories();
  fetchOrderData();
});
</script>

<style scoped>
.info-item-bordered {
  min-width: 150px;
}
</style>
