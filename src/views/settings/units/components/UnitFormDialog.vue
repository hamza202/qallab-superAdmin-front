<script setup lang="ts">
interface UnitForm {
  nameAr: string;
  nameEn: string;
  code: string;
  relatedUnit: string | number | null;
  type: string | number | null;
  status: boolean;
  notes: string;
}

const props = defineProps<{
  modelValue: boolean; // dialog open/close
  unit?: Partial<UnitForm> | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', payload: UnitForm): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const formRef = ref<any>(null);
const isFormValid = ref(false);

const form = reactive<UnitForm>({
  nameAr: '',
  nameEn: '',
  code: '',
  relatedUnit: null,
  type: '',
  status: true,
  notes: '',
});

const relatedUnitItems = [
  { title: 'اختر', value: '' },
  { title: 'القطعة', value: 'piece' },
  { title: 'الكرتون', value: 'carton' },
];

const typeItems = [
  { title: 'أساسي', value: 'basic' },
  { title: 'مشتق', value: 'derived' },
];

const resetForm = () => {
  form.nameAr = '';
  form.nameEn = '';
  form.code = '';
  form.relatedUnit = null;
  form.type = '';
  form.status = true;
  form.notes = '';
};

const closeDialog = () => {
  internalOpen.value = false;
};

const handleSave = async () => {
  const { valid } = await formRef.value?.validate();
  if (!valid) return;

  emit('save', {
    ...form,
    status: form.status,
  });
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.unit) {
      form.nameAr = props.unit.nameAr ?? '';
      form.nameEn = props.unit.nameEn ?? '';
      form.code = props.unit.code ?? '';
      form.relatedUnit = props.unit.relatedUnit ?? null;
      form.type = props.unit.type ?? '';
      form.status = props.unit.status ?? true;
      form.notes = props.unit.notes ?? '';
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="إضافة وحدة" :max-width="500">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5">
          <v-icon>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.14712 5.26389C8.7178 5.56996 8.19243 5.75 7.625 5.75C6.17525 5.75 5 4.57475 5 3.125C5 1.67525 6.17525 0.5 7.625 0.5C8.56474 0.5 9.38915 0.993813 9.85288 1.73611M3.5 14.0654H5.45772C5.71297 14.0654 5.96666 14.0957 6.21411 14.1565L8.28267 14.6592C8.73151 14.7685 9.19908 14.7791 9.6526 14.6911L11.9397 14.2461C12.5439 14.1284 13.0997 13.8391 13.5353 13.4154L15.1534 11.8413C15.6155 11.3925 15.6155 10.6643 15.1534 10.2148C14.7374 9.81008 14.0785 9.76452 13.6078 10.1077L11.7219 11.4836C11.4519 11.6811 11.1232 11.7874 10.7852 11.7874H8.96412L10.1233 11.7873C10.7767 11.7873 11.3059 11.2725 11.3059 10.6369V10.4069C11.3059 9.87912 10.9367 9.41897 10.4106 9.2914L8.62145 8.85631C8.33029 8.78569 8.0321 8.75 7.73235 8.75C7.00875 8.75 5.69892 9.34911 5.69892 9.34911L3.5 10.2687M14 3.875C14 5.32475 12.8247 6.5 11.375 6.5C9.92525 6.5 8.75 5.32475 8.75 3.875C8.75 2.42525 9.92525 1.25 11.375 1.25C12.8247 1.25 14 2.42525 14 3.875ZM0.5 9.95L0.5 14.3C0.5 14.72 0.5 14.9301 0.581745 15.0905C0.65365 15.2316 0.768385 15.3463 0.909507 15.4183C1.06994 15.5 1.27996 15.5 1.7 15.5H2.3C2.72004 15.5 2.93006 15.5 3.09049 15.4183C3.23161 15.3463 3.34635 15.2316 3.41825 15.0905C3.5 14.9301 3.5 14.72 3.5 14.3V9.95C3.5 9.52996 3.5 9.31994 3.41825 9.15951C3.34635 9.01839 3.23161 8.90365 3.09049 8.83175C2.93006 8.75 2.72004 8.75 2.3 8.75L1.7 8.75C1.27996 8.75 1.06994 8.75 0.909507 8.83175C0.768386 8.90365 0.65365 9.01839 0.581745 9.15951C0.5 9.31994 0.5 9.52996 0.5 9.95Z"
                stroke="#4B5565"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </v-icon>
        </span>
        إضافة وحدة
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2 mb-4">
        <TextInput
          v-model="form.nameAr"
          label="الاسم بالعربية"
          placeholder="ادخل الاسم بالعربية"
          :rules="[required(), maxLength(100)]"
          :hide-details="false"
        />

        <TextInput
          v-model="form.nameEn"
          label="الاسم بالانجليزية"
          placeholder="ادخل الاسم بالانجليزية"
          :rules="[required(), maxLength(100)]"
          :hide-details="false"
        />

        <TextInput
          v-model="form.code"
          label="كود الوحدة"
          placeholder="كود الوحدة"
          :rules="[required()]"
          :hide-details="false"
        />

        <SelectWithIconInput
          v-model="form.relatedUnit"
          label="الوحدة الأساسية ذات الصلة"
          placeholder="اختر"
          :items="relatedUnitItems"
          :hide-details="false"
        />

        <SelectWithIconInput
          v-model="form.type"
          label="النوع"
          placeholder="اختر النوع"
          :items="typeItems"
          :hide-details="false"
        />

        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-gray-700">الحالة</span>
          <v-switch v-model="form.status" color="primary" inset hide-details />
        </div>
      </div>

      <div class="mb-4">
        <TextareaInput
          v-model="form.notes"
          label="ملاحظات"
          placeholder="ملاحظات"
          :rows="4"
          :hide-details="true"
        />
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
        حفظ
      </v-btn>
      <v-btn
        variant="flat"
        color="primary-50"
        height="44"
        class="font-semibold text-base text-primary-700 sm:flex-1"
        @click="closeDialog"
      >
        اغلاق
      </v-btn>
    </template>
  </AppDialog>
</template>

<style scoped></style>
