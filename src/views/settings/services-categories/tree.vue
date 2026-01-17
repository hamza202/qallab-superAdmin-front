<script setup lang="ts">
import { computed, ref, watch, onMounted, reactive } from 'vue';
import { useNotification } from '@/composables/useNotification';
import { useApi } from '@/composables/useApi';
import CategoryTreeItem from './components/CategoryTreeItem.vue';

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

interface CategoryDropdownItem {
  value: number;
  title: string;
}

interface TaxRule {
  id: number;
  tax_id: number | null;
  percentage: number | null;
  minValue: number | null;
  priority: number | null;
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

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

const { notification, success, error: showError } = useNotification();
const api = useApi();

const formErrors = reactive<Record<string, string>>({});

// =====================
// Form Refs
// =====================
const formRef = ref<any>(null);
const isFormValid = ref(false);

// =====================
// Page State Management
// =====================
const isLoading = ref(false);
const isLoadingPage = ref(false);
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
const categoryDescriptionAr = ref("");
const categoryDescriptionEn = ref("");
const categoryImage = ref<File[] | null>(null);
const isActive = ref(true);

// =====================
// Categories Data
// =====================
const categoriesSearch = ref("");
const categoriesList = ref<CategoryListItem[]>([]);
const CategoryDropdownItems = ref<CategoryDropdownItem[]>([]);
const expandedCategoryIds = ref<number[]>([]);

// =====================
// Dropdown Items
// =====================
const unitItems = ref<Array<{ title: string; value: number | string }>>([]);
const taxNameItems = ref<Array<{ title: string; value: number | string }>>([]);
const priorityItems = ref<Array<{ title: string; value: number | string }>>([]);
const taxesData = ref<Array<any>>([]);

// =====================
// Computed: Parent Category Items for Dropdown
// =====================
// const parentCategoryItems = computed(() => {
//   const items: { title: string; value: number | string }[] = [];

//   // Only main categories (those without parentId) can be parents
//   categoriesList.value.forEach((cat) => {
//     items.push({ title: cat.name, value: cat.id });
//   });

//   return items;
// });

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
  // const isMainCategory = !selectedCategory.value.parentId;
  return true;
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
const editingTaxIndex = ref<number | null>(null);

const newTaxRule = ref<TaxRule>({
  id: 0,
  tax_id: null,
  percentage: null,
  minValue: null,
  priority: null,
});

const isNewTaxValid = computed(() => {
  const t = newTaxRule.value;
  if (!t.tax_id || !t.priority) return false;

  // Check if tax already exists in the table
  const taxAlreadyExists = taxRules.value.some(existingTax => existingTax.tax_id === t.tax_id);
  return !taxAlreadyExists;
});

// Computed: Get shared taxes between all selected categories in bulk mode
const sharedTaxes = computed(() => {
  if (!isBulkMode.value || selectedCategoryIds.value.length === 0) {
    return [];
  }

  // Get all selected categories (including nested ones)
  const selectedCategories: CategoryListItem[] = [];
  const findCategoryById = (categories: CategoryListItem[], id: number): CategoryListItem | null => {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  selectedCategoryIds.value.forEach(id => {
    const cat = findCategoryById(categoriesList.value, id);
    if (cat) selectedCategories.push(cat);
  });

  if (selectedCategories.length === 0) return [];

  // Get taxes from the first category
  const firstCategoryTaxes = selectedCategories[0].taxes || [];

  if (selectedCategories.length === 1) {
    return firstCategoryTaxes;
  }

  // Find taxes that exist in ALL selected categories
  const shared = firstCategoryTaxes.filter(tax => {
    return selectedCategories.every(cat => {
      const categoryTaxes = cat.taxes || [];
      return categoryTaxes.some(catTax => catTax.tax_id === tax.tax_id);
    });
  });

  return shared;
});

// Watch for tax selection changes to auto-populate percentage and minValue
watch(() => newTaxRule.value.tax_id, (newTaxId) => {
  if (newTaxId) {
    const selectedTax = taxesData.value.find((tax: any) => tax.id === Number(newTaxId));
    if (selectedTax) {
      newTaxRule.value.percentage = selectedTax.value_rate || "";
      newTaxRule.value.minValue = selectedTax.minimum || null;
    }
  } else {
    newTaxRule.value.percentage = null;
    newTaxRule.value.minValue = null;
  }
});

// Watch for bulk mode changes to load shared taxes
watch(isBulkMode, (newValue) => {
  if (newValue) {
    // When entering bulk mode, load shared taxes
    taxRules.value = sharedTaxes.value.map(tax => ({
      id: tax.id,
      tax_id: tax.tax_id,
      percentage: tax.percentage,
      minValue: tax.minimum || null,
      priority: tax.priority,
    }));
  } else {
    // When exiting bulk mode, clear taxes
    taxRules.value = [];
  }
}, { immediate: false });

// Watch for selected category IDs changes in bulk mode
watch(selectedCategoryIds, () => {
  if (isBulkMode.value) {
    // Update tax rules to show only shared taxes
    taxRules.value = sharedTaxes.value.map(tax => ({
      id: tax.id,
      tax_id: tax.tax_id,
      percentage: tax.percentage,
      minValue: tax.minimum || null,
      priority: tax.priority,
    }));
  }
}, { deep: true });

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
    tax_id: null,
    percentage: null,
    minValue: null,
    priority: null,
  };
  editingTaxIndex.value = null;
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

  if (editingTaxIndex.value !== null) {
    // Update existing tax rule
    taxRules.value[editingTaxIndex.value] = {
      ...taxRules.value[editingTaxIndex.value],
      ...newTaxRule.value,
    };
  } else {
    // Add new tax rule with negative ID to distinguish from API records
    const nextId = taxRules.value.length
      ? Math.min(...taxRules.value.map((t) => t.id).filter(id => id < 0), 0) - 1
      : -1;

    taxRules.value.push({
      ...newTaxRule.value,
      id: nextId,
    });
  }

  resetNewTaxRule();
};

const editTaxRule = (index: number) => {
  const taxToEdit = taxRules.value[index];
  newTaxRule.value = { ...taxToEdit };
  editingTaxIndex.value = index;
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
  categoryDescriptionAr.value = "";
  categoryDescriptionEn.value = "";
  categoryImage.value = null;
  isActive.value = true;
  taxRules.value = [];
  resetNewTaxRule();
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
  formRef.value?.resetValidation();
};

// =====================
// API: Fetch Constants (Priorities)
// =====================
const fetchConstants = async () => {
  try {
    // Real API call to get all constants
    const response = await api.get('/admin/service-categories/constants');

    // Populate priorities dropdown
    priorityItems.value = [
      ...response.data.priorities.map((priority: any) => ({
        title: priority.label,
        value: priority.key,
      })),
    ];
  } catch (error) {
    console.error('Failed to fetch constants:', error);
    showError('حدث خطأ أثناء تحميل البيانات');
  }
};

const fetchTaxes = async () => {
  try {
    // Real API call to get all taxes
    const response = await api.get('/taxes/list');

    // Store full tax data
    taxesData.value = response.data;

    // Populate priorities dropdown
    taxNameItems.value = [
      ...response.data.map((tax: any) => ({
        title: tax.tax_name,
        value: tax.id,
      })),
    ];
  } catch (error) {
    console.error('Failed to fetch constants:', error);
    showError('حدث خطأ أثناء تحميل البيانات');
  }
};

const fetchCategoriesList = async () => {
  try {
    // Real API call to get all categories
    const response = await api.get('/admin/service-categories/list');

    // Populate categories dropdown
    CategoryDropdownItems.value = [
      ...response.data.map((cat: any) => ({
        title: cat.name,
        value: cat.id,
      })),
    ];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    showError('حدث خطأ أثناء تحميل البيانات');
  }
};

const fetchUnits = async () => {
  try {
    // Real API call to get all units
    const response = await api.get('/admin/units/list');

    // Populate categories dropdown
    unitItems.value = [
      ...response.data.map((unit: any) => ({
        title: unit.name,
        value: unit.id,
      })),
    ];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    showError('حدث خطأ أثناء تحميل البيانات');
  }
};


const fetchCategoriesTree = async () => {
  isLoading.value = true;
  try {
    // Real API call - get tree structure with taxes
    const response = await api.get('/admin/service-categories/tree?with_taxes=true');

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
    // Real API call
    const response = await api.get(`/admin/service-categories/${id}`);
    const cat = response.data;
    if (cat) {
      // Populate form with API data
      categoryNameAr.value = cat.name_translations?.ar || "";
      categoryNameEn.value = cat.name_translations?.en || "";
      categoryDescriptionAr.value = cat.description_translations?.ar || cat.description || "";
      categoryDescriptionEn.value = cat.description_translations?.en || cat.description || "";
      parentCategory.value = cat.parent_id;
      isActive.value = Boolean(cat.is_active);
      unit.value = cat.unit_id;

      // Transform taxes from API structure
      if (cat.taxes) {
        taxRules.value = cat.taxes.map((tax: any) => ({
          id: tax.id,
          tax_id: tax.tax_id,
          percentage: tax.percentage,
          minValue: tax.minimum || "",
          priority: tax.priority,
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
  categoryDescriptionAr.value = "";
  categoryDescriptionEn.value = "";
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
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
  
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
            tax_id: tax.tax_id || null,
            percentage: tax.percentage || 0,
            minimum: tax.minValue || null,
            priority: tax.priority,
          };

          // Include id only if it exists (for updating existing tax rules)
          if (tax.id && tax.id > 0) {
            taxObj.id = tax.id;
          }

          return taxObj;
        }),
      };

      await api.post('/admin/service-categories/tree/tax-bulk', payload);
      success(`تم تطبيق الضرائب على ${selectedCategoryIds.value.length} تصنيف بنجاح`);

      selectedCategoryIds.value = [];
      taxRules.value = [];
    } else {
      // Single category mode - prepare payload matching API structure
      const payload = {
        name: {
          ar: categoryNameAr.value,
          en: categoryNameEn.value,
        },
        description: {
          ar: categoryDescriptionAr.value,
          en: categoryDescriptionEn.value,
        },
        parent_id: parentCategory.value,
        unit_id: unit.value ? parseInt(unit.value.toString()) : 1,
        image: categoryImage.value?.[0] || null,
        is_active: isActive.value,
        taxes: taxRules.value.map((tax) => {
          const taxPayload: any = {
            tax_id: tax.tax_id,
            percentage: tax.percentage,
            minimum: tax.minValue || null,
            priority: tax.priority,
            is_active: true,
          };
          // Include id only when editing and tax has a positive id from API
          if (isEditing.value && tax.id && tax.id > 0) {
            taxPayload.id = tax.id;
          }
          return taxPayload;
        }),
      };

      if (isEditing.value && selectedCategory.value) {
        // Update existing category
        if (payload.image) {
          const formData = new FormData();
          formData.append('_method', 'PUT');
          formData.append('name[ar]', payload.name.ar);
          formData.append('name[en]', payload.name.en);
          formData.append('description[ar]', payload.description.ar);
          formData.append('description[en]', payload.description.en);
          if (payload.parent_id) formData.append('parent_id', payload.parent_id.toString());
          formData.append('unit_id', payload.unit_id.toString());
          formData.append('is_active', payload.is_active ? '1' : '0');
          formData.append('image', payload.image);

          payload.taxes.forEach((tax: any, index: number) => {
            if (tax.id && tax.id > 0) formData.append(`taxes[${index}][id]`, tax.id);
            formData.append(`taxes[${index}][tax_id]`, tax.tax_id);
            formData.append(`taxes[${index}][percentage]`, tax.percentage);
            if (tax.minimum) formData.append(`taxes[${index}][minimum]`, tax.minimum);
            formData.append(`taxes[${index}][priority]`, tax.priority);
            formData.append(`taxes[${index}][is_active]`, tax.is_active ? '1' : '0');
          });

          await api.upload(`/admin/service-categories/${selectedCategory.value.id}`, formData);
        } else {
          await api.put(`/admin/service-categories/${selectedCategory.value.id}`, payload);
        }
        success('تم تحديث التصنيف بنجاح');
      } else {
        // Create new category
        if (payload.image) {
          const formData = new FormData();
          formData.append('name[ar]', payload.name.ar);
          formData.append('name[en]', payload.name.en);
          formData.append('description[ar]', payload.description.ar);
          formData.append('description[en]', payload.description.en);
          if (payload.parent_id) formData.append('parent_id', payload.parent_id.toString());
          formData.append('unit_id', payload.unit_id.toString());
          formData.append('is_active', payload.is_active ? '1' : '0');
          formData.append('image', payload.image);

          payload.taxes.forEach((tax: any, index: number) => {
            formData.append(`taxes[${index}][tax_id]`, tax.tax_id);
            formData.append(`taxes[${index}][percentage]`, tax.percentage);
            if (tax.minimum) formData.append(`taxes[${index}][minimum]`, tax.minimum);
            formData.append(`taxes[${index}][priority]`, tax.priority);
            formData.append(`taxes[${index}][is_active]`, tax.is_active ? '1' : '0');
          });
          await api.upload('/admin/service-categories', formData);
        } else {
          await api.post('/admin/service-categories', payload);
        }

        success(isSubcategoryMode.value ? 'تم إضافة التصنيف الفرعي بنجاح' : 'تم إضافة التصنيف بنجاح');
      }
    }

    // Refresh categories list
    await fetchCategoriesTree();

    // Reset form and state
    resetForm();
    selectedCategory.value = null;
    isEditing.value = false;
    isSubcategoryMode.value = false;
    parentCategoryForSubcategory.value = null;

  } catch (err: any) {
    console.error('Failed to save category:', err);
    
    // Handle validation errors
    if (err?.response?.status === 422 && err?.response?.data?.errors) {
      const apiErrors = err.response.data.errors;
      Object.keys(apiErrors).forEach(key => {
        formErrors[key] = apiErrors[key][0];
      });
      showError(err?.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
    } else {
      showError('حدث خطأ أثناء حفظ التصنيف');
    }
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
    await api.post('/admin/service-categories/bulk-delete', { ids: selectedCategoryIds.value });
    success(`تم حذف ${selectedCategoryIds.value.length} تصنيف بنجاح`);

    // Refresh categories list
    await fetchCategoriesTree();

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
    await api.delete(`/admin/service-categories/${selectedCategory.value.id}`);
    success('تم حذف التصنيف بنجاح');

    // Refresh categories list
    await fetchCategoriesTree();

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
});

onMounted(async () => {
  isLoadingPage.value = true;
  try {
    // Fetch constants (taxes, units, categories)
    await Promise.all([
      fetchCategoriesList(),
      fetchTaxes(),
      fetchUnits(),
      fetchConstants(),
      fetchCategoriesTree()
    ]);
  } finally {
    isLoadingPage.value = false;
  }
});

const categoriesIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 30.1667C27.2565 30.1667 30.1667 27.2565 30.1667 23.6667C30.1667 20.0768 27.2565 17.1667 23.6667 17.1667C20.0768 17.1667 17.1667 20.0768 17.1667 23.6667C17.1667 27.2565 20.0768 30.1667 23.6667 30.1667Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M38.2424 29.5758C37.9802 30.1698 37.902 30.8289 38.0179 31.4678C38.1337 32.1068 38.4383 32.6964 38.8924 33.1606L39.0106 33.2788C39.3769 33.6446 39.6674 34.0791 39.8657 34.5574C40.0639 35.0356 40.166 35.5482 40.166 36.0659C40.166 36.5836 40.0639 37.0962 39.8657 37.5745C39.6674 38.0527 39.3769 38.4872 39.0106 38.853C38.6447 39.2193 38.2103 39.5099 37.732 39.7081C37.2538 39.9064 36.7412 40.0084 36.2235 40.0084C35.7058 40.0084 35.1932 39.9064 34.7149 39.7081C34.2367 39.5099 33.8022 39.2193 33.4364 38.853L33.3182 38.7348C32.854 38.2808 32.2644 37.9761 31.6254 37.8603C30.9864 37.7444 30.3274 37.8226 29.7333 38.0848C29.1508 38.3345 28.6539 38.7491 28.3039 39.2776C27.954 39.806 27.7662 40.4253 27.7636 41.0591V41.3939C27.7636 42.4387 27.3486 43.4407 26.6098 44.1795C25.871 44.9183 24.869 45.3333 23.8242 45.3333C22.7794 45.3333 21.7774 44.9183 21.0387 44.1795C20.2999 43.4407 19.8848 42.4387 19.8848 41.3939V41.2167C19.8696 40.5647 19.6586 39.9324 19.2792 39.402C18.8998 38.8716 18.3696 38.4675 17.7576 38.2424C17.1635 37.9802 16.5045 37.902 15.8655 38.0179C15.2265 38.1337 14.6369 38.4383 14.1727 38.8924L14.0545 39.0106C13.6887 39.3769 13.2542 39.6674 12.776 39.8657C12.2977 40.0639 11.7851 40.166 11.2674 40.166C10.7497 40.166 10.2371 40.0639 9.75887 39.8657C9.28064 39.6674 8.84617 39.3769 8.4803 39.0106C8.11403 38.6447 7.82347 38.2103 7.62522 37.732C7.42697 37.2538 7.32493 36.7412 7.32493 36.2235C7.32493 35.7058 7.42697 35.1932 7.62522 34.7149C7.82347 34.2367 8.11403 33.8022 8.4803 33.4364L8.59848 33.3182C9.05257 32.854 9.35718 32.2644 9.47304 31.6254C9.58889 30.9864 9.51068 30.3274 9.24848 29.7333C8.9988 29.1508 8.58422 28.6539 8.05576 28.3039C7.52731 27.954 6.90806 27.7662 6.27424 27.7636H5.93939C4.8946 27.7636 3.8926 27.3486 3.15382 26.6098C2.41504 25.871 2 24.869 2 23.8242C2 22.7794 2.41504 21.7774 3.15382 21.0387C3.8926 20.2999 4.8946 19.8848 5.93939 19.8848H6.11667C6.76863 19.8696 7.40092 19.6586 7.93135 19.2792C8.46177 18.8998 8.8658 18.3696 9.09091 17.7576C9.35311 17.1635 9.43132 16.5045 9.31546 15.8655C9.19961 15.2265 8.895 14.6369 8.44091 14.1727L8.32273 14.0545C7.95646 13.6887 7.66589 13.2542 7.46764 12.776C7.2694 12.2977 7.16736 11.7851 7.16736 11.2674C7.16736 10.7497 7.2694 10.2371 7.46764 9.75887C7.66589 9.28064 7.95646 8.84617 8.32273 8.4803C8.68859 8.11403 9.12306 7.82347 9.6013 7.62522C10.0795 7.42697 10.5922 7.32493 11.1098 7.32493C11.6275 7.32493 12.1402 7.42697 12.6184 7.62522C13.0966 7.82347 13.5311 8.11403 13.897 8.4803L14.0152 8.59848C14.4794 9.05257 15.069 9.35718 15.7079 9.47304C16.3469 9.58889 17.0059 9.51068 17.6 9.24848H17.7576C18.3402 8.9988 18.837 8.58422 19.187 8.05576C19.5369 7.52731 19.7247 6.90806 19.7273 6.27424V5.93939C19.7273 4.8946 20.1423 3.8926 20.8811 3.15382C21.6199 2.41504 22.6219 2 23.6667 2C24.7115 2 25.7135 2.41504 26.4522 3.15382C27.191 3.8926 27.6061 4.8946 27.6061 5.93939V6.11667C27.6086 6.75049 27.7964 7.36974 28.1464 7.89819C28.4963 8.42664 28.9932 8.84122 29.5758 9.09091C30.1698 9.35311 30.8289 9.43132 31.4678 9.31546C32.1068 9.19961 32.6964 8.895 33.1606 8.44091L33.2788 8.32273C33.6446 7.95646 34.0791 7.66589 34.5574 7.46764C35.0356 7.2694 35.5482 7.16736 36.0659 7.16736C36.5836 7.16736 37.0962 7.2694 37.5745 7.46764C38.0527 7.66589 38.4872 7.95646 38.853 8.32273C39.2193 8.68859 39.5099 9.12306 39.7081 9.6013C39.9064 10.0795 40.0084 10.5922 40.0084 11.1098C40.0084 11.6275 39.9064 12.1402 39.7081 12.6184C39.5099 13.0966 39.2193 13.5311 38.853 13.897L38.7348 14.0152C38.2808 14.4794 37.9761 15.069 37.8603 15.7079C37.7444 16.3469 37.8226 17.0059 38.0848 17.6V17.7576C38.3345 18.3402 38.7491 18.837 39.2776 19.187C39.806 19.5369 40.4253 19.7247 41.0591 19.7273H41.3939C42.4387 19.7273 43.4407 20.1423 44.1795 20.8811C44.9183 21.6199 45.3333 22.6219 45.3333 23.6667C45.3333 24.7115 44.9183 25.7135 44.1795 26.4522C43.4407 27.191 42.4387 27.6061 41.3939 27.6061H41.2167C40.5828 27.6086 39.9636 27.7964 39.4351 28.1464C38.9067 28.4963 38.4921 28.9932 38.2424 29.5758Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 0.833984H10.5627C10.9704 0.833984 11.1742 0.833984 11.366 0.880035C11.5361 0.920862 11.6987 0.988203 11.8478 1.07958C12.016 1.18265 12.1601 1.32678 12.4484 1.61503L15.0529 4.2196C15.3412 4.50786 15.4853 4.65198 15.5884 4.82018C15.6798 4.9693 15.7471 5.13187 15.7879 5.30193C15.834 5.49374 15.834 5.69757 15.834 6.10522V12.5007M8.75065 6.66732H5.50065C5.03394 6.66732 4.80059 6.66732 4.62233 6.57649C4.46552 6.4966 4.33804 6.36911 4.25815 6.21231C4.16732 6.03405 4.16732 5.80069 4.16732 5.33398V3.75065M9.58398 15.834V12.1673C9.58398 11.7006 9.58398 11.4673 9.49316 11.289C9.41326 11.1322 9.28578 11.0047 9.12898 10.9248C8.95072 10.834 8.71736 10.834 8.25065 10.834H5.50065C5.03394 10.834 4.80059 10.834 4.62233 10.9248C4.46552 11.0047 4.33804 11.1322 4.25815 11.289C4.16732 11.4673 4.16732 11.7006 4.16732 12.1673V15.834M12.9173 6.80294V13.1673C12.9173 14.1007 12.9173 14.5674 12.7357 14.924C12.5759 15.2376 12.3209 15.4925 12.0073 15.6523C11.6508 15.834 11.1841 15.834 10.2507 15.834H3.50065C2.56723 15.834 2.10052 15.834 1.744 15.6523C1.4304 15.4925 1.17543 15.2376 1.01564 14.924C0.833984 14.5674 0.833984 14.1007 0.833984 13.1673V6.41732C0.833984 5.4839 0.833984 5.01719 1.01564 4.66067C1.17543 4.34706 1.4304 4.0921 1.744 3.93231C2.10052 3.75065 2.56723 3.75065 3.50065 3.75065H9.86503C10.0689 3.75065 10.1708 3.75065 10.2667 3.77368C10.3517 3.79409 10.433 3.82776 10.5076 3.87345C10.5917 3.92499 10.6637 3.99705 10.8078 4.14118L12.5268 5.86013C12.6709 6.00425 12.743 6.07632 12.7945 6.16041C12.8402 6.23497 12.8739 6.31626 12.8943 6.40129C12.9173 6.4972 12.9173 6.59911 12.9173 6.80294Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const deleteIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.5 1H10M1 3.25H14.5M13 3.25L12.474 11.1395C12.3951 12.3232 12.3557 12.915 12.1 13.3638C11.8749 13.7588 11.5354 14.0765 11.1262 14.2748C10.6615 14.5 10.0683 14.5 8.88201 14.5H6.61799C5.43168 14.5 4.83852 14.5 4.37375 14.2748C3.96457 14.0765 3.62507 13.7588 3.39999 13.3638C3.14433 12.915 3.10488 12.3232 3.02596 11.1395L2.5 3.25" stroke="#B42318" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trashIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6673 4.16732V3.50065C11.6673 2.56723 11.6673 2.10052 11.4857 1.744C11.3259 1.4304 11.0709 1.17543 10.7573 1.01564C10.4008 0.833984 9.93407 0.833984 9.00065 0.833984H7.66732C6.7339 0.833984 6.26719 0.833984 5.91067 1.01564C5.59706 1.17543 5.3421 1.4304 5.18231 1.744C5.00065 2.10052 5.00065 2.56723 5.00065 3.50065V4.16732M6.66732 8.75065V12.9173M10.0007 8.75065V12.9173M0.833984 4.16732H15.834M14.1673 4.16732V13.5007C14.1673 14.9008 14.1673 15.6008 13.8948 16.1356C13.6552 16.606 13.2727 16.9885 12.8023 17.2282C12.2675 17.5007 11.5674 17.5007 10.1673 17.5007H6.50065C5.10052 17.5007 4.40045 17.5007 3.86567 17.2282C3.39527 16.9885 3.01282 16.606 2.77313 16.1356C2.50065 15.6008 2.50065 14.9008 2.50065 13.5007V4.16732" stroke="#D92D20" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const editIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.14735 14.1207C1.18564 13.7761 1.20478 13.6038 1.25691 13.4428C1.30316 13.2999 1.36851 13.164 1.45118 13.0386C1.54436 12.8973 1.66694 12.7747 1.91209 12.5296L12.9173 1.52434C13.8378 0.603865 15.3302 0.603866 16.2507 1.52434C17.1711 2.44482 17.1711 3.9372 16.2507 4.85768L5.24542 15.8629C5.00027 16.1081 4.8777 16.2306 4.73639 16.3238C4.61102 16.4065 4.47506 16.4718 4.33219 16.5181C4.17115 16.5702 3.99887 16.5894 3.65429 16.6276L0.833984 16.941L1.14735 14.1207Z" stroke="#1570EF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
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
          <ButtonWithIcon v-if="showAddCategoryButton" variant="flat" color="primary" height="44" rounded="4"
            custom-class="font-semibold text-base px-8" label="إضافة تصنيف جديد" prepend-icon="mdi-plus-circle-outline"
            @click="handleAddNewCategory" />

          <!-- Add Subcategory Button - visible only when a main category is selected -->
          <ButtonWithIcon v-if="showAddSubcategoryButton" variant="flat" rounded="4" color="primary-50" height="44"
            custom-class="font-semibold text-base text-primary-700 px-8" label="إضافة تصنيف فرعي جديد"
            prepend-icon="mdi-plus-circle-outline" @click="handleAddSubcategory" />
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
                <TextInput v-model="categoriesSearch" density="comfortable" variant="outlined" hide-details
                  placeholder="بحث" class="mb-4 !text-gray-500" bg-color="gray-50" rounded="lg">
                  <template #prepend-inner>
                    <span class="text-gray-500" v-html="searchIcon"></span>
                  </template>
                </TextInput>
              </div>

              <!-- Categories List -->
              <div class="px-6 pb-4 max-h-[600px] overflow-y-auto space-y-2">
                <CategoryTreeItem 
                  v-for="category in filteredCategories" 
                  :key="category.id"
                  :category="category"
                  :level="0"
                  :selected-category-ids="selectedCategoryIds"
                  :expanded-category-ids="expandedCategoryIds"
                  :is-category-selected="isCategorySelected"
                  :is-category-expanded="isCategoryExpanded"
                  @select="(cat, isSub) => handleCategorySelect(cat, isSub)"
                  @toggle-expand="(id) => toggleCategoryExpand(id)"
                  @update:selected-ids="(ids) => selectedCategoryIds = ids"
                />
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

              <div class="grid gap-6 mb-4 grid-cols-1 md:grid-cols-2">
                <LanguageTabs :languages="availableLanguages" label="الإسم">
                  <template #en>
                    <TextInput v-model="categoryNameEn" placeholder="Enter name in English"
                      :rules="[required(), minLength(2), maxLength(100)]" :hide-details="false"
                      :error-messages="formErrors['name.en']" @input="delete formErrors['name.en']" />
                  </template>
                  <template #ar>
                    <TextInput v-model="categoryNameAr" placeholder="ادخل الاسم بالعربية"
                      :rules="[required(), minLength(2), maxLength(100)]" :hide-details="false"
                      :error-messages="formErrors['name.ar']" @input="delete formErrors['name.ar']" />
                  </template>
                </LanguageTabs>

                <SelectWithIconInput show-add-button clearable v-model="parentCategory" label="التصنيف الرئيسي"
                  placeholder="اختر التصنيف الرئيسي" :items="CategoryDropdownItems" :hide-details="false"
                  :disabled="isSubcategoryMode" />

                <SelectWithIconInput show-add-button clearable v-model="unit" label="الوحدة" placeholder="اختر الوحدة"
                  :items="unitItems" :hide-details="false" />

                <div>
                  <span class="text-sm font-semibold text-gray-700 mb-2 block">الحالة </span>
                  <div class="flex items-center gap-3 mt-1">
                    <v-radio-group v-model="isActive" inline hide-details>
                      <v-radio :value="true" color="primary">
                        <template #label>
                          <span :class="isActive ? 'text-primary font-semibold' : 'text-gray-600'">
                            فعال
                          </span>
                        </template>
                      </v-radio>
                      <v-radio :value="false" color="primary">
                        <template #label>
                          <span :class="!isActive ? 'text-primary font-semibold' : 'text-gray-600'">
                            غير فعال
                          </span>
                        </template>
                      </v-radio>
                    </v-radio-group>
                  </div>
                </div>
              </div>

              <div>
                <!-- Description with Language Tabs -->
                <LanguageTabs :languages="availableLanguages" label="تفاصيل التصنيف" class="mb-[20px]">
                  <template #en>
                    <RichTextEditor v-model="categoryDescriptionEn" placeholder="Enter Category Description in English"
                      min-height="120px" :hide-details="false" :rules="[required()]"
                      :error-messages="formErrors['description.en']" @input="delete formErrors['description.en']" />
                  </template>
                  <template #ar>
                    <RichTextEditor v-model="categoryDescriptionAr" placeholder="ادخل تفاصيل التصنيف بالعربية"
                      min-height="120px" :hide-details="false" :rules="[required()]"
                      :error-messages="formErrors['description.ar']" @input="delete formErrors['description.ar']" />
                  </template>
                </LanguageTabs>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FileUploadInput v-model="categoryImage" label="أرفق صورة" hint="PNG, JPG or GIF (max. 400x400px)"
                  :max-files="1" />
              </div>
            </div>

            <!-- Taxes Section - always visible -->
            <div class="bg-gray-50 rounded-md p-4 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-primary-900">
                  {{ isBulkMode ? 'الضرائب للتصنيفات المحددة' : 'الضرائب' }}
                </h2>
                <div class="w-auto flex justify-start lg:justify-end">
                  <ButtonWithIcon variant="flat" color="primary" height="40"
                    custom-class="font-semibold text-sm px-4 w-full lg:w-auto" label="إضافة ضريبة"
                    :disabled="!isNewTaxValid" @click="addTaxRule" append-icon="mdi-plus" />
                </div>
              </div>

              <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
                <div class="w-full lg:w-auto lg:flex-1 min-w-[250px]">
                  <SelectWithIconInput v-model="newTaxRule.tax_id" label="الضريبة" placeholder="اختر الضريبة"
                    :items="taxNameItems" show-add-button :hide-details="false"
                    :error-messages="formErrors['taxes']" @update:model-value="delete formErrors['taxes']" />
                </div>

                <div class="w-full sm:flex-1 lg:w-auto min-w-[100px]">
                  <TextInput v-model="newTaxRule.percentage" label="النسبة" placeholder="قم باختيار الضريبة"
                    :hide-details="false" readonly disabled />
                </div>

                <div class="w-full sm:flex-1 lg:w-auto min-w-[140px]">
                  <TextInput v-model="newTaxRule.minValue" label="أقل قيمة" placeholder="قم باختيار الضريبة"
                    :hide-details="false" readonly disabled />
                </div>

                <div class="w-full sm:flex-1 lg:w-auto min-w-[140px]">
                  <SelectWithIconInput v-model="newTaxRule.priority" label="الأولوية" placeholder="اختر الأولوية"
                    :items="priorityItems" :hide-details="false" />
                </div>
              </div>

              <div
                class="mt-4 bg-white !rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10)] outline outline-1 outline-offset-[-1px] outline-slate-200 overflow-hidden">
                <h3 class="text-base sm:text-lg font-bold text-gray-900 px-6 py-5">
                  الضرائب المطبقة على التصنيف
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
                      <td class="py-3 px-4">
                        {{ getTaxNameLabel(tax.tax_id) }}
                      </td>
                      <td class="py-3 px-4">
                        {{ tax.percentage || '-' }}
                      </td>
                      <td class="py-3 px-4">
                        {{ tax.minValue || '-' }}
                      </td>
                      <td class="py-3 px-4">
                        <v-chip v-if="tax.priority" size="small" color="primary-50" class="font-semibold"
                          variant="flat">
                          {{ getPriorityLabel(tax.priority) }}
                        </v-chip>
                      </td>
                      <td class="text-center flex gap-2 py-0 px-4 items-center">
                        <ButtonWithIcon :icon="editIcon" icon-only variant="text" color="primary" size="x-small"
                          @click="editTaxRule(index)" />
                        <ButtonWithIcon :icon="trashIcon" icon-only variant="text" color="error" size="x-small"
                          @click="removeTaxRule(index)" />
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
              <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4"
                custom-class="sm:flex-1 font-semibold text-base" :prepend-icon="saveIcon"
                :label="isBulkMode ? 'تطبيق على المحدد' : (isEditing ? 'تحديث' : 'حفظ')" @click="handleSave"
                :loading="isSaving" :disabled="isSaving || isDeleting || (isBulkMode && !taxRules.length)" />

              <!-- Close/Cancel Button -->
              <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4"
                custom-class="sm:flex-1 font-semibold text-base text-primary-700"
                :label="isBulkMode ? 'إلغاء التحديد' : 'إغلاق'" prepend-icon="mdi-close"
                :disabled="isSaving || isDeleting" @click="handleClose" />

              <!-- Bulk Delete Button - visible when multiple categories selected -->
              <ButtonWithIcon v-if="isBulkMode" variant="flat" color="error-50" height="48" rounded="4"
                custom-class="sm:flex-1 font-semibold text-base text-error-700" :prepend-icon="deleteIcon"
                label="حذف المحدد" @click="openBulkDeleteDialog" :loading="isDeleting"
                :disabled="isSaving || isDeleting" />

              <!-- Delete Button - only visible when editing single category -->
              <ButtonWithIcon v-if="isEditing && selectedCategory && !isBulkMode" variant="flat" color="error-50"
                height="48" rounded="4" custom-class="sm:flex-1 font-semibold text-base text-error-700"
                :prepend-icon="deleteIcon" label="حذف" @click="openDeleteDialog" :loading="isDeleting"
                :disabled="isSaving || isDeleting" />
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
    <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="isDeleting" :persistent="true"
      @confirm="confirmBulkDelete">
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

    <!-- Loading Overlay -->
    <v-overlay :model-value="isLoadingPage" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>

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
