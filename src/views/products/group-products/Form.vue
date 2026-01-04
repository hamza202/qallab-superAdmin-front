<script setup lang="ts">
// All imports are now auto-imported:
// - Vue APIs (ref, computed, etc.) from 'vue'
// - Components from 'src/components/common/forms' and 'src/layouts'
// - Validators (required, minLength, etc.) from '@/utils/validators'

import { useNotification } from "@/composables/useNotification";

// Form ref
const formRef = ref<any>(null);
const isFormValid = ref(false);

// Form data
const productCode = ref("#eda23422");
const arabicName = ref("");
const englishName = ref("");
const category = ref(null);
const unit = ref(null);
const isMinUnit = ref(false);
const arabicDescription = ref("");
const englishDescription = ref("");
const productImages = ref<File[] | null>(null);
const purchasePrice = ref("");
const salePrice = ref("");
const maxSalePrice = ref("");
const minSalePrice = ref("");
const halfWholesalePrice = ref("");
const discountType = ref(null);
const discountValue = ref("506.64");

// Sample items for selects
const categoryItems = [
  { title: "اختر التصنيف", value: "" },
  { title: "إلكترونيات", value: "electronics" },
  { title: "ملابس", value: "clothing" },
  { title: "طعام", value: "food" },
];

const unitItems = [
  { title: "اختر الوحدة", value: "" },
  { title: "قطعة", value: "piece" },
  { title: "كيلو", value: "kg" },
  { title: "لتر", value: "liter" },
];

const discountTypeItems = [
  { title: "اختر نوع الخصم", value: "" },
  { title: "نسبة مئوية", value: "percentage" },
  { title: "قيمة ثابتة", value: "fixed" },
];

// Available languages (will be fetched from API in the future)
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

// Tax data
const taxType = ref(null);
const taxPercentage = ref("10%");
const taxMinValue = ref(null);
const taxPriority = ref(null);

const taxTypeItems = [
  { title: "اختر النوع", value: "" },
  { title: "ضريبة القيمة المضافة", value: "vat" },
  { title: "ضريبة المبيعات", value: "sales" },
  { title: "ضريبة الدخل", value: "income" },
];

const taxMinValueItems = [
  { title: "اختر القيمة", value: "" },
  { title: "100", value: "100" },
  { title: "500", value: "500" },
  { title: "1000", value: "1000" },
];

const taxPriorityItems = [
  { title: "اختر الأولوية", value: "" },
  { title: "عالية", value: "high" },
  { title: "متوسطة", value: "medium" },
  { title: "منخفضة", value: "low" },
];

// Supply and Internal Relations Data
const originCountry = ref(null);
const manufacturer = ref(null);
const brand = ref(null);
const relatedProducts = ref(null);
const attachedProducts = ref(null);
const alternativeProducts = ref(null);
const bestSuppliers = ref(null);

// Advanced Product Attributes
const isReturnable = ref(false);
const isRentable = ref(false);
const sellNegative = ref(false);
const isManufacturingProduct = ref(false);
const isHostable = ref(false);
const isNegotiable = ref(false);
const isAvailableForSale = ref(false);
const isAvailableForPurchase = ref(false);
const isAvailableForProjects = ref(false);

// Sample items for new selects
const countryItems = [
  { title: "اختر البلد", value: "" },
  { title: "السعودية", value: "sa" },
  { title: "الإمارات", value: "ae" },
  { title: "مصر", value: "eg" },
];

const manufacturerItems = [
  { title: "اختر المصنع", value: "" },
  { title: "مصنع 1", value: "factory1" },
  { title: "مصنع 2", value: "factory2" },
];

const brandItems = [
  { title: "ادخل العلامة التجارية", value: "" },
  { title: "علامة 1", value: "brand1" },
  { title: "علامة 2", value: "brand2" },
];

const productItems = [
  { title: "اختر المنتج", value: "" },
  { title: "منتج 1", value: "product1" },
  { title: "منتج 2", value: "product2" },
];

const supplierItems = [
  { title: "اختر المورد", value: "" },
  { title: "مورد 1", value: "supplier1" },
  { title: "مورد 2", value: "supplier2" },
];

// Product Variants Data
const selectedSizes = ref<(string | number)[]>([]);
const selectedColors = ref<(string | number)[]>([]);
const subProductsGenerated = ref(false);
const editingRowId = ref<number | null>(null);

const sizeItems = [
  { title: "صغير", value: "small" },
  { title: "وسط", value: "medium" },
  { title: "كبير", value: "large" },
];

const colorItems = [
  { title: "احمر", value: "red" },
  { title: "ابيض", value: "white" },
  { title: "اصفر", value: "yellow" },
];

// Computed to check if category is selected
const isCategorySelected = computed(() => {
  return category.value !== null && category.value !== "";
});

// Get category title
const getCategoryTitle = computed(() => {
  const selectedCategory = categoryItems.find((item) => item.value === category.value);
  return selectedCategory?.title || "منتج";
});

// Get item title by value
const getColorTitle = (value: string | number) => {
  const item = colorItems.find((i) => i.value === value);
  return item?.title || String(value);
};

const getSizeTitle = (value: string | number) => {
  const item = sizeItems.find((i) => i.value === value);
  return item?.title || String(value);
};

// Generate sub products
const generateSubProducts = () => {
  if (selectedColors.value.length === 0 || selectedSizes.value.length === 0) {
    return;
  }

  const products: any[] = [];
  let id = 1;

  selectedColors.value.forEach((color) => {
    selectedSizes.value.forEach((size) => {
      products.push({
        id: id++,
        name: `${getCategoryTitle.value} ${getColorTitle(color)} _ ${getSizeTitle(size)}`,
        sku: "BR-S-BAG-50KG",
        salePrice: "",
        purchasePrice: "",
        isEditing: false,
      });
    });
  });

  subProductsTableItems.value = products;
  subProductsGenerated.value = true;
};

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

// Tax table data
const taxTableHeaders = [
  { key: "name", title: "الضريبة", width: "370px" },
  { key: "percentage", title: "النسبة", width: "176px" },
  { key: "minValue", title: "أقل قيمة", width: "176px" },
  { key: "priority", title: "الأولوية", width: "176px" },
];

const taxTableItems = ref([
  {
    id: 1,
    name: "ضريبة القيمة المضافة",
    percentage: "15%",
    minValue: "150",
    priority: "عالية",
  },
  {
    id: 2,
    name: "ضريبة تأمين",
    percentage: "15%",
    minValue: "150",
    priority: "منخفضة",
  },
  {
    id: 3,
    name: "ضريبة تأمين",
    percentage: "15%",
    minValue: "150",
    priority: "متوسطة",
  },
]);

const handleEditTax = (item: any) => {
  console.log("Edit tax:", item);
};

const handleDeleteTax = (item: any) => {
  taxTableItems.value = taxTableItems.value.filter((t) => t.id !== item.id);
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
];

// Tab helpers
const isTabActive = (tabValue: number) => activeTab.value === tabValue;

// Notification
const { notification, success } = useNotification();

// Copy product code function
const copyProductCode = async () => {
  try {
    await navigator.clipboard.writeText(productCode.value);
    success("تم نسخ كود المنتج بنجاح");
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = productCode.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    success("تم نسخ كود المنتج بنجاح");
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

const handleAddTax = () => {
  console.log("Add tax");
};

const handleSaveAndReturn = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Form is valid! Save and return to home");
  } else {
    console.log("Form has errors");
  }
};

const handleSaveAndCreate = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Form is valid! Save and create new");
    formRef.value?.reset();
  } else {
    console.log("Form has errors");
  }
};

const handleSaveAndContinue = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Form is valid! Save and continue");
  } else {
    console.log("Form has errors");
  }
};

// Icons
const gridIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.1668 20.5836L4.3335 26.0002L25.225 36.446C25.5092 36.5881 25.6513 36.6591 25.8004 36.6871C25.9324 36.7119 26.0679 36.7119 26.1999 36.6871C26.349 36.6591 26.4911 36.5881 26.7753 36.446L47.6668 26.0002L36.8335 20.5836M15.1668 31.4169L4.3335 36.8336L25.225 47.2793C25.5092 47.4214 25.6513 47.4925 25.8004 47.5204C25.9324 47.5452 26.0679 47.5452 26.1999 47.5204C26.349 47.4925 26.4911 47.4214 26.7753 47.2793L47.6668 36.8336L36.8335 31.4169M4.3335 15.1669L25.225 4.72114C25.5092 4.57903 25.6513 4.50797 25.8004 4.48C25.9324 4.45523 26.0679 4.45523 26.1999 4.48C26.349 4.50797 26.4911 4.57903 26.7753 4.72114L47.6668 15.1669L26.7753 25.6126C26.4911 25.7547 26.349 25.8258 26.1999 25.8538C26.0679 25.8785 25.9324 25.8785 25.8004 25.8538C25.6513 25.8258 25.5092 25.7547 25.225 25.6126L4.3335 15.1669Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
const langIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_12786_6371)">
<path d="M1.66669 9.99999H18.3334M1.66669 9.99999C1.66669 14.6024 5.39765 18.3333 10 18.3333M1.66669 9.99999C1.66669 5.39762 5.39765 1.66666 10 1.66666M18.3334 9.99999C18.3334 14.6024 14.6024 18.3333 10 18.3333M18.3334 9.99999C18.3334 5.39762 14.6024 1.66666 10 1.66666M10 1.66666C12.0844 3.94862 13.269 6.91002 13.3334 9.99999C13.269 13.09 12.0844 16.0514 10 18.3333M10 1.66666C7.91562 3.94862 6.73106 6.91002 6.66669 9.99999C6.73106 13.09 7.91562 16.0514 10 18.3333" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_12786_6371">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>
`;

const returnIcon = `<svg width="17" height="13" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.833332 4.16671H12.0833C14.1544 4.16671 15.8333 5.84564 15.8333 7.91671C15.8333 9.98778 14.1544 11.6667 12.0833 11.6667H8.33333M0.833332 4.16671L4.16667 0.833374M0.833332 4.16671L4.16667 7.50004" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.08333 0.750122H10.4788C10.8864 0.750122 11.0902 0.750122 11.2821 0.796172C11.4521 0.837 11.6147 0.904341 11.7638 0.995722C11.932 1.09879 12.0761 1.24292 12.3644 1.53117L14.969 4.13574C15.2572 4.42399 15.4013 4.56812 15.5044 4.73631C15.5958 4.88543 15.6631 5.04801 15.7039 5.21807C15.75 5.40988 15.75 5.61371 15.75 6.02136V12.4168M8.66667 6.58346H5.41667C4.94996 6.58346 4.7166 6.58346 4.53834 6.49263C4.38154 6.41273 4.25406 6.28525 4.17416 6.12845C4.08333 5.95019 4.08333 5.71683 4.08333 5.25012V3.66679M9.5 15.7501V12.0835C9.5 11.6167 9.5 11.3834 9.40917 11.2051C9.32928 11.0483 9.20179 10.9208 9.04499 10.8409C8.86673 10.7501 8.63338 10.7501 8.16667 10.7501H5.41667C4.94996 10.7501 4.7166 10.7501 4.53834 10.8409C4.38154 10.9208 4.25406 11.0483 4.17416 11.2051C4.08333 11.3834 4.08333 11.6167 4.08333 12.0835V15.7501M12.8333 6.71907V13.0835C12.8333 14.0169 12.8333 14.4836 12.6517 14.8401C12.4919 15.1537 12.2369 15.4087 11.9233 15.5685C11.5668 15.7501 11.1001 15.7501 10.1667 15.7501H3.41667C2.48325 15.7501 2.01654 15.7501 1.66002 15.5685C1.34641 15.4087 1.09144 15.1537 0.931656 14.8401C0.75 14.4836 0.75 14.0169 0.75 13.0835V6.33346C0.75 5.40003 0.75 4.93332 0.931656 4.5768C1.09144 4.2632 1.34641 4.00823 1.66002 3.84844C2.01654 3.66679 2.48325 3.66679 3.41667 3.66679H9.78105C9.98487 3.66679 10.0868 3.66679 10.1827 3.68981C10.2677 3.71023 10.349 3.7439 10.4236 3.78959C10.5077 3.84112 10.5797 3.91319 10.7239 4.05731L12.4428 5.77626C12.5869 5.92039 12.659 5.99245 12.7105 6.07655C12.7562 6.15111 12.7899 6.2324 12.8103 6.31743C12.8333 6.41333 12.8333 6.51525 12.8333 6.71907Z" stroke="#175CD3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const arrowLeftIcon = `<svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.1667 5.83337H0.833344M0.833344 5.83337L5.83334 10.8334M0.833344 5.83337L5.83334 0.833374" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="white" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <default-layout>
    <div class="form-validation-page">
      <!-- Header -->
      <PageHeader
        :icon="gridIcon"
        title-key="pages.groupProducts.title"
        description-key="pages.groupProducts.description"
      />

      <!-- Tabs -->
      <div
        class="flex lg:items-center lg:justify-between py-4 border-y border-gray-200 flex-col lg:flex-row gap-3 mb-4"
      >
        <!-- Tabs -->
        <div class="flex gap-2 overflow-y-auto">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'flex items-center gap-2 px-3.5 py-2.5 rounded-md transition-all',
              isTabActive(tab.value)
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:bg-gray-50',
            ]"
          >
            <span v-html="tab.icon" class="w-6 h-6"></span>
            <span class="text-base font-semibold whitespace-nowrap">{{
              tab.title
            }}</span>
          </button>
        </div>

        <div class="flex items-center lg:gap-3 gap-2">
          <!-- Label -->
          <span class="text-sm font-semibold text-gray-700">كود المنتج</span>
          <!-- Product Code Badge -->
          <div
            class="flex items-center gap-2 px-2.5 py-1.5 bg-primary-100 border border-primary-300 rounded shadow-xs"
          >
            <button
              @click="copyProductCode"
              class="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.6667 1.89111V5.33323C11.6667 5.79994 11.6667 6.0333 11.7575 6.21156C11.8374 6.36836 11.9649 6.49584 12.1217 6.57574C12.3 6.66656 12.5333 6.66656 13 6.66656H16.4422M11.6667 14.1665H6.66671M13.3334 10.8332H6.66671M16.6667 8.32336V14.3332C16.6667 15.7333 16.6667 16.4334 16.3942 16.9681C16.1545 17.4386 15.7721 17.821 15.3017 18.0607C14.7669 18.3332 14.0668 18.3332 12.6667 18.3332H7.33337C5.93324 18.3332 5.23318 18.3332 4.6984 18.0607C4.22799 17.821 3.84554 17.4386 3.60586 16.9681C3.33337 16.4334 3.33337 15.7333 3.33337 14.3332V5.6665C3.33337 4.26637 3.33337 3.56631 3.60586 3.03153C3.84554 2.56112 4.22799 2.17867 4.6984 1.93899C5.23318 1.6665 5.93324 1.6665 7.33337 1.6665H10.0099C10.6213 1.6665 10.9271 1.6665 11.2148 1.73558C11.4699 1.79682 11.7137 1.89783 11.9374 2.0349C12.1897 2.18951 12.4059 2.4057 12.8383 2.83808L15.4951 5.49493C15.9275 5.92731 16.1437 6.1435 16.2983 6.39579C16.4354 6.61947 16.5364 6.86333 16.5976 7.11842C16.6667 7.40614 16.6667 7.71188 16.6667 8.32336Z"
                  stroke="#1849A9"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
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
              <div
                class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-3 bg-gray-50 rounded-lg p-3"
              >
                <!-- Right Column: Prices Section -->
                <div class="lg:col-span-4 order-2 lg:order-1">
                  <div class="bg-gray-100 rounded-lg p-6">
                    <!-- Prices Header -->
                    <div class="flex items-center gap-3 mb-6">
                      <div
                        class="w-[38px] h-[38px] bg-primary-500 rounded flex items-center justify-center"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_852_47730)">
                            <path
                              d="M11.2749 6.95972C10.7979 7.29979 10.2141 7.49984 9.58366 7.49984C7.97283 7.49984 6.66699 6.194 6.66699 4.58317C6.66699 2.97234 7.97283 1.6665 9.58366 1.6665C10.6278 1.6665 11.5438 2.21518 12.0591 3.03996M5.00033 16.7391H7.17557C7.45918 16.7391 7.74106 16.7729 8.016 16.8404L10.3144 17.3989C10.8131 17.5204 11.3326 17.5322 11.8366 17.4343L14.3778 16.9399C15.0491 16.8092 15.6666 16.4877 16.1506 16.0169L17.9486 14.2679C18.462 13.7693 18.462 12.9602 17.9486 12.4607C17.4863 12.011 16.7543 11.9604 16.2313 12.3418L14.1358 13.8705C13.8357 14.0899 13.4706 14.208 13.095 14.208H11.0716L12.3595 14.208C13.0855 14.208 13.6735 13.6359 13.6735 12.9298V12.6741C13.6735 12.0878 13.2633 11.5765 12.6787 11.4347L10.6908 10.9513C10.3673 10.8728 10.036 10.8332 9.70294 10.8332C8.89893 10.8332 7.44357 11.4988 7.44357 11.4988L5.00033 12.5206M16.667 5.4165C16.667 7.02733 15.3612 8.33317 13.7503 8.33317C12.1395 8.33317 10.8337 7.02733 10.8337 5.4165C10.8337 3.80567 12.1395 2.49984 13.7503 2.49984C15.3612 2.49984 16.667 3.80567 16.667 5.4165ZM1.66699 12.1665L1.66699 16.9998C1.66699 17.4665 1.66699 17.6999 1.75782 17.8782C1.83771 18.035 1.9652 18.1624 2.122 18.2423C2.30026 18.3332 2.53361 18.3332 3.00033 18.3332H3.66699C4.1337 18.3332 4.36706 18.3332 4.54532 18.2423C4.70212 18.1624 4.8296 18.035 4.9095 17.8782C5.00033 17.6999 5.00033 17.4665 5.00033 16.9998V12.1665C5.00033 11.6998 5.00033 11.4664 4.9095 11.2882C4.8296 11.1314 4.70212 11.0039 4.54532 10.924C4.36706 10.8332 4.1337 10.8332 3.66699 10.8332L3.00033 10.8332C2.53362 10.8332 2.30026 10.8332 2.122 10.924C1.9652 11.0039 1.83771 11.1314 1.75782 11.2882C1.66699 11.4664 1.66699 11.6998 1.66699 12.1665Z"
                              stroke="white"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
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
                      <PriceInput
                        v-model="purchasePrice"
                        label="سعر الشراء"
                        placeholder="ادخل السعر"
                        :rules="[required(), numeric(), positive()]"
                        :hide-details="false"
                      />
                      <PriceInput
                        v-model="salePrice"
                        label="سعر البيع"
                        placeholder="ادخل السعر"
                        :rules="[required(), numeric(), positive()]"
                        :hide-details="false"
                      />
                      <div class="grid grid-cols-2 gap-[14px]">
                        <PriceInput
                          v-model="minSalePrice"
                          label="أقل سعر بيع"
                          placeholder="ادخل السعر"
                          :rules="[numeric(), positive()]"
                          :hide-details="false"
                        />
                        <PriceInput
                          v-model="maxSalePrice"
                          label="أعلى سعر بيع"
                          placeholder="ادخل السعر"
                          :rules="[numeric(), positive()]"
                          :hide-details="true"
                        />
                      </div>
                      <PriceInput
                        v-model="halfWholesalePrice"
                        label="هامش الربح"
                        placeholder="هامش الربح"
                        :rules="[numeric(), positive()]"
                        :hide-details="true"
                      />

                      <!-- Discount Section -->
                      <div>
                        <SelectInput
                          v-model="discountType"
                          label="نوع الخصم"
                          placeholder="اختر نوع الخصم"
                          :items="discountTypeItems"
                        />
                      </div>
                      <div>
                        <div
                          class="mb-[7px] text-sm font-semibold text-gray-700"
                        >
                          قيمة الخصم
                        </div>
                        <div
                          class="bg-gray-200 border border-gray-300 rounded-lg px-3 py-2 min-h-[44px] font-semibold text-primary-900 flex items-center justify-end"
                        >
                          <p class="text-base dir-ltr font-semibold">
                            {{ discountValue }} $
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Left Column: Product Info Section -->
                <div class="lg:col-span-8 order-1 lg:order-2">
                  <div class="p-6">
                    <!-- Product Info Header -->
                    <div
                      class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="w-[38px] h-[38px] bg-primary-500 rounded flex items-center justify-center"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.6663 9.1665H6.66634M8.33301 12.4998H6.66634M13.333 5.83317H6.66634M16.6663 5.6665V14.3332C16.6663 15.7333 16.6663 16.4334 16.3939 16.9681C16.1542 17.4386 15.7717 17.821 15.3013 18.0607C14.7665 18.3332 14.0665 18.3332 12.6663 18.3332H7.33301C5.93288 18.3332 5.23281 18.3332 4.69803 18.0607C4.22763 17.821 3.84517 17.4386 3.60549 16.9681C3.33301 16.4334 3.33301 15.7333 3.33301 14.3332V5.6665C3.33301 4.26637 3.33301 3.56631 3.60549 3.03153C3.84517 2.56112 4.22763 2.17867 4.69803 1.93899C5.23281 1.6665 5.93288 1.6665 7.33301 1.6665H12.6663C14.0665 1.6665 14.7665 1.6665 15.3013 1.93899C15.7717 2.17867 16.1542 2.56112 16.3939 3.03153C16.6663 3.56631 16.6663 4.26637 16.6663 5.6665Z"
                              stroke="white"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        <h2 class="text-lg font-bold text-primary-900">
                          المعلومات العامة للمنتج
                        </h2>
                      </div>
                      <div class="flex items-center gap-4">
                        <v-btn
                          variant="flat"
                          color="primary-700"
                          height="40"
                          class="font-semibold text-base"
                          @click="handleAddLanguage"
                        >
                          <span>أضف لغة جديدة</span>
                          <template #prepend>
                            <span v-html="langIcon"></span>
                          </template>
                        </v-btn>
                      </div>
                    </div>

                    <!-- Name Fields with Language Tabs -->
                    <LanguageTabs
                      :languages="availableLanguages"
                      label="الإسم"
                      class="mb-[20px]"
                    >
                      <template #en>
                        <TextInput
                          v-model="englishName"
                          placeholder="Enter name in English"
                          :rules="[
                            required('englishNameRequired'),
                            minLength(2),
                            maxLength(100),
                          ]"
                          :hide-details="true"
                        />
                      </template>
                      <template #ar>
                        <TextInput
                          v-model="arabicName"
                          placeholder="ادخل الاسم بالعربية"
                          :rules="[
                            required('arabicNameRequired'),
                            minLength(2),
                            maxLength(100),
                            arabicOnly(),
                          ]"
                          :hide-details="true"
                        />
                      </template>
                    </LanguageTabs>

                    <!-- Category and Unit -->
                    <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-[20px]"
                    >
                      <SelectWithIconInput
                        v-model="category"
                        label="التصنيف"
                        placeholder="اختر التصنيف"
                        :items="categoryItems"
                        :rules="[required()]"
                        :hide-details="false"
                        show-add-button
                        @add-click="handleAddCategory"
                      />
                      <div class="flex flex-col">
                        <SelectWithIconInput
                          v-model="unit"
                          label="الوحدة"
                          placeholder="اختر الوحدة"
                          :items="unitItems"
                          :rules="[required()]"
                          :hide-details="false"
                          show-add-button
                          @add-click="handleAddUnit"
                        />
                        <CheckboxInput
                          v-model="isMinUnit"
                          label="اقل وحدة"
                          color="primary"
                          classes="mt-2"
                        />
                      </div>
                    </div>

                    <!-- Description with Language Tabs -->
                    <LanguageTabs
                      :languages="availableLanguages"
                      label="الوصف"
                      class="mb-[20px]"
                    >
                      <template #en>
                        <RichTextEditor
                          v-model="englishDescription"
                          placeholder="Enter description in English"
                          min-height="120px"
                          :hide-details="false"
                        />
                      </template>
                      <template #ar>
                        <RichTextEditor
                          v-model="arabicDescription"
                          placeholder="ادخل الوصف بالعربية"
                          min-height="120px"
                          :hide-details="false"
                        />
                      </template>
                    </LanguageTabs>

                    <!-- Product Image Section -->
                    <div>
                      <FileUploadInput
                        v-model="productImages"
                        label="صورة المنتج"
                        hint="PNG, JPG or GIF (max. 400x400px)"
                        :max-files="4"
                        layout="horizontal"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Warning Message - Only show when category is NOT selected -->
              <div
                v-if="!isCategorySelected"
                class="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6 flex items-center gap-3"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="#DC6803"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <p class="text-sm font-bold text-warning-600">
                  يجب عليك اختيار التصنيف لاضافة مجموعة منتجات
                </p>
              </div>
            </div>

            <!-- Product Variants Section - Only show when category is selected -->
            <template v-if="isCategorySelected">
              <div class="bg-primary-50 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-bold text-primary-800 text-right mb-6">
                  متغيرات المنتج
                </h3>
                <div class="flex gap-5 items-end flex-wrap">
                  <div class="max-w-[320px]">
                    <MultipleSelectInput
                      v-model="selectedSizes"
                      label="المقاس"
                      :items="sizeItems"
                      placeholder="اختر المقاس"
                    />
                  </div>
                  <div class="max-w-[320px]">
                    <MultipleSelectInput
                      v-model="selectedColors"
                      label="اللون"
                      :items="colorItems"
                      placeholder="اختر اللون"
                    />
                  </div>
                  <div class="max-w-[320px]">
                    <v-btn
                      variant="flat"
                      color="primary"
                      height="44"
                      class="font-semibold text-sm w-full"
                      @click="generateSubProducts"
                    >
                      <template #append>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 4.16667V15.8333M4.16667 10H15.8333"
                            stroke="white"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </template>
                      انشاء منتجات فرعية
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Sub Products Table Section - Only show after generate -->
              <div v-if="subProductsGenerated" class="mb-6">
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
                      <tr 
                        v-for="item in subProductsTableItems" 
                        :key="item.id"
                        class="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td class="px-6 py-4 text-right text-sm font-medium text-gray-600">{{ item.name }}</td>
                        <td class="px-6 py-4 text-center text-sm font-medium text-gray-600">{{ item.sku }}</td>
                        <td class="px-2 py-4 text-center">
                          <template v-if="editingRowId === item.id">
                            <input
                              v-model="item.salePrice"
                              type="number"
                              class="w-[110px] px-3 py-2 text-center text-sm border-2 border-solid bg-white border-primary-400 rounded-lg focus:outline-none focus:border-primary-500"
                              placeholder="0"
                            />
                          </template>
                          <template v-else>
                            <span class="text-sm font-medium text-gray-600">
                              {{ item.salePrice ? item.salePrice + ' ريال' : '-' }}
                            </span>
                          </template>
                        </td>
                        <td class="px-2 py-4 text-center">
                          <template v-if="editingRowId === item.id">
                            <input
                              v-model="item.purchasePrice"
                              type="number"
                              class="w-[110px] px-3 py-2 text-center text-sm border-2 border-solid bg-white border-primary-400 rounded-lg focus:outline-none focus:border-primary-500"
                              placeholder="0"
                            />
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
                              <button
                                @click="saveEditingRow"
                                class="bg-primary-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-600 transition-colors"
                              >
                                تعديل
                              </button>
                            </template>
                            <template v-else>
                              <button
                                @click="startEditingRow(item)"
                                class="p-2 rounded hover:bg-gray-100 transition-colors"
                              >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2.39735 15.0963C2.43564 14.7517 2.45478 14.5794 2.50691 14.4184C2.55316 14.2755 2.61851 14.1396 2.70118 14.0142C2.79436 13.8729 2.91694 13.7503 3.16209 13.5052L14.1673 2.49992C15.0878 1.57945 16.5802 1.57945 17.5007 2.49993C18.4211 3.4204 18.4211 4.91279 17.5007 5.83326L6.49542 16.8385C6.25027 17.0836 6.1277 17.2062 5.98639 17.2994C5.86102 17.3821 5.72506 17.4474 5.58219 17.4937C5.42115 17.5458 5.24887 17.5649 4.90429 17.6032L2.08398 17.9166L2.39735 15.0963Z" stroke="#1570EF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                              </button>
                              <button
                                @click="deleteSubProductRow(item)"
                                class="p-2 rounded hover:bg-gray-100 transition-colors"
                              >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.3333 4.99984V4.33317C13.3333 3.39975 13.3333 2.93304 13.1517 2.57652C12.9919 2.26292 12.7369 2.00795 12.4233 1.84816C12.0668 1.6665 11.6001 1.6665 10.6667 1.6665H9.33333C8.39991 1.6665 7.9332 1.6665 7.57668 1.84816C7.26308 2.00795 7.00811 2.26292 6.84832 2.57652C6.66667 2.93304 6.66667 3.39975 6.66667 4.33317V4.99984M8.33333 9.58317V13.7498M11.6667 9.58317V13.7498M2.5 4.99984H17.5M15.8333 4.99984V14.3332C15.8333 15.7333 15.8333 16.4334 15.5608 16.9681C15.3212 17.4386 14.9387 17.821 14.4683 18.0607C13.9335 18.3332 13.2335 18.3332 11.8333 18.3332H8.16667C6.76654 18.3332 6.06647 18.3332 5.53169 18.0607C5.06129 17.821 4.67883 17.4386 4.43915 16.9681C4.16667 16.4334 4.16667 15.7333 4.16667 14.3332V4.99984" stroke="#D92D20" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                              </button>
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
              <v-btn
                variant="flat"
                color="primary"
                height="48"
                class="font-semibold text-base px-6"
                @click="handleSaveAndReturn"
              >
                <template #prepend>
                  <span v-html="returnIcon"></span>
                </template>
                <span>حفظ والعودة للرئيسية</span>
              </v-btn>

              <v-btn
                variant="flat"
                color="primary-50"
                height="48"
                class="font-semibold text-base text-primary-700 px-6"
                @click="handleSaveAndCreate"
              >
                <template #prepend>
                  <span v-html="saveIcon"></span>
                </template>
                <span>حفظ وإنشاء جديد</span>
              </v-btn>

              <v-btn
                variant="flat"
                color="primary-50"
                height="48"
                class="font-semibold text-base text-primary-700 px-6"
                @click="handleSaveAndContinue"
              >
                <template #prepend>
                  <span v-html="arrowLeftIcon"></span>
                </template>
                <span>حفظ وإكمال</span>
              </v-btn>
            </div>
          </v-form>
        </v-tabs-window-item>

        <!-- Tab 2: بيانات الضرائب -->
        <v-tabs-window-item :value="1">
          <div class="mx-auto">
            <div class="-mx-6">
              <h3
                class="text-lg font-bold text-gray-900 bg-gray-25 border-t-gray-300 border-t px-6 py-3"
              >
                الضرائب المطبقة على المنتج
              </h3>
              <!-- Tax Fields Row -->
              <div
                class="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-3 gap-4 items-end px-6 bg-primary-50 py-3 border-t border-t-gray-300"
              >
                <SelectWithIconInput
                  v-model="taxType"
                  placeholder="اختر النوع"
                  :items="taxTypeItems"
                  :hide-details="true"
                  show-add-button
                  @add-click="handleAddTaxType"
                />
                <TextInput
                  v-model="taxPercentage"
                  placeholder="النسبة"
                  :hide-details="true"
                  disabled
                />
                <SelectInput
                  v-model="taxMinValue"
                  placeholder="اختر القيمة"
                  :items="taxMinValueItems"
                  :hide-details="true"
                />
                <SelectInput
                  v-model="taxPriority"
                  placeholder="اختر الأولوية"
                  :items="taxPriorityItems"
                  :hide-details="true"
                />
                <v-btn
                  variant="flat"
                  color="primary"
                  height="44"
                  class="font-semibold text-sm"
                  @click="handleAddTax"
                >
                  <span>اضافة ضريبة</span>
                  <template #append>
                    <span v-html="plusIcon"></span>
                  </template>
                </v-btn>
              </div>

              <!-- Tax Table -->
              <DataTable
                :headers="taxTableHeaders"
                :items="taxTableItems"
                show-checkbox
                show-actions
                @edit="handleEditTax"
                @delete="handleDeleteTax"
              />
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
              <SelectWithIconInput
                v-model="originCountry"
                label="بلد المنشأ"
                placeholder="اختر البلد"
                :items="countryItems"
                :hide-details="true"
                show-add-button
                @add-click="handleAddCountry"
              />
              <SelectWithIconInput
                v-model="manufacturer"
                label="المصنع"
                placeholder="اختر المصنع"
                :items="manufacturerItems"
                :hide-details="true"
                show-add-button
                @add-click="handleAddManufacturer"
              />
              <SelectWithIconInput
                v-model="brand"
                label="العلامة التجارية"
                placeholder="ادخل العلامة التجارية"
                :items="brandItems"
                :hide-details="true"
                show-add-button
                @add-click="handleAddBrand"
              />
            </div>

            <!-- Row 2: Related, Attached, Alternative Products -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-6">
              <SelectInput
                v-model="relatedProducts"
                label="المنتجات المرتبطة"
                placeholder="اختر المنتج"
                :items="productItems"
                :hide-details="true"
              />
              <SelectInput
                v-model="attachedProducts"
                label="المنتجات الملحقة"
                placeholder="اختر المنتج"
                :items="productItems"
                :hide-details="true"
              />
              <SelectInput
                v-model="alternativeProducts"
                label="المنتجات البديلة"
                placeholder="اختر المنتج"
                :items="productItems"
                :hide-details="true"
              />
            </div>

            <!-- Row 3: Best Suppliers -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
              <SelectInput
                v-model="bestSuppliers"
                label="افضل الموردين"
                placeholder="اختر المورد"
                :items="supplierItems"
                :hide-details="true"
              />
            </div>
          </div>

          <!-- Advanced Product Attributes Section -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-lg font-bold text-primary-900 mb-6 text-right">
              سمات/خصائص المنتج المتقدمة
            </h2>

            <div class="flex flex-wrap gap-8">
              <CheckboxInput
                v-model="isAvailableForProjects"
                label="متاح للمشاريع"
                color="primary"
              />
              <CheckboxInput
                v-model="isAvailableForPurchase"
                label="متاح للشراء"
                color="primary"
              />
              <CheckboxInput
                v-model="isAvailableForSale"
                label="متاح للبيع"
                color="primary"
              />
              <CheckboxInput
                v-model="isNegotiable"
                label="قابل للمفاضلة"
                color="primary"
              />
              <CheckboxInput
                v-model="isHostable"
                label="قابل للاستضافة"
                color="primary"
              />
              <CheckboxInput
                v-model="isReturnable"
                label="قابل للارجاع"
                color="primary"
              />
              <CheckboxInput
                v-model="isRentable"
                label="قابل للايجار"
                color="primary"
              />
              <CheckboxInput
                v-model="sellNegative"
                label="البيع بالسالب"
                color="primary"
              />
              <CheckboxInput
                v-model="isManufacturingProduct"
                label="منتج تصنيع"
                color="primary"
              />
            </div>
          </div>

          <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
            <v-btn
              variant="flat"
              color="primary-50"
              height="48"
              class="font-semibold text-base text-primary-700 px-6 min-w-56"
              @click="handleSaveAndContinue"
            >
              <span>حفظ</span>
            </v-btn>

            <v-btn
              variant="flat"
              color="primary"
              height="48"
              class="min-w-56"
              @click="handleSaveAndCreate"
            >
              <span>حفظ / انشاء جديد</span>
            </v-btn>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <!-- Notification Snackbar -->
    <v-snackbar
      v-model="notification.show"
      :timeout="notification.timeout"
      :color="
        notification.type === 'success'
          ? 'success'
          : notification.type === 'error'
          ? 'error'
          : notification.type === 'warning'
          ? 'warning'
          : 'info'
      "
      location="top end"
    >
      {{ notification.message }}
      <template #actions>
        <v-btn variant="text" @click="notification.show = false"> إغلاق </v-btn>
      </template>
    </v-snackbar>
  </default-layout>
</template>

<style scoped></style>
