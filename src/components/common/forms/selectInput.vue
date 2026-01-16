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

interface SelectInputProps {
    modelValue: string | number | null | (string | number)[];
    label?: string;
    placeholder?: string;
    items: any[];
    color?: string;
    variant?: TextVariant;
    bgColor?: string;
    density?: Density;
    rounded?: string | number | boolean;
    disabled?: boolean;
    readonly?: boolean;
    clearable?: boolean;
    rules?: any[];
    errorMessages?: string | string[];
    hideDetails?: boolean | "auto";
    hint?: string;
    persistentHint?: boolean;
    multiple?: boolean;
    inputProps?: Record<string, any>;
    labelClass?: string;
}

const props = withDefaults(defineProps<SelectInputProps>(), {
    color: "primary-300",
    bgColor: "#FFF",
    density: "comfortable" as Density,
    hideDetails: true,
    clearable: false,
    inputProps: () => ({}),
    labelClass: "",
});

const emit = defineEmits<{
    (e: "update:modelValue", value: string | number | null | (string | number)[]): void;
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
});

</script>

<template>
    <div class="select-input-wrapper">
        <label v-if="label" class="qallab-label" :class="labelClass">
            {{ label }}
        </label>

        <v-select 
            v-model="internalValue" 
            :items="items" 
            :placeholder="placeholder" 
            variant="outlined"
            :color="color" 
            :density="density" 
            :disabled="disabled"
            :readonly="readonly" 
            :clearable="clearable"
            :rules="rules"
            :error-messages="errorMessages" 
            :hide-details="hideDetails" 
            :hint="hint"
            :persistent-hint="persistentHint"
            :multiple="multiple" 
            v-bind="inputProps" 
        />
    </div>
</template>

<style scoped>
</style>
