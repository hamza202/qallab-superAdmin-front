<script setup lang="ts">
import { computed } from 'vue';

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
  selectWidth: '100px',
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

const handleKeydown = (e: KeyboardEvent) => {
    if (props.type === 'number') {
        if (!props.allowNegative && e.key === '-') {
            e.preventDefault();
        }
        // Prevent arrow down from going below 0
        if (!props.allowNegative && e.key === 'ArrowDown') {
            const currentValue = Number(props.modelValue) || 0;
            if (currentValue <= 0) {
                e.preventDefault();
            }
        }
    }
};

const handleWheel = (e: WheelEvent) => {
    if (props.type === 'number') {
        e.preventDefault();
    }
};
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-semibold text-gray-900 mb-2">{{ label }}</label>
    <v-text-field v-model="internalValue" :type="type" variant="outlined" :rules="rules" :density="density"
      :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :hide-details="hideDetails"
      class="price-input" @keydown="handleKeydown" @wheel="handleWheel">
      <template #append-inner>
        <v-divider vertical class="mx-2" />
        <div class="h-full flex items-center bg-gray-100 px-2 -mx-3 rounded-tl-lg !rounded-bl-lg"
          :style="{ width: selectWidth, minWidth: selectWidth }" @mousedown.stop @click.stop>
          <v-select v-model="internalSelectValue" :placeholder="selectPlaceholder" :items="selectItems" variant="plain"
            density="compact" hide-details bg-color="transparent" class="inner-select" :disabled="disabled" />
        </div>
      </template>
    </v-text-field>
  </div>
</template>

<style>
.inner-select.v-select .v-field {
  box-shadow: none !important;
  border: 0 !important;
}
.inner-select.v-select .v-field__input {
  padding: 0 !important;
}

.inner-select.v-select .v-field .v-field__input>input {
  align-self: center !important;
}

.inner-select.v-select .v-field__append-inner{
  align-items: center;
  padding: 0
}
</style>

<style scoped>
/* Hide number input spinners */
.price-input :deep(input[type="number"]::-webkit-outer-spin-button),
.price-input :deep(input[type="number"]::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
}

.price-input :deep(input[type="number"]) {
    -moz-appearance: textfield;
    appearance: textfield;
}
</style>
