<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

interface TestForm {
  testName: string | null;
  testsCount: string;
  samplesCount: string;
  sampleQuantity: string;
  status: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  test?: Partial<TestForm> | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: TestForm): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<TestForm>({
  testName: null,
  testsCount: "",
  samplesCount: "",
  sampleQuantity: "",
  status: true,
});

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8335 5.00016H5.50016C5.03345 5.00016 4.8001 5.00016 4.62184 4.90933C4.46504 4.82944 4.33755 4.70196 4.25766 4.54515C4.16683 4.3669 4.16683 4.13354 4.16683 3.66683V0.833496M12.5002 15.8335V10.5002C12.5002 10.0335 12.5002 9.8001 12.4093 9.62184C12.3294 9.46504 12.202 9.33755 12.0452 9.25766C11.8669 9.16683 11.6335 9.16683 11.1668 9.16683H5.50016C5.03345 9.16683 4.8001 9.16683 4.62184 9.25766C4.46504 9.33755 4.33755 9.46504 4.25766 9.62184C4.16683 9.8001 4.16683 10.0335 4.16683 10.5002V15.8335M15.8335 6.10473V11.8335C15.8335 13.2336 15.8335 13.9337 15.561 14.4685C15.3213 14.9389 14.9389 15.3213 14.4685 15.561C13.9337 15.8335 13.2336 15.8335 11.8335 15.8335H4.8335C3.43336 15.8335 2.7333 15.8335 2.19852 15.561C1.72811 15.3213 1.34566 14.9389 1.10598 14.4685C0.833496 13.9337 0.833496 13.2336 0.833496 11.8335V4.8335C0.833496 3.43336 0.833496 2.7333 1.10598 2.19852C1.34566 1.72811 1.72811 1.34566 2.19852 1.10598C2.7333 0.833496 3.43336 0.833496 4.8335 0.833496H10.5623C10.9699 0.833496 11.1737 0.833496 11.3655 0.879546C11.5356 0.920374 11.6982 0.987715 11.8473 1.0791C12.0155 1.18217 12.1596 1.32629 12.4479 1.61454L15.0524 4.21911C15.3407 4.50737 15.4848 4.65149 15.5879 4.81969C15.6793 4.96881 15.7466 5.13138 15.7874 5.30144C15.8335 5.49326 15.8335 5.69708 15.8335 6.10473Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const testItems = [
  { title: "اختر", value: null },
  { title: "اختبار 1", value: "test1" },
  { title: "اختبار 2", value: "test2" },
  { title: "اختبار 3", value: "test3" },
];

const resetForm = () => {
  form.testName = null;
  form.testsCount = "";
  form.samplesCount = "";
  form.sampleQuantity = "";
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

    if (props.test) {
      form.testName = props.test.testName ?? null;
      form.testsCount = props.test.testsCount ?? "";
      form.samplesCount = props.test.samplesCount ?? "";
      form.sampleQuantity = props.test.sampleQuantity ?? "";
      form.status = props.test.status ?? true;
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="تعديل قائمة الاختبارات" :max-width="500">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-clipboard-text-outline</v-icon>
        </span>
        تعديل قائمة الاختبارات
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div class="flex flex-col gap-4 mb-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">الاختبار</label>
          <SelectInput v-model="form.testName" placeholder="اختر" :items="testItems"
            :hide-details="true" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">عدد الاختبارات</label>
          <TextInput v-model="form.testsCount" placeholder="عدد الاختبارات" :hide-details="true" 
            type="number" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">عدد العينات</label>
          <TextInput v-model="form.samplesCount" placeholder="عدد العينات" :hide-details="true" 
            type="number" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">كمية العينات</label>
          <TextInput v-model="form.sampleQuantity" placeholder="كمية العينات" :hide-details="true" 
            type="number" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
          <v-radio-group v-model="form.status" inline hide-details class="mt-0">
            <v-radio :value="true" color="primary">
              <template #label>
                <span class="text-sm text-gray-700">فعال</span>
              </template>
            </v-radio>
            <v-radio :value="false" color="primary">
              <template #label>
                <span class="text-sm text-gray-700">غير فعال</span>
              </template>
            </v-radio>
          </v-radio-group>
        </div>
      </div>
    </v-form>

    <template #actions>
      <ButtonWithIcon variant="flat" color="primary" height="44"
        custom-class="font-semibold text-base sm:flex-1" :prepend-icon="saveIcon"
        label="حفظ" @click="handleSave" />
      
      <ButtonWithIcon variant="flat" color="primary-50" height="44"
        custom-class="font-semibold text-base text-primary-700 sm:flex-1"
        label="إغلاق" prepend-icon="mdi-close" @click="closeDialog" />
    </template>
  </AppDialog>
</template>
