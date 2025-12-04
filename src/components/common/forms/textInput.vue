<script setup lang="ts">
import { computed, ref } from "vue";

type Density = "default" | "comfortable" | "compact";

type TextVariant = "filled" | "outlined" | "plain" | "solo" | "solo-filled" | "solo-inverted" | "underlined";

interface TextInputProps {
    modelValue: string | number | null;
    label?: string;
    placeholder?: string;
    type?: string;
    color?: string;
    variant?: TextVariant;
    bgColor?: string;
    density?: Density;
    rounded?: string | number | boolean;
    disabled?: boolean;
    readonly?: boolean;
    clearable?: boolean;
    rules?: any[];
    hideDetails?: boolean | "auto";
    hint?: string;
    persistentHint?: boolean;
    prefix?: string;
    suffix?: string;
    prependInnerIcon?: string;
    appendInnerIcon?: string;
    prependIcon?: string;
    appendIcon?: string;
    /** Enable built‑in password show/hide toggle */
    passwordToggle?: boolean;
    /** Any extra props to forward directly to v-text-field */
    inputProps?: Record<string, any>;
    /** Extra classes for the label wrapper */
    labelClass?: string;
}

const props = withDefaults(defineProps<TextInputProps>(), {
    type: "text",
    color: "primary",
    bgColor: "#FAFAFA",
    density: "comfortable" as Density,
    hideDetails: true,
    passwordToggle: false,
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

const showPassword = ref(false);

const inputType = computed(() => {
    if (props.passwordToggle && (props.type === "password" || !props.type)) {
        return showPassword.value ? "text" : "password";
    }
    return props.type;
});

const effectiveAppendInnerIcon = computed(() => {
    if (props.passwordToggle) {
        return showPassword.value ? "mdi-eye-off-outline" : "mdi-eye-outline";
    }
    return props.appendInnerIcon;
});

// If variant is not provided, use a neutral base (plain)
// and rely on our custom classes to match the design.
const computedVariant = computed<TextVariant>(() => {
    return props.variant ?? "plain";
});

const inputClasses = computed(() => {
    if (props.variant) {
        // When consumer supplies a variant, don't interfere with styling
        return "text-sm";
    }

    // Default style similar to the provided design
    return "text-sm bg-[#FAFAFA] px-3";
});

const handleAppendInnerClick = () => {
    if (props.passwordToggle) {
        showPassword.value = !showPassword.value;
    }
};
</script>

<template>
    <div class="mb-4">
        <div v-if="label" class="mb-1.5 text-sm font-semibold text-gray-800" :class="labelClass">
            {{ label }}
        </div>

        <v-text-field v-model="internalValue" :type="inputType" :placeholder="placeholder" :variant="computedVariant"
            :color="color" :bg-color="bgColor" :density="density" :rounded="rounded ?? 'lg'" :disabled="disabled"
            :readonly="readonly" :rules="rules" :clearable="clearable" :hide-details="hideDetails" :hint="hint"
            :persistent-hint="persistentHint" :prefix="prefix" :suffix="suffix" :prepend-inner-icon="prependInnerIcon"
            :append-inner-icon="effectiveAppendInnerIcon" :prepend-icon="prependIcon" :append-icon="appendIcon"
            v-bind="inputProps" :class="inputClasses" @click:append-inner="handleAppendInnerClick" />
    </div>
</template>


<style>
.v-text-field .v-field__input {
    font-size: 14px !important;
}
</style>