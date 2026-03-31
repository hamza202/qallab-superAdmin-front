<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useApi } from '@/composables/useApi';
import { useI18n } from "vue-i18n";

interface Category {
  id: number;
  name: string;
}

export interface FuelProductToAdd {
  item_id: number;
  item_name: string;
  unit_id: number | null;
  unit_name: string;
  quantity: number | null;
  transport_type: number | null;
  transport_type_name?: string;
  supply_type?: string | null;
  supply_type_name?: string;
  notes: string;
  isAdded?: boolean;
  id?: number;
  trip_no?: number | null;
  unit_price?: number | null;
  discount?: number | null;
  _categoryId?: number;
}

const props = defineProps<{
  modelValue: boolean;
  materialType?: number;
  unitItems?: any[];
  fillingsOptions?: any[];
  supplyTypeOptions?: any[];
  editProduct?: FuelProductToAdd | null;
  existingProducts?: FuelProductToAdd[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [products: FuelProductToAdd[]];
  "productUpdated": [product: FuelProductToAdd];
}>();

const api = useApi();
const { t } = useI18n();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const isEditMode = computed(() => !!props.editProduct);

const categoriesLoading = ref(false);
const itemsLoading = ref(false);
const categories = ref<Category[]>([]);
const activeTabId = ref<number | null>(null);
const searchQuery = ref('');
const showFullCategory = ref(false);
const visibleTabsCount = 6;
const loadedCategoryIds = ref<Set<number>>(new Set());

const productsList = ref<FuelProductToAdd[]>([]);
const editProductData = ref<FuelProductToAdd | null>(null);

const manuallyUnchecked = ref<Set<number>>(new Set());

const unitItemsList = computed(() => props.unitItems || []);
const fillingsOptionsList = computed(() => props.fillingsOptions || []);
const supplyTypeOptionsList = computed(() => props.supplyTypeOptions || []);

const displayedTabs = computed(() => {
  if (showFullCategory.value) return categories.value;
  return categories.value.slice(0, visibleTabsCount);
});

const filteredProducts = computed(() => {
  let filtered = productsList.value;
  if (activeTabId.value !== null) {
    filtered = filtered.filter(product => product._categoryId === activeTabId.value);
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase();
    filtered = filtered.filter(product => product.item_name.toLowerCase().includes(query));
  }
  return filtered;
});

const canAddProduct = (product: FuelProductToAdd): boolean => {
  const hasQty = product.quantity != null && Number(product.quantity) > 0;
  const hasUnit = !!product.unit_id;
  return !!(hasQty && hasUnit);
};

const fetchCategories = async () => {
  categoriesLoading.value = true;
  try {
    const mt = props.materialType ?? 2;
    const res = await api.get<any>(`/categories/list?material_type=${mt}`);
    if (Array.isArray(res.data)) {
      categories.value = res.data;
      if (categories.value.length > 0) {
        activeTabId.value = categories.value[0].id;
      }
    }
  } catch (e) {
    console.error('Error fetching categories:', e);
    categories.value = [];
  } finally {
    categoriesLoading.value = false;
  }
};

const fetchCategoryItems = async (categoryId: number) => {
  if (loadedCategoryIds.value.has(categoryId)) return;

  itemsLoading.value = true;
  try {
    const mt = props.materialType ?? 2;
    const res = await api.get<any>(`/items/list?material_type=${mt}&category_id=${categoryId}`);
    if (Array.isArray(res.data)) {
      const newProducts: FuelProductToAdd[] = [];
      res.data.forEach((item: any) => {
        const isAlreadyInTable = props.existingProducts?.some(p => p.item_id === item.id);
        if (isAlreadyInTable) return;

        if (!productsList.value.some(p => p.item_id === item.id)) {
          const product: FuelProductToAdd = {
            item_id: item.id,
            item_name: item.name,
            unit_id: null,
            unit_name: '',
            quantity: null,
            transport_type: null,
            transport_type_name: '',
            supply_type: null,
            supply_type_name: '',
            notes: '',
            isAdded: false,
            trip_no: null,
            unit_price: null,
            discount: null,
            _categoryId: categoryId,
          };
          newProducts.push(product);
          productsList.value.push(product);
        }
      });
      loadedCategoryIds.value.add(categoryId);

      if (newProducts.length === 0) {
        categories.value = categories.value.filter(c => c.id !== categoryId);
        if (activeTabId.value === categoryId && categories.value.length > 0) {
          activeTabId.value = categories.value[0].id;
        }
      }
    }
  } catch (e) {
    console.error('Error fetching category items:', e);
  } finally {
    itemsLoading.value = false;
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (isEditMode.value && props.editProduct) {
      editProductData.value = { ...props.editProduct };
    } else {
      fetchCategories();
    }
  }
});

watch(activeTabId, (newId) => {
  if (newId !== null && !isEditMode.value) {
    fetchCategoryItems(newId);
  }
});

const toggleCategories = () => {
  showFullCategory.value = !showFullCategory.value;
};

const toggleProduct = (product: FuelProductToAdd) => {
  // Toggle isAdded state (mark/unmark for batch save)
  if (product.isAdded) {
    product.isAdded = false;
    manuallyUnchecked.value.add(product.item_id);
  } else {
    if (canAddProduct(product)) {
      const unit = unitItemsList.value.find((u: any) => u.value === product.unit_id);
      product.unit_name = unit?.title || '';
      const filling = fillingsOptionsList.value.find((f: any) => f.value === product.transport_type);
      product.transport_type_name = filling?.title || '';
      const supply = supplyTypeOptionsList.value.find((s: any) => s.value === product.supply_type);
      product.supply_type_name = supply?.title || '';
      product.isAdded = true;
      manuallyUnchecked.value.delete(product.item_id);
    }
  }
  // Note: No emit here - will emit all at once when clicking "تم"
};

// Auto-check product when required fields are filled (unless manually unchecked)
const shouldAutoCheck = (product: FuelProductToAdd): boolean => {
  return canAddProduct(product) && !product.isAdded && !manuallyUnchecked.value.has(product.item_id);
};

// Check if product should show as checked (either manually or auto)
const isProductChecked = (product: FuelProductToAdd): boolean => {
  if (product.isAdded) return true;
  if (shouldAutoCheck(product)) {
    // Auto-fill names when auto-checking
    const unit = unitItemsList.value.find((u: any) => u.value === product.unit_id);
    product.unit_name = unit?.title || '';
    const filling = fillingsOptionsList.value.find((f: any) => f.value === product.transport_type);
    product.transport_type_name = filling?.title || '';
    const supply = supplyTypeOptionsList.value.find((s: any) => s.value === product.supply_type);
    product.supply_type_name = supply?.title || '';
    product.isAdded = true;
    return true;
  }
  return false;
};

const handleEditSave = () => {
  if (editProductData.value && canAddProduct(editProductData.value)) {
    const unit = unitItemsList.value.find((u: any) => u.value === editProductData.value!.unit_id);
    editProductData.value.unit_name = unit?.title || '';
    const filling = fillingsOptionsList.value.find((f: any) => f.value === editProductData.value!.transport_type);
    editProductData.value.transport_type_name = filling?.title || '';
    const supply = supplyTypeOptionsList.value.find((s: any) => s.value === editProductData.value!.supply_type);
    editProductData.value.supply_type_name = supply?.title || '';
    emit('productUpdated', editProductData.value);
    closeDialog();
  }
};

const resetForm = () => {
  categories.value = [];
  productsList.value = [];
  activeTabId.value = null;
  searchQuery.value = '';
  showFullCategory.value = false;
  manuallyUnchecked.value.clear();
  editProductData.value = null;
  loadedCategoryIds.value.clear();
};

const closeDialog = () => {
  internalOpen.value = false;
  resetForm();
};

const handleDone = () => {
  if (isEditMode.value) {
    handleEditSave();
  } else {
    const newlyAdded = productsList.value.filter(p => p.isAdded);
    const existing = (props.existingProducts || []).map(ep => ({ ...ep, isAdded: true as boolean | undefined }));
    const productsToSave = [...existing, ...newlyAdded];

    emit('saved', productsToSave);
    closeDialog();
  }
};

const handleCancel = () => closeDialog();

const cubeIcon = `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.5 6.13379L9.99997 10.856M9.99997 10.856L1.49997 6.13379M9.99997 10.856L10 20.356M19 14.9146V6.79749C19 6.45484 19 6.28352 18.9495 6.13072C18.9049 5.99555 18.8318 5.87147 18.7354 5.76678C18.6263 5.64844 18.4766 5.56524 18.177 5.39883L10.777 1.28772C10.4934 1.13017 10.3516 1.05139 10.2015 1.0205C10.0685 0.993166 9.93146 0.993166 9.79855 1.0205C9.64838 1.05139 9.50658 1.13017 9.22297 1.28772L1.82297 5.39884C1.52345 5.56524 1.37369 5.64844 1.26463 5.76678C1.16816 5.87147 1.09515 5.99555 1.05048 6.13073C1 6.28352 1 6.45485 1 6.79749V14.9146C1 15.2572 1 15.4286 1.05048 15.5814C1.09515 15.7165 1.16816 15.8406 1.26463 15.9453C1.37369 16.0636 1.52345 16.1468 1.82297 16.3132L9.22297 20.4244C9.50658 20.5819 9.64838 20.6607 9.79855 20.6916C9.93146 20.7189 10.0685 20.7189 10.2015 20.6916C10.3516 20.6607 10.4934 20.5819 10.777 20.4244L18.177 16.3132C18.4766 16.1468 18.6263 16.0636 18.7354 15.9453C18.8318 15.8406 18.9049 15.7165 18.9495 15.5814C19 15.4286 19 15.2572 19 14.9146Z" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const arrowDownIcon = `<svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.833008 0.833374L5.83301 5.83337L10.833 0.833374" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const searchIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 19L14.65 14.65M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const checkIcon = `<svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 1L6 12L1 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIconDisabled = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <AppDialog v-model="internalOpen" :max-width="900">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="!bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <span v-html="cubeIcon"></span>
        </span>
        {{ isEditMode ? t('common.productDialog.editProduct') : t('common.productDialog.addProduct') }}
      </div>
    </template>

    <div v-if="categoriesLoading" class="flex items-center justify-center py-20">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Edit mode -->
    <div v-else-if="isEditMode && editProductData" class="space-y-1 min-h-[200px]">
      <div class="flex gap-3 rounded-lg border !border-gray-100 p-3 bg-white">
        <div class="col-span-1 flex items-center justify-center gap-1">
          <ButtonWithIcon
            :icon="checkIcon"
            icon-only
            color="primary"
            variant="flat"
            @click="handleEditSave"
            :disabled="!canAddProduct(editProductData)"
            class="!h-full"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center gap-3 flex-1">
          <div class="sm:col-span-2 md:col-span-4 font-medium text-gray-900">
            {{ editProductData.item_name }}
          </div>
          <div>
            <TextInput v-model="editProductData.quantity" type="number" :placeholder="t('common.productDialog.quantity')" density="compact" class="min-w-[170px]" />
          </div>
          <div>
            <SelectInput v-model="editProductData.unit_id" :items="unitItemsList" :placeholder="t('common.productDialog.unit')" density="compact" class="min-w-[170px]" item-title="title" item-value="value" />
          </div>
          <div>
            <SelectInput v-model="editProductData.transport_type" :items="fillingsOptionsList" :placeholder="t('purchases.requests.fuels.form.tableHeaders.packaging')" density="compact" class="min-w-[170px]" item-title="title" item-value="value" />
          </div>
          <div>
            <SelectInput
              :model-value="editProductData.supply_type ?? null"
              @update:model-value="(v) => { if (editProductData) editProductData.supply_type = Array.isArray(v) ? v[0] : v }"
              :items="supplyTypeOptionsList"
              :placeholder="t('purchases.requests.fuels.form.tableHeaders.supplyType')"
              density="compact"
              class="min-w-[170px]"
              item-title="title"
              item-value="value"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!isEditMode && categories.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <v-icon size="64" color="gray-400">mdi-package-variant-closed</v-icon>
      <p class="mt-4 text-lg font-medium">{{ t('common.ui.noData') }}</p>
    </div>

    <template v-else-if="!isEditMode">
      <div class="flex gap-2 mb-6">
        <div class="flex flex-wrap items-center gap-2 mb-6">
          <ButtonWithIcon
            v-for="category in displayedTabs"
            :key="category.id"
            :class="activeTabId === category.id ? 'bg-primary-600 !text-white' : '!bg-gray-100 !text-gray-500'"
            class="!font-bold !rounded-lg px-6"
            height="40"
            @click="activeTabId = category.id"
            size="small"
          >
            {{ category.name }}
          </ButtonWithIcon>
        </div>
        <ButtonWithIcon
          v-if="categories.length > visibleTabsCount"
          icon-only
          :icon="arrowDownIcon"
          color="primary"
          size="x-small"
          height="40"
          class="ms-auto"
          :class="{ 'rotate-180': showFullCategory }"
          @click="toggleCategories"
        />
      </div>

      <div class="mb-3">
        <TextInput v-model="searchQuery" :placeholder="t('common.productDialog.searchProducts')" density="comfortable">
          <template #prepend-inner>
            <v-icon v-html="searchIcon"></v-icon>
          </template>
        </TextInput>
      </div>

      <div v-if="itemsLoading" class="flex items-center justify-center py-10 min-h-[250px]">
        <v-progress-circular indeterminate color="primary" size="32" />
      </div>

      <div v-else class="space-y-1 max-h-[400px] min-h-[250px] overflow-auto custom-scroll">
        <div v-for="product in filteredProducts" :key="product.item_id">
          <div class="flex gap-3 rounded-lg border !border-gray-100 p-3 bg-white">
            <div class="col-span-1 flex items-center justify-center gap-1">
              <ButtonWithIcon
                v-if="isProductChecked(product)"
                :icon="checkIcon"
                icon-only
                color="success"
                variant="flat"
                @click="toggleProduct(product)"
                class="!h-full"
              />
              <ButtonWithIcon
                v-else-if="canAddProduct(product)"
                :icon="plusIcon"
                icon-only
                color="primary"
                variant="flat"
                @click="toggleProduct(product)"
                class="!h-full"
              />
              <ButtonWithIcon
                v-else
                :icon="plusIconDisabled"
                icon-only
                color="gray"
                variant="flat"
                disabled
                class="!h-full"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center gap-3 flex-1">
              <div class="sm:col-span-2 md:col-span-4 font-medium text-gray-900">
                {{ product.item_name }}
              </div>
              <div>
                <TextInput v-model="product.quantity" type="number" :placeholder="t('common.productDialog.quantity')" density="compact" class="min-w-[170px]" />
              </div>
              <div>
                <SelectInput v-model="product.unit_id" :items="unitItemsList" :placeholder="t('common.productDialog.unit')" density="compact" class="min-w-[170px]" item-title="title" item-value="value" />
              </div>
              <div>
                <SelectInput v-model="product.transport_type" :items="fillingsOptionsList" :placeholder="t('purchases.requests.fuels.form.tableHeaders.packaging')" density="compact" class="min-w-[170px]" item-title="title" item-value="value" />
              </div>
              <div>
                <SelectInput
                  :model-value="product.supply_type ?? null"
                  @update:model-value="(v) => (product.supply_type = Array.isArray(v) ? v[0] : v)"
                  :items="supplyTypeOptionsList"
                  :placeholder="t('purchases.requests.fuels.form.tableHeaders.supplyType')"
                  density="compact"
                  class="min-w-[170px]"
                  item-title="title"
                  item-value="value"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex items-center justify-center gap-4 flex-1 mt-4">
        <ButtonWithIcon
          variant="flat"
          color="primary"
          size="large"
          custom-class="px-8"
          :label="isEditMode ? t('common.productDialog.saveChanges') : t('purchases.shared.forms.common.actions.addProduct')"
          @click="handleDone"
          :disabled="!!(isEditMode && editProductData && !canAddProduct(editProductData))"
        />
        <ButtonWithIcon variant="outlined" color="gray-700" border="gray-300" size="large" custom-class="px-4" :label="t('common.actions.cancel')" @click="handleCancel" />
      </div>
    </template>
  </AppDialog>
</template>

<style scoped>
:deep(.v-field__input) {
  min-height: 36px !important;
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 999px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
