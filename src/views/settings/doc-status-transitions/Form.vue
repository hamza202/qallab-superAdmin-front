<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { SaveDoubleIcon, fileIcon, fileCheckIcon, SettingsIcon, trash_1_icon, trash_2_icon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";
import TopHeader from "@/components/price-offers/TopHeader.vue";

const api = useApi();
const route = useRoute();
const router = useRouter();

const formErrors = reactive<Record<string, string>>({});

const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface TransitionForm {
  id?: number;
  doc_id: number | null;
  doc_slug: string;
  status_level: string | null;
  status_id: number | null;
  descriptionAr: string;
  descriptionEn: string;
  is_active: boolean;
  is_required: boolean;
  has_auto_action: boolean;
  requires_approval: boolean;
}

const formRef = ref<any>(null);
const isFormValid = ref(false);
const loadingTransitionData = ref(false);
const saving = ref(false);

const form = reactive<TransitionForm>({
  doc_id: null,
  doc_slug: "",
  status_level: null,
  status_id: null,
  descriptionAr: "",
  descriptionEn: "",
  is_active: true,
  is_required: false,
  has_auto_action: false,
  requires_approval: false,
});

const documentSettings = ref<Array<{ title: string; value: number; slug: string }>>([]);
const statusLevels = ref<Array<{ title: string; value: string }>>([]);
const systemStatuses = ref<Array<{ title: string; value: number; slug: string }>>([]);

const isEditMode = computed(() => !!route.params.id);

const fetchTransitionData = async (transitionId: string) => {
  try {
    loadingTransitionData.value = true;
    const response = await api.get(`/doc-status-transitions/${transitionId}`);
    const transition = response.data;

    form.id = transition.id;
    form.doc_id = transition.doc_id || null;
    form.doc_slug = transition.doc_slug || "";
    form.status_level = transition.status_level || null;
    form.status_id = transition.status_id || null;
    form.descriptionAr = transition.description_translations?.ar || "";
    form.descriptionEn = transition.description_translations?.en || "";
    form.is_active = Boolean(transition.is_active);
    form.is_required = Boolean(transition.is_required);
    form.has_auto_action = Boolean(transition.has_auto_action);
    form.requires_approval = Boolean(transition.requires_approval);
  } catch (err: any) {
    console.error('Error fetching transition details:', err);
    toast.error(err?.response?.data?.message || 'Failed to fetch transition details');
    router.push('/settings/doc-status-transitions/list');
  } finally {
    loadingTransitionData.value = false;
  }
};

const fetchDocumentSettings = async () => {
  try {
    const response = await api.get('/document-settings/list');
    documentSettings.value = response.data.map((doc: any) => ({
      title: doc.name,
      value: doc.id,
      slug: doc.slug
    }));
  } catch (err: any) {
    console.error('Error fetching document settings:', err);
  }
};

const fetchConstants = async () => {
  try {
    const response = await api.get('/doc-status-transitions/constants');
    statusLevels.value = response.data.status_levels.map((level: any) => ({
      title: level.label,
      value: level.key
    }));
  } catch (err: any) {
    console.error('Error fetching constants:', err);
  }
};

const fetchSystemStatuses = async () => {
  try {
    const response = await api.get('/system-statuses/list');
    systemStatuses.value = response.data.map((status: any) => ({
      title: status.name,
      value: status.id,
      slug: status.slug || ''
    }));
  } catch (err: any) {
    console.error('Error fetching system statuses:', err);
  }
};

const resetForm = () => {
  delete form.id;
  form.doc_id = null;
  form.doc_slug = "";
  form.status_level = null;
  form.status_id = null;
  form.descriptionAr = "";
  form.descriptionEn = "";
  form.is_active = true;
  form.is_required = false;
  form.has_auto_action = false;
  form.requires_approval = false;
};

const handleCancel = () => {
  router.push('/settings/doc-status-transitions/list');
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
      doc_id: form.doc_id,
      doc_slug: form.doc_slug,
      status_level: form.status_level,
      status_id: form.status_id,
      is_active: form.is_active,
      is_required: form.is_required,
      has_auto_action: form.has_auto_action,
      description: {
        en: form.descriptionEn,
        ar: form.descriptionAr,
      },
    };

    if (form.id) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('doc_id', String(form.doc_id || ''));
      formData.append('doc_slug', form.doc_slug);
      formData.append('status_level', form.status_level || '');
      formData.append('status_id', String(form.status_id || ''));
      formData.append('is_active', form.is_active ? '1' : '0');
      formData.append('is_required', form.is_required ? '1' : '0');
      formData.append('has_auto_action', form.has_auto_action ? '1' : '0');
      formData.append('description[en]', form.descriptionEn);
      formData.append('description[ar]', form.descriptionAr);

      await api.post(`/doc-status-transitions/${form.id}`, formData);
      toast.success('تم تحديث مسار العمل بنجاح');
    } else {
      await api.post('/doc-status-transitions', payload);
      toast.success('تم إضافة مسار العمل بنجاح');
    }

    router.push('/settings/doc-status-transitions/list');
  } catch (err: any) {
    console.error('Error saving transition:', err);

    if (err?.response?.status === 422 && err?.response?.data?.errors) {
      const apiErrors = err.response.data.errors;
      Object.keys(apiErrors).forEach(key => {
        formErrors[key] = apiErrors[key][0];
      });
      toast.error(err?.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
    } else {
      toast.error(err?.response?.data?.message || 'Failed to save transition');
    }
  } finally {
    saving.value = false;
  }
};

// Watchers to auto-populate slug fields
watch(() => form.doc_id, (newDocId) => {
  if (newDocId) {
    const selectedDoc = documentSettings.value.find(doc => doc.value === newDocId);
    if (selectedDoc) {
      form.doc_slug = selectedDoc.slug;
    }
  } else {
    form.doc_slug = ""
  }
});

onMounted(async () => {
  fetchDocumentSettings(), fetchConstants(), fetchSystemStatuses();

  if (isEditMode.value && route.params.id) {
    await fetchTransitionData(route.params.id as string);
  }
});
</script>

<template>
  <default-layout>
    <div class="doc-status-transitions-form-page -mx-6">
      <!-- Page Header -->
      <TopHeader :icon="fileCheckIcon" title-key="pages.docStatusTransitions.FormTitle"
        description-key="pages.docStatusTransitions.FormDescription" :show-action="false" />

      <!-- Loading State -->
      <div v-if="loadingTransitionData" class="flex justify-center items-center py-20">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else class="p-6">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSave">
          <div class="flex items-center gap-2 text-primary-600 mb-4">
            <span class="w-[17px] h-[20px]" v-html="fileCheckIcon"></span>
            <h2 class="text-base font-bold">البيانات الأساسية</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-8">
            <!-- Document Selection -->
            <SelectInput v-model="form.doc_id" clearable :items="documentSettings" label="اسم المستند"
              placeholder="اختر المستند" :rules="[required()]" :error-messages="formErrors['doc_id']"
              @update:model-value="delete formErrors['doc_id']" />

            <!-- Document Slug (Show only in edit mode) -->
            <TextInput disabled v-model="form.doc_slug" label="معرف المستند" placeholder="قم باختيار المستند"
              :rules="[required()]" :error-messages="formErrors['doc_slug']"
              @update:model-value="delete formErrors['doc_slug']" />

            <!-- Status Level -->
            <SelectInput v-model="form.status_level" clearable :items="statusLevels" label="مستوى الحالة"
              placeholder="اختر مستوى الحالة" :rules="[required()]" :error-messages="formErrors['status_level']"
              @update:model-value="delete formErrors['status_level']" />

            <!-- Status Selection -->
            <SelectInput v-model="form.status_id" clearable :items="systemStatuses" label="اسم الحالة"
              placeholder="اختر اسم الحالة" :rules="[required()]" :error-messages="formErrors['status_id']"
              @update:model-value="delete formErrors['status_id']" />

            <!-- Active Status -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">الحالة</label>
              <div class="flex items-center gap-3 mt-1">
                <v-radio-group v-model="form.is_active" inline hide-details>
                  <v-radio :value="true" color="primary">
                    <template #label>
                      <span :class="form.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                        فعال
                      </span>
                    </template>
                  </v-radio>
                  <v-radio :value="false" color="primary">
                    <template #label>
                      <span :class="!form.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                        غير فعال
                      </span>
                    </template>
                  </v-radio>
                </v-radio-group>
              </div>
            </div>

            <!-- Other Options -->
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-3">خيارات أخرى</label>
              <div class="flex sm:items-center flex-col sm:flex-row sm:gap-5 xl:gap-10">
                <v-checkbox v-model="form.is_required" color="primary" hide-details density="compact">
                  <template #label>
                    <span class="text-sm font-medium text-gray-700">مطلوب</span>
                  </template>
                </v-checkbox>
                <v-checkbox v-model="form.has_auto_action" color="primary" hide-details density="compact">
                  <template #label>
                    <span class="text-sm font-medium text-gray-700">تطبيق إجراء تلقائي</span>
                  </template>
                </v-checkbox>

                <v-checkbox v-model="form.requires_approval" color="primary" hide-details density="compact">
                  <template #label>
                    <span class="text-sm font-medium text-gray-700">يحتاج موافقة</span>
                  </template>
                </v-checkbox>
              </div>
            </div>

            <LanguageTabs :languages="availableLanguages" label="الوصف" class="md:col-span-2">
              <template #en>
                <TextareaInput v-model="form.descriptionEn" placeholder="Description in English" :rows="4"
                  :hide-details="true" />
              </template>
              <template #ar>
                <TextareaInput v-model="form.descriptionAr" placeholder="الوصف بالعربية" :rows="4"
                  :hide-details="true" />
              </template>
            </LanguageTabs>

          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
            <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
              :prepend-icon="SaveDoubleIcon" :label="isEditMode ? 'تحديث' : 'حفظ'" :loading="saving" :disabled="saving"
              @click="handleSave" />

            <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
              custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق" :disabled="saving"
              @click="handleCancel" />
          </div>
        </v-form>
      </div>
    </div>
  </default-layout>
</template>
