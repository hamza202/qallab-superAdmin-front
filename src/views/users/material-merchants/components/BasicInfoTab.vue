<script setup lang="ts">
import { taxNo, unifiedLoginId, email } from '@/utils/validators';

const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface Props {
  businessNameTranslations: { ar: string; en: string };
  buisnessno: string;
  taxno: string;
  ownerName: string;
  phone: string;
  email: string;
  mobile: string;
  unifiedLoginId: string;
  countryId: number | null;
  cityId: number | null;
  neighborhood: string;
  streetName: string;
  buildingNumber: string;
  postalCode: string;
  address1: string;
  countryItems: Array<{ title: string; value: number }>;
  cityItems: Array<{ title: string; value: number }>;
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
  console.log(field);

  clearError(field);
  emitUpdate();
};

const formData = reactive({
  businessNameTranslations: props.businessNameTranslations,
  buisnessno: props.buisnessno,
  taxno: props.taxno,
  ownerName: props.ownerName,
  phone: props.phone,
  email: props.email,
  mobile: props.mobile,
  unifiedLoginId: props.unifiedLoginId,
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
    businessNameTranslations: newProps.businessNameTranslations,
    buisnessno: newProps.buisnessno,
    taxno: newProps.taxno,
    ownerName: newProps.ownerName,
    phone: newProps.phone,
    email: newProps.email,
    mobile: newProps.mobile,
    unifiedLoginId: newProps.unifiedLoginId,
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


</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">البيانات العامة</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6 mb-4">
      <LanguageTabs :languages="availableLanguages" label="اسم الشركة">
        <template #en>
          <TextInput v-model="formData.businessNameTranslations.en" @input="() => handleInputUpdate('business_name.en')"
            placeholder="Enter business name in English" :hide-details="false" :rules="[required()]"
            :error-messages="props.formErrors?.['business_name.en']" />
        </template>
        <template #ar>
          <TextInput v-model="formData.businessNameTranslations.ar" @input="() => handleInputUpdate('business_name.ar')"
            placeholder="ادخل اسم الشركة بالعربية" :hide-details="false" :rules="[required()]"
            :error-messages="props.formErrors?.['business_name.ar']" required />
        </template>
      </LanguageTabs>

      <TextInput v-model="formData.buisnessno" @input="() => handleInputUpdate('buisnessno')" :rules="[required()]"
        :error-messages="props.formErrors?.['buisnessno']" label="رقم السجل التجاري"
        placeholder="أدخل رقم السجل التجاري" :hide-details="false" required />

      <TextInput v-model="formData.taxno" :hide-details="false" @input="() => handleInputUpdate('taxno')"
        label="الرقم الضريبي" placeholder="أدخل الرقم الضريبي" :rules="[taxNo()]"
        :error-messages="props.formErrors?.['taxno']" @update:model-value="clearError('taxno')" type="text" required />

      <TextInput v-model="formData.unifiedLoginId" @input="() => handleInputUpdate('unified_login_id')"
        label="معرف الدخول الموحد" placeholder="أدخل معرف الدخول الموحد" :hide-details="false"
        :rules="[unifiedLoginId()]" :error-messages="props.formErrors?.['unified_login_id']"
        @update:model-value="clearError('unified_login_id')" type="text" />

      <TextInput v-model="formData.ownerName" @input="() => handleInputUpdate('owner_name')" :rules="[required()]"
        :error-messages="props.formErrors?.['owner_name']" label="اسم المالك" placeholder="أدخل اسم المالك"
        :hide-details="false" required />

      <TelInput v-model="formData.phone" label="رقم الهاتف" :rules="[required(), saudiPhone()]"
        :error-messages="props.formErrors?.['phone']" @input="() => handleInputUpdate('phone')" />

      <TelInput v-model="formData.mobile" label="رقم الجوال" :rules="[saudiPhone()]"
        :error-messages="props.formErrors?.['mobile']" @input="() => handleInputUpdate('mobile')" />

      <TextInput v-model="formData.email" @input="() => handleInputUpdate('email')" label="البريد الإلكتروني"
        placeholder="أدخل البريد الإلكتروني" :hide-details="false" :rules="[required(), email()]"
        :error-messages="props.formErrors?.['email']" dir="ltr" required />
    </div>
  </div>

  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <div class="flex items-center gap-2 mb-4">
      <h2 class="text-lg font-bold text-primary-900">معلومات العنوان</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6">
      <SelectInput v-model="formData.countryId" @update:model-value="() => handleInputUpdate('country_id')"
        :items="props.countryItems" label="الدولة" placeholder="اختر الدولة" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['country_id']" required />

      <SelectInput v-model="formData.cityId" @update:model-value="() => handleInputUpdate('city_id')"
        :items="props.cityItems" label="المدينة" placeholder="اختر المدينة" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['city_id']" required />

      <TextInput v-model="formData.neighborhood" @input="() => handleInputUpdate('neighborhood')" label="الحي"
        placeholder="أدخل اسم الحي" :hide-details="false" :error-messages="props.formErrors?.['neighborhood']" />

      <TextInput v-model="formData.streetName" @input="() => handleInputUpdate('street_name')" label="اسم الشارع"
        placeholder="أدخل اسم الشارع" :hide-details="false" :error-messages="props.formErrors?.['street_name']" />

      <TextInput v-model="formData.buildingNumber" @input="() => handleInputUpdate('building_number')"
        label="رقم المبنى" placeholder="أدخل رقم المبنى" :hide-details="false"
        :error-messages="props.formErrors?.['building_number']" />

      <TextInput v-model="formData.postalCode" @input="() => handleInputUpdate('postal_code')" label="الرمز البريدي"
        placeholder="أدخل الرمز البريدي" :hide-details="false" :error-messages="props.formErrors?.['postal_code']" />

      <TextInput v-model="formData.address1" @input="() => handleInputUpdate('address_1')" label="العنوان التفصيلي"
        placeholder="أدخل العنوان التفصيلي" :hide-details="false" :error-messages="props.formErrors?.['address_1']"
        class="md:col-span-2">
        <template #append-inner>
          <span v-html="markIcon"></span>
        </template>
      </TextInput>
    </div>
  </div>
</template>
