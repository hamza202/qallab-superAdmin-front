<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import CityFormDialog from "@/views/settings/cities/components/CityFormDialog.vue";
import { useI18n } from 'vue-i18n'
import { useApi } from "@/composables/useApi";

const { t } = useI18n()
const api = useApi();

// Types
interface City {
  id: number;
  name: string;
  country_id: number;
  country_name?: string;
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

interface CitiesResponse {
  status: boolean;
  code: number;
  message: string;
  data: City[];
  pagination: Pagination;
  header_table: string;
  headers: TableHeader[];
  shownHeaders: TableHeader[];
  actions: {
    can_create: boolean;
    can_bulk_delete?: boolean;
  };
}

interface FilterParams {
  per_page?: number;
  cursor?: string | null;
  name?: string;
  code2?: string;
  status?: number | boolean;
}

const citiesIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 30.1667C27.2565 30.1667 30.1667 27.2565 30.1667 23.6667C30.1667 20.0768 27.2565 17.1667 23.6667 17.1667C20.0768 17.1667 17.1667 20.0768 17.1667 23.6667C17.1667 27.2565 20.0768 30.1667 23.6667 30.1667Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M38.2424 29.5758C37.9802 30.1698 37.902 30.8289 38.0179 31.4678C38.1337 32.1068 38.4383 32.6964 38.8924 33.1606L39.0106 33.2788C39.3769 33.6446 39.6674 34.0791 39.8657 34.5574C40.0639 35.0356 40.166 35.5482 40.166 36.0659C40.166 36.5836 40.0639 37.0962 39.8657 37.5745C39.6674 38.0527 39.3769 38.4872 39.0106 38.853C38.6447 39.2193 38.2103 39.5099 37.732 39.7081C37.2538 39.9064 36.7412 40.0084 36.2235 40.0084C35.7058 40.0084 35.1932 39.9064 34.7149 39.7081C34.2367 39.5099 33.8022 39.2193 33.4364 38.853L33.3182 38.7348C32.854 38.2808 32.2644 37.9761 31.6254 37.8603C30.9864 37.7444 30.3274 37.8226 29.7333 38.0848C29.1508 38.3345 28.6539 38.7491 28.3039 39.2776C27.954 39.806 27.7662 40.4253 27.7636 41.0591V41.3939C27.7636 42.4387 27.3486 43.4407 26.6098 44.1795C25.871 44.9183 24.869 45.3333 23.8242 45.3333C22.7794 45.3333 21.7774 44.9183 21.0387 44.1795C20.2999 43.4407 19.8848 42.4387 19.8848 41.3939V41.2167C19.8696 40.5647 19.6586 39.9324 19.2792 39.402C18.8998 38.8716 18.3696 38.4675 17.7576 38.2424C17.1635 37.9802 16.5045 37.902 15.8655 38.0179C15.2265 38.1337 14.6369 38.4383 14.1727 38.8924L14.0545 39.0106C13.6887 39.3769 13.2542 39.6674 12.776 39.8657C12.2977 40.0639 11.7851 40.166 11.2674 40.166C10.7497 40.166 10.2371 40.0639 9.75887 39.8657C9.28064 39.6674 8.84617 39.3769 8.4803 39.0106C8.11403 38.6447 7.82347 38.2103 7.62522 37.732C7.42697 37.2538 7.32493 36.7412 7.32493 36.2235C7.32493 35.7058 7.42697 35.1932 7.62522 34.7149C7.82347 34.2367 8.11403 33.8022 8.4803 33.4364L8.59848 33.3182C9.05257 32.854 9.35718 32.2644 9.47304 31.6254C9.58889 30.9864 9.51068 30.3274 9.24848 29.7333C8.9988 29.1508 8.58422 28.6539 8.05576 28.3039C7.52731 27.954 6.90806 27.7662 6.27424 27.7636H5.93939C4.8946 27.7636 3.8926 27.3486 3.15382 26.6098C2.41504 25.871 2 24.869 2 23.8242C2 22.7794 2.41504 21.7774 3.15382 21.0387C3.8926 20.2999 4.8946 19.8848 5.93939 19.8848H6.11667C6.76863 19.8696 7.40092 19.6586 7.93135 19.2792C8.46177 18.8998 8.8658 18.3696 9.09091 17.7576C9.35311 17.1635 9.43132 16.5045 9.31546 15.8655C9.19961 15.2265 8.895 14.6369 8.44091 14.1727L8.32273 14.0545C7.95646 13.6887 7.66589 13.2542 7.46764 12.776C7.2694 12.2977 7.16736 11.7851 7.16736 11.2674C7.16736 10.7497 7.2694 10.2371 7.46764 9.75887C7.66589 9.28064 7.95646 8.84617 8.32273 8.4803C8.68859 8.11403 9.12306 7.82347 9.6013 7.62522C10.0795 7.42697 10.5922 7.32493 11.1098 7.32493C11.6275 7.32493 12.1402 7.42697 12.6184 7.62522C13.0966 7.82347 13.5311 8.11403 13.897 8.4803L14.0152 8.59848C14.4794 9.05257 15.069 9.35718 15.7079 9.47304C16.3469 9.58889 17.0059 9.51068 17.6 9.24848H17.7576C18.3402 8.9988 18.837 8.58422 19.187 8.05576C19.5369 7.52731 19.7247 6.90806 19.7273 6.27424V5.93939C19.7273 4.8946 20.1423 3.8926 20.8811 3.15382C21.6199 2.41504 22.6219 2 23.6667 2C24.7115 2 25.7135 2.41504 26.4522 3.15382C27.191 3.8926 27.6061 4.8946 27.6061 5.93939V6.11667C27.6086 6.75049 27.7964 7.36974 28.1464 7.89819C28.4963 8.42664 28.9932 8.84122 29.5758 9.09091C30.1698 9.35311 30.8289 9.43132 31.4678 9.31546C32.1068 9.19961 32.6964 8.895 33.1606 8.44091L33.2788 8.32273C33.6446 7.95646 34.0791 7.66589 34.5574 7.46764C35.0356 7.2694 35.5482 7.16736 36.0659 7.16736C36.5836 7.16736 37.0962 7.2694 37.5745 7.46764C38.0527 7.66589 38.4872 7.95646 38.853 8.32273C39.2193 8.68859 39.5099 9.12306 39.7081 9.6013C39.9064 10.0795 40.0084 10.5922 40.0084 11.1098C40.0084 11.6275 39.9064 12.1402 39.7081 12.6184C39.5099 13.0966 39.2193 13.5311 38.853 13.897L38.7348 14.0152C38.2808 14.4794 37.9761 15.069 37.8603 15.7079C37.7444 16.3469 37.8226 17.0059 38.0848 17.6V17.7576C38.3345 18.3402 38.7491 18.837 39.2776 19.187C39.806 19.5369 40.4253 19.7247 41.0591 19.7273H41.3939C42.4387 19.7273 43.4407 20.1423 44.1795 20.8811C44.9183 21.6199 45.3333 22.6219 45.3333 23.6667C45.3333 24.7115 44.9183 25.7135 44.1795 26.4522C43.4407 27.191 42.4387 27.6061 41.3939 27.6061H41.2167C40.5828 27.6086 39.9636 27.7964 39.4351 28.1464C38.9067 28.4963 38.4921 28.9932 38.2424 29.5758Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

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


// API Data
const tableItems = ref<City[]>([]);
const allHeaders = ref<TableHeader[]>([]);
const shownHeaders = ref<TableHeader[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(true);
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
const filterName = ref("");
const filterCode2 = ref("");
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
const itemToChangeStatus = ref<City | null>(null);

// City dialog
const showCityDialog = ref(false);
const editingCityId = ref<number | null>(null);

// Selection
const selectedCities = ref<number[]>([]);
const hasSelectedCities = computed(() => selectedCities.value.length > 0);

// Infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null);

// Fetch cities from API
const fetchCities = async (append = false) => {
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

    if (filterName.value) filters.name = filterName.value;
    if (filterCode2.value) filters.code2 = filterCode2.value;
    if (filterStatus.value !== null) filters.status = filterStatus.value;

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/cities?${queryString}` : '/cities';

    const response = await api.get<CitiesResponse>(url);

    // Convert is_active to boolean for v-switch compatibility
    const normalizedData = response.data.map(item => ({
      ...item,
      is_active: Boolean(item.is_active)
    }));

    if (append) {
      tableItems.value = [...tableItems.value, ...normalizedData];
    } else {
      tableItems.value = normalizedData;
      allHeaders.value = response.headers.filter(h => h.key !== 'id' && h.key !== 'actions');
      shownHeaders.value = response.shownHeaders.filter(h => h.key !== 'id' && h.key !== 'actions');
      canCreate.value = response.actions.can_create;
      canBulkDelete.value = response.actions.can_bulk_delete ?? false;
      header_table.value = response.header_table
    }

    nextCursor.value = response.pagination.next_cursor;
    previousCursor.value = response.pagination.prev_cursor;
  } catch (err: any) {
    console.error('Error fetching cities:', err);
    toast.error(err?.response?.data?.message || 'Failed to fetch cities');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (!hasMoreData.value || loadingMore.value) return;
  await fetchCities(true);
};

const applyFilters = () => {
  fetchCities();
};

const resetFilters = () => {
  filterName.value = '';
  filterCode2.value = '';
  filterStatus.value = null;
  fetchCities();
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
    toast.error(err?.response?.data?.message || 'Failed to update headers');
  } finally {
    updatingHeaders.value = false;
  }
};

const openCreateCity = () => {
  editingCityId.value = null;
  showCityDialog.value = true;
};

const handleEditCity = (item: any) => {
  editingCityId.value = item.id;
  showCityDialog.value = true;
};

const handleDeleteCity = async (item: any) => {
  try {
    await api.delete(`/cities/${item.id}`);
    toast.success('تم حذف المدينة بنجاح');
    await fetchCities();
  } catch (err: any) {
    console.error('Error deleting city:', err);
    toast.error(err?.response?.data?.message || 'Failed to delete city');
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

    await api.patch(`/cities/${itemToChangeStatus.value.id}/change-status`, { status: newStatus });

    toast.success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} المدينة بنجاح`);

    // Update local state
    const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id);
    if (index !== -1) {
      tableItems.value[index].is_active = newStatus;
    }
  } catch (err: any) {
    console.error('Error changing status:', err);
    toast.error(err?.response?.data?.message || 'Failed to change status');
  } finally {
    statusChangeLoading.value = false;
    showStatusChangeDialog.value = false;
    itemToChangeStatus.value = null;
  }
};

const handleBulkDelete = () => {
  if (selectedCities.value.length === 0) return;
  showDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  if (deleteLoading.value) return;

  try {
    deleteLoading.value = true;
    await api.post('/cities/bulk-delete', { ids: selectedCities.value });
    toast.success(`تم حذف ${selectedCities.value.length} مدينة بنجاح`);
    selectedCities.value = [];
    await fetchCities();
  } catch (err: any) {
    console.error('Error deleting cities:', err);
    toast.error(err?.response?.data?.message || 'Failed to delete cities');
  } finally {
    deleteLoading.value = false;
    showDeleteDialog.value = false;
  }
};

const handleSaveCity = async () => {
  // Refresh the list after successful save
  await fetchCities();
  editingCityId.value = null;
};

const handleSelectCity = (item: any, selected: boolean) => {
  if (selected) {
    if (!selectedCities.value.includes(item.id)) {
      selectedCities.value.push(item.id);
    }
  } else {
    selectedCities.value = selectedCities.value.filter((id) => id !== item.id);
  }
};

const handleSelectAllCities = (selected: boolean) => {
  if (selected) {
    selectedCities.value = tableItems.value.map((item) => item.id);
  } else {
    selectedCities.value = [];
  }
};

// Lifecycle
onMounted(() => {
  fetchCities();

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
</svg>`

const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

</script>

<template>
  <default-layout>
    <div class="cities-page">
      <PageHeader :icon="citiesIcon" title-key="pages.cities.title" description-key="pages.cities.description" />
      <div
        class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
        <ButtonWithIcon variant="flat" height="40" rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
          :prepend-icon="exportIcon" :label="t('common.export')" />
      </div>


      <div class="bg-gray-50 rounded-md -mx-6">
        <div :class="hasSelectedCities ? 'justify-between' : 'justify-end'"
          class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">

          <!-- Bulk Actions -->
          <div v-if="hasSelectedCities"
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
              :prepend-icon="plusIcon" :label="t('common.addNew')" @click="openCreateCity" />
          </div>
        </div>

        <!-- Advanced Filters -->
        <div v-if="showAdvancedFilters" class="border-b border-gray-300 px-4 sm:px-6 py-4 bg-white">
          <div class="flex flex-wrap gap-3 justify-between">
            <div class="flex gap-3 flex-wrap">
              <TextInput v-model="filterName" density="comfortable" variant="outlined" hide-details
                placeholder="اسم المدينة" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
              <TextInput v-model="filterCode2" density="comfortable" variant="outlined" hide-details
                placeholder="الرمز" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
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
        <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" :show-checkbox="canBulkDelete" show-actions
          @delete="handleDeleteCity" @edit="handleEditCity" @select="handleSelectCity" @selectAll="handleSelectAllCities"
          :confirm-delete="true">
          <template #item.is_active="{ item }">
            <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
              class="small-switch" @update:model-value="() => handleStatusChange(item)"
              v-if="item.actions.can_change_status" />
            <span v-else class="text-sm text-gray-600">--</span>
          </template>
        </DataTable>

        <!-- Infinite Scroll Trigger & Loading Indicator -->
        <div ref="loadMoreTrigger" class="flex justify-center py-8">
          <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Dialog -->
    <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف المدن"
      :message="`هل أنت متأكد من حذف ${selectedCities.length} مدينة؟`" @confirm="confirmBulkDelete" />

    <!-- Status Change Confirmation Dialog -->
    <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
      :item-name="itemToChangeStatus?.name" :current-status="itemToChangeStatus?.is_active"
      @confirm="confirmStatusChange" />

    <!-- City Form Dialog -->
    <CityFormDialog v-model="showCityDialog" :city-id="editingCityId" @saved="handleSaveCity" />
  </default-layout>
</template>

<style scoped></style>
