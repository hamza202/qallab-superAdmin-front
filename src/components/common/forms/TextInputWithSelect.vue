<script setup lang="ts">
import { computed } from 'vue';
import SarIcon from '@/components/icons/SarIcon.vue';

interface SelectItem {
  title: string;
  value: any;
}

interface Props {
  modelValue?: string | number | null;
  selectValue?: any;
  label?: string;
  placeholder?: string;
  selectPlaceholder?: string;
  selectItems?: SelectItem[];
  type?: string;
  rules?: any[];
  density?: 'default' | 'comfortable' | 'compact';
  disabled?: boolean;
  readonly?: boolean;
  hideDetails?: boolean;
  selectWidth?: string;
  /** When type="number": allow negative values (default false) */
  allowNegative?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  selectValue: null,
  label: '',
  placeholder: '',
  selectPlaceholder: 'اختر',
  selectItems: () => [],
  type: 'text',
  rules: () => [],
  density: 'comfortable',
  disabled: false,
  readonly: false,
  hideDetails: false,
  selectWidth: '75px',
  allowNegative: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null];
  'update:selectValue': [value: any];
}>();

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const internalSelectValue = computed({
  get: () => props.selectValue,
  set: (val) => emit('update:selectValue', val),
});

const isPercentItem = (title: string) => /نسبة|مئوية|%/.test(title);

// When type="number": block "e"/"E" and optional negative (same behavior as PriceInput)
const handleKeydown = (e: KeyboardEvent) => {
  if (props.type !== 'number') return;
  if (e.key === 'e' || e.key === 'E') {
    e.preventDefault();
  }
  if (!props.allowNegative && e.key === '-') {
    e.preventDefault();
  }
  if (!props.allowNegative && e.key === 'ArrowDown') {
    const currentValue = Number(props.modelValue) || 0;
    if (currentValue <= 0) e.preventDefault();
  }
};

const handleWheel = (e: WheelEvent) => {
  if (props.type === 'number') e.preventDefault();
};
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-semibold text-gray-900 mb-2">{{ label }}</label>
    <v-text-field
      class="text-input-with-select"
      v-model="internalValue"
      :type="type"
      variant="outlined"
      :rules="rules"
      :density="density"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :hide-details="hideDetails"
      @keydown="handleKeydown"
      @wheel="handleWheel"
    >
      <template #append-inner>
        <v-divider vertical class="mx-2" />
        <div class="h-full flex items-center bg-gray-100 px-2 -mx-3 rounded-tl-lg !rounded-bl-lg" :style="{ width: selectWidth, minWidth: selectWidth }" @mousedown.stop @click.stop>
          <v-select
            v-model="internalSelectValue"
            :placeholder="selectPlaceholder"
            :items="selectItems"
            variant="plain"
            density="compact"
            hide-details
            bg-color="transparent"
            class="inner-select"
            :disabled="disabled"
          >
            <template #item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps" :title="undefined">
                <div class="flex items-center justify-center py-1">
                  <span v-if="isPercentItem(item.title)" class="text-base font-bold text-gray-700">%</span>
                  <SarIcon v-else :width="16" :height="18" color="#374151" />
                </div>
              </v-list-item>
            </template>
            <template #selection="{ item }">
              <div class="currency-selection">
                <span v-if="isPercentItem(item.title)" class="text-base font-bold text-gray-700">%</span>
                <SarIcon v-else :width="16" :height="18" color="#374151" />
              </div>
            </template>
          </v-select>
        </div>
      </template>
    </v-text-field>
  </div>
</template>

<style scoped>
/* Hide number input spinners - same as PriceInput.vue */
.text-input-with-select :deep(input[type="number"]::-webkit-outer-spin-button),
.text-input-with-select :deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.text-input-with-select :deep(input[type="number"]) {
  -moz-appearance: textfield;
}
</style>

<style>
.inner-select.v-select .v-field {
  box-shadow: none !important;
  border: 0 !important;
}
.inner-select.v-select .v-field__input {
  padding: 0 !important;
  min-height: unset !important;
}
.inner-select.v-select .v-field .v-field__input > input {
  align-self: center !important;
}
.inner-select.v-select .v-field__append-inner {
  align-items: center;
  padding: 0;
  margin-inline-start: 2px;
}
.currency-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  line-height: 1;
}
</style>
