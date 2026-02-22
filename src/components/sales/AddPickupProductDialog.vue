<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useApi } from '@/composables/useApi';

interface OrderItem {
  id?: number;
  item_id: number;
  item_name?: string;
  name?: string;
  unit_id: number | null;
  unit_name?: string;
  quantity: number | null;
}

export interface PickupProductToAdd {
  item_id: number;
  item_name: string;
  unit_id: number | null;
  unit_name: string;
  quantity: number | null;
  isAdded?: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  unitItems?: any[];
  itemsEndpoint?: string;
  editProduct?: PickupProductToAdd | null;
  existingProducts?: PickupProductToAdd[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [products: PickupProductToAdd[]];
  "productUpdated": [product: PickupProductToAdd];
}>();

const api = useApi();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

// Edit mode state
const isEditMode = computed(() => !!props.editProduct);

// Data states
const loading = ref(false);
const orderItems = ref<OrderItem[]>([]);
const searchQuery = ref('');

// Products with their form data
const productsList = ref<PickupProductToAdd[]>([]);

// Edit mode product
const editProductData = ref<PickupProductToAdd | null>(null);

const unitItemsList = computed(() => props.unitItems || []);

// Computed: products filtered by search
const filteredProducts = computed(() => {
  let filtered = productsList.value;
  
  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase();
    filtered = filtered.filter(product => 
      product.item_name.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

// Computed: added products (to be emitted)
const addedProducts = computed(() => {
  return productsList.value.filter(p => p.isAdded);
});

// Check if product can be added: quantity and unit required
const canAddProduct = (product: PickupProductToAdd): boolean => {
  const hasQty = product.quantity != null && Number(product.quantity) > 0;
  const hasUnit = !!product.unit_id;
  return hasQty && hasUnit;
};

// Fetch items from sales order endpoint
const fetchItems = async () => {
  if (!props.itemsEndpoint) {
    console.warn('AddPickupProductDialog: itemsEndpoint is required');
    return;
  }
  
  loading.value = true;
  try {
    const res = await api.get<any>(props.itemsEndpoint);
    
    // Handle nested response: {data: [{items: [...]}]} or direct array
    let items: OrderItem[] = [];
    if (Array.isArray(res.data)) {
      // Response is array of orders, get items from first order
      const orderData = res.data[0];
      items = orderData?.items || [];
    } else if (res.data?.items) {
      // Response has items directly
      items = res.data.items;
    }
    
    orderItems.value = items;
    
    // Build products list from order items
    productsList.value = items.map((item: OrderItem) => {
      const existingProduct = props.existingProducts?.find(p => p.item_id === item.item_id);
      if (existingProduct) {
        return { ...existingProduct, isAdded: true };
      }
      
      // Get unit name from unitItems if available
      const unit = unitItemsList.value.find((u: any) => u.value === item.unit_id);
      
      return {
        item_id: item.item_id,
        item_name: item.item_name || item.name || '',
        unit_id: item.unit_id,
        unit_name: unit?.title || item.unit_name || '',
        quantity: item.quantity,
        isAdded: false,
      };
    });
  } catch (e) {
    console.error('Error fetching order items:', e);
    orderItems.value = [];
    productsList.value = [];
  } finally {
    loading.value = false;
  }
};

// Watch for dialog open
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (isEditMode.value && props.editProduct) {
      editProductData.value = { ...props.editProduct };
    } else {
      fetchItems();
    }
  }
});

const toggleProduct = (product: PickupProductToAdd) => {
  if (product.isAdded) {
    // Remove product
    product.isAdded = false;
    // Emit updated list immediately
    emit('saved', addedProducts.value);
  } else {
    // Add product (only if valid)
    if (canAddProduct(product)) {
      // Get unit name
      const unit = unitItemsList.value.find((u: any) => u.value === product.unit_id);
      product.unit_name = unit?.title || '';
      
      product.isAdded = true;
      // Emit updated list
      emit('saved', addedProducts.value);
    }
  }
};

// Edit mode: update product
const handleEditSave = () => {
  if (editProductData.value && canAddProduct(editProductData.value)) {
    // Get unit name
    const unit = unitItemsList.value.find((u: any) => u.value === editProductData.value!.unit_id);
    editProductData.value.unit_name = unit?.title || '';
    
    emit('productUpdated', editProductData.value);
    closeDialog();
  }
};

const resetForm = () => {
  orderItems.value = [];
  productsList.value = [];
  searchQuery.value = '';
  editProductData.value = null;
};

const closeDialog = () => {
  internalOpen.value = false;
  resetForm();
};

const handleDone = () => {
  if (isEditMode.value) {
    handleEditSave();
  } else {
    emit('saved', addedProducts.value);
    closeDialog();
  }
};

const handleCancel = () => {
  closeDialog();
};

const cubeIcon = `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.5 6.13379L9.99997 10.856M9.99997 10.856L1.49997 6.13379M9.99997 10.856L10 20.356M19 14.9146V6.79749C19 6.45484 19 6.28352 18.9495 6.13072C18.9049 5.99555 18.8318 5.87147 18.7354 5.76678C18.6263 5.64844 18.4766 5.56524 18.177 5.39883L10.777 1.28772C10.4934 1.13017 10.3516 1.05139 10.2015 1.0205C10.0685 0.993166 9.93146 0.993166 9.79855 1.0205C9.64838 1.05139 9.50658 1.13017 9.22297 1.28772L1.82297 5.39884C1.52345 5.56524 1.37369 5.64844 1.26463 5.76678C1.16816 5.87147 1.09515 5.99555 1.05048 6.13073C1 6.28352 1 6.45485 1 6.79749V14.9146C1 15.2572 1 15.4286 1.05048 15.5814C1.09515 15.7165 1.16816 15.8406 1.26463 15.9453C1.37369 16.0636 1.52345 16.1468 1.82297 16.3132L9.22297 20.4244C9.50658 20.5819 9.64838 20.6607 9.79855 20.6916C9.93146 20.7189 10.0685 20.7189 10.2015 20.6916C10.3516 20.6607 10.4934 20.5819 10.777 20.4244L18.177 16.3132C18.4766 16.1468 18.6263 16.0636 18.7354 15.9453C18.8318 15.8406 18.9049 15.7165 18.9495 15.5814C19 15.4286 19 15.2572 19 14.9146Z" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const searchIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 19L14.65 14.65M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const checkIcon = `<svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 1L6 12L1 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const plusIcon2 = `<svg width="16" height="16" viewBox="0 0 16 16" fill="#ccc" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const editIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.5 1.5L16.5 4.5M1.5 16.5L2.25 13.5L12 3.75L14.25 6L4.5 15.75L1.5 16.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const editIconDisabled = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.5 1.5L16.5 4.5M1.5 16.5L2.25 13.5L12 3.75L14.25 6L4.5 15.75L1.5 16.5Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
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

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Edit Mode -->
    <div v-else-if="isEditMode && editProductData" class="space-y-1 min-h-[200px]">
      <div class="flex gap-3 rounded-lg border !border-gray-100 p-3 bg-white">
        <!-- Edit Action Button -->
        <div class="col-span-1 flex items-center justify-center gap-1">
          <ButtonWithIcon 
            :icon="canAddProduct(editProductData) ? editIcon : editIconDisabled" 
            icon-only 
            :color="canAddProduct(editProductData) ? 'primary' : 'gray'" 
            variant="flat" 
            @click="handleEditSave"
            :disabled="!canAddProduct(editProductData)"
            class="!h-full" 
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 items-center gap-3 flex-1">
          <div class="sm:col-span-2 font-medium text-gray-900">
            {{ editProductData.item_name }}
          </div>
          <!-- Quantity -->
          <div>
            <TextInput 
              v-model="editProductData.quantity" 
              type="number" 
              placeholder="الكمية" 
              density="compact"
              class="min-w-[170px]" 
            />
          </div>

          <!-- Unit -->
          <div>
            <SelectInput 
              v-model="editProductData.unit_id" 
              :items="unitItemsList" 
              placeholder="الوحدة" 
              density="compact"
              class="min-w-[170px]" 
              item-title="title" 
              item-value="value" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- No Products State -->
    <div v-else-if="!isEditMode && orderItems.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <v-icon size="64" color="gray-400">mdi-package-variant-closed</v-icon>
      <p class="mt-4 text-lg font-medium">لا توجد منتجات في هذا الطلب</p>
    </div>

    <!-- Add Mode Content -->
    <template v-else-if="!isEditMode">
      <!-- Search -->
      <div class="mb-3">
        <TextInput v-model="searchQuery" placeholder="ابحث في المنتجات ..." density="comfortable">
          <template #prepend-inner>
            <v-icon v-html="searchIcon"></v-icon>
          </template>
        </TextInput>
      </div>

      <!-- Products List -->
      <div class="space-y-1 max-h-[400px] min-h-[250px] overflow-auto custom-scroll">
        <div v-for="product in filteredProducts" :key="product.item_id">
          <div class="flex gap-3 rounded-lg border !border-gray-100 p-3 bg-white">
            <!-- Actions -->
            <div class="col-span-1 flex items-center justify-center gap-1">
              <ButtonWithIcon 
                v-if="product.isAdded" 
                :icon="checkIcon" 
                icon-only 
                color="success" 
                variant="flat"
                @click="toggleProduct(product)" 
                class="!h-full" 
              />
              <ButtonWithIcon 
                v-else 
                :icon="canAddProduct(product) ? plusIcon : plusIcon2" 
                icon-only 
                :color="canAddProduct(product) ? 'primary' : 'gray'" 
                variant="flat" 
                @click="toggleProduct(product)"
                :disabled="!canAddProduct(product)"
                class="!h-full" 
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 items-center gap-3 flex-1">
              <div class="sm:col-span-2 font-medium text-gray-900">
                {{ product.item_name }}
              </div>
              <!-- Quantity -->
              <div>
                <TextInput 
                  v-model="product.quantity" 
                  type="number" 
                  placeholder="الكمية" 
                  density="compact"
                  class="min-w-[170px]" 
                  :disabled="product.isAdded"
                />
              </div>

              <!-- Unit -->
              <div>
                <SelectInput 
                  v-model="product.unit_id" 
                  :items="unitItemsList" 
                  placeholder="الوحدة" 
                  density="compact"
                  class="min-w-[170px]" 
                  item-title="title" 
                  item-value="value" 
                  :disabled="product.isAdded"
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
          :label="isEditMode ? 'حفظ التعديلات' : 'تم'"
          @click="handleDone" 
          :disabled="!!(isEditMode && editProductData && !canAddProduct(editProductData))"
        />

        <ButtonWithIcon 
          variant="outlined" 
          color="gray-700" 
          border="gray-300" 
          size="large" 
          custom-class="px-4"
          label="إلغاء" 
          @click="handleCancel" 
        />
      </div>
    </template>

  </AppDialog>
</template>

<style scoped>
:deep(.v-field__input) {
  min-height: 36px !important;
}

/* Scroll container */
.custom-scroll {
  scrollbar-width: thin;
  /* Firefox */
  scrollbar-color: #cbd5e1 transparent;
  /* Firefox */
}

/* Chrome, Edge, Safari */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  /* light gray */
  border-radius: 999px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

.custom-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}
</style>
