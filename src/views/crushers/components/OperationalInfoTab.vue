<script setup lang="ts">
import { reactive, watch } from 'vue';

interface Props {
    productionLines: number | null;
    rockType: string | null;
    crusherType: string | null;
    feedRate: string;
    maxProduction: string;
    currentProduction: string;
    design: string | null;
    workersCount: number | null;
    rockTypeItems: Array<{ title: string; value: string }>;
    crusherTypeItems: Array<{ title: string; value: string }>;
    crusherDesignItems: Array<{ title: string; value: string }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:formData': [data: Partial<Props>];
}>();

const formData = reactive({
    productionLines: props.productionLines,
    rockType: props.rockType,
    crusherType: props.crusherType,
    feedRate: props.feedRate,
    maxProduction: props.maxProduction,
    currentProduction: props.currentProduction,
    design: props.design,
    workersCount: props.workersCount,
});

watch(() => props, (newProps) => {
    Object.assign(formData, {
        productionLines: newProps.productionLines,
        rockType: newProps.rockType,
        crusherType: newProps.crusherType,
        feedRate: newProps.feedRate,
        maxProduction: newProps.maxProduction,
        currentProduction: newProps.currentProduction,
        design: newProps.design,
        workersCount: newProps.workersCount,
    });
}, { deep: true });

const emitUpdate = () => {
    emit('update:formData', { ...formData });
};

const markIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 9.33333C16 13.0152 13.0152 16 9.33333 16M16 9.33333C16 5.65144 13.0152 2.66667 9.33333 2.66667M16 9.33333H17.6667M9.33333 16C5.65144 16 2.66667 13.0152 2.66667 9.33333M9.33333 16V17.6667M2.66667 9.33333C2.66667 5.65144 5.65144 2.66667 9.33333 2.66667M2.66667 9.33333H1M9.33333 2.66667V1M11.8333 9.33333C11.8333 10.714 10.714 11.8333 9.33333 11.8333C7.95262 11.8333 6.83333 10.714 6.83333 9.33333C6.83333 7.95262 7.95262 6.83333 9.33333 6.83333C10.714 6.83333 11.8333 7.95262 11.8333 9.33333Z" stroke="#9AA4B2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
</script>

<template>
    <div class="mb-4 bg-gray-50 rounded-lg p-6">
        <h2 class="text-lg font-bold text-primary-900 mb-4">المعلومات التشغيلية</h2>

        <!-- Row 1: Production Lines, Rock Type, Crusher Type -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <TextInput v-model="formData.productionLines" @blur="emitUpdate" label="عدد خطوط الإنتاج"
                placeholder="20" type="number" />
            <SelectWithIconInput v-model="formData.rockType" @update:model-value="emitUpdate" label="نوع الصخر"
                placeholder="اختر نوع الصخر" :items="rockTypeItems" />
            <SelectWithIconInput v-model="formData.crusherType" @update:model-value="emitUpdate" label="نوع الكسارة"
                placeholder="اختر نوع الكسارة" :items="crusherTypeItems" />
        </div>

        <!-- Row 2: Feed Rate, Max Production, Current Production -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <TextInput v-model="formData.feedRate" @blur="emitUpdate" label="سرعة التغذية" placeholder="20" />
            <TextInput v-model="formData.maxProduction" @blur="emitUpdate" label="الحد الأقصى للإنتاج"
                placeholder="50" />
            <TextInput v-model="formData.currentProduction" @blur="emitUpdate" label="الإنتاج الحالي" placeholder="45" />
        </div>

        <!-- Row 3: Crusher Design, Number of Workers -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SelectWithIconInput v-model="formData.design" @update:model-value="emitUpdate" label="تصميم الكسارة"
                placeholder="اختر التصميم" :items="crusherDesignItems" />
            <TextInput v-model="formData.workersCount" @blur="emitUpdate" label="عدد العمال" placeholder="50"
                type="number" />
        </div>
    </div>
</template>
