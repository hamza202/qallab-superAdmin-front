<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { required } from "@/utils/validators";

export interface LogisticsDetail {
  from_date: string;
  to_date: string;
  transport_type: number[];
  am_pm_interval: string;
  notes: string;
}

export interface TransportServiceTableItem {
  id?: number;
  from_date: string;
  to_date: string;
  vehicle_types: number[];
  vehicle_types_labels: string;
  am_pm_interval: string;
  am_pm_interval_label: string;
  notes: string;
}

const props = defineProps<{
  modelValue: boolean;
  transportTypes?: any[];
  amPmIntervalOptions?: any[];
  editService?: TransportServiceTableItem | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [service: TransportServiceTableItem];
  "updated": [service: TransportServiceTableItem];
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

// Edit mode
const isEditMode = computed(() => !!props.editService);

const formRef = ref<any>(null);
const isFormValid = ref(false);

const form = reactive({
  from_date: "",
  to_date: "",
  vehicle_types: [] as number[],
  am_pm_interval: "",
  notes: "",
});

const tripTimeOptionsList = computed(() => props.amPmIntervalOptions || [
  { title: 'صباحاً', value: 'am' },
  { title: 'مساءً', value: 'pm' },
  { title: 'كلاهما', value: 'both' },
]);

const vehicleTypeOptionsList = computed(() => props.transportTypes || []);

// Watch for edit mode to populate form
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.editService) {
    form.from_date = props.editService.from_date || "";
    form.to_date = props.editService.to_date || "";
    form.vehicle_types = props.editService.vehicle_types || [];
    form.am_pm_interval = props.editService.am_pm_interval || "";
    form.notes = props.editService.notes || "";
  }
});

const resetForm = () => {
  form.from_date = "";
  form.to_date = "";
  form.vehicle_types = [];
  form.am_pm_interval = "";
  form.notes = "";
};

const closeDialog = () => {
  internalOpen.value = false;
  resetForm();
};

// Get labels for display
const getVehicleTypesLabels = (): string => {
  if (!form.vehicle_types.length) return '';
  return form.vehicle_types.map(v => {
    const item = vehicleTypeOptionsList.value.find((i: any) => i.value === v);
    return item?.title || '';
  }).filter(Boolean).join(', ');
};

const getAmPmLabel = (): string => {
  const item = tripTimeOptionsList.value.find((i: any) => i.value === form.am_pm_interval);
  return item?.title || '';
};

const handleSave = async () => {
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  const serviceData: TransportServiceTableItem = {
    id: props.editService?.id,
    from_date: form.from_date,
    to_date: form.to_date,
    vehicle_types: form.vehicle_types,
    vehicle_types_labels: getVehicleTypesLabels(),
    am_pm_interval: form.am_pm_interval,
    am_pm_interval_label: getAmPmLabel(),
    notes: form.notes,
  };

  if (isEditMode.value) {
    emit('updated', serviceData);
  } else {
    emit('saved', serviceData);
  }
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
        {{ isEditMode ? 'تعديل خدمة النقل' : 'إضافة خدمة نقل' }}
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div class="space-y-4">
        <!-- Date Range -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePickerInput 
            label="تاريخ بدء النقل" 
            v-model="form.from_date" 
            placeholder="اختر التاريخ"
            density="comfortable" 
            :rules="[required()]"
          />
          <DatePickerInput 
            label="تاريخ انتهاء النقل" 
            v-model="form.to_date" 
            placeholder="اختر التاريخ"
            density="comfortable" 
            :rules="[required()]"
          />

          <!-- Trip Time -->
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-2 block">
              توقيت النقل
            </label>
            <div class="flex items-center gap-4">
              <v-radio-group 
                v-model="form.am_pm_interval" 
                inline 
                hide-details
              >
                <v-radio 
                  v-for="option in tripTimeOptionsList" 
                  :key="option.value" 
                  :value="option.value" 
                  color="primary"
                >
                  <template #label>
                    <span :class="form.am_pm_interval === option.value ? 'text-primary font-semibold' : 'text-gray-600'">
                      {{ option.title }}
                    </span>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>
          </div>

          <!-- Vehicle Types -->
          <MultipleSelectInput 
            label="نوع المركبات" 
            v-model="form.vehicle_types" 
            :items="vehicleTypeOptionsList"
            placeholder="اختر نوع المركبة" 
            item-title="title" 
            item-value="value" 
          />

          <!-- Notes -->
          <div class="md:col-span-2">
            <TextareaInput 
              label="ملاحظات" 
              v-model="form.notes" 
              placeholder="أدخل الملاحظات" 
              :rows="4"
              density="comfortable" 
              hide-details 
            />
          </div>
        </div>
      </div>

    </v-form>

    <template #actions>
      <div class="flex items-center justify-center gap-4 flex-1 mt-4">
        <ButtonWithIcon 
          variant="flat" 
          color="primary" 
          size="large" 
          custom-class="px-8" 
          :label="isEditMode ? 'حفظ التعديلات' : 'أضف خدمة'"
          :prepend-icon="isEditMode ? undefined : plusIcon" 
          @click="handleSave" 
        />

        <ButtonWithIcon 
          variant="outlined" 
          color="gray-700" 
          border="gray-300" 
          size="large" 
          custom-class="px-4"
          label="إلغاء" 
          @click="handleCancel" 
        />
      </div>
    </template>

  </AppDialog>
</template>

<style scoped></style>
