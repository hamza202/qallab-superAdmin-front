<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import {
  linkIcon,
  documentIcon,
  fileCheckIcon,
  trashIcon,
  productIcon,
  eyeIcon
} from "@/components/icons/globalIcons";
import SarIcon from "@/components/icons/SarIcon.vue";
import TopHeader from "@/components/price-offers/TopHeader.vue";

const route = useRoute();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

// ── Route params ────────────────────────────────────────────────
const purchaseUuid = computed(() => route.params.id as string);
const sall_orders_code_from_index = computed(
  () => route.query.sall_orders_code_from_index as string
);
const categoryKey = computed(() => route.query.category as string);
const routeOrderDatetime = computed(
  () => route.query.po_datetime as string
);

// ── State ───────────────────────────────────────────────────────
const selectedCustomerId = ref<number | null>(null);
const selectedSalesCode = ref<string | null>(null);
const categoryLabel = ref("");

const customerItems = ref<{ title: string; value: number }[]>([]);
const salesCodeItems = ref<{ title: string; value: string }[]>([]);
const orderDetails = ref<any>(null);

interface LinkedItem {
  uuid: string;
  code: string;
  customer_name: string;
  customer_type: string;
  so_datetime: string;
  purchase_code: string;
}
const linkedItems = ref<LinkedItem[]>([]);

const loadingCustomers = ref(false);
const loadingSalesCodes = ref(false);
const loadingDetails = ref(false);
const submitting = ref(false);

// ── API ─────────────────────────────────────────────────────────
const fetchConstants = async () => {
  try {
    const res = await api.get<any>("/purchases/invoices/constants");
    const categories = res?.data?.request_categories;
    if (Array.isArray(categories)) {
      const match = categories.find((c: any) => c.key === categoryKey.value);
      if (match) categoryLabel.value = match.label;
    }
  } catch (e) {
    console.error("fetchConstants error:", e);
  }
};

const fetchCustomers = async () => {
  loadingCustomers.value = true;
  try {
    const res = await api.get<any>("/customers/list");
    if (Array.isArray(res?.data)) {
      customerItems.value = res.data.map((c: any) => ({
        title: c.full_name,
        value: c.id,
      }));
    }
  } catch (e) {
    console.error("fetchCustomers error:", e);
  } finally {
    loadingCustomers.value = false;
  }
};

const fetchSalesCodes = async () => {
  if (!selectedCustomerId.value) {
    salesCodeItems.value = [];
    return;
  }
  salesCodeItems.value = [];
  selectedSalesCode.value = null;
  orderDetails.value = null;
  loadingSalesCodes.value = true;
  try {
    const res = await api.get<any>(
      `/purchases/orders/building-materials/link?category=${categoryKey.value}&customer_id=${selectedCustomerId.value}`
    );
    if (Array.isArray(res?.data)) {
      salesCodeItems.value = res.data.map((item: any) => ({
        title: item.code,
        value: item.code,
      }));
    }
  } catch (e) {
    console.error("fetchSalesCodes error:", e);
  } finally {
    loadingSalesCodes.value = false;
  }
};

const fetchOrderDetails = async () => {
  if (!selectedSalesCode.value || !selectedCustomerId.value) {
    orderDetails.value = null;
    return;
  }
  loadingDetails.value = true;
  orderDetails.value = null;
  try {
    const res = await api.get<any>(
      `/purchases/orders/building-materials/link?category=${categoryKey.value}&customer_id=${selectedCustomerId.value}&with_items=true&with_status=true&code=${selectedSalesCode.value}`
    );
    if (Array.isArray(res?.data) && res.data.length > 0) {
      orderDetails.value = res.data[0];
    }
  } catch (e) {
    console.error("fetchOrderDetails error:", e);
  } finally {
    loadingDetails.value = false;
  }
};

const handleAdd = async () => {
  if (!orderDetails.value) return;
  const salesUuid = orderDetails.value.uuid as string;
  submitting.value = true;
  try {
    // Add current selection if not already present
    if (!linkedItems.value.some((li) => li.uuid === salesUuid)) {
      const selectedCustomer = customerItems.value.find(
        (c) => c.value === selectedCustomerId.value
      );
      linkedItems.value.push({
        uuid: salesUuid,
        code: orderDetails.value.code,
        customer_name: selectedCustomer?.title ?? "",
        customer_type: "",
        so_datetime: orderDetails.value.so_datetime,
        purchase_code: sall_orders_code_from_index.value ?? "",
      });
    }

    // PUT uuids to current purchase order
    const uuids = linkedItems.value.map((li) => li.uuid);
    await api.put(
      `/purchases/orders/building-materials/link/${purchaseUuid.value}`,
      { uuids }
    );
    success("تم الربط بنجاح");
  } catch (e: any) {
    console.error("handleAdd error:", e);
    error(e?.response?.data?.message ?? "فشل الربط");
  } finally {
    submitting.value = false;
  }
};

const removeLinkedItem = async (uuid: string) => {
  linkedItems.value = linkedItems.value.filter((li) => li.uuid !== uuid);
  try {
    const uuids = linkedItems.value.map((li) => li.uuid);
    await api.put(
      `/purchases/orders/building-materials/link/${purchaseUuid.value}`,
      { uuids }
    );
    success("تم الحذف بنجاح");
  } catch (e: any) {
    console.error("removeLinkedItem error:", e);
    error(e?.response?.data?.message ?? "فشل الحذف");
  }
};

// ── Watchers ────────────────────────────────────────────────────
watch(selectedCustomerId, () => fetchSalesCodes());
watch(selectedSalesCode, () => fetchOrderDetails());

// ── Lifecycle ───────────────────────────────────────────────────
const fetchLinkedItems = async () => {
  try {
    const res = await api.get<any>(
      `/purchases/orders/building-materials/link/${purchaseUuid.value}`
    );
    const data: any[] = Array.isArray(res?.data) ? res.data : [];
    linkedItems.value = data.map((item: any) => ({
      uuid: item.uuid,
      code: item.code,
      customer_name: item.customer?.name ?? "",
      customer_type: item.customer?.type ?? "",
      so_datetime: item.so_datetime,
      purchase_code: sall_orders_code_from_index.value ?? "",
    }));
  } catch (e) {
    console.error("fetchLinkedItems error:", e);
  }
};

onMounted(() => {
  fetchConstants();
  fetchCustomers();
  fetchLinkedItems();
});

// ── Helpers ─────────────────────────────────────────────────────
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US");
};

// View linked orders handler
const handleViewLinkedOrders = (row: any) => {
  // Extract sales code from the clicked row
  // Format: "CODE \\ DATE"
  const salesCode = row.sales_code_date.split(' \\ ')[0];
  
  router.push({
    name: 'OrdersMaterialProductLinkView',
    query: {
      category: categoryKey.value,
      codes: salesCode,
      sall_orders_code_from_index: sall_orders_code_from_index.value,
      po_datetime: routeOrderDatetime.value,
      purchase_uuid: purchaseUuid.value
    }
  });
};

// ── Tables ──────────────────────────────────────────────────────
const productTableItems = computed(() => {
  if (!orderDetails.value?.items) return [];
  return orderDetails.value.items.map((item: any, i: number) => ({
    id: item.id ?? i,
    name: item.item_name ?? "—",
    quantity: item.quantity ?? 0,
    price_per_unit: item.price_per_unit ?? 0,
    discount_val: item.discount_val ?? 0,
    total_tax: item.total_tax ?? 0,
    subtotal_after_tax: item.subtotal_after_tax ?? 0,
  }));
});

const linkedTableItems = computed(() =>
  linkedItems.value.map((item, i) => ({
    id: item.uuid,
    uuid: item.uuid,
    index: String(i + 1).padStart(2, "0"),
    customer: item.customer_type
      ? `${item.customer_name} \\ ${item.customer_type}`
      : item.customer_name,
    sales_code_date: `${item.code} \\ ${formatDate(item.so_datetime)}`,
    purchase_code_date: `${item.purchase_code} \\ ${formatDate(routeOrderDatetime.value)}`,
  }))
);
</script>

<template>
  <default-layout>
    <div class="link-form-page -mx-6 bg-qallab-dashboard-bg space-y-4">

      <!-- ── Page Header ─────────────────────────────────────────── -->
      <TopHeader
        :icon="linkIcon"
        title-key="الربط مع طلبيات العملاء"
        description-key="تساعدك في الربط بين طللبيات المنتجات بين البائع والمشتري"
        :code="sall_orders_code_from_index || ''"
        code-label="كود الطلبية"
        :show-action="false"
      />

      <!-- ── Section 1: معلومات الطلبية ──────────────────────────── -->
      <div class="bg-white rounded-3xl border border-gray-100 mx-6 p-6">
        <div class="flex items-center gap-2 mb-6 text-primary-600">
          <span v-html="fileCheckIcon" style="width:24px;height:24px;display:inline-flex;"></span>
          <h2 class="text-base font-bold">معلومات الطلبية</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <!-- اسم العميل -->
          <div>
            <SelectInput
              v-model="selectedCustomerId"
              :items="customerItems"
              label="اسم العميل"
              item-title="title"
              item-value="value"
              density="comfortable"
              placeholder="اختر اسم العميل"
              :loading="loadingCustomers"
            />
          </div>

          <!-- نوع الطلبية (disabled) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">نوع الطلبية</label>
            <v-text-field
              :model-value="categoryLabel || categoryKey"
              density="comfortable"
              variant="outlined"
              hide-details
              readonly
              bg-color="#e3e8ef"
              class="!border-gray-300"
            />
          </div>

          <!-- كود طلبية المبيعات -->
          <div>
            <SelectInput
              v-model="selectedSalesCode"
              :items="salesCodeItems"
              label="كود طلبية المبيعات"
              item-title="title"
              item-value="value"
              density="comfortable"
              placeholder="اختر"
              :loading="loadingSalesCodes"
              :disabled="!selectedCustomerId"
            />
          </div>
        </div>
      </div>

      <!-- ── Section 2: تفاصيل الطلبية ───────────────────────────── -->
      <div v-if="orderDetails || loadingDetails" class="bg-white rounded-3xl border border-gray-100 mx-6">

        <!-- Section header -->
        <div class="px-6 pt-6 pb-4 flex items-center gap-2">
          <span v-html="documentIcon" style="width:24px;height:24px;display:inline-flex;color:#1570ef;"></span>
          <h2 class="text-base font-bold text-primary-600">
            تفاصيل الطلبية
            <span v-if="orderDetails" class="ms-1">{{ orderDetails.code }}</span>
          </h2>
        </div>

        <!-- Loading -->
        <div v-if="loadingDetails" class="flex justify-center py-10">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else-if="orderDetails">
          <!-- Info strip — RTL: first item in HTML = rightmost on screen -->
          <div class="border-y border-primary-100 px-6 py-4 flex flex-wrap gap-x-8 gap-y-3">
            <!-- حالة الطلبية (rightmost) -->
            <div>
              <p class="text-xs font-semibold text-gray-600">حالة الطلبية:</p>
              <p class="text-sm font-bold text-gray-900 mt-0.5">{{ orderDetails.status_name || '—' }}</p>
            </div>
            <!-- كود عرض مبيعات -->
            <div>
              <p class="text-xs font-semibold text-gray-600">كود عرض مبيعات :</p>
              <p class="text-sm font-bold text-gray-900 mt-0.5">{{ orderDetails.sq_code || '—' }}</p>
            </div>
            <!-- كود عرض مشتريات -->
            <div>
              <p class="text-xs font-semibold text-gray-600">كود عرض مشتريات :</p>
              <p class="text-sm font-bold text-gray-900 mt-0.5">{{ orderDetails.pq_code || '—' }}</p>
            </div>
            <!-- تاريخ الطلبية -->
            <div>
              <p class="text-xs font-semibold text-gray-600">تاريخ الطلبية :</p>
              <p class="text-sm font-medium text-gray-900 mt-0.5">{{ formatDate(orderDetails.so_datetime) }}</p>
            </div>
            <!-- موقع المشروع -->
            <div>
              <p class="text-xs font-semibold text-gray-600">موقع المشروع :</p>
              <p class="text-sm font-medium text-gray-900 mt-0.5 md:max-w-[400px] max-w-[200px]" :title="orderDetails.target_location">
                {{ orderDetails.target_location || '—' }}
              </p>
            </div>
            <!-- عدد المنتجات (leftmost) -->
            <div>
              <p class="text-xs font-semibold text-gray-600">عدد المنتجات :</p>
              <p class="text-sm font-medium text-gray-900 mt-0.5">{{ orderDetails.items?.length ?? 0 }}</p>
            </div>
          </div>

          <!-- Products sub-header — RTL: icon on right, text next to it -->
          <div class="px-6 py-4 bg-primary-50 flex items-center gap-2 border-b border-gray-200">
            <span v-html="productIcon" style="width:22px;height:22px;display:inline-flex;color:#194185;"></span>
            <h3 class="text-base font-bold text-primary-900">المنتجات</h3>
          </div>

          <!-- Products table — columns ordered RTL (first in HTML = rightmost) -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm" dir="rtl">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <!-- rightmost → leftmost -->
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-right">اسم المنتج</th>
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">الكمية</th>
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">سعر الوحدة</th>
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">خصم</th>
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">مبلغ الضريبة</th>
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">إجمالي المبلغ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in productTableItems"
                  :key="item.id"
                  class="border-b border-gray-100 hover:bg-gray-50/50"
                >
                  <td class="px-6 py-4 text-right text-gray-900 font-medium whitespace-nowrap">{{ item.name }}</td>
                  <td class="px-6 py-4 text-center text-gray-900 font-medium whitespace-nowrap">{{ item.quantity }}</td>
                  <td class="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{{ item.price_per_unit }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1">
                      <SarIcon :width="13" :height="15" color="#121926" />
                      <span class="text-gray-900 font-medium">{{ item.discount_val }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{{ item.total_tax }}</td>
                  <td class="px-6 py-4 text-center text-gray-900 font-medium whitespace-nowrap">{{ item.subtotal_after_tax }}</td>
                </tr>
                <tr v-if="productTableItems.length === 0">
                  <td colspan="6" class="py-8 text-center text-gray-400 text-sm">لا توجد منتجات</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Add button -->
          <div class="flex justify-center px-6 py-5">
            <v-btn
              color="primary-100"
              variant="flat"
              class="!text-primary-900 font-bold w-full max-w-[798px]"
              :loading="submitting"
              @click="handleAdd"
            >
              + &nbsp; اضافة
            </v-btn>
          </div>
        </template>
      </div>

      <!-- ── Section 3: قائمة العروض المرتبطة ──────────────────── -->
      <div class="bg-white rounded-3xl border border-gray-100 mx-6 pb-4">
        <!-- Section header -->
        <div class="px-6 py-5 flex items-center gap-2">
          <span v-html="linkIcon" style="width:22px;height:22px;display:inline-flex;color:#1570ef;"></span>
          <h2 class="text-base font-bold text-primary-600">قائمة الطلبيات المرتبطة</h2>
        </div>

        <!-- Table — columns ordered RTL (first in HTML = rightmost) -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm" dir="rtl">
            <thead>
              <tr class="bg-gray-50 border-y border-gray-200">
                <!-- rightmost → leftmost -->
                <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-right">الرقم</th>
                <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">العميل / نوع العميل</th>
                <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">كود طلب مبيعات العميل / التاريخ</th>
                <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">كود طلبية مشتريات قلاب / التاريخ</th>
                <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in linkedTableItems"
                :key="row.id"
                class="border-b border-gray-100 hover:bg-gray-50/50"
              >
                <td class="px-6 py-4 text-right text-gray-900 font-medium whitespace-nowrap">{{ row.index }}</td>
                <td class="px-6 py-4 text-center text-gray-900 font-medium whitespace-nowrap">{{ row.customer }}</td>
                <td class="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{{ row.sales_code_date }}</td>
                <td class="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{{ row.purchase_code_date }}</td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <v-btn icon variant="text" size="small" @click="removeLinkedItem(row.uuid)">
                      <span v-html="trashIcon" style="width:18px;height:18px;display:inline-flex;color:#D92D20;"></span>
                    </v-btn>
                    <v-btn icon variant="text" size="small" @click="handleViewLinkedOrders(row)">
                      <span v-html="eyeIcon" style="width:20px;height:20px;margin-top:5px;display:inline-flex;color:#1570EF;"></span>
                    </v-btn>
                  </div>
                </td>
              </tr>
              <tr v-if="linkedTableItems.length === 0">
                <td colspan="5" class="py-10 text-center text-gray-400 text-sm">لا توجد عروض مرتبطة</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </default-layout>
</template>
