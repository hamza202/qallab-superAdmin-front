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

const datepickerIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.834 7.50016H0.833984M11.6673 0.833496V4.16683M5.00065 0.833496V4.16683M4.83398 17.5002H11.834C13.2341 17.5002 13.9342 17.5002 14.469 17.2277C14.9394 16.988 15.3218 16.6055 15.5615 16.1351C15.834 15.6004 15.834 14.9003 15.834 13.5002V6.50016C15.834 5.10003 15.834 4.39997 15.5615 3.86519C15.3218 3.39478 14.9394 3.01233 14.469 2.77265C13.9342 2.50016 13.2341 2.50016 11.834 2.50016H4.83398C3.43385 2.50016 2.73379 2.50016 2.19901 2.77265C1.7286 3.01233 1.34615 3.39478 1.10647 3.86519C0.833984 4.39997 0.833984 5.10003 0.833984 6.50016V13.5002C0.833984 14.9003 0.833984 15.6004 1.10647 16.1351C1.34615 16.6055 1.7286 16.988 2.19901 17.2277C2.73379 17.5002 3.43385 17.5002 4.83398 17.5002Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const props = withDefaults(defineProps<DatePickerInputProps>(), {
    color: "primary-300",
    bgColor: "#FFF",
    dir: "rtl",
    density: "comfortable" as Density,
    hideDetails: true,
    clearable: false,
    labelClass: "",
    showCalendarIcon: true,
});

const emit = defineEmits<{
    (e: "update:modelValue", value: string | null): void;
}>();

const menu = ref(false);

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => {
        if (!val) {
            emit("update:modelValue", null);
            return;
        }
        // Format date as MM/DD/YYYY
        const date = new Date(val);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        const formattedValue = `${month}/${day}/${year}`;
        emit("update:modelValue", formattedValue);
    },
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
                        <slot name="prepend-inner">
                            <span v-if="showCalendarIcon" v-html="datepickerIcon" class="cursor-pointer"></span>
                        </slot>
                    </template>
                    <template #append-inner>
                        <slot name="append-inner"></slot>
                    </template>
                </v-text-field>
            </template>
            <v-date-picker v-model="internalValue" :color="color" :min="min" :max="max"
                @update:model-value="menu = false" scrollable>
            </v-date-picker>
        </v-menu>
    </div>
</template>

<style scoped>
.date-picker-input-wrapper {
    width: 100%;
}
</style>
