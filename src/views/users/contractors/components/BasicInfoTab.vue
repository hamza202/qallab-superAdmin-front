<script setup lang="ts">
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
  commercialRegister: props.commercialRegister,
  taxRegister: props.taxRegister,
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
    commercialRegister: newProps.commercialRegister,
    taxRegister: newProps.taxRegister,
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
    <h2 class="text-lg font-bold text-primary-900 mb-4">البيانات العامة</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6 mb-4">
        <LanguageTabs :languages="availableLanguages" label="الاسم كامل">
          <template #en>
            <TextInput v-model="formData.fullNameTranslations.en" @input="() => handleInputUpdate('full_name.en')"
              placeholder="Enter full name in English" :hide-details="false" :rules="[required()]"
              :error-messages="props.formErrors?.['full_name.en']" />
          </template>
          <template #ar>
            <TextInput v-model="formData.fullNameTranslations.ar" @input="() => handleInputUpdate('full_name.ar')"
              placeholder="ادخل الاسم كامل بالعربية" :hide-details="false" :rules="[required()]"
              :error-messages="props.formErrors?.['full_name.ar']" required />
          </template>
        </LanguageTabs>
        <LanguageTabs :languages="availableLanguages" label="الاسم التجاري">
          <template #en>
            <TextInput v-model="formData.tradeNameTranslations.en" @input="() => handleInputUpdate('trade_name.en')"
              placeholder="Enter trade name in English" :hide-details="false"
              :error-messages="props.formErrors?.['trade_name.en']" />
          </template>
          <template #ar>
            <TextInput v-model="formData.tradeNameTranslations.ar" @input="() => handleInputUpdate('trade_name.ar')"
              placeholder="ادخل الاسم التجاري بالعربية" :hide-details="false"
              :error-messages="props.formErrors?.['trade_name.ar']" required />
          </template>
        </LanguageTabs>
      <TextInput v-model="formData.commercialRegister" @input="() => handleInputUpdate('commercial_register')" 
        label="السجل التجاري" placeholder="32655451" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['commercial_register']" required />

      
      <TextInput v-model="formData.taxRegister" @input="() => handleInputUpdate('tax_register')" 
        label="الرقم الضريبي" placeholder="216623263" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['tax_register']" />
      <SelectWithIconInput clearable v-model="formData.entityType" @update:model-value="emitUpdate" label="نوع الكيان"
        placeholder="شركة مساهمة" :items="entityTypeItems" />

      <TextInput v-model="formData.phone" @input="() => handleInputUpdate('phone')" label="الهاتف" 
        placeholder="+966 (555) 000-0000" dir="ltr" :hide-details="false" :rules="[required(), saudiPhone()]"
        :error-messages="props.formErrors?.['phone']">
        <template #prepend-inner>
          <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
        </template>
      </TextInput>
      <TextInput v-model="formData.mobile" @input="() => handleInputUpdate('mobile')" label="الجوال" 
        placeholder="+966 (555) 000-0000" dir="ltr" :hide-details="false" :rules="[saudiPhone()]"
        :error-messages="props.formErrors?.['mobile']">
        <template #prepend-inner>
          <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
        </template>
      </TextInput>

      <SelectWithIconInput clearable show-add-button v-model="formData.languageId" 
        @update:model-value="handleInputUpdate('language_id')" label="اللغة"
        placeholder="English" :items="languageItems" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['language_id']" />
      <TextInput v-model="formData.email" @input="() => handleInputUpdate('email')" label="البريد الإلكتروني" 
        placeholder="info@buildtrans.sa" required dir="ltr" :hide-details="false" :rules="[required()]"
        :error-messages="props.formErrors?.['email']" />
      <h2 class="text-lg font-bold text-primary-900 mt-6 mb-2 md:col-span-3">بيانات العنوان</h2>

      <SelectWithIconInput clearable v-model="formData.countryId" @update:model-value="handleInputUpdate('country_id')" 
         label="الدولة" placeholder="اختر" :items="countryItems" 
        :hide-details="false" :rules="[required()]" :error-messages="props.formErrors?.['country_id']" />
      <SelectWithIconInput clearable v-model="formData.cityId" @update:model-value="handleInputUpdate('city_id')" 
         placeholder="اختر" label="المدينة" :items="cityItems" 
        :hide-details="false" :rules="[required()]" :error-messages="props.formErrors?.['city_id']" />
      <TextInput v-model="formData.neighborhood" @input="emitUpdate" label="الحي" placeholder="Riyadh" />

      <TextInput v-model="formData.streetName" @input="emitUpdate" label="الشارع" placeholder="966" />
      <TextInput v-model="formData.postalCode" @input="emitUpdate" label="الرمز البريدي" placeholder="966" />
      <TextInput v-model="formData.buildingNumber" @input="emitUpdate" label="رقم المبنى" placeholder="25544" />

      <TextInput v-model="formData.address1" dir="ltr" @input="emitUpdate" label="العنوان الوطني" placeholder="Industrial Area">
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
