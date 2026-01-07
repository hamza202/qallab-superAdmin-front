<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface TaxRuleForm {
  nameAr: string;
  nameEn: string;
  type: string | null;
  key: string;
  description: string;
  example: string;
  autoApply: boolean;
  status: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  taxRule?: Partial<TaxRuleForm> | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: TaxRuleForm): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<TaxRuleForm>({
  nameAr: "",
  nameEn: "",
  type: null,
  key: "",
  description: "",
  example: "",
  autoApply: true,
  status: true,
});

const typeItems = [
  { title: "اختر النوع", value: null },
  { title: "نوع 1", value: "type1" },
  { title: "نوع 2", value: "type2" },
];

const resetForm = () => {
  form.nameAr = "";
  form.nameEn = "";
  form.type = null;
  form.key = "";
  form.description = "";
  form.example = "";
  form.autoApply = true;
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

    if (props.taxRule) {
      form.nameAr = props.taxRule.nameAr ?? "";
      form.nameEn = props.taxRule.nameEn ?? "";
      form.type = props.taxRule.type ?? null;
      form.key = props.taxRule.key ?? "";
      form.description = props.taxRule.description ?? "";
      form.example = props.taxRule.example ?? "";
      form.autoApply = props.taxRule.autoApply ?? true;
      form.status = props.taxRule.status ?? true;
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="إضافة قاعدة ضريبية جديدة" :max-width="550">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-percent-outline</v-icon>
        </span>
        إضافة قاعدة ضريبية جديدة
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
          <v-btn variant="text" color="primary-700" height="40" class="font-semibold text-base" style="display: none;">
            أضف لغة جديدة
            <template #prepend>
              <v-icon>
                mdi-plus-circle-outline
              </v-icon>
            </template>
          </v-btn>

        </div>

        <div class="md:col-span-2">

          <SelectInput v-model="form.type" label="النوع" placeholder="اختر النوع" :items="typeItems"
            :hide-details="false" />

          <TextInput v-model="form.key" label="المفتاح" placeholder="المفتاح" :hide-details="false" />

          <TextareaInput v-model="form.description" label="الوصف" placeholder="الوصف" :hide-details="false" />
          <TextareaInput v-model="form.example" label="المثال" placeholder="المثال" :hide-details="false" />


          <div class="flex flex-wrap gap-4 items-center justify-between mt-2">

            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-gray-700">الحالة</span>
              <v-switch v-model="form.status" color="primary" inset hide-details />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-gray-700">التطبيق التلقائي</span>
              <v-switch v-model="form.autoApply" color="primary" inset hide-details />
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
