<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useApi } from "@/composables/useApi";
import { useLazyCountryCityLists } from "@/composables/useLazyCountryCityLists";
import { required, minLength, maxLength } from "@/utils/validators";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const api = useApi();

const formErrors = reactive<Record<string, string>>({});

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface CityForm {
  id?: number;
  nameAr: string;
  nameEn: string;
  code2: string;
  countryId: number | string | null;
  status: boolean;
}

interface PayloadType {
  name: {
    en: string;
    ar: string;
  };
  code2: string;
  country_id: string | number | null;
  is_active: boolean | string;
  _method?: string;
}

const props = defineProps<{
  modelValue: boolean;
  cityId?: number | null;
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

const form = reactive<CityForm>({
  nameAr: "",
  nameEn: "",
  code2: "",
  countryId: null,
  status: true,
});

const loadingCityData = ref(false);
const saving = ref(false);
const cityDataReady = ref(false);

const { buildCountriesFetcher } = useLazyCountryCityLists();

const fetchCountriesLazy = buildCountriesFetcher({
  getSelectedCountryId: () => {
    const v = form.countryId;
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  },
  waitForReady: async () => {
    if (!props.cityId) return;
    await new Promise<void>((resolve) => {
      if (cityDataReady.value) {
        resolve();
        return;
      }
      const stop = watch(cityDataReady, (ok) => {
        if (ok) {
          stop();
          resolve();
        }
      });
    });
  },
});

const fetchCityData = async (cityId: number) => {
  try {
    loadingCityData.value = true;
    const response = await api.get(`/cities/${cityId}`);
    const city = response.data;

    form.id = city.id;
    form.nameAr = city.name_translations?.ar || city.name;
    form.nameEn = city.name_translations?.en || city.name;
    form.code2 = city.code2 ?? "";
    form.countryId = city.country_id ?? null;
    form.status = Boolean(city.is_active);
  } catch (err: any) {
    console.error('Error fetching city details:', err);
    toast.error(err?.response?.data?.message || t('common.messages.general.loadDataFailed'));
    internalOpen.value = false;
  } finally {
    loadingCityData.value = false;
    cityDataReady.value = true;
  }
};

const resetForm = () => {
  delete form.id;
  form.nameAr = "";
  form.nameEn = "";
  form.code2 = "";
  form.countryId = null;
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
      country_id: form.countryId,
      is_active: form.status,
    };

    if (form.id) {
      payload['_method'] = 'PUT';
      payload.is_active = form.status ? '1' : '0';
      await api.post(`/cities/${form.id}`, payload);
      toast.success(t('common.messages.success.updated'));
    } else {
      await api.post('/cities', payload);
      toast.success(t('common.messages.success.created'));
    }

    emit('saved');
    closeDialog();
    resetForm();
  } catch (err: any) {
    console.error('Error saving city:', err);

    // Handle validation errors
    if (err?.response?.status === 422 && err?.response?.data?.errors) {
      const apiErrors = err.response.data.errors;
      Object.keys(apiErrors).forEach(key => {
        formErrors[key] = apiErrors[key][0];
      });
      toast.error(err?.response?.data?.message || t('common.messages.error.validationFailed'));
    } else {
      toast.error(err?.response?.data?.message || t('common.messages.error.saveFailed'));
    }
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      cityDataReady.value = false;
      return;
    }

    cityDataReady.value = false;
    if (props.cityId) {
      fetchCityData(props.cityId);
    } else {
      resetForm();
      cityDataReady.value = true;
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" :title="t('form.buttons.addCity')" :max-width="520">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-city-variant-outline</v-icon>
        </span>
        {{ t('form.buttons.addCity') }}
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div v-if="loadingCityData" class="flex justify-center items-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else>
        <div class="mb-4">
          <LanguageTabs :languages="availableLanguages" :label="t('common.form.name')">
            <template #en>
              <TextInput v-model="form.nameEn" placeholder="Enter name in English"
                :rules="[required(), minLength(2), maxLength(100)]" :hide-details="false"
                :error-messages="formErrors['name.en']" @input="delete formErrors['name.en']" />
            </template>
            <template #ar>
              <TextInput v-model="form.nameAr" :placeholder="t('form.fields.nameAr.placeholder')"
                :rules="[required(), minLength(2), maxLength(100)]" :hide-details="false"
                :error-messages="formErrors['name.ar']" @input="delete formErrors['name.ar']" />
            </template>
          </LanguageTabs>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-5 mb-4">

          <SelectInput v-model="form.countryId" :label="t('form.address.country.label')" :placeholder="t('form.address.country.placeholder')" :items="[]"
            :rules="[required()]" :hide-details="false" clearable
            :server-side="true"
            :fetch-function="fetchCountriesLazy"
            item-title-key="name"
            item-value-key="id"
            :debounce-time="500"
            :error-messages="formErrors['country_id']" @update:model-value="delete formErrors['country_id']" />

          <TextInput v-model="form.code2" :label="t('form.fields.code2.label')" :placeholder="t('form.fields.code2.placeholder')" :rules="[required(), exactLength(2)]"
            :hide-details="false" :error-messages="formErrors['code2']" @input="delete formErrors['code2']" />

          <div>
            <span class="text-sm font-semibold text-gray-700 block mb-1">{{ t('form.fields.status.label') }}</span>
            <div class="flex items-center gap-3">
              <v-radio-group v-model="form.status" inline hide-details>
                <v-radio :value="true" color="primary">
                  <template #label>
                    <span :class="form.status ? 'text-primary font-semibold' : 'text-gray-600'">
                      {{ t('common.status.active') }}
                    </span>
                  </template>
                </v-radio>
                <v-radio :value="false" color="primary">
                  <template #label>
                    <span :class="!form.status ? 'text-primary font-semibold' : 'text-gray-600'">
                      {{ t('common.status.inactive') }}
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
        custom-class="font-semibold text-base sm:flex-1" :label="t('common.actions.save')" prepend-icon="mdi-plus" @click="handleSave"
        :loading="saving" :disabled="saving" />

      <ButtonWithIcon variant="flat" color="primary-50" height="44" rounded="4"
        custom-class="font-semibold text-base text-primary-700 sm:flex-1" :label="t('common.actions.close')" prepend-icon="mdi-close"
        @click="closeDialog" />
    </template>
  </AppDialog>
</template>

<style scoped></style>
