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

// API Endpoints
const API_ENDPOINTS = {
  categories: '/admin/api/categories',
  categoryById: (id: number) => `/admin/api/categories/${id}`,
  taxes: '/admin/api/taxes',
  units: '/admin/api/units',
  constants: '/admin/api/constants',
};

// =====================
// Mock Data (for testing - remove when API is ready)
// =====================
const MOCK_CATEGORIES = [
  {
    id: 49,
    name: "الملابس",
    sup_category: [
      { id: 55, name: "Men's Clothing" },
      { id: 56, name: "Women's Clothing" },
      { id: 57, name: "Shoes" },
    ],
  },
  {
    id: 50,
    name: "الإلكترونيات",
    sup_category: [
      { id: 58, name: "Phones" },
      { id: 59, name: "Laptops" },
      { id: 60, name: "Tablets" },
    ],
  },
  {
    id: 51,
    name: "الطعام والمشروبات",
    sup_category: [
      { id: 61, name: "Hot Drinks" },
      { id: 62, name: "Cold Drinks" },
      { id: 63, name: "Snacks" },
    ],
  },
  { id: 52, name: "أحذية" },
  { id: 53, name: "مستلزمات المنزل" },
  { id: 54, name: "الرياضة" },
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
const USE_MOCK_DATA = false; // Using real API

// =====================
// Types & Interfaces
// =====================
interface CategoryListItem {
  id: number;
  name: string;
  parentId?: number | null;
  children?: CategoryListItem[];
  taxes?: any[];
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
const showBulkDeleteDialog = ref(false);

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
const priorityItems = ref<Array<{ title: string; value: number | string }>>([{ title: "اختر الأولوية", value: "" }]);

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
  const item = priorityItems.value.find((i) => i.value === value);
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
// API: Fetch Constants (Priorities)
// =====================
const fetchConstants = async () => {
  try {
    if (USE_MOCK_DATA) {
      // Mock constants data
      priorityItems.value = [
        { title: "اختر الأولوية", value: "" },
        { title: "High", value: 1 },
        { title: "Low", value: 2 },
      ];
    } else {
      // Real API call
      const response = await api.get<{ data: { priorities: Array<{ key: number; label: string }> } }>(API_ENDPOINTS.constants);

      priorityItems.value = [
        { title: "اختر الأولوية", value: "" },
        ...response.data.priorities.map((priority) => ({
          title: priority.label,
          value: priority.key,
        })),
      ];
    }
  } catch (error) {
    console.error('Failed to fetch constants:', error);
    showError('حدث خطأ أثناء تحميل الثوابت');
  }
};

// =====================
// API: Fetch Categories Tree List with Taxes
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
      // Real API call - get tree structure with taxes
      const response = await api.get('/admin/api/categories/tree?with_taxes=true');

      // Transform API tree response to internal format recursively
      const transformTree = (items: any[], parentId: number | null = null): CategoryListItem[] => {
        return items.map((item) => ({
          id: item.id,
          name: item.name,
          parentId: parentId,
          children: item.children ? transformTree(item.children, item.id) : [],
          taxes: item.taxes || [],
        }));
      };

      categoriesList.value = transformTree(response.data);
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
      const response = await api.get(`/admin/api/categories/${id}`);
      const cat = response.data;

      if (cat) {
        // Populate form with API data
        categoryNameAr.value = cat.name_translations?.ar || "";
        categoryNameEn.value = cat.name_translations?.en || "";
        categoryDescription.value = cat.description_translations?.ar || cat.description || "";
        parentCategory.value = cat.parent_id;
        isActive.value = Boolean(cat.is_active);
        unit.value = cat.unit_id;

        // Transform taxes from API structure
        taxRules.value = cat.taxes.map((tax: any) => ({
          id: tax.id,
          name: tax.tax_id.toString(),
          percentage: tax.percentage,
          minValue: tax.minimum || "",
          maxValue: tax.priority.toString(),
        }));
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

  // Clear multi-select when selecting single category
  selectedCategoryIds.value = [];

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
      const payload = {
        ids: selectedCategoryIds.value,
        taxes: taxRules.value.map((tax, index) => {
          const taxObj: any = {
            tax_id: parseInt(tax.name || '1'),
            percentage: parseFloat(tax.percentage) || 0,
            minimum: tax.minValue ? parseFloat(tax.minValue) : null,
            priority: parseInt(tax.maxValue || (index + 1).toString()),
          };
          
          // Include id only if it exists (for updating existing tax rules)
          if (tax.id && tax.id > 0) {
            taxObj.id = tax.id;
          }
          
          return taxObj;
        }),
      };

      if (USE_MOCK_DATA) {
        console.log('Mock: Applying bulk taxes', payload);
      } else {
        await api.post('/admin/api/categories/tree/tax-bulk', payload);
      }
      success(`تم تطبيق الضرائب على ${selectedCategoryIds.value.length} تصنيف بنجاح`);

      selectedCategoryIds.value = [];
      taxRules.value = [];
    } else {
      // Single category mode - prepare payload matching API structure
      const payload = {
        name_translations: {
          ar: categoryNameAr.value,
          en: categoryNameEn.value,
        },
        description_translations: {
          ar: categoryDescription.value,
          en: categoryDescription.value,
        },
        parent_id: parentCategory.value,
        unit_id: unit.value ? parseInt(unit.value.toString()) : 1,
        image: categoryImage.value?.[0] || null,
        is_active: isActive.value,
        taxes: taxRules.value.map((tax, index) => ({
          tax_id: parseInt(tax.name || '1'),
          percentage: tax.percentage,
          minimum: tax.minValue || null,
          priority: parseInt(tax.maxValue || (index + 1).toString()),
          is_active: true,
        })),
      };

      if (isEditing.value && selectedCategory.value) {
        // Update existing category
        if (USE_MOCK_DATA) {
          console.log('Mock: Updating category', selectedCategory.value.id, payload);
        } else {
          if (payload.image) {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('name_translations[ar]', payload.name_translations.ar);
            formData.append('name_translations[en]', payload.name_translations.en);
            formData.append('description_translations[ar]', payload.description_translations.ar);
            formData.append('description_translations[en]', payload.description_translations.en);
            if (payload.parent_id) formData.append('parent_id', payload.parent_id.toString());
            formData.append('unit_id', payload.unit_id.toString());
            formData.append('is_active', payload.is_active ? '1' : '0');
            formData.append('image', payload.image);
            
            payload.taxes.forEach((tax: any, index: number) => {
              formData.append(`taxes[${index}][tax_id]`, tax.tax_id.toString());
              formData.append(`taxes[${index}][percentage]`, tax.percentage);
              if (tax.minimum) formData.append(`taxes[${index}][minimum]`, tax.minimum);
              formData.append(`taxes[${index}][priority]`, tax.priority.toString());
              formData.append(`taxes[${index}][is_active]`, tax.is_active ? '1' : '0');
            });
            await api.upload(`/admin/api/categories/${selectedCategory.value.id}`, formData);
          } else {
            await api.put(`/admin/api/categories/${selectedCategory.value.id}`, payload);
          }
        }
        success('تم تحديث التصنيف بنجاح');
      } else {
        // Create new category
        if (USE_MOCK_DATA) {
          console.log('Mock: Creating category', payload);
        } else {
          if (payload.image) {
            const formData = new FormData();
            formData.append('name_translations[ar]', payload.name_translations.ar);
            formData.append('name_translations[en]', payload.name_translations.en);
            formData.append('description_translations[ar]', payload.description_translations.ar);
            formData.append('description_translations[en]', payload.description_translations.en);
            if (payload.parent_id) formData.append('parent_id', payload.parent_id.toString());
            formData.append('unit_id', payload.unit_id.toString());
            formData.append('is_active', payload.is_active ? '1' : '0');
            formData.append('image', payload.image);
            
            payload.taxes.forEach((tax: any, index: number) => {
              formData.append(`taxes[${index}][tax_id]`, tax.tax_id.toString());
              formData.append(`taxes[${index}][percentage]`, tax.percentage);
              if (tax.minimum) formData.append(`taxes[${index}][minimum]`, tax.minimum);
              formData.append(`taxes[${index}][priority]`, tax.priority.toString());
              formData.append(`taxes[${index}][is_active]`, tax.is_active ? '1' : '0');
            });
            await api.upload('/admin/api/categories', formData);
          } else {
            await api.post('/admin/api/categories', payload);
          }
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

// =====================
// Bulk Delete Categories
// =====================
const openBulkDeleteDialog = () => {
  if (!selectedCategoryIds.value.length) return;
  showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  if (!selectedCategoryIds.value.length) return;

  showBulkDeleteDialog.value = false;
  isDeleting.value = true;

  try {
    if (USE_MOCK_DATA) {
      console.log('Mock: Bulk deleting categories', selectedCategoryIds.value);
    } else {
      await api.post('/admin/api/categories/bulk-delete', { ids: selectedCategoryIds.value });
    }
    success(`تم حذف ${selectedCategoryIds.value.length} تصنيف بنجاح`);

    // Refresh categories list
    await fetchCategories();

    // Reset state
    selectedCategoryIds.value = [];
    resetForm();
    selectedCategory.value = null;
    isEditing.value = false;
    isSubcategoryMode.value = false;
    parentCategoryForSubcategory.value = null;

  } catch (err) {
    console.error('Failed to bulk delete categories:', err);
    showError('حدث خطأ أثناء حذف التصنيفات');
  } finally {
    isDeleting.value = false;
  }
};

const confirmDelete = async () => {
  if (!selectedCategory.value) return;

  showDeleteDialog.value = false;
  isDeleting.value = true;

  try {
    if (USE_MOCK_DATA) {
      console.log('Mock: Deleting category', selectedCategory.value.id);
    } else {
      await api.delete(`/admin/api/categories/${selectedCategory.value.id}`);
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
  fetchConstants();
});

const categoriesIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 30.1667C27.2565 30.1667 30.1667 27.2565 30.1667 23.6667C30.1667 20.0768 27.2565 17.1667 23.6667 17.1667C20.0768 17.1667 17.1667 20.0768 17.1667 23.6667C17.1667 27.2565 20.0768 30.1667 23.6667 30.1667Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M38.2424 29.5758C37.9802 30.1698 37.902 30.8289 38.0179 31.4678C38.1337 32.1068 38.4383 32.6964 38.8924 33.1606L39.0106 33.2788C39.3769 33.6446 39.6674 34.0791 39.8657 34.5574C40.0639 35.0356 40.166 35.5482 40.166 36.0659C40.166 36.5836 40.0639 37.0962 39.8657 37.5745C39.6674 38.0527 39.3769 38.4872 39.0106 38.853C38.6447 39.2193 38.2103 39.5099 37.732 39.7081C37.2538 39.9064 36.7412 40.0084 36.2235 40.0084C35.7058 40.0084 35.1932 39.9064 34.7149 39.7081C34.2367 39.5099 33.8022 39.2193 33.4364 38.853L33.3182 38.7348C32.854 38.2808 32.2644 37.9761 31.6254 37.8603C30.9864 37.7444 30.3274 37.8226 29.7333 38.0848C29.1508 38.3345 28.6539 38.7491 28.3039 39.2776C27.954 39.806 27.7662 40.4253 27.7636 41.0591V41.3939C27.7636 42.4387 27.3486 43.4407 26.6098 44.1795C25.871 44.9183 24.869 45.3333 23.8242 45.3333C22.7794 45.3333 21.7774 44.9183 21.0387 44.1795C20.2999 43.4407 19.8848 42.4387 19.8848 41.3939V41.2167C19.8696 40.5647 19.6586 39.9324 19.2792 39.402C18.8998 38.8716 18.3696 38.4675 17.7576 38.2424C17.1635 37.9802 16.5045 37.902 15.8655 38.0179C15.2265 38.1337 14.6369 38.4383 14.1727 38.8924L14.0545 39.0106C13.6887 39.3769 13.2542 39.6674 12.776 39.8657C12.2977 40.0639 11.7851 40.166 11.2674 40.166C10.7497 40.166 10.2371 40.0639 9.75887 39.8657C9.28064 39.6674 8.84617 39.3769 8.4803 39.0106C8.11403 38.6447 7.82347 38.2103 7.62522 37.732C7.42697 37.2538 7.32493 36.7412 7.32493 36.2235C7.32493 35.7058 7.42697 35.1932 7.62522 34.7149C7.82347 34.2367 8.11403 33.8022 8.4803 33.4364L8.59848 33.3182C9.05257 32.854 9.35718 32.2644 9.47304 31.6254C9.58889 30.9864 9.51068 30.3274 9.24848 29.7333C8.9988 29.1508 8.58422 28.6539 8.05576 28.3039C7.52731 27.954 6.90806 27.7662 6.27424 27.7636H5.93939C4.8946 27.7636 3.8926 27.3486 3.15382 26.6098C2.41504 25.871 2 24.869 2 23.8242C2 22.7794 2.41504 21.7774 3.15382 21.0387C3.8926 20.2999 4.8946 19.8848 5.93939 19.8848H6.11667C6.76863 19.8696 7.40092 19.6586 7.93135 19.2792C8.46177 18.8998 8.8658 18.3696 9.09091 17.7576C9.35311 17.1635 9.43132 16.5045 9.31546 15.8655C9.19961 15.2265 8.895 14.6369 8.44091 14.1727L8.32273 14.0545C7.95646 13.6887 7.66589 13.2542 7.46764 12.776C7.2694 12.2977 7.16736 11.7851 7.16736 11.2674C7.16736 10.7497 7.2694 10.2371 7.46764 9.75887C7.66589 9.28064 7.95646 8.84617 8.32273 8.4803C8.68859 8.11403 9.12306 7.82347 9.6013 7.62522C10.0795 7.42697 10.5922 7.32493 11.1098 7.32493C11.6275 7.32493 12.1402 7.42697 12.6184 7.62522C13.0966 7.82347 13.5311 8.11403 13.897 8.4803L14.0152 8.59848C14.4794 9.05257 15.069 9.35718 15.7079 9.47304C16.3469 9.58889 17.0059 9.51068 17.6 9.24848H17.7576C18.3402 8.9988 18.837 8.58422 19.187 8.05576C19.5369 7.52731 19.7247 6.90806 19.7273 6.27424V5.93939C19.7273 4.8946 20.1423 3.8926 20.8811 3.15382C21.6199 2.41504 22.6219 2 23.6667 2C24.7115 2 25.7135 2.41504 26.4522 3.15382C27.191 3.8926 27.6061 4.8946 27.6061 5.93939V6.11667C27.6086 6.75049 27.7964 7.36974 28.1464 7.89819C28.4963 8.42664 28.9932 8.84122 29.5758 9.09091C30.1698 9.35311 30.8289 9.43132 31.4678 9.31546C32.1068 9.19961 32.6964 8.895 33.1606 8.44091L33.2788 8.32273C33.6446 7.95646 34.0791 7.66589 34.5574 7.46764C35.0356 7.2694 35.5482 7.16736 36.0659 7.16736C36.5836 7.16736 37.0962 7.2694 37.5745 7.46764C38.0527 7.66589 38.4872 7.95646 38.853 8.32273C39.2193 8.68859 39.5099 9.12306 39.7081 9.6013C39.9064 10.0795 40.0084 10.5922 40.0084 11.1098C40.0084 11.6275 39.9064 12.1402 39.7081 12.6184C39.5099 13.0966 39.2193 13.5311 38.853 13.897L38.7348 14.0152C38.2808 14.4794 37.9761 15.069 37.8603 15.7079C37.7444 16.3469 37.8226 17.0059 38.0848 17.6V17.7576C38.3345 18.3402 38.7491 18.837 39.2776 19.187C39.806 19.5369 40.4253 19.7247 41.0591 19.7273H41.3939C42.4387 19.7273 43.4407 20.1423 44.1795 20.8811C44.9183 21.6199 45.3333 22.6219 45.3333 23.6667C45.3333 24.7115 44.9183 25.7135 44.1795 26.4522C43.4407 27.191 42.4387 27.6061 41.3939 27.6061H41.2167C40.5828 27.6086 39.9636 27.7964 39.4351 28.1464C38.9067 28.4963 38.4921 28.9932 38.2424 29.5758Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

</script>

<template>
  <default-layout>
    <div class="categories-page">
      <div class="flex items-center flex-wrap justify-between">
        <PageHeader :icon="categoriesIcon" title-key="pages.ProductsCategories.title"
          description-key="pages.ProductsCategories.description" />

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

          <div class="bg-white rounded-lg shadow-sm">
            <!-- Header -->
            <div class="px-6">
              <h2 class="text-base font-bold text-gray-900 mb-1">شجرة التصنيفات</h2>
              <p class="text-xs text-gray-600">اختر تصنيف لعرض التفاصيل</p>
            </div>

            <!-- Loading indicator -->
            <div v-if="isLoading" class="flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="32" />
            </div>

            <template v-else>
              <!-- Search Box -->
              <div class="px-6 pt-4">
                <v-text-field v-model="categoriesSearch" density="comfortable" variant="outlined" hide-details
                  placeholder="بحث" prepend-inner-icon="mdi-magnify" class="mb-4" bg-color="gray-50" rounded="lg" />
              </div>

              <!-- Categories List -->
              <div class="px-6 pb-4 max-h-[600px] overflow-y-auto space-y-2">
                <div v-for="category in filteredCategories" :key="category.id" class="space-y-2">
                  <!-- Main Category Row -->
                  <div class="flex items-center gap-2 px-2 py-1 text-white rounded-lg transition-all cursor-pointer"
                    :class="[
                      isCategorySelected(category.id)
                        ? 'bg-primary-900 shadow-md'
                        : 'bg-primary-500 hover:bg-primary-600'
                    ]" @click="handleCategorySelect(category, false)">

                    <!-- Action Icons -->
                    <div class="flex items-center">
                      <v-checkbox v-model="selectedCategoryIds" :value="category.id" density="compact" hide-details
                        :color="isCategorySelected(category.id) ? 'gray-500' : 'gray-500'" class="m-0" @click.stop />
                    </div>

                    <!-- Category Name -->
                    <span class="flex-1 font-normal text-base">
                      {{ category.name }}
                    </span>


                    <!-- Expand/Collapse Icon -->
                    <button v-if="category.children && category.children.length" type="button" class="flex-shrink-0"
                      @click.stop="toggleCategoryExpand(category.id)">
                      <v-icon size="20" :color="isCategorySelected(category.id) ? 'white' : 'gray'">
                        {{ isCategoryExpanded(category.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                      </v-icon>
                    </button>
                    <div v-else class="w-5"></div>

                  </div>

                  <!-- Subcategories -->
                  <div v-if="category.children && category.children.length && isCategoryExpanded(category.id)"
                    class="space-y-2 ps-0">
                    <div v-for="child in category.children" :key="child.id"
                      class="flex items-center gap-2 px-2 py-1 border rounded-lg transition-all cursor-pointer" :class="[
                        isCategorySelected(child.id)
                          ? 'bg-gray-300 border-gray-400 text-white shadow-sm'
                          : 'bg-gray-100 border-gray-100 text-gray-700 hover:bg-gray-200'
                      ]" @click="handleCategorySelect({ ...child, parentId: category.id }, true)">

                      <!-- Action Icons -->
                      <div class="flex items-center gap-2">
                        <v-checkbox v-model="selectedCategoryIds" :value="child.id" density="compact" hide-details
                          :color="isCategorySelected(child.id) ? 'white' : 'primary'" class="m-0" @click.stop />
                      </div>

                      <!-- Subcategory Name -->
                      <span class="flex-1 font-semibold text-base">
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
                <div class="w-auto flex justify-start lg:justify-end">
                  <v-btn variant="flat" color="primary" height="40" class="font-semibold text-sm px-4 w-full lg:w-auto"
                    :disabled="!isNewTaxValid" @click="addTaxRule">
                    <template #append>
                      <v-icon size="22">mdi-plus</v-icon>
                    </template>
                    <span>اضافة ضريبة</span>
                  </v-btn>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                  الضرائب المطبقة على المنتج
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

              <!-- Bulk Delete Button - visible when multiple categories selected -->
              <v-btn v-if="isBulkMode" variant="flat" color="error-50" height="48"
                class="sm:flex-1 font-semibold text-base text-error-700" prepend-icon="mdi-delete-multiple"
                :loading="isDeleting" :disabled="isSaving || isDeleting" @click="openBulkDeleteDialog">
                حذف المحدد ({{ selectedCategoryIds.length }})
              </v-btn>

              <!-- Delete Button - only visible when editing single category -->
              <v-btn v-if="isEditing && selectedCategory && !isBulkMode" variant="flat" color="error-50" height="48"
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

    <!-- Bulk Delete Confirmation Dialog -->
    <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="isDeleting" :persistent="true" @confirm="confirmBulkDelete">
      <p class="text-gray-700 text-center">
        هل أنت متأكد من حذف
        <strong class="text-error-700">{{ selectedCategoryIds.length }}</strong>
        تصنيف؟
      </p>
      <p class="text-error-600 text-sm mt-2 text-center">
        <v-icon size="16" class="me-1">mdi-alert-circle-outline</v-icon>
        سيتم حذف جميع التصنيفات المحددة وجميع التصنيفات الفرعية المرتبطة بها.
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
