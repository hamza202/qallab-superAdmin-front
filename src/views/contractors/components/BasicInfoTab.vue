<script setup lang="ts">
import { reactive, watch, ref } from 'vue';

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
      <div class="hidden md:block"></div>

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
      <TextInput v-model="formData.commercialRegister" @blur="emitUpdate" label="السجل التجاري" placeholder="32655451"
        required />

      <TextInput v-model="formData.taxRegister" @blur="emitUpdate" label="الرقم الضريبي" placeholder="216623263" />
      <SelectWithIconInput v-model="formData.entityType" @update:model-value="emitUpdate" label="نوع الكيان"
        placeholder="شركة مساهمة" :items="entityTypeItems" />

      <TextInput v-model="formData.phone" @blur="emitUpdate" label="الهاتف" placeholder="+966 (555) 000-0000" dir="ltr">
        <template #append-inner>
          <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
        </template>
      </TextInput>
      <TextInput v-model="formData.mobile" @blur="emitUpdate" label="الجوال" placeholder="+966 (555) 000-0000"
        dir="ltr">
        <template #append-inner>
          <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
        </template>
      </TextInput>

      <TextInput v-model="formData.crIssueDate" @blur="emitUpdate" type="date" label="تاريخ إصدار السجل التجاري"
        placeholder="2024-03-01" />
      <TextInput v-model="formData.crExpiryDate" @blur="emitUpdate" type="date" label="تاريخ انتهاء السجل التجاري"
        placeholder="2024-03-01" />

      <SelectWithIconInput v-model="formData.languageId" @update:model-value="emitUpdate" label="اللغة"
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

      <TextInput v-model="formData.address1" @blur="emitUpdate" label="العنوان الوطني" placeholder="Industrial Area">
        <template #prepend-inner>
          <v-icon size="small" color="gray">mdi-map-marker</v-icon>
        </template>
      </TextInput>
      <div>
        <span class="text-gray-700 text-sm font-semibold mb-2 block">حالة المقاول ؟</span>
        <div class="flex gap-4">
          <v-radio-group v-model="formData.isActive" @update:model-value="emitUpdate" inline hide-details>
            <v-radio label="غير فعال" :value="false" color="primary" />
            <v-radio label="فعال" :value="true" color="primary" />
          </v-radio-group>
        </div>
      </div>

    </div>
  </div>
</template>
