<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';
import { useNotification } from '@/composables/useNotification';
import { useTableColumns } from '@/composables/useTableColumns';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog.vue';
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import { GridIcon, trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, plusIcon, searchIcon } from '@/components/icons/globalIcons';
import { switchHorisinralIcon } from '@/components/icons/priceOffersIcons';
import StatusChangeFeature from '@/components/common/StatusChangeFeature.vue';

const { t } = useI18n();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const TABLE_NAME = 'admin_purchases_fuels';
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

interface BuildingMaterialRequest {
  uuid: string;
  id?: string | number;
  doc_id?: string | number;
  supplier_name: string;
  request_type: string;
  code: string;
  target_location: string;
  request_datetime: string;
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
  data: BuildingMaterialRequest[];
  pagination: { next_cursor: string | null; previous_cursor: string | null; per_page: number };
  header_table: string;
  headers: TableHeader[];
  shownHeaders: TableHeader[];
  actions: { can_create: boolean; can_bulk_delete: boolean };
}

// API state
const tableItems = ref<BuildingMaterialRequest[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(false);
const loading = ref(false);

// Table headers for DataTable (from shownHeaders)
const tableHeaders = computed(() =>
  shownHeaders.value.map((h) => ({ key: h.key, title: h.title, width: '140px' }))
);

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

// Delete dialog (single shared dialog for both single and bulk)
const showDeleteDialog = ref(false);
const showBulkDeleteDialog = ref(false);
const itemToDelete = ref<BuildingMaterialRequest | null>(null);
const deleteLoading = ref(false);

// Status change dialog
const showChangeStatusDialog = ref(false);
const itemToChangeStatus = ref<BuildingMaterialRequest | null>(null);

const isDeleteDialogOpen = computed({
  get: () => showDeleteDialog.value || showBulkDeleteDialog.value,
  set: (v: boolean) => {
    if (!v) {
      showDeleteDialog.value = false;
      showBulkDeleteDialog.value = false;
      itemToDelete.value = null;
    }
  },
});
const deleteDialogTitle = computed(() =>
  showBulkDeleteDialog.value ? 'حذف الطلبات' : 'حذف الطلب'
);
const deleteDialogMessage = computed(() =>
  showBulkDeleteDialog.value
    ? `هل أنت متأكد من حذف ${selectedRequests.value.length} طلب؟`
    : 'هل أنت متأكد من حذف هذا الطلب؟'
);
const onDeleteConfirm = () => {
  if (showBulkDeleteDialog.value) confirmBulkDelete();
  else confirmDelete();
};

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
const fetchList = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filterRequestNumber.value) params.append('code', filterRequestNumber.value);
    if (filterNameEnglish.value) params.append('supplier_name', filterNameEnglish.value);
    if (filterStartDateMin.value) params.append('request_datetime_from', filterStartDateMin.value);
    if (filterStartDateMax.value) params.append('request_datetime_to', filterStartDateMax.value);

    const url = params.toString()
      ? `/sales/orders/fuels?${params.toString()}`
      : '/sales/orders/fuels';
    const res = await api.get<ListResponse>(url);

    tableItems.value = res.data || [];
    canCreate.value = res.actions?.can_create ?? false;
    canBulkDelete.value = res.actions?.can_bulk_delete ?? false;
    initHeaders(res.headers || [], res.shownHeaders || []);
  } catch (err: any) {
    console.error('Error fetching building materials list:', err);
    error(err?.response?.data?.message || 'فشل تحميل قائمة الطلبات');
  } finally {
    loading.value = false;
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
    name: 'SalesOrdersFuelsEdit',
    params: { id },
  });
};

const handleDelete = (item: { uuid?: string; id?: string | number } & Partial<BuildingMaterialRequest>) => {
  itemToDelete.value = item as BuildingMaterialRequest;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  const uuid = itemToDelete.value.uuid;
  showDeleteDialog.value = false;
  itemToDelete.value = null;
  try {
    deleteLoading.value = true;
    await api.delete(`/sales/orders/fuels/${uuid}`);
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

/** Fallback status classes when API does not return status colors */
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

/** Use status color from list API when present */
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
  router.push({ name: 'SalesOrdersFuelsCreate' });
};

const handleView = (item: any) => {
    router.push({ name: "SalesOrdersFuelsView", params: { id: item.uuid } });
};



const openChangeStatusDialog = (item: BuildingMaterialRequest | Record<string, unknown>) => {
  itemToChangeStatus.value = item as BuildingMaterialRequest;
  showChangeStatusDialog.value = true;
};

const handleBulkDelete = () => {
  if (selectedRequests.value.length === 0) return;
  showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  try {
    deleteLoading.value = true;
    await api.post('/sales/orders/fuels/bulk-delete', {
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

onMounted(() => {
  fetchList();
});
</script>

<template>
  <default-layout>
    <div class="pricesOffers-page">
      <PageHeader
        :icon="GridIcon"
        title-key="pages.SalesOrdersFuels.title"
        description-key="pages.SalesOrdersFuels.description"
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
          :class="hasSelectedRequests ? 'justify-between' : 'justify-end'"
          class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3"
        >
          <!-- Actions when rows are selected (only if can_bulk_delete) -->
          <div
            v-if="canBulkDelete && hasSelectedRequests"
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
              label="أضف طلب"
              @click="openCreateRequest"
            />
          </div>
        </div>

        <!-- Advanced filters row -->
        <div
          v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap"
        >
          <div class="flex flex-wrap gap-3 items-end">
            <TextInput
              v-model="filterRequestNumber"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="كود الطلب"
              class="w-full sm:w-40 bg-white"
            />
            <TextInput
              v-model="filterNameEnglish"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="اسم المورد"
              class="w-full sm:w-40 bg-white"
            />
            <TextInput
              v-model="filterNameArabic"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="دفعة مقدمة"
              class="w-full sm:w-40 bg-white"
            />
            <SelectInput
              :items="['الموقع', 'الموقع']"
              v-model="filterNameArabic"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="موقع المشروع"
              class="w-full sm:w-40 bg-white"
            />
            <DatePickerInput
              v-model="filterStartDateMin"
              density="comfortable"
              hide-details
              placeholder="تاريخ الطلب"
              class="w-full sm:w-40 bg-white"
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
          @delete="handleDelete"
          @select="handleSelectRequest"
          @selectAll="handleSelectAllRequests"
        >
          <template #item.status="{ item }">
            <span
              :class="[
                'inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                !getStatusStyle(item) ? getStatusClass(item.status) : '',
              ]"
              :style="getStatusStyle(item) ?? undefined"
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
                size="x-small"
                color="warning-600"
                @click="openChangeStatusDialog(item)"
              >
                <span v-html="switchHorisinralIcon"></span>
              </v-btn>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Single shared delete confirmation (single item or bulk) -->
    <DeleteConfirmDialog
      v-model="isDeleteDialogOpen"
      :loading="deleteLoading"
      :title="deleteDialogTitle"
      :message="deleteDialogMessage"
      @confirm="onDeleteConfirm"
    />

    <!-- Status Change Dialog -->
    <StatusChangeFeature
      v-model="showChangeStatusDialog"
      :item="itemToChangeStatus"
      :change-status-url="`/sales/orders/fuels/${itemToChangeStatus?.uuid}/change-status`"
      @success="fetchList"
    />
  </default-layout>
</template>

<style scoped></style>
