<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
    modelValue: string;
    label?: string;
    hideDetails?: boolean;
    disabled?: boolean;
    showSwatches?: boolean;
    elevation?: number;
    buttonSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
    label: '',
    hideDetails: false,
    disabled: false,
    showSwatches: false,
    elevation: 2,
    buttonSize: 35,
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const menu = ref(false);

const internalValue = computed({
    get: () => props.modelValue,
    set: (val: string) => {
        // Ensure we always emit hex format
        if (typeof val === 'string') {
            emit('update:modelValue', val);
        }
    },
});
</script>

<template>
    <div class="color-picker-input">
        <span v-if="label" class="text-sm font-semibold text-gray-700 block mb-2">{{ label }}</span>
        <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
            <template v-slot:activator="{ props: menuProps }">
                <button
                    v-bind="menuProps"
                    :disabled="disabled"
                    type="button"
                    class="color-button rounded-full"
                    :style="{ 
                        backgroundColor: internalValue,
                        width: `${buttonSize}px`,
                        height: `${buttonSize}px`
                    }"
                >
                </button>
            </template>
            <v-card>
                <v-color-picker
                    v-model="internalValue"
                    :disabled="disabled"
                    :show-swatches="showSwatches"
                    :elevation="0"
                    mode="hex"
                    hide-inputs
                    width="300"
                ></v-color-picker>
            </v-card>
        </v-menu>
    </div>
</template>

<style scoped>
.color-button {
    border-radius: 8px;
    border: 2px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.color-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.color-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.icon-shadow {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}
</style>
