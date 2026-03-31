<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
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
import AppFormBreadcrumb from "@/components/common/AppFormBreadcrumb.vue";

const route = useRoute();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();
const { t } = useI18n();

// ── Route params ────────────────────────────────────────────────
const purchaseUuid = computed(() => route.params.id as string);
const sall_orders_code_from_index = computed(
  () => route.query.sall_orders_code_from_index as string
);
const categoryKey = computed(() => route.query.category as string);
const routeOrderDatetime = computed(
  () => route.query.po_datetime as string
);
const categorySlug = computed(() => {
  const key = categoryKey.value;
  if (key === "fuel") return "fuels";
  if (key === "building_material") return "building-materials";
  return key;
});

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

const resetFormSelections = () => {
  selectedCustomerId.value = null;
  selectedSalesCode.value = null;
  salesCodeItems.value = [];
  orderDetails.value = null;
};

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

const fetchCustomers = async (search = '', cursor?: string, perPage = 15) => {
  const params: Record<string, any> = { per_page: perPage };
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
      `/purchases/orders/${categorySlug.value}/link?category=${categoryKey.value}&customer_id=${selectedCustomerId.value}`
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
      `/purchases/orders/${categorySlug.value}/link?category=${categoryKey.value}&customer_id=${selectedCustomerId.value}&with_items=true&with_status=true&code=${selectedSalesCode.value}`
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
      `/purchases/orders/${categorySlug.value}/link/${purchaseUuid.value}`,
      { uuids }
    );
    success(t("purchases.link.shared.messages.linkSuccess"));
    resetFormSelections();
  } catch (e: any) {
    console.error("handleAdd error:", e);
    error(e?.response?.data?.message ?? t("purchases.link.shared.messages.linkFailed"));
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
    success(t("purchases.link.shared.messages.deleteSuccess"));
  } catch (e: any) {
    console.error("removeLinkedItem error:", e);
    error(e?.response?.data?.message ?? t("purchases.link.shared.messages.deleteFailed"));
  }
};

// ── Watchers ────────────────────────────────────────────────────
watch(selectedCustomerId, () => fetchSalesCodes());
watch(selectedSalesCode, () => fetchOrderDetails());

// ── Lifecycle ───────────────────────────────────────────────────
const fetchLinkedItems = async () => {
  try {
    const res = await api.get<any>(
      `/purchases/orders/${categorySlug.value}/link/${purchaseUuid.value}`
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
    name: 'OrdersLinkView',
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
      <AppFormBreadcrumb list-path="/purchases/orders/link/view" module-root-key="breadcrumb.purchases.root"
        list-label-key="breadcrumb.purchases.link.orders.list" create-label-key="breadcrumb.purchases.link.orders.form"
        edit-label-key="breadcrumb.purchases.link.orders.form" :is-edit-mode="false"
        action-label-key="breadcrumb.purchases.link.orders.form" :code="sall_orders_code_from_index || purchaseUuid" />

      <!-- ── Page Header ─────────────────────────────────────────── -->
      <TopHeader :icon="linkIcon" title-key="purchases.link.orders.form.pageTitle"
        description-key="purchases.link.orders.form.pageDescription" :code="sall_orders_code_from_index || ''"
        code-label-key="purchases.link.orders.form.codeLabel" :show-action="false" />

      <!-- ── Section 1: معلومات الطلبية ──────────────────────────── -->
      <div class="bg-white rounded-3xl border border-gray-100 mx-6 p-6">
        <div class="flex items-center gap-2 mb-6 text-primary-600">
          <span v-html="fileCheckIcon" style="width:24px;height:24px;display:inline-flex;"></span>
          <h2 class="text-base font-bold">{{ t('purchases.link.orders.form.sectionInfo') }}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <!-- اسم العميل -->
          <div>
            <SelectInput v-model="selectedCustomerId" :items="[]"
              :label="t('purchases.link.shared.labels.customerName')" item-title="title" item-value="value"
              density="comfortable" :placeholder="t('purchases.link.shared.labels.selectCustomerPlaceholder')"
              :server-side="true" :fetch-function="fetchCustomers" item-title-key="full_name" item-value-key="id"
              :debounce-time="500" />
          </div>

          <!-- نوع الطلبية (disabled) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">{{
              t('purchases.link.orders.form.documentType') }}</label>
            <v-text-field :model-value="categoryLabel || categoryKey" density="comfortable" variant="outlined"
              hide-details readonly bg-color="#e3e8ef" class="!border-gray-300" />
          </div>

          <!-- كود طلبية المبيعات -->
          <div>
            <SelectInput v-model="selectedSalesCode" :items="salesCodeItems"
              :label="t('purchases.link.orders.form.salesDocumentCode')" item-title="title" item-value="value"
              density="comfortable" :placeholder="t('purchases.link.shared.labels.selectPlaceholder')"
              :loading="loadingSalesCodes" :disabled="!selectedCustomerId" />
          </div>
        </div>
      </div>

      <!-- ── Section 2: تفاصيل الطلبية ───────────────────────────── -->
      <div v-if="orderDetails || loadingDetails" class="bg-white rounded-3xl border border-gray-100 mx-6">

        <!-- Section header -->
        <div class="px-6 pt-6 pb-4 flex items-center gap-2">
          <span v-html="documentIcon" style="width:24px;height:24px;display:inline-flex;color:#1570ef;"></span>
          <h2 class="text-base font-bold text-primary-600">
            {{ t('purchases.link.orders.form.sectionDetails') }}
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
              <p class="text-xs font-semibold text-gray-600">{{ t('purchases.link.orders.form.documentStatus') }}</p>
              <p class="text-sm font-bold text-gray-900 mt-0.5">{{ orderDetails.status_name || '—' }}</p>
            </div>
            <!-- كود عرض مبيعات -->
            <div>
              <p class="text-xs font-semibold text-gray-600">{{ t('purchases.link.orders.form.salesOfferCode') }}</p>
              <p class="text-sm font-bold text-gray-900 mt-0.5">{{ orderDetails.sq_code || '—' }}</p>
            </div>
            <!-- كود عرض مشتريات -->
            <div>
              <p class="text-xs font-semibold text-gray-600">{{ t('purchases.link.orders.form.purchaseOfferCode') }}</p>
              <p class="text-sm font-bold text-gray-900 mt-0.5">{{ orderDetails.pq_code || '—' }}</p>
            </div>
            <!-- تاريخ الطلبية -->
            <div>
              <p class="text-xs font-semibold text-gray-600">{{ t('purchases.link.orders.form.documentDate') }}</p>
              <p class="text-sm font-medium text-gray-900 mt-0.5">{{ formatDate(orderDetails.so_datetime) }}</p>
            </div>
            <!-- موقع المشروع -->
            <div>
              <p class="text-xs font-semibold text-gray-600">{{ t('purchases.link.shared.labels.projectLocation') }}</p>
              <p class="text-sm font-medium text-gray-900 mt-0.5 md:max-w-[400px] max-w-[200px]"
                :title="orderDetails.target_location">
                {{ orderDetails.target_location || '—' }}
              </p>
            </div>
            <!-- عدد المنتجات (leftmost) -->
            <div>
              <p class="text-xs font-semibold text-gray-600">{{ t('purchases.link.shared.labels.productCount') }}</p>
              <p class="text-sm font-medium text-gray-900 mt-0.5">{{ orderDetails.items?.length ?? 0 }}</p>
            </div>
          </div>

          <!-- Products sub-header — RTL: icon on right, text next to it -->
          <div class="px-6 py-4 bg-primary-50 flex items-center gap-2 border-b border-gray-200">
            <span v-html="productIcon" style="width:22px;height:22px;display:inline-flex;color:#194185;"></span>
            <h3 class="text-base font-bold text-primary-900">{{ t('purchases.link.shared.labels.productsSection') }}
            </h3>
          </div>

          <!-- Products table — columns ordered RTL (first in HTML = rightmost) -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm" dir="rtl">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <!-- rightmost → leftmost -->
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-start">{{
                    t('purchases.link.shared.table.productName') }}</th>
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">{{
                    t('purchases.link.shared.table.quantity') }}</th>
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">{{
                    t('purchases.link.shared.table.unitPrice') }}</th>
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">{{
                    t('purchases.link.shared.table.discount') }}</th>
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">{{
                    t('purchases.link.shared.table.taxAmount') }}</th>
                  <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">{{
                    t('purchases.link.shared.table.totalAmount') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in productTableItems" :key="item.id"
                  class="border-b border-gray-100 hover:bg-gray-50/50">
                  <td class="px-6 py-4 text-start text-gray-900 font-medium whitespace-nowrap">{{ item.name }}</td>
                  <td class="px-6 py-4 text-center text-gray-900 font-medium whitespace-nowrap">{{ item.quantity }}</td>
                  <td class="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{{ item.price_per_unit }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1">
                      <SarIcon :width="13" :height="15" color="#121926" />
                      <span class="text-gray-900 font-medium">{{ item.discount_val }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{{ item.total_tax }}</td>
                  <td class="px-6 py-4 text-center text-gray-900 font-medium whitespace-nowrap">{{
                    item.subtotal_after_tax }}</td>
                </tr>
                <tr v-if="productTableItems.length === 0">
                  <td colspan="6" class="py-8 text-center text-gray-400 text-sm">{{
                    t('purchases.link.shared.table.emptyProducts') }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Add button -->
          <div class="flex justify-center px-6 py-5">
            <v-btn color="primary-100" variant="flat" class="!text-primary-900 font-bold w-full max-w-[798px]"
              :loading="submitting" @click="handleAdd">
              {{ t('purchases.link.shared.labels.addButton') }}
            </v-btn>
          </div>
        </template>
      </div>

      <!-- ── Section 3: قائمة العروض المرتبطة ──────────────────── -->
      <div class="bg-white rounded-3xl border border-gray-100 mx-6 pb-4">
        <!-- Section header -->
        <div class="px-6 py-5 flex items-center gap-2">
          <span v-html="linkIcon" style="width:22px;height:22px;display:inline-flex;color:#1570ef;"></span>
          <h2 class="text-base font-bold text-primary-600">{{ t('purchases.link.orders.form.linkedListTitle') }}</h2>
        </div>

        <!-- Table — columns ordered RTL (first in HTML = rightmost) -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm" dir="rtl">
            <thead>
              <tr class="bg-gray-50 border-y border-gray-200">
                <!-- rightmost → leftmost -->
                <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-start">{{
                  t('purchases.link.shared.labels.number') }}</th>
                <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">{{
                  t('purchases.link.shared.labels.customerAndType') }}</th>
                <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">{{
                  t('purchases.link.orders.form.colSalesCodeDate') }}</th>
                <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">{{
                  t('purchases.link.orders.form.colPurchaseCodeDate') }}</th>
                <th class="px-6 py-3 text-xs font-bold text-gray-500 whitespace-nowrap text-center">{{
                  t('purchases.link.shared.labels.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in linkedTableItems" :key="row.id" class="border-b border-gray-100 hover:bg-gray-50/50">
                <td class="px-6 py-4 text-start text-gray-900 font-medium whitespace-nowrap">{{ row.index }}</td>
                <td class="px-6 py-4 text-center text-gray-900 font-medium whitespace-nowrap">{{ row.customer }}</td>
                <td class="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{{ row.sales_code_date }}</td>
                <td class="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{{ row.purchase_code_date }}</td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <v-btn icon variant="text" size="small" @click="removeLinkedItem(row.uuid)">
                      <span v-html="trashIcon" style="width:18px;height:18px;display:inline-flex;color:#D92D20;"></span>
                    </v-btn>
                    <v-btn icon variant="text" size="small" @click="handleViewLinkedOrders(row)">
                      <span v-html="eyeIcon"
                        style="width:20px;height:20px;margin-top:5px;display:inline-flex;color:#1570EF;"></span>
                    </v-btn>
                  </div>
                </td>
              </tr>
              <tr v-if="linkedTableItems.length === 0">
                <td colspan="5" class="py-10 text-center text-gray-400 text-sm">{{
                  t('purchases.link.orders.form.emptyLinked')
                  }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </default-layout>
</template>
