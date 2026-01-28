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
    showRialIcon?: boolean;
    keepCurrencyVisible?: boolean;
    allowNegative?: boolean;
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
    showRialIcon: false,
    keepCurrencyVisible: false,
    placeholder: "ادخل السعر",
    allowNegative: false,
});

const emit = defineEmits<{
    (e: "update:modelValue", value: number | string | null): void;
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
});

const handleKeydown = (e: KeyboardEvent) => {
    if (!props.allowNegative && e.key === '-') {
        e.preventDefault();
    }
    // Prevent arrow down from going below 0
    if (!props.allowNegative && e.key === 'ArrowDown') {
        const currentValue = Number(props.modelValue) || 0;
        if (currentValue <= 0) {
            e.preventDefault();
        }
    }
};

const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
};

const rialIcon = `<svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2962_362153)">
<path d="M8.09251 13.2883C7.86053 13.8194 7.70718 14.3956 7.64844 15L12.5576 13.9226C12.7896 13.3917 12.9428 12.8153 13.0017 12.2109L8.09251 13.2883Z" fill="#697586"/>
<path d="M12.5559 10.6949C12.7879 10.164 12.9413 9.58759 13 8.98324L9.17589 9.82291V8.20876L12.5558 7.46723C12.7878 6.9363 12.9411 6.35989 12.9999 5.75554L9.17577 6.59449V0.789524C8.5898 1.12919 8.0694 1.58132 7.64638 2.11463V6.93021L6.11699 7.26582V0C5.53102 0.339544 5.01062 0.791792 4.5876 1.32511V7.6013L1.16558 8.35202C0.933594 8.88295 0.780134 9.45936 0.721271 10.0637L4.5876 9.21545V11.2482L0.444073 12.1572C0.212091 12.6881 0.0587471 13.2646 0 13.8689L4.33711 12.9174C4.69017 12.8416 4.99362 12.6261 5.19091 12.3295L5.98631 11.1121V11.1118C6.06888 10.9859 6.11699 10.834 6.11699 10.6705V8.87985L7.64638 8.54424V11.7725L12.5558 10.6947L12.5559 10.6949Z" fill="#697586"/>
</g>
<defs>
<clipPath id="clip0_2962_362153">
<rect width="13" height="15" fill="white"/>
</clipPath>
</defs>
</svg>
`
</script>

<template>
    <div class="price-input-wrapper">
        <label v-if="label" class="qallab-label" :class="labelClass">
            {{ label }}
        </label>

        <v-text-field v-model="internalValue" type="number" :placeholder="placeholder" variant="outlined" :color="color"
            :density="density" :disabled="disabled" :readonly="readonly" :clearable="clearable" :rules="rules"
            :hide-details="false" :hint="hint" :persistent-hint="persistentHint"
            :prefix="!keepCurrencyVisible && showCurrencyOnLeft ? currency : undefined"
            :suffix="!keepCurrencyVisible && !showCurrencyOnLeft ? currency : undefined" v-bind="inputProps"
            class="price-input" @keydown="handleKeydown" @wheel="handleWheel">
            <template #prepend-inner>
                <span v-if="keepCurrencyVisible && currency && showCurrencyOnLeft" class="text-xs text-gray-500">{{
                    currency }}</span>
            </template>
            <template #append-inner>
                <span v-if="keepCurrencyVisible && currency && !showCurrencyOnLeft" class="text-xs text-gray-500">{{
                    currency }}</span>
                <span v-if="showRialIcon" v-html="rialIcon"></span>
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
