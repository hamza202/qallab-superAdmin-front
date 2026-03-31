<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { TripLogisticsDetail } from './AddTripDetailsDialog.vue';
import { busIcon } from '@/components/icons/priceOffersIcons';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  tripDetails: TripLogisticsDetail[];
  transportTypes?: any[];
  unitItems?: any[];
  title?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "details-updated": [details: TripLogisticsDetail[]];
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const unitItemsList = computed(() => props.unitItems || []);
const packageTypeItemsList = computed(() => props.transportTypes || []);

const editableDetails = ref<(TripLogisticsDetail & { transport_type: number[] })[]>([]);

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    editableDetails.value = props.tripDetails.map(d => ({
      ...d,
      transport_type: d.vehicle_type_no ? d.vehicle_type_no.map(v => v.transport_type) : [],
    }));
  }
});

const handleSave = () => {
  const resolved = editableDetails.value.map(detail => {
    const unit = unitItemsList.value.find((u: any) => u.value === detail.unit_id);
    const oldVehicles = detail.vehicle_type_no || [];
    return {
      ...detail,
      unit_name: unit?.title ?? detail.unit_name ?? '',
      vehicle_type_no: detail.transport_type.map(typeId => {
        const existing = oldVehicles.find(v => v.transport_type === typeId);
        return {
          transport_type: typeId,
          transport_no: existing ? existing.transport_no : null
        };
      }),
    } as TripLogisticsDetail;
  });
  emit('details-updated', resolved);
  closeDialog();
};

const closeDialog = () => {
  internalOpen.value = false;
  editableDetails.value = [];
};
</script>

<template>
  <AppDialog v-model="internalOpen" :max-width="900">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span v-html="busIcon"></span>
        {{ title || t('common.trips.editTripDetails') }}
      </div>
    </template>

    <div v-if="editableDetails.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <v-icon size="64" color="gray-400">mdi-bus</v-icon>
      <p class="mt-4 text-lg font-medium">{{ t('common.trips.noDetailsToEdit') }}</p>
      <p class="text-sm text-gray-400 mt-1">{{ t('common.trips.addProductsFirst') }}</p>
    </div>

    <div v-else class="space-y-3 max-h-[500px] overflow-auto custom-scroll">
      <div v-for="detail in editableDetails" :key="detail.item_id"
        class="flex flex-col rounded-lg border !border-gray-100 p-4 bg-white">
        <div class="font-medium text-gray-900 mb-3 text-lg">{{ detail.item_name }}</div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <PriceInput v-model="detail.quantity" :placeholder="t('common.productDialog.quantity')" density="compact" />
          </div>
          <div>
            <SelectInput v-model="detail.unit_id" :items="unitItemsList" :placeholder="t('common.productDialog.unit')" density="compact"
              item-title="title" item-value="value" />
          </div>
          <div class="md:col-span-2">
            <SelectInput v-model="detail.transport_type" :items="packageTypeItemsList" multiple
              :placeholder="t('common.trips.transportVehicleType')" density="compact" item-title="title" item-value="value" />
          </div>
        </div>

        <div class="mt-3 w-1/4">
          <PriceInput v-model="detail.price" :placeholder="t('common.trips.price')" density="compact" showRialIcon />
        </div>
      </div>
    </div>

    <template #actions>
      <div class="flex items-center justify-center gap-4 flex-1 mt-4">
        <ButtonWithIcon variant="flat" color="primary" size="large" custom-class="px-8" :label="t('common.productDialog.saveChanges')"
          @click="handleSave" />
        <ButtonWithIcon variant="outlined" color="gray-700" border="gray-300" size="large" custom-class="px-4"
          :label="t('common.actions.cancel')" @click="closeDialog" />
      </div>
    </template>
  </AppDialog>
</template>

<style scoped>
:deep(.v-field__input) {
  min-height: 36px !important;
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 999px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
