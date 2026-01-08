<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface CityForm {
  nameAr: string;
  nameEn: string;
  code_1: string | number;
  code_2: string | number;
  mobile_code: string | number;
  is_default: boolean;
  status: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  city?: Partial<CityForm> | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: CityForm): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<CityForm>({
  nameAr: "",
  nameEn: "",
  code_1: "",
  code_2: "",
  mobile_code: "",
  is_default: false,
  status: true,
});


const resetForm = () => {
  form.nameAr = "";
  form.nameEn = "";
  form.code_1 = "";
  form.code_2 = "";
  form.mobile_code = "";
  form.is_default = false;
  form.status = true;
};

const closeDialog = () => {
  internalOpen.value = false;
};

const handleSave = async () => {
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  emit("save", {
    ...form,
    status: form.status,
  });
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.city) {
      form.nameAr = props.city.nameAr ?? "";
      form.nameEn = props.city.nameEn ?? "";
      form.code_1 = props.city.code_1 ?? "";
      form.code_2 = props.city.code_2 ?? "";
      form.mobile_code = props.city.mobile_code ?? "";
      form.is_default = props.city.is_default ?? false;
      form.status = props.city.status ?? true;
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="إضافة مدينة" :max-width="520">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-city-variant-outline</v-icon>
        </span>
        إضافة مدينة
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

        <TextInput v-model="form.code_1" label="الرمز 1" placeholder="ادخل الرمز" :hide-details="false" />

        <TextInput v-model="form.code_2" label="الرمز 2" placeholder="ادخل الرمز" :hide-details="false" />

        <div class="md:col-span-2">
          <TextInput class="w-full sm:w-1/2" v-model="form.mobile_code" label="كود الهاتف" placeholder="ادخل كود الهاتف"
            :hide-details="false" />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-gray-700">الحالة</span>
          <v-switch v-model="form.status" color="primary" inset hide-details />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-gray-700">افتراضي</span>
          <v-switch v-model="form.is_default" color="primary" inset hide-details />
        </div>

      </div>
    </v-form>

    <template #actions>
      <v-btn variant="flat" color="primary" height="44" class="font-semibold text-base sm:flex-1 w-full"
        @click="handleSave">
        <template #prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        حفظ
      </v-btn>
      <v-btn variant="flat" color="primary-50" height="44"
        class="font-semibold text-base text-primary-700 sm:flex-1 w-full" @click="closeDialog">
        اغلاق
      </v-btn>
    </template>
  </AppDialog>
</template>

<style scoped></style>
