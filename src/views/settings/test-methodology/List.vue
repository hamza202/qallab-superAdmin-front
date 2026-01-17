<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n'
import testMethodologyService, { type TestMethodology } from '@/services/api/test-methodology.service'
import { useTableColumns } from '@/composables/useTableColumns'
import { useNotification } from '@/composables/useNotification'

const { t } = useI18n()
const router = useRouter()
const { success, error: showError } = useNotification()

// Table columns composable
const {
  allHeaders,
  visibleHeaders,
  updatingHeaders,
  showHeadersMenu,
  headerCheckStates,
  initHeaders,
  toggleHeader,
} = useTableColumns('test_methodologies')

// Loading state
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// Status change dialog
const showStatusChangeDialog = ref(false)
const statusChangeLoading = ref(false)
const itemToChangeStatus = ref<TestMethodology | null>(null)

const testMethodologyIcon = `<svg width="39" height="48" viewBox="0 0 39 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 2.58398V11.5335C23.6667 12.7469 23.6667 13.3537 23.9028 13.8171C24.1105 14.2248 24.442 14.5563 24.8497 14.764C25.3132 15.0002 25.9199 15.0002 27.1333 15.0002H36.0828M28 25.8333H10.6667M28 34.5H10.6667M15 17.1667H10.6667M23.6667 2H12.4C8.75966 2 6.93949 2 5.54906 2.70846C4.32601 3.33163 3.33163 4.32601 2.70846 5.54906C2 6.93949 2 8.75966 2 12.4V34.9333C2 38.5737 2 40.3938 2.70846 41.7843C3.33163 43.0073 4.32601 44.0017 5.54906 44.6249C6.93949 45.3333 8.75966 45.3333 12.4 45.3333H26.2667C29.907 45.3333 31.7272 45.3333 33.1176 44.6249C34.3407 44.0017 35.335 43.0073 35.9582 41.7843C36.6667 40.3938 36.6667 38.5737 36.6667 34.9333V15L23.6667 2Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const testMethodologyTableHeaders = [
  { key: "id", title: "#", width: "60px" },
  { key: "name", title: "الاسم", width: "300px" },
  { key: "description", title: "الوصف", width: "400px" },
  { key: "is_active", title: "الحالة", width: "120px" },
];

const testMethodologyTableItems = ref<TestMethodology[]>([])

// Fetch data from API
const fetchTestMethodologies = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const params: any = {}
    if (filterName.value) params.name = filterName.value
    if (filterStatus.value) {
      params.status = filterStatus.value === 'فعال' ? '1' : '0'
    }
    const response = await testMethodologyService.getList(params)
    testMethodologyTableItems.value = response.data

    // Initialize headers if available from API
    if (response.headers && response.shownHeaders) {
      initHeaders(response.headers, response.shownHeaders)
    }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'حدث خطأ أثناء جلب البيانات'
    showError(errorMessage.value || 'حدث خطأ')
    console.error('Error fetching test methodologies:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTestMethodologies()
})

const openCreateTestMethodology = () => {
  router.push("/settings/test-methodology/create");
};

const handleEditTestMethodology = (item: any) => {
  router.push(`/settings/test-methodology/edit/${item.id}`);
};

const handleDeleteTestMethodology = async (item: any) => {
  try {
    await testMethodologyService.delete(item.id)
    testMethodologyTableItems.value = testMethodologyTableItems.value.filter((t) => t.id !== item.id)
    success('تم حذف المنهجية بنجاح')
  } catch (err: any) {
    showError(err.response?.data?.message || 'حدث خطأ أثناء الحذف')
    console.error('Error deleting test methodology:', err)
  }
};

// Handle status change - open confirmation dialog
const handleStatusChange = (item: any) => {
  itemToChangeStatus.value = { ...item }
  showStatusChangeDialog.value = true
}

// Confirm status change after dialog
const confirmStatusChange = async () => {
  if (!itemToChangeStatus.value) return

  try {
    statusChangeLoading.value = true
    const newStatus = !itemToChangeStatus.value.is_active

    await testMethodologyService.changeStatus(itemToChangeStatus.value.id, newStatus)
    success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} المنهجية بنجاح`)

    // Update local state
    const index = testMethodologyTableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id)
    if (index !== -1) {
      testMethodologyTableItems.value[index].is_active = newStatus
    }
  } catch (err: any) {
    showError(err.response?.data?.message || 'حدث خطأ أثناء تغيير الحالة')
    console.error('Error changing status:', err)
  } finally {
    statusChangeLoading.value = false
    showStatusChangeDialog.value = false
    itemToChangeStatus.value = null
  }
}

const showAdvancedFilters = ref(false);

const filterName = ref("");
const filterStatus = ref(null);

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const handleSearch = () => {
  fetchTestMethodologies()
};

const resetFilters = () => {
  filterName.value = "";
  filterStatus.value = null;
  fetchTestMethodologies()
};

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z"
    stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  <path
    d="M15 13.5V3.5C15 2.72343 15 2.33515 14.8731 2.02886C14.704 1.62048 14.3795 1.29602 13.9711 1.12687C13.6649 1 13.2766 1 12.5 1C11.7234 1 11.3351 1 11.0289 1.12687C10.6205 1.29602 10.296 1.62048 10.1269 2.02886C10 2.33515 10 2.72343 10 3.5V13.5C10 14.2766 10 14.6649 10.1269 14.9711C10.296 15.3795 10.6205 15.704 11.0289 15.8731C11.3351 16 11.7234 16 12.5 16C13.2766 16 13.6649 16 13.9711 15.8731C14.3795 15.704 14.704 15.3795 14.8731 14.9711C15 14.6649 15 14.2766 15 13.5Z"
    stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

</script>

<template>
  <default-layout>
    <div class="test-methodology-list-page">
      <PageHeader :icon="testMethodologyIcon" title-key="منهجية الاختبارات"
        description-key="تمكنك من إدارة منهجية الاختبارات" />

      <div class="bg-gray-50 rounded-md -mx-6">
        <div class="flex flex-wrap items-center justify-between gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
          <h3 class="text-lg font-bold text-gray-900">جدول منهجيات الاختبار</h3>

          <div class="flex flex-wrap gap-3">
            <!-- Column Management -->
            <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500" height="40"
                  custom-class="font-semibold text-base border-gray-400"
                  :prepend-icon="columnIcon" :label="t('common.columns')" append-icon="mdi-chevron-down" />
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
            
            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
              :prepend-icon="plusIcon" label="إضافة منهجية" @click="openCreateTestMethodology" />
          </div>
        </div>

        <div v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
          <div class="flex flex-wrap gap-3 flex-1 justify-between">
            <div class="flex gap-3 flex-1">
              <TextInput v-model="filterName" density="comfortable" variant="outlined" hide-details
                placeholder="الاسم" class="w-full sm:w-60 bg-white" />
              <SelectInput v-model="filterStatus" :items="['فعال', 'غير فعال']" density="comfortable" variant="outlined"
                hide-details placeholder="الحالة" class="w-full sm:w-40 bg-white" />
            </div>
            <div class="flex gap-2 items-center">
              <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                :prepend-icon="searchIcon" label="ابحث" @click="handleSearch" />
              
              <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />
            </div>

          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <v-progress-circular indeterminate color="primary" size="48" />
        </div>

        <!-- Error State -->
        <v-alert v-else-if="errorMessage" type="error" variant="tonal" class="mx-6 my-4" closable>
          {{ errorMessage }}
        </v-alert>

        <!-- Data Table -->
        <DataTable v-else :headers="visibleHeaders.length > 0 ? visibleHeaders : testMethodologyTableHeaders" 
          :items="testMethodologyTableItems" show-actions
          :show-view="false" @edit="handleEditTestMethodology" @delete="handleDeleteTestMethodology">
          <template #item.is_active="{ item }">
            <v-switch :model-value="item.is_active" hide-details inset density="compact" class="small-switch" color="primary-600"
              @update:model-value="() => handleStatusChange(item)" />
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Status Change Confirmation Dialog -->
    <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
      :item-name="itemToChangeStatus?.name" :current-status="itemToChangeStatus?.is_active"
      @confirm="confirmStatusChange" />
  </default-layout>
</template>
