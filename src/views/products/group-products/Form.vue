<script setup lang="ts">
// All imports are now auto-imported:
// - Vue APIs (ref, computed, etc.) from 'vue'
// - Components from 'src/components/common/forms' and 'src/layouts'
// - Validators (required, minLength, etc.) from '@/utils/validators'

import { toast } from "vue3-toastify";
import { useApi } from "@/composables/useApi";
import { useRoute, useRouter } from "vue-router";
import { onMounted, watch } from "vue";
import TestFormDialog from "@/views/products/simple-products/components/TestFormDialog.vue";
import {
  gridIcon,
  langIcon,
  returnIcon,
  saveIcon,
  arrowLeftIcon,
  plusIcon,
} from "@/components/icons/productIcons";

// Router & API
const route = useRoute();
const router = useRouter();
const api = useApi();

// Edit mode detection
const isEditMode = computed(() => !!route.params.id);
const itemId = ref<number | null>(null);
const productItemId = ref<number | null>(null);

// Step completion state - controls tab access
const isStep1Completed = ref(false);

// Loading states
const loading = ref(false);
const savingLoading = ref(false);

// Form ref
const formRef = ref<any>(null);
const isFormValid = ref(false);

// Form data
const productCode = ref("");
const arabicName = ref("");
const englishName = ref("");
const category = ref<number | null>(null);
const unit = ref<number | null>(null);
const isMinUnit = ref(false);
const arabicDescription = ref("");
const englishDescription = ref("");
const productImages = ref<File[] | null>(null);
const purchasePrice = ref("");
const salePrice = ref("");
const maxSalePrice = ref("");
const minSalePrice = ref("");
const materialType = ref<number | null>(null);
const minQuantity = ref("");
const wholesalePrice = ref("");
const halfWholesalePrice = ref("");
const discountType = ref<number | null>(null);
const discountValue = ref("");
const profitMargin = ref("");

// Sample items for selects - will be fetched from API
const categoryItems = ref<Array<{ title: string; value: string | number }>>([]);
const unitItems = ref<Array<{ title: string; value: string | number }>>([]);
const discountTypeItems = ref<Array<{ title: string; value: string | number }>>([]);

// Available languages (will be fetched from API in the future)
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

// Tax interface
interface TaxItem {
  id: number;
  tax_name: string;
  value_rate: string;
  minimum: string;
}

// Tax table row interface
interface TaxTableRow {
  id: number;
  taxId: number;
  taxName: string;
  percentage: string;
  minValue: string;
  priority: string | number;
  priorityLabel: string;
  backendId?: number; // ID from backend, only exists for saved taxes
}

// Tax data
const taxType = ref<number | null>(null);
const taxPercentage = ref("");
const taxMinValue = ref("");
const taxPriority = ref<string | number | null>(null);

// Editing state for tax
const isEditingTax = ref(false);
const editingTaxIndex = ref<number | null>(null);

// Tax items from API
const taxTypeItems = ref<Array<{ title: string; value: number; value_rate: string; minimum: string }>>([]);

// Tax priority items from API
const taxPriorityItems = ref<Array<{ title: string; value: string | number }>>([]);

// Dynamic tax table items
const taxTableItems = ref<TaxTableRow[]>([]);
let taxRowIdCounter = 1;

// Supply and Internal Relations Data
const originCountry = ref<number | null>(null);
const manufacturer = ref<number | null>(null);
const brand = ref<number | null>(null);
const relatedProducts = ref<number[]>([]);
const attachedProducts = ref<number[]>([]);
const alternativeProducts = ref<number[]>([]);
const bestSuppliers = ref<number[]>([]);

// Advanced Product Attributes
const isReturnable = ref(false);
const isRentable = ref(false);
const sellNegative = ref(false);
const isManufacturingProduct = ref(false);
const isAvailableForPurchase = ref(false);
const isAvailableForRent = ref(false);
const isAvailableForReturn = ref(false);
const isAvailableForSelling = ref(false);
const isAvailableForBuying = ref(false);
const isAvailableForManufacturing = ref(false);
const isAvailableForRefund = ref(false);
const isAvailableForOffset = ref(false);

// Sample items for new selects
// API Response interfaces for step 3
interface BrandItem {
  id: number;
  name: string;
}

interface ManufacturerItem {
  id: number;
  name: string;
}

interface CountryItem {
  id: number;
  name: string;
}

interface ItemListItem {
  id: number;
  name: string;
  code: string;
}

interface SupplierItem {
  id: number;
  full_name: string;
}

// Dynamic dropdown items from API
const countryItems = ref<Array<{ title: string; value: number }>>([]);
const manufacturerItems = ref<Array<{ title: string; value: number }>>([]);
const brandItems = ref<Array<{ title: string; value: number }>>([]);
const productItems = ref<Array<{ title: string; value: number }>>([]);
const supplierItems = ref<Array<{ title: string; value: number }>>([])
const MaterialTypeItems = ref<Array<{ title: string; value: string | number }>>([]);

// Product Variants Data
const subProductsGenerated = ref(false);
const editingRowId = ref<number | null>(null);

// Generate sub products - Logic moved to dynamic generation above

// Computed to check if category is selected
const isCategorySelected = computed(() => {
  return category.value !== null && category.value !== "";
});

// Get category title
const getCategoryTitle = computed(() => {
  const selectedCategory = categoryItems.value.find((item) => item.value === category.value);
  return selectedCategory?.title || "منتج";
});

// Start editing a row
const startEditingRow = (item: any) => {
  editingRowId.value = item.id;
};

// Save editing row
const saveEditingRow = () => {
  editingRowId.value = null;
};

// Delete sub product row
const deleteSubProductRow = (item: any) => {
  subProductsTableItems.value = subProductsTableItems.value.filter((p) => p.id !== item.id);
  if (subProductsTableItems.value.length === 0) {
    subProductsGenerated.value = false;
  }
};

// Handlers for new section
const handleAddCountry = () => {
  console.log("Add new country");
};

const handleAddManufacturer = () => {
  console.log("Add new manufacturer");
};

const handleAddBrand = () => {
  console.log("Add new brand");
};

// === Aspects & Dynamic Sub-products ===

interface AspectValue {
  id: number;
  name: string;
}

interface Aspect {
  id: number;
  name: string;
  value_type: number;
  value_type_label: string;
  values: AspectValue[];
}

const aspects = ref<Aspect[]>([]);
const selectedAspects = ref<Record<number, (string | number)[]>>({});
// Store aspect_value_ids loaded from API (for edit mode)
const savedAspectValueIds = ref<(string | number)[]>([]);

// Fetch aspects from API
const fetchAspects = async () => {
  if (!category.value) {
    aspects.value = [];
    selectedAspects.value = {};
    return;
  }
  try {
    const response = await api.get<{ data: Aspect[] }>(`/aspects/list?category_id=${category.value}`);
    const data = response.data;

    // Initialize selectedAspects for each aspect before updating aspects ref
    // to ensure v-for loop finds the initialized arrays
    // Create a new object for selectedAspects.value to ensure reactivity for new keys
    const newSelectedAspects: Record<number, (string | number)[]> = {};
    data.forEach(aspect => {
      newSelectedAspects[aspect.id] = selectedAspects.value[aspect.id] || [];
    });
    selectedAspects.value = newSelectedAspects;

    aspects.value = data;
  } catch (err: any) {
    console.error('Error fetching aspects:', err);
  }
};

// Get aspect value title by id (helper for generating names)
const getAspectValueTitle = (aspectId: number, valueId: string | number) => {
  const aspect = aspects.value.find(a => a.id === aspectId);
  if (!aspect) return String(valueId);
  const val = aspect.values.find(v => v.id === valueId);
  return val ? val.name : String(valueId);
};

// Generate sub products dynamically based on selected aspects - calls API
const generateSubProducts = async () => {
  // Collect all aspect_value_ids from selectedAspects
  const allAspectValueIds: (string | number)[] = [];
  Object.values(selectedAspects.value).forEach(values => {
    if (Array.isArray(values)) {
      values.forEach(val => allAspectValueIds.push(val));
    }
  });

  if (allAspectValueIds.length === 0) {
    toast.error('يرجى اختيار قيم المتغيرات أولاً');
    return;
  }

  try {
    // Build FormData for API request
    const formData = new FormData();
    allAspectValueIds.forEach((id, index) => {
      formData.append(`aspect_value_ids[${index}]`, String(id));
    });

    // Call API to get sub-item names
    const response = await api.post<{ data: { sub_items_name: string[] } }>('/aspects/generate-subitem-names', formData);

    const subItemNames = response.data.sub_items_name || [];

    if (subItemNames.length === 0) {
      toast.warning('لم يتم إرجاع أسماء منتجات فرعية');
      return;
    }

    // Generate sub products with API names
    const products: any[] = [];
    subItemNames.forEach((name, index) => {
      products.push({
        id: index + 1,
        name: name,
        sku: `BR-${index + 1}`,
        salePrice: "",
        purchasePrice: "",
        isEditing: false,
      });
    });

    subProductsTableItems.value = products;
    subProductsGenerated.value = true;
    toast.success('تم إنشاء المنتجات الفرعية بنجاح');
  } catch (err: any) {
    console.error('Error generating sub products:', err);
    toast.error(err?.response?.data?.message || 'فشل في إنشاء المنتجات الفرعية');
  }
};

// Helper for Cartesian Product
function cartesianProduct(arrays: any[][]): any[][] {
  return arrays.reduce((acc, curr) => {
    return acc.flatMap(x => curr.map(y => [...x, y]));
  }, [[]]);
}
const taxTableHeaders = [
  { key: "taxName", title: "الضريبة", width: "370px" },
  { key: "percentage", title: "النسبة", width: "176px" },
  { key: "minValue", title: "أقل قيمة", width: "176px" },
  { key: "priorityLabel", title: "الأولوية", width: "176px" },
];

// Handle add/update tax to table
const handleAddTax = () => {
  if (!taxType.value || !taxPriority.value) {
    toast.error('يرجى اختيار نوع الضريبة والأولوية');
    return;
  }

  const selectedTax = taxTypeItems.value.find(t => t.value === taxType.value);
  const selectedPriority = taxPriorityItems.value.find(p => p.value === taxPriority.value);

  if (!selectedTax || !selectedPriority) return;

  if (isEditingTax.value && editingTaxIndex.value !== null) {
    // Update existing row
    const index = taxTableItems.value.findIndex(t => t.id === editingTaxIndex.value);
    if (index !== -1) {
      taxTableItems.value[index] = {
        id: editingTaxIndex.value,
        taxId: selectedTax.value,
        taxName: selectedTax.title,
        percentage: taxPercentage.value,
        minValue: taxMinValue.value,
        priority: taxPriority.value,
        priorityLabel: selectedPriority.title,
      };
    }
    // Reset editing state
    isEditingTax.value = false;
    editingTaxIndex.value = null;
  } else {
    // Add new row
    taxTableItems.value.push({
      id: taxRowIdCounter++,
      taxId: selectedTax.value,
      taxName: selectedTax.title,
      percentage: taxPercentage.value,
      minValue: taxMinValue.value,
      priority: taxPriority.value,
      priorityLabel: selectedPriority.title,
    });
  }

  // Reset form
  taxType.value = null;
  taxPercentage.value = '';
  taxMinValue.value = '';
  taxPriority.value = null;
};

// Handle edit tax from table
const handleEditTax = (item: any) => {
  taxType.value = item.taxId;
  taxPercentage.value = item.percentage;
  taxMinValue.value = item.minValue;
  taxPriority.value = item.priority;
  isEditingTax.value = true;
  editingTaxIndex.value = item.id;
};

// Handle delete tax from table
const handleDeleteTax = (item: any) => {
  taxTableItems.value = taxTableItems.value.filter((t) => t.id !== item.id);
  // Reset editing if deleting the item being edited
  if (editingTaxIndex.value === item.id) {
    isEditingTax.value = false;
    editingTaxIndex.value = null;
    taxType.value = null;
    taxPercentage.value = '';
    taxMinValue.value = '';
    taxPriority.value = null;
  }
};

// Cancel editing tax
const handleCancelTaxEdit = () => {
  isEditingTax.value = false;
  editingTaxIndex.value = null;
  taxType.value = null;
  taxPercentage.value = '';
  taxMinValue.value = '';
  taxPriority.value = null;
};

// Tests data
interface TestItem {
  id?: number;
  testName: string | null;
  testsCount: number | string | null;
  samplesCount: number | string | null;
  sampleQuantity: number | string | null;
  status: boolean;
}

const testsList = ref<TestItem[]>([
  {
    id: 1,
    testName: "اختبار 1",
    testsCount: 2,
    samplesCount: 22,
    sampleQuantity: 255,
    status: true,
  },
  {
    id: 2,
    testName: "اختبار 2",
    testsCount: 25,
    samplesCount: 5,
    sampleQuantity: 852,
    status: false,
  },
  {
    id: 3,
    testName: "اختبار 3",
    testsCount: 78,
    samplesCount: 26,
    sampleQuantity: 666,
    status: true,
  },
]);

const testForm = reactive<TestItem>({
  testName: null,
  testsCount: "",
  samplesCount: "",
  sampleQuantity: "",
  status: true,
});

const showTestDialog = ref(false);
const editingTest = ref<TestItem | null>(null);

const testItems = [
  { title: "اختر", value: null },
  { title: "اختبار 1", value: "test1" },
  { title: "اختبار 2", value: "test2" },
  { title: "اختبار 3", value: "test3" },
];

const testsTableHeaders = [
  { key: "testName", title: "الاختبار", width: "200px" },
  { key: "testsCount", title: "عدد الاختبارات", width: "150px" },
  { key: "samplesCount", title: "عدد العينات", width: "150px" },
  { key: "sampleQuantity", title: "كمية العينات", width: "150px" },
  { key: "status", title: "الحالة", width: "120px" },
];

const handleAddTest = () => {
  const newTest = {
    id: testsList.value.length + 1,
    testName: testForm.testName || "اختبار",
    testsCount: parseInt(testForm.testsCount) || 0,
    samplesCount: parseInt(testForm.samplesCount) || 0,
    sampleQuantity: parseInt(testForm.sampleQuantity) || 0,
    status: testForm.status,
  };
  testsList.value.push(newTest);
  resetTestForm();
};

const handleEditTest = (item: any) => {
  editingTest.value = {
    testName: item.testName,
    testsCount: item.testsCount.toString(),
    samplesCount: item.samplesCount.toString(),
    sampleQuantity: item.sampleQuantity.toString(),
    status: item.status,
    id: item.id,
  };
  showTestDialog.value = true;
};

const handleSaveTest = (payload: any) => {
  if (editingTest.value && editingTest.value.id) {
    const index = testsList.value.findIndex((t) => t.id === editingTest?.value?.id);
    if (index !== -1) {
      testsList.value[index] = {
        ...testsList.value[index],
        testName: payload.testName || "اختبار",
        testsCount: parseInt(payload.testsCount) || 0,
        samplesCount: parseInt(payload.samplesCount) || 0,
        sampleQuantity: parseInt(payload.sampleQuantity) || 0,
        status: payload.status,
      };
    }
  }
  editingTest.value = null;
  showTestDialog.value = false;
};

const handleDeleteTest = (item: any) => {
  testsList.value = testsList.value.filter((t) => t.id !== item.id);
};

const resetTestForm = () => {
  testForm.testName = null;
  testForm.testsCount = "";
  testForm.samplesCount = "";
  testForm.sampleQuantity = "";
  testForm.status = true;
};

// Sub Products table data
const subProductsTableItems = ref<any[]>([]);

// Tabs
const activeTab = ref(0);
const tabs = [
  {
    title: "البيانات الأساسية",
    value: 0,
    icon: `<svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 11.5V5.8C17 4.11984 17 3.27976 16.673 2.63803C16.3854 2.07354 15.9265 1.6146 15.362 1.32698C14.7202 1 13.8802 1 12.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H9M11 10H5M7 14H5M13 6H5M11.5 18L13.5 20L18 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    title: "بيانات الضرائب",
    value: 1,
    icon: `<svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 15C11 17.7614 13.2386 20 16 20C18.7614 20 21 17.7614 21 15C21 12.2386 18.7614 10 16 10C13.2386 10 11 12.2386 11 15ZM11 15C11 13.8742 11.3721 12.8353 12 11.9995V3M11 15C11 15.8254 11.2 16.604 11.5541 17.2901C10.7117 18.0018 8.76584 18.5 6.5 18.5C3.46243 18.5 1 17.6046 1 16.5V3M12 3C12 4.10457 9.53757 5 6.5 5C3.46243 5 1 4.10457 1 3M12 3C12 1.89543 9.53757 1 6.5 1C3.46243 1 1 1.89543 1 3M1 12C1 13.1046 3.46243 14 6.5 14C8.689 14 10.5793 13.535 11.4646 12.8618M12 7.5C12 8.60457 9.53757 9.5 6.5 9.5C3.46243 9.5 1 8.60457 1 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    title: "بيانات اضافية",
    value: 2,
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.5 9.5L7.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  },
  {
    title: "قائمة الاختبارات",
    value: 3,
    icon: `<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 1.26953V5.40007C11 5.96012 11 6.24015 11.109 6.45406C11.2049 6.64222 11.3578 6.7952 11.546 6.89108C11.7599 7.00007 12.0399 7.00007 12.6 7.00007H16.7305M13 12H5M13 16H5M7 8H5M11 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H12.2C13.8802 21 14.7202 21 15.362 20.673C15.9265 20.3854 16.3854 19.9265 16.673 19.362C17 18.7202 17 17.8802 17 16.2V7L11 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  },
];

// Tab helpers
const isTabActive = (tabValue: number) => activeTab.value === tabValue;

// Copy product code function
const copyProductCode = async () => {
  try {
    await navigator.clipboard.writeText(productCode.value);
    toast.success("تم نسخ كود المنتج بنجاح");
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = productCode.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    toast.success("تم نسخ كود المنتج بنجاح");
  }
};

// Handlers
const handleAddCategory = () => {
  console.log("Add new category");
};

const handleAddUnit = () => {
  console.log("Add new unit");
};

const handleAddLanguage = () => {
  console.log("Add new language");
};

const handleAddTaxType = () => {
  console.log("Add new tax type");
};

// === API Functions ===
interface CategoryItem {
  id: number;
  name: string;
}

interface UnitItem {
  id: number;
  name: string;
}

interface DiscountType {
  key: number;
  label: string;
}

interface MaterialType {
  key: number;
  label: string;
}

interface ConstantsResponse {
  status: number;
  data: {
    discount_types: DiscountType[];
    material_types: MaterialType[];
  };
}

interface CreateItemResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: {
    item_id: number;
    code: string;
  };
}

// Helper function to display API errors
const displayApiErrors = (err: any) => {
  const errors = err?.response?.data?.errors;
  if (errors && typeof errors === 'object') {
    // Display each field error
    Object.values(errors).forEach((fieldErrors: any) => {
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach((message: string) => {
          toast.error(message);
        });
      }
    });
  } else {
    // Fallback to general message
    toast.error(err?.response?.data?.message || 'حدث خطأ أثناء الحفظ');
  }
};

// Fetch categories from API
const fetchCategories = async () => {
  try {
    const response = await api.get<{ data: CategoryItem[] }>('/categories/list');
    categoryItems.value = response.data.map((item: CategoryItem) => ({
      title: item.name,
      value: item.id,
    }));
  } catch (err: any) {
    console.error('Error fetching categories:', err);
  }
};

// Fetch units from API
const fetchUnits = async () => {
  try {
    const response = await api.get<{ data: UnitItem[] }>('/units/list');
    unitItems.value = response.data.map((item: UnitItem) => ({
      title: item.name,
      value: item.id,
    }));
  } catch (err: any) {
    console.error('Error fetching units:', err);
  }
};

// Fetch constants (discount types) from API
const fetchConstants = async () => {
  try {
    const response = await api.get<ConstantsResponse>('/items/constants');
    discountTypeItems.value = response.data.discount_types.map((item: DiscountType) => ({
      title: item.label,
      value: item.key,
    }));

    MaterialTypeItems.value = response.data.material_types.map((item: MaterialType) => ({
      title: item.label,
      value: item.key,
    }));

  } catch (err: any) {
    console.error('Error fetching constants:', err);
  }
};

// Fetch taxes from API
const fetchTaxes = async () => {
  try {
    const response = await api.get<{ data: TaxItem[] }>('/taxes/list');
    taxTypeItems.value = response.data.map((item: TaxItem) => ({
      title: item.tax_name,
      value: item.id,
      value_rate: item.value_rate,
      minimum: item.minimum,
    }));
  } catch (err: any) {
    console.error('Error fetching taxes:', err);
  }
};

// Fetch tax constants (priorities) from API
interface TaxConstantsResponse {
  data: {
    priorities: Array<{ key: number; label: string }>;
    calculation_methods: Array<{ key: string; label: string }>;
  };
}

const fetchTaxConstants = async () => {
  try {
    const response = await api.get<TaxConstantsResponse>('/taxes/constants');
    taxPriorityItems.value = response.data.priorities.map((item) => ({
      title: item.label,
      value: item.key,
    }));
  } catch (err: any) {
    console.error('Error fetching tax constants:', err);
  }
};

// Handle tax selection change
const handleTaxChange = (taxId: string | number | number[] | string[] | null) => {
  // If it's an array, take the first element
  const id = Array.isArray(taxId) ? taxId[0] : taxId;

  if (id) {
    const selectedTax = taxTypeItems.value.find(tax => tax.value === Number(id));
    if (selectedTax) {
      taxPercentage.value = selectedTax.value_rate + '%';
      taxMinValue.value = selectedTax.minimum;
    }
  } else {
    taxPercentage.value = '';
    taxMinValue.value = '';
  }
};

// Fetch brands from API
const fetchBrands = async () => {
  try {
    const response = await api.get<{ data: BrandItem[] }>('/brands/list');
    brandItems.value = response.data.map((item: BrandItem) => ({
      title: item.name,
      value: item.id,
    }));
  } catch (err: any) {
    console.error('Error fetching brands:', err);
  }
};

// Fetch manufacturers from API
const fetchManufacturers = async () => {
  try {
    const response = await api.get<{ data: ManufacturerItem[] }>('/manufacturers/list');
    manufacturerItems.value = response.data.map((item: ManufacturerItem) => ({
      title: item.name,
      value: item.id,
    }));
  } catch (err: any) {
    console.error('Error fetching manufacturers:', err);
  }
};

// Fetch countries from API
const fetchCountries = async () => {
  try {
    const response = await api.get<{ data: CountryItem[] }>('/countries/list');
    countryItems.value = response.data.map((item: CountryItem) => ({
      title: item.name,
      value: item.id,
    }));
  } catch (err: any) {
    console.error('Error fetching countries:', err);
  }
};

// Fetch items (for related, attached, alternative products) from API
const fetchItemsList = async () => {
  try {
    const ignoreId = productItemId.value || '';
    const response = await api.get<{ data: ItemListItem[] }>(`/items/list?ignore_id=${ignoreId}`);
    productItems.value = response.data.map((item: ItemListItem) => ({
      title: `${item.name} (${item.code})`,
      value: item.id,
    }));
  } catch (err: any) {
    console.error('Error fetching items list:', err);
  }
};

// Fetch suppliers from API
const fetchSuppliers = async () => {
  try {
    const response = await api.get<{ data: SupplierItem[] }>('/suppliers/list');
    supplierItems.value = response.data.map((item: SupplierItem) => ({
      title: item.full_name || `Supplier ${item.id}`,
      value: item.id,
    }));
  } catch (err: any) {
    console.error('Error fetching suppliers:', err);
  }
};

// Build step 1 form data using FormData for proper array notation
const buildStep1Data = () => {
  const formData = new FormData();

  // Add _method: PUT if we're updating (productItemId exists)
  if (productItemId.value) {
    formData.append("_method", "PUT");
  }

  // Name fields with array notation
  formData.append("name[ar]", arabicName.value);
  formData.append("name[en]", englishName.value);

  // Description fields with array notation
  formData.append("description[ar]", arabicDescription.value);
  formData.append("description[en]", englishDescription.value);

  // Category and Unit
  if (category.value) formData.append("category_id", String(category.value));
  if (unit.value) formData.append("unit_id", String(unit.value));
  formData.append("is_minimum_unit", isMinUnit.value ? "true" : "false");
  if (materialType.value) formData.append("material_type", String(materialType.value));
  if (minQuantity.value) formData.append("min_quantity", String(minQuantity.value));

  // Prices
  if (purchasePrice.value) formData.append("purchase_price", purchasePrice.value);
  if (salePrice.value) formData.append("sell_price", salePrice.value);
  if (minSalePrice.value) formData.append("min_sell_price", minSalePrice.value);
  if (maxSalePrice.value) formData.append("max_sell_price", maxSalePrice.value);
  if (wholesalePrice.value) formData.append("wholesale_price", wholesalePrice.value);
  if (halfWholesalePrice.value) formData.append("half_wholesale_price", halfWholesalePrice.value);

  // Discount
  if (discountType.value) formData.append("discount_type", String(discountType.value));
  if (discountValue.value) formData.append("discount_value", discountValue.value);

  // Profit margin
  if (profitMargin.value) formData.append("profit_margin", profitMargin.value);

  // Collect all aspect_value_ids from selectedAspects
  let allAspectValueIds: (string | number)[] = [];
  Object.values(selectedAspects.value).forEach(values => {
    if (Array.isArray(values)) {
      values.forEach(val => allAspectValueIds.push(val));
    }
  });

  // In edit mode, if no new aspects selected, use the saved ones from API
  if (allAspectValueIds.length === 0 && savedAspectValueIds.value.length > 0) {
    allAspectValueIds = [...savedAspectValueIds.value];
  }

  // Add aspect_value_ids with array notation
  allAspectValueIds.forEach((id, index) => {
    formData.append(`aspect_value_ids[${index}]`, String(id));
  });

  // Add sub_items from subProductsTableItems
  subProductsTableItems.value.forEach((item, index) => {
    // Only include id in edit mode (when item has a real backend id, not local generated)
    if (isEditMode.value && item.backendId) {
      formData.append(`sub_items[${index}][id]`, String(item.backendId));
    } else {
      formData.append(`sub_items[${index}][id]`, "");
    }
    // Always send the name from the table item
    formData.append(`sub_items[${index}][name]`, String(item.name || ''));
    formData.append(`sub_items[${index}][purchase_price]`, String(item.purchasePrice || 0));
    formData.append(`sub_items[${index}][sell_price]`, String(item.salePrice || 0));
  });

  // Step
  formData.append("step", "1");

  return formData;
};

// Reset form fields
const resetFormFields = () => {
  arabicName.value = "";
  englishName.value = "";
  category.value = null;
  unit.value = null;
  isMinUnit.value = false;
  arabicDescription.value = "";
  englishDescription.value = "";
  purchasePrice.value = "";
  salePrice.value = "";
  minSalePrice.value = "";
  maxSalePrice.value = "";
  wholesalePrice.value = "";
  halfWholesalePrice.value = "";
  discountType.value = null;
  materialType.value = null;
  minQuantity.value = "";

  discountValue.value = "";
  profitMargin.value = "";
  productCode.value = "";
  productItemId.value = null;
  isStep1Completed.value = false;
  activeTab.value = 0;
  formRef.value?.reset();
};

const handleSaveAndReturn = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    try {
      savingLoading.value = true;
      const formData = buildStep1Data();

      // Use different endpoint for create vs update - GROUPED-ITEMS
      const endpoint = productItemId.value ? `/grouped-items/${productItemId.value}` : '/grouped-items';
      const response = await api.post<CreateItemResponse>(endpoint, formData);

      if (response.status === 200) {
        // Store the item_id and code if creating new (only when data is returned)
        if (!productItemId.value && response.data?.item_id) {
          productItemId.value = response.data.item_id;
        }
        if (response.data?.code) {
          productCode.value = response.data.code;
        }
        isStep1Completed.value = true;
        toast.success(productItemId.value ? "تم التعديل بنجاح" : "تم الإنشاء بنجاح");
        router.push({ name: 'GroupProductsList' });
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      displayApiErrors(err);
    } finally {
      savingLoading.value = false;
    }
  }
};

const handleSaveAndCreate = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    try {
      savingLoading.value = true;
      const formData = buildStep1Data();

      // Use different endpoint for create vs update - GROUPED-ITEMS
      const endpoint = productItemId.value ? `/grouped-items/${productItemId.value}` : '/grouped-items';
      const response = await api.post<CreateItemResponse>(endpoint, formData);

      if (response.status === 200) {
        toast.success(productItemId.value ? "تم التعديل بنجاح" : "تم الإنشاء بنجاح");
        resetFormFields();
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      displayApiErrors(err);
    } finally {
      savingLoading.value = false;
    }
  }
};

const handleSaveAndContinue = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    try {
      savingLoading.value = true;
      const formData = buildStep1Data();

      // Use different endpoint for create vs update - GROUPED-ITEMS
      const endpoint = productItemId.value ? `/grouped-items/${productItemId.value}` : '/grouped-items';
      const response = await api.post<CreateItemResponse>(endpoint, formData);

      if (response.status === 200) {
        // Store the item_id and code if creating new (only when data is returned)
        if (!productItemId.value && response.data?.item_id) {
          productItemId.value = response.data.item_id;
        }
        if (response.data?.code) {
          productCode.value = response.data.code;
        }
        isStep1Completed.value = true;
        toast.success(productItemId.value ? "تم التعديل بنجاح" : "تم الحفظ بنجاح");
        // Move to next tab (Tax data)
        activeTab.value = 1;
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      displayApiErrors(err);
    } finally {
      savingLoading.value = false;
    }
  }
};

// Build step 2 form data for taxes
const buildStep2Data = () => {
  const formData = new FormData();

  // Add _method: PUT since we're updating
  formData.append("_method", "PUT");

  // Add taxes array in the format: taxes[0][tax_id], taxes[0][percentage], etc.
  taxTableItems.value.forEach((tax, index) => {
    // Only send ID if it's from backend (saved tax)
    if (tax.backendId) {
      formData.append(`taxes[${index}][id]`, String(tax.backendId));
    }
    formData.append(`taxes[${index}][tax_id]`, String(tax.taxId));
    formData.append(`taxes[${index}][percentage]`, tax.percentage.replace('%', ''));
    formData.append(`taxes[${index}][minimum]`, tax.minValue);
    formData.append(`taxes[${index}][priority]`, String(tax.priority));
  });

  // Step
  formData.append("step", "2");

  return formData;
};

// Step 2 Save Handlers
const handleStep2SaveAndReturn = async () => {
  if (!productItemId.value) {
    toast.error('يرجى إتمام الخطوة الأولى أولاً');
    return;
  }

  try {
    savingLoading.value = true;
    const formData = buildStep2Data();
    const endpoint = `/grouped-items/${productItemId.value}`;
    const response = await api.post<CreateItemResponse>(endpoint, formData);

    if (response.status === 200) {
      toast.success("تم حفظ بيانات الضرائب بنجاح");
      router.push({ name: 'GroupProductsList' });
    }
  } catch (err: any) {
    console.error('Error saving tax data:', err);
    displayApiErrors(err);
  } finally {
    savingLoading.value = false;
  }
};

const handleStep2SaveAndCreate = async () => {
  if (!productItemId.value) {
    toast.error('يرجى إتمام الخطوة الأولى أولاً');
    return;
  }

  try {
    savingLoading.value = true;
    const formData = buildStep2Data();
    const endpoint = `/grouped-items/${productItemId.value}`;
    const response = await api.post<CreateItemResponse>(endpoint, formData);

    if (response.status === 200) {
      toast.success("تم حفظ بيانات الضرائب بنجاح");
      resetFormFields();
    }
  } catch (err: any) {
    console.error('Error saving tax data:', err);
    displayApiErrors(err);
  } finally {
    savingLoading.value = false;
  }
};

const handleStep2SaveAndContinue = async () => {
  if (!productItemId.value) {
    toast.error('يرجى إتمام الخطوة الأولى أولاً');
    return;
  }

  try {
    savingLoading.value = true;
    const formData = buildStep2Data();
    const endpoint = `/grouped-items/${productItemId.value}`;
    const response = await api.post<CreateItemResponse>(endpoint, formData);

    if (response.status === 200) {
      toast.success("تم حفظ بيانات الضرائب بنجاح");
      // Fetch items list for step 3 dropdowns
      await fetchItemsList();
      // Move to next tab (Additional data)
      activeTab.value = 2;
    }
  } catch (err: any) {
    console.error('Error saving tax data:', err);
    displayApiErrors(err);
  } finally {
    savingLoading.value = false;
  }
};

// Build step 3 form data for additional data
const buildStep3Data = () => {
  const formData = new FormData();

  // Add _method: PUT since we're updating
  formData.append("_method", "PUT");

  // Brand, Manufacturer, Country of Origin
  if (brand.value) formData.append("brand_id", String(brand.value));
  if (manufacturer.value) formData.append("manufacturer_id", String(manufacturer.value));
  if (originCountry.value) formData.append("country_of_origin_id", String(originCountry.value));

  // Product availability flags
  formData.append("is_manufacturable", isManufacturingProduct.value ? "true" : "false");
  formData.append("allow_negative_sales", sellNegative.value ? "true" : "false");
  formData.append("is_rentable", isAvailableForRent.value ? "true" : "false");
  formData.append("is_returnable", isAvailableForReturn.value ? "true" : "false");
  formData.append("is_barter_sale", isAvailableForRefund.value ? "true" : "false");
  formData.append("is_settlement_by_netting", isAvailableForOffset.value ? "true" : "false");
  formData.append("is_available_for_projects", isAvailableForPurchase.value ? "true" : "false");
  formData.append("is_available_for_sale", isAvailableForSelling.value ? "true" : "false");
  formData.append("is_available_for_purchase", isAvailableForBuying.value ? "true" : "false");

  // Alternative items (array)
  alternativeProducts.value.forEach((itemId, index) => {
    formData.append(`alternative_items[${index}]`, String(itemId));
  });

  // Attached items (array)
  attachedProducts.value.forEach((itemId, index) => {
    formData.append(`attached_items[${index}]`, String(itemId));
  });

  // Linked items / Related products (array)
  relatedProducts.value.forEach((itemId, index) => {
    formData.append(`linked_items[${index}]`, String(itemId));
  });

  // Best suppliers (array)
  bestSuppliers.value.forEach((supplierId, index) => {
    formData.append(`best_suppliers[${index}]`, String(supplierId));
  });

  // Step
  formData.append("step", "3");

  return formData;
};

// Step 3 Save Handlers
const handleStep3SaveAndReturn = async () => {
  if (!productItemId.value) {
    toast.error('يرجى إتمام الخطوة الأولى أولاً');
    return;
  }

  try {
    savingLoading.value = true;
    const formData = buildStep3Data();
    const endpoint = `/grouped-items/${productItemId.value}`;
    const response = await api.post<CreateItemResponse>(endpoint, formData);

    if (response.status === 200) {
      toast.success("تم حفظ البيانات الإضافية بنجاح");
      router.push({ name: 'GroupProductsList' });
    }
  } catch (err: any) {
    console.error('Error saving additional data:', err);
    displayApiErrors(err);
  } finally {
    savingLoading.value = false;
  }
};

const handleStep3SaveAndCreate = async () => {
  if (!productItemId.value) {
    toast.error('يرجى إتمام الخطوة الأولى أولاً');
    return;
  }

  try {
    savingLoading.value = true;
    const formData = buildStep3Data();
    const endpoint = `/grouped-items/${productItemId.value}`;
    const response = await api.post<CreateItemResponse>(endpoint, formData);

    if (response.status === 200) {
      toast.success("تم حفظ البيانات الإضافية بنجاح");
      resetFormFields();
    }
  } catch (err: any) {
    console.error('Error saving additional data:', err);
    displayApiErrors(err);
  } finally {
    savingLoading.value = false;
  }
};

const handleStep3SaveAndContinue = async () => {
  if (!productItemId.value) {
    toast.error('يرجى إتمام الخطوة الأولى أولاً');
    return;
  }

  try {
    savingLoading.value = true;
    const formData = buildStep3Data();
    const endpoint = `/grouped-items/${productItemId.value}`;
    const response = await api.post<CreateItemResponse>(endpoint, formData);

    if (response.status === 200) {
      toast.success("تم حفظ البيانات الإضافية بنجاح");
      // Move to next tab (Tests list)
      activeTab.value = 3;
      // Fetch items list for step 3 dropdowns with ignore_id
      fetchItemsList();
    }
  } catch (err: any) {
    console.error('Error saving additional data:', err);
    displayApiErrors(err);
  } finally {
    savingLoading.value = false;
  }
};

// Check if tab is accessible
const isTabAccessible = (tabValue: number) => {
  // Tab 0 is always accessible
  if (tabValue === 0) return true;
  // Other tabs are accessible only in edit mode or after step 1 completion
  return isEditMode.value || isStep1Completed.value;
};

// Handle tab click
const handleTabClick = (tabValue: number) => {
  if (isTabAccessible(tabValue)) {
    activeTab.value = tabValue;
  }
};

// Fetch single product data for edit mode
const fetchProduct = async (id: number) => {
  try {
    const response = await api.get<any>(`/grouped-items/${id}`);
    const data = response.data;

    if (data) {
      productItemId.value = data.id;
      productCode.value = data.code;

      // Names
      if (data.name_translations) {
        arabicName.value = data.name_translations.ar || '';
        englishName.value = data.name_translations.en || '';
      }

      // Descriptions
      if (data.description_translations) {
        arabicDescription.value = data.description_translations.ar || '';
        englishDescription.value = data.description_translations.en || '';
      }

      // Category & Unit
      category.value = data.category_id;
      unit.value = data.unit_id;
      isMinUnit.value = data.is_minimum_unit;

      // Prices
      purchasePrice.value = data.purchase_price;
      salePrice.value = data.sell_price;
      minSalePrice.value = data.min_sell_price;
      maxSalePrice.value = data.max_sell_price;
      wholesalePrice.value = data.wholesale_price;
      halfWholesalePrice.value = data.semi_wholesale_price;

      // Taxes (Map API taxes to table items)
      if (Array.isArray(data.taxes)) {
        taxTableItems.value = data.taxes.map((tax: any) => {
          // Find priority label from loaded constants
          const priorityItem = taxPriorityItems.value.find(p => p.value == tax.priority);
          const priorityLabel = priorityItem ? priorityItem.title : String(tax.priority);

          return {
            id: tax.id, // Local ID for table
            backendId: tax.id, // Backend ID for API requests
            taxId: tax.tax_id,
            taxName: tax.tax_name,
            percentage: tax.percentage ? `${parseFloat(tax.percentage)}%` : '0%',
            minValue: tax.minimum,
            priority: tax.priority,
            priorityLabel: priorityLabel
          };
        });

        // Update ID counter to prevent collisions with new local rows
        if (taxTableItems.value.length > 0) {
          const maxId = Math.max(...taxTableItems.value.map(t => t.id));
          taxRowIdCounter = maxId + 1;
        }
      }

      // Discount & Profit
      discountType.value = data.discount_type ? Number(data.discount_type) : null;
      discountValue.value = data.discount_value;
      minQuantity.value = data.min_quantity;
      // Material Type
      if (data.material_types) {
        if (typeof data.material_types === 'object' && 'key' in data.material_types) {
          materialType.value = data.material_types.key;
        } else if (typeof data.material_types === 'object' && 'id' in data.material_types) {
          materialType.value = data.material_types.id;
        } else {
          materialType.value = data.material_types;
        }
      } else if (data.material_type) {
        if (typeof data.material_type === 'object' && 'key' in data.material_type) {
          materialType.value = data.material_type.key;
        } else if (typeof data.material_type === 'object' && 'id' in data.material_type) {
          materialType.value = data.material_type.id;
        } else {
          materialType.value = data.material_type;
        }
      }
      profitMargin.value = data.profit_margin;

      // Load aspect_value_ids for edit mode
      if (Array.isArray(data.aspect_value_ids)) {
        savedAspectValueIds.value = data.aspect_value_ids.map((id: any) => String(id));
      }

      // Relations
      originCountry.value = data.country_of_origin_id;
      manufacturer.value = data.manufacturer_id;
      brand.value = data.brand_id;

      // Arrays (Map string IDs to numbers)
      if (Array.isArray(data.alternative_items)) {
        alternativeProducts.value = data.alternative_items.map((i: any) => Number(i));
      }
      if (Array.isArray(data.attached_items)) {
        attachedProducts.value = data.attached_items.map((i: any) => Number(i));
      }
      if (Array.isArray(data.linked_items)) {
        relatedProducts.value = data.linked_items.map((i: any) => Number(i));
      }
      if (Array.isArray(data.best_suppliers)) {
        bestSuppliers.value = data.best_suppliers.map((i: any) => Number(i));
      }

      // Boolean Flags - Mapping based on buildStep3Data logic
      sellNegative.value = data.allow_negative_sales;
      isManufacturingProduct.value = data.is_manufacturable;
      isAvailableForRent.value = data.is_rentable;
      isAvailableForReturn.value = data.is_returnable;

      // Mappings inferred from formData construction:
      isAvailableForRefund.value = data.is_barter_sale; // formData: is_barter_sale maps to isAvailableForRefund
      isAvailableForOffset.value = data.is_settlement_by_netting; // formData: is_settlement_by_netting maps to isAvailableForOffset
      isAvailableForPurchase.value = data.is_available_for_projects; // formData: is_available_for_projects maps to isAvailableForPurchase
      isAvailableForSelling.value = data.is_available_for_sale;
      isAvailableForBuying.value = data.is_available_for_purchase;

      // Load sub_items for edit mode
      if (Array.isArray(data.sub_items) && data.sub_items.length > 0) {
        subProductsTableItems.value = data.sub_items.map((item: any, index: number) => ({
          id: index + 1, // Local ID for v-for key
          backendId: item.id, // Backend ID for API updates
          name: item.name || '',
          sku: item.code || '',
          salePrice: item.sell_price || '',
          purchasePrice: item.purchase_price || '',
          isEditing: false,
        }));
      }

      isStep1Completed.value = true;
    }
  } catch (err: any) {
    console.error('Error fetching product:', err);
    toast.error('فشل في جلب بيانات المنتج');
  }
};

// Lifecycle hook - fetch data on mount
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      // Step 1 APIs
      fetchCategories(),
      fetchUnits(),
      fetchConstants(),
      // Step 2 APIs
      fetchTaxes(),
      fetchTaxConstants(),
      // Step 3 APIs
      fetchBrands(),
      fetchManufacturers(),
      fetchCountries(),
      fetchSuppliers(),
      // fetchAspects(), // Removed from here to be called by watch on category selection
    ]);

    // If in edit mode, set step 1 as completed and load item data
    if (isEditMode.value) {
      itemId.value = Number(route.params.id);
      productItemId.value = Number(route.params.id);
      // Fetch items list with ignore_id for edit mode
      await fetchItemsList();
      // Fetch item data for editing
      await fetchProduct(Number(route.params.id));
    }
  } catch (err) {
    console.error('Error loading form data:', err);
  } finally {
    loading.value = false;
  }
});

// Watch for tab changes to fetch data when needed
watch(activeTab, async (newTab) => {
  // When moving to tab 2 (Additional data), fetch items list if not already loaded
  if (newTab === 2 && productItems.value.length === 0 && productItemId.value) {
    await fetchItemsList();
  }
});

// Watch for category change to fetch aspects
watch(category, (newVal) => {
  if (newVal) {
    fetchAspects();
  } else {
    aspects.value = [];
    selectedAspects.value = {};
  }
});

// Additional icons for sub-products table (matching DataTable.vue icons)
const trashIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6666 4.16668V3.50001C11.6666 2.56659 11.6666 2.09988 11.4849 1.74336C11.3251 1.42976 11.0702 1.17479 10.7566 1.015C10.4 0.833344 9.93334 0.833344 8.99992 0.833344H7.66658C6.73316 0.833344 6.26645 0.833344 5.90993 1.015C5.59633 1.17479 5.34136 1.42976 5.18157 1.74336C4.99992 2.09988 4.99992 2.56659 4.99992 3.50001V4.16668M6.66659 8.75001V12.9167M9.99992 8.75001V12.9167M0.833252 4.16668H15.8333M14.1666 4.16668V13.5C14.1666 14.9001 14.1666 15.6002 13.8941 16.135C13.6544 16.6054 13.272 16.9878 12.8016 17.2275C12.2668 17.5 11.5667 17.5 10.1666 17.5H6.49992C5.09979 17.5 4.39972 17.5 3.86494 17.2275C3.39454 16.9878 3.01209 16.6054 2.7724 16.135C2.49992 15.6002 2.49992 14.9001 2.49992 13.5V4.16668" stroke="#D92D20" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const pencilIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.14662 14.1201C1.18491 13.7755 1.20405 13.6032 1.25618 13.4422C1.30243 13.2993 1.36778 13.1633 1.45045 13.038C1.54363 12.8967 1.66621 12.7741 1.91136 12.5289L12.9166 1.5237C13.8371 0.603225 15.3295 0.603226 16.2499 1.5237C17.1704 2.44417 17.1704 3.93656 16.2499 4.85703L5.24469 15.8623C4.99954 16.1074 4.87696 16.23 4.73566 16.3232C4.61029 16.4058 4.47433 16.4712 4.33146 16.5174C4.17042 16.5696 3.99813 16.5887 3.65356 16.627L0.833252 16.9404L1.14662 14.1201Z" stroke="#1570EF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Icons moved to @/components/icons/productIcons.ts
</script>

<template>
  <default-layout>
    <div class="form-validation-page">
      <!-- Header -->
      <PageHeader :icon="gridIcon" title-key="pages.groupProducts.title"
        description-key="pages.groupProducts.description" />

      <!-- Tabs -->
      <div
        class="flex xl:items-center xl:justify-between py-4 border-y border-gray-200 flex-col xl:flex-row gap-3 mb-4">
        <!-- Tabs -->
        <div class="flex gap-2 overflow-y-auto">
          <button v-for="tab in tabs" :key="tab.value" @click="handleTabClick(tab.value)"
            :disabled="!isTabAccessible(tab.value)" :class="[
              'flex items-center gap-2 px-3.5 py-2.5 rounded-md transition-all',
              isTabActive(tab.value)
                ? 'bg-primary-500 text-white'
                : isTabAccessible(tab.value)
                  ? 'text-gray-400 hover:bg-gray-50 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed opacity-50',
            ]">
            <span v-html="tab.icon" class="w-6 h-6"></span>
            <span class="text-base font-semibold whitespace-nowrap">{{
              tab.title
            }}</span>
          </button>
        </div>

        <!-- Product Code Badge - Only show in edit mode or after step 1 completion -->
        <div v-if="isEditMode || isStep1Completed" class="flex items-center lg:gap-3 gap-2">
          <!-- Label -->
          <span class="text-sm font-semibold text-gray-700">كود المنتج</span>
          <!-- Product Code Badge -->
          <div class="flex items-center gap-2 px-2.5 py-1.5 bg-primary-100 border border-primary-300 rounded shadow-xs">
            <button @click="copyProductCode" class="cursor-pointer hover:opacity-80 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.6667 1.89111V5.33323C11.6667 5.79994 11.6667 6.0333 11.7575 6.21156C11.8374 6.36836 11.9649 6.49584 12.1217 6.57574C12.3 6.66656 12.5333 6.66656 13 6.66656H16.4422M11.6667 14.1665H6.66671M13.3334 10.8332H6.66671M16.6667 8.32336V14.3332C16.6667 15.7333 16.6667 16.4334 16.3942 16.9681C16.1545 17.4386 15.7721 17.821 15.3017 18.0607C14.7669 18.3332 14.0668 18.3332 12.6667 18.3332H7.33337C5.93324 18.3332 5.23318 18.3332 4.6984 18.0607C4.22799 17.821 3.84554 17.4386 3.60586 16.9681C3.33337 16.4334 3.33337 15.7333 3.33337 14.3332V5.6665C3.33337 4.26637 3.33337 3.56631 3.60586 3.03153C3.84554 2.56112 4.22799 2.17867 4.6984 1.93899C5.23318 1.6665 5.93324 1.6665 7.33337 1.6665H10.0099C10.6213 1.6665 10.9271 1.6665 11.2148 1.73558C11.4699 1.79682 11.7137 1.89783 11.9374 2.0349C12.1897 2.18951 12.4059 2.4057 12.8383 2.83808L15.4951 5.49493C15.9275 5.92731 16.1437 6.1435 16.2983 6.39579C16.4354 6.61947 16.5364 6.86333 16.5976 7.11842C16.6667 7.40614 16.6667 7.71188 16.6667 8.32336Z"
                  stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <span class="font-bold text-primary-800 dir-ltr">{{
              productCode
            }}</span>
          </div>
        </div>
      </div>

      <v-tabs-window v-model="activeTab">
        <!-- Tab 1: البيانات الأساسية -->
        <v-tabs-window-item :value="0">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
            <div class="">
              <!-- Two Column Layout -->
              <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-3 bg-gray-50 rounded-lg p-3">
                <!-- Right Column: Prices Section -->
                <div class="xl:col-span-4 order-2 lg:order-1">
                  <div class="bg-gray-100 rounded-lg p-6">
                    <!-- Prices Header -->
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-[38px] h-[38px] bg-primary-500 rounded flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clip-path="url(#clip0_852_47730)">
                            <path
                              d="M11.2749 6.95972C10.7979 7.29979 10.2141 7.49984 9.58366 7.49984C7.97283 7.49984 6.66699 6.194 6.66699 4.58317C6.66699 2.97234 7.97283 1.6665 9.58366 1.6665C10.6278 1.6665 11.5438 2.21518 12.0591 3.03996M5.00033 16.7391H7.17557C7.45918 16.7391 7.74106 16.7729 8.016 16.8404L10.3144 17.3989C10.8131 17.5204 11.3326 17.5322 11.8366 17.4343L14.3778 16.9399C15.0491 16.8092 15.6666 16.4877 16.1506 16.0169L17.9486 14.2679C18.462 13.7693 18.462 12.9602 17.9486 12.4607C17.4863 12.011 16.7543 11.9604 16.2313 12.3418L14.1358 13.8705C13.8357 14.0899 13.4706 14.208 13.095 14.208H11.0716L12.3595 14.208C13.0855 14.208 13.6735 13.6359 13.6735 12.9298V12.6741C13.6735 12.0878 13.2633 11.5765 12.6787 11.4347L10.6908 10.9513C10.3673 10.8728 10.036 10.8332 9.70294 10.8332C8.89893 10.8332 7.44357 11.4988 7.44357 11.4988L5.00033 12.5206M16.667 5.4165C16.667 7.02733 15.3612 8.33317 13.7503 8.33317C12.1395 8.33317 10.8337 7.02733 10.8337 5.4165C10.8337 3.80567 12.1395 2.49984 13.7503 2.49984C15.3612 2.49984 16.667 3.80567 16.667 5.4165ZM1.66699 12.1665L1.66699 16.9998C1.66699 17.4665 1.66699 17.6999 1.75782 17.8782C1.83771 18.035 1.9652 18.1624 2.122 18.2423C2.30026 18.3332 2.53361 18.3332 3.00033 18.3332H3.66699C4.1337 18.3332 4.36706 18.3332 4.54532 18.2423C4.70212 18.1624 4.8296 18.035 4.9095 17.8782C5.00033 17.6999 5.00033 17.4665 5.00033 16.9998V12.1665C5.00033 11.6998 5.00033 11.4664 4.9095 11.2882C4.8296 11.1314 4.70212 11.0039 4.54532 10.924C4.36706 10.8332 4.1337 10.8332 3.66699 10.8332L3.00033 10.8332C2.53362 10.8332 2.30026 10.8332 2.122 10.924C1.9652 11.0039 1.83771 11.1314 1.75782 11.2882C1.66699 11.4664 1.66699 11.6998 1.66699 12.1665Z"
                              stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          </g>
                          <defs>
                            <clipPath id="clip0_852_47730">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <h2 class="text-lg font-bold text-primary-900">
                        الأسعار
                      </h2>
                    </div>

                    <!-- Price Fields -->
                    <div class="flex flex-col gap-[20px]">
                      <PriceInput v-model="purchasePrice" label="سعر الشراء" placeholder="ادخل السعر"
                        :rules="[required(), numeric(), positive()]" :hide-details="false" />
                      <PriceInput v-model="salePrice" label="سعر البيع" placeholder="ادخل السعر"
                        :rules="[required(), numeric(), positive()]" :hide-details="false" />
                      <div class="grid grid-cols-2 gap-[14px]">
                        <PriceInput v-model="minSalePrice" label="أقل سعر بيع" placeholder="ادخل السعر"
                          :rules="[numeric(), positive()]" :hide-details="false" />
                        <PriceInput v-model="maxSalePrice" label="أعلى سعر بيع" placeholder="ادخل السعر"
                          :rules="[numeric(), positive()]" :hide-details="true" />
                      </div>
                      <PriceInput v-model="profitMargin" label="هامش الربح" placeholder="هامش الربح"
                        :rules="[numeric(), positive()]" :hide-details="true" />

                      <!-- Discount Section -->
                      <div>
                        <SelectInput v-model="discountType" label="نوع الخصم" placeholder="اختر نوع الخصم"
                          :items="discountTypeItems" />
                      </div>
                      <div>
                        <PriceInput v-model="discountValue" label="قيمة الخصم" placeholder="ادخل قيمة الخصم"
                          :rules="[numeric(), positive()]" :hide-details="false" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Left Column: Product Info Section -->
                <div class="xl:col-span-8 order-1 lg:order-2">
                  <div class="p-6">
                    <!-- Product Info Header -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div class="flex items-center gap-3">
                        <div class="w-[38px] h-[38px] bg-primary-500 rounded flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M11.6663 9.1665H6.66634M8.33301 12.4998H6.66634M13.333 5.83317H6.66634M16.6663 5.6665V14.3332C16.6663 15.7333 16.6663 16.4334 16.3939 16.9681C16.1542 17.4386 15.7717 17.821 15.3013 18.0607C14.7665 18.3332 14.0665 18.3332 12.6663 18.3332H7.33301C5.93288 18.3332 5.23281 18.3332 4.69803 18.0607C4.22763 17.821 3.84517 17.4386 3.60549 16.9681C3.33301 16.4334 3.33301 15.7333 3.33301 14.3332V5.6665C3.33301 4.26637 3.33301 3.56631 3.60549 3.03153C3.84517 2.56112 4.22763 2.17867 4.69803 1.93899C5.23281 1.6665 5.93288 1.6665 7.33301 1.6665H12.6663C14.0665 1.6665 14.7665 1.6665 15.3013 1.93899C15.7717 2.17867 16.1542 2.56112 16.3939 3.03153C16.6663 3.56631 16.6663 4.26637 16.6663 5.6665Z"
                              stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                        </div>
                        <h2 class="text-lg font-bold text-primary-900">
                          المعلومات العامة للمنتج
                        </h2>
                      </div>
                      <div class="flex items-center gap-4">
                        <ButtonWithIcon variant="flat" color="primary-700" height="40"
                          custom-class="font-semibold text-base" :prepend-icon="langIcon" label="أضف لغة جديدة"
                          @click="handleAddLanguage" />
                      </div>
                    </div>

                    <!-- Name Fields with Language Tabs -->
                    <LanguageTabs :languages="availableLanguages" label="الإسم" class="mb-[20px]">
                      <template #en>
                        <TextInput v-model="englishName" placeholder="Enter name in English" :rules="[
                          required('englishNameRequired'),
                          minLength(2),
                          maxLength(100),
                        ]" :hide-details="false" />
                      </template>
                      <template #ar>
                        <TextInput v-model="arabicName" placeholder="ادخل الاسم بالعربية" :rules="[
                          required('arabicNameRequired'),
                          minLength(2),
                          maxLength(100),
                          arabicOnly(),
                        ]" :hide-details="true" />
                      </template>
                    </LanguageTabs>

                    <!-- Category and Unit -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-[20px]">
                      <SelectWithIconInput v-model="category" label="التصنيف" placeholder="اختر التصنيف"
                        :items="categoryItems" :rules="[required()]" :hide-details="false" show-add-button
                        @add-click="handleAddCategory" />
                      <div class="flex flex-col">
                        <SelectWithIconInput v-model="unit" label="الوحدة" placeholder="اختر الوحدة" :items="unitItems"
                          :rules="[required()]" :hide-details="false" show-add-button @add-click="handleAddUnit" />
                        <CheckboxInput v-model="isMinUnit" label="اقل وحدة" color="primary" classes="mt-2" />
                      </div>

                      <div>
                        <SelectWithIconInput :rules="[required()]" clearable v-model="materialType" label="نوع المادة"
                          placeholder="اختر نوع المادة" :items="MaterialTypeItems" :hide-details="false" />
                      </div>

                      <div>
                        <TextInput type="number" :rules="[required()]" v-model="minQuantity" label="حد أدنى للكمية"
                          placeholder="أدخل الحد الأدنى" :hide-details="false" />
                      </div>

                    </div>

                    <!-- Description with Language Tabs -->
                    <LanguageTabs :languages="availableLanguages" label="الوصف" class="mb-[20px]">
                      <template #en>
                        <RichTextEditor v-model="englishDescription" placeholder="Enter description in English"
                          min-height="120px" :hide-details="false" />
                      </template>
                      <template #ar>
                        <RichTextEditor v-model="arabicDescription" placeholder="ادخل الوصف بالعربية" min-height="120px"
                          :hide-details="false" />
                      </template>
                    </LanguageTabs>

                    <!-- Product Image Section -->
                    <div>
                      <FileUploadInput v-model="productImages" label="صورة المنتج"
                        hint="PNG, JPG or GIF (max. 400x400px)" :max-files="4" layout="horizontal" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Warning Message - Only show when category is NOT selected -->
              <div v-if="!isCategorySelected"
                class="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="#DC6803" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p class="text-sm font-bold text-warning-600">
                  يجب عليك اختيار التصنيف لاضافة مجموعة منتجات
                </p>
              </div>
            </div>

            <!-- Product Variants Section - Only show when category is selected AND not in edit mode -->
            <template v-if="isCategorySelected">
              <!-- Show variant selection only in create mode -->
              <div v-if="!isEditMode && !isStep1Completed" class="bg-primary-50 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-bold text-primary-800 text-right mb-6">
                  متغيرات المنتج
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                  <div v-for="aspect in aspects" :key="aspect.id" class="w-full">
                    <MultipleSelectInput v-model="selectedAspects[aspect.id]" :label="aspect.name"
                      :items="aspect.values.map(v => ({ title: v.name, value: v.id }))"
                      :placeholder="'اختر ' + aspect.name" />
                  </div>
                  <div class="w-full">
                    <ButtonWithIcon variant="flat" color="primary" height="44"
                      custom-class="font-semibold text-sm w-full" :append-icon="plusIcon" label="انشاء منتجات فرعية"
                      @click="generateSubProducts" />
                  </div>
                </div>
              </div>

              <!-- Sub Products Table Section - Show after generate OR in edit mode when items exist -->
              <div v-if="subProductsGenerated || subProductsTableItems.length > 0" class="mb-6">
                <div class="rounded-lg overflow-hidden border border-gray-200">
                  <!-- Table Header -->
                  <div class="bg-primary-50 px-4 py-3">
                    <h3 class="text-lg font-bold text-gray-900 text-right">
                      المنتجات الفرعية
                    </h3>
                  </div>

                  <!-- Table -->
                  <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th class="px-6 py-3 text-right text-xs font-bold text-gray-600">اسم المنتج</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-gray-600">كود المنتج</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-gray-600">سعر البيع</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-gray-600">سعر الشراء</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-gray-600">الاجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in subProductsTableItems" :key="item.id"
                        class="border-b border-gray-200 hover:bg-gray-50">
                        <td class="px-6 py-4 text-right text-sm font-medium text-gray-600">{{ item.name }}</td>
                        <td class="px-6 py-4 text-center text-sm font-medium text-gray-600">{{ item.sku }}</td>
                        <td class="px-2 py-4 text-center">
                          <template v-if="editingRowId === item.id">
                            <input v-model="item.salePrice" type="number"
                              class="w-[110px] px-3 py-2 text-center text-sm border-2 border-solid bg-white border-primary-400 rounded-lg focus:outline-none focus:border-primary-500"
                              placeholder="0" />
                          </template>
                          <template v-else>
                            <span class="text-sm font-medium text-gray-600">
                              {{ item.salePrice ? item.salePrice + ' ريال' : '-' }}
                            </span>
                          </template>
                        </td>
                        <td class="px-2 py-4 text-center">
                          <template v-if="editingRowId === item.id">
                            <input v-model="item.purchasePrice" type="number"
                              class="w-[110px] px-3 py-2 text-center text-sm border-2 border-solid bg-white border-primary-400 rounded-lg focus:outline-none focus:border-primary-500"
                              placeholder="0" />
                          </template>
                          <template v-else>
                            <span class="text-sm font-medium text-gray-600">
                              {{ item.purchasePrice ? item.purchasePrice + ' ريال' : '-' }}
                            </span>
                          </template>
                        </td>
                        <td class="px-6 py-4 text-center">
                          <div class="flex items-center justify-center gap-1">
                            <template v-if="editingRowId === item.id">
                              <v-btn icon color="primary" size="small" class="!px-4 !w-auto" @click="saveEditingRow">
                                تعديل
                              </v-btn>
                            </template>
                            <template v-else>
                              <v-btn icon variant="text" color="primary" size="small" @click="startEditingRow(item)">
                                <span v-html="pencilIcon"></span>
                              </v-btn>
                              <v-btn icon variant="text" color="error" size="small" @click="deleteSubProductRow(item)">
                                <span v-html="trashIcon"></span>
                              </v-btn>
                            </template>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>
            <!-- Action Buttons -->
            <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
              <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                label="حفظ والعودة للرئيسية" @click="handleSaveAndReturn" />

              <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                label="حفظ وإنشاء جديد" @click="handleSaveAndCreate" />

              <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="arrowLeftIcon"
                label="حفظ والمتابعة" @click="handleSaveAndContinue" />
            </div>
          </v-form>
        </v-tabs-window-item>

        <!-- Tab 2: بيانات الضرائب -->
        <v-tabs-window-item :value="1">
          <div class="mx-auto">
            <div class="-mx-6">
              <h3 class="text-lg font-bold text-gray-900 bg-gray-25 border-t-gray-300 border-t px-6 py-3">
                الضرائب المطبقة على المنتج
              </h3>
              <!-- Tax Fields Row -->
              <div
                class="grid grid-cols-1 xl:grid-cols-6 md:grid-cols-3 gap-4 items-center px-6 bg-primary-50 py-3 border-t border-t-gray-300">
                <SelectWithIconInput v-model="taxType" placeholder="اختر النوع" :items="taxTypeItems"
                  :hide-details="false" show-add-button @add-click="handleAddTaxType"
                  @update:model-value="handleTaxChange" />
                <TextInput v-model="taxPercentage" placeholder="النسبة" :hide-details="false" disabled />
                <TextInput v-model="taxMinValue" placeholder="الحد الأدنى للضريبة" :hide-details="false" disabled />
                <SelectInput v-model="taxPriority" placeholder="اختر الأولوية" :items="taxPriorityItems"
                  :hide-details="false" />
                <ButtonWithIcon variant="flat" color="primary-500" border="sm" rounded="4" height="44"
                  custom-class="font-semibold !text-white text-sm !border-primary-200" :prepend-icon="plusIcon"
                  :label="isEditingTax ? 'تعديل ضريبة' : 'أضف ضريبة'" @click="handleAddTax" />
                <ButtonWithIcon v-if="isEditingTax" variant="flat" color="gray-200" border="sm" rounded="4" height="44"
                  custom-class="font-semibold text-gray-700 text-sm" label="إلغاء" @click="handleCancelTaxEdit" />
              </div>

              <!-- Tax Table -->
              <DataTable :headers="taxTableHeaders" :items="taxTableItems" show-checkbox show-actions force-show-edit
                force-show-delete @edit="handleEditTax" @delete="handleDeleteTax" />
            </div>

            <!-- Action Buttons for Step 2 -->
            <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col px-6">
              <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                label="حفظ والعودة للرئيسية" @click="handleStep2SaveAndReturn" />

              <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                label="حفظ وإنشاء جديد" @click="handleStep2SaveAndCreate" />

              <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="arrowLeftIcon"
                label="حفظ والمتابعة" @click="handleStep2SaveAndContinue" />
            </div>
          </div>
        </v-tabs-window-item>

        <!-- Tab 3: البيانات الإضافية -->
        <v-tabs-window-item :value="2">
          <!-- Supply and Internal Relations Section -->
          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 class="text-lg font-bold text-primary-900 mb-6 text-right">
              التوريد والعلاقات الداخلية للمنتج
            </h2>

            <!-- Row 1: Country, Manufacturer, Brand -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-6">
              <SelectWithIconInput v-model="originCountry" label="بلد المنشأ" placeholder="اختر البلد"
                :items="countryItems" :hide-details="false" show-add-button @add-click="handleAddCountry" />
              <SelectWithIconInput v-model="manufacturer" label="المصنع" placeholder="اختر المصنع"
                :items="manufacturerItems" :hide-details="false" show-add-button @add-click="handleAddManufacturer" />
              <SelectWithIconInput v-model="brand" label="العلامة التجارية" placeholder="ادخل العلامة التجارية"
                :items="brandItems" :hide-details="false" show-add-button @add-click="handleAddBrand" />
            </div>

            <!-- Row 2: Related, Attached, Alternative Products -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-6">
              <MultipleSelectInput v-model="relatedProducts" label="المنتجات المرتبطة" placeholder="اختر المنتج"
                :items="productItems" :hide-details="false" />
              <MultipleSelectInput v-model="attachedProducts" label="المنتجات الملحقة" placeholder="اختر المنتج"
                :items="productItems" :hide-details="false" />
              <MultipleSelectInput v-model="alternativeProducts" label="المنتجات البديلة" placeholder="اختر المنتج"
                :items="productItems" :hide-details="false" />
            </div>

            <!-- Row 3: Best Suppliers -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
              <MultipleSelectInput v-model="bestSuppliers" label="افضل الموردين" placeholder="اختر المورد"
                :items="supplierItems" :hide-details="false" />
            </div>
          </div>

          <!-- Advanced Product Attributes Section -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-lg font-bold text-primary-900 mb-6 text-right">
              سمات/خصائص المنتج المتقدمة
            </h2>

            <div class="flex flex-wrap gap-8">
              <CheckboxInput v-model="isManufacturingProduct" label="منتج تصنيع" color="primary" />
              <CheckboxInput v-model="sellNegative" label="البيع بالسالب" color="primary" />
              <CheckboxInput v-model="isAvailableForRent" label="قابل للإيجار" color="primary" />
              <CheckboxInput v-model="isAvailableForReturn" label="قابل للمقايضة" color="primary" />
              <CheckboxInput v-model="isAvailableForRefund" label="قابل للارجاع" color="primary" />
              <CheckboxInput v-model="isAvailableForOffset" label="قابل للمقاصة" color="primary" />
              <CheckboxInput v-model="isAvailableForSelling" label="متاح للبيع" color="primary" />
              <CheckboxInput v-model="isAvailableForBuying" label="متاح للشراء" color="primary" />
              <CheckboxInput v-model="isAvailableForPurchase" label="متاح للمشاريع" color="primary" />
            </div>
          </div>
          <!-- Action Buttons for Step 3 -->
          <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col px-6">
            <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
              custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
              label="حفظ والعودة للرئيسية" @click="handleStep3SaveAndReturn" />

            <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
              custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
              label="حفظ وإنشاء جديد" @click="handleStep3SaveAndCreate" />

            <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
              custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="arrowLeftIcon"
              label="حفظ والمتابعة" @click="handleStep3SaveAndContinue" />
          </div>
        </v-tabs-window-item>

        <!-- Tab 4: قائمة الاختبارات -->
        <v-tabs-window-item :value="3">
          <div class="mx-auto">
            <!-- Form Section (Separate from table) -->
            <div class="bg-white rounded-lg p-6 mb-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">قائمة الاختبارات</h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">الاختبار</label>
                  <SelectInput v-model="testForm.testName" placeholder="اختر" :items="testItems" :hide-details="true" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">عدد الاختبارات</label>
                  <TextInput v-model="testForm.testsCount" placeholder="عدد الاختبارات" :hide-details="true"
                    type="number" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">عدد العينات</label>
                  <TextInput v-model="testForm.samplesCount" placeholder="عدد العينات" :hide-details="true"
                    type="number" />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">كمية العينات</label>
                  <TextInput v-model="testForm.sampleQuantity" placeholder="كمية العينات" :hide-details="true"
                    type="number" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
                  <div class="flex items-center gap-3 mt-1">
                    <v-radio-group v-model="testForm.status" inline hide-details>
                      <v-radio :value="true" color="primary">
                        <template #label>
                          <span :class="testForm.status ? 'text-primary font-semibold' : 'text-gray-600'">
                            فعال
                          </span>
                        </template>
                      </v-radio>
                      <v-radio :value="false" color="primary">
                        <template #label>
                          <span :class="!testForm.status ? 'text-primary font-semibold' : 'text-gray-600'">
                            غير فعال
                          </span>
                        </template>
                      </v-radio>
                    </v-radio-group>
                  </div>
                </div>
                <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" prepend-icon="mdi-plus"
                  custom-class="font-semibold text-base w-full md:col-span-2" label="أضف جديد" @click="handleAddTest" />
              </div>

            </div>

            <!-- Tests Table -->
            <div class="-mx-6">
              <DataTable :headers="testsTableHeaders" :items="testsList" show-actions @edit="handleEditTest"
                @delete="handleDeleteTest">
              </DataTable>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
              <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                label="حفظ والعودة للرئيسية" @click="handleSaveAndReturn" />

              <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                label="حفظ وإنشاء جديد" @click="handleSaveAndCreate" />

              <ButtonWithIcon variant="flat" color="primary-50" rounded="4" height="48" prepend-icon="mdi-close"
                custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق"
                @click="handleSaveAndContinue" />
            </div>
          </div>

          <!-- Edit Test Dialog -->
          <TestFormDialog v-model="showTestDialog" :test="editingTest" @save="handleSaveTest" />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </default-layout>
</template>

<style scoped></style>
