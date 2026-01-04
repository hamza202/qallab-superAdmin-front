<script setup lang="ts">
import { computed } from "vue";

type Density = "default" | "comfortable" | "compact";

interface SelectItem {
    title: string;
    value: string | number;
}

interface MultipleSelectInputProps {
    modelValue: (string | number)[];
    label?: string;
    placeholder?: string;
    items: SelectItem[];
    color?: string;
    density?: Density;
    disabled?: boolean;
    readonly?: boolean;
    hideDetails?: boolean | "auto";
    hint?: string;
    persistentHint?: boolean;
    inputProps?: Record<string, any>;
    labelClass?: string;
    chipColor?: string;
    chipTextColor?: string;
}

const props = withDefaults(defineProps<MultipleSelectInputProps>(), {
    modelValue: () => [],
    color: "primary-300",
    density: "comfortable" as Density,
    hideDetails: true,
    inputProps: () => ({}),
    labelClass: "",
    chipColor: "white",
    chipTextColor: "gray-700",
});

const emit = defineEmits<{
    (e: "update:modelValue", value: (string | number)[]): void;
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
});

const removeItem = (itemValue: string | number) => {
    const newValue = props.modelValue.filter((v) => v !== itemValue);
    emit("update:modelValue", newValue);
};

const getItemTitle = (value: string | number): string => {
    const item = props.items.find((i) => i.value === value);
    return item?.title || String(value);
};
</script>

<template>
    <div class="multiple-select-input-wrapper">
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
            :hide-details="hideDetails"
            :hint="hint"
            :persistent-hint="persistentHint"
            multiple
            v-bind="inputProps"
        >
            <template #selection="{ index }">
                <div v-if="index === 0" class="selected-chips-container">
                    <div
                        v-for="selectedValue in modelValue"
                        :key="selectedValue"
                        class="selected-chip"
                    >
                        <span class="chip-text">{{ getItemTitle(selectedValue) }}</span>
                        <button
                            type="button"
                            class="chip-close-btn"
                            @click.stop="removeItem(selectedValue)"
                            :disabled="disabled || readonly"
                        >
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5"
                                    stroke="#9AA4B2"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </template>
        </v-select>
    </div>
</template>

<style scoped>
.multiple-select-input-wrapper {
    width: 100%;
}

.selected-chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.selected-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background-color: #ffffff;
    border: 1px solid #cdd5df;
    border-radius: 6px;
    padding: 3px 4px 3px 8px;
}

.chip-text {
    font-family: "Cairo", sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: #364152;
    text-align: center;
}

.chip-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 3px;
    transition: background-color 0.2s ease;
}

.chip-close-btn:hover:not(:disabled) {
    background-color: #f3f4f6;
}

.chip-close-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}
</style>
