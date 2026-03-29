<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  ongoingProjects: number | null;
  completedProjects: number | null;
  employeesCount: number | null;
  engineersCount: number | null;
  techniciansCount: number | null;
  operationalCapacity: string | null;
  specialization: string | null;
  siteReadiness: string | null;
  safetyManagementSystem: boolean;
  environmentalCompliance: boolean;
  operationalCapacityItems: Array<{ title: string; value: string }>;
  specializationItems: Array<{ title: string; value: string }>;
  siteReadinessItems: Array<{ title: string; value: string }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: Partial<Props>];
}>();

const formData = reactive({
  ongoingProjects: props.ongoingProjects,
  completedProjects: props.completedProjects,
  employeesCount: props.employeesCount,
  engineersCount: props.engineersCount,
  techniciansCount: props.techniciansCount,
  operationalCapacity: props.operationalCapacity,
  specialization: props.specialization,
  siteReadiness: props.siteReadiness,
  safetyManagementSystem: props.safetyManagementSystem,
  environmentalCompliance: props.environmentalCompliance,
});

watch(() => props, (newProps) => {
  Object.assign(formData, {
    ongoingProjects: newProps.ongoingProjects,
    completedProjects: newProps.completedProjects,
    employeesCount: newProps.employeesCount,
    engineersCount: newProps.engineersCount,
    techniciansCount: newProps.techniciansCount,
    operationalCapacity: newProps.operationalCapacity,
    specialization: newProps.specialization,
    siteReadiness: newProps.siteReadiness,
    safetyManagementSystem: newProps.safetyManagementSystem,
    environmentalCompliance: newProps.environmentalCompliance,
  });
}, { deep: true });

const emitUpdate = () => {
  emit('update:formData', { ...formData });
};
</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">{{ t('form.contractor.operationalInfo.sectionTitle') }}</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <TextInput v-model="formData.ongoingProjects" @input="emitUpdate" :label="t('form.contractor.operationalInfo.ongoingProjects.label')"
        :placeholder="t('form.contractor.operationalInfo.ongoingProjects.placeholder')" type="number" :rules="[numeric(), positive()]"/>
      <TextInput v-model="formData.completedProjects" @input="emitUpdate" :label="t('form.contractor.operationalInfo.completedProjects.label')"
        :placeholder="t('form.contractor.operationalInfo.completedProjects.placeholder')" type="number" :rules="[numeric(), positive()]"/>
      <TextInput v-model="formData.employeesCount" @input="emitUpdate" :label="t('form.contractor.operationalInfo.employeesCount.label')"
        :placeholder="t('form.contractor.operationalInfo.employeesCount.placeholder')" type="number" :rules="[numeric(), positive()]"/>
      <TextInput v-model="formData.engineersCount" @input="emitUpdate" :label="t('form.contractor.operationalInfo.engineersCount.label')" :placeholder="t('form.contractor.operationalInfo.engineersCount.placeholder')"
        type="number" :rules="[numeric(), positive()]"/>
      <TextInput v-model="formData.techniciansCount" @input="emitUpdate" :label="t('form.contractor.operationalInfo.techniciansCount.label')" :placeholder="t('form.contractor.operationalInfo.techniciansCount.placeholder')"
        type="number" :rules="[numeric(), positive()]"/>
      <SelectWithIconInput clearable v-model="formData.operationalCapacity" @update:model-value="emitUpdate"
        :label="t('form.contractor.operationalInfo.operationalCapacity.label')" :placeholder="t('form.contractor.operationalInfo.operationalCapacity.placeholder')" :items="operationalCapacityItems" />
      <SelectWithIconInput clearable v-model="formData.specialization" @update:model-value="emitUpdate"
        :label="t('form.contractor.operationalInfo.specialization.label')" :placeholder="t('form.contractor.operationalInfo.specialization.placeholder')" :items="specializationItems" />
      <SelectWithIconInput clearable v-model="formData.siteReadiness" @update:model-value="emitUpdate" :label="t('form.contractor.operationalInfo.siteReadiness.label')"
        :placeholder="t('form.contractor.operationalInfo.siteReadiness.placeholder')" :items="siteReadinessItems" />
      <div>
        <span class="text-gray-700 text-sm font-semibold mb-2 block">{{ t('form.contractor.operationalInfo.safetyManagementSystem.label') }}</span>
        <div class="flex gap-4">
          <v-radio-group v-model="formData.safetyManagementSystem" @update:model-value="emitUpdate" inline hide-details>
            <v-radio :value="true" color="primary">
              <template #label>
                <span :class="formData.safetyManagementSystem ? 'text-primary font-semibold' : 'text-gray-600'">
                  {{ t('common.options.yes') }}
                </span>
              </template>
            </v-radio>
            <v-radio :value="false" color="primary">
              <template #label>
                <span :class="!formData.safetyManagementSystem ? 'text-primary font-semibold' : 'text-gray-600'">
                  {{ t('common.options.no') }}
                </span>
              </template>
            </v-radio>
          </v-radio-group>
        </div>
      </div>
      <div>
        <span class="text-gray-700 text-sm font-semibold mb-2 block">{{ t('form.contractor.operationalInfo.environmentalCompliance.label') }}</span>
        <div class="flex gap-4">
          <v-radio-group v-model="formData.environmentalCompliance" @update:model-value="emitUpdate" inline
            hide-details>
            <v-radio :value="true" color="primary">
              <template #label>
                <span :class="formData.environmentalCompliance ? 'text-primary font-semibold' : 'text-gray-600'">
                  {{ t('common.options.yes') }}
                </span>
              </template>
            </v-radio>
            <v-radio :value="false" color="primary">
              <template #label>
                <span :class="!formData.environmentalCompliance ? 'text-primary font-semibold' : 'text-gray-600'">
                  {{ t('common.options.no') }}
                </span>
              </template>
            </v-radio>
          </v-radio-group>

        </div>
      </div>
    </div>
  </div>
</template>
