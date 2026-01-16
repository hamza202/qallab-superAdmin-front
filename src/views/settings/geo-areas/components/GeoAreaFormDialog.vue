<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface GeoAreaForm {
  nameAr: string;
  nameEn: string;
  description: string;
  status: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  area?: Partial<GeoAreaForm> | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: GeoAreaForm): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<GeoAreaForm>({
  nameAr: "",
  nameEn: "",
  description: "",
  status: true,
});

const resetForm = () => {
  form.nameAr = "";
  form.nameEn = "";
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

  emit("save", {
    ...form,
    status: form.status,
  });
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.area) {
      form.nameAr = props.area.nameAr ?? "";
      form.nameEn = props.area.nameEn ?? "";
      form.description = props.area.description ?? "";
      form.status = props.area.status ?? true;
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="تقسيمات المناطق الجغرافية" :max-width="600">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-earth</v-icon>
        </span>
        <span>تقسيمات المناطق الجغرافية</span>
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
        <TextareaInput
          v-model="form.description"
          label="الوصف"
          placeholder="الوصف"
          :rows="4"
          :hide-details="true"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-1">الحالة</label>
        <div class="flex items-center gap-3 mt-1">
          <v-radio-group v-model="form.status" inline hide-details>
            <v-radio :value="true" color="primary">
              <template #label>
                <span :class="form.status ? 'text-primary font-semibold' : 'text-gray-600'">
                  فعال
                </span>
              </template>
            </v-radio>
            <v-radio :value="false" color="primary">
              <template #label>
                <span :class="!form.status ? 'text-primary font-semibold' : 'text-gray-600'">
                  غير فعال
                </span>
              </template>
            </v-radio>
          </v-radio-group>
        </div>
      </div>
    </v-form>

    <template #actions>
      <ButtonWithIcon variant="flat" color="primary" height="44"
        custom-class="font-semibold text-base sm:flex-1" label="حفظ"
        prepend-icon="mdi-plus" @click="handleSave" />
      
      <ButtonWithIcon variant="flat" color="primary-50" height="44"
        custom-class="font-semibold text-base text-primary-700 sm:flex-1"
        label="إغلاق" prepend-icon="mdi-close" @click="closeDialog" />
    </template>
  </AppDialog>
</template>

<style scoped></style>
