<script setup lang="ts">
import { reactive, watch } from 'vue';

interface Props {
    materialTypes: string[];
    fleetSize: string;
    branchesCount: string;
    operationScope: string | null;
    driversCount: string;
    supervisorsCount: string;
    dailyTripsAvg: string;
    operationMode: string | null;
    maintenanceStrategy: string | null;
    fleetManagementSystem: boolean;
    gpsTracking: boolean;
    materialTypesItems: Array<{ title: string; value: string }>;
    operationScopeItems: Array<{ title: string; value: string }>;
    operationModeItems: Array<{ title: string; value: string }>;
    maintenanceStrategyItems: Array<{ title: string; value: string }>;
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
    materialTypes: props.materialTypes,
    fleetSize: props.fleetSize,
    branchesCount: props.branchesCount,
    operationScope: props.operationScope,
    driversCount: props.driversCount,
    supervisorsCount: props.supervisorsCount,
    dailyTripsAvg: props.dailyTripsAvg,
    operationMode: props.operationMode,
    maintenanceStrategy: props.maintenanceStrategy,
    fleetManagementSystem: props.fleetManagementSystem,
    gpsTracking: props.gpsTracking,
});

watch(() => props, (newProps) => {
    Object.assign(formData, {
        materialTypes: newProps.materialTypes,
        fleetSize: newProps.fleetSize,
        branchesCount: newProps.branchesCount,
        operationScope: newProps.operationScope,
        driversCount: newProps.driversCount,
        supervisorsCount: newProps.supervisorsCount,
        dailyTripsAvg: newProps.dailyTripsAvg,
        operationMode: newProps.operationMode,
        maintenanceStrategy: newProps.maintenanceStrategy,
        fleetManagementSystem: newProps.fleetManagementSystem,
        gpsTracking: newProps.gpsTracking,
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

        <!-- Material Types & Fleet Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6 mb-4">
            <SelectInput v-model="formData.materialTypes" @update:model-value="emitUpdate" label="أنواع المواد"
                placeholder="اختر أنواع المواد" :items="materialTypesItems"
                :error-messages="props.formErrors?.['material_types']" :hide-details="false" multiple chips />

            <TextInput v-model="formData.fleetSize" @input="() => handleInputUpdate('fleet_size')" label="عدد الأساطيل"
                placeholder="أدخل عدد الأساطيل" type="number" :rules="[numeric()]"
                :error-messages="props.formErrors?.['fleet_size']" :hide-details="false" />

            <TextInput v-model="formData.branchesCount" @input="() => handleInputUpdate('branches_count')"
                label="عدد الفروع" placeholder="أدخل عدد الفروع" type="number" :rules="[numeric()]"
                :error-messages="props.formErrors?.['branches_count']" :hide-details="false" />
            <SelectInput clearable v-model="formData.operationScope" @update:model-value="emitUpdate"
                label="نطاق التشغيل " placeholder="اختر نطاق العمليات" :items="operationScopeItems"
                :error-messages="props.formErrors?.['operation_scope']" :hide-details="false" />

            <TextInput v-model="formData.driversCount" @input="() => handleInputUpdate('drivers_count')"
                label="عدد السائقين" placeholder="أدخل عدد السائقين" type="number" :rules="[numeric()]"
                :error-messages="props.formErrors?.['drivers_count']" :hide-details="false" />

            <TextInput v-model="formData.supervisorsCount" @input="() => handleInputUpdate('supervisors_count')"
                label="عدد المشرفين" placeholder="أدخل عدد المشرفين" type="number" :rules="[numeric()]"
                :error-messages="props.formErrors?.['supervisors_count']" :hide-details="false" />
            <TextInput v-model="formData.dailyTripsAvg" @input="() => handleInputUpdate('daily_trips_avg')"
                label=" عدد الرحلات اليومية " placeholder="أدخل عدد الرحلات اليومية" type="number" :rules="[numeric()]"
                :error-messages="props.formErrors?.['daily_trips_avg']" :hide-details="false" />

            <SelectInput clearable v-model="formData.operationMode" @update:model-value="emitUpdate"
                label="نظام التشغيل" placeholder="اختر نظام التشغيل" :items="operationModeItems"
                :error-messages="props.formErrors?.['operation_mode']" :hide-details="false" />

            <SelectInput clearable v-model="formData.maintenanceStrategy" @update:model-value="emitUpdate"
                label="نظام الصيانة" placeholder="اختر نظام الصيانة" :items="maintenanceStrategyItems"
                :error-messages="props.formErrors?.['maintenance_strategy']" :hide-details="false" />
            <div>
                <span class="text-sm font-semibold text-gray-700 mb-1 block">نظام إدارة الأسطول</span>
                <v-radio-group v-model="formData.fleetManagementSystem" inline hide-details @update:model-value="emitUpdate">
                    <v-radio :value="true" color="primary">
                        <template #label>
                            <span :class="formData.fleetManagementSystem ? 'text-primary font-semibold' : 'text-gray-600'">
                                مفعل
                            </span>
                        </template>

                    </v-radio>
                    <v-radio :value="false" color="primary">
                        <template #label>
                            <span :class="!formData.fleetManagementSystem ? 'text-primary font-semibold' : 'text-gray-600'">
                                معطل
                            </span>
                        </template>
                    </v-radio>
                </v-radio-group>
            </div>
            <div>
                <span class="text-sm font-semibold text-gray-700 mb-1 block">نظام تتبع GPS</span>
                <v-radio-group v-model="formData.gpsTracking" inline hide-details @update:model-value="emitUpdate">
                    <v-radio :value="true" color="primary">
                        <template #label>
                            <span :class="formData.gpsTracking ? 'text-primary font-semibold' : 'text-gray-600'">
                                مفعل
                            </span>
                        </template>

                    </v-radio>
                    <v-radio :value="false" color="primary">
                        <template #label>
                            <span :class="!formData.gpsTracking ? 'text-primary font-semibold' : 'text-gray-600'">
                                معطل
                            </span>
                        </template>
                    </v-radio>
                </v-radio-group>
            </div>
        </div>
    </div>
</template>
