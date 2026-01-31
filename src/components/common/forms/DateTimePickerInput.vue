<script setup lang="ts">
import { computed } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

type Density = "default" | "comfortable" | "compact";

interface DateTimePickerInputProps {
  modelValue: string | null;
  label?: string;
  placeholder?: string;
  color?: string;
  dir?: string;
  bgColor?: string;
  density?: Density;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  rules?: any[];
  hideDetails?: boolean | "auto";
  hint?: string;
  persistentHint?: boolean;
  errorMessages?: string | string[];
  min?: string;
  max?: string;
  labelClass?: string;
  showCalendarIcon?: boolean;
}

const datepickerIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.834 7.50016H0.833984M11.6673 0.833496V4.16683M5.00065 0.833496V4.16683M4.83398 17.5002H11.834C13.2341 17.5002 13.9342 17.5002 14.469 17.2277C14.9394 16.988 15.3218 16.6055 15.5615 16.1351C15.834 15.6004 15.834 14.9003 15.834 13.5002V6.50016C15.834 5.10003 15.834 4.39997 15.5615 3.86519C15.3218 3.39478 14.9394 3.01233 14.469 2.77265C13.9342 2.50016 13.2341 2.50016 11.834 2.50016H4.83398C3.43385 2.50016 2.73379 2.50016 2.19901 2.77265C1.7286 3.01233 1.34615 3.39478 1.10647 3.86519C0.833984 4.39997 0.833984 5.10003 0.833984 6.50016V13.5002C0.833984 14.9003 0.833984 15.6004 1.10647 16.1351C1.34615 16.6055 1.7286 16.988 2.19901 17.2277C2.73379 17.5002 3.43385 17.5002 4.83398 17.5002Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const props = withDefaults(defineProps<DateTimePickerInputProps>(), {
  color: "primary-300",
  bgColor: "#FFF",
  dir: "rtl",
  density: "comfortable" as Density,
  hideDetails: true,
  clearable: false,
  labelClass: "",
  showCalendarIcon: true,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

const internalValue = computed<string | null>({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val || null);
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
      model-type="format"
      :formats="{ input: 'dd-MM-yyyy HH:mm:ss', preview: 'dd-MM-yyyy HH:mm:ss' }"
      :text-input="{
        format: 'dd-MM-yyyy HH:mm:ss',
        enterSubmit: true,
        tabSubmit: true,
        openMenu: false,
        selectOnFocus: true,
        applyOnBlur: true,
      }"
      :action-row="{
        showSelect: false,
        showCancel: false,
        showPreview: false,
      }"
      :time-config="{ enableSeconds: true, is24: true, timePickerInline: true }"
      :disabled="disabled"
      :readonly="readonly"
      :clearable="clearable"
      :placeholder="placeholder"
      :min-date="min || undefined"
      :max-date="max || undefined"
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
          class="!text-right"
          @update:model-value="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @click="toggleMenu"
        >
          <template #prepend-inner>
            <slot name="prepend-inner">
            </slot>
          </template>
          <template #append-inner>
            <slot name="append-inner">
              <span v-if="showCalendarIcon" v-html="datepickerIcon"></span>
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
html[dir="rtl"] .date-picker-input-wrapper  .v-text-field input{
    text-align: right !important;
  }
html[dir="ltr"] .date-picker-input-wrapper  .v-text-field input{
    text-align: left !important;
  }
  html[dir="rtl"] .date-picker-input-wrapper  .dp--clear-btn{
    left: 0 !important;
    right: auto !important;
  }
  html[dir="ltr"] .date-picker-input-wrapper  .dp--clear-btn{
    right: 0 !important;
    left: auto !important;
  }
  html[dir="rtl"] .dp--arrow-btn-nav{
    transform: rotate(180deg) !important;
  }
</style>
