<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface AccountTypeForm {
  nameAr: string;
  nameEn: string;
  role: string;
  description: string;
  status: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  accountType?: Partial<AccountTypeForm> | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: AccountTypeForm): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<AccountTypeForm>({
  nameAr: "",
  nameEn: "",
  role: "",
  description: "",
  status: true,
});

const roleItems = [
  { title: "اختر الدور", value: "" },
  { title: "مدير", value: "مدير" },
  { title: "محاسب", value: "محاسب" },
  { title: "موظف", value: "موظف" },
];

const resetForm = () => {
  form.nameAr = "";
  form.nameEn = "";
  form.role = "";
  form.description = "";
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

  emit("save", { ...form });
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.accountType) {
      form.nameAr = props.accountType.nameAr ?? "";
      form.nameEn = props.accountType.nameEn ?? "";
      form.role = props.accountType.role ?? "";
      form.description = props.accountType.description ?? "";
      form.status = props.accountType.status ?? true;
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="إضافة نوع حساب جديد" :max-width="640">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-account-outline</v-icon>
        </span>
        إضافة نوع حساب جديد
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

        <SelectInput v-model="form.role" label="الدور" placeholder="اختر الدور" :items="roleItems"
          :hide-details="false" />

        <div class="flex items-center gap-2">
          <span class="text-base font-semibold text-gray-700">فعال</span>
          <v-switch v-model="form.status" color="primary" inset hide-details />
        </div>

        <div class="md:col-span-2 mt-2">
          <TextareaInput v-model="form.description" label="الوصف" placeholder="الوصف" :hide-details="false" />
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
