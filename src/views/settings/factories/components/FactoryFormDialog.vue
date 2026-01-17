<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";

const api = useApi();
const { success, error: showError } = useNotification();

const formErrors = reactive<Record<string, string>>({});

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface FactoryForm {
  id?: number;
  nameAr: string;
  nameEn: string;
  notes: string;
  status: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  factoryId?: number | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [];
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const formRef = ref<any>(null);
const isFormValid = ref(false);
const loadingFactoryData = ref(false);
const saving = ref(false);

const form = reactive<FactoryForm>({
  nameAr: "",
  nameEn: "",
  notes: "",
  status: true,
});

const fetchFactoryData = async (factoryId: number) => {
  try {
    loadingFactoryData.value = true;
    const response = await api.get(`/manufacturers/${factoryId}`);
    const factory = response.data;

    form.id = factory.id;
    form.nameAr = factory.name_translations?.ar || factory.name;
    form.nameEn = factory.name_translations?.en || factory.name;
    form.notes = factory.notes ?? "";
    form.status = Boolean(factory.is_active);
  } catch (err: any) {
    console.error('Error fetching factory details:', err);
    showError(err?.response?.data?.message || 'Failed to fetch factory details');
    internalOpen.value = false;
  } finally {
    loadingFactoryData.value = false;
  }
};

const resetForm = () => {
  delete form.id;
  form.nameAr = "";
  form.nameEn = "";
  form.notes = "";
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

    const payload = {
      name: {
        en: form.nameEn,
        ar: form.nameAr,
      },
      notes: form.notes,
      is_active: form.status,
    };

    if (form.id) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name[en]', form.nameEn);
      formData.append('name[ar]', form.nameAr);
      formData.append('notes', form.notes);
      formData.append('is_active', form.status ? '1' : '0');
      await api.post(`/manufacturers/${form.id}`, formData);
      success('تم تحديث المصنع بنجاح');
    } else {
      await api.post('/manufacturers', payload);
      success('تم إضافة المصنع بنجاح');
    }

    emit('saved');
    closeDialog();
    resetForm();
  } catch (err: any) {
    console.error('Error saving factory:', err);
    
    // Handle validation errors
    if (err?.response?.status === 422 && err?.response?.data?.errors) {
      const apiErrors = err.response.data.errors;
      Object.keys(apiErrors).forEach(key => {
        formErrors[key] = apiErrors[key][0];
      });
      showError(err?.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
    } else {
      showError(err?.response?.data?.message || 'Failed to save factory');
    }
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.factoryId) {
      fetchFactoryData(props.factoryId);
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <AppDialog v-model="internalOpen" title="إضافة مصنع" :max-width="520">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <v-icon size="18">mdi-factory</v-icon>
        </span>
        إضافة مصنع
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div v-if="loadingFactoryData" class="flex justify-center items-center py-12">
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

        <div class="mb-4">
          <TextareaInput
            v-model="form.notes"
            label="الملاحظات"
            placeholder="الملاحظات"
            :rows="4"
            :hide-details="true"
          />
        </div>

        <div class="mb-4">
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
        </div>
      </div>
    </v-form>

    <template #actions>
      <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
        custom-class="font-semibold text-base sm:flex-1" label="حفظ"
        prepend-icon="mdi-plus" @click="handleSave"
        :loading="saving" :disabled="saving" />
      
      <ButtonWithIcon variant="flat" color="primary-50" height="44" rounded="4"
        custom-class="font-semibold text-base text-primary-700 sm:flex-1"
        label="إغلاق" prepend-icon="mdi-close" @click="closeDialog" />
    </template>
  </AppDialog>
</template>

<style scoped></style>
