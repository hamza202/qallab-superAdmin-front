<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useApi } from '@/composables/useApi';

type RequestType = 'raw_materials' | 'fuel' | 'transfer_service' | 'trips' | 'logistics' | 'logistics-trips';

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

export interface ProductToAdd {
  item_id: number;
  item_name: string;
  unit_id: number | null;
  unit_name: string;
  quantity: number | null;
  transport_type?: number | null | number[] | undefined;
  transport_no?: number | null | undefined;
  transport_type_name?: string;
  transport_type_names?: string;
  trip_no?: number | null | undefined;
  from_date?: string | null;
  trip_date?: string | null;
  trip_price?: number | null;
  notes: string;
  isAdded?: boolean;
  id?: number;
  unit_price?: number | null;
  discount?: number | null;
  [key: string]: unknown; // allow extra fields (e.g. total_amount, tax_amount from sales)
}

const props = defineProps<{
  modelValue: boolean;
  requestType: RequestType;
  transportTypes?: any[];
  unitItems?: any[];
  supplierId?: number | null;
  customerId?: number | null;
  /** 'purchases' = supplier items, transport/trip; 'sales' = customer items, unit_price/discount */
  variant?: 'purchases' | 'sales';
  /** عند true في المشتريات: عرض سعر الوحدة والخصم بدل عدد الرحلات/نوع الناقلة (مثل طلبات المشتريات) */
  showUnitPriceAndDiscount?: boolean;
  itemsQueryParams?: Record<string, string | number>;
  editProduct?: ProductToAdd | null;
  existingProducts?: ProductToAdd[];
}>();

const variant = computed(() => props.variant || 'purchases');
const isSalesMode = computed(() => variant.value === 'sales');
const showPricingFields = computed(() => {
  if (props.showUnitPriceAndDiscount === false) return false;
  return isSalesMode.value || !!props.showUnitPriceAndDiscount;
});
const entityId = computed(() => isSalesMode.value ? props.customerId : props.supplierId);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [products: ProductToAdd[]];
  "productUpdated": [product: ProductToAdd];
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
const supplierItems = ref<SupplierItem[]>([]);
const categories = ref<Category[]>([]);
const activeTabId = ref<number | null>(null);
const searchQuery = ref('');
const showFullCategory = ref(false);
const visibleTabsCount = 6;

// Products with their form data
const productsList = ref<ProductToAdd[]>([]);

// Track manually unchecked products (to prevent auto-check)
const manuallyUnchecked = ref<Set<number>>(new Set());

// Edit mode product
const editProductData = ref<ProductToAdd | null>(null);

const unitItemsList = computed(() => props.unitItems || []);
const packageTypeItemsList = computed(() => props.transportTypes || []);

// Computed: unique categories from supplier items
const extractCategories = (items: SupplierItem[]): Category[] => {
  const categoryMap = new Map<number, Category>();
  items.forEach(item => {
    if (item.category && !categoryMap.has(item.category.id)) {
      categoryMap.set(item.category.id, item.category);
    }
  });
  return Array.from(categoryMap.values());
};

// Computed: displayed tabs
const displayedTabs = computed(() => {
  if (showFullCategory.value) {
    return categories.value;
  }
  return categories.value.slice(0, visibleTabsCount);
});

// Computed: products filtered by active tab and search (order is set on dialog open, not during typing)
const filteredProducts = computed(() => {
  let filtered = productsList.value;
  
  // Filter by category
  if (activeTabId.value !== null) {
    filtered = filtered.filter(product => {
      const supplierItem = supplierItems.value.find(i => i.id === product.item_id);
      return supplierItem?.category?.id === activeTabId.value;
    });
  }
  
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

// Check if product can be added: الكمية + الوحدة مطلوبة، وفي وضع المبيعات سعر الوحدة مطلوب أيضاً
const canAddProduct = (product: ProductToAdd): boolean => {
  const hasQty = product.quantity != null && Number(product.quantity) > 0;
  const hasUnit = !!product.unit_id;
  if (!hasQty || !hasUnit) return false;
  if (showPricingFields.value) {
    const price = product.unit_price;
    const hasPrice = price != null && !Number.isNaN(Number(price)) && Number(price) >= 0;
    return hasPrice;
  }
  return true;
};

// Fetch items: للمشتريات مع supplier_id => /items/supplier-items?supplier_id=:id
const fetchItems = async () => {
  loading.value = true;
  try {
    const isPurchasesWithSupplier = !isSalesMode.value && props.supplierId != null;
    let url = isPurchasesWithSupplier
      ? `/items/supplier-items?supplier_id=${props.supplierId}`
      : '/items/supplier-items';

    if (props.itemsQueryParams) {
      const params = new URLSearchParams();
      Object.entries(props.itemsQueryParams).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      url += (url.includes('?') ? '&' : '?') + params.toString();
    }
    
    const res = await api.get<any>(url);
    if (Array.isArray(res.data)) {
      supplierItems.value = res.data;
      categories.value = extractCategories(res.data);

      const mappedProducts = res.data.map((item: SupplierItem) => {
        const existingProduct = props.existingProducts?.find(p => p.item_id === item.id);
        if (existingProduct) {
          return { ...existingProduct, isAdded: true };
        }
        const base: ProductToAdd = {
          item_id: item.id,
          item_name: item.name,
          unit_id: null,
          unit_name: '',
          quantity: null,
          transport_type: props.requestType === 'logistics-trips' ? [] : null,
          transport_no: null,
          transport_type_name: '',
          transport_type_names: '',
          trip_no: null,
          from_date: null,
          trip_date: null,
          trip_price: null,
          notes: '',
          isAdded: false,
        };
        if (showPricingFields.value) {
          base.unit_price = null;
          base.discount = null;
        }
        return base;
      });

      // Sort on dialog open: products with values (isAdded) come first
      productsList.value = mappedProducts.sort((a: ProductToAdd, b: ProductToAdd) => {
        if (a.isAdded && !b.isAdded) return -1;
        if (!a.isAdded && b.isAdded) return 1;
        return 0;
      });

      if (categories.value.length > 0) {
        activeTabId.value = categories.value[0].id;
      }
    }
  } catch (e) {
    console.error('Error fetching items:', e);
    supplierItems.value = [];
    categories.value = [];
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

const toggleCategories = () => {
  showFullCategory.value = !showFullCategory.value;
};

const toggleProduct = (product: ProductToAdd) => {
  // Toggle isAdded state (mark/unmark for batch save)
  if (product.isAdded) {
    // Unmark product and add to manually unchecked list
    product.isAdded = false;
    manuallyUnchecked.value.add(product.item_id);
  } else {
    // Mark product as added (only if valid)
    if (canAddProduct(product)) {
      // Get unit name
      const unit = unitItemsList.value.find((u: any) => u.value === product.unit_id);
      product.unit_name = unit?.title || '';
      
      // Get transport type name(s)
      if (Array.isArray(product.transport_type)) {
        const transportNames = product.transport_type.map(typeId => {
          const transport = packageTypeItemsList.value.find((t: any) => t.value === typeId);
          return transport?.title || '';
        }).filter(Boolean).join(', ');
        product.transport_type_names = transportNames;
      } else {
        const transport = packageTypeItemsList.value.find((t: any) => t.value === product.transport_type);
        product.transport_type_name = transport?.title || '';
      }
      
      product.isAdded = true;
      // Remove from manually unchecked list
      manuallyUnchecked.value.delete(product.item_id);
    }
  }
  // Note: No emit here - will emit all at once when clicking "تم"
};

// Auto-check product when required fields are filled (unless manually unchecked)
const shouldAutoCheck = (product: ProductToAdd): boolean => {
  return canAddProduct(product) && !product.isAdded && !manuallyUnchecked.value.has(product.item_id);
};

// Check if product should show as checked (either manually or auto)
const isProductChecked = (product: ProductToAdd): boolean => {
  if (product.isAdded) return true;
  if (shouldAutoCheck(product)) {
    // Auto-fill names when auto-checking
    const unit = unitItemsList.value.find((u: any) => u.value === product.unit_id);
    product.unit_name = unit?.title || '';
    const transport = packageTypeItemsList.value.find((t: any) => t.value === product.transport_type);
    product.transport_type_name = transport?.title || '';
    product.isAdded = true;
    return true;
  }
  return false;
};

// Edit mode: update product
const handleEditSave = () => {
  if (editProductData.value && canAddProduct(editProductData.value)) {
    // Get unit name
    const unit = unitItemsList.value.find((u: any) => u.value === editProductData.value!.unit_id);
    editProductData.value.unit_name = unit?.title || '';
    
    // Get transport type name
    const transport = packageTypeItemsList.value.find((t: any) => t.value === editProductData.value!.transport_type);
    editProductData.value.transport_type_name = transport?.title || '';
    
    emit('productUpdated', editProductData.value);
    closeDialog();
  }
};

const resetForm = () => {
  supplierItems.value = [];
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

const handleCancel = () => {
  closeDialog();
};

const cubeIcon = `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.5 6.13379L9.99997 10.856M9.99997 10.856L1.49997 6.13379M9.99997 10.856L10 20.356M19 14.9146V6.79749C19 6.45484 19 6.28352 18.9495 6.13072C18.9049 5.99555 18.8318 5.87147 18.7354 5.76678C18.6263 5.64844 18.4766 5.56524 18.177 5.39883L10.777 1.28772C10.4934 1.13017 10.3516 1.05139 10.2015 1.0205C10.0685 0.993166 9.93146 0.993166 9.79855 1.0205C9.64838 1.05139 9.50658 1.13017 9.22297 1.28772L1.82297 5.39884C1.52345 5.56524 1.37369 5.64844 1.26463 5.76678C1.16816 5.87147 1.09515 5.99555 1.05048 6.13073C1 6.28352 1 6.45485 1 6.79749V14.9146C1 15.2572 1 15.4286 1.05048 15.5814C1.09515 15.7165 1.16816 15.8406 1.26463 15.9453C1.37369 16.0636 1.52345 16.1468 1.82297 16.3132L9.22297 20.4244C9.50658 20.5819 9.64838 20.6607 9.79855 20.6916C9.93146 20.7189 10.0685 20.7189 10.2015 20.6916C10.3516 20.6607 10.4934 20.5819 10.777 20.4244L18.177 16.3132C18.4766 16.1468 18.6263 16.0636 18.7354 15.9453C18.8318 15.8406 18.9049 15.7165 18.9495 15.5814C19 15.4286 19 15.2572 19 14.9146Z" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const arrowDownIcon = `<svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.833008 0.833374L5.83301 5.83337L10.833 0.833374" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

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

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center gap-3 flex-1">
          <div class="sm:col-span-2 md:col-span-4 font-medium text-gray-900">
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

          <!-- Unit Price (sales أو purchases مع showUnitPriceAndDiscount) -->
          <div v-if="showPricingFields">
            <TextInput 
              v-model="editProductData.unit_price" 
              type="number" 
              placeholder="سعر الوحدة" 
              density="compact"
              class="min-w-[170px]" 
            />
          </div>

          <!-- Discount (sales أو purchases مع showUnitPriceAndDiscount) -->
          <div v-if="showPricingFields">
            <TextInput 
              v-model="editProductData.discount" 
              type="number" 
              placeholder="الخصم" 
              density="compact"
              class="min-w-[170px]" 
            />
          </div>

          <!-- Delivery Count (trip_no) - purchases فقط بدون سعر/خصم -->
          <div v-if="!showPricingFields && requestType == 'raw_materials'|| requestType == 'logistics'">
            <TextInput 
              v-model="editProductData.trip_no" 
              type="number" 
              placeholder="عدد الرحلات" 
              density="compact"
              class="min-w-[170px]" 
            />
          </div>

          <!-- From Date (logistics only) -->
          <div v-if="requestType === 'logistics'">
            <DatePickerInput
              v-model="editProductData.from_date"
              placeholder="تاريخ بداية النقل"
              density="compact"
              class="min-w-[170px]"
            />
          </div>

          <!-- Package Type (transport_type) - purchases فقط بدون سعر/خصم -->
          <div v-if="!showPricingFields && requestType == 'raw_materials' || requestType == 'trips' || requestType == 'logistics'">
            <SelectInput 
              v-model="editProductData.transport_type" 
              :items="packageTypeItemsList" 
              placeholder="نوع الناقلة"
              density="compact" 
              class="min-w-[170px]" 
              item-title="title" 
              item-value="value" 
            />
          </div>

            <!-- Package Type (transport_no) - purchases فقط بدون سعر/خصم -->
          <div v-if="!showPricingFields && requestType == 'trips'">
            <TextInput 
              v-model="editProductData.transport_no" 
              type="number" 
              placeholder="عدد الناقلات"
              density="compact" 
              class="min-w-[170px]" 
            />
          </div>

          <!-- Trip Date (logistics-trips only) -->
          <div v-if="requestType === 'logistics-trips'">
            <DatePickerInput 
              v-model="editProductData.trip_date" 
              placeholder="تاريخ الرحلة" 
              density="compact"
              class="min-w-[170px]" 
            />
          </div>

          <!-- Trip Price (logistics-trips only) -->
          <div v-if="requestType === 'logistics-trips'">
            <PriceInput 
              v-model="editProductData.trip_price" 
              showRialIcon
              placeholder="سعر الرحلة" 
              density="compact"
              class="min-w-[170px]" 
            />
          </div>

            <!-- Package Type (transport_type) - multi-select for logistics-trips -->
          <div v-if="requestType === 'logistics-trips'" class="md:col-span-2">
            <SelectInput 
              v-model="editProductData.transport_type" 
              :items="packageTypeItemsList" 
              placeholder="نوع المركبات"
              density="compact" 
              class="min-w-[170px]" 
              item-title="title" 
              item-value="value"
              multiple
            />
          </div>

        </div>
      </div>
    </div>

    <!-- No Products State -->
    <div v-else-if="!isEditMode && supplierItems.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <v-icon size="64" color="gray-400">mdi-package-variant-closed</v-icon>
      <p class="mt-4 text-lg font-medium">{{ isSalesMode ? 'لا توجد منتجات تابعة لهذا العميل' : 'لا توجد منتجات تابعة لهذا المزود' }}</p>
    </div>

    <!-- Add Mode Content -->
    <template v-else-if="!isEditMode">
      <!-- Tabs -->
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

      <!-- Search -->
      <div class="mb-3">
        <TextInput v-model="searchQuery" placeholder="ابحث في المنتجات ..." density="comfortable">
          <template #prepend-inner>
            <v-icon v-html="searchIcon"></v-icon>
          </template>
        </TextInput>
      </div>

      <!-- Products List -->
      <div class="space-y-1 max-h-[350px] min-h-[250px] overflow-auto custom-scroll">
        <div v-for="product in filteredProducts" :key="product.item_id">
          <div class="flex gap-3 rounded-lg border !border-gray-100 p-3 bg-white">
            <!-- Actions -->
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
                :icon="plusIcon2" 
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
              <!-- Quantity -->
              <div>
                <PriceInput 
                  v-model="product.quantity"
                  placeholder="الكمية" 
                  density="compact"
                  class="min-w-[170px]" 
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
                />
              </div>

              <!-- Unit Price (sales أو purchases مع showUnitPriceAndDiscount) -->
              <div v-if="showPricingFields">
                <PriceInput 
                  v-model="product.unit_price" 
                  placeholder="سعر الوحدة" 
                  density="compact"
                  class="min-w-[170px]" 
                />
              </div>

              <!-- Discount (sales أو purchases مع showUnitPriceAndDiscount) -->
              <div v-if="showPricingFields">
                <PriceInput 
                  v-model="product.discount" 
                  placeholder="الخصم" 
                  density="compact"
                  class="min-w-[170px]" 
                />
              </div>

              <!-- Delivery Count (trip_no) - purchases فقط بدون سعر/خصم -->
              <div v-if="!showPricingFields && requestType == 'raw_materials' || requestType == 'logistics'">
                <PriceInput 
                  v-model="product.trip_no" 
                  placeholder="عدد الرحلات" 
                  density="compact"
                  class="min-w-[170px]" 
                />
              </div>

              <!-- From Date (logistics only) -->
              <div v-if="requestType === 'logistics'">
                <DatePickerInput 
                  v-model="product.from_date" 
                  placeholder="تاريخ بداية النقل" 
                  density="compact"
                  class="min-w-[170px]" 
                />
              </div>

              <!-- Trip Date (logistics-trips only) -->
              <div v-if="requestType === 'logistics-trips'">
                <DatePickerInput 
                  v-model="product.trip_date" 
                  placeholder="تاريخ الرحلة" 
                  density="compact"
                  class="min-w-[170px]" 
                />
              </div>

              <!-- Trip Price (logistics-trips only) -->
              <div v-if="requestType === 'logistics-trips'">
                <PriceInput 
                  v-model="product.trip_price" 
                  showRialIcon
                  placeholder="سعر الرحلة" 
                  density="compact"
                  class="min-w-[170px]" 
                />
              </div>

              <!-- Package Type (transport_type) - single select for logistics -->
              <div v-if="!showPricingFields && requestType == 'raw_materials' || !showPricingFields && requestType == 'trips' || requestType == 'logistics'">
                <SelectInput 
                  v-model="product.transport_type" 
                  :items="packageTypeItemsList" 
                  placeholder="نوع الناقلة"
                  density="compact" 
                  class="min-w-[170px]" 
                  item-title="title" 
                  item-value="value" 
                />
              </div>

              <!-- Package Type (transport_type) - multi-select for logistics-trips -->
              <div v-if="requestType === 'logistics-trips'" class="md:col-span-2">
                <SelectInput 
                  v-model="product.transport_type" 
                  :items="packageTypeItemsList" 
                  placeholder="نوع المركبات"
                  density="compact" 
                  class="min-w-[170px]" 
                  item-title="title" 
                  item-value="value"
                  multiple
                />
              </div>

              <!-- Package Type (transport_no) - purchases فقط بدون سعر/خصم -->
              <div v-if="!showPricingFields && requestType == 'trips'">
                <PriceInput 
                  v-model="product.transport_no" 
                  placeholder="عدد الناقلات"
                  density="compact" 
                  class="min-w-[170px]" 
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
