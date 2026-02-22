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
import { switchHorisinralIcon, refreshIcon } from '@/components/icons/priceOffersIcons';
import StatusChangeFeature from '@/components/common/StatusChangeFeature.vue';

const { t } = useI18n();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const TABLE_NAME = 'admin_sale_logistic_quotations';
const {
  allHeaders,
  shownHeaders,
  updatingHeaders,
  showHeadersMenu,
  headerCheckStates,
  initHeaders,
  toggleHeader,
} = useTableColumns(TABLE_NAME);

interface ItemActions {
  can_update: boolean;
  can_delete: boolean;
  can_view: boolean;
  can_change_status: boolean;
  can_create_order: boolean;
}

interface QuotationItem {
  id: number;
  uuid: string;
  customer_name: string;
  quotation_name: string;
  code: string;
  quotations_datetime: string;
  target_location: string;
  status: string;
  quotation_validity_no: number;
  payment_method: string;
  final_total: string;
  status_id: number;
  actions: ItemActions;
}

interface TableHeader {
  key: string;
  title: string;
}

interface ListResponse {
  data: QuotationItem[];
  pagination: { next_cursor: string | null; previous_cursor: string | null; per_page: number };
  header_table: string;
  headers: TableHeader[];
  shownHeaders: TableHeader[];
  actions: { can_create: boolean; can_bulk_delete: boolean };
}

const tableItems = ref<QuotationItem[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(false);
const loading = ref(false);

const tableHeaders = computed(() =>
  shownHeaders.value.map((h) => ({ key: h.key, title: h.title, width: '140px' }))
);

const tableItemsWithId = computed(() =>
  tableItems.value.map((item) => ({ ...item, id: item.uuid }))
);

const selectedRequests = ref<string[]>([]);
const hasSelectedRequests = computed(() => selectedRequests.value.length > 0);

const showAdvancedFilters = ref(false);
const filterRequestNumber = ref("");
const filterNameArabic = ref<string | null>(null);
const filterNameEnglish = ref("");
const filterStartDateMin = ref("");
const filterStartDateMax = ref("");

const showBulkDeleteDialog = ref(false);
const showDeleteDialog = ref(false);
const itemToDelete = ref<QuotationItem | null>(null);
const deleteLoading = ref(false);

const showChangeStatusDialog = ref(false);
const itemToChangeStatus = ref<QuotationItem | null>(null);

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
  filterRequestNumber.value = "";
  filterNameArabic.value = null;
  filterNameEnglish.value = "";
  filterStartDateMin.value = "";
  filterStartDateMax.value = "";
};

const applyFilters = () => {
  fetchList();
};

const fetchList = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filterRequestNumber.value) params.append('code', filterRequestNumber.value);
    if (filterNameEnglish.value) params.append('customer_name', filterNameEnglish.value);
    if (filterStartDateMin.value) params.append('quotations_datetime_from', filterStartDateMin.value);
    if (filterStartDateMax.value) params.append('quotations_datetime_to', filterStartDateMax.value);

    const url = params.toString()
      ? `/sales/quotations/logistics?${params.toString()}`
      : '/sales/quotations/logistics';
    const body = (await api.get(url)) as unknown as ListResponse;

    tableItems.value = Array.isArray(body?.data) ? body.data : [];
    canCreate.value = body?.actions?.can_create ?? false;
    canBulkDelete.value = body?.actions?.can_bulk_delete ?? false;
    initHeaders(body?.headers ?? [], body?.shownHeaders ?? []);
  } catch (err: any) {
    console.error('Error fetching quotations list:', err);
    error(err?.response?.data?.message || 'فشل تحميل قائمة عروض السعر');
  } finally {
    loading.value = false;
  }
};

const handleToggleHeader = async (headerKey: string) => {
  await toggleHeader(headerKey).catch((err: any) => {
    error(err?.response?.data?.message || 'فشل تحديث الأعمدة');
  });
};

const handleView = (item: { id?: string | number; uuid?: string }) => {
  const uuid = item.uuid ?? String(item.id);
  router.push({ name: 'SalesQuotationsLogisticsView', params: { id: uuid } });
};

const handleEdit = (item: { id?: string | number; uuid?: string }) => {
  const uuid = item.uuid ?? String(item.id);
  router.push({ name: 'SalesQuotationsLogisticsEdit', params: { id: uuid } });
};

const handleDelete = (item: any) => {
  itemToDelete.value = item as QuotationItem;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  const uuid = itemToDelete.value.uuid;
  try {
    deleteLoading.value = true;
    await api.delete(`/sales/quotations/logistics/${uuid}`);
    success('تم حذف عرض السعر بنجاح');
    showDeleteDialog.value = false;
    itemToDelete.value = null;
    await fetchList();
  } catch (err: any) {
    console.error('Error deleting quotation:', err);
    error(err?.response?.data?.message || 'فشل حذف عرض السعر');
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

const openChangeStatusDialog = (item: QuotationItem | Record<string, unknown>) => {
  itemToChangeStatus.value = item as QuotationItem;
  showChangeStatusDialog.value = true;
};

const openCreateQuotation = () => {
  router.push({ name: 'SalesQuotationsLogisticsCreate' });
};

const handleCreateOrder = (item: unknown) => {
  const tableItem = item as QuotationItem & { id: string | number };
  // Find original item from tableItems to get the numeric id
  const originalItem = tableItems.value.find((q) => q.uuid === tableItem.uuid);
  const numericId = originalItem?.id;
  
  router.push({ 
    name: 'SalesOrdersLogisticsCreate',
    query: { 
      from_quotation: tableItem.uuid,
      quotation_code: tableItem.code,
      sale_quotation_id: numericId ? String(numericId) : undefined
    }
  });
};

const handleBulkDelete = () => {
  if (selectedRequests.value.length === 0) return;
  showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  try {
    deleteLoading.value = true;
    await api.post('/sales/quotations/logistics/bulk-delete', {
      ids: selectedRequests.value,
    });
    success(`تم حذف ${selectedRequests.value.length} عرض بنجاح`);
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
      <PageHeader :icon="GridIcon" title-key="pages.SalesQuotationsLogistics.title"
        description-key="pages.SalesQuotationsLogistics.description" />

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
              :prepend-icon="plusIcon" label="أضف عرض سعر" @click="openCreateQuotation" />
          </div>
        </div>

        <div v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
          <div class="flex flex-wrap gap-3 items-end">
            <TextInput v-model="filterRequestNumber" density="comfortable" variant="outlined" hide-details
              placeholder="كود العرض" class="w-full sm:w-40 bg-white" />
            <TextInput v-model="filterNameEnglish" density="comfortable" variant="outlined" hide-details
              placeholder="اسم العميل" class="w-full sm:w-40 bg-white" />
            <TextInput v-model="filterNameArabic" density="comfortable" variant="outlined" hide-details
              placeholder="السعر" class="w-full sm:w-40 bg-white" />
            <DatePickerInput v-model="filterStartDateMin" density="comfortable" hide-details placeholder="تاريخ العرض"
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

        <DataTable :headers="tableHeaders" :items="tableItemsWithId" :loading="loading" :show-checkbox="canBulkDelete"
          show-actions @edit="handleEdit" @delete="handleDelete" @view="handleView" @select="handleSelectRequest"
          @selectAll="handleSelectAllRequests">
          <template #item.transport_start_date="{ item }">
            {{ item.transport_start_date ? new Date(item.transport_start_date).toLocaleDateString('en-US') : '—' }}
          </template>
          <template #item.quotations_datetime="{ item }">
            {{ item.quotations_datetime || '—' }}
          </template>

          <template #item.final_total="{ item }">
            {{ item.final_total ?? '—' }}
          </template>
          <template #item.status="{ item }">
            <span
              :class="['inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap', getStatusClass(item.status)]">
              {{ item.status }}
            </span>
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center gap-1">
              <v-btn v-if="item.actions?.can_create_order" icon variant="text" size="small"
                @click="handleCreateOrder(item)">
                <span v-html="refreshIcon"></span>
              </v-btn>
              <v-btn v-if="item.actions?.can_change_status" icon variant="text" size="small" color="warning-600"
                @click="openChangeStatusDialog(item)">
                <span v-html="switchHorisinralIcon"></span>
              </v-btn>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Status Change Dialog -->
    <StatusChangeFeature v-model="showChangeStatusDialog" :item="itemToChangeStatus"
      :change-status-url="`/sales/quotations/logistics/${itemToChangeStatus?.uuid}/change-status`"
      @success="fetchList" />

    <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف عرض السعر"
      message="هل أنت متأكد من حذف هذا العرض؟" @confirm="confirmDelete" />

    <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading" title="حذف عروض السعر"
      :message="`هل أنت متأكد من حذف ${selectedRequests.length} عرض؟`" @confirm="confirmBulkDelete" />
  </default-layout>
</template>
