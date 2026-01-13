<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
import { useApi } from '@/composables/useApi';

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

const { notification, success, error: showError } = useNotification();
const api = useApi();

// API Endpoints - Update these URLs when backend is ready
const API_ENDPOINTS = {
  categories: '/api/categories', // GET: list, POST: create
  categoryById: (id: number) => `/api/categories/${id}`, // GET: details, PUT: update, DELETE: delete
  bulkTaxes: '/api/categories/bulk-taxes', // POST: apply taxes to multiple categories
  taxes: '/api/taxes', // GET: list of taxes
  units: '/api/units', // GET: list of units
};

// =====================
// Mock Data (for testing - remove when API is ready)
// =====================
const MOCK_CATEGORIES = [
  {
    id: 49,
    name: "Clothing",
    sup_category: [
      { id: 55, name: "Men's Clothing" },
      { id: 56, name: "Women's Clothing" },
      { id: 57, name: "Shoes" },
    ],
  },
  {
    id: 50,
    name: "Electronics",
    sup_category: [
      { id: 58, name: "Phones" },
      { id: 59, name: "Laptops" },
      { id: 60, name: "Tablets" },
    ],
  },
  {
    id: 51,
    name: "Food & Beverages",
    sup_category: [
      { id: 61, name: "Hot Drinks" },
      { id: 62, name: "Cold Drinks" },
      { id: 63, name: "Snacks" },
    ],
  },
  { id: 52, name: "Furniture" },
  { id: 53, name: "Home Supplies" },
  { id: 54, name: "Sports" },
];

const MOCK_CATEGORY_DETAILS: Record<number, any> = {
  49: { id: 49, name_ar: "الملابس", name_en: "Clothing", description: "جميع أنواع الملابس", parent_id: null, is_active: true, unit: "piece" },
  50: { id: 50, name_ar: "الإلكترونيات", name_en: "Electronics", description: "الأجهزة الإلكترونية", parent_id: null, is_active: true, unit: "piece" },
  51: { id: 51, name_ar: "الطعام والمشروبات", name_en: "Food & Beverages", description: "", parent_id: null, is_active: true, unit: "piece" },
  52: { id: 52, name_ar: "الأثاث", name_en: "Furniture", description: "أثاث منزلي ومكتبي", parent_id: null, is_active: true, unit: "piece" },
  53: { id: 53, name_ar: "مستلزمات المنزل", name_en: "Home Supplies", description: "", parent_id: null, is_active: true, unit: "kg" },
  54: { id: 54, name_ar: "الرياضة", name_en: "Sports", description: "", parent_id: null, is_active: false, unit: "piece" },
  55: { id: 55, name_ar: "ملابس رجالية", name_en: "Men's Clothing", description: "", parent_id: 49, is_active: true, unit: "piece" },
  56: { id: 56, name_ar: "ملابس نسائية", name_en: "Women's Clothing", description: "", parent_id: 49, is_active: true, unit: "piece" },
  57: { id: 57, name_ar: "أحذية", name_en: "Shoes", description: "", parent_id: 49, is_active: true, unit: "piece" },
  58: { id: 58, name_ar: "هواتف", name_en: "Phones", description: "", parent_id: 50, is_active: true, unit: "piece" },
  59: { id: 59, name_ar: "لابتوب", name_en: "Laptops", description: "", parent_id: 50, is_active: true, unit: "piece" },
  60: { id: 60, name_ar: "أجهزة لوحية", name_en: "Tablets", description: "", parent_id: 50, is_active: false, unit: "piece" },
  61: { id: 61, name_ar: "مشروبات ساخنة", name_en: "Hot Drinks", description: "", parent_id: 51, is_active: true, unit: "piece" },
  62: { id: 62, name_ar: "مشروبات باردة", name_en: "Cold Drinks", description: "", parent_id: 51, is_active: true, unit: "liter" },
  63: { id: 63, name_ar: "وجبات خفيفة", name_en: "Snacks", description: "", parent_id: 51, is_active: true, unit: "piece" },
};

// Set to true to use mock data, false to use real API
const USE_MOCK_DATA = true; // Change to false when API is ready

// =====================
// Types & Interfaces
// =====================
interface CategoryListItem {
  id: number;
  name: string;
  parentId?: number | null;
  children?: CategoryListItem[];
}

interface TaxRule {
  id: number;
  name: string | null;
  percentage: string;
  minValue: string | null;
  maxValue: string | null;
}

interface CategoryFormData {
  name: {
    ar: string;
    en: string;
  };
  description: string;
  parent_id: number | null;
  user_id: number;
  unit_id: number | null;
  image: File | null;
  is_active: boolean;
  taxes: Array<{
    tax_id: number;
    tax_percentage: number;
    min_tax_amount: number;
    priority: number;
  }>;
}

interface ApiCategory {
  id: number;
  name: string;
  translations: {
    name: {
      en: string;
      ar: string;
    };
  };
  description?: string;
  image?: any;
  is_active: number;
  created_at: string;
  updated_at?: string;
  parent: ApiCategory | null;
  children: ApiCategory[];
  has_children: boolean;
}

interface ApiTax {
  id: number;
  tax_name: string;
  value_rate: string;
  code: string;
}

interface ApiUnit {
  id: number;
  name: string;
}

// =====================
// Form Refs
// =====================
const formRef = ref<any>(null);
const isFormValid = ref(false);

// =====================
// Page State Management
// =====================
const isLoading = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);

// Mode states
const selectedCategory = ref<CategoryListItem | null>(null);
const selectedCategoryIds = ref<number[]>([]); // For checkbox multi-select
const isEditing = ref(false);
const isSubcategoryMode = ref(false);
const parentCategoryForSubcategory = ref<CategoryListItem | null>(null);

// Delete confirmation dialog
const showDeleteDialog = ref(false);

// =====================
// Form Fields
// =====================
const categoryNameAr = ref("");
const categoryNameEn = ref("");
const parentCategory = ref<number | null>(null);
const unit = ref<string | null>(null);
const categoryDescription = ref("");
const categoryImage = ref<File[] | null>(null);
const isActive = ref(true);

// =====================
// Categories Data
// =====================
const categoriesSearch = ref("");
const categoriesList = ref<CategoryListItem[]>([]);
const expandedCategoryIds = ref<number[]>([]);

// =====================
// Dropdown Items
// =====================
const unitItems = ref<Array<{ title: string; value: number | string }>>([{ title: "اختر الوحدة", value: "" }]);
const taxNameItems = ref<Array<{ title: string; value: number | string }>>([{ title: "اختر الضريبة", value: "" }]);

// Priority is static 1-10
const priorityItems = [
  { title: "اختر الأولوية", value: "" },
  { title: "الأولى (1)", value: 1 },
  { title: "الثانية (2)", value: 2 },
  { title: "الثالثة (3)", value: 3 },
  { title: "الرابعة (4)", value: 4 },
  { title: "الخامسة (5)", value: 5 },
  { title: "السادسة (6)", value: 6 },
  { title: "السابعة (7)", value: 7 },
  { title: "الثامنة (8)", value: 8 },
  { title: "التاسعة (9)", value: 9 },
  { title: "العاشرة (10)", value: 10 },
];

const valuesItems = [
  { title: "اختر القيمة", value: "" },
  { title: "عالية", value: "high" },
  { title: "متوسطة", value: "medium" },
  { title: "منخفضة", value: "low" },
];

// =====================
// Computed: Parent Category Items for Dropdown
// =====================
const parentCategoryItems = computed(() => {
  const items: { title: string; value: number | string }[] = [
    { title: "بدون تصنيف رئيسي", value: "" },
  ];

  // Only main categories (those without parentId) can be parents
  categoriesList.value.forEach((cat) => {
    items.push({ title: cat.name, value: cat.id });
  });

  return items;
});

// =====================
// Computed: Button Visibility
// =====================
const showAddCategoryButton = computed(() => {
  // Always show add category button
  return true;
});

const showAddSubcategoryButton = computed(() => {
  // Show only when a main category is selected (editing a main category)
  if (!isEditing.value || !selectedCategory.value) return false;

  // Check if selected category is a main category (has children or no parentId)
  const isMainCategory = !selectedCategory.value.parentId;
  return isMainCategory;
});

// =====================
// Computed: Filtered Categories for Sidebar
// =====================
const filteredCategories = computed(() => {
  if (!categoriesSearch.value) return categoriesList.value;
  const q = categoriesSearch.value.toLowerCase();

  const filterItems = (items: CategoryListItem[]): CategoryListItem[] => {
    const result: CategoryListItem[] = [];

    for (const item of items) {
      const nameMatches = item.name.toLowerCase().includes(q);
      const children = item.children ? filterItems(item.children) : undefined;

      if (nameMatches || (children && children.length)) {
        result.push({
          ...item,
          children,
        });
      }
    }

    return result;
  };

  return filterItems(categoriesList.value);
});

const flattenedFilteredCategories = computed(() => {
  const result: CategoryListItem[] = [];

  const walk = (items: CategoryListItem[]) => {
    for (const item of items) {
      result.push(item);
      if (item.children && item.children.length) {
        walk(item.children);
      }
    }
  };

  walk(filteredCategories.value);
  return result;
});

// Select All checkbox
const isAllSelected = computed({
  get() {
    if (!flattenedFilteredCategories.value.length) return false;
    return flattenedFilteredCategories.value.every((c) =>
      selectedCategoryIds.value.includes(c.id)
    );
  },
  set(value: boolean) {
    if (value) {
      const idsToAdd = flattenedFilteredCategories.value.map((c) => c.id);
      selectedCategoryIds.value = Array.from(
        new Set([...selectedCategoryIds.value, ...idsToAdd])
      );
      // Clear single category selection when selecting all
      selectedCategory.value = null;
      isEditing.value = false;
    } else {
      const idsToRemove = new Set(
        flattenedFilteredCategories.value.map((c) => c.id)
      );
      selectedCategoryIds.value = selectedCategoryIds.value.filter(
        (id) => !idsToRemove.has(id)
      );
    }
  },
});

// Show bulk tax mode when multiple categories are selected
const isBulkMode = computed(() => {
  return selectedCategoryIds.value.length > 1 || isAllSelected.value;
});

// =====================
// Tax Rules State
// =====================
const taxRules = ref<TaxRule[]>([]);

const newTaxRule = ref<TaxRule>({
  id: 0,
  name: null,
  percentage: "",
  minValue: "",
  maxValue: "",
});

const isNewTaxValid = computed(() => {
  const t = newTaxRule.value;
  return !!(t.name && t.percentage && t.minValue && t.maxValue);
});

// =====================
// Helper Functions
// =====================
const toggleCategoryExpand = (id: number) => {
  if (expandedCategoryIds.value.includes(id)) {
    expandedCategoryIds.value = expandedCategoryIds.value.filter(
      (expandedId) => expandedId !== id
    );
  } else {
    expandedCategoryIds.value.push(id);
  }
};

const isCategoryExpanded = (id: number) =>
  expandedCategoryIds.value.includes(id);

const isCategorySelected = (id: number) =>
  selectedCategory.value?.id === id;

const resetNewTaxRule = () => {
  newTaxRule.value = {
    id: 0,
    name: null,
    percentage: "",
    minValue: "",
    maxValue: "",
  };
};

const getTaxNameLabel = (value: string | number | null) => {
  if (!value) return "";
  const item = taxNameItems.value.find((i) => i.value === value);
  return item ? item.title : String(value);
};

const getPriorityLabel = (value: string | number | null) => {
  if (!value) return "";
  const item = priorityItems.find((i) => i.value === value);
  return item ? item.title : String(value);
};

const addTaxRule = () => {
  if (!isNewTaxValid.value) return;

  const nextId = taxRules.value.length
    ? Math.max(...taxRules.value.map((t) => t.id)) + 1
    : 1;

  taxRules.value.push({
    ...newTaxRule.value,
    id: nextId,
  });

  resetNewTaxRule();
};

const removeTaxRule = (index: number) => {
  taxRules.value.splice(index, 1);
};

// =====================
// Form Reset
// =====================
const resetForm = () => {
  categoryNameAr.value = "";
  categoryNameEn.value = "";
  parentCategory.value = null;
  unit.value = null;
  categoryDescription.value = "";
  categoryImage.value = null;
  isActive.value = true;
  taxRules.value = [];
  resetNewTaxRule();
  formRef.value?.resetValidation();
};

// =====================
// API: Fetch Taxes List
// =====================
const fetchTaxes = async () => {
  try {
    if (USE_MOCK_DATA) {
      // Mock taxes data
      taxNameItems.value = [
        { title: "اختر الضريبة", value: "" },
        { title: "ضريبة القيمة المضافة (15%)", value: 1 },
        { title: "ضريبة أخرى (5%)", value: 2 },
      ];
    } else {
      // Real API call
      const response = await api.get<{ data: ApiTax[] }>(API_ENDPOINTS.taxes);

      taxNameItems.value = [
        { title: "اختر الضريبة", value: "" },
        ...response.data.map((tax) => ({
          title: `${tax.tax_name} (${tax.value_rate}%)`,
          value: tax.id,
        })),
      ];
    }
  } catch (error) {
    console.error('Failed to fetch taxes:', error);
    showError('حدث خطأ أثناء تحميل الضرائب');
  }
};

// =====================
// API: Fetch Units List
// =====================
const fetchUnits = async () => {
  try {
    if (USE_MOCK_DATA) {
      // Mock units data
      unitItems.value = [
        { title: "اختر الوحدة", value: "" },
        { title: "قطعة", value: 1 },
        { title: "كيلو", value: 2 },
        { title: "لتر", value: 3 },
      ];
    } else {
      // Real API call
      const response = await api.get<{ data: ApiUnit[] }>(API_ENDPOINTS.units);

      unitItems.value = [
        { title: "اختر الوحدة", value: "" },
        ...response.data.map((unit) => ({
          title: unit.name,
          value: unit.id,
        })),
      ];
    }
  } catch (error) {
    console.error('Failed to fetch units:', error);
    showError('حدث خطأ أثناء تحميل الوحدات');
  }
};

// =====================
// API: Fetch Categories List
// =====================
const fetchCategories = async () => {
  isLoading.value = true;
  try {
    if (USE_MOCK_DATA) {
      // Use mock data
      categoriesList.value = MOCK_CATEGORIES.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        parentId: null,
        children: cat.sup_category?.map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          parentId: cat.id,
        })) || [],
      }));
    } else {
      // Real API call
      const response = await api.get<{ data: ApiCategory[] }>(API_ENDPOINTS.categories);

      // Transform API response to internal format
      // Filter only main categories (those without parent)
      const mainCategories = response.data.filter(cat => !cat.parent);

      categoriesList.value = mainCategories.map((cat) => ({
        id: cat.id,
        name: cat.translations?.name?.ar || cat.name,
        parentId: null,
        children: cat.children?.map((child) => ({
          id: child.id,
          name: child.translations?.name?.ar || child.name,
          parentId: cat.id,
        })) || [],
      }));
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    showError('حدث خطأ أثناء تحميل التصنيفات');
  } finally {
    isLoading.value = false;
  }
};

// =====================
// API: Fetch Single Category Details
// =====================
const fetchCategoryDetails = async (id: number) => {
  isLoading.value = true;
  try {
    if (USE_MOCK_DATA) {
      // Use mock data
      const cat = MOCK_CATEGORY_DETAILS[id];
      if (cat) {
        categoryNameAr.value = cat.name_ar || "";
        categoryNameEn.value = cat.name_en || "";
        categoryDescription.value = cat.description || "";
        parentCategory.value = cat.parent_id;
        isActive.value = Boolean(cat.is_active);
        unit.value = cat.unit || null;
        taxRules.value = cat.taxes || [];
      }
    } else {
      // Real API call
      const response = await api.get<{ data: ApiCategory }>(API_ENDPOINTS.categoryById(id));
      const cat = response.data;

      if (cat) {
        // Populate form with API data
        categoryNameAr.value = cat.translations?.name?.ar || "";
        categoryNameEn.value = cat.translations?.name?.en || "";
        categoryDescription.value = cat.description || "";
        parentCategory.value = cat.parent?.id || null;
        isActive.value = Boolean(cat.is_active);
        unit.value = null; // Map unit_id if needed

        // Transform taxes if they exist in response
        taxRules.value = []; // Map from API taxes structure if available
      }
    }
  } catch (error) {
    console.error('Failed to fetch category details:', error);
    showError('حدث خطأ أثناء تحميل بيانات التصنيف');
  } finally {
    isLoading.value = false;
  }
};

// =====================
// Category Selection Handler
// =====================
const handleCategorySelect = async (category: CategoryListItem, isSubcategory: boolean = false) => {
  // If clicking the same category, deselect it
  if (selectedCategory.value?.id === category.id) {
    selectedCategory.value = null;
    isEditing.value = false;
    isSubcategoryMode.value = false;
    parentCategoryForSubcategory.value = null;
    resetForm();
    return;
  }

  // Select the category
  selectedCategory.value = { ...category, parentId: isSubcategory ? category.parentId : null };
  isEditing.value = true;
  isSubcategoryMode.value = false;
  parentCategoryForSubcategory.value = null;

  // Fetch category details from API
  await fetchCategoryDetails(category.id);
};

// =====================
// Add New Main Category
// =====================
const handleAddNewCategory = () => {
  selectedCategory.value = null;
  isEditing.value = false;
  isSubcategoryMode.value = false;
  parentCategoryForSubcategory.value = null;
  parentCategory.value = null;
  resetForm();
};

// =====================
// Add New Subcategory
// =====================
const handleAddSubcategory = () => {
  if (!selectedCategory.value) return;

  // Store the parent category
  parentCategoryForSubcategory.value = { ...selectedCategory.value };
  parentCategory.value = selectedCategory.value.id;

  // Switch to add mode for subcategory
  isEditing.value = false;
  isSubcategoryMode.value = true;
  selectedCategory.value = null;

  // Reset form but keep parent category
  categoryNameAr.value = "";
  categoryNameEn.value = "";
  categoryDescription.value = "";
  categoryImage.value = null;
  isActive.value = true;
  unit.value = null;
  taxRules.value = [];
  resetNewTaxRule();
  formRef.value?.resetValidation();
};

// =====================
// Save Category (Create or Update)
// =====================
const handleSave = async () => {
  // Skip validation in bulk mode
  if (!isBulkMode.value) {
    const { valid } = await formRef.value?.validate();
    if (!valid) {
      console.log("Form has errors");
      return;
    }
  }

  isSaving.value = true;

  try {
    // Bulk mode - apply taxes to multiple categories
    if (isBulkMode.value) {
      const taxData = {
        category_ids: selectedCategoryIds.value,
        taxes: taxRules.value.map((tax, index) => ({
          tax_id: parseInt(tax.name || '1'), // Map tax name to tax_id
          tax_percentage: parseFloat(tax.percentage) || 0,
          min_tax_amount: parseFloat(tax.minValue || '0'),
          priority: index + 1,
        })),
      };

      if (USE_MOCK_DATA) {
        console.log('Mock: Applying bulk taxes', taxData);
      } else {
        await api.post(API_ENDPOINTS.bulkTaxes, taxData);
      }
      success(`تم تطبيق الضرائب على ${selectedCategoryIds.value.length} تصنيف بنجاح`);

      // Clear selections
      selectedCategoryIds.value = [];
    } else {
      // Single category mode - prepare payload matching API structure
      const formData: CategoryFormData = {
        name: {
          ar: categoryNameAr.value,
          en: categoryNameEn.value,
        },
        description: categoryDescription.value,
        parent_id: parentCategory.value,
        user_id: 1, // TODO: Get from auth context
        unit_id: unit.value ? parseInt(unit.value) : null,
        image: categoryImage.value?.[0] || null,
        is_active: isActive.value,
        taxes: taxRules.value.map((tax, index) => ({
          tax_id: parseInt(tax.name || '1'), // Map tax name to tax_id
          tax_percentage: parseFloat(tax.percentage) || 0,
          min_tax_amount: parseFloat(tax.minValue || '0'),
          priority: index + 1,
        })),
      };

      if (isEditing.value && selectedCategory.value) {
        // Update existing category
        if (USE_MOCK_DATA) {
          console.log('Mock: Updating category', selectedCategory.value.id, formData);
        } else {
          await api.put(API_ENDPOINTS.categoryById(selectedCategory.value.id), formData);
        }
        success('تم تحديث التصنيف بنجاح');
      } else {
        // Create new category
        if (USE_MOCK_DATA) {
          console.log('Mock: Creating category', formData);
        } else {
          await api.post(API_ENDPOINTS.categories, formData);
        }
        success(isSubcategoryMode.value ? 'تم إضافة التصنيف الفرعي بنجاح' : 'تم إضافة التصنيف بنجاح');
      }
    }

    // Refresh categories list
    await fetchCategories();

    // Reset form and state
    resetForm();
    selectedCategory.value = null;
    isEditing.value = false;
    isSubcategoryMode.value = false;
    parentCategoryForSubcategory.value = null;

  } catch (err) {
    console.error('Failed to save category:', err);
    showError('حدث خطأ أثناء حفظ التصنيف');
  } finally {
    isSaving.value = false;
  }
};

// =====================
// Close Form
// =====================
const handleClose = () => {
  resetForm();
  selectedCategory.value = null;
  selectedCategoryIds.value = []; // Clear checkbox selections
  isEditing.value = false;
  isSubcategoryMode.value = false;
  parentCategoryForSubcategory.value = null;
};

// =====================
// Delete Category
// =====================
const openDeleteDialog = () => {
  if (!selectedCategory.value) return;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!selectedCategory.value) return;

  showDeleteDialog.value = false;
  isDeleting.value = true;

  try {
    if (USE_MOCK_DATA) {
      console.log('Mock: Deleting category', selectedCategory.value.id);
    } else {
      await api.delete(API_ENDPOINTS.categoryById(selectedCategory.value.id));
    }
    success('تم حذف التصنيف بنجاح');

    // Refresh categories list
    await fetchCategories();

    // Reset form and state
    resetForm();
    selectedCategory.value = null;
    selectedCategoryIds.value = [];
    isEditing.value = false;
    isSubcategoryMode.value = false;
    parentCategoryForSubcategory.value = null;

  } catch (err) {
    console.error('Failed to delete category:', err);
    showError('حدث خطأ أثناء حذف التصنيف');
  } finally {
    isDeleting.value = false;
  }
};

// =====================
// Lifecycle: Fetch data on mount
// =====================
onMounted(() => {
  fetchCategories();
  fetchTaxes();
  fetchUnits();
});

const categoriesIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 30.1667C27.2565 30.1667 30.1667 27.2565 30.1667 23.6667C30.1667 20.0768 27.2565 17.1667 23.6667 17.1667C20.0768 17.1667 17.1667 20.0768 17.1667 23.6667C17.1667 27.2565 20.0768 30.1667 23.6667 30.1667Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M38.2424 29.5758C37.9802 30.1698 37.902 30.8289 38.0179 31.4678C38.1337 32.1068 38.4383 32.6964 38.8924 33.1606L39.0106 33.2788C39.3769 33.6446 39.6674 34.0791 39.8657 34.5574C40.0639 35.0356 40.166 35.5482 40.166 36.0659C40.166 36.5836 40.0639 37.0962 39.8657 37.5745C39.6674 38.0527 39.3769 38.4872 39.0106 38.853C38.6447 39.2193 38.2103 39.5099 37.732 39.7081C37.2538 39.9064 36.7412 40.0084 36.2235 40.0084C35.7058 40.0084 35.1932 39.9064 34.7149 39.7081C34.2367 39.5099 33.8022 39.2193 33.4364 38.853L33.3182 38.7348C32.854 38.2808 32.2644 37.9761 31.6254 37.8603C30.9864 37.7444 30.3274 37.8226 29.7333 38.0848C29.1508 38.3345 28.6539 38.7491 28.3039 39.2776C27.954 39.806 27.7662 40.4253 27.7636 41.0591V41.3939C27.7636 42.4387 27.3486 43.4407 26.6098 44.1795C25.871 44.9183 24.869 45.3333 23.8242 45.3333C22.7794 45.3333 21.7774 44.9183 21.0387 44.1795C20.2999 43.4407 19.8848 42.4387 19.8848 41.3939V41.2167C19.8696 40.5647 19.6586 39.9324 19.2792 39.402C18.8998 38.8716 18.3696 38.4675 17.7576 38.2424C17.1635 37.9802 16.5045 37.902 15.8655 38.0179C15.2265 38.1337 14.6369 38.4383 14.1727 38.8924L14.0545 39.0106C13.6887 39.3769 13.2542 39.6674 12.776 39.8657C12.2977 40.0639 11.7851 40.166 11.2674 40.166C10.7497 40.166 10.2371 40.0639 9.75887 39.8657C9.28064 39.6674 8.84617 39.3769 8.4803 39.0106C8.11403 38.6447 7.82347 38.2103 7.62522 37.732C7.42697 37.2538 7.32493 36.7412 7.32493 36.2235C7.32493 35.7058 7.42697 35.1932 7.62522 34.7149C7.82347 34.2367 8.11403 33.8022 8.4803 33.4364L8.59848 33.3182C9.05257 32.854 9.35718 32.2644 9.47304 31.6254C9.58889 30.9864 9.51068 30.3274 9.24848 29.7333C8.9988 29.1508 8.58422 28.6539 8.05576 28.3039C7.52731 27.954 6.90806 27.7662 6.27424 27.7636H5.93939C4.8946 27.7636 3.8926 27.3486 3.15382 26.6098C2.41504 25.871 2 24.869 2 23.8242C2 22.7794 2.41504 21.7774 3.15382 21.0387C3.8926 20.2999 4.8946 19.8848 5.93939 19.8848H6.11667C6.76863 19.8696 7.40092 19.6586 7.93135 19.2792C8.46177 18.8998 8.8658 18.3696 9.09091 17.7576C9.35311 17.1635 9.43132 16.5045 9.31546 15.8655C9.19961 15.2265 8.895 14.6369 8.44091 14.1727L8.32273 14.0545C7.95646 13.6887 7.66589 13.2542 7.46764 12.776C7.2694 12.2977 7.16736 11.7851 7.16736 11.2674C7.16736 10.7497 7.2694 10.2371 7.46764 9.75887C7.66589 9.28064 7.95646 8.84617 8.32273 8.4803C8.68859 8.11403 9.12306 7.82347 9.6013 7.62522C10.0795 7.42697 10.5922 7.32493 11.1098 7.32493C11.6275 7.32493 12.1402 7.42697 12.6184 7.62522C13.0966 7.82347 13.5311 8.11403 13.897 8.4803L14.0152 8.59848C14.4794 9.05257 15.069 9.35718 15.7079 9.47304C16.3469 9.58889 17.0059 9.51068 17.6 9.24848H17.7576C18.3402 8.9988 18.837 8.58422 19.187 8.05576C19.5369 7.52731 19.7247 6.90806 19.7273 6.27424V5.93939C19.7273 4.8946 20.1423 3.8926 20.8811 3.15382C21.6199 2.41504 22.6219 2 23.6667 2C24.7115 2 25.7135 2.41504 26.4522 3.15382C27.191 3.8926 27.6061 4.8946 27.6061 5.93939V6.11667C27.6086 6.75049 27.7964 7.36974 28.1464 7.89819C28.4963 8.42664 28.9932 8.84122 29.5758 9.09091C30.1698 9.35311 30.8289 9.43132 31.4678 9.31546C32.1068 9.19961 32.6964 8.895 33.1606 8.44091L33.2788 8.32273C33.6446 7.95646 34.0791 7.66589 34.5574 7.46764C35.0356 7.2694 35.5482 7.16736 36.0659 7.16736C36.5836 7.16736 37.0962 7.2694 37.5745 7.46764C38.0527 7.66589 38.4872 7.95646 38.853 8.32273C39.2193 8.68859 39.5099 9.12306 39.7081 9.6013C39.9064 10.0795 40.0084 10.5922 40.0084 11.1098C40.0084 11.6275 39.9064 12.1402 39.7081 12.6184C39.5099 13.0966 39.2193 13.5311 38.853 13.897L38.7348 14.0152C38.2808 14.4794 37.9761 15.069 37.8603 15.7079C37.7444 16.3469 37.8226 17.0059 38.0848 17.6V17.7576C38.3345 18.3402 38.7491 18.837 39.2776 19.187C39.806 19.5369 40.4253 19.7247 41.0591 19.7273H41.3939C42.4387 19.7273 43.4407 20.1423 44.1795 20.8811C44.9183 21.6199 45.3333 22.6219 45.3333 23.6667C45.3333 24.7115 44.9183 25.7135 44.1795 26.4522C43.4407 27.191 42.4387 27.6061 41.3939 27.6061H41.2167C40.5828 27.6086 39.9636 27.7964 39.4351 28.1464C38.9067 28.4963 38.4921 28.9932 38.2424 29.5758Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8333 5.00016H5.49992C5.03321 5.00016 4.79985 5.00016 4.62159 4.90933C4.46479 4.82944 4.33731 4.70196 4.25741 4.54515C4.16659 4.3669 4.16659 4.13354 4.16659 3.66683V0.833496M12.4999 15.8335V10.5002C12.4999 10.0335 12.4999 9.8001 12.4091 9.62184C12.3292 9.46504 12.2017 9.33755 12.0449 9.25766C11.8667 9.16683 11.6333 9.16683 11.1666 9.16683H5.49992C5.03321 9.16683 4.79985 9.16683 4.62159 9.25766C4.46479 9.33755 4.33731 9.46504 4.25741 9.62184C4.16659 9.8001 4.16659 10.0335 4.16659 10.5002V15.8335M15.8333 6.10473V11.8335C15.8333 13.2336 15.8333 13.9337 15.5608 14.4685C15.3211 14.9389 14.9386 15.3213 14.4682 15.561C13.9334 15.8335 13.2334 15.8335 11.8333 15.8335H4.83325C3.43312 15.8335 2.73306 15.8335 2.19828 15.561C1.72787 15.3213 1.34542 14.9389 1.10574 14.4685C0.833252 13.9337 0.833252 13.2336 0.833252 11.8335V4.8335C0.833252 3.43336 0.833252 2.7333 1.10574 2.19852C1.34542 1.72811 1.72787 1.34566 2.19828 1.10598C2.73306 0.833496 3.43312 0.833496 4.83325 0.833496H10.562C10.9697 0.833496 11.1735 0.833496 11.3653 0.879546C11.5354 0.920374 11.6979 0.987715 11.8471 1.0791C12.0153 1.18217 12.1594 1.32629 12.4476 1.61454L15.0522 4.21911C15.3405 4.50737 15.4846 4.65149 15.5877 4.81969C15.679 4.96881 15.7464 5.13138 15.7872 5.30144C15.8333 5.49326 15.8333 5.69708 15.8333 6.10473Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

</script>

<template>
  <default-layout>
    <div class="categories-page">
      <PageHeader :icon="categoriesIcon" title-key="pages.ServicesCategories.title"
        description-key="pages.ServicesCategories.description" />


      <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
        <div class="space-y-6">
          <!-- Bulk Mode Header - shown when multiple categories selected -->
          <div v-if="isBulkMode" class="bg-primary-50 border border-primary-200 rounded-md p-4">
            <div class="flex items-center gap-3">
              <v-icon color="primary" size="24">mdi-checkbox-multiple-marked</v-icon>
              <div>
                <h3 class="text-base font-bold text-primary-800">
                  تم تحديد {{ selectedCategoryIds.length }} تصنيف
                </h3>
                <p class="text-sm text-primary-600">
                  سيتم تطبيق الضرائب على جميع التصنيفات المحددة
                </p>
              </div>
            </div>
          </div>

          <!-- Single Category Form - hidden in bulk mode -->
          <div v-if="!isBulkMode" class="bg-gray-50 rounded-md p-4 sm:p-6">
            <div class="mb-4">
              <h2 class="text-lg font-bold text-primary-900">التصنيفات</h2>
            </div>

            <div class="grid gap-4 mb-4 grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
              <div class="md:col-span-2">
                <LanguageTabs :languages="availableLanguages" label="الإسم">
                  <template #en>
                    <TextInput v-model="categoryNameEn" placeholder="Enter name in English"
                      :rules="[required(), maxLength(100)]" :hide-details="true" />
                  </template>
                  <template #ar>
                    <TextInput v-model="categoryNameAr" placeholder="ادخل الاسم بالعربية"
                      :rules="[required(), maxLength(100)]" :hide-details="true" />
                  </template>
                </LanguageTabs>
              </div>

              <SelectWithIconInput show-add-button v-model="parentCategory" label="التصنيف الرئيسي" placeholder="اختر التصنيف الرئيسي"
                :items="parentCategoryItems" :hide-details="false" :disabled="isSubcategoryMode" />

              <SelectWithIconInput show-add-button v-model="unit" label="الوحدة" placeholder="اختر الوحدة" :items="unitItems"
                :hide-details="false" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div class="md:col-span-2 flex flex-col gap-3">
                <TextareaInput v-model="categoryDescription" label="تفاصيل التصنيف" placeholder="الوصف" :rows="5"
                  :hide-details="true" />

                <div>
                  <span class="text-gray-700 text-sm font-semibold">
                    فعال \ غير فعال</span>
                  <v-switch v-model="isActive" :label="`${isActive ? 'فعال' : 'غير فعال'}`" color="primary" inset
                    hide-details />
                </div>
              </div>
              <div>
                <FileUploadInput v-model="categoryImage" label="أرفق صورة" hint="PNG, JPG or GIF (max. 400x400px)"
                  :max-files="1" />
              </div>

            </div>
          </div>

          <!-- Taxes Section - always visible -->
          <div class="bg-gray-50 rounded-md p-4 sm:p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-primary-900">
                {{ isBulkMode ? 'الضرائب للتصنيفات المحددة' : 'الضرائب' }}
              </h2>
              <div class="w-full lg:w-auto flex justify-start lg:justify-end">
                <ButtonWithIcon append-icon="mdi-plus" variant="flat" color="primary" height="40" custom-class="font-semibold text-sm px-4 w-full lg:w-auto"
                  label="إضافة ضريبة" :disabled="!isNewTaxValid" @click="addTaxRule" />
              </div>
            </div>

            <div class="flex flex-wrap gap-4 items-end mb-6">
              <div class="w-full lg:w-auto lg:flex-1 min-w-[250px]">
                <SelectWithIconInput v-model="newTaxRule.name" label="الضريبة" placeholder="اختر النوع"
                  :items="taxNameItems" show-add-button :hide-details="true" />
              </div>

              <div class="w-full sm:flex-1 lg:w-auto min-w-[100px]">
                <TextInput v-model="newTaxRule.percentage" label="النسبة" placeholder="10%" :rules="[numeric()]"
                  :hide-details="true" />
              </div>

              <div class="w-full sm:flex-1 lg:w-auto min-w-[140px]">
                <SelectWithIconInput v-model="newTaxRule.minValue" label="أقل قيمة" placeholder="اختر القيمة"
                  :items="valuesItems" :hide-details="true" />
              </div>

              <div class="w-full sm:flex-1 lg:w-auto min-w-[140px]">
                <SelectWithIconInput v-model="newTaxRule.maxValue" label="الأولوية" placeholder="اختر الأولوية"
                  :items="priorityItems" :hide-details="true" />
              </div>
            </div>

            <div
              class="mt-4 bg-white !rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10)] outline outline-1 outline-offset-[-1px] outline-slate-200 overflow-hidden">
              <h3 class="text-base sm:text-lg font-bold text-gray-900 px-6 py-5">
                الضرائب المطبقة على الخدمة
              </h3>

              <v-table class="rounded-none overflow-hidden border border-gray-200">
                <thead>
                  <tr class="bg-gray-50 text-gray-600">
                    <th class="!font-bold">الضريبة</th>
                    <th class="!font-bold">النسبة</th>
                    <th class="!font-bold">أقل قيمة</th>
                    <th class="!font-bold">الأولوية</th>
                    <th class="text-center w-[120px] !font-bold">إجراءات</th>
                  </tr>
                </thead>
                <tbody class="bg-white">
                  <tr v-for="(tax, index) in taxRules" :key="tax.id">
                    <td>
                      {{ getTaxNameLabel(tax.name) }}
                    </td>
                    <td>
                      {{ tax.percentage || '-' }}
                    </td>
                    <td>
                      {{ tax.minValue || '-' }}
                    </td>
                    <td>
                      <v-chip v-if="tax.maxValue" size="small" color="primary-50" class="font-semibold" variant="flat">
                        {{ getPriorityLabel(tax.maxValue) }}
                      </v-chip>
                    </td>
                    <td class="text-center">
                      <ButtonWithIcon :icon="'mdi-pencil-outline'" icon-only variant="text" color="primary" size="small" />
                      <ButtonWithIcon :icon="'mdi-trash-can-outline'" icon-only variant="text" color="error" size="small" @click="removeTaxRule(index)" />
                    </td>
                  </tr>

                  <tr v-if="!taxRules.length">
                    <td colspan="5" class="text-center text-gray-500 py-4">
                      لا توجد ضرائب مضافة بعد
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </div>

          <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
            <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48"
              custom-class="min-w-56" :prepend-icon="saveIcon" :label="isEditing ? 'تحديث' : 'حفظ'"
              @click="handleSave" :loading="isSaving" :disabled="isSaving || isDeleting" />
            
            <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
              custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق"
              :disabled="isSaving || isDeleting" @click="handleClose" />
          </div>
        </div>
      </v-form>
    </div>
    <!-- Notification Snackbar -->
    <v-snackbar v-model="notification.show" :timeout="notification.timeout"
      :color="notification.type === 'success' ? 'success' : notification.type === 'error' ? 'error' : notification.type === 'warning' ? 'warning' : 'info'"
      location="top end">
      {{ notification.message }}
      <template #actions>
        <ButtonWithIcon variant="text" label="إغلاق" @click="notification.show = false" />
      </template>
    </v-snackbar>
  </default-layout>
</template>

<style scoped></style>
