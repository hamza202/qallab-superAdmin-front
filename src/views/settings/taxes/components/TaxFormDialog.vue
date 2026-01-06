<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface TaxForm {
  nameAr: string;
  nameEn: string;
  percentage: string;
  minValue: string;
  taxBase: string;
  calculationMethod: string;
  status: boolean;
  amountIncludesTax: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  tax?: Partial<TaxForm> | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: TaxForm): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<TaxForm>({
  nameAr: "",
  nameEn: "",
  percentage: "",
  minValue: "",
  taxBase: "",
  calculationMethod: "",
  status: true,
  amountIncludesTax: false,
});

const taxBaseItems = [
  { title: "اختر القاعدة الضريبية", value: "" },
  { title: "قيمة الفاتورة", value: "قيمة الفاتورة" },
  { title: "قيمة المنتج", value: "قيمة المنتج" },
];

const calculationMethodItems = [
  { title: "اختر طريقة الاحتساب", value: "" },
  { title: "لكل منتج", value: "لكل منتج" },
  { title: "لكل فاتورة", value: "لكل فاتورة" },
];

const resetForm = () => {
  form.nameAr = "";
  form.nameEn = "";
  form.percentage = "";
  form.minValue = "";
  form.taxBase = "";
  form.calculationMethod = "";
  form.status = true;
  form.amountIncludesTax = false;
};

const closeDialog = () => {
  internalOpen.value = false;
};

const handleSave = async () => {
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  emit("save", { ...form });
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.tax) {
      form.nameAr = props.tax.nameAr ?? "";
      form.nameEn = props.tax.nameEn ?? "";
      form.percentage = props.tax.percentage ?? "";
      form.minValue = props.tax.minValue ?? "";
      form.taxBase = props.tax.taxBase ?? "";
      form.calculationMethod = props.tax.calculationMethod ?? "";
      form.status = props.tax.status ?? true;
      form.amountIncludesTax = props.tax.amountIncludesTax ?? false;
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="إضافة ضريبة" :max-width="640">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-percent-outline</v-icon>
        </span>
        إضافة ضريبة
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div class="mb-4">
        <LanguageTabs :languages="availableLanguages" label="الإسم">
          <template #en>
            <TextInput v-model="form.nameEn" placeholder="Enter name in English" :hide-details="true" />
          </template>
          <template #ar>
            <TextInput v-model="form.nameAr" placeholder="ادخل الاسم بالعربية" :hide-details="true" />
          </template>
        </LanguageTabs>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2 mb-4">
        <div class="md:col-span-2">

          <TextInput v-model="form.percentage" label="النسبة" placeholder="النسبة" :hide-details="false" />

          <TextInput v-model="form.minValue" label="اقل قيمة" placeholder="اقل قيمة" :hide-details="false" />

          <SelectInput v-model="form.taxBase" label="القاعدة الضريبية" placeholder="اختر القاعدة الضريبية"
            :items="taxBaseItems" :hide-details="false" />
          <SelectInput v-model="form.calculationMethod" label="طريقة الاحتساب" placeholder="اختر طريقة الاحتساب"
            :items="calculationMethodItems" :hide-details="false" />

          <div class="flex flex-wrap gap-4 items-center justify-between">

            <div class="md:col-span-2 flex items-center md:justify-start gap-1">
              <CheckboxInput v-model="form.amountIncludesTax" :hide-details="true" />
              <span class="text-base font-semibold text-gray-700">المبلغ شامل الضريبة</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-base font-semibold text-gray-700">فعال</span>
              <v-switch v-model="form.status" color="primary" inset hide-details />
            </div>

          </div>
        </div>

      </div>
    </v-form>

    <template #actions>
      <v-btn variant="flat" color="primary" height="44" class="font-semibold text-base sm:flex-1" @click="handleSave">
        <template #prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        حفظ
      </v-btn>
      <v-btn variant="flat" color="primary-50" height="44" class="font-semibold text-base text-primary-700 sm:flex-1"
        @click="closeDialog">
        اغلاق
      </v-btn>
    </template>
  </AppDialog>
</template>

<style scoped></style>
