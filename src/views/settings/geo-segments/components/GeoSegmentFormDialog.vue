<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

interface GeoSegmentRangeForm {
  startDistance: string;
  endDistance: string;
  tripTime: string;
  basePrice: string;
  tripsCount: string;
  status: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  segment?: Partial<GeoSegmentRangeForm> | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: GeoSegmentRangeForm): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<GeoSegmentRangeForm>({
  startDistance: "",
  endDistance: "",
  tripTime: "",
  basePrice: "",
  tripsCount: "",
  status: true,
});

const resetForm = () => {
  form.startDistance = "";
  form.endDistance = "";
  form.tripTime = "";
  form.basePrice = "";
  form.tripsCount = "";
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

    if (props.segment) {
      form.startDistance = props.segment.startDistance ?? "";
      form.endDistance = props.segment.endDistance ?? "";
      form.tripTime = props.segment.tripTime ?? "";
      form.basePrice = props.segment.basePrice ?? "";
      form.tripsCount = props.segment.tripsCount ?? "";
      form.status = props.segment.status ?? true;
    } else {
      resetForm();
    }
  },
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="تقسيم النطاق الجغرافي" :max-width="600">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-map-marker-radius</v-icon>
        </span>
        <span>تقسيم النطاق الجغرافي</span>
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <TextInput v-model="form.startDistance" label="بداية النطاق" placeholder="بداية النطاق" :hide-details="false" />

        <TextInput v-model="form.endDistance" label="نهاية النطاق" placeholder="نهاية النطاق" :hide-details="false" />

        <TextInput v-model="form.tripTime" label="زمن الرحلة" placeholder="زمن الرحلة" :hide-details="false" />

        <TextInput v-model="form.basePrice" label="سعر أساسي" placeholder="سعر أساسي" :hide-details="false" />

        <TextInput v-model="form.tripsCount" label="عدد الطلعات" placeholder="عدد الطلعات" :hide-details="false" />

        <div class="flex items-center gap-2 mt-2">
          <span class="text-sm font-semibold text-gray-700">فعال</span>
          <v-switch v-model="form.status" color="primary" inset hide-details />
        </div>

      </div>

    </v-form>

    <template #actions>
      <ButtonWithIcon variant="flat" color="primary" height="44"
        custom-class="font-semibold text-base sm:flex-1 w-full sm:w-auto" label="حفظ"
        prepend-icon="mdi-content-save-outline" @click="handleSave" />
      
      <ButtonWithIcon variant="flat" color="primary-50" height="44"
        custom-class="font-semibold text-base text-primary-700 sm:flex-1 w-full sm:w-auto"
        label="اغلاق" @click="closeDialog" />
    </template>
  </AppDialog>
</template>

<style scoped></style>
