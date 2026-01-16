<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface Props {
  fullNameTranslations: { ar: string; en: string };
  tradeNameTranslations: { ar: string; en: string };
  commercialRegister: string;
  taxRegister: string;
  entityType: string | null;
  isActive: boolean;
  crIssueDate: string;
  crExpiryDate: string;
  languageId: number | null;
  phone: string;
  email: string;
  mobile: string;
  countryId: number | null;
  cityId: number | null;
  neighborhood: string;
  streetName: string;
  buildingNumber: string;
  postalCode: string;
  address1: string;
  entityTypeItems: Array<{ title: string; value: string }>;
  languageItems: Array<{ title: string; value: number }>;
  countryItems: Array<{ title: string; value: number }>;
  cityItems: Array<{ title: string; value: number }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: Partial<Props>];
}>();

const formData = reactive({
  fullNameTranslations: props.fullNameTranslations,
  tradeNameTranslations: props.tradeNameTranslations,
  commercialRegister: props.commercialRegister,
  taxRegister: props.taxRegister,
  entityType: props.entityType,
  isActive: props.isActive,
  crIssueDate: props.crIssueDate,
  crExpiryDate: props.crExpiryDate,
  languageId: props.languageId,
  phone: props.phone,
  email: props.email,
  mobile: props.mobile,
  countryId: props.countryId,
  cityId: props.cityId,
  neighborhood: props.neighborhood,
  streetName: props.streetName,
  buildingNumber: props.buildingNumber,
  postalCode: props.postalCode,
  address1: props.address1,
});

watch(() => props, (newProps) => {
  Object.assign(formData, {
    fullNameTranslations: newProps.fullNameTranslations,
    tradeNameTranslations: newProps.tradeNameTranslations,
    commercialRegister: newProps.commercialRegister,
    taxRegister: newProps.taxRegister,
    entityType: newProps.entityType,
    isActive: newProps.isActive,
    crIssueDate: newProps.crIssueDate,
    crExpiryDate: newProps.crExpiryDate,
    languageId: newProps.languageId,
    phone: newProps.phone,
    email: newProps.email,
    mobile: newProps.mobile,
    countryId: newProps.countryId,
    cityId: newProps.cityId,
    neighborhood: newProps.neighborhood,
    streetName: newProps.streetName,
    buildingNumber: newProps.buildingNumber,
    postalCode: newProps.postalCode,
    address1: newProps.address1,
  });
}, { deep: true });

const emitUpdate = () => {
  emit('update:formData', { ...formData });
};

const markIcon = `<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 21C13 17 17 13.4183 17 9C17 4.58172 13 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 5 17 9 21Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

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
`
</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">المعلومات العامة</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="md:col-span-2">
        <LanguageTabs :languages="availableLanguages" label="الاسم كامل">
          <template #en>
            <TextInput v-model="formData.fullNameTranslations.en" @blur="emitUpdate"
              placeholder="Enter full name in English" :hide-details="true" />
          </template>
          <template #ar>
            <TextInput v-model="formData.fullNameTranslations.ar" @blur="emitUpdate"
              placeholder="ادخل الاسم كامل بالعربية" :hide-details="true" required />
          </template>
        </LanguageTabs>
      </div>
      <TextInput v-model="formData.commercialRegister" @blur="emitUpdate" label="السجل التجاري" placeholder="32655451"
        required />

      <div class="md:col-span-2">
        <LanguageTabs :languages="availableLanguages" label="الاسم التجاري">
          <template #en>
            <TextInput v-model="formData.tradeNameTranslations.en" @blur="emitUpdate"
              placeholder="Enter trade name in English" :hide-details="true" />
          </template>
          <template #ar>
            <TextInput v-model="formData.tradeNameTranslations.ar" @blur="emitUpdate"
              placeholder="ادخل الاسم التجاري بالعربية" :hide-details="true" required />
          </template>
        </LanguageTabs>
      </div>
      <TextInput v-model="formData.taxRegister" @blur="emitUpdate" label="الرقم الضريبي" placeholder="216623263" />
      <SelectWithIconInput v-model="formData.entityType" @update:model-value="emitUpdate" label="نوع الكيان"
        placeholder="شركة مساهمة" :items="entityTypeItems" />

      <TextInput v-model="formData.phone" @blur="emitUpdate" label="الهاتف" placeholder="+966 (555) 000-0000" dir="ltr">
        <template #prepend-inner>
          <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
        </template>
      </TextInput>
      <TextInput v-model="formData.mobile" @blur="emitUpdate" label="الجوال" placeholder="+966 (555) 000-0000"
        dir="ltr">
        <template #prepend-inner>
          <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
        </template>
      </TextInput>

      <DatePickerInput v-model="formData.crIssueDate" @blur="emitUpdate" label="تاريخ إصدار السجل التجاري"
        placeholder="اختر التاريخ">
        <template #append-inner>
          <v-tooltip location="top" content-class="custom-tooltip">
            <template #activator="{ props: tooltipProps }">
              <ButtonWithIcon variant="text" size="small" density="compact"
                custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
            </template>
            <div>
              تاريخ إصدار السجل التجاري للمؤسسة
            </div>
          </v-tooltip>
        </template>
        <template #prepend-inner>
          <span v-html="datepickerInput"></span>
        </template>
      </DatePickerInput>
      <DatePickerInput v-model="formData.crExpiryDate" @blur="emitUpdate" label="تاريخ انتهاء السجل التجاري"
        placeholder="اختر التاريخ">
        <template #append-inner>
          <v-tooltip location="top" content-class="custom-tooltip">
            <template #activator="{ props: tooltipProps }">
              <ButtonWithIcon variant="text" size="small" density="compact"
                custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
            </template>
            <div>
              تاريخ انتهاء صلاحية السجل التجاري
            </div>
          </v-tooltip>
        </template>
        <template #prepend-inner>
          <span v-html="datepickerInput"></span>
        </template>
      </DatePickerInput>

      <SelectWithIconInput show-add-button v-model="formData.languageId" @update:model-value="emitUpdate" label="اللغة"
        placeholder="English" :items="languageItems" />
      <TextInput v-model="formData.email" @blur="emitUpdate" label="البريد الإلكتروني" placeholder="info@buildtrans.sa"
        required dir="ltr" />
      <h2 class="text-lg font-bold text-primary-900 mt-6 mb-2 md:col-span-3">معلومات العنوان</h2>

      <SelectWithIconInput v-model="formData.countryId" @update:model-value="emitUpdate" label="الدولة"
        placeholder="Saudi arabia" :items="countryItems" />
      <SelectWithIconInput v-model="formData.cityId" @update:model-value="emitUpdate" label="المدينة"
        placeholder="Riyadh" :items="cityItems" />
      <TextInput v-model="formData.neighborhood" @blur="emitUpdate" label="الحي" placeholder="Riyadh" />

      <TextInput v-model="formData.streetName" @blur="emitUpdate" label="الشارع" placeholder="966" />
      <TextInput v-model="formData.postalCode" @blur="emitUpdate" label="الرمز البريدي" placeholder="966" />
      <TextInput v-model="formData.buildingNumber" @blur="emitUpdate" label="رقم المبنى" placeholder="25544" />

      <TextInput v-model="formData.address1" dir="ltr" @blur="emitUpdate" label="العنوان الوطني" placeholder="Industrial Area">
        <template #append-inner>
          <span v-html="markIcon"></span>
        </template>
      </TextInput>
      <div>
        <span class="text-gray-700 text-sm font-semibold mb-2 block">حالة المقاول ؟</span>
        <div class="flex gap-4">
          <v-radio-group v-model="formData.isActive" @update:model-value="emitUpdate" inline hide-details>
            <v-radio :value="true" color="primary">
              <template #label>
                <span :class="formData.isActive ? 'text-primary font-semibold' : 'text-gray-600'">
                  فعال
                </span>
              </template>
            </v-radio>
            <v-radio :value="false" color="primary">
              <template #label>
                <span :class="!formData.isActive ? 'text-primary font-semibold' : 'text-gray-600'">
                  غير فعال
                </span>
              </template>
            </v-radio>
          </v-radio-group>
        </div>
      </div>

    </div>
  </div>
</template>
