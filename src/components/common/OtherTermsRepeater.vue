<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from 'vue-i18n';
import { trashIcon, editIcon, saveIcon } from '@/components/icons/globalIcons';

interface Props {
    modelValue: string[];
    title?: string;
    placeholder?: string;
    addButtonLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void;
}>();

const { t } = useI18n();

interface TermRow {
    id: number;
    value: string;
    editing: boolean;
}

let counter = 0;
const items = ref<TermRow[]>([]);

const valuesMatch = (rows: TermRow[], values: string[]) =>
    rows.length === values.length && rows.every((r, i) => r.value === values[i]);

watch(
    () => props.modelValue,
    (newValue) => {
        const incoming = Array.isArray(newValue) ? newValue : [];
        if (valuesMatch(items.value, incoming)) return;
        items.value = incoming.map((v) => ({
            id: counter++,
            value: v ?? '',
            editing: false,
        }));
    },
    { immediate: true, deep: true },
);

const emitValues = () => {
    emit('update:modelValue', items.value.map((i) => i.value));
};

const addItem = () => {
    items.value.push({ id: counter++, value: '', editing: true });
    emitValues();
};

const editItem = (id: number) => {
    const row = items.value.find((i) => i.id === id);
    if (row) row.editing = true;
};

const saveItem = (id: number) => {
    const row = items.value.find((i) => i.id === id);
    if (row) {
        row.editing = false;
        emitValues();
    }
};

const deleteItem = (id: number) => {
    items.value = items.value.filter((i) => i.id !== id);
    emitValues();
};

const onInput = () => {
    emitValues();
};
</script>

<template>
    <div class="other-terms-repeater">
        <div class="flex items-center mb-4">
            <h3 class="text-base font-bold text-gray-900">
                {{ title || t('purchases.shared.forms.common.labels.otherTerms') }}
            </h3>
        </div>

        <ul class="space-y-3 list-none m-0 p-0">
            <li v-for="item in items" :key="item.id" class="flex items-center gap-3">
                <span class="text-gray-700 text-xl leading-none">•</span>

                <div class="flex-1">
                    <v-text-field
                        v-if="item.editing"
                        v-model="item.value"
                        variant="outlined"
                        density="comfortable"
                        color="primary-300"
                        :placeholder="placeholder || t('purchases.shared.forms.common.placeholders.enterTerm')"
                        hide-details
                        @update:model-value="onInput"
                        @keyup.enter="saveItem(item.id)"
                    />
                    <span v-else class="text-gray-800 text-sm break-words">
                        {{ item.value || t('purchases.shared.forms.common.placeholders.enterTerm') }}
                    </span>
                </div>

                <button
                    v-if="item.editing"
                    type="button"
                    class="cursor-pointer flex items-center justify-center text-primary-600"
                    :title="$t('purchases.shared.forms.common.select')"
                    @click="saveItem(item.id)"
                >
                    <span v-html="saveIcon"></span>
                </button>
                <button
                    v-else
                    type="button"
                    class="cursor-pointer flex items-center justify-center"
                    @click="editItem(item.id)"
                >
                    <span v-html="editIcon"></span>
                </button>

                <button
                    type="button"
                    class="cursor-pointer flex items-center justify-center"
                    @click="deleteItem(item.id)"
                >
                    <span v-html="trashIcon"></span>
                </button>
            </li>
        </ul>

        <div class="mt-4 flex justify-start">
            <v-btn
                variant="flat"
                color="primary-50"
                class="!text-primary-700 font-bold px-4 py-2 flex"
                @click="addItem"
            >
                {{ addButtonLabel || t('purchases.shared.forms.common.actions.addTerm') }}
            </v-btn>
        </div>
    </div>
</template>

<style scoped>
.other-terms-repeater button {
    background: transparent;
    border: none;
    padding: 4px;
}
</style>
