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

const markIcon = `<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 21C13 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 5 17 9 21Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">البيانات الاساسية</h2>

    <!-- Row 1: Business Name and Owner Name -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6 mb-4">
      <div class="md:col-span-2">
        <LanguageTabs :languages="availableLanguages" label="الاسم التجاري">
          <template #en>
            <TextInput v-model="formData.businessNameTranslations.en" @blur="emitUpdate"
              placeholder="Enter business name in English" :hide-details="false"
              :error-messages="props.formErrors?.['business_name.en']" 
              @update:model-value="clearError('business_name.en')" />
          </template>
          <template #ar>
            <TextInput v-model="formData.businessNameTranslations.ar" @blur="emitUpdate"
              placeholder="ادخل الاسم التجاري بالعربية" :hide-details="false"
              :error-messages="props.formErrors?.['business_name.ar']" 
              @update:model-value="clearError('business_name.ar')" />
          </template>
        </LanguageTabs>
      </div>
      <TextInput v-model="formData.ownerName" @blur="emitUpdate" label="اسم المالك / الشركة المالكة"
        placeholder="AL-ED" :hide-details="false" :error-messages="props.formErrors?.['owner_name']" 
        @update:model-value="clearError('owner_name')" required />
      <TextInput v-model="formData.buisnessno" @input="emitUpdate" label="السجل التجاري" :hide-details="false"
        placeholder="32655451" :error-messages="props.formErrors?.['buisnessno']"
        @update:model-value="clearError('buisnessno')" type="text" />
      <TextInput v-model="formData.taxno" :hide-details="false" @input="emitUpdate" label="الرقم الضريبي"
        placeholder="216623263" :error-messages="props.formErrors?.['taxno']" @update:model-value="clearError('taxno')"
        type="text" />

            <TelInput v-model="formData.mobile" label="الهاتف المحمول" :rules="[required(), saudiPhone()]"
        :error-messages="props.formErrors?.['mobile']" @input="() => handleInputUpdate('mobile')" />

      <TelInput v-model="formData.phone" label="الهاتف" :rules="[required(), saudiPhone()]"
        :error-messages="props.formErrors?.['phone']" @input="() => handleInputUpdate('phone')" />

      <TextInput v-model="formData.email" @input="() => handleInputUpdate('email')" label="البريد الإلكتروني"
        placeholder="info@buildtrans.sa" :rules="[required()]" dir="ltr" type="email"
        :error-messages="props.formErrors?.['email']" :hide-details="false" />
      <SelectWithIconInput clearable show-add-button v-model="formData.languageId" @update:model-value="emitUpdate" label="اللغة"
        placeholder="اختر اللغة" :items="languageItems" :rules="[required()]" :hide-details="false"
        @input="() => handleInputUpdate('language_id')" :error-messages="props.formErrors?.['language_id']" />

      <h2 class="text-lg font-bold text-primary-900 mt-6 mb-2 md:col-span-3">معلومات العنوان</h2>

      <SelectWithIconInput clearable v-model="formData.countryId" label="الدولة"
        placeholder="Saudi arabia" :items="countryItems" :hide-details="false"
        :error-messages="props.formErrors?.['country_id']" 
        @update:model-value="() => { clearError('country_id'); emitUpdate(); }" />
      <SelectWithIconInput clearable v-model="formData.cityId" label="المدينة"
        placeholder="Riyadh" :items="cityItems" :hide-details="false"
        :error-messages="props.formErrors?.['city_id']" 
        @update:model-value="() => { clearError('city_id'); emitUpdate(); }" />
      <TextInput v-model="formData.neighborhood" @input="emitUpdate" label="الحي" placeholder="الحي" />
      <TextInput v-model="formData.streetName" @input="emitUpdate" label="الشارع" placeholder="اسم الشارع" />
      <TextInput v-model="formData.postalCode" @input="emitUpdate" label="الرمز البريدي" placeholder="966" />
      <TextInput v-model="formData.buildingNumber" @input="emitUpdate" label="رقم المبنى" placeholder="25544" />
      <TextInput v-model="formData.address1" dir="ltr" @input="emitUpdate" label="العنوان الوطني"
        placeholder="Industrial Area">
        <template #append-inner>
          <span v-html="markIcon"></span>
        </template>
      </TextInput>
    </div>
  </div>
</template>
