<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useI18n } from 'vue-i18n'
import { trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, searchIcon } from "@/components/icons/globalIcons";

const materialMerchantsIcon = `<svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const { t } = useI18n()
const router = useRouter();
const api = useApi();

interface TableHeader {
  key: string;
  title: string;
  width?: string;
}

interface MaterialMerchant {
  id: number;
  business_name: string;
  buisnessno: string;
  taxno: string;
  owner_name: string;
  phone: string;
  email: string;
  status: boolean;
  actions: {
    can_update: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_change_status: boolean;
  };
}

interface Pagination {
  next_cursor: string | null;
  previous_cursor: string | null;
  per_page: number;
}

const tableItems = ref<MaterialMerchant[]>([]);
const allHeaders = ref<TableHeader[]>([]);
const shownHeaders = ref<TableHeader[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(true);
const loading = ref(false);
const loadingMore = ref(false);
const header_table = ref('')

const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);

const tableHeaders = computed(() => {
  return shownHeaders.value.map(header => ({
    key: header.key,
    title: header.title,
    width: "140px"
  }));
});

const selectedMaterialMerchants = ref<number[]>([]);
const hasSelectedMaterialMerchants = computed(() => selectedMaterialMerchants.value.length > 0);

const showAdvancedFilters = ref(false);
const filterBusinessName = ref("");
const filterBusinessNo = ref("");
const filterTaxNo = ref("");
const filterOwnerName = ref("");
const filterPhone = ref("");
const filterEmail = ref("");
const filterStatus = ref<string | null>(null);

const statusItems = ref<Array<{ title: string; value: boolean | number }>>([
  { title: 'فعال', value: 1 },
  { title: 'غير فعال', value: 0 }
]);

const showHeadersMenu = ref(false);
const updatingHeaders = ref(false);
const headerCheckStates = computed(() => {
  const states: Record<string, boolean> = {};
  allHeaders.value.forEach(header => {
    states[header.key] = shownHeaders.value.some(h => h.key === header.key);
  });
  return states;
});
const showBulkDeleteDialog = ref(false);
const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<MaterialMerchant | null>(null);

const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

const fetchMaterialMerchants = async (append = false) => {
  if (append) loadingMore.value = true;
  else loading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('per_page', String(perPage.value));
    if (append && nextCursor.value) params.append('cursor', nextCursor.value);

    if (filterBusinessName.value) params.append('business_name', filterBusinessName.value);
    if (filterBusinessNo.value) params.append('buisnessno', filterBusinessNo.value);
    if (filterTaxNo.value) params.append('taxno', filterTaxNo.value);
    if (filterOwnerName.value) params.append('owner_name', filterOwnerName.value);
    if (filterPhone.value) params.append('phone', filterPhone.value);
    if (filterEmail.value) params.append('email', filterEmail.value);
    if (filterStatus.value !== null) params.append('status', String(filterStatus.value));

    const url = `/material-merchants?${params.toString()}`;
    const response = await api.get(url);

    if (append) {
      tableItems.value = [...tableItems.value, ...response.data];
    } else {
      tableItems.value = response.data;
      allHeaders.value = response.headers.filter((h: TableHeader) => h.key !== 'id' && h.key !== 'actions');
      shownHeaders.value = response.shownHeaders.filter((h: TableHeader) => h.key !== 'id' && h.key !== 'actions');
      canCreate.value = response.actions.can_create;
      canBulkDelete.value = response.actions.can_bulk_delete ?? false;
      header_table.value = response.header_table
    }

    nextCursor.value = response.pagination?.next_cursor ?? null;
  } catch (err: any) {
    console.error('Error fetching material merchants:', err);
    toast.error(err?.response?.data?.message || 'فشل تحميل تجار المواد');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const handleEdit = (item: any) => {
  router.push({ name: 'MaterialMerchantsEdit', params: { id: item.id } });
};


const deleteLoading = ref(false);

const confirmDelete = async (item: any) => {
  try {
    deleteLoading.value = true;
    await api.delete(`/material-merchants/${item.id}`);
    toast.success('تم حذف تاجر المواد بنجاح');
    await fetchMaterialMerchants();
  } catch (err: any) {
    console.error('Error deleting material merchant:', err);
    toast.error(err?.response?.data?.message || 'فشل حذف تاجر المواد');
  } finally {
    deleteLoading.value = false;
  }
};


const handleStatusChange = (item: any) => {
  itemToChangeStatus.value = { ...item }
  showStatusChangeDialog.value = true
}

const confirmStatusChange = async () => {
  if (!itemToChangeStatus.value) return;

  try {
    statusChangeLoading.value = true;
    const newStatus = !itemToChangeStatus.value.status;

    await api.patch(`/material-merchants/${itemToChangeStatus.value.id}/change-status`, {
      status: newStatus
    });

    toast.success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} تاجر المواد بنجاح`);

    const index = tableItems.value.findIndex(c => c.id === itemToChangeStatus.value!.id);
    if (index !== -1) {
      tableItems.value[index].status = newStatus;
    }

  } catch (err: any) {
    console.error('Error changing material merchant status:', err);
    toast.error(err?.response?.data?.message || 'فشل تغيير حالة تاجر المواد');
  } finally {
    statusChangeLoading.value = false;
    showStatusChangeDialog.value = false;
    itemToChangeStatus.value = null;
  }
};

// const fetchConstants = async () => {
//   try {
//     const response = await api.get('/material-merchants/constants');

//     statusItems.value = [
//       { title: 'فعال', value: 1 },
//       { title: 'غير فعال', value: 0 }
//     ];
//   } catch (err: any) {
//     console.error('Fetch constants error:', err);
//     toast.error(err?.response?.data?.message || 'فشل تحميل الثوابت');
//   }
// };

const handleBulkDelete = () => {
  if (selectedMaterialMerchants.value.length === 0) return;
  showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  if (selectedMaterialMerchants.value.length === 0) return;

  try {
    deleteLoading.value = true;
    await api.post('/material-merchants/bulk-delete', {
      ids: selectedMaterialMerchants.value
    });
    toast.success(`تم حذف ${selectedMaterialMerchants.value.length} تاجر مواد بنجاح`);
    selectedMaterialMerchants.value = [];
    showBulkDeleteDialog.value = false;
    await fetchMaterialMerchants();
  } catch (err: any) {
    console.error('Error bulk deleting:', err);
    toast.error(err?.response?.data?.message || 'فشل حذف تجار المواد');
  } finally {
    deleteLoading.value = false;
  }
};

const handleSelectMaterialMerchant = (item: any, selected: boolean) => {
  if (selected) {
    selectedMaterialMerchants.value.push(item.id);
  } else {
    selectedMaterialMerchants.value = selectedMaterialMerchants.value.filter((id) => id !== item.id);
  }

};

const handleSelectAllMaterialMerchants = (checked: boolean) => {
  if (checked) {
    selectedMaterialMerchants.value = tableItems.value.map((item) => item.id);
  } else {
    selectedMaterialMerchants.value = [];
  }

};

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

    await api.post('/headers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (err: any) {
    console.error('Error updating headers:', err);
    toast.error(err?.response?.data?.message || 'Failed to update headers');
  } finally {
    updatingHeaders.value = false;
  }
};

const applyFilters = () => {
  fetchMaterialMerchants();
};

const resetFilters = () => {
  filterBusinessName.value = "";
  filterBusinessNo.value = "";
  filterTaxNo.value = "";
  filterOwnerName.value = "";
  filterPhone.value = "";
  filterEmail.value = "";
  filterStatus.value = null;
  fetchMaterialMerchants();
};

const setupInfiniteScroll = () => {
  if (!loadMoreTrigger.value) return;
  observer.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasMoreData.value && !loadingMore.value && !loading.value) {
        fetchMaterialMerchants(true);
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

onMounted(() => {
  fetchMaterialMerchants();
  nextTick(() => setupInfiniteScroll());
});

onBeforeUnmount(() => {
  cleanupInfiniteScroll();
});

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

</script>

<template>
  <default-layout>
    <div class="material-merchants-page">
      <PageHeader :icon="materialMerchantsIcon" title-key="pages.materialMerchants.title"
        description-key="pages.materialMerchants.description" />

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
        <div :class="hasSelectedMaterialMerchants ? 'justify-between' : 'justify-end'"
          class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
          <div v-if="hasSelectedMaterialMerchants"
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
            <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
              :prepend-icon="searchIcon" :label="t('common.advancedSearch')" @click="toggleAdvancedFilters" />
          </div>
        </div>

        <div v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
          <div class="flex flex-wrap xl:!flex-nowrap gap-3 justify-end sm:justify-start">
            <v-text-field v-model="filterBusinessName" density="comfortable" variant="outlined" hide-details
              placeholder="اسم الشركة" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            <v-text-field v-model="filterBusinessNo" density="comfortable" variant="outlined" hide-details
              placeholder="رقم السجل" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            <v-text-field v-model="filterTaxNo" density="comfortable" variant="outlined" hide-details
              placeholder="الرقم الضريبي" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            <v-text-field v-model="filterOwnerName" density="comfortable" variant="outlined" hide-details
              placeholder="اسم المالك" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            <v-text-field v-model="filterPhone" density="comfortable" variant="outlined" hide-details
              placeholder="الهاتف" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            <v-text-field v-model="filterEmail" density="comfortable" variant="outlined" hide-details
              placeholder="البريد الإلكتروني" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            <v-select v-model="filterStatus" :items="statusItems" density="comfortable" variant="outlined" hide-details
              placeholder="الحالة" class="w-full sm:w-40 bg-white" @update:model-value="applyFilters" />

            <div class="flex gap-2 items-center">
              <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                custom-class="px-5 font-semibold !text-white text-sm sm:text-base" :prepend-icon="searchIcon"
                label="ابحث" @click="applyFilters" />
              <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />
            </div>
          </div>
        </div>

        <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" :show-checkbox="canBulkDelete"
          show-actions @edit="handleEdit" @delete="confirmDelete" @select="handleSelectMaterialMerchant"
          @selectAll="handleSelectAllMaterialMerchants">
          <template #item.is_active="{ item }">
            <v-switch :model-value="item.status" hide-details inset density="compact" color="primary"
              class="small-switch" @update:model-value="() => handleStatusChange(item)"
              v-if="item.actions.can_change_status" />
            <span v-else class="text-sm text-gray-600">--</span>

          </template>

        </DataTable>

        <div ref="loadMoreTrigger" class="h-4"></div>
        <div v-if="loadingMore" class="flex justify-center items-center py-4">
          <v-progress-circular indeterminate color="primary" size="32" />
          <span class="mr-2 text-gray-600">جاري تحميل المزيد...</span>
        </div>
      </div>

    </div>

    <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading" title="حذف تجار المواد"
      :message="`هل أنت متأكد من حذف ${selectedMaterialMerchants.length} تاجر مواد؟`" @confirm="confirmBulkDelete" />

    <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
      :item-name="itemToChangeStatus?.business_name" :current-status="itemToChangeStatus?.status || false"
      @confirm="confirmStatusChange" />

  </default-layout>
</template>

<style scoped>
.material-merchants-list-page {
  padding: 20px;
}
</style>
