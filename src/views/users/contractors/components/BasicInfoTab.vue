<script setup lang="ts">
import { taxNo, unifiedLoginId, email } from '@/utils/validators';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface Props {
  fullNameTranslations: { ar: string; en: string };
  tradeNameTranslations: { ar: string; en: string };
  ownerName: string;
  commercialRegister: string;
  taxRegister: string;
  unifiedLoginId: string;
  entityType: string | null;
  isActive: boolean;
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
  fullNameTranslations: props.fullNameTranslations,
  tradeNameTranslations: props.tradeNameTranslations,
  ownerName: props.ownerName,
  commercialRegister: props.commercialRegister,
  taxRegister: props.taxRegister,
  unifiedLoginId: props.unifiedLoginId,
  entityType: props.entityType,
  isActive: props.isActive,
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
    ownerName: newProps.ownerName,
    commercialRegister: newProps.commercialRegister,
    taxRegister: newProps.taxRegister,
    unifiedLoginId: newProps.unifiedLoginId,
    entityType: newProps.entityType,
    isActive: newProps.isActive,
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


</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">{{ t('pages.contractors.form.tabs.basicInfo') }}</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6 mb-4">
      <LanguageTabs :languages="availableLanguages" :label="t('form.contractor.basicInfo.fullName.label')">
        <template #en>
          <TextInput v-model="formData.fullNameTranslations.en" @input="() => handleInputUpdate('full_name.en')"
            :placeholder="t('form.contractor.basicInfo.fullName.placeholderEn')" :hide-details="false" :rules="[required()]"
            :error-messages="props.formErrors?.['full_name.en']" />
        </template>
        <template #ar>
          <TextInput v-model="formData.fullNameTranslations.ar" @input="() => handleInputUpdate('full_name.ar')"
            :placeholder="t('form.contractor.basicInfo.fullName.placeholderAr')" :hide-details="false" :rules="[required()]"
            :error-messages="props.formErrors?.['full_name.ar']" required />
        </template>
      </LanguageTabs>
      <LanguageTabs :languages="availableLanguages" :label="t('form.identity.businessName.label')">
        <template #en>
          <TextInput v-model="formData.tradeNameTranslations.en" @input="() => handleInputUpdate('trade_name.en')"
            :placeholder="t('form.identity.businessName.placeholderEn')" :hide-details="false"
            :error-messages="props.formErrors?.['trade_name.en']" />
        </template>
        <template #ar>
          <TextInput v-model="formData.tradeNameTranslations.ar" @input="() => handleInputUpdate('trade_name.ar')"
            :placeholder="t('form.identity.businessName.placeholder')" :hide-details="false"
            :error-messages="props.formErrors?.['trade_name.ar']" required />
        </template>
      </LanguageTabs>


      <TextInput v-model="formData.ownerName" @input="() => handleInputUpdate('owner_name')" :rules="[required()]"
        :error-messages="props.formErrors?.['owner_name']" :label="t('form.identity.ownerName.label')" :placeholder="t('form.identity.ownerName.placeholder')"
        :hide-details="false" required />


      <TextInput v-model="formData.commercialRegister" @input="() => handleInputUpdate('commercial_register')"
        :label="t('form.identity.commercialRegister.label')" :placeholder="t('form.identity.commercialRegister.placeholder')" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['commercial_register']" required />


      <TextInput v-model="formData.taxRegister" :hide-details="false" @input="() => handleInputUpdate('tax_register')" :label="t('form.identity.taxNumber.label')"
        :placeholder="t('form.identity.taxNumber.placeholder')" :rules="[taxNo()]"
        :error-messages="props.formErrors?.['tax_register']" @update:model-value="clearError('tax_register')" type="text" required />

      <TextInput v-model="formData.unifiedLoginId" @input="() => handleInputUpdate('unified_login_id')"
        :label="t('form.identity.unifiedLoginId.label')" :placeholder="t('form.identity.unifiedLoginId.placeholder')" :hide-details="false"
        :rules="[unifiedLoginId()]"
        :error-messages="props.formErrors?.['unified_login_id']"
        @update:model-value="clearError('unified_login_id')" type="text" />
      <SelectWithIconInput clearable v-model="formData.entityType" @update:model-value="emitUpdate" :label="t('form.identity.entityType.label')"
        :placeholder="t('form.identity.entityType.placeholder')" :items="entityTypeItems" />

      <TelInput v-model="formData.phone" :label="t('form.identity.phone.label')" :rules="[required(), saudiPhone()]"
        :error-messages="props.formErrors?.['phone']" @input="() => handleInputUpdate('phone')" />
      <TelInput v-model="formData.mobile" :label="t('form.identity.mobilePhone.label')" :rules="[required(), saudiPhone()]"
        :error-messages="props.formErrors?.['mobile']" @input="() => handleInputUpdate('mobile')" />

      <SelectWithIconInput clearable show-add-button v-model="formData.languageId"
        @update:model-value="handleInputUpdate('language_id')" :label="t('form.identity.language.label')" :placeholder="t('form.identity.language.placeholder')"
        :items="languageItems" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['language_id']" />
      <TextInput v-model="formData.email" @input="() => handleInputUpdate('email')" :label="t('form.identity.email.label')"
        :placeholder="t('form.identity.email.placeholder',{email: 'example@gmail.com'})" required dir="ltr" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['email']" />
      <h2 class="text-lg font-bold text-primary-900 mt-6 mb-2 md:col-span-3">{{ t('form.address.sections.addressInfo') }}</h2>

      <SelectWithIconInput clearable v-model="formData.countryId" @update:model-value="handleInputUpdate('country_id')"
        :label="t('form.address.country.label')" :placeholder="t('form.address.country.placeholder')" :items="countryItems" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['country_id']" />
      <SelectWithIconInput clearable v-model="formData.cityId" @update:model-value="handleInputUpdate('city_id')"
        :placeholder="t('form.address.city.placeholder')" :label="t('form.address.city.label')" :items="cityItems" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['city_id']" />
      <TextInput v-model="formData.neighborhood" @input="emitUpdate" :label="t('form.address.district.label')" :placeholder="t('form.address.district.placeholder')" />

      <TextInput v-model="formData.streetName" @input="emitUpdate" :label="t('form.address.streetName.label')" :placeholder="t('form.address.streetName.placeholder')" />
      <TextInput v-model="formData.postalCode" @input="emitUpdate" :label="t('form.address.postalCode.label')" :placeholder="t('form.address.postalCode.placeholder')" />
      <TextInput v-model="formData.buildingNumber" @input="emitUpdate" :label="t('form.address.buildingNumber.label')" :placeholder="t('form.address.buildingNumber.placeholder')" />

      <TextInput v-model="formData.address1" @input="emitUpdate" :label="t('form.address.nationalAddress.label')"
        :placeholder="t('form.address.nationalAddress.placeholder')">
        <template #append-inner>
          <span v-html="markIcon"></span>
        </template>
      </TextInput>
      <!-- <div>
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
      </div> -->

    </div>
  </div>
</template>
