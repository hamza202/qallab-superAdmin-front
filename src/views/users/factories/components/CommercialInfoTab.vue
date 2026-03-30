<script setup lang="ts">
import { reactive, watch } from 'vue';

interface Props {
  licenseType: string | null;
  licenseNumber: string;
  issuingAuthority: string | null;
  issueDate: string;
  expiryDate: string;
  licenseStatus: string | null;
  licensedActivity: string | null;
  activityTypes: string[];
  productTypes: number[];
  rawMaterialTypes: string[];
  rawMaterialSource: string | null;
  licensedCapacity: number | null;
  licenseTypeItems: Array<{ title: string; value: string }>;
  issuingAuthorityItems: Array<{ title: string; value: string }>;
  licenseStatusItems: Array<{ title: string; value: string }>;
  licensedActivityItems: Array<{ title: string; value: string }>;
  activityTypesItems: Array<{ title: string; value: string }>;
  productTypesItems: Array<{ title: string; value: number }>;
  rawMaterialTypesItems: Array<{ title: string; value: string }>;
  rawMaterialSourceItems: Array<{ title: string; value: string }>;
  formErrors?: Record<string, string>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: Partial<Props>];
  'clear:error': [field: string];
}>();

const formData = reactive({
  licenseType: props.licenseType,
  licenseNumber: props.licenseNumber,
  issuingAuthority: props.issuingAuthority,
  issueDate: props.issueDate,
  expiryDate: props.expiryDate,
  licenseStatus: props.licenseStatus,
  licensedActivity: props.licensedActivity,
  activityTypes: props.activityTypes,
  productTypes: props.productTypes,
  rawMaterialTypes: props.rawMaterialTypes,
  rawMaterialSource: props.rawMaterialSource,
  licensedCapacity: props.licensedCapacity,
});

watch(() => props, (newProps) => {
  Object.assign(formData, {
    licenseType: newProps.licenseType,
    licenseNumber: newProps.licenseNumber,
    issuingAuthority: newProps.issuingAuthority,
    issueDate: newProps.issueDate,
    expiryDate: newProps.expiryDate,
    licenseStatus: newProps.licenseStatus,
    licensedActivity: newProps.licensedActivity,
    activityTypes: newProps.activityTypes,
    productTypes: newProps.productTypes,
    rawMaterialTypes: newProps.rawMaterialTypes,
    rawMaterialSource: newProps.rawMaterialSource,
    licensedCapacity: newProps.licensedCapacity,
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
      <SelectWithIconInput clearable v-model="formData.licenseType" @update:model-value="() => handleFieldUpdate('license_type')"
        label="نوع الرخصة" placeholder="اختر نوع الرخصة مثل: صناعية" :items="licenseTypeItems" 
        :error-messages="formErrors?.license_type" />

      <TextInput v-model="formData.licenseNumber" @input="() => handleFieldUpdate('license_number')" label="رقم الرخصة"
        placeholder="ادخل رقم الرخصة مثل: FAC-LIC-2024-001" :error-messages="formErrors?.license_number" />

      <SelectWithIconInput clearable v-model="formData.issuingAuthority" @update:model-value="() => handleFieldUpdate('issuing_authority')"
        label="الجهة المانحة" placeholder="اختر الجهة المانحة مثل: الهيئة السعودية للمواصفات" :items="issuingAuthorityItems" 
        :error-messages="formErrors?.issuing_authority" />

      <DatePickerInput v-model="formData.issueDate" @update:model-value="() => handleFieldUpdate('issue_date')" label="تاريخ اصدار الرخصة"
        placeholder="اختر تاريخ الاصدار مثل: 01-01-2024" :error-messages="formErrors?.issue_date">
        <template #append-inner>
          <v-tooltip location="top" content-class="custom-tooltip">
            <template #activator="{ props: tooltipProps }">
              <ButtonWithIcon variant="text" size="small" density="compact"
                custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
            </template>
            <div>
              تاريخ إصدار الرخصة
            </div>
          </v-tooltip>
        </template>
        <template #prepend-inner>
          <span v-html="datepickerInput"></span>
        </template>
      </DatePickerInput>

      <DatePickerInput v-model="formData.expiryDate" @update:model-value="() => handleFieldUpdate('expiry_date')" label="تاريخ انتهاء الرخصة"
        placeholder="اختر تاريخ الانتهاء مثل: 31-12-2024" :error-messages="formErrors?.expiry_date">
        <template #append-inner>
          <v-tooltip location="top" content-class="custom-tooltip">
            <template #activator="{ props: tooltipProps }">
              <ButtonWithIcon variant="text" size="small" density="compact"
                custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
            </template>
            <div>
              تاريخ انتهاء صلاحية الرخصة
            </div>
          </v-tooltip>
        </template>
        <template #prepend-inner>
          <span v-html="datepickerInput"></span>
        </template>
      </DatePickerInput>

      <div>
        <span class="text-gray-700 text-sm font-semibold mb-2 block">حالة الرخصة</span>
        <div class="flex gap-4">
          <v-radio-group v-model="formData.licenseStatus" @update:model-value="() => handleFieldUpdate('license_status')" inline hide-details>
            <v-radio value="active" color="primary">
              <template #label>
                <span :class="formData.licenseStatus === 'active' ? 'text-primary font-semibold' : 'text-gray-600'">
                  فعال
                </span>
              </template>
            </v-radio>
            <v-radio value="inactive" color="primary">
              <template #label>
                <span :class="formData.licenseStatus === 'inactive' ? 'text-primary font-semibold' : 'text-gray-600'">
                  غير فعال
                </span>
              </template>
            </v-radio>
          </v-radio-group>
        </div>
      </div>

      <SelectWithIconInput clearable v-model="formData.licensedActivity" @update:model-value="() => handleFieldUpdate('licensed_activity')" label="النشاط المرخص"
        placeholder="اختر النشاط المرخص مثل: تصنيع مواد البناء"  :items="licensedActivityItems"  :error-messages="formErrors?.licensed_activity"/>

      <MultipleSelectInput v-model="formData.activityTypes" @update:model-value="() => handleFieldUpdate('activity_types')"
        label="نوع المواد" placeholder="اختر نوع النشاط مثل: تصنيع مواد" :items="activityTypesItems"
        :input-props="{ clearable: true }" :error-messages="formErrors?.activity_types" />

      <MultipleSelectInput v-model="formData.productTypes" @update:model-value="() => handleFieldUpdate('product_types')"
        label="أنواع المنتجات" placeholder="اختر أنواع المنتجات مثل: اسمنت، رمل" :items="productTypesItems"
        :input-props="{ clearable: true }" :error-messages="formErrors?.product_types" />

      <MultipleSelectInput v-model="formData.rawMaterialTypes" @update:model-value="() => handleFieldUpdate('raw_material_types')"
        label="نوع المواد الخام" placeholder="اختر نوع المواد الخام مثل: حجر جيري" :items="rawMaterialTypesItems"
        :input-props="{ clearable: true }" :error-messages="formErrors?.raw_material_types" />

      <SelectWithIconInput clearable v-model="formData.rawMaterialSource" @update:model-value="() => handleFieldUpdate('raw_material_source')"
        label="مصدر المواد الخام" placeholder="اختر مصدر المواد الخام مثل: محلي" :items="rawMaterialSourceItems" 
        :error-messages="formErrors?.raw_material_source" />

      <TextInput v-model="formData.licensedCapacity" @input="() => handleFieldUpdate('licensed_capacity')" label="الطاقة المرخصة"
        placeholder="ادخل الطاقة المرخصة مثل: 1000 طن/يوم" type="number" :error-messages="formErrors?.licensed_capacity" />
    </div>
  </div>
</template>
