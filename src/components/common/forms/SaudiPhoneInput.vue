<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  modelValue?: string | null;
  label?: string;
  placeholder?: string;
  rules?: any[];
  disabled?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  label: "رقم الهاتف",
  placeholder: "05xxxxxxxx",
  rules: () => [],
  disabled: false,
  readonly: false,
});

const emit = defineEmits(["update:modelValue"]);

const displayValue = ref("");

// Sync from backend (+966...) to display (05...)
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const stringVal = val.toString();
      if (stringVal.startsWith("+966")) {
        // Remove +966 and add 0
        displayValue.value = "0" + stringVal.slice(4);
      } else if (stringVal.startsWith("966")) {
        displayValue.value = "0" + stringVal.slice(3);
      } else {
        displayValue.value = stringVal;
      }
    } else {
      displayValue.value = "";
    }
  },
  { immediate: true }
);

const handleInput = (val: string) => {
  // Allow only numbers
  const cleaned = val.replace(/\D/g, "");
  displayValue.value = cleaned;

  // Format to send to backend
  // If it starts with 05 and has numbers, convert to +966...
  if (cleaned.startsWith("0")) {
    const backendValue = "+966" + cleaned.slice(1);
    emit("update:modelValue", backendValue);
  } else {
    // If user enters format not starting with 0 (unlikely with this specific input guidance)
    // Just emit as is, or handle appropriately.
    // For specific requirement "05...", we expect 0.
    emit("update:modelValue", cleaned);
  }
};

// Custom validation rule for Saudi Phone
const saudiPhoneRule = (v: string) => {
  if (!v) return true; // Let required rule handle emptiness
  // Check the display value for validation
  return (
    /^05\d{8}$/.test(displayValue.value) ||
    "يجب أن يبدأ الرقم بـ 05 ويتكون من 10 أرقام"
  );
};
</script>

<template>
  <div class="saudi-phone-input">
    <label v-if="label" class="qallab-label mb-2 block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    
    <v-text-field
      v-model="displayValue"
      :placeholder="placeholder"
      variant="outlined"
      density="comfortable"
      :rules="[...rules, saudiPhoneRule]"
      :disabled="disabled"
      :readonly="readonly"
      maxlength="10"
      hide-details="auto"
      class="text-left-input"
      @update:model-value="handleInput"
    >
      <template #prepend-inner>
        <div class="flex items-center gap-2 pl-2 border-l border-gray-200 ml-2 h-full">
          <span class="text-sm font-medium px-2 py-1">KSA</span>
        </div>
      </template>
    </v-text-field>
  </div>
</template>

<style scoped>
.saudi-phone-input :deep(.v-field__input) {
  direction: ltr;
  text-align: left;
}
</style>
