<script setup lang="ts">
import { computed, ref } from "vue";

type Density = "default" | "comfortable" | "compact";

interface DatePickerInputProps {
    modelValue: string | null;
    label?: string;
    placeholder?: string;
    color?: string;
    dir?: string;
    bgColor?: string;
    density?: Density;
    disabled?: boolean;
    readonly?: boolean;
    clearable?: boolean;
    rules?: any[];
    hideDetails?: boolean | "auto";
    hint?: string;
    persistentHint?: boolean;
    min?: string;
    max?: string;
    labelClass?: string;
    showCalendarIcon?: boolean;
}

const props = withDefaults(defineProps<DatePickerInputProps>(), {
    color: "primary-300",
    bgColor: "#FFF",
    dir: "rtl",
    density: "comfortable" as Density,
    hideDetails: true,
    clearable: false,
    labelClass: "",
    showCalendarIcon: false,
});

const emit = defineEmits<{
    (e: "update:modelValue", value: string | null): void;
}>();

const menu = ref(false);

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
});

// Format date for display (optional, can be customized)
const formattedDate = computed(() => {
    if (!internalValue.value) return "";
    try {
        const date = new Date(internalValue.value);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    } catch {
        return internalValue.value;
    }
});
</script>

<template>
    <div class="date-picker-input-wrapper">
        <label v-if="label" class="qallab-label" :class="labelClass">
            {{ label }}
        </label>

        <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
            <template #activator="{ props: menuProps }">
                <v-text-field v-model="formattedDate" :placeholder="placeholder" variant="outlined" :color="color"
                    :density="density" :disabled="disabled" :readonly="true" :rules="rules" :dir="dir"
                    :clearable="clearable" :hide-details="hideDetails" :hint="hint" :persistent-hint="persistentHint"
                    v-bind="menuProps">
                    <template #prepend-inner>
                        <slot name="prepend-inner"></slot>
                    </template>
                    <template #append-inner>
                        <slot name="append-inner"></slot>
                    </template>
                </v-text-field>
            </template>
            <v-date-picker v-model="internalValue" :color="color" :min="min" :max="max" @update:model-value="menu = false"
                scrollable>
            </v-date-picker>
        </v-menu>
    </div>
</template>

<style scoped>
.date-picker-input-wrapper {
    width: 100%;
}
</style>
