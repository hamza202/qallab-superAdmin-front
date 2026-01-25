<script setup lang="ts">
import { reactive, watch } from 'vue';

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
    <h2 class="text-lg font-bold text-primary-900 mb-4">المعلومات التشغيلية</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <TextInput v-model="formData.ongoingProjects" @input="emitUpdate" label="عدد المشاريع الجارية"
        placeholder="ادخل العدد" type="number" :rules="[numeric(), positive()]"/>
      <TextInput v-model="formData.completedProjects" @input="emitUpdate" label="عدد المشاريع المكتملة"
        placeholder="ادخل العدد" type="number" :rules="[numeric(), positive()]"/>
      <TextInput v-model="formData.employeesCount" @input="emitUpdate" label="إجمالي عدد الموظفين"
        placeholder="ادخل العدد" type="number" :rules="[numeric(), positive()]"/>
      <TextInput v-model="formData.engineersCount" @input="emitUpdate" label="عدد المهندسين" placeholder="ادخل العدد"
        type="number" :rules="[numeric(), positive()]"/>
      <TextInput v-model="formData.techniciansCount" @input="emitUpdate" label="عدد الفنيين" placeholder="ادخل العدد"
        type="number" :rules="[numeric(), positive()]"/>
      <SelectWithIconInput clearable v-model="formData.operationalCapacity" @update:model-value="emitUpdate"
        label="القدرة التشغيلية للمقاول" placeholder="اختر" :items="operationalCapacityItems" />
      <SelectWithIconInput clearable v-model="formData.specialization" @update:model-value="emitUpdate"
        label="التخصص الرئيسي المقاول" placeholder="اختر" :items="specializationItems" />
      <SelectWithIconInput clearable v-model="formData.siteReadiness" @update:model-value="emitUpdate" label="جاهزية مواقع العمل"
        placeholder="اختر" :items="siteReadinessItems" />
      <div>
        <span class="text-gray-700 text-sm font-semibold mb-2 block">نظام إدارة السلامة</span>
        <div class="flex gap-4">
          <v-radio-group v-model="formData.safetyManagementSystem" @update:model-value="emitUpdate" inline hide-details>
            <v-radio :value="true" color="primary">
              <template #label>
                <span :class="formData.safetyManagementSystem ? 'text-primary font-semibold' : 'text-gray-600'">
                  نعم
                </span>
              </template>
            </v-radio>
            <v-radio :value="false" color="primary">
              <template #label>
                <span :class="!formData.safetyManagementSystem ? 'text-primary font-semibold' : 'text-gray-600'">
                  لا
                </span>
              </template>
            </v-radio>
          </v-radio-group>
        </div>
      </div>
      <div>
        <span class="text-gray-700 text-sm font-semibold mb-2 block">الالتزام بالأنظمة البيئية</span>
        <div class="flex gap-4">
          <v-radio-group v-model="formData.environmentalCompliance" @update:model-value="emitUpdate" inline
            hide-details>
            <v-radio :value="true" color="primary">
              <template #label>
                <span :class="formData.environmentalCompliance ? 'text-primary font-semibold' : 'text-gray-600'">
                  نعم
                </span>
              </template>
            </v-radio>
            <v-radio :value="false" color="primary">
              <template #label>
                <span :class="!formData.environmentalCompliance ? 'text-primary font-semibold' : 'text-gray-600'">
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
