<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import TaxFormDialog from "@/views/settings/taxes/components/TaxFormDialog.vue";
import { useI18n } from 'vue-i18n'
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";

const { t } = useI18n()
const api = useApi();
const { success, error } = useNotification();
// Types
interface Tax {
  id: number;
  tax_name: string;
  value_rate: string;
  minimum: string;
  tax_rule_name?: string;
  amount_with_tax: string;
  calculation_method: string;
  include_tax: boolean;
  is_active: boolean;
}

interface TableHeader {
  key: string;
  title: string;
  sortable?: boolean;
}

interface Pagination {
  current_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  per_page: number;
}

interface TaxesResponse {
  status: boolean;
  code: number;
  message: string;
  data: Tax[];
  pagination: Pagination;
  header_table: string;
  headers: TableHeader[];
  shownHeaders: TableHeader[];
  actions: {
    can_create: boolean;
  };
}

interface FilterParams {
  per_page?: number;
  cursor?: string | null;
  tax_name?: string;
  value_rate?: string;
  status?: number | boolean;
}

const taxesIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.8498 26H36.4835C37.6257 26 38.611 25.9999 39.4226 26.0662C40.2791 26.1362 41.1311 26.2907 41.9509 26.7085C43.174 27.3316 44.1684 28.326 44.7915 29.5491C45.2093 30.3689 45.3638 31.2209 45.4338 32.0774C45.5001 32.889 45.5 33.8743 45.5 35.0164V36.4836C45.5 37.6257 45.5001 38.611 45.4338 39.4226C45.3638 40.2791 45.2093 41.1311 44.7915 41.9509C44.1684 43.174 43.174 44.1684 41.9509 44.7915C41.1311 45.2093 40.2791 45.3638 39.4226 45.4338C38.611 45.5001 37.6256 45.5 36.4835 45.5H32.8499C31.7077 45.5 30.7224 45.5001 29.9108 45.4338C29.0542 45.3638 28.2022 45.2093 27.3824 44.7915C26.1593 44.1684 25.165 43.174 24.5418 41.9509C24.1241 41.1311 23.9696 40.2791 23.8996 39.4226C23.8333 38.611 23.8333 37.6257 23.8333 36.4835V35.0165C23.8333 33.8743 23.8333 32.889 23.8996 32.0774C23.9696 31.2209 24.1241 30.3689 24.5418 29.5491C25.165 28.326 26.1593 27.3316 27.3824 26.7085C28.2022 26.2907 29.0542 26.1362 29.9108 26.0662C30.7223 25.9999 31.7077 26 32.8498 26ZM30.2636 30.3852C29.675 30.4333 29.4568 30.5149 29.3497 30.5695C28.942 30.7772 28.6105 31.1087 28.4028 31.5164C28.3482 31.6235 28.2666 31.8417 28.2185 32.4303C28.1684 33.0442 28.1667 33.8508 28.1667 35.1V36.4C28.1667 37.6492 28.1684 38.4558 28.2185 39.0697C28.2666 39.6583 28.3482 39.8765 28.4028 39.9836C28.6105 40.3913 28.942 40.7228 29.3497 40.9305C29.4568 40.9851 29.675 41.0667 30.2636 41.1148C30.8775 41.165 31.6841 41.1667 32.9333 41.1667H36.4C37.6492 41.1667 38.4558 41.165 39.0697 41.1148C39.6583 41.0667 39.8765 40.9851 39.9836 40.9305C40.3913 40.7228 40.7228 40.3913 40.9305 39.9836C40.9851 39.8765 41.0667 39.6583 41.1148 39.0697C41.165 38.4558 41.1667 37.6492 41.1667 36.4V35.1C41.1667 33.8508 41.165 33.0442 41.1148 32.4303C41.0667 31.8417 40.9851 31.6235 40.9305 31.5164C40.7228 31.1087 40.3913 30.7772 39.9836 30.5695C39.8765 30.5149 39.6583 30.4333 39.0697 30.3852C38.4558 30.335 37.6492 30.3333 36.4 30.3333H32.9333C31.6841 30.3333 30.8775 30.335 30.2636 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9016 6.49983C13.0767 6.49918 12.3664 6.49861 11.7319 6.62483C9.15341 7.13772 7.13778 9.15335 6.62489 11.7318C6.49867 12.3664 6.49924 13.0767 6.49989 13.9015L6.49999 14.0833L6.49989 14.265C6.49924 15.0899 6.49867 15.8002 6.62489 16.4347C7.13778 19.0132 9.15341 21.0288 11.7319 21.5417C12.3664 21.6679 13.0767 21.6673 13.9016 21.6667H38.0984C38.9233 21.6673 39.6336 21.6679 40.2681 21.5417C42.8466 21.0288 44.8622 19.0132 45.3751 16.4347C45.5013 15.8002 45.5007 15.0899 45.5001 14.2651L45.5 14.0833L45.5001 13.9015C45.5007 13.0767 45.5013 12.3663 45.3751 11.7318C44.8622 9.15335 42.8466 7.13772 40.2681 6.62483C39.6336 6.49861 38.9233 6.49918 38.0984 6.49983H13.9016ZM12.5773 10.8749C12.7338 10.8438 12.9727 10.8333 14.0833 10.8333H37.9167C39.0273 10.8333 39.2662 10.8438 39.4227 10.8749C40.2822 11.0459 40.9541 11.7177 41.125 12.5772C41.1562 12.7338 41.1667 12.9727 41.1667 14.0833C41.1667 15.1939 41.1562 15.4328 41.125 15.5893C40.9541 16.4488 40.2822 17.1207 39.4227 17.2916C39.2662 17.3228 39.0273 17.3333 37.9167 17.3333H14.0833C12.9727 17.3333 12.7338 17.3228 12.5773 17.2916C11.7178 17.1207 11.0459 16.4488 10.875 15.5893C10.8438 15.4328 10.8333 15.1939 10.8333 14.0833C10.8333 12.9727 10.8438 12.7338 10.875 12.5772C11.0459 11.7177 11.7178 11.0459 12.5773 10.8749Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13 26C9.41015 26 6.5 28.9102 6.5 32.5V39C6.5 42.5899 9.41015 45.5 13 45.5C16.5899 45.5 19.5 42.5899 19.5 39V32.5C19.5 28.9102 16.5899 26 13 26ZM10.8333 32.5C10.8333 31.3034 11.8034 30.3333 13 30.3333C14.1966 30.3333 15.1667 31.3034 15.1667 32.5V39C15.1667 40.1966 14.1966 41.1667 13 41.1667C11.8034 41.1667 10.8333 40.1966 10.8333 39V32.5Z" fill="#1570EF"/>
</svg>`;

// API Data
const tableItems = ref<Tax[]>([]);
const allHeaders = ref<TableHeader[]>([]);
const shownHeaders = ref<TableHeader[]>([]);
const canCreate = ref(false);
const header_table = ref('');
const loading = ref(false);
const loadingMore = ref(false);

// Pagination
const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(5);
const hasMoreData = computed(() => nextCursor.value !== null);

// Computed table headers for DataTable component
const tableHeaders = computed(() => shownHeaders.value);

// Headers dropdown
const showHeadersMenu = ref(false);
const updatingHeaders = ref(false);

// Computed checked headers for menu
const headerCheckStates = computed(() => {
  const states: Record<string, boolean> = {};
  allHeaders.value.forEach(header => {
    states[header.key] = shownHeaders.value.some(sh => sh.key === header.key);
  });
  return states;
});

// Filters
const showAdvancedFilters = ref(false);
const filterTaxName = ref("");
const filterValueRate = ref("");
const filterStatus = ref<number | null>(null);

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const StatusList = [
  { title: 'فعال', value: 1 },
  { title: 'غير فعال', value: 0 }
]

// Bulk delete only
const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

// Status change confirmation
const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<Tax | null>(null);

// Tax dialog
const showTaxDialog = ref(false);
const editingTaxId = ref<number | null>(null);

// Selection
const selectedTaxes = ref<number[]>([]);
const hasSelectedTaxes = computed(() => selectedTaxes.value.length > 0);

// Infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null);

// Fetch taxes from API
const fetchTaxes = async (append = false) => {
  try {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }

    const filters: FilterParams = {
      per_page: perPage.value,
      cursor: append ? nextCursor.value : null,
    };

    if (filterTaxName.value) filters.tax_name = filterTaxName.value;
    if (filterValueRate.value) filters.value_rate = filterValueRate.value;
    if (filterStatus.value !== null) filters.status = filterStatus.value;

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/taxes?${queryString}` : '/taxes';

    const response = await api.get<TaxesResponse>(url);

    // Convert is_active to boolean for v-switch compatibility
    const normalizedData = response.data.map(item => ({
      ...item,
      is_active: Boolean(item.is_active)
    }));

    // Convert amount_with_tax to fixed 2 decimal places
    normalizedData.map(el => {
      el.amount_with_tax = Number(el.amount_with_tax).toFixed(2);
    })

    if (append) {
      tableItems.value = [...tableItems.value, ...normalizedData];
    } else {
      tableItems.value = normalizedData;
      allHeaders.value = response.headers.filter(h => h.key !== 'id' && h.key !== 'actions');
      shownHeaders.value = response.shownHeaders.filter(h => h.key !== 'id' && h.key !== 'actions');
      canCreate.value = response.actions.can_create;
      header_table.value = response.header_table
    }

    nextCursor.value = response.pagination.next_cursor;
    previousCursor.value = response.pagination.prev_cursor;
  } catch (err: any) {
    console.error('Error fetching taxes:', err);
    error(err?.response?.data?.message || 'Failed to fetch taxes');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (!hasMoreData.value || loadingMore.value) return;
  await fetchTaxes(true);
};

const applyFilters = () => {
  fetchTaxes();
};

const resetFilters = () => {
  filterTaxName.value = '';
  filterValueRate.value = '';
  filterStatus.value = null;
  fetchTaxes();
};

// Toggle header visibility
const toggleHeader = async (headerKey: string) => {
  const isCurrentlyShown = shownHeaders.value.some(h => h.key === headerKey);

  if (isCurrentlyShown) {
    shownHeaders.value = shownHeaders.value.filter(h => h.key !== headerKey);
  } else {
    const headerToAdd = allHeaders.value.find(h => h.key === headerKey);
    if (headerToAdd) {
      shownHeaders.value.push(headerToAdd);
    }
  }

  await updateHeadersOnServer();
};

const updateHeadersOnServer = async () => {
  try {
    updatingHeaders.value = true;
    const headerKeys = shownHeaders.value.map(h => h.key);

    const formData = new FormData();
    formData.append('table', header_table.value);
    headerKeys.forEach((header, index) => {
      formData.append(`header[${index}]`, header);
    });

    await api.post('/headers', formData);
  } catch (err: any) {
    console.error('Error updating headers:', err);
    error(err?.response?.data?.message || 'Failed to update headers');
  } finally {
    updatingHeaders.value = false;
  }
};

const openCreateTax = () => {
  editingTaxId.value = null;
  showTaxDialog.value = true;
};

const handleEditTax = (item: any) => {
  editingTaxId.value = item.id;
  showTaxDialog.value = true;
};

const handleDeleteTax = async (item: any) => {
  try {
    await api.delete(`/taxes/${item.id}`);
    success('تم حذف الضريبة بنجاح');
    await fetchTaxes();
  } catch (err: any) {
    console.error('Error deleting tax:', err);
    error(err?.response?.data?.message || 'Failed to delete tax');
  }
};

const handleStatusChange = (item: any) => {
  // Store the item with its current status
  itemToChangeStatus.value = { ...item };
  showStatusChangeDialog.value = true;
};

const confirmStatusChange = async () => {
  if (!itemToChangeStatus.value) return;

  try {
    statusChangeLoading.value = true;
    const newStatus = !itemToChangeStatus.value.is_active;

    await api.patch(`/taxes/${itemToChangeStatus.value.id}/change-status`, { status: newStatus });

    success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} الضريبة بنجاح`);

    // Update local state
    const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id);
    if (index !== -1) {
      tableItems.value[index].is_active = newStatus;
    }
  } catch (err: any) {
    console.error('Error changing status:', err);
    error(err?.response?.data?.message || 'Failed to change status');
  } finally {
    statusChangeLoading.value = false;
    showStatusChangeDialog.value = false;
    itemToChangeStatus.value = null;
  }
};

const handleBulkDelete = () => {
  if (selectedTaxes.value.length === 0) return;
  showDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  if (deleteLoading.value) return;

  try {
    deleteLoading.value = true;
    await api.post('/taxes/bulk-delete', { ids: selectedTaxes.value });
    success(`تم حذف ${selectedTaxes.value.length} ضريبة بنجاح`);
    selectedTaxes.value = [];
    await fetchTaxes();
  } catch (err: any) {
    console.error('Error deleting taxes:', err);
    error(err?.response?.data?.message || 'Failed to delete taxes');
  } finally {
    deleteLoading.value = false;
    showDeleteDialog.value = false;
  }
};

const handleSaveTax = async () => {
  // Refresh the list after successful save
  await fetchTaxes();
  editingTaxId.value = null;
};

const handleSelectTax = (item: any, selected: boolean) => {
  if (selected) {
    if (!selectedTaxes.value.includes(item.id)) {
      selectedTaxes.value.push(item.id);
    }
  } else {
    selectedTaxes.value = selectedTaxes.value.filter((id) => id !== item.id);
  }
};

const handleSelectAllTaxes = (selected: boolean) => {
  if (selected) {
    selectedTaxes.value = tableItems.value.map((item) => item.id);
  } else {
    selectedTaxes.value = [];
  }
};

// Lifecycle
onMounted(() => {
  fetchTaxes();

  // Setup infinite scroll observer
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMoreData.value && !loadingMore.value) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
});

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path
    d="M14.3333 10.1667V3.5C14.3333 2.72343 14.3333 2.33515 14.2065 2.02886C14.0373 1.62048 13.7129 1.29602 13.3045 1.12687C12.9982 1 12.6099 1 11.8333 1C11.0568 1 10.6685 1 10.3622 1.12687C9.95381 1.29602 9.62936 1.62048 9.4602 2.02886C9.33333 2.33515 9.33333 2.72343 9.33333 3.5V10.1667C9.33333 10.9432 9.33333 11.3315 9.4602 11.6378C9.62936 12.0462 9.95381 12.3706 10.3622 12.5398C10.6685 12.6667 11.0568 12.6667 11.8333 12.6667C12.6099 12.6667 12.9982 12.6667 13.3045 12.5398C13.7129 12.3706 14.0373 12.0462 14.2065 11.6378C14.3333 11.3315 14.3333 10.9432 14.3333 10.1667Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

const trash_1_icon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.5833 4.08333V3.41667C11.5833 2.48325 11.5833 2.01654 11.4017 1.66002C11.2419 1.34641 10.9869 1.09144 10.6733 0.931656C10.3168 0.75 9.85009 0.75 8.91667 0.75H7.58333C6.64991 0.75 6.1832 0.75 5.82668 0.931656C5.51308 1.09144 5.25811 1.34641 5.09832 1.66002C4.91667 2.01654 4.91667 2.48325 4.91667 3.41667V4.08333M0.75 4.08333H15.75M14.0833 4.08333V13.4167C14.0833 14.8168 14.0833 15.5169 13.8108 16.0516C13.5712 16.522 13.1887 16.9045 12.7183 17.1442C12.1835 17.4167 11.4835 17.4167 10.0833 17.4167H6.41667C5.01654 17.4167 4.31647 17.4167 3.78169 17.1442C3.31129 16.9045 2.92883 16.522 2.68915 16.0516C2.41667 15.5169 2.41667 14.8168 2.41667 13.4167V4.08333" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trash_2_icon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.75 0.75H10.75M0.75 3.25H15.75M14.0833 3.25L13.4989 12.0161C13.4112 13.3313 13.3674 13.9889 13.0833 14.4875C12.8333 14.9265 12.456 15.2794 12.0014 15.4997C11.485 15.75 10.8259 15.75 9.50779 15.75H6.99221C5.67409 15.75 5.01503 15.75 4.49861 15.4997C4.04396 15.2794 3.66674 14.9265 3.41665 14.4875C3.13259 13.9889 3.08875 13.3313 3.00107 12.0161L2.41667 3.25M6.58333 7V11.1667M9.91667 7V11.1667" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

</script>

<template>
  <default-layout>
    <div class="taxes-page">
      <PageHeader :icon="taxesIcon" title-key="pages.taxes.title" description-key="pages.taxes.description" />

      <div
        class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
        <ButtonWithIcon variant="flat" height="40" rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
          :prepend-icon="exportIcon" :label="t('common.export')" />
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div :class="hasSelectedTaxes ? 'justify-between' : 'justify-end'"
          class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">

          <!-- Bulk Actions -->
          <div v-if="hasSelectedTaxes"
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
            <!-- Column Management -->
            <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500" height="40"
                  custom-class="font-semibold text-base border-gray-400" :prepend-icon="columnIcon"
                  :label="t('common.columns')" append-icon="mdi-chevron-down" />
              </template>
              <v-list>
                <v-list-item v-for="header in allHeaders" :key="header.key" @click="toggleHeader(header.key)">
                  <template v-slot:prepend>
                    <v-checkbox-btn :model-value="headerCheckStates[header.key]" :disabled="updatingHeaders"
                      @click.stop="toggleHeader(header.key)"></v-checkbox-btn>
                  </template>
                  <v-list-item-title>{{ header.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <!-- Advanced Filters Toggle -->
            <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
              :prepend-icon="searchIcon" :label="t('common.advancedSearch')" @click="toggleAdvancedFilters" />

            <!-- Add New Button -->
            <ButtonWithIcon v-if="canCreate" variant="flat" color="primary-100" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
              :prepend-icon="plusIcon" :label="t('common.addNew')" @click="openCreateTax" />
          </div>
        </div>

        <!-- Advanced Filters -->
        <div v-if="showAdvancedFilters" class="border-b border-gray-300 px-4 sm:px-6 py-4 bg-white">
          <div class="flex flex-wrap gap-3 justify-between">
            <div class="flex gap-3 flex-wrap">
              <TextInput v-model="filterTaxName" density="comfortable" variant="outlined" hide-details
                placeholder="اسم الضريبة" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
              <TextInput v-model="filterValueRate" density="comfortable" variant="outlined" hide-details
                placeholder="النسبة" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
              <SelectInput v-model="filterStatus" :items="StatusList" item-title="title" item-value="value"
                density="comfortable" variant="outlined" hide-details placeholder="الحالة"
                class="w-full sm:w-40 bg-white" @update:model-value="applyFilters" />
            </div>

            <div class="flex gap-2 items-center">
              <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                custom-class="px-5 font-semibold !text-white text-sm sm:text-base" :prepend-icon="searchIcon"
                label="بحث" @click="applyFilters" />

              <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" show-checkbox show-actions
          @delete="handleDeleteTax" @edit="handleEditTax" @select="handleSelectTax" @selectAll="handleSelectAllTaxes"
          :confirm-delete="true" :show-view="false">
          <template #item.is_active="{ item }">
            <v-switch :model-value="item.is_active" hide-details inset density="compact" class="small-switch" color="primary-600"
              @update:model-value="(value) => handleStatusChange(item)" />
          </template>
        </DataTable>

        <!-- Infinite Scroll Trigger & Loading Indicator -->
        <div ref="loadMoreTrigger" class="flex justify-center py-8">
          <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Dialog -->
    <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف الضرائب"
      :message="`هل أنت متأكد من حذف ${selectedTaxes.length} ضريبة؟`" @confirm="confirmBulkDelete" />

    <!-- Status Change Confirmation Dialog -->
    <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
      :item-name="itemToChangeStatus?.tax_name" :current-status="itemToChangeStatus?.is_active"
      @confirm="confirmStatusChange" />

    <!-- Tax Form Dialog -->
    <TaxFormDialog v-model="showTaxDialog" :tax-id="editingTaxId" @saved="handleSaveTax" />
  </default-layout>
</template>

<style scoped></style>
