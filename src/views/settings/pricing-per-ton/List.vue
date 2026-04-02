<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog.vue";
import StatusChangeDialog from "@/components/common/StatusChangeDialog.vue";

const { t } = useI18n()

interface PricingPerTon {
  id: number;
  central_location: string;
  city: string;
  direction: string;
  min_distance_km: number;
  max_distance_km: number;
  material_type: string;
  weight_ton: number;
  price_per_ton: number;
  is_active: boolean;
  actions: {
    can_update: boolean;
    can_delete: boolean;
    can_change_status: boolean;
  };
}

interface TableHeader {
  key: string;
  title: string;
  sortable?: boolean;
}

const pricingIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28 8C28 10.2091 24.4183 12 20 12C15.5817 12 12 10.2091 12 8M28 8C28 5.79086 24.4183 4 20 4C15.5817 4 12 5.79086 12 8M28 8V12M12 8V20C12 22.21 15.58 24 20 24M12 14C12 16.21 15.58 18 20 18C24.42 18 28 16.21 28 14" stroke="#1570EF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 22C36 24.2091 32.4183 26 28 26C23.5817 26 20 24.2091 20 22M36 22C36 19.7909 32.4183 18 28 18C23.5817 18 20 19.7909 20 22M36 22V36C36 38.21 32.42 40 28 40C23.58 40 20 38.21 20 36V22M36 28C36 30.21 32.42 32 28 32C23.58 32 20 30.21 20 28" stroke="#1570EF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const demoData: PricingPerTon[] = [
  {
    id: 1,
    central_location: 'مجمع الحمر',
    city: 'جدة',
    direction: 'شمال',
    min_distance_km: 10,
    max_distance_km: 50,
    material_type: 'رمل',
    weight_ton: 1000,
    price_per_ton: 150,
    is_active: true,
    actions: { can_update: true, can_delete: true, can_change_status: true }
  },
  {
    id: 2,
    central_location: 'مجمع النور',
    city: 'الرياض',
    direction: 'جنوب',
    min_distance_km: 5,
    max_distance_km: 30,
    material_type: 'حصى',
    weight_ton: 800,
    price_per_ton: 200,
    is_active: true,
    actions: { can_update: true, can_delete: true, can_change_status: true }
  },
  {
    id: 3,
    central_location: 'مجمع الصفا',
    city: 'مكة',
    direction: 'شرق',
    min_distance_km: 15,
    max_distance_km: 40,
    material_type: 'اسمنت',
    weight_ton: 1200,
    price_per_ton: 180,
    is_active: false,
    actions: { can_update: true, can_delete: true, can_change_status: true }
  },
  {
    id: 4,
    central_location: 'مجمع البحر',
    city: 'الدمام',
    direction: 'غرب',
    min_distance_km: 20,
    max_distance_km: 60,
    material_type: 'رمل',
    weight_ton: 900,
    price_per_ton: 120,
    is_active: true,
    actions: { can_update: true, can_delete: true, can_change_status: true }
  },
  {
    id: 5,
    central_location: 'مجمع الخليج',
    city: 'جدة',
    direction: 'شمال',
    min_distance_km: 25,
    max_distance_km: 70,
    material_type: 'حديد',
    weight_ton: 1500,
    price_per_ton: 350,
    is_active: true,
    actions: { can_update: true, can_delete: true, can_change_status: true }
  },
];

const allHeaders: TableHeader[] = [
  { key: 'central_location', title: 'الموقع المركزي' },
  { key: 'city', title: 'المدينة' },
  { key: 'direction', title: 'الاتجاه' },
  { key: 'min_distance_km', title: 'أقل مسافة "كم"' },
  { key: 'max_distance_km', title: 'أقصى مسافة "كم"' },
  { key: 'material_type', title: 'نوع المادة' },
  { key: 'weight_ton', title: 'الوزن/طن' },
  { key: 'price_per_ton', title: 'السعر/طن' },
  { key: 'is_active', title: 'الحالة' },
];

const tableItems = ref<PricingPerTon[]>([]);
const shownHeaders = ref<TableHeader[]>([...allHeaders]);
const canCreate = ref(true);
const canBulkDelete = ref(true);
const loading = ref(false);

const tableHeaders = computed(() => shownHeaders.value);

const showHeadersMenu = ref(false);
const updatingHeaders = ref(false);

const headerCheckStates = computed(() => {
  const states: Record<string, boolean> = {};
  allHeaders.forEach(header => {
    states[header.key] = shownHeaders.value.some(sh => sh.key === header.key);
  });
  return states;
});

const showAdvancedFilters = ref(false);
const filterCentralLocation = ref("");
const filterCity = ref("");
const filterMaterialType = ref("");

const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<PricingPerTon | null>(null);

const showFormDialog = ref(false);
const editingItemId = ref<number | null>(null);

const selectedItems = ref<number[]>([]);
const hasSelectedItems = computed(() => selectedItems.value.length > 0);

const loadMoreTrigger = ref<HTMLElement | null>(null);

const fetchData = async () => {
  loading.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredData = [...demoData];
  
  if (filterCentralLocation.value) {
    filteredData = filteredData.filter(item => 
      item.central_location.includes(filterCentralLocation.value)
    );
  }
  if (filterCity.value) {
    filteredData = filteredData.filter(item => 
      item.city.includes(filterCity.value)
    );
  }
  if (filterMaterialType.value) {
    filteredData = filteredData.filter(item => 
      item.material_type.includes(filterMaterialType.value)
    );
  }
  
  tableItems.value = filteredData;
  loading.value = false;
};

const applyFilters = () => {
  fetchData();
};

const resetFilters = () => {
  filterCentralLocation.value = '';
  filterCity.value = '';
  filterMaterialType.value = '';
  fetchData();
};

const toggleHeader = (headerKey: string) => {
  const isCurrentlyShown = shownHeaders.value.some(h => h.key === headerKey);

  if (isCurrentlyShown) {
    shownHeaders.value = shownHeaders.value.filter(h => h.key !== headerKey);
  } else {
    const headerToAdd = allHeaders.find(h => h.key === headerKey);
    if (headerToAdd) {
      shownHeaders.value.push(headerToAdd);
    }
  }
};

const openCreateForm = () => {
  editingItemId.value = null;
  showFormDialog.value = true;
};

const handleEdit = (item: PricingPerTon) => {
  editingItemId.value = item.id;
  showFormDialog.value = true;
};

const handleDelete = async (item: PricingPerTon) => {
  tableItems.value = tableItems.value.filter(i => i.id !== item.id);
};

const handleStatusChange = (item: PricingPerTon) => {
  itemToChangeStatus.value = { ...item };
  showStatusChangeDialog.value = true;
};

const confirmStatusChange = async () => {
  if (!itemToChangeStatus.value) return;

  statusChangeLoading.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newStatus = !itemToChangeStatus.value.is_active;
  const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id);
  if (index !== -1) {
    tableItems.value[index].is_active = newStatus;
  }
  
  statusChangeLoading.value = false;
  showStatusChangeDialog.value = false;
  itemToChangeStatus.value = null;
};

const handleBulkDelete = () => {
  if (selectedItems.value.length === 0) return;
  showDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  if (deleteLoading.value) return;

  deleteLoading.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  tableItems.value = tableItems.value.filter(item => !selectedItems.value.includes(item.id));
  selectedItems.value = [];
  
  deleteLoading.value = false;
  showDeleteDialog.value = false;
};

const handleSelectItem = (item: PricingPerTon, selected: boolean) => {
  if (selected) {
    if (!selectedItems.value.includes(item.id)) {
      selectedItems.value.push(item.id);
    }
  } else {
    selectedItems.value = selectedItems.value.filter((id) => id !== item.id);
  }
};

const handleSelectAllItems = (selected: boolean) => {
  if (selected) {
    selectedItems.value = tableItems.value.map((item) => item.id);
  } else {
    selectedItems.value = [];
  }
};

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

onMounted(() => {
  fetchData();
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

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <default-layout>
    <div class="pricing-per-ton-page">
      <PageHeader :icon="pricingIcon" title-key="pages.pricingPerTon.title"
        description-key="pages.pricingPerTon.description" />

      <div
        class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
        <ButtonWithIcon variant="flat" height="40" rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
          :prepend-icon="exportIcon" :label="t('common.actions.export')" />
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div :class="hasSelectedItems ? 'justify-between' : 'justify-end'"
          class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
          <div v-if="hasSelectedItems"
            class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
            <ButtonWithIcon variant="flat" height="40" rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_1_icon" color="white" :label="t('common.table.deleteSelected')" @click="handleBulkDelete" />
            <div class="w-px bg-gray-200"></div>
            <ButtonWithIcon variant="flat" height="40" rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_2_icon" color="white" :label="t('common.actions.delete')" @click="handleBulkDelete" />
          </div>

          <div class="flex flex-wrap gap-3">
            <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500" height="40"
                  custom-class="font-semibold text-base border-gray-400" :prepend-icon="columnIcon"
                  :label="t('common.table.columns')" append-icon="mdi-chevron-down" />
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
              :prepend-icon="searchIcon" :label="t('common.table.advancedSearch')" @click="toggleAdvancedFilters" />

            <ButtonWithIcon v-if="canCreate" variant="flat" color="primary-100" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
              :prepend-icon="plusIcon" :label="t('common.form.addNew')" @click="openCreateForm" />
          </div>
        </div>

        <div v-if="showAdvancedFilters" class="border-b border-gray-300 px-4 sm:px-6 py-4 bg-white">
          <div class="flex flex-wrap gap-3 justify-between">
            <div class="flex gap-3 flex-wrap">
              <TextInput v-model="filterCentralLocation" density="comfortable" variant="outlined" hide-details
                placeholder="الموقع المركزي" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
              <TextInput v-model="filterCity" density="comfortable" variant="outlined" hide-details
                placeholder="المدينة" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
              <TextInput v-model="filterMaterialType" density="comfortable" variant="outlined" hide-details
                placeholder="نوع المادة" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            </div>

            <div class="flex gap-2 items-center">
              <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                custom-class="px-5 font-semibold !text-white text-sm sm:text-base" :prepend-icon="searchIcon"
                :label="t('common.actions.search')" @click="applyFilters" />

              <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                prepend-icon="mdi-refresh" :label="t('common.actions.reset')" @click="resetFilters" />
            </div>
          </div>
        </div>

        <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" :show-checkbox="canBulkDelete" show-actions
          @delete="handleDelete" @edit="handleEdit" @select="handleSelectItem"
          @selectAll="handleSelectAllItems" :confirm-delete="true">
          <template #item.is_active="{ item }">
            <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
              class="small-switch" @update:model-value="() => handleStatusChange(item)"
              v-if="item.actions?.can_change_status" />
            <span v-else class="text-sm text-gray-600">--</span>
          </template>
          <template #item.price_per_ton="{ item }">
            <span class="font-medium">{{ item.price_per_ton }} ريال</span>
          </template>
          <template #item.weight_ton="{ item }">
            <span>{{ item.weight_ton }} طن</span>
          </template>
          <template #item.min_distance_km="{ item }">
            <span>{{ item.min_distance_km }} كم</span>
          </template>
          <template #item.max_distance_km="{ item }">
            <span>{{ item.max_distance_km }} كم</span>
          </template>
        </DataTable>

        <div ref="loadMoreTrigger" class="flex justify-center py-8">
        </div>
      </div>
    </div>

    <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" :title="$t('pages.pricingPerTon.deleteDialog.title')"
      :message="$t('pages.pricingPerTon.deleteDialog.message', { count: selectedItems.length })" @confirm="confirmBulkDelete" />

    <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
      :item-name="itemToChangeStatus?.central_location" :current-status="itemToChangeStatus?.is_active"
      @confirm="confirmStatusChange" />
  </default-layout>
</template>

<style scoped></style>
