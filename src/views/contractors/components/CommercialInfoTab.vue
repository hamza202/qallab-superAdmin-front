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
`;

const datepickerInput = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.3333 2.66683H12.6667V1.3335H11.3333V2.66683H4.66667V1.3335H3.33333V2.66683H2.66667C1.93333 2.66683 1.33333 3.26683 1.33333 4.00016V13.3335C1.33333 14.0668 1.93333 14.6668 2.66667 14.6668H13.3333C14.0667 14.6668 14.6667 14.0668 14.6667 13.3335V4.00016C14.6667 3.26683 14.0667 2.66683 13.3333 2.66683ZM13.3333 13.3335H2.66667V6.00016H13.3333V13.3335Z" fill="#4B5565"/>
</svg>
`;
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
      <DatePickerInput v-model="formData.municipalLicenseExpiry" @blur="emitUpdate" label="تاريخ انتهاء رخصة البلدية"
        placeholder="اختر التاريخ">
        <template #append-inner>
          <v-tooltip location="top" content-class="custom-tooltip">
            <template #activator="{ props: tooltipProps }">
              <v-btn class="!min-w-0 p-0" size="small" density="compact"
                v-bind="tooltipProps">
                <span v-html="infoIcon"></span>
              </v-btn>
            </template>
            <div>
              تاريخ انتهاء صلاحية رخصة البلدية
            </div>
          </v-tooltip>
        </template>
        <template #prepend-inner>
          <span v-html="datepickerInput"></span>
        </template>
      </DatePickerInput>
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
            <v-radio :value="true" color="primary">
              <template #label>
                <span :class="formData.civilDefenseApproval ? 'text-primary font-semibold' : 'text-gray-600'">
                  نعم
                </span>
              </template>
            </v-radio>
            <v-radio :value="false" color="primary">
              <template #label>
                <span :class="!formData.civilDefenseApproval ? 'text-primary font-semibold' : 'text-gray-600'">
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
