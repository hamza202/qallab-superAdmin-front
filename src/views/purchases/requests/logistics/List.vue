<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';
import { useNotification } from '@/composables/useNotification';
import { useTableColumns } from '@/composables/useTableColumns';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog.vue';
import StatusChangeFeature from '@/components/common/StatusChangeFeature.vue';
import { switcStatusIcon } from '@/components/icons/priceOffersIcons';
import { useAppStore } from "@/stores/app";
import { columnIcon, exportIcon, GridIcon, importIcon, plusIcon, searchIcon, trash_1_icon, trash_2_icon } from "@/components/icons/globalIcons";

const appStore = useAppStore();

const { t } = useI18n();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const TABLE_NAME = 'admin_purchases_logistics';
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
  can_change_status: boolean;
}

interface LogisticsRequest {
  uuid: string;
  supplier_name: string;
  request_type: string;
  code: string;
  target_location: string;
  request_datetime: string;
  payment_method: string;
  upfront_payment: number;
  status: string;
  status_id: number;
  actions: ItemActions;
}

interface TableHeader {
  key: string;
  title: string;
}

interface ListResponse {
  data: LogisticsRequest[];
  pagination: { next_cursor: string | null; previous_cursor: string | null; per_page: number };
  header_table: string;
  headers: TableHeader[];
  shownHeaders: TableHeader[];
  actions: { can_create: boolean; can_bulk_delete: boolean };
}

// API state
const tableItems = ref<LogisticsRequest[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(false);
const loading = ref(false);
const loadingMore = ref(false);

// Cursor pagination
const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);

// Table headers for DataTable (from shownHeaders)
const tableHeaders = computed(() =>
  shownHeaders.value.map((h) => ({ key: h.key, title: h.title, width: '140px' }))
);
const refreshIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.1667 17.6667C10.1667 17.6667 10.8744 17.5656 13.8033 14.6366C16.7322 11.7077 16.7322 6.95897 13.8033 4.03003C12.7656 2.9923 11.4994 2.32224 10.1667 2.01986M10.1667 17.6667H15.1667M10.1667 17.6667L10.1667 12.6667M6.83333 1.00016C6.83333 1.00016 6.12563 1.10126 3.1967 4.0302C0.267767 6.95913 0.267767 11.7079 3.1967 14.6368C4.23443 15.6745 5.5006 16.3446 6.83333 16.647M6.83333 1.00016L1.83333 1M6.83333 1.00016L6.83333 6" stroke="#175CD3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
// Selection (we use uuid as id for rows)
const selectedRequests = ref<string[]>([]);
const hasSelectedRequests = computed(() => selectedRequests.value.length > 0);

// Items with id for DataTable (id = uuid for selection)
const tableItemsWithId = computed(() =>
  tableItems.value.map((item) => ({ ...item, id: item.uuid }))
);

// Filters
const showAdvancedFilters = ref(false);
const filterRequestNumber = ref('');
const filterNameArabic = ref<string | null>(null);
const filterNameEnglish = ref('');
const filterStartDateMin = ref('');
const filterStartDateMax = ref('');

// Delete dialogs
const showBulkDeleteDialog = ref(false);
const deleteLoading = ref(false);

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
  filterRequestNumber.value = '';
  filterNameArabic.value = null;
  filterNameEnglish.value = '';
  filterStartDateMin.value = '';
  filterStartDateMax.value = '';
};

const applyFilters = () => {
  fetchList();
};

// API: fetch list
const fetchList = async (cursor?: string | null, append = false) => {
  try {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }

    const params = new URLSearchParams();
    params.append('per_page', String(perPage.value));
    if (cursor) params.append('cursor', cursor);
    if (filterRequestNumber.value) params.append('code', filterRequestNumber.value);
    if (filterNameEnglish.value) params.append('supplier_name', filterNameEnglish.value);
    if (filterStartDateMin.value) params.append('request_datetime_from', filterStartDateMin.value);
    if (filterStartDateMax.value) params.append('request_datetime_to', filterStartDateMax.value);

    const url = `/purchases/logistics?${params.toString()}`;
    const res = await api.get<ListResponse>(url);

    if (append) {
      tableItems.value = [...tableItems.value, ...res.data];
    } else {
      tableItems.value = res.data || [];
      canCreate.value = res.actions?.can_create ?? false;
      canBulkDelete.value = res.actions?.can_bulk_delete ?? false;
      initHeaders(res.headers || [], res.shownHeaders || []);
    }

    nextCursor.value = res.pagination?.next_cursor || null;
    previousCursor.value = res.pagination?.previous_cursor || null;
    perPage.value = res.pagination?.per_page || 15;
  } catch (err: any) {
    console.error('Error fetching logistics list:', err);
    error(err?.response?.data?.message || 'فشل تحميل قائمة الطلبات');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = () => {
  if (hasMoreData.value && !loadingMore.value) {
    fetchList(nextCursor.value, true);
  }
};

// Toggle column and persist
const handleToggleHeader = async (headerKey: string) => {
  await toggleHeader(headerKey).catch((err: any) => {
    error(err?.response?.data?.message || 'فشل تحديث الأعمدة');
  });
};

// Handlers
const handleEdit = (item: { id?: string | number; uuid?: string }) => {
  const id = item.uuid ?? String(item.id);
  router.push({
    name: 'PurchasesLogisticsEdit',
    params: { id },
  });
};

const confirmDelete = async (item: { id?: string | number }) => {
  try {
    deleteLoading.value = true;
    await api.delete(`/purchases/logistics/${String(item.id)}`);
    success('تم حذف الطلب بنجاح');
    await fetchList();
  } catch (err: any) {
    console.error('Error deleting request:', err);
    error(err?.response?.data?.message || 'فشل حذف الطلب');
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

const getStatusClass = (status: string) => {
  switch (status) {
    case 'مكتمل':
      return 'bg-[#ECFDF3] text-[#027A48]';
    case 'قيد المراجعة':
      return 'bg-[#FEF0C7] text-[#DC6803]';
    case 'تأكيد':
      return 'bg-[#F2F4F7] text-[#344054]';
    case 'الغاء':
      return 'bg-[#FEE4E2] text-[#D92D20]';
    case 'مسودة':
      return 'bg-[#F2F4F7] text-[#344054]';
    default:
      return 'bg-[#F2F4F7] text-[#344054]';
  }
};

const openCreateRequest = () => {
  router.push({ name: 'PurchasesLogisticsCreate' });
};

const handleBulkDelete = () => {
  if (selectedRequests.value.length === 0) return;
  showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  try {
    deleteLoading.value = true;
    await api.post('/purchases/logistics/bulk-delete', {
      ids: selectedRequests.value,
    });
    success(`تم حذف ${selectedRequests.value.length} طلب بنجاح`);
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

// Status change (can_change_status)
const showChangeStatusDialog = ref(false);
const itemToChangeStatus = ref<LogisticsRequest | null>(null);

const openChangeStatusDialog = (item: LogisticsRequest | Record<string, unknown>) => {
  itemToChangeStatus.value = item as LogisticsRequest;
  showChangeStatusDialog.value = true;
};


const handleView = (item: any) => {
  router.push({ name: "PurchasesLogisticsView", params: { id: item.uuid } });
};

// Infinite scroll setup
const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

const setupInfiniteScroll = () => {
  if (!loadMoreTrigger.value) return;

  observer.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMoreData.value && !loadingMore.value && !loading.value) {
        loadMore();
      }
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    }
  );

  observer.value.observe(loadMoreTrigger.value);
};

const cleanupInfiniteScroll = () => {
  if (observer.value && loadMoreTrigger.value) {
    observer.value.unobserve(loadMoreTrigger.value);
    observer.value.disconnect();
  }
};



onMounted(async () => {
  await fetchList();
  nextTick(() => {
    setupInfiniteScroll();
  });
});

onBeforeUnmount(() => {
  cleanupInfiniteScroll();
});
onMounted(() => {
  fetchList();
});
</script>

<template>
  <default-layout>
    <div class="pricesOffers-page">
      <PageHeader :icon="GridIcon" title-key="pages.purchasesLogistics.title"
        description-key="pages.purchasesLogistics.description" />

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
          <!-- Actions when rows are selected (only if can_bulk_delete) -->
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

          <!-- Main header controls -->
          <div class="flex flex-wrap gap-3">
            <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <ButtonWithIcon v-bind="menuProps" variant="outlined" append-icon="mdi-chevron-down" rounded="4"
                  color="gray-500" height="40" custom-class="font-semibold text-base border-gray-400"
                  :prepend-icon="columnIcon" :label="t('common.columns')" />
              </template>
              <v-list>
                <v-list-item v-for="header in allHeaders" :key="header.key" @click="handleToggleHeader(header.key)">
                  <template #prepend>
                    <v-checkbox-btn :model-value="headerCheckStates[header.key]" :disabled="updatingHeaders"
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
              :prepend-icon="plusIcon" label="أضف طلب" @click="openCreateRequest" />
          </div>
        </div>

        <!-- Advanced filters row -->
        <div v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
          <div class="flex flex-wrap gap-3 items-end">
            <TextInput v-model="filterRequestNumber" density="comfortable" variant="outlined" hide-details
              placeholder="كود الطلب" class="w-full sm:w-40 bg-white" />
            <TextInput v-model="filterNameEnglish" density="comfortable" variant="outlined" hide-details
              placeholder="اسم المورد" class="w-full sm:w-40 bg-white" />
            <TextInput v-model="filterNameArabic" density="comfortable" variant="outlined" hide-details
              placeholder="دفعة مقدمة" class="w-full sm:w-40 bg-white" />
            <SelectInput :items="['الموقع', 'الموقع']" v-model="filterNameArabic" density="comfortable"
              variant="outlined" hide-details placeholder="موقع المشروع" class="w-full sm:w-40 bg-white" />
            <DatePickerInput v-model="filterStartDateMin" density="comfortable" hide-details placeholder="تاريخ الطلب"
              class="w-full sm:w-40 bg-white" />
          </div>
          <div class="flex gap-2 items-center">
            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
              custom-class="px-5 font-semibold !text-white text-sm sm:text-base" :prepend-icon="searchIcon" label="ابحث"
              @click="applyFilters" />
            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
              custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
              prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />
          </div>
        </div>

        <!-- Table -->
        <DataTable :headers="tableHeaders" :items="tableItemsWithId" :loading="loading" :show-checkbox="canBulkDelete"
          show-actions @view="handleView" @edit="handleEdit" @delete="confirmDelete" @select="handleSelectRequest"
          @selectAll="handleSelectAllRequests">
          <template #item.am_pm_intervals="{ item }">
            <span class="text-sm text-gray-600">{{ item.am_pm_intervals.join(',') }}</span>
          </template>
          <template #item.from_dates="{ item }">
            <span class="text-sm text-gray-600">
              {{
                appStore.formatDate(item.from_dates, {
                  format:
                    'short'
                }) }}
            </span>
          </template>
          <template #item.source_locations="{ item }">
            <span class="text-sm text-gray-600">{{ item.source_locations.join(',') }}</span>
          </template>
          <template #item.target_locations="{ item }">
            <span class="text-sm text-gray-600">{{ item.target_locations.join(',') }}</span>
          </template>
          <template #item.to_dates="{ item }">

            <span class="text-sm text-gray-600">
              {{ appStore.formatDate(item.to_dates, {
                format:
                  'short'
              }) }}
            </span>
          </template>
          <template #item.status="{ item }">
            <span :class="[
              'inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap',
              getStatusClass(item.status),
            ]">
              {{ item.status }}
            </span>
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center">
              <v-btn v-if="item.actions?.can_change_status" icon variant="text" size="small"
                @click="openChangeStatusDialog(item)">
                <span v-html="switcStatusIcon"></span>
              </v-btn>
            </div>
          </template>
        </DataTable>

        <!-- Infinite Scroll Trigger -->
        <div ref="loadMoreTrigger" class="h-10 flex items-center justify-center">
          <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Dialog -->
    <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading" title="حذف الطلبات"
      :message="`هل أنت متأكد من حذف ${selectedRequests.length} طلب؟`" @confirm="confirmBulkDelete" />

    <StatusChangeFeature v-model="showChangeStatusDialog" :item="itemToChangeStatus"
      :change-status-url="`/purchases/logistics/${itemToChangeStatus?.uuid}/change-status`" title="تغيير الحالة"
      message="تغيير الحالة:" @success="fetchList" />
  </default-layout>
</template>

<style scoped></style>
