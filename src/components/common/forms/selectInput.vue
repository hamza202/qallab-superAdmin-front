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
    modelValue: string | number | null;
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
    hideDetails?: boolean | "auto";
    hint?: string;
    persistentHint?: boolean;
    inputProps?: Record<string, any>;
    labelClass?: string;
}

const props = withDefaults(defineProps<SelectInputProps>(), {
    color: "primary",
    bgColor: "#FAFAFA",
    density: "comfortable" as Density,
    hideDetails: true,
    clearable: false,
    inputProps: () => ({}),
    labelClass: "",
});

const emit = defineEmits<{
    (e: "update:modelValue", value: string | number | null): void;
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
});

const computedVariant = computed<TextVariant>(() => {
    return props.variant ?? "plain";
});

const inputClasses = computed(() => {
    if (props.variant) {
        return "text-sm";
    }

    return "text-sm rounded-xl bg-[#FAFAFA]";
});
</script>

<template>
    <div class="mb-4">
        <div v-if="label" class="mb-1.5 text-sm font-semibold text-gray-800" :class="labelClass">
            {{ label }}
        </div>

        <v-select v-model="internalValue" :items="items" :placeholder="placeholder" :variant="computedVariant"
            :color="color" :bg-color="bgColor" :density="density" :rounded="rounded ?? 'lg'" :disabled="disabled"
            :readonly="readonly" :clearable="clearable" :hide-details="hideDetails" :hint="hint"
            :persistent-hint="persistentHint" v-bind="inputProps" :class="inputClasses" />
    </div>
</template>

<style>
.v-select .v-field__input {
    font-size: 14px !important;
}

.v-list-item-title {
    font-size: 14px !important;
}
</style>
