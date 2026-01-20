<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from "vue";
import { useApi } from "@/composables/useApi";
import { required, minLength, maxLength } from "@/utils/validators";

const api = useApi();

const formErrors = reactive<Record<string, string>>({});

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface CountryForm {
  id?: number;
  nameAr: string;
  nameEn: string;
  code2: string;
  code3: string;
  phoneCode: string;
  isDefault: boolean;
  status: boolean;
}

interface PayloadType {
  name: {
    en: string;
    ar: string;
  };
  code2: string;
  code3: string;
  phone_code: string;
  is_default: boolean | string;
  is_active: boolean | string;
  _method?: string;
}

const props = defineProps<{
  modelValue: boolean;
  countryId?: number | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [];
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<CountryForm>({
  nameAr: "",
  nameEn: "",
  code2: "",
  code3: "",
  phoneCode: "",
  isDefault: false,
  status: true,
});

const loadingCountryData = ref(false);
const saving = ref(false);

const fetchCountryData = async (countryId: number) => {
  try {
    loadingCountryData.value = true;
    const response = await api.get(`/countries/${countryId}`);
    const country = response.data;

    form.id = country.id;
    form.nameAr = country.name_translations?.ar || country.name;
    form.nameEn = country.name_translations?.en || country.name;
    form.code2 = country.code2 ?? "";
    form.code3 = country.code3 ?? "";
    form.phoneCode = country.phone_code ?? "";
    form.isDefault = Boolean(country.is_default);
    form.status = Boolean(country.is_active);
  } catch (err: any) {
    console.error('Error fetching country details:', err);
    toast.error(err?.response?.data?.message || 'Failed to fetch country details');
    internalOpen.value = false;
  } finally {
    loadingCountryData.value = false;
  }
};

const resetForm = () => {
  delete form.id;
  form.nameAr = "";
  form.nameEn = "";
  form.code2 = "";
  form.code3 = "";
  form.phoneCode = "";
  form.isDefault = false;
  form.status = true;
};

const closeDialog = () => {
  internalOpen.value = false;
  resetForm();
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
};

const handleSave = async () => {
  Object.keys(formErrors).forEach(key => delete formErrors[key]);

  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  try {
    saving.value = true;

    const payload: PayloadType = {
      name: {
        en: form.nameEn,
        ar: form.nameAr,
      },
      code2: form.code2,
      code3: form.code3,
      phone_code: form.phoneCode,
      is_default: form.isDefault,
      is_active: form.status,
    };

    if (form.id) {
      payload['_method'] = 'PUT';
      payload.is_active = form.status ? '1' : '0';
      payload.is_default = form.isDefault ? '1' : '0';
      await api.post(`/countries/${form.id}`, payload);
      toast.success('تم تحديث الدولة بنجاح');
    } else {
      await api.post('/countries', payload);
      toast.success('تم إضافة الدولة بنجاح');
    }

    emit('saved');
    closeDialog();
    resetForm();
  } catch (err: any) {
    console.error('Error saving country:', err);

    // Handle validation errors
    if (err?.response?.status === 422 && err?.response?.data?.errors) {
      const apiErrors = err.response.data.errors;
      Object.keys(apiErrors).forEach(key => {
        formErrors[key] = apiErrors[key][0];
      });
      toast.error(err?.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
    } else {
      toast.error(err?.response?.data?.message || 'Failed to save country');
    }
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.countryId) {
      fetchCountryData(props.countryId);
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="إضافة دولة" :max-width="640">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-earth</v-icon>
        </span>
        إضافة دولة
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div v-if="loadingCountryData" class="flex justify-center items-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else>
        <div class="mb-4">
          <LanguageTabs :languages="availableLanguages" label="الإسم">
            <template #en>
              <TextInput v-model="form.nameEn" placeholder="Enter name in English"
                :rules="[required(), minLength(2), maxLength(100)]" :hide-details="false"
                :error-messages="formErrors['name.en']" @input="delete formErrors['name.en']" />
            </template>
            <template #ar>
              <TextInput v-model="form.nameAr" placeholder="ادخل الاسم بالعربية"
                :rules="[required(), minLength(2), maxLength(100)]" :hide-details="false"
                :error-messages="formErrors['name.ar']" @input="delete formErrors['name.ar']" />
            </template>
          </LanguageTabs>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-5 mb-4">

          <TextInput v-model="form.code2" label="الرمز 2" placeholder="ادخل الرمز" :rules="[required(), exactLength(2)]"
            :hide-details="false" :error-messages="formErrors['code2']" @input="delete formErrors['code2']" />

          <TextInput v-model="form.code3" label="الرمز 3" placeholder="ادخل الرمز" :rules="[required(), exactLength(3)]"
            :hide-details="false" :error-messages="formErrors['code3']" @input="delete formErrors['code3']" />

          <TextInput v-model="form.phoneCode" label="كود الهاتف" placeholder="ادخل كود الهاتف"
            :rules="[required(), numeric()]" :hide-details="false" :error-messages="formErrors['phone_code']"
            @input="delete formErrors['phone_code']" />
          <div>
            <span class="text-sm font-semibold text-gray-700 block mb-1">الحالة</span>
            <div class="flex items-center gap-3">
              <v-radio-group v-model="form.status" inline hide-details>
                <v-radio :value="true" color="primary">
                  <template #label>
                    <span :class="form.status ? 'text-primary font-semibold' : 'text-gray-600'">
                      فعال
                    </span>
                  </template>
                </v-radio>
                <v-radio :value="false" color="primary">
                  <template #label>
                    <span :class="!form.status ? 'text-primary font-semibold' : 'text-gray-600'">
                      غير فعال
                    </span>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>
          </div>

          <div>
            <span class="text-sm font-semibold text-gray-700 block mb-1">افتراضي</span>
            <div class="flex items-center gap-3">
              <v-radio-group v-model="form.isDefault" inline hide-details>
                <v-radio :value="true" color="primary">
                  <template #label>
                    <span :class="form.isDefault ? 'text-primary font-semibold' : 'text-gray-600'">
                      نعم
                    </span>
                  </template>
                </v-radio>
                <v-radio :value="false" color="primary">
                  <template #label>
                    <span :class="!form.isDefault ? 'text-primary font-semibold' : 'text-gray-600'">
                      لا
                    </span>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>
          </div>
        </div>
      </div>
    </v-form>

    <template #actions>
      <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
        custom-class="font-semibold text-base sm:flex-1" label="حفظ" prepend-icon="mdi-plus" @click="handleSave"
        :loading="saving" :disabled="saving" />

      <ButtonWithIcon variant="flat" color="primary-50" height="44" rounded="4"
        custom-class="font-semibold text-base text-primary-700 sm:flex-1" label="إغلاق" prepend-icon="mdi-close"
        @click="closeDialog" />
    </template>
  </AppDialog>
</template>

<style scoped></style>
