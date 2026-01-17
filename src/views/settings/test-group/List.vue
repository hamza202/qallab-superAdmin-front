<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import testGroupService, { type TestGroup, type TestGroupListParams } from '@/services/api/test-group.service';
import { useTableColumns } from '@/composables/useTableColumns';

const { t } = useI18n();
const router = useRouter();

// === TypeScript Interfaces ===
interface TableHeader {
  key: string;
  title: string;
  width?: string;
}

// === State ===
const tableItems = ref<TestGroup[]>([]);
const allHeaders = ref<TableHeader[]>([]);
const shownHeaders = ref<TableHeader[]>([]);
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
const itemToDelete = ref<TestGroup | null>(null);
const showStatusDialog = ref(false);
const statusLoading = ref(false);
const itemToChangeStatus = ref<TestGroup | null>(null);

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
} = useTableColumns('test-groups');

const showColumnsMenu = ref(false);

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

    const params: TestGroupListParams = {
      per_page: perPage.value,
    };
    
    if (cursor) params.cursor = cursor;
    if (filterName.value) params.name = filterName.value;
    if (filterStatus.value !== null) params.status = String(filterStatus.value);

    const response = await testGroupService.getList(params);

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
    console.error('Error fetching test groups:', err);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// === Handlers ===
const handleView = (item: any) => {
  router.push({ name: 'TestGroupView', params: { id: item.id } });
};

const handleEdit = (item: any) => {
  router.push({ name: 'TestGroupEdit', params: { id: item.id } });
};

const openDeleteDialog = (item: any) => {
  itemToDelete.value = item as TestGroup;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  
  try {
    deleteLoading.value = true;
    await testGroupService.delete(itemToDelete.value.id);
    showDeleteDialog.value = false;
    await fetchData();
  } catch (err: any) {
    console.error('Error deleting test group:', err);
  } finally {
    deleteLoading.value = false;
    itemToDelete.value = null;
  }
};

const handleStatusToggle = (item: any) => {
  itemToChangeStatus.value = item as TestGroup;
  showStatusDialog.value = true;
};

const confirmStatusChange = async () => {
  if (!itemToChangeStatus.value) return;
  
  try {
    statusLoading.value = true;
    const newStatus = !itemToChangeStatus.value.is_active;
    await testGroupService.changeStatus(itemToChangeStatus.value.id, newStatus);
    
    // Update local state
    const index = tableItems.value.findIndex(i => i.id === itemToChangeStatus.value!.id);
    if (index !== -1) {
      tableItems.value[index].is_active = newStatus;
    }
    
    showStatusDialog.value = false;
  } catch (err: any) {
    console.error('Error changing status:', err);
  } finally {
    statusLoading.value = false;
    itemToChangeStatus.value = null;
  }
};

const handleCreate = () => {
  router.push({ name: 'TestGroupCreate' });
};

const applyFilters = () => {
  fetchData();
};

const resetFilters = () => {
  filterName.value = '';
  filterStatus.value = null;
  fetchData();
};

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
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

// === SVG Icons ===
const testGroupIcon = `<svg width="39" height="48" viewBox="0 0 39 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 21.5H10.6667M15 30.1667H10.6667M28 12.8333H10.6667M36.6667 12.4V34.9333C36.6667 38.5737 36.6667 40.3938 35.9582 41.7843C35.335 43.0073 34.3407 44.0017 33.1176 44.6249C31.7272 45.3333 29.907 45.3333 26.2667 45.3333H12.4C8.75966 45.3333 6.93949 45.3333 5.54906 44.6249C4.32601 44.0017 3.33163 43.0073 2.70846 41.7843C2 40.3938 2 38.5737 2 34.9333V12.4C2 8.75966 2 6.93949 2.70846 5.54906C3.33163 4.32601 4.32601 3.33163 5.54906 2.70846C6.93949 2 8.75966 2 12.4 2H26.2667C29.907 2 31.7272 2 33.1176 2.70846C34.3407 3.33163 35.335 4.32601 35.9582 5.54906C36.6667 6.93949 36.6667 8.75966 36.6667 12.4Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path
    d="M14.3333 10.1667V3.5C14.3333 2.72343 14.3333 2.33515 14.2065 2.02886C14.0373 1.62048 13.7129 1.29602 13.3045 1.12687C12.9982 1 12.6099 1 11.8333 1C11.0568 1 10.6685 1 10.3622 1.12687C9.95381 1.29602 9.62936 1.62048 9.4602 2.02886C9.33333 2.33515 9.33333 2.72343 9.33333 3.5V10.1667C9.33333 10.9432 9.33333 11.3315 9.4602 11.6378C9.62936 12.0462 9.95381 12.3706 10.3622 12.5398C10.6685 12.6667 11.0568 12.6667 11.8333 12.6667C12.6099 12.6667 12.9982 12.6667 13.3045 12.5398C13.7129 12.3706 14.0373 12.0462 14.2065 11.6378C14.3333 11.3315 14.3333 10.9432 14.3333 10.1667Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <default-layout>
    <div class="test-group-page">
      <PageHeader
        :icon="testGroupIcon"
        title-key="pages.testGroup.title"
        description-key="pages.testGroup.description"
      />
      <div class="flex justify-end pb-2">
        <ButtonWithIcon variant="outlined" height="40"
          custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
          :prepend-icon="exportIcon" :label="t('common.export')" />
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3"
        >
          <h3 class="text-lg font-bold text-gray-900">{{ t('pages.testGroup.tableTitle') }}</h3>

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
            
            <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
              :prepend-icon="searchIcon" :label="t('common.advancedSearch')" @click="toggleAdvancedFilters" />

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
            <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary" class="small-switch"
              @update:model-value="() => handleStatusToggle(item)" />
          </template>

          <!-- Parent name column -->
          <template #item.parent_name="{ item }">
            <span class="text-gray-700">{{ item.parent_name || '-' }}</span>
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
