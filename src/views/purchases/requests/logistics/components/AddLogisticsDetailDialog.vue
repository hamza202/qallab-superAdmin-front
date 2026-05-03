<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { required } from "@/utils/validators";
import { playIcon, truckIcon } from "@/components/icons/priceOffersIcons";
import { plusIcon } from "@/components/icons/globalIcons";
import { plusCircleIcon } from "@/components/icons/productIcons";

const { t } = useI18n();

export interface LogisticsDetail {
  id?: number;
  material_type: number[];
  trip_no: number | null;
  actual_execution_interval: number | null;
  am_pm_interval: string | null;
  from_date: string;
  to_date: string;
  transport_type: number[];
  transport_no: number | null;
  loading_responsible_party: string;
  downloading_responsible_party: string;
  target_location: string;
  target_latitude: string | number;
  target_longitude: string | number;
  source_location: string;
  source_latitude: string | number;
  source_longitude: string | number;
}

const props = defineProps<{
  modelValue: boolean;
  transportTypes?: any[];
  materialTypes?: any[];
  categoriesItems?: any[];
  amPmIntervalOptions?: any[];
  editDetail?: LogisticsDetail | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [detail: LogisticsDetail];
  "updated": [detail: LogisticsDetail];
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

// Edit mode
const isEditMode = computed(() => !!props.editDetail);

const formRef = ref<any>(null);
const isFormValid = ref(false);

const form = reactive({
  material_type: [] as number[],
  trip_no: null as number | null,
  actual_execution_interval: null as number | null,
  am_pm_interval: null as string | null,
  from_date: "",
  to_date: "",
  transport_type: [] as number[],
  transport_no: null as number | null,
  loading_responsible_party: "",
  downloading_responsible_party: "",
  target_location: "",
  target_latitude: "" as string | number,
  target_longitude: "" as string | number,
  source_location: "",
  source_latitude: "" as string | number,
  source_longitude: "" as string | number,
});

const transportTypesList = computed(() => props.transportTypes || []);
const amPmIntervalList = computed(() => props.amPmIntervalOptions || []);
const categoriesList = computed(() => props.categoriesItems || []);

const populateFormFromEditDetail = () => {
  if (!props.editDetail) return;
  form.material_type = props.editDetail.material_type || [];
  form.trip_no = props.editDetail.trip_no;
  form.actual_execution_interval = props.editDetail.actual_execution_interval;
  form.am_pm_interval = props.editDetail.am_pm_interval || "";
  form.from_date = props.editDetail.from_date || "";
  form.to_date = props.editDetail.to_date || "";
  form.transport_type = props.editDetail.transport_type || [];
  form.transport_no = props.editDetail.transport_no;
  form.loading_responsible_party = props.editDetail.loading_responsible_party || "";
  form.downloading_responsible_party = props.editDetail.downloading_responsible_party || "";
  form.target_location = props.editDetail.target_location || "";
  form.target_latitude = props.editDetail.target_latitude || "";
  form.target_longitude = props.editDetail.target_longitude || "";
  form.source_location = props.editDetail.source_location || "";
  form.source_latitude = props.editDetail.source_latitude || "";
  form.source_longitude = props.editDetail.source_longitude || "";
};

// Watch dialog open/close
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.editDetail) {
      populateFormFromEditDetail();
    } else {
      resetForm();
    }
  } else {
    resetForm();
    if (formRef.value?.resetValidation) {
      formRef.value.resetValidation();
    }
  }
});

const resetForm = () => {
  form.material_type = [];
  form.trip_no = null;
  form.actual_execution_interval = null;
  form.am_pm_interval = null;
  form.from_date = "";
  form.to_date = "";
  form.transport_type = [];
  form.transport_no = null;
  form.loading_responsible_party = "";
  form.downloading_responsible_party = "";
  form.target_location = "";
  form.target_latitude = "";
  form.target_longitude = "";
  form.source_location = "";
  form.source_latitude = "";
  form.source_longitude = "";
};

const closeDialog = () => {
  internalOpen.value = false;
  resetForm();
  if (formRef.value?.resetValidation) {
    formRef.value.resetValidation();
  }
};

const handleSave = async () => {
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  const detailData: LogisticsDetail = {
    id: props.editDetail?.id,
    material_type: form.material_type,
    trip_no: form.trip_no,
    actual_execution_interval: form.actual_execution_interval,
    am_pm_interval: form.am_pm_interval,
    from_date: form.from_date,
    to_date: form.to_date,
    transport_type: form.transport_type,
    transport_no: form.transport_no,
    loading_responsible_party: form.loading_responsible_party,
    downloading_responsible_party: form.downloading_responsible_party,
    target_location: form.target_location,
    target_latitude: form.target_latitude,
    target_longitude: form.target_longitude,
    source_location: form.source_location,
    source_latitude: form.source_latitude,
    source_longitude: form.source_longitude,
  };

  if (isEditMode.value) {
    emit('updated', detailData);
  } else {
    emit('saved', detailData);
  }
  closeDialog();
};

const handleCancel = () => {
  closeDialog();
};

const showTargetMapDialog = ref(false);
const showSourceMapDialog = ref(false);
</script>

<template>
  <AppDialog v-model="internalOpen" :max-width="700">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="!bg-gray-50 border border-gray-100 rounded px-1.5 py-1.5 text-gray-600">
          <span v-html="truckIcon"></span>
        </span>
        {{ isEditMode ? t('purchases.requests.logistics.addDetailDialog.titleEdit') : t('purchases.requests.logistics.addDetailDialog.titleAdd') }}
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div class="space-y-4">
        <!-- Row 1: Date Range -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <span>
            <DatePickerInput :label="t('purchases.requests.logistics.addDetailDialog.labels.fromDate')" v-model="form.from_date" :placeholder="t('purchases.shared.forms.common.select')"
              density="comfortable" :rules="[required()]" />
            <p class="text-sm text-gray-500 mt-1">{{ t('purchases.shared.forms.common.dateHint') }}</p>
          </span>
          <DatePickerInput :label="t('purchases.requests.logistics.addDetailDialog.labels.toDate')" v-model="form.to_date" :placeholder="t('purchases.shared.forms.common.select')"
            density="comfortable" :rules="[required()]" />
          <PriceInput :label="t('purchases.requests.logistics.addDetailDialog.labels.executionDuration')" v-model="form.actual_execution_interval"
            :placeholder="t('purchases.requests.logistics.addDetailDialog.labels.executionDurationPlaceholder')" density="comfortable" :rules="[required()]">
            <template #append-inner>
              <span class="text-gray-500 text-sm"> {{ t('purchases.shared.forms.common.day') }} </span>
            </template>
          </PriceInput>

          <SelectInput :label="t('purchases.requests.logistics.addDetailDialog.labels.transportTimes')" v-model="form.am_pm_interval" :items="amPmIntervalList" :placeholder="t('purchases.shared.forms.common.select')"
           density="comfortable" :rules="[required()]" />
          <MultipleSelectInput :label="t('purchases.requests.logistics.addDetailDialog.labels.vehicleTypes')" v-model="form.transport_type" :items="transportTypesList"
            :placeholder="t('purchases.requests.logistics.addDetailDialog.labels.vehicleTypesPlaceholder')" item-title="title" item-value="value" :rules="[required()]" />

          <PriceInput :label="t('purchases.requests.logistics.addDetailDialog.labels.vehicleCount')" v-model="form.transport_no" :placeholder="t('purchases.requests.logistics.addDetailDialog.labels.vehicleCountPlaceholder')" density="comfortable"
            :rules="[required()]" />
          <MultipleSelectInput :label="t('purchases.requests.logistics.addDetailDialog.labels.materialTypes')" v-model="form.material_type" :items="categoriesList"
            :placeholder="t('purchases.shared.forms.common.select')"  :rules="[required()]" />

          <PriceInput :label="t('purchases.requests.logistics.addDetailDialog.labels.tripCount')" v-model="form.trip_no" :placeholder="t('purchases.requests.logistics.addDetailDialog.labels.tripCountPlaceholder')" density="comfortable"
            :rules="[required()]" />
          <TextInput :label="t('purchases.requests.logistics.addDetailDialog.labels.loadingResponsible')" v-model="form.loading_responsible_party" :placeholder="t('purchases.requests.logistics.addDetailDialog.labels.loadingResponsiblePlaceholder')"
            density="comfortable" :rules="[required()]" />

          <TextInput :label="t('purchases.requests.logistics.addDetailDialog.labels.unloadingResponsible')" v-model="form.downloading_responsible_party"
            :placeholder="t('purchases.requests.logistics.addDetailDialog.labels.unloadingResponsiblePlaceholder')" density="comfortable" :rules="[required()]" />
        </div>
      </div>
    </v-form>

    <template #actions>
      <div class="flex items-center justify-center gap-4 flex-1 mt-4">
        <ButtonWithIcon variant="flat" color="primary" custom-class="px-8"
          :label="isEditMode ? t('purchases.requests.logistics.addDetailDialog.actions.saveEdits') : t('purchases.requests.logistics.addDetailDialog.actions.addService')" :prepend-icon="isEditMode ? undefined : plusCircleIcon"
          @click="handleSave" />

        <ButtonWithIcon variant="outlined" color="gray-700" border="gray-300" size="large" custom-class="px-4"
          :label="t('common.actions.cancel')" @click="handleCancel" />
      </div>
    </template>
  </AppDialog>
</template>

<style scoped></style>
