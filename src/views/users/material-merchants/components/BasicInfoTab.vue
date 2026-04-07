<script setup lang="ts">
import { taxNo, unifiedLoginId, email, required } from '@/utils/validators';
import AddressCountryCitySelects from '@/components/common/AddressCountryCitySelects.vue';

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
  waitForAddressListsReady?: () => void | Promise<void>;
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
    <h2 class="text-lg font-bold text-primary-900 mb-4">{{ $t('pages.materialMerchants.form.tabs.basicInfo') }}</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6 mb-4">
      <LanguageTabs :languages="availableLanguages" :label="$t('form.identity.businessName.label')">
        <template #en>
          <TextInput v-model="formData.businessNameTranslations.en" @input="() => handleInputUpdate('business_name.en')"
            :placeholder="$t('form.identity.businessName.placeholder')" :hide-details="false" :rules="[required()]"
            :error-messages="props.formErrors?.['business_name.en']" />
        </template>
        <template #ar>
          <TextInput v-model="formData.businessNameTranslations.ar" @input="() => handleInputUpdate('business_name.ar')"
            :placeholder="$t('form.identity.businessName.placeholder')" :hide-details="false" :rules="[required()]"
            :error-messages="props.formErrors?.['business_name.ar']" required />
        </template>
      </LanguageTabs>

      <TextInput v-model="formData.buisnessno" @input="() => handleInputUpdate('buisnessno')" :rules="[required()]"
        :error-messages="props.formErrors?.['buisnessno']" :label="$t('form.identity.commercialRegister.label')"
        :placeholder="$t('form.identity.commercialRegister.placeholder')" :hide-details="false" required />

      <TextInput v-model="formData.taxno" :hide-details="false" @input="() => handleInputUpdate('taxno')"
        :label="$t('form.identity.taxNumber.label')" :placeholder="$t('form.identity.taxNumber.placeholder')" :rules="[taxNo()]"
        :error-messages="props.formErrors?.['taxno']" @update:model-value="clearError('taxno')" type="text" required />

      <TextInput v-model="formData.unifiedLoginId" @input="() => handleInputUpdate('unified_login_id')"
        :label="$t('form.identity.unifiedLoginId.label')" :placeholder="$t('form.identity.unifiedLoginId.placeholder')" :hide-details="false"
        :rules="[unifiedLoginId()]" :error-messages="props.formErrors?.['unified_login_id']"
        @update:model-value="clearError('unified_login_id')" type="text" />

      <TextInput v-model="formData.ownerName" @input="() => handleInputUpdate('owner_name')" :rules="[required()]"
        :error-messages="props.formErrors?.['owner_name']" :label="$t('form.identity.ownerName.label')" :placeholder="$t('form.identity.ownerName.placeholder')"
        :hide-details="false" required />

      <TelInput v-model="formData.phone" :label="$t('form.identity.phone.label')" :rules="[required(), saudiPhone()]"
        :error-messages="props.formErrors?.['phone']" @input="() => handleInputUpdate('phone')" />

      <TelInput v-model="formData.mobile" :label="$t('form.identity.mobilePhone.label')" :rules="[saudiPhone()]"
        :error-messages="props.formErrors?.['mobile']" @input="() => handleInputUpdate('mobile')" />

      <TextInput v-model="formData.email" @input="() => handleInputUpdate('email')" :label="$t('form.identity.email.label')"
        :placeholder="$t('form.identity.email.placeholder')" :hide-details="false" :rules="[required(), email()]"
        :error-messages="props.formErrors?.['email']" dir="ltr" required />
    </div>
  </div>

  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <div class="flex items-center gap-2 mb-4">
      <h2 class="text-lg font-bold text-primary-900">{{ $t('form.address.sections.addressInfo') }}</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6">
      <AddressCountryCitySelects
        :country-id="formData.countryId"
        :city-id="formData.cityId"
        :country-label="$t('form.address.country.label')"
        :country-placeholder="$t('form.address.country.placeholder')"
        :city-label="$t('form.address.city.label')"
        :city-placeholder="$t('form.address.city.placeholder')"
        :country-error="props.formErrors?.['country_id']"
        :city-error="props.formErrors?.['city_id']"
        :country-rules="[required()]"
        :city-rules="[required()]"
        :wait-for-lists-ready="props.waitForAddressListsReady"
        @update:country-id="(v) => { formData.countryId = v; handleInputUpdate('country_id'); }"
        @update:city-id="(v) => { formData.cityId = v; handleInputUpdate('city_id'); }"
        @clear:error="clearError"
      />

      <TextInput v-model="formData.neighborhood" @input="() => handleInputUpdate('neighborhood')" :label="$t('form.address.district.label')"
        :placeholder="$t('form.address.district.placeholder')" :hide-details="false" :error-messages="props.formErrors?.['neighborhood']" />

      <TextInput v-model="formData.streetName" @input="() => handleInputUpdate('street_name')" :label="$t('form.address.streetName.label')"
        :placeholder="$t('form.address.streetName.placeholder')" :hide-details="false" :error-messages="props.formErrors?.['street_name']" />

      <TextInput v-model="formData.buildingNumber" @input="() => handleInputUpdate('building_number')"
        :label="$t('form.address.buildingNumber.label')" :placeholder="$t('form.address.buildingNumber.placeholder')" :hide-details="false"
        :error-messages="props.formErrors?.['building_number']" />

      <TextInput v-model="formData.postalCode" @input="() => handleInputUpdate('postal_code')" :label="$t('form.address.postalCode.label')"
        :placeholder="$t('form.address.postalCode.placeholder')" :hide-details="false" :error-messages="props.formErrors?.['postal_code']" />

      <TextInput v-model="formData.address1" @input="() => handleInputUpdate('address_1')" :label="$t('form.address.nationalAddress.label')"
        :placeholder="$t('form.address.nationalAddress.placeholder')" :hide-details="false" :error-messages="props.formErrors?.['address_1']"
        class="md:col-span-2">
        <template #append-inner>
          <span v-html="markIcon"></span>
        </template>
      </TextInput>
    </div>
  </div>
</template>
