<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useApi } from '@/composables/useApi';

export interface TripLogisticsDetail {
  id?: number | null;
  item_id: number;
  item_name?: string;
  unit_id: number | null;
  unit_name?: string;
  quantity: number | null;
  transport_type: number[]; // Temporary array of selected types
  vehicle_type_no: { transport_type: number; transport_no: number | null }[];
  price: number | null;
  isAdded?: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface SupplierItem {
  id: number;
  name: string;
  code: string;
  category: Category;
}

const props = defineProps<{
  modelValue: boolean;
  transportTypes?: any[];
  unitItems?: any[];
  availableItems: TripLogisticsDetail[];
  editItem?: TripLogisticsDetail | null;
  existingItems?: TripLogisticsDetail[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [products: TripLogisticsDetail[]];
  "productUpdated": [product: TripLogisticsDetail];
}>();

const api = useApi();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const isEditMode = computed(() => !!props.editItem);

const loading = ref(false);
const supplierItems = ref<SupplierItem[]>([]);
const categories = ref<Category[]>([]);
const activeTabId = ref<number | null>(null);
const showFullCategory = ref(false);
const visibleTabsCount = 6;

const searchQuery = ref('');
const productsList = ref<TripLogisticsDetail[]>([]);
const editItemData = ref<TripLogisticsDetail | null>(null);

const unitItemsList = computed(() => props.unitItems || []);
const packageTypeItemsList = computed(() => props.transportTypes || []);

const extractCategories = (items: SupplierItem[]): Category[] => {
  const categoryMap = new Map<number, Category>();
  items.forEach(item => {
    if (item.category && !categoryMap.has(item.category.id)) {
      categoryMap.set(item.category.id, item.category);
    }
  });
  return Array.from(categoryMap.values());
};

const displayedTabs = computed(() => {
  if (showFullCategory.value) {
    return categories.value;
  }
  return categories.value.slice(0, visibleTabsCount);
});

const filteredProducts = computed(() => {
  let filtered = productsList.value;
  
  if (activeTabId.value !== null) {
    filtered = filtered.filter(product => {
      const supplierItem = supplierItems.value.find(i => i.id === product.item_id);
      return supplierItem?.category?.id === activeTabId.value;
    });
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase();
    filtered = filtered.filter(product => 
      product.item_name?.toLowerCase().includes(query)
    );
  }
  return filtered;
});

const fetchItems = async () => {
  loading.value = true;
  try {
    const res = await api.get<any>('/items/supplier-items');
    if (Array.isArray(res.data)) {
      supplierItems.value = res.data;
      categories.value = extractCategories(res.data);

      const mappedProducts = res.data.map((item: SupplierItem) => {
        const existingItem = props.existingItems?.find((p: any) => p.item_id === item.id);
        if (existingItem) {
          return {
            ...existingItem,
            item_name: item.name,
            transport_type: existingItem.vehicle_type_no ? existingItem.vehicle_type_no.map((v: any) => v.transport_type) : [],
            isAdded: true
          };
        }
        return {
          item_id: item.id,
          item_name: item.name,
          unit_id: null,
          quantity: null,
          price: null,
          vehicle_type_no: [],
          transport_type: [],
          isAdded: false,
        };
      });

      productsList.value = mappedProducts.sort((a: any, b: any) => {
        if (a.isAdded && !b.isAdded) return -1;
        if (!a.isAdded && b.isAdded) return 1;
        return 0;
      });
      manuallyUnchecked.value.clear();

      if (categories.value.length > 0) {
        activeTabId.value = categories.value[0].id;
      }
    }
  } catch (e) {
    console.error('Error fetching items:', e);
  } finally {
    loading.value = false;
  }
};

const canAddProduct = (product: TripLogisticsDetail): boolean => {
  const hasQty = product.quantity != null && Number(product.quantity) > 0;
  const hasUnit = !!product.unit_id;
  const hasTransportTypes = Array.isArray(product.transport_type) && product.transport_type.length > 0;
  const hasPrice = product.price != null && Number(product.price) >= 0;
  
  return hasQty && hasUnit && hasTransportTypes && hasPrice;
};

const manuallyUnchecked = ref<Set<number>>(new Set());

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (isEditMode.value && props.editItem) {
      editItemData.value = { 
        ...props.editItem,
        transport_type: props.editItem.vehicle_type_no.map(v => v.transport_type)
      };
    } else {
      fetchItems();
    }
  }
});

const toggleCategories = () => {
  showFullCategory.value = !showFullCategory.value;
};

const toggleProduct = (product: TripLogisticsDetail) => {
  if (product.isAdded) {
    product.isAdded = false;
  } else {
    if (canAddProduct(product)) {
      const unit = unitItemsList.value.find((u: any) => u.value === product.unit_id);
      product.unit_name = unit?.title || '';
      product.isAdded = true;
    }
  }
};

const handleEditSave = () => {
  if (editItemData.value && canAddProduct(editItemData.value)) {
    const unit = unitItemsList.value.find((u: any) => u.value === editItemData.value!.unit_id);
    editItemData.value.unit_name = unit?.title || '';
    
    // Convert transport_type array to vehicle_type_no array
    const oldVehicles = editItemData.value.vehicle_type_no || [];
    editItemData.value.vehicle_type_no = editItemData.value.transport_type.map(typeId => {
      const existing = oldVehicles.find(v => v.transport_type === typeId);
      return {
        transport_type: typeId,
        transport_no: existing ? existing.transport_no : null
      };
    });
    
    emit('productUpdated', editItemData.value);
    closeDialog();
  }
};

const closeDialog = () => {
  internalOpen.value = false;
  productsList.value = [];
  editItemData.value = null;
  searchQuery.value = '';
  loading.value = false;
};

const handleDone = () => {
  if (isEditMode.value) {
    handleEditSave();
  } else {
    const productsToSave = productsList.value.filter(p => p.isAdded).map(p => {
      // Convert transport_type to vehicle_type_no, preserving existing transport_no values
      const pCopy = { ...p };
      pCopy.vehicle_type_no = pCopy.transport_type.map(typeId => {
        const existing = (p.vehicle_type_no || []).find(v => v.transport_type === typeId);
        return {
          transport_type: typeId,
          transport_no: existing ? existing.transport_no : null
        };
      });
      return pCopy;
    });
    emit('saved', productsToSave);
    closeDialog();
  }
};

const searchIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 19L14.65 14.65M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const checkIcon = `<svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 1L6 12L1 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon2 = `<svg width="16" height="16" viewBox="0 0 16 16" fill="#ccc" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const arrowDownIcon = `<svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.833008 0.833374L5.83301 5.83337L10.833 0.833374" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const editIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.5 1.5L16.5 4.5M1.5 16.5L2.25 13.5L12 3.75L14.25 6L4.5 15.75L1.5 16.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const editIconDisabled = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.5 1.5L16.5 4.5M1.5 16.5L2.25 13.5L12 3.75L14.25 6L4.5 15.75L1.5 16.5Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

import { busIcon } from '@/components/icons/priceOffersIcons';

</script>

<template>
  <AppDialog v-model="internalOpen" :max-width="800" hide-actions>
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span v-html="busIcon"></span>
        {{ isEditMode ? 'تعديل تفاصيل رحلة' : 'تفاصيل الرحلات' }}
      </div>
    </template>

    <div v-if="isEditMode && editItemData" class="space-y-4 min-h-[150px]">
      <div class="flex flex-col rounded-lg border border-gray-100 p-4 bg-white relative">
        <div class="font-medium text-gray-900 mb-3 text-lg">{{ editItemData.item_name }}</div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PriceInput v-model="editItemData.quantity" placeholder="الكمية" density="compact" />
          <SelectInput v-model="editItemData.unit_id" :items="unitItemsList" placeholder="الوحدة" density="compact" item-title="title" item-value="value" />
          <SelectInput v-model="editItemData.transport_type" :items="packageTypeItemsList" multiple placeholder="نوع مركبة النقل" density="compact" item-title="title" item-value="value" class="md:col-span-2" />
        </div>
        
        <div class="mt-4 w-1/4">
          <PriceInput v-model="editItemData.price" placeholder="السعر" density="compact" showRialIcon />
        </div>

        <div class="absolute bottom-4 left-4">
           <ButtonWithIcon 
            :icon="canAddProduct(editItemData) ? editIcon : editIconDisabled" 
            icon-only 
            :color="canAddProduct(editItemData) ? 'primary' : 'gray'" 
            variant="flat" 
            @click="handleEditSave"
            :disabled="!canAddProduct(editItemData)"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- No Products State -->
    <div v-else-if="!isEditMode && supplierItems.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <v-icon size="64" color="gray-400">mdi-package-variant-closed</v-icon>
      <p class="mt-4 text-lg font-medium">لا توجد منتجات متاحة</p>
    </div>

    <template v-else-if="!isEditMode">
      <!-- Tabs -->
      <div class="flex gap-2 mb-6" v-if="categories.length > 0">
        <div class="flex flex-wrap items-center gap-2 mb-6 w-full">
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
          <ButtonWithIcon 
            v-if="categories.length > visibleTabsCount"
            icon-only 
            :icon="arrowDownIcon" 
            color="primary" 
            variant="flat"
            size="small" 
            height="40" 
            class="ms-auto"
            :class="{ 'rotate-180': showFullCategory }" 
            @click="toggleCategories" 
          />
        </div>
      </div>

      <div class="mb-4">
        <TextInput v-model="searchQuery" placeholder="ابحث في المنتجات .." density="comfortable">
          <template #prepend-inner>
            <v-icon v-html="searchIcon"></v-icon>
          </template>
        </TextInput>
      </div>

      <div class="space-y-3 max-h-[400px] min-h-[250px] overflow-auto custom-scroll px-1">
        <div v-for="product in filteredProducts" :key="product.item_id">
          <div class="flex gap-3 rounded-lg border !border-gray-100 p-3 bg-white shadow-sm">
            <!-- Actions -->
            <div class="col-span-1 flex items-center justify-center gap-1 w-[80px]">
              <ButtonWithIcon 
                v-if="product.isAdded" 
                :icon="checkIcon" 
                icon-only 
                color="success" 
                variant="flat"
                @click="toggleProduct(product)" 
                class="!h-full w-full !rounded-xl" 
              />
              <ButtonWithIcon 
                v-else-if="canAddProduct(product)" 
                :icon="plusIcon" 
                icon-only 
                color="primary" 
                variant="flat"
                @click="toggleProduct(product)" 
                class="!h-full w-full !rounded-xl" 
              />
              <ButtonWithIcon 
                v-else 
                :icon="plusIcon2" 
                icon-only 
                color="gray" 
                variant="flat" 
                disabled
                class="!h-full w-full !rounded-xl" 
              />
            </div>

            <!-- Content -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center gap-3 flex-1">
              <div class="sm:col-span-2 md:col-span-4 font-bold text-lg text-gray-900">
                {{ product.item_name }}
              </div>
              <div>
                <PriceInput v-model="product.quantity" placeholder="الكمية" density="compact" hide-details class="min-w-[150px]" />
              </div>
              <div>
                <SelectInput v-model="product.unit_id" :items="unitItemsList" placeholder="الوحدة" density="compact" item-title="title" item-value="value" hide-details class="min-w-[150px]" />
              </div>
              <div>
                <SelectInput v-model="product.transport_type" :items="packageTypeItemsList" multiple placeholder="نوع مركبة النقل" density="compact" item-title="title" item-value="value" hide-details class="min-w-[150px]" />
              </div>
              <div>
                 <PriceInput v-model="product.price" placeholder="السعر" density="compact" showRialIcon hide-details class="min-w-[150px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex items-center justify-center mt-6 mb-4 gap-3">
        <ButtonWithIcon 
          color="primary" 
          variant="flat" 
          label="إضافة تفاصيل الرحلة" 
          :prepend-icon="plusIcon"
          @click="handleDone"
          custom-class="px-8 !font-bold h-[44px] !text-[15px]"
        />
        <v-btn variant="outlined" color="gray-500" class="!border-gray-200 !text-gray-700 font-bold px-6 h-[44px]" @click="closeDialog">إلغاء</v-btn>
      </div>
    </template>
  </AppDialog>
</template>
