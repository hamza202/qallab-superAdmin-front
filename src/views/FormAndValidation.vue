<script setup lang="ts">
import { ref } from "vue";

// Form Components
import TextInput from "@/components/common/forms/textInput.vue";
import SelectInput from "@/components/common/forms/selectInput.vue";
import CheckboxInput from "@/components/common/forms/checkboxInput.vue";
import TextareaInput from "@/components/common/forms/TextareaInput.vue";
import FileUploadInput from "@/components/common/forms/FileUploadInput.vue";
import PriceInput from "@/components/common/forms/PriceInput.vue";
import SelectWithIconInput from "@/components/common/forms/SelectWithIconInput.vue";

// Form data
const productCode = ref("#eda23422");
const arabicName = ref("محمد صقر");
const englishName = ref("Mohammed Saqr");
const category = ref(null);
const unit = ref(null);
const isMinUnit = ref(true);
const arabicDescription = ref("هذا المنتج هو برعاية شركة قلاب.");
const englishDescription = ref(
  "A little about the company and the team that you'll be working with."
);
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

// Tabs
const activeTab = ref(0);
const tabs = [
  { title: "البيانات الأساسية", value: 0 },
  { title: "بيانات الضرائب", value: 1 },
  { title: "البيانات الإضافية", value: 2 },
];

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

const handleSaveAndReturn = () => {
  console.log("Save and return to home");
};

const handleSaveAndCreate = () => {
  console.log("Save and create new");
};

const handleSaveAndContinue = () => {
  console.log("Save and continue");
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

const returnIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 11.667a3.333 3.333 0 0 0-3.333-3.334H3.333m0 0L7.5 4.167M3.333 8.333 7.5 12.5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const saveIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.5 12.5v3.333a1.666 1.666 0 0 1-1.667 1.667H4.167A1.667 1.667 0 0 1 2.5 15.833V12.5M5.833 8.333 10 12.5m0 0 4.167-4.167M10 12.5V2.5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const arrowLeftIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15.833 10H4.167m0 0 5 5m-5-5 5-5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <div
    class="form-validation-page min-h-screen bg-gray-50 p-6 font-cairo"
    dir="rtl"
  >
    <!-- Main Card -->
    <div
      class="bg-white rounded-3xl border border-gray-300 p-6 max-w-[1164px] mx-auto"
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-4">
          <div class="w-[52px] h-[52px] flex items-center justify-center">
            <span v-html="gridIcon"></span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-primary-900">المنتجات البسيطة</h1>
            <p class="text-sm text-gray-600">تمكنك من اضافة المنتجات البسيطة</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="[
            'px-6 py-3 rounded-md text-base font-medium transition-all',
            activeTab === tab.value
              ? 'bg-primary-600 text-white font-semibold'
              : 'bg-primary-50 text-primary-900',
          ]"
          @click="activeTab = tab.value"
        >
          {{ tab.title }}
        </button>
      </div>

      <!-- Form Content Area -->
      <div class="bg-gray-50 rounded-md p-6">
        <!-- Product Info Section -->
        <div class="mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <h2 class="text-lg font-bold text-primary-900">
              المعلومات العامة للمنتج
            </h2>
            <div
              class="flex items-center gap-4 w-full sm:justify-end"
            >
              <div class="text-sm font-semibold text-gray-700">كود المنتج</div>
              <div
                class="bg-gray-200 border border-gray-300 rounded-lg px-3 py-2 font-semibold text-primary-900"
              >
                {{ productCode }}
              </div>
            </div>
          </div>
          <!-- Row 1: Product Code & Add Language Button -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="flex items-end gap-4">
              <button
                class="bg-primary-600 text-white px-5 py-2.5 rounded flex items-center gap-2 font-semibold text-base h-[40px]"
                @click="handleAddLanguage"
              >
                <span>أضف لغة جديدة</span>
                <span class="text-white" v-html="plusCircleIcon"></span>
              </button>
            </div>
          </div>

          <!-- Row 2: Names -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <TextInput
              v-model="englishName"
              label="الأسم بالإنجليزية"
              placeholder="Enter name in English"
            />
            <TextInput
              v-model="arabicName"
              label="الأسم بالعربية"
              placeholder="أدخل الاسم"
            />
          </div>

          <!-- Row 3: Category & Unit -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="flex items-end gap-2">
              <CheckboxInput
                v-model="isMinUnit"
                label="أقل وحدة"
                classes="mt-4"
              />
              <div class="flex-1">
                <SelectWithIconInput
                  v-model="unit"
                  label="الوحدة"
                  placeholder="اختر الوحدة"
                  :items="unitItems"
                  show-add-button
                  @add-click="handleAddUnit"
                />
              </div>
            </div>
            <SelectWithIconInput
              v-model="category"
              label="التصنيف"
              placeholder="اختر التصنيف"
              :items="categoryItems"
              show-add-button
              @add-click="handleAddCategory"
            />
          </div>

          <!-- Row 4: Descriptions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <TextareaInput
              v-model="englishDescription"
              label="الوصف بالإنجليزية"
              placeholder="Enter description in English"
              :rows="5"
            />
            <TextareaInput
              v-model="arabicDescription"
              label="الوصف بالعربية"
              placeholder="أدخل الوصف"
              :rows="5"
            />
          </div>
        </div>

        <!-- Product Image Section -->
        <div class="mb-8">
          <FileUploadInput
            v-model="productImages"
            label="صورة المنتج"
            hint="PNG, JPG or GIF (max. 400x400px)"
            :max-files="4"
          />
        </div>

        <!-- Prices Section -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-primary-600 mb-4 text-right">
            الأسعار
          </h2>

          <!-- Row 1: Main Prices -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <PriceInput v-model="branchPrice" label="سعر الفرع" />
            <PriceInput v-model="minSalePrice" label="أقل سعر للبيع" />
            <PriceInput v-model="maxSalePrice" label="أعلى سعر للبيع" />
            <PriceInput v-model="salePrice" label="سعر البيع" />
            <PriceInput v-model="purchasePrice" label="سعر الشراء" />
          </div>

          <!-- Row 2: Wholesale Prices -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div></div>
            <div></div>
            <PriceInput v-model="halfWholesalePrice" label="سعر نصف الجملة" />
            <PriceInput v-model="wholesalePrice" label="سعر الجملة" />
          </div>

          <!-- Row 3: Discount -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="mb-1.5 text-sm font-semibold text-gray-700">
                قيمة الخصم
              </div>
              <div class="discount-value-box">
                <p>{{ discountValue }} $</p>
              </div>
            </div>
            <div>
              <SelectInput
                v-model="discountType"
                label="نوع الخصم"
                placeholder="اختر نوع الخصم"
                :items="discountTypeItems"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4 mt-6">
        <button
          class="bg-primary-600 text-white px-6 py-3 rounded flex items-center gap-2 font-semibold text-base"
          @click="handleSaveAndReturn"
        >
          <span v-html="returnIcon" class="text-white"></span>
          <span>حفظ والعودة للرئيسية</span>
        </button>

        <button
          class="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded flex items-center gap-2 font-medium text-base"
          @click="handleSaveAndCreate"
        >
          <span v-html="saveIcon"></span>
          <span>حفظ وإنشاء جديد</span>
        </button>

        <button
          class="bg-primary-600 text-white px-6 py-3 rounded flex items-center gap-2 font-semibold text-base"
          @click="handleSaveAndContinue"
        >
          <span v-html="arrowLeftIcon" class="text-white"></span>
          <span>حفظ وإكمال</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-validation-page {
  font-family: "Cairo", sans-serif;
}

/* Product code styled input */
.product-code-styled :deep(.v-field) {
  background-color: #1570ef !important;
  border-radius: 6px;
}

.product-code-styled :deep(.v-field__input) {
  color: white !important;
  font-weight: 600;
}

.product-code-styled :deep(.v-field--variant-plain) {
  background-color: #1570ef !important;
}

/* Global form styles */
:deep(.v-field--variant-outlined) {
  border-color: #cdd5df;
}

:deep(.v-field--variant-outlined.v-field--focused) {
  border-color: #84caff;
  box-shadow: 0px 0px 0px 4px #f5faff, 0px 1px 2px 0px rgba(245, 250, 255, 0.05);
}

:deep(.v-field__outline) {
  --v-field-border-opacity: 1;
}

/* Tab active style */
.tab-active {
  background-color: #1570ef;
  color: white;
}

/* Discount value box */
.discount-value-box {
  background-color: #1570ef;
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  height: 48px;
}

.discount-value-box p {
  color: white;
  font-weight: 500;
  font-size: 16px;
  margin: 0;
}

/* Button styles */
.btn-primary {
  background-color: #1570ef;
  color: white;
  font-weight: 600;
}

.btn-secondary {
  background-color: white;
  color: #364152;
  border: 1px solid #cdd5df;
}
</style>
