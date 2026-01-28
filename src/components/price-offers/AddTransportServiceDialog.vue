<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

interface TransportServiceForm {
  projectLocation: string;
  fromDate: string;
  toDate: string;
  vehicleTypes: string[];
  tripTime: string;
  notes: string;
}

const props = defineProps<{
  modelValue: boolean;
  deliveredMethods?: any[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [service: TransportServiceForm];
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const formRef = ref<any>(null);
const isFormValid = ref(false);

const form = reactive<TransportServiceForm>({
  projectLocation: "",
  fromDate: "",
  toDate: "",
  vehicleTypes: [],
  tripTime: "",
  notes: "",
});

const tripTimeOptions = ref([
  { title: 'صباحاً', value: 'صباحاً' },
  { title: 'مساءً', value: 'مساءً' },
  { title: 'كلاهما', value: 'كلاهما' },
]);

const vehicleTypeOptionsList = computed(() => props.deliveredMethods || [
  { title: 'قلاب', value: 'قلاب' },
  { title: 'سطحة', value: 'سطحة' },
]);

const showMapDialog = ref(false);

const resetForm = () => {
  form.projectLocation = "";
  form.fromDate = "";
  form.toDate = "";
  form.vehicleTypes = [];
  form.tripTime = "";
  form.notes = "";
};

const closeDialog = () => {
  internalOpen.value = false;
  resetForm();
};

const openMapDialog = () => {
  showMapDialog.value = true;
};

const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
  form.projectLocation = location.address;
  console.log('Location selected:', location);
};

const handleSave = async () => {
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  emit('saved', form);
  closeDialog();
};

const handleCancel = () => {
  closeDialog();
};

const truckIcon = `<svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.75 3.75H15.0873C15.3318 3.75 15.4541 3.75 15.5692 3.77763C15.6713 3.80213 15.7688 3.84253 15.8583 3.89736C15.9592 3.9592 16.0457 4.04568 16.2186 4.21863L20.2814 8.28137C20.4543 8.45432 20.5408 8.5408 20.6026 8.64172C20.6575 8.73119 20.6979 8.82873 20.7224 8.93077C20.75 9.04586 20.75 9.16815 20.75 9.41274V12.25C20.75 12.7159 20.75 12.9489 20.6739 13.1327C20.5724 13.3777 20.3777 13.5724 20.1327 13.6739C19.9489 13.75 19.7159 13.75 19.25 13.75M14.25 13.75H12.75M12.75 13.75V3.95C12.75 2.8299 12.75 2.26984 12.532 1.84202C12.3403 1.46569 12.0343 1.15973 11.658 0.967987C11.2302 0.75 10.6701 0.75 9.55 0.75H3.95C2.8299 0.75 2.26984 0.75 1.84202 0.967987C1.46569 1.15973 1.15973 1.46569 0.967987 1.84202C0.75 2.26984 0.75 2.8299 0.75 3.95V11.75C0.75 12.8546 1.64543 13.75 2.75 13.75M12.75 13.75H8.75M8.75 13.75C8.75 15.4069 7.40685 16.75 5.75 16.75C4.09315 16.75 2.75 15.4069 2.75 13.75M8.75 13.75C8.75 12.0931 7.40685 10.75 5.75 10.75C4.09315 10.75 2.75 12.0931 2.75 13.75M19.25 14.25C19.25 15.6307 18.1307 16.75 16.75 16.75C15.3693 16.75 14.25 15.6307 14.25 14.25C14.25 12.8693 15.3693 11.75 16.75 11.75C18.1307 11.75 19.25 12.8693 19.25 14.25Z" stroke="#4B5565" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

</script>

<template>
  <AppDialog v-model="internalOpen" :max-width="700">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="!bg-gray-50 border border-gray-100 rounded px-1.5 py-1.5 text-gray-600">
          <span v-html="truckIcon"></span>
        </span>
        إضافة خدمة نقل
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div class="space-y-4">
        <!-- Date Range -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePickerInput label="تاريخ بدء النقل" v-model="form.fromDate" placeholder="اختر التاريخ"
            density="comfortable" hide-details />
          <DatePickerInput label="تاريخ انتهاء النقل" v-model="form.toDate" placeholder="اختر التاريخ"
            density="comfortable" hide-details />

          <!-- Trip Time -->
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-2 block">
              توقيت النقل <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-4">
              <v-radio-group v-model="form.tripTime" inline hide-details>
                <v-radio v-for="option in tripTimeOptions" :key="option.value" :value="option.value" color="primary">
                  <template #label>
                    <span :class="form.tripTime === option.value ? 'text-primary font-semibold' : 'text-gray-600'">
                      {{ option.title }}
                    </span>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>
          </div>

          <!-- Vehicle Types -->
          <MultipleSelectInput label="نوع المركبات" v-model="form.vehicleTypes" :items="vehicleTypeOptionsList"
            placeholder="اختر نوع المركبة" item-title="title" item-value="value" />

          <!-- Notes -->
          <div class="md:col-span-2">
            <TextareaInput label="ملاحظات" v-model="form.notes" placeholder="أدخل الملاحظات" :rows="4"
              density="comfortable" hide-details />
          </div>
        </div>
      </div>

    </v-form>

    <template #actions>
      <div class="flex items-center justify-center gap-4 flex-1 mt-4">
        <ButtonWithIcon variant="flat" color="primary" size="large" custom-class="px-8" label="أضف خدمة"
          :prepend-icon="plusIcon" @click="handleSave" />

        <ButtonWithIcon variant="outlined" color="gray-700" border="gray-300" size="large" custom-class="px-4"
          label="إلغاء" @click="handleCancel" />
      </div>
    </template>

  </AppDialog>
</template>

<style scoped></style>
