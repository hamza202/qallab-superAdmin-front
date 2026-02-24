<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';
import { useNotification } from '@/composables/useNotification';
import { useTableColumns } from '@/composables/useTableColumns';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog.vue';
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import { GridIcon, trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";
import { switchHorisinralIcon } from '@/components/icons/priceOffersIcons';
import StatusChangeFeature from '@/components/common/StatusChangeFeature.vue';

const { t } = useI18n();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const TABLE_NAME = 'admin_purchase_logistics_orders';
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

interface OrderItem {
  uuid: string;
  code: string;
  supplier_name?: string;
  po_datetime: string;
  target_location: string;
  payment_method: string;
  upfront_payment: number;
  status: string;
  status_id: number;
  status_background_color?: string;
  status_text_color?: string;
  actions: ItemActions;
}

interface TableHeader {
  key: string;
  title: string;
}

interface ListResponse {
  data: OrderItem[];
  pagination: { next_cursor: string | null; previous_cursor: string | null; per_page: number };
  header_table: string;
  headers: TableHeader[];
  shownHeaders: TableHeader[];
  actions: { can_create: boolean; can_bulk_delete: boolean };
}

// API state
const tableItems = ref<OrderItem[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(false);
const loading = ref(false);
const loadingMore = ref(false);
const nextCursor = ref<string | null>(null);
const hasMoreData = computed(() => nextCursor.value !== null);

const tableHeaders = computed(() =>
  shownHeaders.value.map((h) => ({ key: h.key, title: h.title, width: '140px' }))
);

const tableItemsWithId = computed(() =>
  tableItems.value.map((item) => ({ ...item, id: item.uuid }))
);

const selectedRequests = ref<string[]>([]);
const hasSelectedRequests = computed(() => selectedRequests.value.length > 0);

// Filters
const showAdvancedFilters = ref(false);
const filterCode = ref("");
const filterSupplierName = ref("");
const filterLocation = ref<string | null>(null);
const filterStatusId = ref<number | null>(null);
const filterDateFrom = ref("");
const filterDateTo = ref("");

const showBulkDeleteDialog = ref(false);
const showDeleteDialog = ref(false);
const itemToDelete = ref<OrderItem | null>(null);
const deleteLoading = ref(false);
const showChangeStatusDialog = ref(false);
const itemToChangeStatus = ref<OrderItem | null>(null);

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
  filterCode.value = "";
  filterSupplierName.value = "";
  filterLocation.value = null;
  filterStatusId.value = null;
  filterDateFrom.value = "";
  filterDateTo.value = "";
  fetchList();
};

const applyFilters = () => {
  nextCursor.value = null;
  fetchList();
};

const fetchList = async (cursor?: string | null, append = false) => {
  if (append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  try {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (filterCode.value) params.append('code', filterCode.value);
    if (filterSupplierName.value) params.append('supplier_name', filterSupplierName.value);
    if (filterLocation.value) params.append('target_location', filterLocation.value);
    if (filterStatusId.value) params.append('status_id', String(filterStatusId.value));
    if (filterDateFrom.value) params.append('po_datetime', filterDateFrom.value);

    const url = params.toString()
      ? `/purchases/orders/logistics?${params.toString()}`
      : '/purchases/orders/logistics';
    const res = await api.get<ListResponse>(url);

    if (append) {
      tableItems.value = [...tableItems.value, ...(res.data || [])];
    } else {
      tableItems.value = res.data || [];
      canCreate.value = res.actions?.can_create ?? false;
      canBulkDelete.value = res.actions?.can_bulk_delete ?? false;
      initHeaders(res.headers || [], res.shownHeaders || []);
    }
    nextCursor.value = res.pagination?.next_cursor || null;
  } catch (err: any) {
    console.error('Error fetching orders logistics list:', err);
    error(err?.response?.data?.message || 'فشل تحميل قائمة الطلبيات');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const handleLoadMore = () => {
  if (nextCursor.value && !loadingMore.value) {
    fetchList(nextCursor.value, true);
  }
};

const handleToggleHeader = async (headerKey: string) => {
  await toggleHeader(headerKey).catch((err: any) => {
    error(err?.response?.data?.message || 'فشل تحديث الأعمدة');
  });
};

const handleView = (item: { id?: string | number; uuid?: string }) => {
  const uuid = item.uuid ?? String(item.id);
  router.push({ name: 'OrdersLogisticsView', params: { id: uuid } });
};

const handleEdit = (item: { id?: string | number; uuid?: string }) => {
  const uuid = item.uuid ?? String(item.id);
  router.push({ name: 'OrdersLogisticsEdit', params: { id: uuid } });
};

const handleDelete = (item: { uuid?: string; id?: string | number } & Partial<OrderItem>) => {
  itemToDelete.value = item as OrderItem;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  const uuid = itemToDelete.value.uuid;
  try {
    deleteLoading.value = true;
    await api.delete(`/purchases/orders/logistics/${uuid}`);
    success('تم حذف الطلبية بنجاح');
    showDeleteDialog.value = false;
    itemToDelete.value = null;
    await fetchList();
  } catch (err: any) {
    console.error('Error deleting order:', err);
    error(err?.response?.data?.message || 'فشل حذف الطلبية');
  } finally {
    deleteLoading.value = false;
  }
};

const handleSelectRequest = (item: { id: string | number }, selected: boolean) => {
  const id = String(item.id);
  if (selected) {
    selectedRequests.value.push(id);
  } else {
    selectedRequests.value = selectedRequests.value.filter((x) => x !== id);
  }
};

const handleSelectAllRequests = (checked: boolean) => {
  if (checked) {
    selectedRequests.value = tableItemsWithId.value.map((i) => String(i.id));
  } else {
    selectedRequests.value = [];
  }
};

/** Parse po_datetime "DD-MM-YYYY HH:mm:ss" to a Date (native Date() doesn't parse this format). */
const formatPoDatetime = (str: string | null | undefined): string => {
  if (!str || typeof str !== 'string') return '—';
  const trimmed = str.trim();
  const [datePart, timePart] = trimmed.split(/\s+/);
  if (!datePart) return trimmed || '—';
  const parts = datePart.split('-');
  if (parts.length !== 3) return trimmed;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return trimmed;
  const [hh = 0, mm = 0, ss = 0] = (timePart || '').split(':').map((x) => parseInt(x, 10) || 0);
  const date = new Date(y, m, d, hh, mm, ss);
  if (Number.isNaN(date.getTime())) return trimmed;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'مكتمل':
      return 'bg-[#ECFDF3] text-[#027A48]';
    case 'تأكيد':
      return 'bg-[#D1FAE5] text-[#059669]';
    case 'قيد المراجعة':
      return 'bg-[#FEF0C7] text-[#DC6803]';
    case 'مسودة':
      return 'bg-[#F2F4F7] text-[#344054]';
    case 'الغاء':
    case 'مرفوض':
      return 'bg-[#FEE4E2] text-[#D92D20]';
    default:
      return 'bg-[#F2F4F7] text-[#344054]';
  }
};

const getStatusStyle = (item: Record<string, unknown>): Record<string, string> | null => {
  const bg = item.status_background_color as string | undefined;
  const fg = item.status_text_color as string | undefined;
  if (bg || fg) {
    return {
      ...(bg && { backgroundColor: bg }),
      ...(fg && { color: fg }),
    };
  }
  return null;
};

const openCreateRequest = () => {
  router.push({ name: 'OrdersLogisticsCreate' });
};

const handleBulkDelete = () => {
  if (selectedRequests.value.length === 0) return;
  showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  try {
    deleteLoading.value = true;
    const formData = new FormData();
    selectedRequests.value.forEach((id, index) => {
      formData.append(`ids[${index}]`, id);
    });
    await api.post('/purchases/orders/logistics/bulk-delete', formData);
    success(`تم حذف ${selectedRequests.value.length} طلبية بنجاح`);
    selectedRequests.value = [];
    await fetchList();
  } catch (err: any) {
    console.error('Error bulk deleting:', err);
    error(err?.response?.data?.message || 'فشل الحذف الجماعي');
  } finally {
    deleteLoading.value = false;
    showBulkDeleteDialog.value = false;
  }
};

const openChangeStatusDialog = (item: OrderItem | Record<string, unknown>) => {
  itemToChangeStatus.value = item as OrderItem;
  showChangeStatusDialog.value = true;
};

onMounted(() => {
  fetchList();
});
</script>

<template>
  <default-layout>
    <div class="pricesOffers-page">
      <PageHeader :icon="GridIcon" title-key="pages.OrdersLogistics.title"
        description-key="pages.OrdersLogistics.description" />

      <div
        class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
        <ButtonWithIcon variant="flat" height="40" rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-100 !text-primary-900"
          :prepend-icon="importIcon" :label="t('common.import')" />
        <ButtonWithIcon variant="flat" height="40" rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
          :prepend-icon="exportIcon" :label="t('common.export')" />
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div :class="hasSelectedRequests ? 'justify-between' : 'justify-end'"
          class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
          <div v-if="canBulkDelete && hasSelectedRequests"
            class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
            <ButtonWithIcon variant="flat" height="40" rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_1_icon" color="white" :label="t('common.delete')" @click="handleBulkDelete" />
            <div class="w-px bg-gray-200"></div>
            <ButtonWithIcon variant="flat" height="40" rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_2_icon" color="white" :label="t('common.deleteAll')" @click="handleBulkDelete" />
          </div>

          <div class="flex flex-wrap gap-3">
            <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <ButtonWithIcon v-bind="menuProps" variant="outlined" append-icon="mdi-chevron-down"
                  rounded="4" color="gray-500" height="40"
                  custom-class="font-semibold text-base border-gray-400" :prepend-icon="columnIcon"
                  :label="t('common.columns')">
                  <template #append>
                    <v-icon>mdi-chevron-down</v-icon>
                  </template>
                </ButtonWithIcon>
              </template>
              <v-list>
                <v-list-item v-for="header in allHeaders" :key="header.key" @click="handleToggleHeader(header.key)">
                  <template #prepend>
                    <v-checkbox-btn :model-value="headerCheckStates[header.key]"
                      :disabled="updatingHeaders"
                      @click.stop="handleToggleHeader(header.key)" />
                  </template>
                  <v-list-item-title>{{ header.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
              :prepend-icon="searchIcon" :label="t('common.advancedSearch')" @click="toggleAdvancedFilters" />

            <ButtonWithIcon v-if="canCreate" variant="flat" color="primary-100" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
              :prepend-icon="plusIcon" label="أضف طلبية" @click="openCreateRequest" />
          </div>
        </div>

        <div v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
          <div class="flex flex-wrap gap-3 items-end">
            <TextInput v-model="filterCode" density="comfortable" variant="outlined" hide-details
              placeholder="كود الطلبية" class="w-full sm:w-40 bg-white" />
            <TextInput v-model="filterSupplierName" density="comfortable" variant="outlined" hide-details
              placeholder="اسم المورد" class="w-full sm:w-40 bg-white" />
            <TextInput v-model="filterLocation" density="comfortable" variant="outlined" hide-details
              placeholder="موقع المشروع" class="w-full sm:w-40 bg-white" />
            <DatePickerInput v-model="filterDateFrom" density="comfortable" hide-details
              placeholder="تاريخ الطلبية" class="w-full sm:w-40 bg-white" />
          </div>
          <div class="flex gap-2 items-center">
            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
              custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
              :prepend-icon="searchIcon" label="ابحث" @click="applyFilters" />
            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
              custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
              prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />
          </div>
        </div>

        <DataTable :headers="tableHeaders" :items="tableItemsWithId" :loading="loading"
          :show-checkbox="canBulkDelete" show-actions @edit="handleEdit" @delete="handleDelete"
          @view="handleView" @select="handleSelectRequest" @selectAll="handleSelectAllRequests"
          enable-infinite-scroll :has-more="hasMoreData" :loading-more="loadingMore" @load-more="handleLoadMore">
          <template #item.po_datetime="{ item }">
            {{ formatPoDatetime(item.po_datetime) }}
          </template>
          <template #item.upfront_payment="{ item }">
            {{ item.upfront_payment ?? '—' }}
          </template>
          <template #item.status="{ item }">
            <span
              :class="['inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap', (!getStatusStyle(item as Record<string, unknown>)) ? getStatusClass(String(item.status)) : '']"
              :style="getStatusStyle(item as Record<string, unknown>) ?? undefined">
              {{ item.status }}
            </span>
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center">
              <v-btn v-if="item.actions?.can_change_status" icon variant="text" size="x-small"
                color="warning-600" @click="openChangeStatusDialog(item)">
                <span v-html="switchHorisinralIcon"></span>
              </v-btn>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <StatusChangeFeature
      v-model="showChangeStatusDialog"
      :item="itemToChangeStatus"
      :change-status-url="`/purchases/orders/logistics/${itemToChangeStatus?.uuid}/change-status`"
      @success="fetchList"
    />

    <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف الطلبية"
      message="هل أنت متأكد من حذف هذه الطلبية؟" @confirm="confirmDelete" />

    <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading" title="حذف الطلبيات"
      :message="`هل أنت متأكد من حذف ${selectedRequests.length} طلبية؟`" @confirm="confirmBulkDelete" />
  </default-layout>
</template>

<style scoped></style>
