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

interface PriceInputProps {
    modelValue: number | string | null;
    label?: string;
    placeholder?: string;
    currency?: string;
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
    inputProps?: Record<string, any>;
    labelClass?: string;
    showCurrencyOnLeft?: boolean;
    keepCurrencyVisible?: boolean;
}

const props = withDefaults(defineProps<PriceInputProps>(), {
    currency: '',
    color: "primary-300",
    bgColor: "#FFF",
    density: "comfortable" as Density,
    hideDetails: true,
    inputProps: () => ({}),
    labelClass: "",
    showCurrencyOnLeft: false,
    keepCurrencyVisible: false,
    placeholder: "ادخل السعر",
});

const emit = defineEmits<{
    (e: "update:modelValue", value: number | string | null): void;
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
});

</script>

<template>
    <div class="price-input-wrapper">
        <label v-if="label" class="qallab-label" :class="labelClass">
            {{ label }}
        </label>

        <v-text-field v-model="internalValue" type="number" :placeholder="placeholder" variant="outlined" :color="color"
            :density="density" :disabled="disabled" :readonly="readonly" :clearable="clearable" :rules="rules"
            :hide-details="hideDetails" :hint="hint" :persistent-hint="persistentHint"
            :prefix="!keepCurrencyVisible && showCurrencyOnLeft ? currency : undefined" 
            :suffix="!keepCurrencyVisible && !showCurrencyOnLeft ? currency : undefined" v-bind="inputProps"
            class="price-input">
            <template v-if="keepCurrencyVisible && currency && showCurrencyOnLeft" #prepend-inner>
                <span class="text-xs text-gray-500">{{ currency }}</span>
            </template>
            <template v-if="keepCurrencyVisible && currency && !showCurrencyOnLeft" #append-inner>
                <span class="text-xs text-gray-500">{{ currency }}</span>
            </template>
        </v-text-field>
    </div>
</template>

<style scoped>

/* Hide number input spinners */
.price-input :deep(input[type="number"]::-webkit-outer-spin-button),
.price-input :deep(input[type="number"]::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
}

.price-input :deep(input[type="number"]) {
    -moz-appearance: textfield;
    
}
</style>
