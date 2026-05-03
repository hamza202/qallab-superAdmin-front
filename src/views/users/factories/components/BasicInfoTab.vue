<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import { taxNo, unifiedLoginId, email, required } from '@/utils/validators';
import AddressCountryCitySelects from '@/components/common/AddressCountryCitySelects.vue';

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface Props {
  businessNameTranslations: { ar: string; en: string };
  ownerCompanyName: string;
  mobile: string;
  phone: string;
  email: string;
  buisnessno: string;
  taxno: string;
  unifiedLoginId: string;
  countryId: number | null;
  cityId: number | null;
  neighborhood: string;
  streetName: string;
  postalCode: string;
  buildingNumber: string;
  address1: string;
  languageId: number | null;
  languageItems: Array<{ title: string; value: number }>;
  tradeNameTranslations: { ar: string; en: string };
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
  clearError(field);
  emitUpdate();
};

const formData = reactive({
  businessNameTranslations: props.businessNameTranslations,
  ownerCompanyName: props.ownerCompanyName,
  mobile: props.mobile,
  phone: props.phone,
  email: props.email,
  buisnessno: props.buisnessno,
  taxno: props.taxno,
  unifiedLoginId: props.unifiedLoginId,
  countryId: props.countryId,
  cityId: props.cityId,
  neighborhood: props.neighborhood,
  streetName: props.streetName,
  postalCode: props.postalCode,
  buildingNumber: props.buildingNumber,
  address1: props.address1,
  languageId: props.languageId,
  tradeNameTranslations: props.tradeNameTranslations,
});

// Watch props and update local formData
watch(() => props, (newProps) => {
  Object.assign(formData, {
    businessNameTranslations: newProps.businessNameTranslations,
    ownerCompanyName: newProps.ownerCompanyName,
    mobile: newProps.mobile,
    phone: newProps.phone,
    email: newProps.email,
    buisnessno: newProps.buisnessno,
    taxno: newProps.taxno,
    unifiedLoginId: newProps.unifiedLoginId,
    countryId: newProps.countryId,
    cityId: newProps.cityId,
    neighborhood: newProps.neighborhood,
    streetName: newProps.streetName,
    postalCode: newProps.postalCode,
    buildingNumber: newProps.buildingNumber,
    address1: newProps.address1,
    languageId: newProps.languageId,
    tradeNameTranslations: newProps.tradeNameTranslations,
  });
}, { deep: true });

const emitUpdate = () => {
  emit('update:formData', { ...formData });
};

const markIcon = `<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 21C13 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 5 17 9 21Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">{{ $t('pages.factories.form.tabs.basicInfo') }}</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6 mb-6 items-end">
      <!-- Row 1: الاسم التجاري | اسم المالك/الشركة المالكة | السجل التجاري -->
      <div>
        <LanguageTabs :languages="availableLanguages" :label="$t('form.identity.businessName.label')">
          <template #en>
            <TextInput v-model="formData.tradeNameTranslations.en" 
              @input="emitUpdate"
              placeholder="Enter trade name in English" 
              :error-messages="props.formErrors?.['trade_name.en']" 
              @update:model-value="clearError('trade_name.en')" />
          </template>
          <template #ar>
            <TextInput v-model="formData.tradeNameTranslations.ar" 
              @input="emitUpdate"
              :placeholder="$t('form.identity.businessName.placeholder')" 
              :error-messages="props.formErrors?.['trade_name.ar']" 
              @update:model-value="clearError('trade_name.ar')" />
          </template>
        </LanguageTabs>
      </div>
      
      
      <TextInput 
        v-model="formData.ownerCompanyName" 
        @input="emitUpdate"
        :label="$t('form.identity.ownerName.label')"
        :placeholder="$t('form.identity.ownerName.placeholder')" 
        :error-messages="props.formErrors?.['owner_company_name']" 
        @update:model-value="clearError('owner_company_name')" 
      />
      
      <TextInput v-model="formData.buisnessno" :rules="[required(), numeric()]" 
        @input="() => handleInputUpdate('commercial_register')" :label="$t('form.identity.commercialRegister.label')" 
        :placeholder="$t('form.identity.commercialRegister.placeholder')" :error-messages="props.formErrors?.['commercial_register'] || props.formErrors?.['buisnessno']"
        @update:model-value="clearError('commercial_register')" type="text" />

      <!-- Row 2: الرقم الضريبي | معرف الدخول الموحد | الهاتف -->
      <TextInput v-model="formData.taxno" :hide-details="false" @input="() => handleInputUpdate('taxno')"
        :label="$t('form.identity.taxNumber.label')" :placeholder="$t('form.identity.taxNumber.placeholder')" :rules="[taxNo()]"
        :error-messages="props.formErrors?.['taxno']" @update:model-value="clearError('taxno')" type="text" />

      <TextInput v-model="formData.unifiedLoginId" @input="() => handleInputUpdate('unified_login_id')"
        :label="$t('form.identity.unifiedLoginId.label')" :placeholder="$t('form.identity.unifiedLoginId.placeholder')" :hide-details="false"
        :rules="[unifiedLoginId()]" :error-messages="props.formErrors?.['unified_login_id']"
        @update:model-value="clearError('unified_login_id')" type="text" />

      <TelInput v-model="formData.phone" :label="$t('form.identity.phone.label')" :rules="[required(), saudiPhone()]"
        :error-messages="props.formErrors?.['phone']"
       @update:model-value="clearError('phone')"
        @input="() => handleInputUpdate('phone')" />
      <TelInput v-model="formData.mobile" :label="$t('form.identity.mobilePhone.label')" :rules="[required(), saudiPhone()]"
        :error-messages="props.formErrors?.['mobile']"
        @update:model-value="clearError('mobile')"
        @input="() => handleInputUpdate('mobile')" />


      <TextInput v-model="formData.email" @input="() => handleInputUpdate('email')" :label="$t('form.identity.email.label')"
        :placeholder="$t('form.identity.email.placeholder', { email: 'example@gmail.com' })" :rules="[required()]" dir="ltr" type="email"
        :error-messages="props.formErrors?.['email']" />

      <!-- Row 4: اللغة (Full width) -->
      <div>
        <SelectWithIconInput clearable show-add-button v-model="formData.languageId" @update:model-value="emitUpdate" 
          :label="$t('form.identity.language.label')" :placeholder="$t('form.identity.language.placeholder')" :items="languageItems" :rules="[required()]" 
          @input="() => handleInputUpdate('language_id')" :error-messages="props.formErrors?.['language_id']" />
      </div>
    </div>

    <h2 class="text-lg font-bold text-primary-900 mt-8 mb-4">{{ $t('form.address.sections.addressInfo') }}</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6">
      <!-- Row 1: الدولة | المدينة | الحي -->
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
        @update:country-id="(v) => { formData.countryId = v; emitUpdate(); }"
        @update:city-id="(v) => { formData.cityId = v; emitUpdate(); }"
        @clear:error="clearError"
      />
      
      <TextInput v-model="formData.neighborhood" @input="emitUpdate" :label="$t('form.address.district.label')"
        :placeholder="$t('form.address.district.placeholder')" />

      <!-- Row 2: الشارع | الرمز البريدي | رقم المبنى -->
      <TextInput v-model="formData.streetName" @input="emitUpdate" :label="$t('form.address.streetName.label')"
        :placeholder="$t('form.address.streetName.placeholder')" />
      
      <TextInput v-model="formData.postalCode" @input="emitUpdate" :label="$t('form.address.postalCode.label')" :placeholder="$t('form.address.postalCode.placeholder')" />
      
      <TextInput v-model="formData.buildingNumber" @input="emitUpdate" :label="$t('form.address.buildingNumber.label')" :placeholder="$t('form.address.buildingNumber.placeholder')" />

      <!-- Row 3: العنوان الوطني -->
      <TextInput v-model="formData.address1" @input="emitUpdate" :label="$t('form.address.nationalAddress.label')"
        :placeholder="$t('form.address.nationalAddress.placeholder')">
        <template #prepend-inner>
          <span v-html="markIcon"></span>
        </template>
      </TextInput>
    </div>
  </div>
</template>
