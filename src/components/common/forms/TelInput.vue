<script setup lang="ts">
import { computed } from "vue";

type Density = "default" | "comfortable" | "compact";

type TextVariant = "filled" | "outlined" | "plain" | "solo" | "solo-filled" | "solo-inverted" | "underlined";

interface TelInputProps {
    modelValue: string | null;
    label?: string;
    placeholder?: string;
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
    errorMessages?: string | string[];
    hideDetails?: boolean | "auto";
    hint?: string;
    persistentHint?: boolean;
    inputProps?: Record<string, any>;
    labelClass?: string;
}

const props = withDefaults(defineProps<TelInputProps>(), {
    color: "primary-300",
    bgColor: "#FFF",
    dir: "ltr",
    density: "comfortable" as Density,
    hideDetails: false,
    inputProps: () => ({}),
    labelClass: "",
    placeholder: "5XXXXXXXX",
});

const emit = defineEmits<{
    (e: "update:modelValue", value: string | null): void;
}>();

const internalValue = computed({
    get: () => {
        if (!props.modelValue) return "";
        return props.modelValue.replace("+966", "").trim();
    },
    set: (val: string) => {
        if (!val || val.trim() === "") {
            emit("update:modelValue", null);
        } else {
            const cleanedValue = val.trim();
            emit("update:modelValue", `+966${cleanedValue}`);
        }
    },
});
</script>

<template>
    <div class="tel-input-wrapper">
        <label v-if="label" class="qallab-label" :class="labelClass">
            {{ label }}
        </label>

        <v-text-field v-model="internalValue" inputmode="numeric" pattern="[0-9]*" type="tel" :placeholder="placeholder"
            variant="outlined" :color="color" :density="density" :disabled="disabled" :readonly="readonly"
            :rules="rules" :dir="dir" :clearable="clearable" :error-messages="errorMessages" :hide-details="false"
            :hint="hint" :persistent-hint="persistentHint" v-bind="inputProps">
            <template #append-inner>
                <slot name="append-inner"></slot>
                <span class="text-gray-500 font-semibold me-2 block text-sm dir-ltr">+966</span>
            </template>
            <template #prepend-inner>
                <slot name="prepend-inner"></slot>
                <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
            </template>
        </v-text-field>
    </div>
</template>
