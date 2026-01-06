<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface FactoryForm {
  nameAr: string;
  nameEn: string;
  logo: File[] | null;
  notes: string;
  status: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  factory?: Partial<FactoryForm> | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: FactoryForm): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<FactoryForm>({
  nameAr: "",
  nameEn: "",
  logo: null,
  notes: "",
  status: true,
});

const resetForm = () => {
  form.nameAr = "";
  form.nameEn = "";
  form.logo = null;
  form.notes = "";
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

    if (props.factory) {
      form.nameAr = props.factory.nameAr ?? "";
      form.nameEn = props.factory.nameEn ?? "";
      form.logo = (props.factory.logo as File[] | null) ?? null;
      form.notes = props.factory.notes ?? "";
      form.status = props.factory.status ?? true;
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="إضافة مصنع" :max-width="520">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-factory</v-icon>
        </span>
        إضافة مصنع
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div class="mb-4">
        <LanguageTabs :languages="availableLanguages" label="الإسم">
          <template #en>
            <TextInput
              v-model="form.nameEn"
              placeholder="Enter name in English"
              :hide-details="true"
            />
          </template>
          <template #ar>
            <TextInput
              v-model="form.nameAr"
              placeholder="ادخل الاسم بالعربية"
              :hide-details="true"
            />
          </template>
        </LanguageTabs>
      </div>

      <div class="mb-4">
        <FileUploadInput
          v-model="form.logo"
          label="صورة الشعار"
          :multiple="false"
          :max-files="1"
        />
      </div>

      <div class="mb-4">
        <TextareaInput
          v-model="form.notes"
          label="الملاحظات"
          placeholder="الملاحظات"
          :rows="4"
          :hide-details="true"
        />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-gray-700">الحالة</span>
        <v-switch v-model="form.status" color="primary" inset hide-details />
      </div>
    </v-form>

    <template #actions>
      <v-btn
        variant="flat"
        color="primary"
        height="44"
        class="font-semibold text-base sm:flex-1"
        @click="handleSave"
      >
        <template #prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        إضافة
      </v-btn>
      <v-btn
        variant="flat"
        color="primary-50"
        height="44"
        class="font-semibold text-base text-primary-700 sm:flex-1"
        @click="closeDialog"
      >
        إلغاء
      </v-btn>
    </template>
  </AppDialog>
</template>

<style scoped></style>
