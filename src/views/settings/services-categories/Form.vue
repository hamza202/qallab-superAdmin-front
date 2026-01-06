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

const categoriesIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.8498 26H36.4835C37.6257 26 38.611 25.9999 39.4226 26.0662C40.2791 26.1362 41.1311 26.2907 41.9509 26.7085C43.174 27.3316 44.1684 28.326 44.7915 29.5491C45.2093 30.3689 45.3638 31.2209 45.4338 32.0774C45.5001 32.889 45.5 33.8743 45.5 35.0164V36.4836C45.5 37.6257 45.5001 38.611 45.4338 39.4226C45.3638 40.2791 45.2093 41.1311 44.7915 41.9509C44.1684 43.174 43.174 44.1684 41.9509 44.7915C41.1311 45.2093 40.2791 45.3638 39.4226 45.4338C38.611 45.5001 37.6256 45.5 36.4835 45.5H32.8499C31.7077 45.5 30.7224 45.5001 29.9108 45.4338C29.0542 45.3638 28.2022 45.2093 27.3824 44.7915C26.1593 44.1684 25.165 43.174 24.5418 41.9509C24.1241 41.1311 23.9696 40.2791 23.8996 39.4226C23.8333 38.611 23.8333 37.6257 23.8333 36.4835V35.0165C23.8333 33.8743 23.8333 32.889 23.8996 32.0774C23.9696 31.2209 24.1241 30.3689 24.5418 29.5491C25.165 28.326 26.1593 27.3316 27.3824 26.7085C28.2022 26.2907 29.0542 26.1362 29.9108 26.0662C30.7223 25.9999 31.7077 26 32.8498 26ZM30.2636 30.3852C29.675 30.4333 29.4568 30.5149 29.3497 30.5695C28.942 30.7772 28.6105 31.1087 28.4028 31.5164C28.3482 31.6235 28.2666 31.8417 28.2185 32.4303C28.1684 33.0442 28.1667 33.8508 28.1667 35.1V36.4C28.1667 37.6492 28.1684 38.4558 28.2185 39.0697C28.2666 39.6583 28.3482 39.8765 28.4028 39.9836C28.6105 40.3913 28.942 40.7228 29.3497 40.9305C29.4568 40.9851 29.675 41.0667 30.2636 41.1148C30.8775 41.165 31.6841 41.1667 32.9333 41.1667H36.4C37.6492 41.1667 38.4558 41.165 39.0697 41.1148C39.6583 41.0667 39.8765 40.9851 39.9836 40.9305C40.3913 40.7228 40.7228 40.3913 40.9305 39.9836C40.9851 39.8765 41.0667 39.6583 41.1148 39.0697C41.165 38.4558 41.1667 37.6492 41.1667 36.4V35.1C41.1667 33.8508 41.165 33.0442 41.1148 32.4303C41.0667 31.8417 40.9851 31.6235 40.9305 31.5164C40.7228 31.1087 40.3913 30.7772 39.9836 30.5695C39.8765 30.5149 39.6583 30.4333 39.0697 30.3852C38.4558 30.335 37.6492 30.3333 36.4 30.3333H32.9333C31.6841 30.3333 30.8775 30.335 30.2636 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9016 6.49983C13.0767 6.49918 12.3664 6.49861 11.7319 6.62483C9.15341 7.13772 7.13778 9.15335 6.62489 11.7318C6.49867 12.3664 6.49924 13.0767 6.49989 13.9015L6.49999 14.0833L6.49989 14.265C6.49924 15.0899 6.49867 15.8002 6.62489 16.4347C7.13778 19.0132 9.15341 21.0288 11.7319 21.5417C12.3664 21.6679 13.0767 21.6673 13.9016 21.6667H38.0984C38.9233 21.6673 39.6336 21.6679 40.2681 21.5417C42.8466 21.0288 44.8622 19.0132 45.3751 16.4347C45.5013 15.8002 45.5007 15.0899 45.5001 14.2651L45.5 14.0833L45.5001 13.9015C45.5007 13.0767 45.5013 12.3663 45.3751 11.7318C44.8622 9.15335 42.8466 7.13772 40.2681 6.62483C39.6336 6.49861 38.9233 6.49918 38.0984 6.49983H13.9016ZM12.5773 10.8749C12.7338 10.8438 12.9727 10.8333 14.0833 10.8333H37.9167C39.0273 10.8333 39.2662 10.8438 39.4227 10.8749C40.2822 11.0459 40.9541 11.7177 41.125 12.5772C41.1562 12.7338 41.1667 12.9727 41.1667 14.0833C41.1667 15.1939 41.1562 15.4328 41.125 15.5893C40.9541 16.4488 40.2822 17.1207 39.4227 17.2916C39.2662 17.3228 39.0273 17.3333 37.9167 17.3333H14.0833C12.9727 17.3333 12.7338 17.3228 12.5773 17.2916C11.7178 17.1207 11.0459 16.4488 10.875 15.5893C10.8438 15.4328 10.8333 15.1939 10.8333 14.0833C10.8333 12.9727 10.8438 12.7338 10.875 12.5772C11.0459 11.7177 11.7178 11.0459 12.5773 10.8749Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13 26C9.41015 26 6.5 28.9102 6.5 32.5V39C6.5 42.5899 9.41015 45.5 13 45.5C16.5899 45.5 19.5 42.5899 19.5 39V32.5C19.5 28.9102 16.5899 26 13 26ZM10.8333 32.5C10.8333 31.3034 11.8034 30.3333 13 30.3333C14.1966 30.3333 15.1667 31.3034 15.1667 32.5V39C15.1667 40.1966 14.1966 41.1667 13 41.1667C11.8034 41.1667 10.8333 40.1966 10.8333 39V32.5Z" fill="#1570EF"/>
</svg>`;

</script>

<template>
  <default-layout>
    <div class="categories-page">
      <div class="flex items-center flex-wrap justify-between">
        <PageHeader :icon="categoriesIcon" title-key="pages.ServicesCategories.title"
          description-key="pages.ServicesCategories.description" />

        <div class="flex flex-wrap gap-3 mb-6">
          <!-- Add New Category Button - visible when not editing -->
          <v-btn v-if="showAddCategoryButton" variant="flat" color="primary" height="44"
            class="font-semibold text-base px-6" prepend-icon="mdi-plus-circle-outline" @click="handleAddNewCategory">
            <span>إضافة تصنيف جديد</span>
          </v-btn>

          <!-- Add Subcategory Button - visible only when a main category is selected -->
          <v-btn v-if="showAddSubcategoryButton" variant="flat" prepend-icon="mdi-plus-circle-outline"
            color="primary-50" height="44" class="font-semibold text-base text-primary px-6"
            @click="handleAddSubcategory">
            <span>إضافة تصنيف فرعي جديد</span>
          </v-btn>
        </div>
      </div>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div class="bg-gray-50 rounded-md p-4 sm:p-6 gap-4">
            <!-- Loading indicator -->
            <div v-if="isLoading" class="flex justify-center py-4">
              <v-progress-circular indeterminate color="primary" size="32" />
            </div>

            <template v-else>
              <v-text-field v-model="categoriesSearch" density="comfortable" variant="outlined" hide-details
                placeholder="بحث" prepend-inner-icon="mdi-magnify" class="mb-3" />

              <div class="flex items-center mb-1 text-sm gap-2 text-gray-700">
                <v-checkbox v-model="isAllSelected" density="compact" hide-details class="m-0" />
                <div class="flex items-center gap-2">
                  <span>اختيار الكل</span>
                  <span>({{ flattenedFilteredCategories.length }})</span>
                </div>
              </div>

              <div class="max-h-[600px] overflow-y-auto space-y-0.5">
                <div v-for="category in filteredCategories" :key="category.id">
                  <!-- Main Category Row -->
                  <div class="flex items-center justify-start text-sm gap-2 px-4 py-50 rounded-md transition-colors"
                    :class="isCategorySelected(category.id) ? 'bg-primary-100/50 border-s-4 border-primary-500' : 'hover:bg-gray-100'">
                    <v-checkbox v-model="selectedCategoryIds" :value="category.id" density="compact" hide-details
                      class="m-0" />

                    <span class="flex-1 cursor-pointer" :class="isCategorySelected(category.id)
                      ? 'text-primary-700 font-semibold'
                      : selectedCategoryIds.includes(category.id)
                        ? 'text-primary-600 font-medium'
                        : 'text-gray-700'" @click="handleCategorySelect(category, false)">
                      {{ category.name }}
                    </span>

                    <button v-if="category.children && category.children.length" type="button"
                      class="text-gray-400 hover:text-primary-600 transition-colors"
                      @click="toggleCategoryExpand(category.id)">
                      <v-icon size="25">
                        {{ isCategoryExpanded(category.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                      </v-icon>
                    </button>
                  </div>

                  <!-- Subcategories -->
                  <div v-if="category.children && category.children.length && isCategoryExpanded(category.id)"
                    class="ps-8 space-y-0.5">
                    <div v-for="child in category.children" :key="child.id"
                      class="flex items-center justify-start text-sm gap-2 py-50 ps-2 rounded-md transition-colors"
                      :class="isCategorySelected(child.id) ? 'bg-primary-100/50 border-s-4 border-primary-500' : 'hover:bg-gray-100'">
                      <v-checkbox v-model="selectedCategoryIds" :value="child.id" density="compact" hide-details
                        class="m-0" />

                      <span class="cursor-pointer" :class="isCategorySelected(child.id)
                        ? 'text-primary-700 font-semibold'
                        : selectedCategoryIds.includes(child.id)
                          ? 'text-primary-600 font-medium'
                          : 'text-gray-700'"
                        @click="handleCategorySelect({ ...child, parentId: category.id }, true)">
                        {{ child.name }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-if="!filteredCategories.length" class="text-center text-gray-500 py-8">
                  لا توجد تصنيفات
                </div>
              </div>
            </template>
          </div>

          <div class="lg:col-span-2 space-y-6">
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

                <SelectWithIconInput v-model="parentCategory" label="التصنيف الرئيسي" placeholder="اختر التصنيف الرئيسي"
                  :items="parentCategoryItems" :hide-details="false" :disabled="isSubcategoryMode" />

                <SelectWithIconInput v-model="unit" label="الوحدة" placeholder="اختر الوحدة" :items="unitItems"
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
                  <v-btn
                    variant="flat"
                    color="primary"
                    height="40"
                    class="font-semibold text-sm px-4 w-full lg:w-auto"
                    :disabled="!isNewTaxValid"
                    @click="addTaxRule"
                  >
                    <template #append>
                      <v-icon size="22">mdi-plus</v-icon>
                    </template>
                    <span>اضافة ضريبة</span>
                  </v-btn>
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
                        <v-chip v-if="tax.maxValue" size="small" color="primary-50" class="font-semibold"
                          variant="flat">
                          {{ getPriorityLabel(tax.maxValue) }}
                        </v-chip>
                      </td>
                      <td class="text-center">
                        <v-btn icon variant="text" color="primary" size="small">
                          <v-icon>mdi-pencil-outline</v-icon>
                        </v-btn>
                        <v-btn icon variant="text" color="error" size="small" @click="removeTaxRule(index)">
                          <v-icon>mdi-trash-can-outline</v-icon>
                        </v-btn>
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

            <div class="flex justify-center gap-3 mt-6 sm:flex-row flex-col">
              <!-- Save/Apply Button -->
              <v-btn variant="flat" color="primary" height="48" class="sm:flex-1 font-semibold text-base"
                :prepend-icon="isBulkMode ? 'mdi-check-all' : 'mdi-content-save-all-outline'" :loading="isSaving"
                :disabled="isSaving || isDeleting || (isBulkMode && !taxRules.length)" @click="handleSave">
                {{ isBulkMode ? 'تطبيق الضرائب على التصنيفات المحددة' : isEditing ? 'تحديث' : 'حفظ' }}
              </v-btn>

              <!-- Close/Cancel Button -->
              <v-btn variant="flat" color="primary-100" height="48"
                class="sm:flex-1 font-semibold text-base text-primary-700" prepend-icon="mdi-close"
                :disabled="isSaving || isDeleting" @click="handleClose">
                {{ isBulkMode ? 'إلغاء التحديد' : 'إغلاق' }}
              </v-btn>

              <!-- Delete Button - only visible when editing -->
              <v-btn v-if="isEditing && selectedCategory" variant="flat" color="error-50" height="48"
                class="sm:flex-1 font-semibold text-base text-error-700" prepend-icon="mdi-trash-can-outline"
                :loading="isDeleting" :disabled="isSaving || isDeleting" @click="openDeleteDialog">
                حذف
              </v-btn>
            </div>
          </div>

        </div>
      </v-form>
    </div>
    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmDialog v-model="showDeleteDialog" :loading="isDeleting" :persistent="true" @confirm="confirmDelete">
      <p class="text-gray-700 text-center">
        هل أنت متأكد من حذف التصنيف
        <strong class="text-primary-700">{{ selectedCategory?.name }}</strong>؟
      </p>
      <p v-if="selectedCategory?.children?.length" class="text-error-600 text-sm mt-2 text-center">
        <v-icon size="16" class="me-1">mdi-information-outline</v-icon>
        سيتم حذف جميع التصنيفات الفرعية المرتبطة بهذا التصنيف.
      </p>
    </DeleteConfirmDialog>

    <!-- Notification Snackbar -->
    <v-snackbar v-model="notification.show" :timeout="notification.timeout"
      :color="notification.type === 'success' ? 'success' : notification.type === 'error' ? 'error' : notification.type === 'warning' ? 'warning' : 'info'"
      location="top end">
      {{ notification.message }}
      <template #actions>
        <v-btn variant="text" @click="notification.show = false">
          إغلاق
        </v-btn>
      </template>
    </v-snackbar>
  </default-layout>
</template>

<style scoped></style>
