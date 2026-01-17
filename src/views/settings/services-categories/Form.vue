<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
import { useApi } from '@/composables/useApi';
import { useRoute } from 'vue-router';
import { useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const { notification, success, error: showError } = useNotification();
const api = useApi();

const formErrors = reactive<Record<string, string>>({});

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);


// =====================
// Types & Interfaces
// =====================
interface TaxRule {
  id: number;
  tax_id: number | null;
  percentage: number | null;
  minValue: number | null;
  priority: number | null;
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

// Mode states - simplified for form page (no bulk operations)
const categoryId = ref<number | null>(null); // Category ID from route query
const isEditing = ref(false);

// =====================
// Form Fields
// =====================
const categoryNameAr = ref("");
const categoryNameEn = ref("");
const parentCategory = ref<number | null>(null);
const unit = ref<string | null>(null);
const categoryDescriptionEn = ref("");
const categoryDescriptionAr = ref("");
const categoryImage = ref<File[] | null>(null);
const isActive = ref(true);

// =====================
// Categories Data
// =====================
const categoriesList = ref<Array<{ title: string; value: number | string }>>([]);

// =====================
// Dropdown Items
// =====================
const unitItems = ref<Array<{ title: string; value: number | string }>>([]);
const taxNameItems = ref<Array<{ title: string; value: number | string }>>([]);
const taxesData = ref<Array<any>>([]);

const priorityItems = ref<Array<{ title: string; value: number | string }>>([]);

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
  return !!(t.tax_id && t.priority);
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

// =====================
// Helper Functions
// =====================
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

const returnToList = () => {
  router.push({ name: "ServicesCategoriesList" });
}

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
  categoryDescriptionEn.value = "";
  categoryDescriptionAr.value = "";
  categoryImage.value = null;
  isActive.value = true;
  taxRules.value = [];
  resetNewTaxRule();
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
  formRef.value?.resetValidation();
};

// =====================
// API: Fetch Constants (Taxes, Units, Categories)
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

const fetchTaxs = async () => {
  try {
    // Real API call to get all taxes
    const response = await api.get('/admin/taxes/list');

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


const fetchCategories = async () => {
  try {
    // Real API call to get all categories
    const response = await api.get('/admin/service-categories/list');

    // Populate categories dropdown
    categoriesList.value = [
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
// Save Category (Create or Update)
// =====================
const handleSave = async () => {
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
  
  const { valid } = await formRef.value?.validate();
  if (!valid) {
    console.log("Form has errors");
    return;
  }

  isSaving.value = true;

  try {
    // Prepare payload matching API structure
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

    if (isEditing.value && categoryId.value) {
      // If image exists, use FormData
      if (payload.image) {
        const formData = new FormData();
        formData.append('_method', "PUT");
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

        await api.upload(`/admin/service-categories/${categoryId.value}`, formData);
      } else {
        await api.put(`/admin/service-categories/${categoryId.value}`, payload);
      }
      success('تم تحديث التصنيف بنجاح');
    } else {
      // Create new category
      // If image exists, use FormData
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
      success('تم إضافة التصنيف بنجاح');
    }

    // Reset form and redirect or close
    resetForm();
    categoryId.value = null;
    isEditing.value = false;

    returnToList()
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
// Delete Category
// =====================
const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

const handleDeleteClick = () => {
  showDeleteDialog.value = true;
};

const handleDeleteConfirm = async () => {
  if (!categoryId.value) return;

  deleteLoading.value = true;
  try {
    await api.delete(`/admin/service-categories/${categoryId.value}`);
    success('تم حذف التصنيف بنجاح');
    returnToList();
  } catch (error) {
    console.error('Failed to delete category:', error);
    showError('حدث خطأ أثناء حذف التصنيف');
  } finally {
    deleteLoading.value = false;
    showDeleteDialog.value = false;
  }
};

const handleDeleteCancel = () => {
  showDeleteDialog.value = false;
};

// =====================
// Close Form
// =====================
const handleClose = () => {
  resetForm();
  categoryId.value = null;
  isEditing.value = false;
  returnToList()
};


// =====================
// Lifecycle: Initialize form
// =====================
onMounted(async () => {
  isLoading.value = true;
  try {
    // Fetch constants (taxes, units, categories)
    await Promise.all([
      fetchConstants(),
      fetchCategories(),
      fetchTaxs(),
      fetchUnits()
    ]);

    // Check if editing mode from route params
    const id = route.params.id;
    if (id) {
      categoryId.value = parseInt(id as string);
      isEditing.value = true;
      await fetchCategoryDetails(categoryId.value);
    }
  } finally {
    isLoading.value = false;
  }
});

const categoriesIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 30.1667C27.2565 30.1667 30.1667 27.2565 30.1667 23.6667C30.1667 20.0768 27.2565 17.1667 23.6667 17.1667C20.0768 17.1667 17.1667 20.0768 17.1667 23.6667C17.1667 27.2565 20.0768 30.1667 23.6667 30.1667Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M38.2424 29.5758C37.9802 30.1698 37.902 30.8289 38.0179 31.4678C38.1337 32.1068 38.4383 32.6964 38.8924 33.1606L39.0106 33.2788C39.3769 33.6446 39.6674 34.0791 39.8657 34.5574C40.0639 35.0356 40.166 35.5482 40.166 36.0659C40.166 36.5836 40.0639 37.0962 39.8657 37.5745C39.6674 38.0527 39.3769 38.4872 39.0106 38.853C38.6447 39.2193 38.2103 39.5099 37.732 39.7081C37.2538 39.9064 36.7412 40.0084 36.2235 40.0084C35.7058 40.0084 35.1932 39.9064 34.7149 39.7081C34.2367 39.5099 33.8022 39.2193 33.4364 38.853L33.3182 38.7348C32.854 38.2808 32.2644 37.9761 31.6254 37.8603C30.9864 37.7444 30.3274 37.8226 29.7333 38.0848C29.1508 38.3345 28.6539 38.7491 28.3039 39.2776C27.954 39.806 27.7662 40.4253 27.7636 41.0591V41.3939C27.7636 42.4387 27.3486 43.4407 26.6098 44.1795C25.871 44.9183 24.869 45.3333 23.8242 45.3333C22.7794 45.3333 21.7774 44.9183 21.0387 44.1795C20.2999 43.4407 19.8848 42.4387 19.8848 41.3939V41.2167C19.8696 40.5647 19.6586 39.9324 19.2792 39.402C18.8998 38.8716 18.3696 38.4675 17.7576 38.2424C17.1635 37.9802 16.5045 37.902 15.8655 38.0179C15.2265 38.1337 14.6369 38.4383 14.1727 38.8924L14.0545 39.0106C13.6887 39.3769 13.2542 39.6674 12.776 39.8657C12.2977 40.0639 11.7851 40.166 11.2674 40.166C10.7497 40.166 10.2371 40.0639 9.75887 39.8657C9.28064 39.6674 8.84617 39.3769 8.4803 39.0106C8.11403 38.6447 7.82347 38.2103 7.62522 37.732C7.42697 37.2538 7.32493 36.7412 7.32493 36.2235C7.32493 35.7058 7.42697 35.1932 7.62522 34.7149C7.82347 34.2367 8.11403 33.8022 8.4803 33.4364L8.59848 33.3182C9.05257 32.854 9.35718 32.2644 9.47304 31.6254C9.58889 30.9864 9.51068 30.3274 9.24848 29.7333C8.9988 29.1508 8.58422 28.6539 8.05576 28.3039C7.52731 27.954 6.90806 27.7662 6.27424 27.7636H5.93939C4.8946 27.7636 3.8926 27.3486 3.15382 26.6098C2.41504 25.871 2 24.869 2 23.8242C2 22.7794 2.41504 21.7774 3.15382 21.0387C3.8926 20.2999 4.8946 19.8848 5.93939 19.8848H6.11667C6.76863 19.8696 7.40092 19.6586 7.93135 19.2792C8.46177 18.8998 8.8658 18.3696 9.09091 17.7576C9.35311 17.1635 9.43132 16.5045 9.31546 15.8655C9.19961 15.2265 8.895 14.6369 8.44091 14.1727L8.32273 14.0545C7.95646 13.6887 7.66589 13.2542 7.46764 12.776C7.2694 12.2977 7.16736 11.7851 7.16736 11.2674C7.16736 10.7497 7.2694 10.2371 7.46764 9.75887C7.66589 9.28064 7.95646 8.84617 8.32273 8.4803C8.68859 8.11403 9.12306 7.82347 9.6013 7.62522C10.0795 7.42697 10.5922 7.32493 11.1098 7.32493C11.6275 7.32493 12.1402 7.42697 12.6184 7.62522C13.0966 7.82347 13.5311 8.11403 13.897 8.4803L14.0152 8.59848C14.4794 9.05257 15.069 9.35718 15.7079 9.47304C16.3469 9.58889 17.0059 9.51068 17.6 9.24848H17.7576C18.3402 8.9988 18.837 8.58422 19.187 8.05576C19.5369 7.52731 19.7247 6.90806 19.7273 6.27424V5.93939C19.7273 4.8946 20.1423 3.8926 20.8811 3.15382C21.6199 2.41504 22.6219 2 23.6667 2C24.7115 2 25.7135 2.41504 26.4522 3.15382C27.191 3.8926 27.6061 4.8946 27.6061 5.93939V6.11667C27.6086 6.75049 27.7964 7.36974 28.1464 7.89819C28.4963 8.42664 28.9932 8.84122 29.5758 9.09091C30.1698 9.35311 30.8289 9.43132 31.4678 9.31546C32.1068 9.19961 32.6964 8.895 33.1606 8.44091L33.2788 8.32273C33.6446 7.95646 34.0791 7.66589 34.5574 7.46764C35.0356 7.2694 35.5482 7.16736 36.0659 7.16736C36.5836 7.16736 37.0962 7.2694 37.5745 7.46764C38.0527 7.66589 38.4872 7.95646 38.853 8.32273C39.2193 8.68859 39.5099 9.12306 39.7081 9.6013C39.9064 10.0795 40.0084 10.5922 40.0084 11.1098C40.0084 11.6275 39.9064 12.1402 39.7081 12.6184C39.5099 13.0966 39.2193 13.5311 38.853 13.897L38.7348 14.0152C38.2808 14.4794 37.9761 15.069 37.8603 15.7079C37.7444 16.3469 37.8226 17.0059 38.0848 17.6V17.7576C38.3345 18.3402 38.7491 18.837 39.2776 19.187C39.806 19.5369 40.4253 19.7247 41.0591 19.7273H41.3939C42.4387 19.7273 43.4407 20.1423 44.1795 20.8811C44.9183 21.6199 45.3333 22.6219 45.3333 23.6667C45.3333 24.7115 44.9183 25.7135 44.1795 26.4522C43.4407 27.191 42.4387 27.6061 41.3939 27.6061H41.2167C40.5828 27.6086 39.9636 27.7964 39.4351 28.1464C38.9067 28.4963 38.4921 28.9932 38.2424 29.5758Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const trashIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6673 4.16732V3.50065C11.6673 2.56723 11.6673 2.10052 11.4857 1.744C11.3259 1.4304 11.0709 1.17543 10.7573 1.01564C10.4008 0.833984 9.93407 0.833984 9.00065 0.833984H7.66732C6.7339 0.833984 6.26719 0.833984 5.91067 1.01564C5.59706 1.17543 5.3421 1.4304 5.18231 1.744C5.00065 2.10052 5.00065 2.56723 5.00065 3.50065V4.16732M6.66732 8.75065V12.9173M10.0007 8.75065V12.9173M0.833984 4.16732H15.834M14.1673 4.16732V13.5007C14.1673 14.9008 14.1673 15.6008 13.8948 16.1356C13.6552 16.606 13.2727 16.9885 12.8023 17.2282C12.2675 17.5007 11.5674 17.5007 10.1673 17.5007H6.50065C5.10052 17.5007 4.40045 17.5007 3.86567 17.2282C3.39527 16.9885 3.01282 16.606 2.77313 16.1356C2.50065 15.6008 2.50065 14.9008 2.50065 13.5007V4.16732" stroke="#D92D20" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const trashIcon_2 = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.5 1H10M1 3.25H14.5M13 3.25L12.474 11.1395C12.3951 12.3232 12.3557 12.915 12.1 13.3638C11.8749 13.7588 11.5354 14.0765 11.1262 14.2748C10.6615 14.5 10.0683 14.5 8.88201 14.5H6.61799C5.43168 14.5 4.83852 14.5 4.37375 14.2748C3.96457 14.0765 3.62507 13.7588 3.39999 13.3638C3.14433 12.915 3.10488 12.3232 3.02596 11.1395L2.5 3.25" stroke="#B42318" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const editIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.14735 14.1207C1.18564 13.7761 1.20478 13.6038 1.25691 13.4428C1.30316 13.2999 1.36851 13.164 1.45118 13.0386C1.54436 12.8973 1.66694 12.7747 1.91209 12.5296L12.9173 1.52434C13.8378 0.603865 15.3302 0.603866 16.2507 1.52434C17.1711 2.44482 17.1711 3.9372 16.2507 4.85768L5.24542 15.8629C5.00027 16.1081 4.8777 16.2306 4.73639 16.3238C4.61102 16.4065 4.47506 16.4718 4.33219 16.5181C4.17115 16.5702 3.99887 16.5894 3.65429 16.6276L0.833984 16.941L1.14735 14.1207Z" stroke="#1570EF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

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
          <!-- Category Form -->
          <div class="bg-gray-50 rounded-md p-4 sm:p-6">
            <div class="mb-4">
              <h2 class="text-lg font-bold text-primary-900">التصنيفات</h2>
            </div>

            <div class="grid gap-4 mb-4 grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
              <div class="md:col-span-2">
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
              </div>

              <SelectWithIconInput show-add-button clearable v-model="parentCategory" label="التصنيف الرئيسي"
                placeholder="اختر التصنيف الرئيسي" :items="categoriesList" :hide-details="false" />

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

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div class="md:col-span-2 flex flex-col gap-3">
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

              <div>
                <FileUploadInput v-model="categoryImage" label="أرفق صورة" hint="PNG, JPG or GIF (max. 400x400px)"
                  :max-files="1" />
              </div>

            </div>
          </div>

          <!-- Taxes Section -->
          <div class="bg-gray-50 rounded-md p-4 sm:p-6">
            <div class="flex items-center justify-between mb-4 gap-3">
              <div class="flex flex-col gap-1">
                <h2 class="text-lg font-bold text-primary-900">الضرائب</h2>
                <span v-if="formErrors['taxes']" class="text-sm text-red-600">{{ formErrors['taxes'] }}</span>
              </div>
              <div class="w-full sm:w-auto flex justify-start sm:justify-end">
                <ButtonWithIcon :append-icon="editingTaxIndex !== null ? 'mdi-pencil' : 'mdi-plus'" variant="flat"
                  color="primary" height="40" custom-class="font-semibold text-sm px-4 w-full sm:w-auto"
                  :label="editingTaxIndex !== null ? 'تعديل ضريبة' : 'اضافة ضريبة'" :disabled="!isNewTaxValid"
                  @click="addTaxRule" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="w-full lg:w-auto lg:flex-1 min-w-[250px]">
                <SelectWithIconInput v-model="newTaxRule.tax_id" label="الضريبة" placeholder="اختر الضريبة"
                  :items="taxNameItems" show-add-button :hide-details="false"
                  @update:model-value="delete formErrors['taxes']" />
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

              <v-table class="rounded-none border border-gray-200">
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
                      <v-chip v-if="tax.priority" size="small" color="primary-50" class="font-semibold" variant="flat">
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

          <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
            <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
              :prepend-icon="saveIcon" :label="isEditing ? 'تحديث' : 'حفظ'" @click="handleSave" :loading="isSaving"
              :disabled="isSaving || isDeleting" />

            <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
              custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق"
              :disabled="isSaving || isDeleting" @click="handleClose" />

            <ButtonWithIcon v-if="isEditing" :prepend-icon="trashIcon_2" variant="flat" color="error-50" rounded="4"
              height="48" custom-class="font-semibold text-base px-6 min-w-56 text-error-700" label="حذف"
              @click="handleDeleteClick" :loading="deleteLoading" :disabled="isSaving || deleteLoading" />
          </div>
        </div>
      </v-form>
    </div>

    <!-- Loading Overlay -->
    <v-overlay :model-value="isLoading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>


    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" :persistent="true" @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel" @close="handleDeleteCancel" />

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
