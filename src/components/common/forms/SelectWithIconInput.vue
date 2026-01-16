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

interface SelectItem {
    title: string;
    value: string | number;
    [key: string]: any;
}

interface SelectWithIconInputProps {
    modelValue: string | number | null;
    label?: string;
    placeholder?: string;
    items: SelectItem[] | string[];
    itemTitle?: string;
    itemValue?: string;
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
    prependInnerIcon?: string;
    appendInnerIcon?: string;
    showAddButton?: boolean;
    inputProps?: Record<string, any>;
    labelClass?: string;
}

const props = withDefaults(defineProps<SelectWithIconInputProps>(), {
    color: "primary-300",
    bgColor: "#fff",
    density: "comfortable" as Density,
    hideDetails: true,
    clearable: false,
    showAddButton: false,
    inputProps: () => ({}),
    labelClass: "",
    itemTitle: "title",
    itemValue: "value",
});

const emit = defineEmits<{
    (e: "update:modelValue", value: string | number | null): void;
    (e: "add-click"): void;
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
});

const handleAddClick = () => {
    emit("add-click");
};

// Plus circle icon SVG
const plusCircleIcon = `<svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 6.667v6.666M6.667 10h6.666M18.333 10a8.333 8.333 0 1 1-16.666 0 8.333 8.333 0 0 1 16.666 0Z" stroke="#1570EF" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
    <div class="select-icon-wrapper">
        <label v-if="label" class="qallab-label" :class="labelClass">
            {{ label }}
        </label>

        <v-select
            v-model="internalValue"
            :items="items"
            :item-title="itemTitle"
            :item-value="itemValue"
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
            v-bind="inputProps"
        >
            <template v-if="showAddButton" #prepend-inner>
                <button
                    type="button"
                    class="add-button"
                    @click.stop.prevent="handleAddClick"
                >
                    <span v-html="plusCircleIcon"></span>
                </button>
            </template>
        </v-select>
    </div>
</template>

<style scoped>
.add-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    background: none;
    border: none;
    cursor: pointer;
    transition: opacity 0.3s ease;
    position: relative;
}

.add-button:hover {
    opacity: 0.7;
}
</style>
