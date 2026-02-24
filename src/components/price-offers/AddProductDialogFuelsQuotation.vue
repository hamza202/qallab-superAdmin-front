<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useApi } from '@/composables/useApi';

interface Category {
  id: number;
  name: string;
}

interface ApiItem {
  id: number;
  name: string;
  category?: Category;
}

export interface FuelQuotationProductToAdd {
  item_id: number;
  item_name: string;
  unit_id: number | null;
  unit_name: string;
  quantity: number | null;
  item_using: string | null; // الاستخدام (from constants - heavy_equipment, etc.)
  item_using_name?: string;
  unit_price: number | null; // سعر الوحدة
  discount: number | null; // الخصم
  discount_type: number | string | null; // نوع الخصم (1 = percentage, 2 = fixed)
  tax_amount: number | null; // الضريبة
  notes: string;
  isAdded?: boolean;
  id?: number;
}

const props = defineProps<{
  modelValue: boolean;
  itemsEndpoint?: string;
  unitItems?: any[];
  /** Options for الاستخدام (item_using) from constants.fillings */
  itemUsingOptions?: any[];
  /** Options for discount type */
  discountTypeOptions?: any[];
  editProduct?: FuelQuotationProductToAdd | null;
  existingProducts?: FuelQuotationProductToAdd[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [products: FuelQuotationProductToAdd[]];
  "productUpdated": [product: FuelQuotationProductToAdd];
}>();

const api = useApi();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const isEditMode = computed(() => !!props.editProduct);

const loading = ref(false);
const items = ref<ApiItem[]>([]);
const categories = ref<Category[]>([]);
const activeTabId = ref<number | null>(null);
const searchQuery = ref('');
const showFullCategory = ref(false);
const visibleTabsCount = 6;

const productsList = ref<FuelQuotationProductToAdd[]>([]);
const editProductData = ref<FuelQuotationProductToAdd | null>(null);

// Track manually unchecked products (to prevent auto-check)
const manuallyUnchecked = ref<Set<number>>(new Set());

const unitItemsList = computed(() => props.unitItems || []);
const itemUsingOptionsList = computed(() => props.itemUsingOptions || []);
const discountTypeOptionsList = computed(() => props.discountTypeOptions || [
  { title: '%', value: 1 },
  { title: 'ريال', value: 2 },
]);

const extractCategories = (list: ApiItem[]): Category[] => {
  const categoryMap = new Map<number, Category>();
  list.forEach(item => {
    if (item.category && !categoryMap.has(item.category.id)) {
      categoryMap.set(item.category.id, item.category);
    }
  });
  return Array.from(categoryMap.values());
};

const displayedTabs = computed(() => {
  if (showFullCategory.value) return categories.value;
  return categories.value.slice(0, visibleTabsCount);
});

const filteredProducts = computed(() => {
  let filtered = productsList.value;
  if (activeTabId.value !== null) {
    filtered = filtered.filter(product => {
      const item = items.value.find(i => i.id === product.item_id);
      return item?.category?.id === activeTabId.value;
    });
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase();
    filtered = filtered.filter(product => product.item_name.toLowerCase().includes(query));
  }
  return filtered;
});

const addedProducts = computed(() => productsList.value.filter(p => p.isAdded));

const canAddProduct = (product: FuelQuotationProductToAdd): boolean => {
  const hasQty = product.quantity != null && Number(product.quantity) > 0;
  const hasUnit = !!product.unit_id;
  const hasPrice = product.unit_price != null && Number(product.unit_price) > 0;
  return !!(hasQty && hasUnit && hasPrice);
};

// Calculate total for a product
// discount_type: 1 = percentage, 2 = fixed
const calculateTotal = (product: FuelQuotationProductToAdd): number => {
  const qty = Number(product.quantity) || 0;
  const price = Number(product.unit_price) || 0;
  const discount = Number(product.discount) || 0;
  const subtotal = qty * price;
  const discountAmount = product.discount_type === 1 ? (subtotal * discount / 100) : discount;
  return Math.max(0, subtotal - discountAmount);
};

const fetchItems = async () => {
  loading.value = true;
  try {
    const url = props.itemsEndpoint || '/items/active-list?with_category=true';
    const res = await api.get<any>(url);
    const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
    items.value = data;
    categories.value = extractCategories(data);

    const mappedProducts = data.map((item: ApiItem) => {
      const existing = props.existingProducts?.find(p => p.item_id === item.id);
      if (existing) return { ...existing, isAdded: true };
      return {
        item_id: item.id,
        item_name: item.name,
        unit_id: null,
        unit_name: '',
        quantity: null,
        item_using: null,
        item_using_name: '',
        unit_price: null,
        discount: null,
        discount_type: 2, // default to fixed (2)
        tax_amount: null,
        notes: '',
        isAdded: false,
      } as FuelQuotationProductToAdd;
    });

    // Sort on dialog open: products with values (isAdded) come first
    productsList.value = mappedProducts.sort((a: FuelQuotationProductToAdd, b: FuelQuotationProductToAdd) => {
      if (a.isAdded && !b.isAdded) return -1;
      if (!a.isAdded && b.isAdded) return 1;
      return 0;
    });

    if (categories.value.length > 0) activeTabId.value = categories.value[0].id;
  } catch (e) {
    console.error('Error fetching items:', e);
    items.value = [];
    categories.value = [];
    productsList.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (isEditMode.value && props.editProduct) {
      editProductData.value = { ...props.editProduct };
    } else {
      fetchItems();
    }
  }
});

const toggleCategories = () => {
  showFullCategory.value = !showFullCategory.value;
};

const toggleProduct = (product: FuelQuotationProductToAdd) => {
  // Toggle isAdded state (mark/unmark for batch save)
  if (product.isAdded) {
    product.isAdded = false;
    manuallyUnchecked.value.add(product.item_id);
  } else {
    if (canAddProduct(product)) {
      const unit = unitItemsList.value.find((u: any) => u.value === product.unit_id);
      product.unit_name = unit?.title || '';
      const itemUsing = itemUsingOptionsList.value.find((f: any) => f.value === product.item_using);
      product.item_using_name = itemUsing?.title || '';
      product.isAdded = true;
      manuallyUnchecked.value.delete(product.item_id);
    }
  }
  // Note: No emit here - will emit all at once when clicking "تم"
};

// Auto-check product when required fields are filled (unless manually unchecked)
const shouldAutoCheck = (product: FuelQuotationProductToAdd): boolean => {
  return canAddProduct(product) && !product.isAdded && !manuallyUnchecked.value.has(product.item_id);
};

// Check if product should show as checked (either manually or auto)
const isProductChecked = (product: FuelQuotationProductToAdd): boolean => {
  if (product.isAdded) return true;
  if (shouldAutoCheck(product)) {
    // Auto-fill names when auto-checking
    const unit = unitItemsList.value.find((u: any) => u.value === product.unit_id);
    product.unit_name = unit?.title || '';
    const itemUsing = itemUsingOptionsList.value.find((f: any) => f.value === product.item_using);
    product.item_using_name = itemUsing?.title || '';
    product.isAdded = true;
    return true;
  }
  return false;
};

const handleEditSave = () => {
  if (editProductData.value && canAddProduct(editProductData.value)) {
    const unit = unitItemsList.value.find((u: any) => u.value === editProductData.value!.unit_id);
    editProductData.value.unit_name = unit?.title || '';
    const itemUsing = itemUsingOptionsList.value.find((f: any) => f.value === editProductData.value!.item_using);
    editProductData.value.item_using_name = itemUsing?.title || '';
    emit('productUpdated', editProductData.value);
    closeDialog();
  }
};

const resetForm = () => {
  items.value = [];
  categories.value = [];
  productsList.value = [];
  activeTabId.value = null;
  searchQuery.value = '';
  showFullCategory.value = false;
  editProductData.value = null;
  manuallyUnchecked.value.clear();
};

const closeDialog = () => {
  internalOpen.value = false;
  resetForm();
};

const handleDone = () => {
  if (isEditMode.value) {
    handleEditSave();
  } else {
    // Only save products that are explicitly marked as added (isAdded = true)
    const productsToSave = productsList.value.filter(p => p.isAdded);
    
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
        {{ isEditMode ? 'تعديل منتج' : 'إضافة منتج' }}
      </div>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Edit mode -->
    <div v-else-if="isEditMode && editProductData" class="space-y-1 min-h-[200px]">
      <div class="flex gap-3 rounded-lg border !border-gray-100 p-4 bg-white">
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
        <div class="flex-1 space-y-3">
          <div class="font-medium text-gray-900 text-lg">
            {{ editProductData.item_name }}
          </div>
          <!-- Row 1: الوحدة، الكمية، سعر الوحدة -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <SelectInput v-model="editProductData.unit_id" :items="unitItemsList" placeholder="الوحدة" density="compact" item-title="title" item-value="value" />
            </div>
            <div>
              <TextInput v-model="editProductData.quantity" type="number" placeholder="الكمية" density="compact" />
            </div>
            <div>
              <TextInput v-model="editProductData.unit_price" type="number" placeholder="سعر الوحدة" density="compact" />
            </div>
          </div>
          <!-- Row 2: الخصم، الإجمالي، الاستخدام -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <TextInputWithSelect
                v-model="editProductData.discount"
                v-model:selectValue="editProductData.discount_type"
                placeholder="الخصم"
                type="number"
                density="compact"
                select-width="80px"
                :select-items="discountTypeOptionsList"
                select-placeholder="اختر"
              />
            </div>
            <div>
              <TextInput :model-value="calculateTotal(editProductData)" type="number" placeholder="الإجمالي" density="compact" disabled />
            </div>
            <div>
              <SelectInput v-model="editProductData.item_using" :items="itemUsingOptionsList" placeholder="الاستخدام" clearable density="compact" item-title="title" item-value="value" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!isEditMode && items.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <v-icon size="64" color="gray-400">mdi-package-variant-closed</v-icon>
      <p class="mt-4 text-lg font-medium">لا توجد منتجات</p>
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
        <TextInput v-model="searchQuery" placeholder="ابحث في المنتجات ..." density="comfortable">
          <template #prepend-inner>
            <v-icon v-html="searchIcon"></v-icon>
          </template>
        </TextInput>
      </div>

      <div class="space-y-3 max-h-[400px] min-h-[250px] overflow-auto custom-scroll">
        <div v-for="product in filteredProducts" :key="product.item_id">
          <div class="flex gap-3 rounded-lg border !border-gray-100 p-4 bg-white">
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

            <div class="flex-1 space-y-3">
              <div class="font-medium text-gray-900">
                {{ product.item_name }}
              </div>
              <!-- Row 1: الوحدة، الكمية، سعر الوحدة -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <SelectInput v-model="product.unit_id" :items="unitItemsList" placeholder="الوحدة" density="compact" item-title="title" item-value="value" />
                </div>
                <div>
                  <TextInput v-model="product.quantity" type="number" placeholder="الكمية" density="compact" />
                </div>
                <div>
                  <TextInput v-model="product.unit_price" type="number" placeholder="سعر الوحدة" density="compact" />
                </div>
              </div>
              <!-- Row 2: الخصم، الإجمالي، الاستخدام -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <TextInputWithSelect
                    v-model="product.discount"
                    v-model:selectValue="product.discount_type"
                    placeholder="الخصم"
                    type="number"
                    density="compact"
                    select-width="80px"
                    :select-items="discountTypeOptionsList"
                    select-placeholder="اختر"
                  />
                </div>
                <div>
                  <TextInput :model-value="calculateTotal(product)" type="number" placeholder="الإجمالي" density="compact" disabled />
                </div>
                <div>
                  <SelectInput v-model="product.item_using" :items="itemUsingOptionsList" placeholder="الاستخدام" density="compact" item-title="title" item-value="value" />
                </div>
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
          :label="isEditMode ? 'حفظ التعديلات' : '+ أضف منتجات'"
          @click="handleDone"
          :disabled="!!(isEditMode && editProductData && !canAddProduct(editProductData))"
        />
        <ButtonWithIcon variant="outlined" color="gray-700" border="gray-300" size="large" custom-class="px-4" label="إلغاء" @click="handleCancel" />
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
