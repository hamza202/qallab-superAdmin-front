<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import {
  homeIcon,
  documentIcon,
  productIcon,
  archiveIcon,
} from "@/components/icons/globalIcons";
import SarIcon from "@/components/icons/SarIcon.vue";

const route = useRoute();
const router = useRouter();
const api = useApi();
const { error } = useNotification();

// ── Route query params ───────────────────────────────────────────
const purchaseCode = computed(() => route.query.purchase_code as string);
const salesCode = computed(() => route.query.sales_code as string);
const categoryKey = computed(() => route.query.category as string);
const customerName = computed(() => route.query.customer_name as string);
const customerType = computed(() => route.query.customer_type as string);
const purchaseUuid = computed(() => route.query.purchase_uuid as string);
const sallQuotationsCode = computed(
  () => route.query.sall_quotations_code_from_index as string
);
const quotationsDatetime = computed(
  () => route.query.quotations_datetime as string
);

// ── State ────────────────────────────────────────────────────────
const isLoading = ref(false);
const quotations = ref<any[]>([]);

// ── API ──────────────────────────────────────────────────────────
const fetchData = async () => {
  if (!purchaseCode.value || !salesCode.value) return;
  isLoading.value = true;
  try {
    const codes = `${purchaseCode.value},${salesCode.value}`;
    const res = await api.get<any>(
      `/purchases/quotations/fuels/link?category=${categoryKey.value}&codes=${codes}&with_items=true`
    );
    if (Array.isArray(res?.data)) {
      quotations.value = res.data;
    }
  } catch (e: any) {
    error(e?.response?.data?.message || "فشل تحميل بيانات العرض");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// ── Computed ─────────────────────────────────────────────────────
const purchaseQuotation = computed(() => quotations.value[0] ?? null);
const salesQuotation = computed(() => quotations.value[1] ?? null);

const mapItems = (items: any[]) =>
  (items ?? []).map((item: any) => ({
    id: item.id,
    name: item.item?.name ?? "—",
    quantity: item.quantity ?? 0,
    price_per_unit: item.price_per_unit ?? 0,
    discount_val: item.discount_val ?? 0,
    total_tax: item.total_tax ?? 0,
    subtotal_after_tax: item.subtotal_after_tax ?? 0,
  }));

const purchaseItems = computed(() =>
  mapItems(purchaseQuotation.value?.items ?? [])
);
const salesItems = computed(() =>
  mapItems(salesQuotation.value?.items ?? [])
);

// ── Navigation ───────────────────────────────────────────────────
const goBackToForm = () => {
  if (purchaseUuid.value) {
    router.push({
      name: "QuotationsFuelsLinkForm",
      params: { id: purchaseUuid.value },
      query: {
        sall_quotations_code_from_index: sallQuotationsCode.value,
        category: categoryKey.value,
        quotations_datetime: quotationsDatetime.value,
      },
    });
  } else {
    router.back();
  }
};
</script>

<template>
  <default-layout>
    <div class="link-view-page -mx-6">
      <!-- ── Breadcrumb ─────────────────────────────────────────── -->
      <div class="flex flex-wrap items-center gap-3 mb-6 text-sm px-6">
        <router-link to="/" class="text-gray-500 hover:text-primary-600">
          <span v-html="homeIcon"></span>
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <router-link
          to="/purchases/quotations/material-product/list"
          class="text-gray-600 hover:text-primary-600"
        >
          المشتريات
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <router-link
          to="/purchases/quotations/material-product/list"
          class="text-gray-600 hover:text-primary-600"
        >
          عروض أسعار مواد أولية
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <span
          class="text-gray-600 hover:text-primary-600 cursor-pointer"
          @click="goBackToForm"
        >
          {{ purchaseCode || "—" }}
        </span>
        <span class="text-lg text-gray-300">/</span>
        <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">
          الربط مع عروض العملاء
        </span>
      </div>

      <!-- ── Page Header ───────────────────────────────────────── -->
      <div class="bg-white px-6 py-4 border-y border-gray-200 mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
              <span v-html="archiveIcon" class="text-primary-600"></span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900 mb-1">
                {{ customerName || "—" }}
              </h1>
              <p class="text-sm text-gray-500">{{ customerType || "—" }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Quotation Sections ────────────────────────────────── -->

      <!-- Purchase Quotation -->
      <div>
        <!-- Code header strip -->
        <div class="px-6 py-3">
          <div class="flex items-center gap-2 text-primary-600">
            <span
              v-html="documentIcon"
              style="width: 18px; height: 22px; display: inline-flex"
            ></span>
            <h2 class="text-base font-bold">
              كود المشتريات &nbsp; {{ purchaseQuotation?.code ?? purchaseCode ?? "—" }}
            </h2>
          </div>
        </div>

        <!-- Products subsection header -->
        <div class="bg-primary-50 px-6 py-3">
          <div class="flex items-center gap-2 text-primary-900">
            <span
              v-html="productIcon"
              style="width: 20px; height: 22px; display: inline-flex"
            ></span>
            <h2 class="text-base font-bold">المنتجات</h2>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm" dir="rtl">
            <thead>
              <tr class="bg-primary-25 border-y border-gray-200">
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-right">
                  اسم المنتج
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-center">
                  الكمية
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-center">
                  سعر الوحدة
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-center">
                  خصم
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-center">
                  مبلغ الضريبة
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-center">
                  إجمالي المبلغ
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in purchaseItems"
                :key="item.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="px-6 py-4 text-right text-gray-900 font-medium whitespace-nowrap">
                  {{ item.name }}
                </td>
                <td class="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                  {{ item.quantity }}
                </td>
                <td class="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                  {{ item.price_per_unit }}
                </td>
                <td class="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1 justify-center">
                    {{ item.discount_val }}
                    <SarIcon class="w-3 h-3 text-gray-500" />
                  </span>
                </td>
                <td class="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                  {{ item.total_tax }}
                </td>
                <td class="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                  {{ item.subtotal_after_tax }}
                </td>
              </tr>
              <tr v-if="purchaseItems.length === 0 && !isLoading">
                <td colspan="6" class="py-8 text-center text-gray-400 text-sm">
                  لا توجد منتجات
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sales Quotation -->
      <div>
        <!-- Code header strip -->
        <div class="px-6 py-3 mt-8 lg:!mt-10">
          <div class="flex items-center gap-2 text-primary-600">
            <span
              v-html="documentIcon"
              style="width: 18px; height: 22px; display: inline-flex"
            ></span>
            <h2 class="text-base font-bold">
              كود المبيعات &nbsp; {{ salesQuotation?.code ?? salesCode ?? "—" }}
            </h2>
          </div>
        </div>

        <!-- Products subsection header -->
        <div class="bg-primary-50 px-6 py-3">
          <div class="flex items-center gap-2 text-primary-900">
            <span
              v-html="productIcon"
              style="width: 20px; height: 22px; display: inline-flex"
            ></span>
            <h2 class="text-base font-bold">المنتجات</h2>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm" dir="rtl">
            <thead>
              <tr class="bg-primary-25 border-y border-gray-200">
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-right">
                  اسم المنتج
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-center">
                  الكمية
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-center">
                  سعر الوحدة
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-center">
                  خصم
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-center">
                  مبلغ الضريبة
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap text-center">
                  إجمالي المبلغ
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in salesItems"
                :key="item.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="px-6 py-4 text-right text-gray-900 font-medium whitespace-nowrap">
                  {{ item.name }}
                </td>
                <td class="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                  {{ item.quantity }}
                </td>
                <td class="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                  {{ item.price_per_unit }}
                </td>
                <td class="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1 justify-center">
                    {{ item.discount_val }}
                    <SarIcon class="w-3 h-3 text-gray-500" />
                  </span>
                </td>
                <td class="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                  {{ item.total_tax }}
                </td>
                <td class="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                  {{ item.subtotal_after_tax }}
                </td>
              </tr>
              <tr v-if="salesItems.length === 0 && !isLoading">
                <td colspan="6" class="py-8 text-center text-gray-400 text-sm">
                  لا توجد منتجات
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading Overlay -->
      <v-overlay :model-value="isLoading" contained class="align-center justify-center">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-overlay>
    </div>
  </default-layout>
</template>
