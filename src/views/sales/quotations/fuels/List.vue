<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';
import { useNotification } from '@/composables/useNotification';
import { useTableColumns } from '@/composables/useTableColumns';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog.vue';
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import { GridIcon, trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, plusIcon, searchIcon, printerIcon } from "@/components/icons/globalIcons";
import { switchHorisinralIcon, refreshIcon, downloadIcon } from '@/components/icons/priceOffersIcons';
import StatusChangeFeature from '@/components/common/StatusChangeFeature.vue';

const { t } = useI18n();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const tableName = ref('');
const {
  allHeaders,
  shownHeaders,
  updatingHeaders,
  showHeadersMenu,
  headerCheckStates,
  initHeaders,
  toggleHeader,
} = useTableColumns(tableName);

interface ItemActions {
  can_update: boolean;
  can_delete: boolean;
  can_view: boolean;
  can_change_status: boolean;
  can_create_order: boolean;
  can_details_pdf?: boolean;
  can_download_pdf?: boolean;
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

interface QuotationPdfMetaResponse {
  data?: {
    url?: string;
    pdf_path?: string;
    pdf_generated_at?: string;
  };
  message?: string;
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

const downloadingPdfUuid = ref<string | null>(null);

const triggerPdfDownloadFromSignedUrl = async (signedUrl: string, filename: string) => {
  try {
    const res = await fetch(signedUrl, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error('bad status');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(signedUrl, '_blank', 'noopener,noreferrer');
  }
};

const handlePrint = (item: { id?: string | number; uuid?: string }) => {
  const uuid = item.uuid ?? String(item.id);
  const routeData = router.resolve({ name: 'SalesQuotationsFuelsPrint', params: { id: uuid } });
  const printUrl = routeData.href.startsWith('/') ? `${window.location.origin}${routeData.href}` : routeData.href;

  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;top:0;left:-9999px;width:210mm;height:297mm;border:none;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  const onMessage = (e: MessageEvent) => {
    if (
      e.data?.type === 'quotation-fuels-print-ready' &&
      e.source === iframe.contentWindow &&
      iframe.contentWindow
    ) {
      window.removeEventListener('message', onMessage);
      iframe.contentWindow.print();
      setTimeout(() => {
        if (iframe.parentNode) document.body.removeChild(iframe);
      }, 1000);
    }
  };
  window.addEventListener('message', onMessage);
  iframe.src = printUrl;
};

const handleDownloadPdf = async (item: { id?: string | number; uuid?: string }) => {
  const uuid = String(item.uuid ?? item.id ?? '');
  if (!uuid) return;
  downloadingPdfUuid.value = uuid;
  try {
    const body = (await api.get(
      `/sales/quotations/fuels/${uuid}/pdf`
    )) as QuotationPdfMetaResponse;
    const signedUrl = body?.data?.url;
    if (!signedUrl) {
      error(t('sales.quotationsFuels.messages.pdfDownloadNoUrl'));
      return;
    }
    const pathName = body.data?.pdf_path?.split('/').pop();
    const filename = pathName && pathName.endsWith('.pdf') ? pathName : `quotation-${uuid}.pdf`;
    await triggerPdfDownloadFromSignedUrl(signedUrl, filename);
  } catch (err: any) {
    console.error('Error downloading quotation PDF:', err);
    error(err?.response?.data?.message || t('sales.quotationsFuels.messages.pdfDownloadError'));
  } finally {
    downloadingPdfUuid.value = null;
  }
};

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
      ? `/sales/quotations/fuels?${params.toString()}`
      : '/sales/quotations/fuels';
    const body = (await api.get(url)) as unknown as ListResponse;

    tableItems.value = Array.isArray(body?.data) ? body.data : [];
    canCreate.value = body?.actions?.can_create ?? false;
    canBulkDelete.value = body?.actions?.can_bulk_delete ?? false;
    if (body?.header_table) {
      tableName.value = body.header_table;
    }
    initHeaders(body?.headers ?? [], body?.shownHeaders ?? []);
  } catch (err: any) {
    console.error('Error fetching quotations list:', err);
    error(err?.response?.data?.message || t('sales.quotationsFuels.messages.loadListError'));
  } finally {
    loading.value = false;
  }
};

const handleToggleHeader = async (headerKey: string) => {
  await toggleHeader(headerKey).catch((err: any) => {
    error(err?.response?.data?.message || t('sales.quotationsFuels.messages.columnsUpdateError'));
  });
};

const handleView = (item: { id?: string | number; uuid?: string }) => {
  const uuid = item.uuid ?? String(item.id);
  router.push({ name: 'SalesQuotationsFuelsView', params: { id: uuid } });
};

const handleEdit = (item: { id?: string | number; uuid?: string }) => {
  const uuid = item.uuid ?? String(item.id);
  router.push({ name: 'SalesQuotationsFuelsEdit', params: { id: uuid } });
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
    await api.delete(`/sales/quotations/fuels/${uuid}`);
    success(t('sales.quotationsFuels.messages.deleteSuccess'));
    showDeleteDialog.value = false;
    itemToDelete.value = null;
    await fetchList();
  } catch (err: any) {
    console.error('Error deleting quotation:', err);
    error(err?.response?.data?.message || t('sales.quotationsFuels.messages.deleteError'));
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
  router.push({ name: 'SalesQuotationsFuelsCreate' });
};

const handleCreateOrder = (item: unknown) => {
  const tableItem = item as QuotationItem & { id: string | number };
  const originalItem = tableItems.value.find((q) => q.uuid === tableItem.uuid);
  const numericId = originalItem?.id;
  
  router.push({ 
    name: 'SalesOrdersFuelsCreate',
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
    await api.post('/sales/quotations/fuels/bulk-delete', {
      ids: selectedRequests.value,
    });
    success(t('sales.quotationsFuels.messages.bulkDeleteSuccess', { count: selectedRequests.value.length }));
    selectedRequests.value = [];
    await fetchList();
  } catch (err: any) {
    console.error('Error bulk deleting:', err);
    error(err?.response?.data?.message || t('sales.quotationsFuels.messages.bulkDeleteError'));
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
      <PageHeader :icon="GridIcon" title-key="sales.quotationsFuels.list.title"
        description-key="sales.quotationsFuels.list.description" />

      <div
        class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
        <ButtonWithIcon variant="flat" height="40" rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-100 !text-primary-900"
          :prepend-icon="importIcon" :label="t('common.action.import')" />
        <ButtonWithIcon variant="flat" height="40" rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
          :prepend-icon="exportIcon" :label="t('common.action.export')" />
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div :class="hasSelectedRequests ? 'justify-between' : 'justify-end'"
          class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
          <div v-if="canBulkDelete && hasSelectedRequests"
            class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
            <ButtonWithIcon variant="flat" height="40" rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_1_icon" color="white" :label="t('common.action.delete')" @click="handleBulkDelete" />
            <div class="w-px bg-gray-200"></div>
            <ButtonWithIcon variant="flat" height="40" rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_2_icon" color="white" :label="t('common.action.deleteAll')" @click="handleBulkDelete" />
          </div>

          <div class="flex flex-wrap gap-3">
            <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <ButtonWithIcon v-bind="menuProps" variant="outlined" append-icon="mdi-chevron-down" rounded="4"
                  color="gray-500" height="40" custom-class="font-semibold text-base border-gray-400"
                  :prepend-icon="columnIcon" :label="t('common.table.columns')" />
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
              :prepend-icon="searchIcon" :label="t('common.table.advancedSearch')" @click="toggleAdvancedFilters" />

            <ButtonWithIcon
              v-if="canCreate"
              variant="flat"
              color="primary-100"
              height="40"
              rounded="4"
              custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
              :prepend-icon="plusIcon"
              :label="t('sales.quotationsFuels.addQuotation')"
              @click="openCreateQuotation"
            />
          </div>
        </div>

        <div v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
          <div class="flex flex-wrap gap-3 items-end">
            <TextInput v-model="filterRequestNumber" density="comfortable" variant="outlined" hide-details
              :placeholder="t('sales.quotationsFuels.filters.quotationCode')" class="w-full sm:w-40 bg-white" />
            <TextInput v-model="filterNameEnglish" density="comfortable" variant="outlined" hide-details
              :placeholder="t('sales.quotationsFuels.filters.customerName')" class="w-full sm:w-40 bg-white" />
            <TextInput v-model="filterNameArabic" density="comfortable" variant="outlined" hide-details
              :placeholder="t('sales.quotationsFuels.filters.price')" class="w-full sm:w-40 bg-white" />
            <DatePickerInput v-model="filterStartDateMin" density="comfortable" hide-details
              :placeholder="t('sales.quotationsFuels.filters.quotationDate')" class="w-full sm:w-40 bg-white" />
          </div>
          <div class="flex gap-2 items-center">
            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
              custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
              :prepend-icon="searchIcon" :label="t('sales.quotationsFuels.search')" @click="applyFilters" />
            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
              custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
              prepend-icon="mdi-refresh" :label="t('common.actions.reset')" @click="resetFilters" />
          </div>
        </div>

        <DataTable :headers="tableHeaders" :items="tableItemsWithId" :loading="loading"
          :show-checkbox="canBulkDelete" show-actions
          @edit="handleEdit" @delete="handleDelete" @view="handleView"
          @select="handleSelectRequest" @selectAll="handleSelectAllRequests">
          <template #item.quotations_datetime="{ item }">
            {{ item.quotations_datetime ? new Date(item.quotations_datetime).toLocaleDateString('ar-SA') : '—' }}
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
              <v-btn
                v-if="item.actions?.can_details_pdf"
                icon variant="text" color="success-700" size="x-small"
                @click="handlePrint(item)">
                <span class="w-5" v-html="printerIcon"></span>
              </v-btn>
              <v-btn
                v-if="item.actions?.can_download_pdf"
                icon variant="text" color="success-700" size="x-small"
                :loading="downloadingPdfUuid === (item.uuid ?? item.id)"
                @click="handleDownloadPdf(item)">
                <span class="w-5" v-html="downloadIcon"></span>
              </v-btn>
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
    <StatusChangeFeature
      v-model="showChangeStatusDialog"
      :item="itemToChangeStatus"
      :change-status-url="`/sales/quotations/fuels/${itemToChangeStatus?.uuid}/change-status`"
      @success="fetchList"
    />

    <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading"
      :title="t('sales.quotationsFuels.delete.titleSingle')"
      :message="t('sales.quotationsFuels.delete.messageSingle')" @confirm="confirmDelete" />

    <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading"
      :title="t('sales.quotationsFuels.delete.titleBulk')"
      :message="t('sales.quotationsFuels.delete.messageBulk', { count: selectedRequests.length })"
      @confirm="confirmBulkDelete" />
  </default-layout>
</template>
