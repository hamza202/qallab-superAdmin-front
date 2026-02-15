<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import { useTableColumns } from "@/composables/useTableColumns";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog.vue";
import {
  GridIcon,
  trash_1_icon,
  trash_2_icon,
  searchIcon,
  plusIcon,
  columnIcon,
  exportIcon,
  importIcon,
} from "@/components/icons/globalIcons";
import StatusChangeFeature from '@/components/common/StatusChangeFeature.vue';
import { switcStatusIcon } from '@/components/icons/priceOffersIcons';

const { t } = useI18n();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const TABLE_NAME = "admin_purchases_receiving_docs";
const {
  allHeaders,
  shownHeaders,
  updatingHeaders,
  showHeadersMenu,
  headerCheckStates,
  initHeaders,
  toggleHeader,
} = useTableColumns(TABLE_NAME);

// Types
interface ItemActions {
  can_update: boolean;
  can_delete: boolean;
  can_view: boolean;
  can_change_status: boolean;
}

interface ReceivingDoc {
  uuid: string;
  code: string;
  purchase_order_code: string;
  receiving_date: string;
  status: string;
  status_id: number;
  actions: ItemActions;
}

interface TableHeader {
  key: string;
  title: string;
}

interface ListResponse {
  data: ReceivingDoc[];
  pagination: {
    next_cursor: string | null;
    previous_cursor: string | null;
    per_page: number;
  };
  header_table: string;
  headers: TableHeader[];
  shownHeaders: TableHeader[];
  actions: { can_create: boolean; can_bulk_delete: boolean };
}

// API state
const tableItems = ref<ReceivingDoc[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(false);
const loading = ref(false);
const loadingMore = ref(false);
const nextCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);
const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

// Table headers for DataTable (from shownHeaders)
const tableHeaders = computed(() =>
  shownHeaders.value.map((h) => ({
    key: h.key,
    title: h.title,
    width: "140px",
  }))
);

// Selection (we use uuid as id for rows)
const selectedItems = ref<string[]>([]);
const hasSelectedItems = computed(() => selectedItems.value.length > 0);

// Items with id for DataTable (id = uuid for selection)
const tableItemsWithId = computed(() =>
  tableItems.value.map((item) => ({ ...item, id: item.uuid }))
);

// Filters (matching design: كود الاستلام, كود طلبية المشتريات, تاريخ الاستلام, الحالة)
const showAdvancedFilters = ref(false);
const filterCode = ref("");
const filterPurchaseOrderCode = ref("");
const filterReceivingDate = ref("");
const filterStatus = ref<string | null>(null);

const statusFilterItems = ["تأكيد", "الغاء", "مسودة"];

// Delete dialogs
const showBulkDeleteDialog = ref(false);
const deleteLoading = ref(false);

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
  filterCode.value = "";
  filterPurchaseOrderCode.value = "";
  filterReceivingDate.value = "";
  filterStatus.value = null;
};

const applyFilters = () => {
  fetchList();
};

// API: fetch list (append = true for infinite scroll)
const fetchList = async (append = false) => {
  if (append) loadingMore.value = true;
  else loading.value = true;
  try {
    const params = new URLSearchParams();
    params.append("per_page", String(perPage.value));
    if (append && nextCursor.value) params.append("cursor", nextCursor.value);
    if (filterCode.value) params.append("code", filterCode.value);
    if (filterPurchaseOrderCode.value)
      params.append("purchase_order_code", filterPurchaseOrderCode.value);
    if (filterReceivingDate.value)
      params.append("receiving_date", filterReceivingDate.value);
    if (filterStatus.value) params.append("status", filterStatus.value);

    const url = `/purchases/receiving-docs?${params.toString()}`;
    const res = await api.get<ListResponse>(url);

    const data = res.data || [];
    if (append) {
      tableItems.value = [...tableItems.value, ...data];
    } else {
      tableItems.value = data;
      canCreate.value = res.actions?.can_create ?? false;
      canBulkDelete.value = res.actions?.can_bulk_delete ?? false;
      initHeaders(res.headers || [], res.shownHeaders || []);
    }
    nextCursor.value = res.pagination?.next_cursor ?? null;
  } catch (err: any) {
    console.error("Error fetching receiving docs list:", err);
    error(err?.response?.data?.message || "فشل تحميل قائمة سندات الاستلام");
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const setupInfiniteScroll = () => {
  if (!loadMoreTrigger.value) return;
  observer.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasMoreData.value && !loadingMore.value && !loading.value) {
        fetchList(true);
      }
    },
    { root: null, rootMargin: "100px", threshold: 0.1 }
  );
  observer.value.observe(loadMoreTrigger.value);
};

const cleanupInfiniteScroll = () => {
  if (observer.value && loadMoreTrigger.value) {
    observer.value.unobserve(loadMoreTrigger.value);
    observer.value.disconnect();
  }
};

// Toggle column and persist
const handleToggleHeader = async (headerKey: string) => {
  await toggleHeader(headerKey).catch((err: any) => {
    error(err?.response?.data?.message || "فشل تحديث الأعمدة");
  });
};

// Handlers
const handleEdit = (item: { id?: string | number; uuid?: string }) => {
  const id = item.uuid ?? String(item.id);
  router.push({
    name: "ReceivingDocsEdit",
    params: { id },
  });
};

const handleView = (item: { id?: string | number; uuid?: string }) => {
  const id = item.uuid ?? String(item.id);
  router.push({
    name: "ReceivingDocsView",
    params: { id },
  });
};

const confirmDelete = async (item: { id?: string | number }) => {
  try {
    deleteLoading.value = true;
    await api.delete(`/purchases/receiving-docs/${String(item.id)}`);
    success("تم حذف سند الاستلام بنجاح");
    await fetchList();
  } catch (err: any) {
    console.error("Error deleting receiving doc:", err);
    error(err?.response?.data?.message || "فشل حذف سند الاستلام");
  } finally {
    deleteLoading.value = false;
  }
};

const handleSelectItem = (item: { id: string | number }, selected: boolean) => {
  const id = String(item.id);
  if (selected) {
    selectedItems.value.push(id);
  } else {
    selectedItems.value = selectedItems.value.filter((x) => x !== id);
  }
};

const handleSelectAllItems = (checked: boolean) => {
  if (checked) {
    selectedItems.value = tableItemsWithId.value.map((i) => String(i.id));
  } else {
    selectedItems.value = [];
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "مكتمل":
      return "bg-[#ECFDF3] text-[#027A48]";
    case "قيد المراجعة":
      return "bg-[#FEF0C7] text-[#DC6803]";
    case "تأكيد":
      return "bg-[#ECFDF3] text-[#027A48]";
    case "الغاء":
      return "bg-[#FEE4E2] text-[#D92D20]";
    case "مسودة":
      return "bg-[#F2F4F7] text-[#344054]";
    default:
      return "bg-[#F2F4F7] text-[#344054]";
  }
};

const openCreate = () => {
  // Route can be added when Form is needed
  router.push({ name: "ReceivingDocsCreate" });
};

const handleBulkDelete = () => {
  if (selectedItems.value.length === 0) return;
  showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  try {
    deleteLoading.value = true;
    await api.post("/purchases/receiving-docs/bulk-delete", {
      ids: selectedItems.value,
    });
    success(`تم حذف ${selectedItems.value.length} سند استلام بنجاح`);
    selectedItems.value = [];
    await fetchList();
  } catch (err: any) {
    console.error("Error bulk deleting:", err);
    error(err?.response?.data?.message || "فشل الحذف الجماعي");
  } finally {
    deleteLoading.value = false;
    showBulkDeleteDialog.value = false;
  }
};

// Status change (can_change_status)
const showChangeStatusDialog = ref(false);
const itemToChangeStatus = ref<ReceivingDoc | null>(null);

const openChangeStatusDialog = (item: ReceivingDoc | Record<string, unknown>) => {
  itemToChangeStatus.value = item as ReceivingDoc;
  showChangeStatusDialog.value = true;
};

onMounted(() => {
  fetchList();
  nextTick(() => setupInfiniteScroll());
});

onBeforeUnmount(() => {
  cleanupInfiniteScroll();
});
</script>

<template>
  <default-layout>
    <div class="receiving-docs-page">
      <PageHeader
        :icon="GridIcon"
        title-key="pages.ReceivingDocs.title"
        description-key="pages.ReceivingDocs.description"
      />

      <div
        class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm"
      >
        <ButtonWithIcon
          variant="flat"
          height="40"
          rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-100 !text-primary-900"
          :prepend-icon="importIcon"
          :label="t('common.import')"
        />
        <ButtonWithIcon
          variant="flat"
          height="40"
          rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
          :prepend-icon="exportIcon"
          :label="t('common.export')"
        />
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div
          :class="hasSelectedItems ? 'justify-between' : 'justify-end'"
          class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3"
        >
          <!-- Actions when rows are selected (only if can_bulk_delete) -->
          <div
            v-if="canBulkDelete && hasSelectedItems"
            class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm"
          >
            <ButtonWithIcon
              variant="flat"
              height="40"
              rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_1_icon"
              color="white"
              :label="t('common.delete')"
              @click="handleBulkDelete"
            />
            <div class="w-px bg-gray-200"></div>
            <ButtonWithIcon
              variant="flat"
              height="40"
              rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_2_icon"
              color="white"
              :label="t('common.deleteAll')"
              @click="handleBulkDelete"
            />
          </div>

          <!-- Main header controls -->
          <div class="flex flex-wrap gap-3">
            <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <ButtonWithIcon
                  v-bind="menuProps"
                  variant="outlined"
                  append-icon="mdi-chevron-down"
                  rounded="4"
                  color="gray-500"
                  height="40"
                  custom-class="font-semibold text-base border-gray-400"
                  :prepend-icon="columnIcon"
                  :label="t('common.columns')"
                />
              </template>
              <v-list>
                <v-list-item
                  v-for="header in allHeaders"
                  :key="header.key"
                  @click="handleToggleHeader(header.key)"
                >
                  <template #prepend>
                    <v-checkbox-btn
                      :model-value="headerCheckStates[header.key]"
                      :disabled="updatingHeaders"
                      @click.stop="handleToggleHeader(header.key)"
                    />
                  </template>
                  <v-list-item-title>{{ header.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <ButtonWithIcon
              variant="flat"
              color="primary-500"
              height="40"
              rounded="4"
              custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
              :prepend-icon="searchIcon"
              :label="t('common.advancedSearch')"
              @click="toggleAdvancedFilters"
            />

            <ButtonWithIcon
              v-if="canCreate"
              variant="flat"
              color="primary-100"
              height="40"
              rounded="4"
              custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
              :prepend-icon="plusIcon"
              label="إضافة سند استلام"
              @click="openCreate"
            />
          </div>
        </div>

        <!-- Advanced filters row (كود الاستلام, كود طلبية المشتريات, تاريخ الاستلام, الحالة) -->
        <div
          v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap"
        >
          <div class="flex flex-wrap gap-3 items-end">
            <TextInput
              v-model="filterCode"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="كود الاستلام"
              class="w-full sm:w-40 bg-white border-primary-200"
            />
            <TextInput
              v-model="filterPurchaseOrderCode"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="كود طلبية المشتريات"
              class="w-full sm:w-40 bg-white border-primary-200"
            />
            <DatePickerInput
              v-model="filterReceivingDate"
              density="comfortable"
              hide-details
              placeholder="تاريخ الاستلام"
              class="w-full sm:w-40 bg-white border-primary-200"
            />
            <SelectInput
              v-model="filterStatus"
              :items="statusFilterItems"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="الحالة"
              class="w-full sm:w-40 bg-white border-primary-200"
            />
          </div>
          <div class="flex gap-2 items-center">
            <ButtonWithIcon
              variant="flat"
              color="primary-500"
              rounded="4"
              height="40"
              custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
              :prepend-icon="searchIcon"
              label="ابحث"
              @click="applyFilters"
            />
            <ButtonWithIcon
              variant="flat"
              color="primary-100"
              height="40"
              rounded="4"
              border="sm"
              custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
              prepend-icon="mdi-refresh"
              label="إعادة تعيين"
              @click="resetFilters"
            />
          </div>
        </div>

        <!-- Table -->
        <DataTable
          :headers="tableHeaders"
          :items="tableItemsWithId"
          :loading="loading"
          :show-checkbox="canBulkDelete"
          show-actions
          @edit="handleEdit"
          @view="handleView"
          @delete="confirmDelete"
          @select="handleSelectItem"
          @selectAll="handleSelectAllItems"
        >
          <template #item.status="{ item }">
            <span
              :class="[
                'inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                getStatusClass(item.status),
              ]"
            >
              {{ item.status }}
            </span>
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center">
              <v-btn
                v-if="item.actions?.can_change_status"
                icon
                variant="text"
                size="small"
                @click="openChangeStatusDialog(item)"
              >
                <span v-html="switcStatusIcon"></span>
              </v-btn>
            </div>
          </template>
        </DataTable>

        <div ref="loadMoreTrigger" class="h-4"></div>
        <div v-if="loadingMore" class="flex justify-center items-center py-4">
          <v-progress-circular indeterminate color="primary" size="32" />
          <span class="mr-2 text-gray-600">جاري تحميل المزيد...</span>
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Dialog -->
    <DeleteConfirmDialog
      v-model="showBulkDeleteDialog"
      :loading="deleteLoading"
      title="حذف سندات الاستلام"
      :message="`هل أنت متأكد من حذف ${selectedItems.length} سند استلام؟`"
      @confirm="confirmBulkDelete"
    />

    <StatusChangeFeature
      v-model="showChangeStatusDialog"
      :item="itemToChangeStatus"
      :change-status-url="`/purchases/receiving-docs/${itemToChangeStatus?.uuid}/change-status`"
      title="تغيير الحالة"
      message="تغيير الحالة:"
      @success="fetchList"
    />
  </default-layout>
</template>

<style scoped></style>
