<script setup lang="ts">
import { computed } from "vue";

type Density = "default" | "comfortable" | "compact";

interface CheckboxInputProps {
    modelValue: boolean;
    label?: string;
    color?: string;
    classes?: string;
    density?: Density;
    disabled?: boolean;
    readonly?: boolean;
    hideDetails?: boolean | "auto";
    /** Any extra props to forward directly to v-checkbox */
    inputProps?: Record<string, any>;
}

const props = withDefaults(defineProps<CheckboxInputProps>(), {
    color: "primary",
    density: "compact" as Density,
    hideDetails: true,
    inputProps: () => ({}),
});

const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit("update:modelValue", val),
});
</script>

<template>
    <v-checkbox 
        v-model="internalValue" 
        :label="label" 
        :color="color" 
        :density="density" 
        :disabled="disabled"
        :readonly="readonly" 
        :hide-details="hideDetails" 
        v-bind="inputProps" 
        :class="classes" 
    />
</template>

<!-- Styles are defined in main.scss using .qallab-checkbox class -->