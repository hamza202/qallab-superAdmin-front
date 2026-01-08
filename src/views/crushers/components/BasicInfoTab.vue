<script setup lang="ts">
import { reactive, watch, ref } from 'vue';

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface Props {
  businessNameTranslations: { ar: string; en: string };
  ownerName: string;
  mobile: string;
  phone: string;
  email: string;
  buisnessno: string;
  taxno: string;
  countryId: number | null;
  cityId: number | null;
  neighborhood: string;
  streetName: string;
  postalCode: string;
  buildingNumber: string;
  address1: string;
  languageId: number | null;
  countryItems: Array<{ title: string; value: number }>;
  cityItems: Array<{ title: string; value: number }>;
  languageItems: Array<{ title: string; value: number }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: Partial<Props>];
}>();

const formData = reactive({
  businessNameTranslations: props.businessNameTranslations,
  ownerName: props.ownerName,
  mobile: props.mobile,
  phone: props.phone,
  email: props.email,
  buisnessno: props.buisnessno,
  taxno: props.taxno,
  countryId: props.countryId,
  cityId: props.cityId,
  neighborhood: props.neighborhood,
  streetName: props.streetName,
  postalCode: props.postalCode,
  buildingNumber: props.buildingNumber,
  address1: props.address1,
  languageId: props.languageId,
});

// Watch props and update local formData
watch(() => props, (newProps) => {
  Object.assign(formData, {
    businessNameTranslations: newProps.businessNameTranslations,
    ownerName: newProps.ownerName,
    mobile: newProps.mobile,
    phone: newProps.phone,
    email: newProps.email,
    buisnessno: newProps.buisnessno,
    taxno: newProps.taxno,
    countryId: newProps.countryId,
    cityId: newProps.cityId,
    neighborhood: newProps.neighborhood,
    streetName: newProps.streetName,
    postalCode: newProps.postalCode,
    buildingNumber: newProps.buildingNumber,
    address1: newProps.address1,
    languageId: newProps.languageId,
  });
}, { deep: true });

const emitUpdate = () => {
  emit('update:formData', { ...formData });
};
</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">البيانات الاساسية</h2>

    <!-- Row 1: Business Name and Owner Name -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="md:col-span-2">
        <LanguageTabs :languages="availableLanguages" label="الاسم التجاري">
          <template #en>
            <TextInput v-model="formData.businessNameTranslations.en" @blur="emitUpdate"
              placeholder="Enter business name in English" :hide-details="true" />
          </template>
          <template #ar>
            <TextInput v-model="formData.businessNameTranslations.ar" @blur="emitUpdate"
              placeholder="ادخل الاسم التجاري بالعربية" :hide-details="true" />
          </template>
        </LanguageTabs>
      </div>
      <TextInput v-model="formData.ownerName" @blur="emitUpdate"
        label="اسم المالك / الشركة المالكة" placeholder="AL- ED" required />
      <TextInput v-model="formData.buisnessno" @blur="emitUpdate" label="السجل التجاري"
        placeholder="32655451" />
      <TextInput v-model="formData.taxno" @blur="emitUpdate" label="الرقم الضريبي"
        placeholder="216623263" />

      <TextInput v-model="formData.mobile" @blur="emitUpdate" label="الهاتف المحمول"
        placeholder="+966 (555) 000-0000" required dir="ltr">
        <template #append-inner>
          <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
        </template>
      </TextInput>
      <TextInput v-model="formData.phone" @blur="emitUpdate" label="الهاتف"
        placeholder="+966 (555) 000-0000" dir="ltr">
        <template #append-inner>
          <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
        </template>
      </TextInput>
      <TextInput v-model="formData.email" @blur="emitUpdate" label="البريد الإلكتروني"
        placeholder="info@buildtrans.sa" dir="ltr" />
      <SelectWithIconInput v-model="formData.languageId" @update:model-value="emitUpdate" label="اللغة"
        placeholder="اختر اللغة" :items="languageItems" />

    <h2 class="text-lg font-bold text-primary-900 mt-6 mb-2 md:col-span-3">معلومات العنوان</h2>

      <SelectWithIconInput v-model="formData.countryId" @update:model-value="emitUpdate" label="الدولة"
        placeholder="Saudi arabia" :items="countryItems" />
      <SelectWithIconInput v-model="formData.cityId" @update:model-value="emitUpdate" label="المدينة"
        placeholder="Riyadh" :items="cityItems" />
      <TextInput v-model="formData.neighborhood" @blur="emitUpdate" label="الحي"
        placeholder="الحي" />
      <TextInput v-model="formData.streetName" @blur="emitUpdate"
        label="الشارع" placeholder="اسم الشارع" />
      <TextInput v-model="formData.postalCode" @blur="emitUpdate"
        label="الرمز البريدي" placeholder="966" />
      <TextInput v-model="formData.buildingNumber" @blur="emitUpdate"
        label="رقم المبنى" placeholder="25544" />
      <TextInput v-model="formData.address1" @blur="emitUpdate"
        label="العنوان الوطني" placeholder="أدخل العنوان">
        <template #prepend-inner>
          <v-icon size="small" color="gray">mdi-map-marker</v-icon>
        </template>
      </TextInput>
    </div>
  </div>
</template>
