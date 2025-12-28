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
    dir?: string;
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
    color: "primary-300",
    bgColor: "#FFF",
    dir: "rtl",
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

const handleAppendInnerClick = () => {
    if (props.passwordToggle) {
        showPassword.value = !showPassword.value;
    }
};
</script>

<template>
    <div class="text-input-wrapper">
        <label v-if="label" class="qallab-label" :class="labelClass">
            {{ label }}
        </label>

        <v-text-field 
            v-model="internalValue" 
            :type="inputType" 
            :placeholder="placeholder" 
            variant="outlined"
            :color="color" 
            :density="density" 
            :disabled="disabled"
            :readonly="readonly" 
            :rules="rules" 
            :dir="dir"
            :clearable="clearable" 
            :hide-details="hideDetails" 
            :hint="hint"
            :persistent-hint="persistentHint" 
            :prefix="prefix" 
            :suffix="suffix" 
            :prepend-inner-icon="prependInnerIcon"
            :append-inner-icon="effectiveAppendInnerIcon" 
            :prepend-icon="prependIcon" 
            :append-icon="appendIcon"
            v-bind="inputProps" 
            @click:append-inner="handleAppendInnerClick" 
        >

        <slot name="append-inner"></slot>
        </v-text-field>
    </div>
</template>