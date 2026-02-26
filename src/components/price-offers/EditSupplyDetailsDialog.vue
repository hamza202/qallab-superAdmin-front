<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppDialog from '@/components/common/AppDialog.vue';
import TextInput from '@/components/common/forms/textInput.vue';
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import MultipleSelectInput from '@/components/common/forms/MultipleSelectInput.vue';
import SelectInput from '@/components/common/forms/selectInput.vue';
import PriceInput from '@/components/common/forms/PriceInput.vue';
import ButtonWithIcon from '@/components/common/buttons/ButtonWithIcon.vue';

export interface SupplyDetailRow {
  item_id: number;
  item_name: string;
  quantity: number | null;
  unit_name: string;
  transport_start_date: string;
  trip_no?: number | null;
  vehicle_types?: (string | number)[];
  /** سعة الرحلة (اختياري - يُعرض في طلبات المشتريات) */
  trip_capacity?: number | null;
  /** توقيت الرحلة (اختياري - يُعرض في طلبات المشتريات) */
  am_pm_interval?: string | null;
  trip_date?: string | null;
  trip_price?: number | null;
  transport_type?: (string | number)[];
}

type SupplyDetailRowInternal = Required<SupplyDetailRow> & {
  trip_no: number | null;
  vehicle_types: (string | number)[];
  trip_capacity: number | null;
  am_pm_interval: string | null;
  trip_date: string | null;
  trip_price: number | null;
  transport_type: (string | number)[];
};

const props = defineProps<{
  modelValue: boolean;
  products: SupplyDetailRow[];
  transportTypeItems?: { title: string; value: string | number }[];
  /** عند التعديل من جدول تفاصيل التوريد: عرض منتج واحد فقط */
  singleProductItemId?: number | null;
  /** إظهار حقل سعة الرحلة (طلبات المشتريات فقط) */
  showTripCapacity?: boolean;
  /** عناصر توقيت الرحلة - إذا أُرسلت يظهر الحقل (صباحاً/مساءً/كلاهما) */
  amPmIntervalItems?: { title: string; value: string }[];
  requestType?: 'logistics-trips' | 'other';
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  saved: [rows: SupplyDetailRow[]];
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const vehicleOptions = computed(() => props.transportTypeItems || []);

const rows = ref<SupplyDetailRowInternal[]>([]);

const getQuantityDisplay = (row: SupplyDetailRow) => {
  const q = row.quantity != null ? String(row.quantity) : '';
  const u = row.unit_name || '';
  return [q, u].filter(Boolean).join(' ') || '—';
};

watch(
  () => [props.modelValue, props.products, props.singleProductItemId] as const,
  ([open, products]) => {
    if (open && products?.length) {
      const list = props.singleProductItemId != null
        ? products.filter((p) => p.item_id === props.singleProductItemId)
        : [...products];
      rows.value = list.map((p) => ({
        item_id: p.item_id,
        item_name: p.item_name,
        quantity: p.quantity,
        unit_name: p.unit_name,
        transport_start_date: p.transport_start_date || '',
        trip_no: p.trip_no ?? null,
        vehicle_types: Array.isArray(p.vehicle_types) ? [...p.vehicle_types] : (p.vehicle_types != null ? [p.vehicle_types] : []),
        trip_capacity: p.trip_capacity ?? null,
        am_pm_interval: p.am_pm_interval ?? null,
        trip_date: p.trip_date ?? null,
        trip_price: p.trip_price ?? null,
        transport_type: Array.isArray(p.transport_type) ? [...p.transport_type] : (p.transport_type != null ? [p.transport_type] : []),
      } as SupplyDetailRowInternal));
    }
  },
  { immediate: true }
);

const closeDialog = () => {
  internalOpen.value = false;
};

const handleSave = () => {
  emit('saved', rows.value);
  closeDialog();
};

const truckIcon = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 14V4.2C15 3.0799 15 2.51984 14.782 2.09202C14.5903 1.71569 14.2843 1.40973 13.908 1.21799C13.4802 1 12.9201 1 11.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V10.8C1 11.9201 1 12.4802 1.21799 12.908C1.40973 13.2843 1.71569 13.5903 2.09202 13.782C2.51984 14 3.0799 14 4.2 14H15ZM15 14H19.4C19.9601 14 20.2401 14 20.454 13.891C20.6422 13.7951 20.7951 13.6422 20.891 13.454C21 13.2401 21 12.9601 21 12.4V9.66274C21 9.41815 21 9.29586 20.9724 9.18077C20.9479 9.07873 20.9075 8.98119 20.8526 8.89172C20.7908 8.7908 20.7043 8.70432 20.5314 8.53137L18.4686 6.46863C18.2957 6.29568 18.2092 6.2092 18.1083 6.14736C18.0188 6.09253 17.9213 6.05213 17.8192 6.02763C17.7041 6 17.5818 6 17.3373 6H15M8 16.5C8 17.8807 6.88071 19 5.5 19C4.11929 19 3 17.8807 3 16.5C3 15.1193 4.11929 14 5.5 14C6.88071 14 8 15.1193 8 16.5ZM19 16.5C19 17.8807 17.8807 19 16.5 19C15.1193 19 14 17.8807 14 16.5C14 15.1193 15.1193 14 16.5 14C17.8807 14 19 15.1193 19 16.5Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

</script>

<template>
  <AppDialog v-model="internalOpen" :max-width="900">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="!bg-gray-50 border border-gray-100 rounded px-1.5 py-1.5 text-gray-600">
          <span v-html="truckIcon"></span>
        </span>
        تعديل تفاصيل التوريد
      </div>
    </template>

    <div class="space-y-3 min-h-[200px] max-h-[70vh] overflow-y-auto custom-scroll px-1">
      <div
        v-for="(row, index) in rows"
        :key="`${index}-${row.item_id}`"
        class="flex flex-wrap gap-3 rounded-lg border border-gray-100 p-3 bg-white items-end"
      >
        <!-- 1. اسم المنتج + الكمية والوحدة (معطّل) - أيمن في RTL -->
        <div class="min-w-[140px] flex-1 shrink-0">
          <p class="font-medium text-gray-900 mb-1">{{ row.item_name }}</p>
          <TextInput
            :model-value="getQuantityDisplay(row)"
            disabled
            density="compact"
            class="w-full"
            :input-props="{ readonly: true }"
          />
        </div>

        <!-- 2. تاريخ بداية النقل أو تاريخ الرحلة -->
        <div class="min-w-[160px] shrink-0">
          <DatePickerInput
            v-if="requestType === 'logistics-trips'"
            v-model="rows[index].trip_date"
            placeholder="تاريخ الرحلة"
            density="compact"
            class="w-full"
            hide-details
          />
          <DatePickerInput
            v-else
            v-model="rows[index].transport_start_date"
            placeholder="تاريخ بداية النقل"
            density="compact"
            class="w-full"
            hide-details
          />
        </div>

        <!-- 3. عدد الرحلات أو سعر الرحلة -->
        <div class="min-w-[120px] shrink-0">
          <PriceInput
            v-if="requestType === 'logistics-trips'"
            v-model="rows[index].trip_price"
            showRialIcon
            placeholder="سعر الرحلة"
            density="compact"
            class="w-full"
            hide-details
          />
          <TextInput
            v-else
            v-model="rows[index].trip_no"
            type="number"
            placeholder="عدد الرحلات"
            density="compact"
            class="w-full"
            hide-details
          />
        </div>

        <!-- 4. نوع المركبات -->
        <div class="min-w-[200px] flex-1 shrink-0">
          <MultipleSelectInput
            v-if="requestType === 'logistics-trips'"
            v-model="rows[index].transport_type"
            :items="vehicleOptions"
            placeholder="نوع المركبات"
            density="compact"
            item-title="title"
            item-value="value"
            class="w-full"
            hide-details
          />
          <MultipleSelectInput
            v-else
            v-model="rows[index].vehicle_types"
            :items="vehicleOptions"
            placeholder="نوع المركبات"
            density="compact"
            item-title="title"
            item-value="value"
            class="w-full"
            hide-details
          />
        </div>

        <!-- 5. سعة الرحلة (اختياري - طلبات المشتريات) -->
        <div v-if="showTripCapacity" class="min-w-[120px] shrink-0">
          <PriceInput
            :model-value="rows[index].trip_capacity ?? null"
            type="number"
            placeholder="سعة الرحلة"
            density="compact"
            class="w-full"
            hide-details
            @update:model-value="(v) => {
              const numericValue = v === '' || v === null ? null : Number(v);
              rows[index].trip_capacity = Number.isFinite(numericValue) ? numericValue : null;
            }"
          />
        </div>

        <!-- 6. توقيت الرحلة (اختياري - طلبات المشتريات) -->
        <div v-if="amPmIntervalItems?.length" class="min-w-[140px] shrink-0">
          <SelectInput
            :model-value="rows[index].am_pm_interval ?? null"
            :items="amPmIntervalItems"
            placeholder="توقيت الرحلة"
            density="compact"
            item-title="title"
            item-value="value"
            class="w-full"
            hide-details
            @update:model-value="(v) => (rows[index].am_pm_interval = typeof v === 'string' ? v : null)"
          />
        </div>
      </div>
    </div>

    <template #actions>
      <div class="flex items-center justify-center gap-4 flex-1 mt-4">
        <ButtonWithIcon
          variant="outlined"
          color="gray-700"
          border="gray-300"
          size="large"
          custom-class="px-6"
          label="إلغاء"
          @click="closeDialog"
        />
        <ButtonWithIcon
          variant="flat"
          color="primary"
          size="large"
          custom-class="px-8"
          label="حفظ"
          @click="handleSave"
        />
      </div>
    </template>
  </AppDialog>
</template>

<style scoped>
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
</style>
