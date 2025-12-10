<script setup lang="ts">
// All imports are now auto-imported:
// - Vue APIs (ref, computed, etc.) from 'vue'
// - Components from 'src/components/common/forms' and 'src/layouts'
// - Validators (required, minLength, etc.) from '@/utils/validators'

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
const branchPrice = ref("");
const wholesalePrice = ref("");
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

// Tax table data
const taxTableHeaders = [
  { key: "name", title: "الضريبة", width: "370px" },
  { key: "percentage", title: "النسبة", width: "176px" },
  { key: "minValue", title: "أقل قيمة", width: "176px" },
  { key: "priority", title: "الأولوية", width: "176px" },
];

const taxTableItems = ref([
  { id: 1, name: "ضريبة القيمة المضافة", percentage: "15%", minValue: "150", priority: "عالية" },
  { id: 2, name: "ضريبة تأمين", percentage: "15%", minValue: "150", priority: "منخفضة" },
  { id: 3, name: "ضريبة تأمين", percentage: "15%", minValue: "150", priority: "متوسطة" },
]);

const handleEditTax = (item: any) => {
  console.log("Edit tax:", item);
};

const handleDeleteTax = (item: any) => {
  taxTableItems.value = taxTableItems.value.filter((t) => t.id !== item.id);
};

// Tabs
const activeTab = ref(0);
const completedTabs = ref<number[]>([]);
const tabs = [
  { title: "البيانات الاساسية", value: 0 },
  { title: "بيانات الضرائب", value: 1 },
  { title: "بيانات الإضافية", value: 2 },
];

// Tab helpers
const isTabCompleted = (tabValue: number) =>
  completedTabs.value.includes(tabValue);
const isTabActive = (tabValue: number) => activeTab.value === tabValue;

// Watch for tab changes to mark previous tabs as completed
watch(activeTab, (newVal, oldVal) => {
  if (newVal > oldVal && !completedTabs.value.includes(oldVal)) {
    completedTabs.value.push(oldVal);
  }
});

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
    // هنا يمكنك إرسال البيانات للـ API
  } else {
    console.log("Form has errors");
  }
};

const handleSaveAndCreate = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Form is valid! Save and create new");
    // هنا يمكنك إرسال البيانات للـ API ثم إعادة تعيين الفورم
    formRef.value?.reset();
  } else {
    console.log("Form has errors");
  }
};

const handleSaveAndContinue = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Form is valid! Save and continue");
    // هنا يمكنك إرسال البيانات للـ API
  } else {
    console.log("Form has errors");
  }
};

// Icons
const gridIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.8498 26H36.4835C37.6257 26 38.611 25.9999 39.4226 26.0662C40.2791 26.1362 41.1311 26.2907 41.9509 26.7085C43.174 27.3316 44.1684 28.326 44.7915 29.5491C45.2093 30.3689 45.3638 31.2209 45.4338 32.0774C45.5001 32.889 45.5 33.8743 45.5 35.0164V36.4836C45.5 37.6257 45.5001 38.611 45.4338 39.4226C45.3638 40.2791 45.2093 41.1311 44.7915 41.9509C44.1684 43.174 43.174 44.1684 41.9509 44.7915C41.1311 45.2093 40.2791 45.3638 39.4226 45.4338C38.611 45.5001 37.6256 45.5 36.4835 45.5H32.8499C31.7077 45.5 30.7224 45.5001 29.9108 45.4338C29.0542 45.3638 28.2022 45.2093 27.3824 44.7915C26.1593 44.1684 25.165 43.174 24.5418 41.9509C24.1241 41.1311 23.9696 40.2791 23.8996 39.4226C23.8333 38.611 23.8333 37.6257 23.8333 36.4835V35.0165C23.8333 33.8743 23.8333 32.889 23.8996 32.0774C23.9696 31.2209 24.1241 30.3689 24.5418 29.5491C25.165 28.326 26.1593 27.3316 27.3824 26.7085C28.2022 26.2907 29.0542 26.1362 29.9108 26.0662C30.7223 25.9999 31.7077 26 32.8498 26ZM30.2636 30.3852C29.675 30.4333 29.4568 30.5149 29.3497 30.5695C28.942 30.7772 28.6105 31.1087 28.4028 31.5164C28.3482 31.6235 28.2666 31.8417 28.2185 32.4303C28.1684 33.0442 28.1667 33.8508 28.1667 35.1V36.4C28.1667 37.6492 28.1684 38.4558 28.2185 39.0697C28.2666 39.6583 28.3482 39.8765 28.4028 39.9836C28.6105 40.3913 28.942 40.7228 29.3497 40.9305C29.4568 40.9851 29.675 41.0667 30.2636 41.1148C30.8775 41.165 31.6841 41.1667 32.9333 41.1667H36.4C37.6492 41.1667 38.4558 41.165 39.0697 41.1148C39.6583 41.0667 39.8765 40.9851 39.9836 40.9305C40.3913 40.7228 40.7228 40.3913 40.9305 39.9836C40.9851 39.8765 41.0667 39.6583 41.1148 39.0697C41.165 38.4558 41.1667 37.6492 41.1667 36.4V35.1C41.1667 33.8508 41.165 33.0442 41.1148 32.4303C41.0667 31.8417 40.9851 31.6235 40.9305 31.5164C40.7228 31.1087 40.3913 30.7772 39.9836 30.5695C39.8765 30.5149 39.6583 30.4333 39.0697 30.3852C38.4558 30.335 37.6492 30.3333 36.4 30.3333H32.9333C31.6841 30.3333 30.8775 30.335 30.2636 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9016 6.49983C13.0767 6.49918 12.3664 6.49861 11.7319 6.62483C9.15341 7.13772 7.13778 9.15335 6.62489 11.7318C6.49867 12.3664 6.49924 13.0767 6.49989 13.9015L6.49999 14.0833L6.49989 14.265C6.49924 15.0899 6.49867 15.8002 6.62489 16.4347C7.13778 19.0132 9.15341 21.0288 11.7319 21.5417C12.3664 21.6679 13.0767 21.6673 13.9016 21.6667H38.0984C38.9233 21.6673 39.6336 21.6679 40.2681 21.5417C42.8466 21.0288 44.8622 19.0132 45.3751 16.4347C45.5013 15.8002 45.5007 15.0899 45.5001 14.2651L45.5 14.0833L45.5001 13.9015C45.5007 13.0767 45.5013 12.3663 45.3751 11.7318C44.8622 9.15335 42.8466 7.13772 40.2681 6.62483C39.6336 6.49861 38.9233 6.49918 38.0984 6.49983H13.9016ZM12.5773 10.8749C12.7338 10.8438 12.9727 10.8333 14.0833 10.8333H37.9167C39.0273 10.8333 39.2662 10.8438 39.4227 10.8749C40.2822 11.0459 40.9541 11.7177 41.125 12.5772C41.1562 12.7338 41.1667 12.9727 41.1667 14.0833C41.1667 15.1939 41.1562 15.4328 41.125 15.5893C40.9541 16.4488 40.2822 17.1207 39.4227 17.2916C39.2662 17.3228 39.0273 17.3333 37.9167 17.3333H14.0833C12.9727 17.3333 12.7338 17.3228 12.5773 17.2916C11.7178 17.1207 11.0459 16.4488 10.875 15.5893C10.8438 15.4328 10.8333 15.1939 10.8333 14.0833C10.8333 12.9727 10.8438 12.7338 10.875 12.5772C11.0459 11.7177 11.7178 11.0459 12.5773 10.8749Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13 26C9.41015 26 6.5 28.9102 6.5 32.5V39C6.5 42.5899 9.41015 45.5 13 45.5C16.5899 45.5 19.5 42.5899 19.5 39V32.5C19.5 28.9102 16.5899 26 13 26ZM10.8333 32.5C10.8333 31.3034 11.8034 30.3333 13 30.3333C14.1966 30.3333 15.1667 31.3034 15.1667 32.5V39C15.1667 40.1966 14.1966 41.1667 13 41.1667C11.8034 41.1667 10.8333 40.1966 10.8333 39V32.5Z" fill="#1570EF"/>
</svg>`;

const plusCircleIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 6.667v6.666M6.667 10h6.666M18.333 10a8.333 8.333 0 1 1-16.666 0 8.333 8.333 0 0 1 16.666 0Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

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

const checkCircleIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_12506_1251)">
<path d="M16.5 8.31429V9.00429C16.4991 10.6216 15.9754 12.1953 15.007 13.4907C14.0386 14.786 12.6775 15.7337 11.1265 16.1922C9.57557 16.6508 7.91794 16.5957 6.40085 16.0352C4.88376 15.4747 3.58849 14.4389 2.70822 13.0821C1.82795 11.7253 1.40984 10.1203 1.51626 8.50653C1.62267 6.89272 2.24791 5.35654 3.29871 4.1271C4.34951 2.89766 5.76959 2.04083 7.34714 1.6844C8.92469 1.32798 10.5752 1.49105 12.0525 2.14929M16.5 3L9 10.5075L6.75 8.2575" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_12506_1251">
<rect width="18" height="18" fill="white"/>
</clipPath>
</defs>
</svg>`;
</script>

<template>
  <default-layout>
    <div class="form-validation-page">
      <!-- Main Card -->

      <!-- Header -->
      <PageHeader
        :icon="gridIcon"
        title-key="pages.simpleProducts.title"
        description-key="pages.simpleProducts.description"
      />

      <!-- Tabs -->
      <v-tabs v-model="activeTab" class="custom-tabs mb-6" hide-slider>
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          :class="[
            'custom-tab',
            {
              'custom-tab--active': isTabActive(tab.value),
              'custom-tab--completed': isTabCompleted(tab.value),
            },
          ]"
        >
          {{ tab.title }}
          <span
            v-if="isTabCompleted(tab.value)"
            class="ms-2"
            v-html="checkCircleIcon"
          ></span>
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="activeTab">
        <!-- Tab 1: البيانات الأساسية -->
        <v-tabs-window-item :value="0">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
            <div class="">
              <!-- Product Info Section -->
              <div class="mb-3 bg-gray-50 rounded-lg p-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <h2 class="text-lg font-bold text-primary-900">
                    المعلومات العامة للمنتج
                  </h2>
                  <div class="flex items-center gap-4 w-full sm:justify-end">
                    <div class="text-sm font-semibold text-gray-700">
                      كود المنتج
                    </div>
                    <div
                      class="bg-gray-200 border border-gray-300 rounded-lg px-3 py-2 font-semibold text-primary-900"
                    >
                      {{ productCode }}
                    </div>
                  </div>
                </div>
                <!-- Row 1: Names -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <TextInput
                    v-model="arabicName"
                    label="الأسم بالعربية"
                    placeholder="أدخل الاسم"
                    :rules="[
                      required('arabicNameRequired'),
                      minLength(2),
                      maxLength(100),
                      arabicOnly(),
                    ]"
                    :hide-details="false"
                  />
                  <TextInput
                    v-model="englishName"
                    label="الأسم بالإنجليزية"
                    placeholder="Enter name in English"
                    :rules="[
                      required('englishNameRequired'),
                      minLength(2),
                      maxLength(100),
                    ]"
                    :hide-details="false"
                  />
                  <div class="flex items-center gap-4">
                    <v-btn
                      variant="text"
                      color="primary-700"
                      height="40"
                      class="font-semibold text-base"
                      @click="handleAddLanguage"
                    >
                      <span>أضف لغة جديدة</span>
                      <template #prepend>
                        <span v-html="plusCircleIcon"></span>
                      </template>
                    </v-btn>
                  </div>
                </div>

                <!-- Row 2: Category & Unit -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
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

                  <div class="flex items-center">
                    <CheckboxInput
                      v-model="isMinUnit"
                      label="أقل وحدة"
                      color="primary"
                      classes="md:px-2"
                    />
                  </div>
                </div>

                <!-- Row 4: Descriptions -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2">
                  <TextareaInput
                    v-model="englishDescription"
                    label="الوصف بالإنجليزية"
                    placeholder="Enter description in English"
                    :rows="5"
                    :rules="[maxLength(500)]"
                    :hide-details="false"
                  />
                  <TextareaInput
                    v-model="arabicDescription"
                    label="الوصف بالعربية"
                    placeholder="أدخل الوصف"
                    :rows="5"
                    :rules="[maxLength(500)]"
                    :hide-details="false"
                  />
                </div>
                <!-- Product Image Section -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div class="md:col-span-2">
                    <FileUploadInput
                      v-model="productImages"
                      label="صورة المنتج"
                      hint="PNG, JPG or GIF (max. 400x400px)"
                      :max-files="4"
                    />
                  </div>
                </div>
              </div>

              <!-- Prices Section -->
              <div class="mb-8 bg-gray-50 rounded-lg p-6">
                <h2 class="text-lg font-bold text-primary-900">الأسعار</h2>

                <!-- Row 1: Main Prices -->
                <div class="grid grid-cols-2 md:grid-cols-5 gap-5 mb-2">
                  <PriceInput
                    v-model="branchPrice"
                    label="سعر الفرع"
                    :rules="[numeric(), positive()]"
                    :hide-details="false"
                  />
                  <PriceInput
                    v-model="minSalePrice"
                    label="أقل سعر للبيع"
                    :rules="[numeric(), positive()]"
                    :hide-details="false"
                  />
                  <PriceInput
                    v-model="maxSalePrice"
                    label="أعلى سعر للبيع"
                    :rules="[numeric(), positive()]"
                    :hide-details="false"
                  />
                  <PriceInput
                    v-model="salePrice"
                    label="سعر البيع"
                    :rules="[required(), numeric(), positive()]"
                    :hide-details="false"
                  />
                  <PriceInput
                    v-model="purchasePrice"
                    label="سعر الشراء"
                    :rules="[required(), numeric(), positive()]"
                    :hide-details="false"
                  />
                  <PriceInput
                    v-model="halfWholesalePrice"
                    label="سعر نصف الجملة"
                    :rules="[numeric(), positive()]"
                    :hide-details="false"
                  />
                  <PriceInput
                    v-model="wholesalePrice"
                    label="سعر الجملة"
                    :rules="[numeric(), positive()]"
                    :hide-details="false"
                  />
                </div>

                <!-- Row 3: Discount -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <SelectInput
                      v-model="discountType"
                      label="نوع الخصم"
                      placeholder="اختر نوع الخصم"
                      :items="discountTypeItems"
                    />
                  </div>
                  <div>
                    <div class="mb-[7px] text-sm font-semibold text-gray-700">
                      قيمة الخصم
                    </div>
                    <div
                      class="bg-gray-200 border border-gray-300 rounded-lg px-4 py-2 min-h-[47px] font-semibold text-primary-900 flex items-center"
                    >
                      <p>{{ discountValue }} $</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-lg font-bold text-primary-900 mb-4">
              بيانات الضرائب
            </h2>

            <!-- Tax Fields Row -->
            <div class="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-3 gap-4 items-end">
              <SelectWithIconInput
                v-model="taxType"
                label="الضريبة"
                placeholder="اختر النوع"
                :items="taxTypeItems"
                :hide-details="true"
                show-add-button
                @add-click="handleAddTaxType"
              />
              <TextInput
                v-model="taxPercentage"
                label="النسبة"
                placeholder="النسبة"
                :hide-details="true"
                disabled
              />
              <SelectInput
                v-model="taxMinValue"
                label="أقل قيمة"
                placeholder="اختر القيمة"
                :items="taxMinValueItems"
                :hide-details="true"
              />
              <SelectInput
                v-model="taxPriority"
                label="الأولوية"
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
              title="الضرائب المطبقة على المنتج"
              :headers="taxTableHeaders"
              :items="taxTableItems"
              show-checkbox
              show-actions
              class="mt-6"
              @edit="handleEditTax"
              @delete="handleDeleteTax"
            />
          </div>
        </v-tabs-window-item>

        <!-- Tab 3: البيانات الإضافية -->
        <v-tabs-window-item :value="2">
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-lg font-bold text-primary-900">
              البيانات الإضافية
            </h2>
            <p class="text-gray-600 mt-4">
              محتوى البيانات الإضافية سيتم إضافته هنا...
            </p>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </default-layout>
</template>

<style scoped></style>
