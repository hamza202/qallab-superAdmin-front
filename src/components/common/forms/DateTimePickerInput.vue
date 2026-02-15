<script setup lang="ts">
import { computed } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

type Density = "default" | "comfortable" | "compact";

interface Props {
  modelValue: string | null;
  label?: string;
  placeholder?: string;
  color?: string;
  density?: Density;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  rules?: any[];
  hideDetails?: boolean | "auto";
  hint?: string;
  persistentHint?: boolean;
  errorMessages?: string | string[];
  minDate?: string;
  maxDate?: string;
  labelClass?: string;
  showCalendarIcon?: boolean;
}

const CALENDAR_ICON = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.834 7.50016H0.833984M11.6673 0.833496V4.16683M5.00065 0.833496V4.16683M4.83398 17.5002H11.834C13.2341 17.5002 13.9342 17.5002 14.469 17.2277C14.9394 16.988 15.3218 16.6055 15.5615 16.1351C15.834 15.6004 15.834 14.9003 15.834 13.5002V6.50016C15.834 5.10003 15.834 4.39997 15.5615 3.86519C15.3218 3.39478 14.9394 3.01233 14.469 2.77265C13.9342 2.50016 13.2341 2.50016 11.834 2.50016H4.83398C3.43385 2.50016 2.73379 2.50016 2.19901 2.77265C1.7286 3.01233 1.34615 3.39478 1.10647 3.86519C0.833984 4.39997 0.833984 5.10003 0.833984 6.50016V13.5002C0.833984 14.9003 0.833984 15.6004 1.10647 16.1351C1.34615 16.6055 1.7286 16.988 2.19901 17.2277C2.73379 17.5002 3.43385 17.5002 4.83398 17.5002Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const props = withDefaults(defineProps<Props>(), {
  color: "primary-300",
  density: "comfortable",
  hideDetails: false,
  clearable: false,
  labelClass: "",
  showCalendarIcon: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
}>();

/**
 * Format Date object to string: dd-MM-yyyy HH:mm:ss
 */
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Parse string dd-MM-yyyy HH:mm:ss to Date object
 */
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  
  const [, day, month, year, hours, minutes, seconds] = match;
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes),
    parseInt(seconds)
  );
};

const internalValue = computed<Date | null>({
  get: () => parseDate(props.modelValue ?? ""),
  set: (val) => {
    emit("update:modelValue", val ? formatDate(val) : null);
  },
});
</script>

<template>
  <div class="date-picker-input-wrapper">
    <label v-if="label" class="qallab-label" :class="labelClass">
      {{ label }}
    </label>

    <VueDatePicker
      v-model="internalValue"
      :format="formatDate"
      :preview-format="formatDate"
      :time-config="{
        enableSeconds: true,
        is24: true,
      }"
      :text-input="{
        enterSubmit: true,
        tabSubmit: true,
      }"
      :disabled="disabled"
      :readonly="readonly"
      :clearable="clearable"
      :placeholder="placeholder"
      :min-date="minDate"
      :max-date="maxDate"
      auto-apply
    >
      <template #dp-input="{ value, onInput, onBlur, onFocus, toggleMenu }">
        <v-text-field
          :model-value="value"
          :placeholder="placeholder"
          variant="outlined"
          :color="color"
          :density="density"
          :disabled="disabled"
          :readonly="readonly"
          :error-messages="errorMessages"
          :rules="rules"
          :clearable="clearable"
          :hide-details="hideDetails"
          :hint="hint"
          :persistent-hint="persistentHint"
          @update:model-value="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @click="toggleMenu"
        >
          <template #prepend-inner>
            <slot name="prepend-inner" />
          </template>
          <template #append-inner>
            <slot name="append-inner">
              <span v-if="showCalendarIcon" v-html="CALENDAR_ICON" />
            </slot>
          </template>
        </v-text-field>
      </template>
    </VueDatePicker>
  </div>
</template>

<style lang="scss">
.date-picker-input-wrapper {
  width: 100%;
}

html[dir="rtl"] {
  .date-picker-input-wrapper .v-text-field input {
    text-align: right !important;
  }

  .date-picker-input-wrapper .dp--clear-btn {
    left: 0 !important;
    right: auto !important;
  }

  .dp--arrow-btn-nav {
    transform: rotate(180deg) !important;
  }
}

html[dir="ltr"] {
  .date-picker-input-wrapper .v-text-field input {
    text-align: left !important;
  }

  .date-picker-input-wrapper .dp--clear-btn {
    right: 0 !important;
    left: auto !important;
  }
}
</style>
