<script setup lang="ts">
const formRef = ref<any>(null);
const isFormValid = ref(false);

interface CategoryListItem {
  id: number;
  name: string;
}

interface TaxRule {
  id: number;
  name: string | null;
  percentage: string;
  minValue: string;
  maxValue: string;
}

const categoryName = ref("");
const parentCategory = ref<string | null>(null);
const unit = ref<string | null>(null);
const categoryDescription = ref("");
const categoryImage = ref<File[] | null>(null);
const isDefaultCategory = ref(false);

const parentCategoryItems = [
  { title: "اختر التصنيف الرئيسي", value: "" },
  { title: "اسم التصنيف 1", value: "category-1" },
  { title: "اسم التصنيف 2", value: "category-2" },
];

const unitItems = [
  { title: "الوحدة", value: "" },
  { title: "قطعة", value: "piece" },
  { title: "كيلو", value: "kg" },
  { title: "لتر", value: "liter" },
];

const categoriesSearch = ref("");
const categoriesList = ref<CategoryListItem[]>([
  { id: 1, name: "اسم التصنيف" },
  { id: 2, name: "اسم التصنيف" },
  { id: 3, name: "اسم التصنيف" },
  { id: 4, name: "اسم التصنيف" },
]);

const selectedCategoryIds = ref<number[]>([]);

const filteredCategories = computed(() => {
  if (!categoriesSearch.value) return categoriesList.value;
  const q = categoriesSearch.value.toLowerCase();
  return categoriesList.value.filter((c) => c.name.toLowerCase().includes(q));
});

const isAllSelected = computed({
  get() {
    if (!filteredCategories.value.length) return false;
    return filteredCategories.value.every((c) =>
      selectedCategoryIds.value.includes(c.id)
    );
  },
  set(value: boolean) {
    if (value) {
      const idsToAdd = filteredCategories.value.map((c) => c.id);
      selectedCategoryIds.value = Array.from(
        new Set([...selectedCategoryIds.value, ...idsToAdd])
      );
    } else {
      const idsToRemove = new Set(filteredCategories.value.map((c) => c.id));
      selectedCategoryIds.value = selectedCategoryIds.value.filter(
        (id) => !idsToRemove.has(id)
      );
    }
  },
});

const taxNameItems = [
  { title: "اختر الضريبة", value: "" },
  { title: "ضريبة القيمة المضافة", value: "vat" },
  { title: "ضريبة أخرى", value: "other" },
];

const taxRules = ref<TaxRule[]>([
  {
    id: 1,
    name: null,
    percentage: "10",
    minValue: "",
    maxValue: "",
  },
]);

const addTaxRule = () => {
  const nextId = taxRules.value.length
    ? Math.max(...taxRules.value.map((t) => t.id)) + 1
    : 1;
  taxRules.value.push({
    id: nextId,
    name: null,
    percentage: "",
    minValue: "",
    maxValue: "",
  });
};

const removeTaxRule = (index: number) => {
  taxRules.value.splice(index, 1);
};

const handleSave = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Save categories form");
  } else {
    console.log("Form has errors");
  }
};

const handleClose = () => {
  console.log("Close categories form");
};

const handleDelete = () => {
  console.log("Delete category");
};

const categoriesIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="6" width="16" height="16" rx="4" fill="#1570EF" fill-opacity="0.1"/>
<rect x="6" y="6" width="16" height="16" rx="4" stroke="#1570EF" stroke-width="1.5"/>
<rect x="30" y="6" width="16" height="16" rx="4" fill="#1570EF" fill-opacity="0.1"/>
<rect x="30" y="6" width="16" height="16" rx="4" stroke="#1570EF" stroke-width="1.5"/>
<rect x="6" y="30" width="16" height="16" rx="4" fill="#1570EF" fill-opacity="0.1"/>
<rect x="6" y="30" width="16" height="16" rx="4" stroke="#1570EF" stroke-width="1.5"/>
<rect x="30" y="30" width="16" height="16" rx="4" fill="#1570EF"/>
</svg>`;

const plusCircleIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 6.667v6.666M6.667 10h6.666M18.333 10a8.333 8.333 0 1 1-16.666 0 8.333 8.333 0 0 1 16.666 0Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <default-layout>
    <div class="categories-page">
      <PageHeader :icon="categoriesIcon" title-key="pages.categories.title"
        description-key="pages.categories.description" />

      <div class="flex flex-wrap gap-3 mb-6">
        <v-btn variant="flat" color="primary" height="44" class="font-semibold text-base px-6">
          <template #prepend>
            <span v-html="plusCircleIcon"></span>
          </template>
          <span>إضافة تصنيف جديد</span>
        </v-btn>

        <v-btn variant="outlined" color="primary" height="44" class="font-semibold text-base px-6">
          <template #prepend>
            <span v-html="plusCircleIcon"></span>
          </template>
          <span>إضافة تصنيف فرعي جديد</span>
        </v-btn>
      </div>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div class="bg-gray-50 rounded-md p-6 gap-4">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h2 class="text-lg font-bold text-primary-900">التصنيفات</h2>
                <p class="text-sm text-gray-600">
                  يمكنك من إضافة للتصنيفات
                </p>
              </div>

              <div class="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                <v-icon>mdi-view-grid-outline</v-icon>
              </div>
            </div>

            <v-text-field v-model="categoriesSearch" density="comfortable" variant="outlined" hide-details
              placeholder="بحث" prepend-inner-icon="mdi-magnify" class="mb-2" />

            <div class="flex items-center justify-between mb-2 text-sm text-gray-700">
              <div class="flex items-center gap-2">
                <v-checkbox v-model="isAllSelected" density="compact" hide-details />
                <span>اختيار الكل</span>
              </div>
              <span class="text-xs text-gray-500">{{ filteredCategories.length }}</span>
            </div>

            <div class="space-y-2 max-h-[360px] overflow-y-auto">
              <div v-for="category in filteredCategories" :key="category.id"
                class="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2 text-sm">
                <div class="flex items-center gap-2">
                  <v-checkbox v-model="selectedCategoryIds" :value="category.id" density="compact" hide-details />
                  <span>{{ category.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 space-y-6">
            <div class="bg-gray-50 rounded-md p-6">
              <div class="mb-4">
                <h2 class="text-lg font-bold text-primary-900">التصنيفات</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <TextInput v-model="categoryName" label="الاسم" placeholder="الاسم"
                  :rules="[required(), maxLength(100)]" :hide-details="false" />

                <SelectWithIconInput v-model="parentCategory" label="التصنيف الرئيسي" placeholder="اختر التصنيف الرئيسي"
                  :items="parentCategoryItems" :hide-details="false" />

                <SelectWithIconInput v-model="unit" label="الوحدة" placeholder="الوحدة" :items="unitItems"
                  :hide-details="false" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <FileUploadInput v-model="categoryImage" label="أرفق صورة" hint="PNG, JPG or GIF (max. 400x400px)"
                    :max-files="1" />
                </div>
                <div class="md:col-span-2 flex flex-col gap-4">
                  <TextareaInput v-model="categoryDescription" label="تفاصيل التصنيف" placeholder="الوصف" :rows="5"
                    :hide-details="false" />

                  <div class="flex items-center justify-end gap-3">
                    <span class="text-sm font-semibold text-gray-700">الافتراضي</span>
                    <v-switch v-model="isDefaultCategory" color="primary" density="comfortable" inset hide-details />
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-md p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-primary-900">الضرائب</h2>
                <v-btn variant="flat" color="primary" height="40" class="font-semibold text-sm px-4"
                  @click="addTaxRule">
                  <template #prepend>
                    <span v-html="plusCircleIcon"></span>
                  </template>
                  <span>أضف المزيد</span>
                </v-btn>
              </div>

              <div v-for="(tax, index) in taxRules" :key="tax.id"
                class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4">
                <div>
                  <SelectInput v-model="tax.name" label="الضريبة" placeholder="اختر النوع" :items="taxNameItems"
                    :hide-details="false" />
                </div>

                <div>
                  <TextInput v-model="tax.percentage" label="النسبة" placeholder="10%" :rules="[numeric()]"
                    :hide-details="false" />
                </div>

                <div>
                  <TextInput v-model="tax.minValue" label="أقل قيمة" placeholder="أقل قيمة" :rules="[numeric()]"
                    :hide-details="false" />
                </div>

                <div>
                  <TextInput v-model="tax.maxValue" label="أعلى قيمة" placeholder="أعلى قيمة" :rules="[numeric()]"
                    :hide-details="false" />
                </div>

                <div class="flex justify-end">
                  <v-btn v-if="taxRules.length > 1" variant="text" color="error" class="font-semibold"
                    @click="removeTaxRule(index)">
                    حذف
                  </v-btn>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap justify-between items-center gap-4 mt-6">
              <v-btn variant="flat" color="error" height="44"
                class="font-semibold text-base px-6 bg-red-50 text-red-600" @click="handleDelete">
                حذف
              </v-btn>

              <div class="flex flex-wrap gap-3">
                <v-btn variant="flat" color="primary-50" height="44"
                  class="font-semibold text-base text-primary-700 px-6" @click="handleClose">
                  إغلاق
                </v-btn>

                <v-btn variant="flat" color="primary" height="44" class="font-semibold text-base px-6"
                  @click="handleSave">
                  حفظ
                </v-btn>
              </div>
            </div>
          </div>

        </div>
      </v-form>
    </div>
  </default-layout>
</template>

<style scoped></style>
