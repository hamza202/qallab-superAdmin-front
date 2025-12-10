<script setup lang="ts">
import { computed } from "vue";

type Density = "default" | "comfortable" | "compact";

type TextVariant =
    | "filled"
    | "outlined"
    | "plain"
    | "solo"
    | "solo-filled"
    | "solo-inverted"
    | "underlined";

interface TextareaInputProps {
    modelValue: string | null;
    label?: string;
    placeholder?: string;
    color?: string;
    variant?: TextVariant;
    bgColor?: string;
    density?: Density;
    rounded?: string | number | true;
    disabled?: boolean;
    readonly?: boolean;
    clearable?: boolean;
    rows?: number | string;
    autoGrow?: boolean;
    noResize?: boolean;
    counter?: true | number | string;
    maxlength?: number | string;
    rules?: any[];
    hideDetails?: boolean | "auto";
    hint?: string;
    persistentHint?: boolean;
    inputProps?: Record<string, any>;
    labelClass?: string;
}

const props = withDefaults(defineProps<TextareaInputProps>(), {
    color: "primary-300",
    bgColor: "#FFF",
    density: "comfortable" as Density,
    hideDetails: true,
    rows: 4,
    autoGrow: false,
    noResize: false,
    inputProps: () => ({}),
    labelClass: "",
});

const emit = defineEmits<{
    (e: "update:modelValue", value: string | null): void;
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
});

</script>

<template>
    <div class="textarea-wrapper">
        <label v-if="label" class="qallab-label" :class="labelClass">
            {{ label }}
        </label>

        <v-textarea
            v-model="internalValue"
            :placeholder="placeholder"
            variant="outlined"
            :color="color"
            :density="density"
            :disabled="disabled"
            :readonly="readonly"
            :clearable="clearable"
            :rows="rows"
            :auto-grow="autoGrow"
            :no-resize="noResize"
            :counter="counter"
            :maxlength="maxlength"
            :rules="rules"
            :hide-details="hideDetails"
            :hint="hint"
            :persistent-hint="persistentHint"
            v-bind="inputProps"
        />
    </div>
</template>

<style scoped>
</style>
