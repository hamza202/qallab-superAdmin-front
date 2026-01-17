<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from "vue";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import { required, minLength, numeric, positive, between } from "@/utils/validators";

const api = useApi();
const { success, error: showError } = useNotification();

const formErrors = reactive<Record<string, string>>({});

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface TaxForm {
  id?: number;
  nameAr: string;
  nameEn: string;
  percentage: number | string;
  minValue: number | string;
  taxRuleId: string | null;
  calculationMethod: string | null;
  status: boolean;
  amountIncludesTax: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  taxId?: number | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "saved"): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<TaxForm>({
  nameAr: "",
  nameEn: "",
  percentage: "",
  minValue: "",
  taxRuleId: null,
  calculationMethod: null,
  status: true,
  amountIncludesTax: false,
});

const taxRuleItems = ref<Array<{ title: string; value: string | number }>>([]);
const calculationMethodItems = ref<Array<{ title: string; value: string }>>([]);
const loadingConstants = ref(false);
const loadingTaxData = ref(false);
const saving = ref(false);

const fetchConstants = async () => {
  try {
    loadingConstants.value = true;
    const response = await api.get('/taxes/constants');

    // Populate calculation methods dropdown
    if (response.data.calculation_methods) {
      calculationMethodItems.value = response.data.calculation_methods.map((method: any) => ({
        title: method.label,
        value: method.key,
      }));
    }
  } catch (err: any) {
    console.error('Error fetching constants:', err);
    showError(err?.response?.data?.message || 'Failed to fetch constants');
  } finally {
    loadingConstants.value = false;
  }
};


const fetchTaxRules = async () => {
  try {
    loadingConstants.value = true;
    const response = await api.get('/tax-rules/list');

    // Populate tax rules dropdown
    if (response.data) {
      taxRuleItems.value = response.data.map((rule: any) => ({
        title: rule.name,
        value: rule.id,
      }));
    }
  } catch (err: any) {
    console.error('Error fetching constants:', err);
    showError(err?.response?.data?.message || 'Failed to fetch constants');
  } finally {
    loadingConstants.value = false;
  }
};

const fetchTaxData = async (taxId: number) => {
  try {
    loadingTaxData.value = true;
    const response = await api.get(`/taxes/${taxId}`);
    const tax = response.data;

    form.id = tax.id;
    form.nameAr = tax.tax_name_translations?.ar || tax.tax_name;
    form.nameEn = tax.tax_name_translations?.en || tax.tax_name;
    form.percentage = tax.value_rate ?? "";
    form.minValue = tax.minimum ?? "";
    form.taxRuleId = tax.tax_rule_id ?? null;
    form.calculationMethod = tax.calculation_method ?? null;
    form.status = Boolean(tax.is_active);
    form.amountIncludesTax = Boolean(tax.include_tax);
  } catch (err: any) {
    console.error('Error fetching tax details:', err);
    showError(err?.response?.data?.message || 'Failed to fetch tax details');
    internalOpen.value = false;
  } finally {
    loadingTaxData.value = false;
  }
};


const resetForm = () => {
  delete form.id;
  form.nameAr = "";
  form.nameEn = "";
  form.percentage = "";
  form.minValue = "";
  form.taxRuleId = null;
  form.calculationMethod = null;
  form.status = true;
  form.amountIncludesTax = false;
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

    const payload = {
      tax_name: {
        en: form.nameEn,
        ar: form.nameAr,
      },
      minimum: form.minValue,
      value_rate: form.percentage,
      tax_rule_id: form.taxRuleId,
      calculation_method: form.calculationMethod,
      include_tax: form.amountIncludesTax,
      is_active: form.status,
    };

    if (form.id) {
      // Edit existing tax
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('tax_name[en]', form.nameEn);
      formData.append('tax_name[ar]', form.nameAr);
      formData.append('minimum', String(form.minValue));
      formData.append('value_rate', String(form.percentage));
      formData.append('tax_rule_id', String(form.taxRuleId));
      formData.append('calculation_method', String(form.calculationMethod));
      formData.append('include_tax', form.amountIncludesTax ? '1' : '0');
      formData.append('is_active', form.status ? '1' : '0');

      await api.post(`/taxes/${form.id}`, formData);
      success('تم تحديث الضريبة بنجاح');
    } else {
      // Create new tax
      await api.post('/taxes', payload);
      success('تم إضافة الضريبة بنجاح');
    }

    emit('saved');
    closeDialog();
    resetForm();
  } catch (err: any) {
    console.error('Error saving tax:', err);
    
    // Handle validation errors
    if (err?.response?.status === 422 && err?.response?.data?.errors) {
      const apiErrors = err.response.data.errors;
      Object.keys(apiErrors).forEach(key => {
        formErrors[key] = apiErrors[key][0];
      });
      showError(err?.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
    } else {
      showError(err?.response?.data?.message || 'Failed to save tax');
    }
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.taxId) {
      fetchTaxData(props.taxId);
    } else {
      resetForm();
    }
  }
);

onMounted(() => {
  fetchTaxRules();
  fetchConstants();
});
</script>

<template>
  <AppDialog v-model="internalOpen" title="إضافة ضريبة" :max-width="640">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-percent-outline</v-icon>
        </span>
        إضافة ضريبة
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div v-if="loadingTaxData" class="flex justify-center items-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>
      <div v-else>

        <div class="mb-4">
          <LanguageTabs :languages="availableLanguages" label="الإسم">
            <template #en>
              <TextInput v-model="form.nameEn" placeholder="Enter name in English" :hide-details="false"
                :rules="[required(), minLength(2)]" :error-messages="formErrors['tax_name.en']" 
                @input="delete formErrors['tax_name.en']" />
            </template>
            <template #ar>
              <TextInput v-model="form.nameAr" placeholder="ادخل الاسم بالعربية" :hide-details="false"
                :rules="[required(), minLength(2)]" :error-messages="formErrors['tax_name.ar']" 
                @input="delete formErrors['tax_name.ar']" />
            </template>
          </LanguageTabs>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4 mb-4">
          <TextInput v-model="form.percentage" label="النسبة" placeholder="النسبة" :hide-details="false"
            :rules="[required(), numeric(), between(0, 100)]" type="number" 
            :error-messages="formErrors['value_rate']" @input="delete formErrors['value_rate']" />

          <TextInput v-model="form.minValue" label="اقل قيمة" placeholder="اقل قيمة" :hide-details="false"
            :rules="[required(), numeric(), positive()]" type="number" 
            :error-messages="formErrors['minimum']" @input="delete formErrors['minimum']" />

          <SelectWithIconInput v-model="form.taxRuleId" label="قاعدة الضريبة" placeholder="اختر قاعدة الضريبة"
            :items="taxRuleItems" clearable :hide-details="false" :loading="loadingConstants"
            :error-messages="formErrors['tax_rule_id']" @update:model-value="delete formErrors['tax_rule_id']" :rules="[required()]" />

          <SelectWithIconInput v-model="form.calculationMethod" label="طريقة الاحتساب" placeholder="اختر طريقة الاحتساب"
            :items="calculationMethodItems" clearable :hide-details="false" :loading="loadingConstants" :rules="[required()]"
            :error-messages="formErrors['calculation_method']" @update:model-value="delete formErrors['calculation_method']" />

          <div class="flex flex-wrap gap-4 items-center justify-between md:col-span-2">

            <div class="md:col-span-2 flex items-center md:justify-start gap-1">
              <CheckboxInput v-model="form.amountIncludesTax" :hide-details="true" />
              <span class="text-base font-semibold text-gray-700">المبلغ شامل الضريبة</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-base font-semibold text-gray-700">فعال</span>
              <v-switch v-model="form.status" color="primary" inset hide-details />
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
        custom-class="font-semibold text-base text-primary-700 sm:flex-1" label="اغلاق" prepend-icon="mdi-close"
        @click="closeDialog" />
    </template>
  </AppDialog>
</template>

<style scoped></style>
