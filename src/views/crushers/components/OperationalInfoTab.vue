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
    formErrors?: Record<string, string>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:formData': [data: Partial<Props>];
    'clear:error': [field: string];
}>();

const clearError = (field: string) => {
    emit('clear:error', field);
};

const handleInputUpdate = (field: string) => {
    clearError(field);
    emitUpdate();
};

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

const infoIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1892_22688)">
<path d="M6.06065 6.00016C6.21739 5.55461 6.52675 5.1789 6.93395 4.93958C7.34116 4.70027 7.81991 4.61279 8.28543 4.69264C8.75096 4.77249 9.17319 5.01451 9.47737 5.37585C9.78154 5.73718 9.94802 6.19451 9.94732 6.66683C9.94732 8.00016 7.94732 8.66683 7.94732 8.66683M8.00065 11.3335H8.00732M14.6673 8.00016C14.6673 11.6821 11.6825 14.6668 8.00065 14.6668C4.31875 14.6668 1.33398 11.6821 1.33398 8.00016C1.33398 4.31826 4.31875 1.3335 8.00065 1.3335C11.6825 1.3335 14.6673 4.31826 14.6673 8.00016Z" stroke="#9AA4B2" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_1892_22688">
<rect width="16" height="16" fill="white"/>
</clipPath>
</defs>
</svg>
`

</script>

<template>
    <div class="mb-4 bg-gray-50 rounded-lg p-6">
        <h2 class="text-lg font-bold text-primary-900 mb-4">المعلومات التشغيلية</h2>

        <!-- Row 1: Production Lines, Rock Type, Crusher Type -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <TextInput v-model="formData.productionLines" @input="() => handleInputUpdate('production_lines')"
                label="عدد خطوط الإنتاج" placeholder="20" type="number" :rules="[numeric()]"
                :error-messages="props.formErrors?.['production_lines']" :hide-details="false" />
            <SelectWithIconInput clearable v-model="formData.rockType" @update:model-value="emitUpdate"
                label="نوع الصخر" placeholder="اختر نوع الصخر" :items="rockTypeItems" />
            <SelectWithIconInput clearable v-model="formData.crusherType" @update:model-value="emitUpdate"
                label="نوع الكسارة" placeholder="اختر نوع الكسارة" :items="crusherTypeItems" />
            <TextInput v-model="formData.feedRate" @input="() => handleInputUpdate('feed_rate')" label="سرعة التغذية"
                placeholder="20" :rules="[numeric()]" :error-messages="props.formErrors?.['feed_rate']"
                :hide-details="false">
                <template #append-inner>
                    <v-tooltip location="top" content-class="custom-tooltip">
                        <template #activator="{ props: tooltipProps }">
                            <ButtonWithIcon variant="text" size="small" density="compact" custom-class="!min-w-0 p-0"
                                :prepend-icon="infoIcon" v-bind="tooltipProps" />
                        </template>
                        <div>
                            سرعة تغذية المواد الخام للكسارة
                        </div>
                    </v-tooltip>
                </template>
            </TextInput>
            <TextInput v-model="formData.maxProduction" :hide-details="false"
                @input="() => handleInputUpdate('max_production')" label="الحد الأقصى للإنتاج" placeholder="50"
                :rules="[numeric()]" :error-messages="props.formErrors?.['max_production']">
                <template #append-inner>
                    <v-tooltip location="top" content-class="custom-tooltip">
                        <template #activator="{ props: tooltipProps }">
                            <ButtonWithIcon variant="text" size="small" density="compact" custom-class="!min-w-0 p-0"
                                :prepend-icon="infoIcon" v-bind="tooltipProps" />
                        </template>
                        <div>
                            أقصى قدرة إنتاجية للكسارة
                        </div>
                    </v-tooltip>
                </template>
            </TextInput>
            <TextInput v-model="formData.currentProduction" :hide-details="false"
                @input="() => handleInputUpdate('current_production')" label="الإنتاج الحالي" placeholder="45"
                :rules="[numeric()]" :error-messages="props.formErrors?.['current_production']" />

            <SelectWithIconInput clearable v-model="formData.design" @update:model-value="emitUpdate"
                label="تصميم الكسارة" placeholder="اختر التصميم" :items="crusherDesignItems" />
            <TextInput v-model="formData.workersCount" :hide-details="false"
                @input="() => handleInputUpdate('workers_count')" label="عدد العمال" placeholder="50" type="number"
                :rules="[numeric()]" :error-messages="props.formErrors?.['workers_count']" />
        </div>
    </div>
</template>
