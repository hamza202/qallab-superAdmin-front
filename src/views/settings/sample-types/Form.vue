<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface SampleTypeForm {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  status: boolean;
}

const formRef = ref<any | null>(null);
const isFormValid = ref(false);
const isEditMode = ref(false);
const sampleTypeId = ref<string | null>(null);

const form = reactive<SampleTypeForm>({
  nameAr: "",
  nameEn: "",
  descriptionAr: "",
  descriptionEn: "",
  status: true,
});

const sampleTypeIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.33594 25.9997L25.2274 36.4455C25.5117 36.5876 25.6538 36.6587 25.8028 36.6866C25.9349 36.7114 26.0703 36.7114 26.2024 36.6866C26.3514 36.6587 26.4935 36.5876 26.7778 36.4455L47.6693 25.9997M4.33594 36.8331L25.2274 47.2788C25.5117 47.4209 25.6538 47.492 25.8028 47.52C25.9349 47.5447 26.0703 47.5447 26.2024 47.52C26.3514 47.492 26.4935 47.4209 26.7778 47.2788L47.6693 36.8331M4.33594 15.1664L25.2274 4.72065C25.5117 4.57854 25.6538 4.50748 25.8028 4.47951C25.9349 4.45475 26.0703 4.45475 26.2024 4.47951C26.3514 4.50748 26.4935 4.57854 26.7778 4.72065L47.6693 15.1664L26.7778 25.6121C26.4935 25.7543 26.3514 25.8253 26.2024 25.8533C26.0703 25.8781 25.9349 25.8781 25.8028 25.8533C25.6538 25.8253 25.5117 25.7543 25.2274 25.6121L4.33594 15.1664Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const listIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6693 9.16602H6.66927M8.33594 12.4993H6.66927M13.3359 5.83268H6.66927M16.6693 5.66602V14.3327C16.6693 15.7328 16.6693 16.4329 16.3968 16.9677C16.1571 17.4381 15.7747 17.8205 15.3042 18.0602C14.7695 18.3327 14.0694 18.3327 12.6693 18.3327H7.33594C5.93581 18.3327 5.23574 18.3327 4.70096 18.0602C4.23056 17.8205 3.8481 17.4381 3.60842 16.9677C3.33594 16.4329 3.33594 15.7328 3.33594 14.3327V5.66602C3.33594 4.26588 3.33594 3.56582 3.60842 3.03104C3.8481 2.56063 4.23056 2.17818 4.70096 1.9385C5.23574 1.66602 5.93581 1.66602 7.33594 1.66602H12.6693C14.0694 1.66602 14.7695 1.66602 15.3042 1.9385C15.7747 2.17818 16.1571 2.56063 16.3968 3.03104C16.6693 3.56582 16.6693 4.26588 16.6693 5.66602Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const handleCancel = () => {
  router.push("/sample-types/list");
};

const handleSave = async () => {
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  console.log("Saving sample type:", form);

  router.push("/sample-types/list");
};

onMounted(() => {
  sampleTypeId.value = route.params.id as string;
  isEditMode.value = !!sampleTypeId.value;

  if (isEditMode.value) {
    form.nameAr = "نوع عينة تجريبي";
    form.nameEn = "Test Sample Type";
    form.descriptionAr = "وصف نوع العينة بالعربية";
    form.descriptionEn = "Sample type description in English";
    form.status = true;
  }
});
</script>

<template>
  <default-layout>
    <div class="sample-types-form-page">
      <PageHeader
        :icon="sampleTypeIcon"
        :title-key="isEditMode ? 'تعديل نوع العينة' : 'نوع عينة جديد'"
        :description-key="isEditMode ? 'تعديل بيانات نوع العينة' : 'إضافة نوع عينة جديد'"
      />

      <div class="bg-gray-50 rounded-lg p-6">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSave">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              <span v-html="listIcon"></span>
            </div>
            <h2 class="text-xl font-bold text-primary-900">نوع عينة جديد</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2">
              <LanguageTabs :languages="availableLanguages" label="الإسم بالعربية">
                <template #en>
                  <TextInput
                    v-model="form.nameEn"
                    placeholder="ادخل الاسم"
                    :hide-details="false"
                    :rules="[(v: string) => !!v || 'Name is required']"
                  />
                </template>
                <template #ar>
                  <TextInput
                    v-model="form.nameAr"
                    placeholder="ادخل الاسم"
                    :hide-details="false"
                    :rules="[(v: string) => !!v || 'الاسم مطلوب']"
                  />
                </template>
              </LanguageTabs>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">الحالة</label>
              <div class="flex items-center gap-3 mt-1">
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

            <div class="md:col-span-3">
              <LanguageTabs :languages="availableLanguages" label="الوصف">
                <template #en>
                  <RichTextEditor
                    v-model="form.descriptionEn"
                    placeholder="Enter description"
                    :hide-details="true"
                  />
                </template>
                <template #ar>
                  <RichTextEditor
                    v-model="form.descriptionAr"
                    placeholder="ادخل الوصف"
                    :hide-details="true"
                  />
                </template>
              </LanguageTabs>
            </div>
          </div>

          <div class="flex gap-3 justify-center px-6 py-4 mt-4">
            <v-btn variant="flat" color="primary" height="48" class="font-semibold text-base px-12" @click="handleSave">
              <template #prepend>
                <v-icon>mdi-content-save-outline</v-icon>
              </template>
              حفظ
            </v-btn>
            <v-btn variant="outlined" color="primary" height="48" class="font-semibold text-base px-12"
              @click="handleCancel">
              <template #prepend>
                <v-icon>mdi-close</v-icon>
              </template>
              إلغاء
            </v-btn>
          </div>
        </v-form>
      </div>
    </div>
  </default-layout>
</template>
