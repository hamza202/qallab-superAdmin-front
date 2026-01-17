<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNotification } from '@/composables/useNotification';
import { useTableColumns } from '@/composables/useTableColumns';
import sampleTypeService, { type SampleType, type SampleTypeListParams } from '@/services/api/sample-type.service';

const { t } = useI18n();
const router = useRouter();
const { success, error } = useNotification();

// === State ===
const tableItems = ref<SampleType[]>([]);
const canCreate = ref(false);
const loading = ref(false);
const loadingMore = ref(false);

// Pagination
const nextCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);

// Filters
const showAdvancedFilters = ref(false);
const filterName = ref('');
const filterStatus = ref<number | null>(null);

// Dialogs
const showDeleteDialog = ref(false);
const deleteLoading = ref(false);
const itemToDelete = ref<SampleType | null>(null);
const showStatusDialog = ref(false);
const statusLoading = ref(false);
const itemToChangeStatus = ref<SampleType | null>(null);

// Infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

// Column management
const {
  allHeaders: allColumnHeaders,
  shownHeaders: shownColumnHeaders,
  visibleHeaders,
  headerCheckStates,
  initHeaders,
  toggleHeader,
} = useTableColumns('sample-types');

const showColumnsMenu = ref(false);

// === Icons ===
const sampleTypeIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.33594 25.9997L25.2274 36.4455C25.5117 36.5876 25.6538 36.6587 25.8028 36.6866C25.9349 36.7114 26.0703 36.7114 26.2024 36.6866C26.3514 36.6587 26.4935 36.5876 26.7778 36.4455L47.6693 25.9997M4.33594 36.8331L25.2274 47.2788C25.5117 47.4209 25.6538 47.492 25.8028 47.52C25.9349 47.5447 26.0703 47.5447 26.2024 47.52C26.3514 47.492 26.4935 47.4209 26.7778 47.2788L47.6693 36.8331M4.33594 15.1664L25.2274 4.72065C25.5117 4.57854 25.6538 4.50748 25.8028 4.47951C25.9349 4.45475 26.0703 4.45475 26.2024 4.47951C26.3514 4.50748 26.4935 4.57854 26.7778 4.72065L47.6693 15.1664L26.7778 25.6121C26.4935 25.7543 26.3514 25.8253 26.2024 25.8533C26.0703 25.8781 25.9349 25.8781 25.8028 25.8533C25.6538 25.8253 25.5117 25.7543 25.2274 25.6121L4.33594 15.1664Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path
    d="M14.3333 10.1667V3.5C14.3333 2.72343 14.3333 2.33515 14.2065 2.02886C14.0373 1.62048 13.7129 1.29602 13.3045 1.12687C12.9982 1 12.6099 1 11.8333 1C11.0568 1 10.6685 1 10.3622 1.12687C10.6205 1.29602 9.62936 1.62048 9.4602 2.02886C9.33333 2.33515 9.33333 2.72343 9.33333 3.5V10.1667C9.33333 10.9432 9.33333 11.3315 9.4602 11.6378C9.62936 12.0462 9.95381 12.3706 10.3622 12.5398C10.6685 12.6667 11.0568 12.6667 11.8333 12.6667C12.6099 12.6667 12.9982 12.6667 13.3045 12.5398C13.7129 12.3706 14.0373 12.0462 14.2065 11.6378C14.3333 11.3315 14.3333 10.9432 14.3333 10.1667Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// === Computed ===
const tableHeaders = computed(() => {
  return visibleHeaders.value.map(header => ({
    key: header.key,
    title: header.title,
    width: '140px',
  }));
});

// === API Functions ===
const fetchData = async (cursor?: string | null, append = false) => {
  try {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }

    const params: SampleTypeListParams = {
      per_page: perPage.value,
    };
    
    if (cursor) params.cursor = cursor;
    if (filterName.value) params.name = filterName.value;
    if (filterStatus.value !== null) params.status = String(filterStatus.value);

    // Use getIndex instead of getList (endpoint: /sample-types)
    const response = await sampleTypeService.getIndex(params);

    if (append) {
      tableItems.value = [...tableItems.value, ...response.data];
    } else {
      tableItems.value = response.data;
      
      // Initialize headers from API response
      if (response.headers && response.shownHeaders) {
        const filteredHeaders = response.headers.filter(h => h.key !== 'id' && h.key !== 'actions');
        const filteredShownHeaders = response.shownHeaders.filter(h => h.key !== 'id' && h.key !== 'actions');
        initHeaders(filteredHeaders, filteredShownHeaders);
      }
      
      canCreate.value = response.actions?.can_create ?? false;
    }

    nextCursor.value = response.pagination?.next_cursor ?? null;
  } catch (err: any) {
    console.error('Error fetching sample types:', err);
    error(err?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// === Handlers ===
const handleCreate = () => {
  router.push("/settings/sample-types/create");
};

const handleEdit = (item: SampleType) => {
  // Check if user can update this item
  if (!item.actions?.can_update) {
    error('ليس لديك صلاحية لتعديل هذا العنصر');
    return;
  }
  router.push(`/settings/sample-types/edit/${item.id}`);
};

const openDeleteDialog = (item: SampleType) => {
  // Check if user can delete this item
  if (!item.actions?.can_delete) {
    error('ليس لديك صلاحية لحذف هذا العنصر');
    return;
  }
  itemToDelete.value = item;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  
  try {
    deleteLoading.value = true;
    await sampleTypeService.delete(itemToDelete.value.id);
    success('تم حذف نوع العينة بنجاح');
    showDeleteDialog.value = false;
    await fetchData();
  } catch (err: any) {
    console.error('Error deleting sample type:', err);
    error(err?.response?.data?.message || 'فشل حذف نوع العينة');
  } finally {
    deleteLoading.value = false;
    itemToDelete.value = null;
  }
};

const handleStatusToggle = (item: SampleType) => {
  // Check if user can change status of this item
  if (!item.actions?.can_change_status) {
    error('ليس لديك صلاحية لتغيير حالة هذا العنصر');
    return;
  }
  itemToChangeStatus.value = item;
  showStatusDialog.value = true;
};

const confirmStatusChange = async () => {
  if (!itemToChangeStatus.value) return;
  
  try {
    statusLoading.value = true;
    const newStatus = !itemToChangeStatus.value.is_active;
    await sampleTypeService.changeStatus(itemToChangeStatus.value.id, newStatus);
    
    // Update local state
    const index = tableItems.value.findIndex(i => i.id === itemToChangeStatus.value!.id);
    if (index !== -1) {
      tableItems.value[index].is_active = newStatus;
    }
    
    success(newStatus ? 'تم تفعيل نوع العينة' : 'تم تعطيل نوع العينة');
    showStatusDialog.value = false;
  } catch (err: any) {
    console.error('Error changing status:', err);
    error(err?.response?.data?.message || 'فشل تغيير الحالة');
  } finally {
    statusLoading.value = false;
    itemToChangeStatus.value = null;
  }
};

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const applyFilters = () => {
  fetchData();
};

const resetFilters = () => {
  filterName.value = '';
  filterStatus.value = null;
  fetchData();
};

// === Infinite Scroll ===
const setupInfiniteScroll = () => {
  if (!loadMoreTrigger.value) return;

  observer.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMoreData.value && !loadingMore.value && !loading.value) {
        fetchData(nextCursor.value, true);
      }
    },
    { root: null, rootMargin: '100px', threshold: 0.1 }
  );

  observer.value.observe(loadMoreTrigger.value);
};

const cleanupInfiniteScroll = () => {
  if (observer.value && loadMoreTrigger.value) {
    observer.value.unobserve(loadMoreTrigger.value);
    observer.value.disconnect();
  }
};

// === Lifecycle ===
onMounted(() => {
  fetchData();
  nextTick(() => {
    setupInfiniteScroll();
  });
});

onBeforeUnmount(() => {
  cleanupInfiniteScroll();
});
</script>

<template>
  <default-layout>
    <div class="sample-types-list-page">
      <PageHeader :icon="sampleTypeIcon" title-key="أنواع العينات" description-key="تمكنك من إدارة أنواع العينات" />

      <div class="bg-gray-50 rounded-md -mx-6">
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3"
        >
          <h3 class="text-lg font-bold text-gray-900">جدول أنواع العينات</h3>

          <!-- Main header controls -->
          <div class="flex flex-wrap gap-3">
            <v-menu v-model="showColumnsMenu" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <ButtonWithIcon 
                  v-bind="props"
                  variant="outlined" 
                  rounded="4" 
                  color="gray-500" 
                  height="40"
                  custom-class="font-semibold text-base border-gray-400"
                  :prepend-icon="columnIcon" 
                  :label="t('common.columns')" 
                  append-icon="mdi-chevron-down" 
                />
              </template>
              <v-card min-width="200">
                <v-list>
                  <v-list-item
                    v-for="header in allColumnHeaders"
                    :key="header.key"
                    @click="toggleHeader(header.key)"
                  >
                    <template v-slot:prepend>
                      <v-checkbox-btn
                        :model-value="headerCheckStates[header.key]"
                        @click.stop="toggleHeader(header.key)"
                      />
                    </template>
                    <v-list-item-title>{{ header.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
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
              :label="t('common.add')" 
              @click="handleCreate" 
            />
          </div>
        </div>

        <!-- Advanced filters row -->
        <div
          v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2"
        >
          <div class="flex flex-wrap gap-3 flex-1 justify-between">
            <div class="flex gap-3 flex-1">
              <TextInput
                v-model="filterName"
                density="comfortable"
                variant="outlined"
                hide-details
                :placeholder="t('common.name')"
                class="w-full sm:w-60 bg-white"
              />
              <SelectInput
                v-model="filterStatus"
                :items="[
                  { title: t('common.active'), value: 1 },
                  { title: t('common.inactive'), value: 0 }
                ]"
                density="comfortable"
                variant="outlined"
                hide-details
                :placeholder="t('common.status')"
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
                :label="t('common.search')"
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
                :label="t('common.reset')"
                @click="resetFilters" 
              />
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <DataTable
          :headers="tableHeaders"
          :items="tableItems"
          :loading="loading"
          :show-view="false"
          :confirm-delete="false"
          show-actions
          @edit="handleEdit"
          @delete="openDeleteDialog"
        >
          <!-- Status column with toggle -->
          <template #item.is_active="{ item }">
            <v-switch 
              :model-value="item.is_active" 
              hide-details 
              inset 
              density="compact" 
              color="primary" 
              class="small-switch"
              :disabled="!item.actions?.can_change_status"
              @update:model-value="() => handleStatusToggle(item)" 
            />
          </template>


        </DataTable>

        <!-- Loading more indicator -->
        <div 
          v-if="hasMoreData" 
          ref="loadMoreTrigger" 
          class="flex justify-center py-4"
        >
          <v-progress-circular
            v-if="loadingMore"
            indeterminate
            color="primary"
            size="32"
          />
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmDialog
      v-model="showDeleteDialog"
      :loading="deleteLoading"
      :item-name="itemToDelete?.name"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
    />

    <!-- Status Change Confirmation Dialog -->
    <StatusChangeDialog
      v-model="showStatusDialog"
      :loading="statusLoading"
      :item-name="itemToChangeStatus?.name"
      :current-status="itemToChangeStatus?.is_active"
      @confirm="confirmStatusChange"
      @cancel="showStatusDialog = false"
    />
  </default-layout>
</template>

<style scoped></style>
