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
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-semibold text-gray-900 mb-2">{{ label }}</label>
    <v-text-field
      v-model="internalValue"
      :type="type"
      variant="outlined"
      :rules="rules"
      :density="density"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :hide-details="hideDetails"
    >
      <template #append-inner>
        <v-divider vertical class="mx-2" />
        <div class="h-full flex items-center bg-gray-100 px-2 -mx-3 rounded-tl-lg !rounded-bl-lg" @mousedown.stop @click.stop>
          <v-select
            v-model="internalSelectValue"
            :placeholder="selectPlaceholder"
            :items="selectItems"
            variant="plain"
            density="compact"
            hide-details
            bg-color="transparent"
            class="inner-select"
            :style="{ width: selectWidth, minWidth: selectWidth }"
            :disabled="disabled"
          />
        </div>
      </template>
    </v-text-field>
  </div>
</template>

<style scoped>
:deep(.inner-select .v-field__input) {
}

:deep(.inner-select .v-field__append-inner) {
}

:deep(.inner-select .v-input__control) {
}
</style>
