<script setup lang="ts">
import { reactive, watch } from 'vue';

interface Props {
  productionLinesCount: number | null;
  operationalReadiness: string | null;
  operationalStatus: string | null;
  totalWorkers: number | null;
  engineersCount: number | null;
  techniciansCount: number | null;
  qualityControlSystem: string | null;
  qualityLabAvailability: boolean;
  safetySystem: string | null;
  workingHours: string | null;
  equipmentType: string[];
  operationMode: string | null;
  maintenanceSystem: string | null;
  weighbridgeAvailability: boolean;
  weighbridgeType: string | null;
  operationalReadinessItems: Array<{ title: string; value: string }>;
  operationalStatusItems: Array<{ title: string; value: string }>;
  qualityControlSystemItems: Array<{ title: string; value: string }>;
  safetySystemItems: Array<{ title: string; value: string }>;
  workingHoursItems: Array<{ title: string; value: string }>;
  equipmentTypesItems: Array<{ title: string; value: string }>;
  operationModeItems: Array<{ title: string; value: string }>;
  maintenanceSystemItems: Array<{ title: string; value: string }>;
  weighbridgeTypeItems: Array<{ title: string; value: string }>;
  formErrors?: Record<string, string>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: Partial<Props>];
  'clear:error': [field: string];
}>();

const formData = reactive({
  productionLinesCount: props.productionLinesCount,
  operationalReadiness: props.operationalReadiness,
  operationalStatus: props.operationalStatus,
  totalWorkers: props.totalWorkers,
  engineersCount: props.engineersCount,
  techniciansCount: props.techniciansCount,
  qualityControlSystem: props.qualityControlSystem,
  qualityLabAvailability: props.qualityLabAvailability,
  safetySystem: props.safetySystem,
  workingHours: props.workingHours,
  equipmentType: props.equipmentType,
  operationMode: props.operationMode,
  maintenanceSystem: props.maintenanceSystem,
  weighbridgeAvailability: props.weighbridgeAvailability,
  weighbridgeType: props.weighbridgeType,
});

watch(() => props, (newProps) => {
  Object.assign(formData, {
    productionLinesCount: newProps.productionLinesCount,
    operationalReadiness: newProps.operationalReadiness,
    operationalStatus: newProps.operationalStatus,
    totalWorkers: newProps.totalWorkers,
    engineersCount: newProps.engineersCount,
    techniciansCount: newProps.techniciansCount,
    qualityControlSystem: newProps.qualityControlSystem,
    qualityLabAvailability: newProps.qualityLabAvailability,
    safetySystem: newProps.safetySystem,
    workingHours: newProps.workingHours,
    equipmentType: newProps.equipmentType,
    operationMode: newProps.operationMode,
    maintenanceSystem: newProps.maintenanceSystem,
    weighbridgeAvailability: newProps.weighbridgeAvailability,
    weighbridgeType: newProps.weighbridgeType,
  });
}, { deep: true });

const clearError = (field: string) => emit('clear:error', field);

const emitUpdate = () => {
  emit('update:formData', { ...formData });
};

const handleFieldUpdate = (field: string) => {
  clearError(field);
  emitUpdate();
};
</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">المعلومات التشغيلية</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <PriceInput v-model="formData.productionLinesCount" @update:model-value="() => handleFieldUpdate('production_lines_count')"
        label="عدد خطوط الإنتاج" placeholder="ادخل عدد خطوط الإنتاج مثل: 5"
        :error-messages="formErrors?.production_lines_count" />

      <SelectWithIconInput clearable v-model="formData.operationalStatus" @update:model-value="() => handleFieldUpdate('operational_status')"
        label="حالة التشغيل" placeholder="اختر حالة التشغيل مثل: نشط" :items="operationalStatusItems" 
        :error-messages="formErrors?.operational_status" />

      <PriceInput v-model="formData.totalWorkers" @update:model-value="() => handleFieldUpdate('total_workers')" label="عدد العمال"
        placeholder="ادخل عدد العمال مثل: 200" :error-messages="formErrors?.total_workers" />

      <PriceInput v-model="formData.engineersCount" @update:model-value="() => handleFieldUpdate('engineers_count')" label="عدد المهندسين" 
        placeholder="ادخل عدد المهندسين مثل: 30" :error-messages="formErrors?.engineers_count" />

      <PriceInput v-model="formData.techniciansCount" @update:model-value="() => handleFieldUpdate('technicians_count')" label="عدد الفنيين" 
        placeholder="ادخل عدد الفنيين مثل: 50" :error-messages="formErrors?.technicians_count" />

      <SelectWithIconInput clearable v-model="formData.qualityControlSystem" @update:model-value="() => handleFieldUpdate('quality_control_system')"
        label="نظام ضبط الجودة" placeholder="اختر نظام الجودة مثل: ISO 9001" :items="qualityControlSystemItems" 
        :error-messages="formErrors?.quality_control_system" />

      <SelectWithIconInput clearable v-model="formData.workingHours" @update:model-value="() => handleFieldUpdate('working_hours')"
        label="اوقات العمل" placeholder="اختر أوقات العمل مثل: 8:00 am - 5:00 pm" :items="workingHoursItems" 
        :error-messages="formErrors?.working_hours" />

      <SelectWithIconInput clearable v-model="formData.safetySystem" @update:model-value="() => handleFieldUpdate('safety_system')"
        label="نظام السلامة" placeholder="اختر نظام السلامة مثل: متكامل" :items="safetySystemItems" 
        :error-messages="formErrors?.safety_system" />

      <MultipleSelectInput v-model="formData.equipmentType" @update:model-value="() => handleFieldUpdate('equipment_type')"
        label="نوع المعدات" placeholder="اختر نوع المعدات مثل: أوتوماتيكي" :items="equipmentTypesItems"
        :input-props="{ clearable: true }" :error-messages="formErrors?.equipment_type" />

      <SelectWithIconInput clearable v-model="formData.maintenanceSystem" @update:model-value="() => handleFieldUpdate('maintenance_system')"
        label="نظام الصيانة" placeholder="اختر نظام الصيانة مثل: وقائي" :items="maintenanceSystemItems" 
        :error-messages="formErrors?.maintenance_system" />

      <SelectWithIconInput clearable v-model="formData.operationMode" @update:model-value="() => handleFieldUpdate('operation_mode')"
        label="طريقة التشغيل" placeholder="اختر طريقة التشغيل مثل: متواصل" :items="operationModeItems" 
        :error-messages="formErrors?.operation_mode" />

      <SelectWithIconInput clearable v-model="formData.weighbridgeType" @update:model-value="() => handleFieldUpdate('weighbridge_type')"
        label="نوع الميزان" placeholder="اختر نوع الميزان مثل: إلكتروني" :items="weighbridgeTypeItems" 
        :error-messages="formErrors?.weighbridge_type" />

      <div>
        <span class="text-gray-700 text-sm font-semibold mb-2 block">وجود ميزان</span>
        <div class="flex gap-4">
          <v-radio-group v-model="formData.weighbridgeAvailability" @update:model-value="() => handleFieldUpdate('weighbridge_availability')" inline hide-details>
            <v-radio :value="true" color="primary">
              <template #label>
                <span :class="formData.weighbridgeAvailability ? 'text-primary font-semibold' : 'text-gray-600'">
                  نعم
                </span>
              </template>
            </v-radio>
            <v-radio :value="false" color="primary">
              <template #label>
                <span :class="!formData.weighbridgeAvailability ? 'text-primary font-semibold' : 'text-gray-600'">
                  لا
                </span>
              </template>
            </v-radio>
          </v-radio-group>
        </div>
      </div>

      <div>
        <span class="text-gray-700 text-sm font-semibold mb-2 block">وجود مختبر جودة</span>
        <div class="flex gap-4">
          <v-radio-group v-model="formData.qualityLabAvailability" @update:model-value="() => handleFieldUpdate('quality_lab_availability')" inline hide-details>
            <v-radio :value="true" color="primary">
              <template #label>
                <span :class="formData.qualityLabAvailability ? 'text-primary font-semibold' : 'text-gray-600'">
                  نعم
                </span>
              </template>
            </v-radio>
            <v-radio :value="false" color="primary">
              <template #label>
                <span :class="!formData.qualityLabAvailability ? 'text-primary font-semibold' : 'text-gray-600'">
                  لا
                </span>
              </template>
            </v-radio>
          </v-radio-group>
        </div>
      </div>
    </div>
  </div>
</template>
