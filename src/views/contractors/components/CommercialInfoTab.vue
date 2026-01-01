<script setup lang="ts">
import { reactive, watch } from 'vue';

interface Props {
  contractorClassification: string | null;
  classificationGrade: string | null;
  scopeOfWork: string | null;
  municipalLicenseNumber: string;
  municipalLicenseExpiry: string;
  municipalLicenseStatus: string | null;
  safetyCertification: string | null;
  environmentalCertification: string | null;
  civilDefenseApproval: boolean;
  contractorClassificationItems: Array<{ title: string; value: string }>;
  classificationGradeItems: Array<{ title: string; value: string }>;
  scopeOfWorkItems: Array<{ title: string; value: string }>;
  municipalLicenseStatusItems: Array<{ title: string; value: string }>;
  safetyCertificationItems: Array<{ title: string; value: string }>;
  environmentalCertificationItems: Array<{ title: string; value: string }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: Partial<Props>];
}>();

const formData = reactive({
  contractorClassification: props.contractorClassification,
  classificationGrade: props.classificationGrade,
  scopeOfWork: props.scopeOfWork,
  municipalLicenseNumber: props.municipalLicenseNumber,
  municipalLicenseExpiry: props.municipalLicenseExpiry,
  municipalLicenseStatus: props.municipalLicenseStatus,
  safetyCertification: props.safetyCertification,
  environmentalCertification: props.environmentalCertification,
  civilDefenseApproval: props.civilDefenseApproval,
});

watch(() => props, (newProps) => {
  Object.assign(formData, {
    contractorClassification: newProps.contractorClassification,
    classificationGrade: newProps.classificationGrade,
    scopeOfWork: newProps.scopeOfWork,
    municipalLicenseNumber: newProps.municipalLicenseNumber,
    municipalLicenseExpiry: newProps.municipalLicenseExpiry,
    municipalLicenseStatus: newProps.municipalLicenseStatus,
    safetyCertification: newProps.safetyCertification,
    environmentalCertification: newProps.environmentalCertification,
    civilDefenseApproval: newProps.civilDefenseApproval,
  });
}, { deep: true });

const emitUpdate = () => {
  emit('update:formData', { ...formData });
};
</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">البيانات التجارية</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <SelectWithIconInput v-model="formData.contractorClassification" @update:model-value="emitUpdate"
        label="تصنيف المقاول" placeholder="اختر" :items="contractorClassificationItems" required />
      <SelectWithIconInput v-model="formData.classificationGrade" @update:model-value="emitUpdate"
        label="درجة تصنيف المقاول" placeholder="اختر" :items="classificationGradeItems" required />
      <SelectWithIconInput v-model="formData.scopeOfWork" @update:model-value="emitUpdate" label="نطاق الأعمال"
        placeholder="اختر" :items="scopeOfWorkItems" />

      <TextInput v-model="formData.municipalLicenseNumber" @blur="emitUpdate" label="رقم رخصة البلدية"
        placeholder="ادخل الرقم" />
      <TextInput v-model="formData.municipalLicenseExpiry" @blur="emitUpdate" type="date"
        label="تاريخ انتهاء رخصة البلدية" placeholder="2024-03-01" />
      <SelectWithIconInput v-model="formData.municipalLicenseStatus" @update:model-value="emitUpdate"
        label="حالة رخصة البلدية" placeholder="اختر" :items="municipalLicenseStatusItems" />

      <SelectWithIconInput v-model="formData.safetyCertification" @update:model-value="emitUpdate"
        label="شهادات السلامة المهنية" placeholder="اختر" :items="safetyCertificationItems" />

      <SelectWithIconInput v-model="formData.environmentalCertification" @update:model-value="emitUpdate"
        label="شهادات البيئة" placeholder="اختر" :items="environmentalCertificationItems" />

      <div>
        <span class="text-gray-700 text-sm font-semibold mb-2 block">موافقة الدفاع المدني ؟</span>
        <div class="flex gap-4">
          <v-radio-group v-model="formData.civilDefenseApproval" @update:model-value="emitUpdate" inline hide-details>
            <v-radio label="نعم" :value="true" color="primary" />
            <v-radio label="لا" :value="false" color="primary" />
          </v-radio-group>
        </div>
      </div>
    </div>
  </div>
</template>
