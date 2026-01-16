<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface TestMethodologyForm {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  status: boolean;
}

const formRef = ref<any | null>(null);
const isFormValid = ref(false);
const isEditMode = ref(false);
const testMethodologyId = ref<string | null>(null);

const form = reactive<TestMethodologyForm>({
  nameAr: "",
  nameEn: "",
  descriptionAr: "",
  descriptionEn: "",
  status: true,
});

const testMethodologyIcon = `<svg width="39" height="48" viewBox="0 0 39 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 2.58398V11.5335C23.6667 12.7469 23.6667 13.3537 23.9028 13.8171C24.1105 14.2248 24.442 14.5563 24.8497 14.764C25.3132 15.0002 25.9199 15.0002 27.1333 15.0002H36.0828M28 25.8333H10.6667M28 34.5H10.6667M15 17.1667H10.6667M23.6667 2H12.4C8.75966 2 6.93949 2 5.54906 2.70846C4.32601 3.33163 3.33163 4.32601 2.70846 5.54906C2 6.93949 2 8.75966 2 12.4V34.9333C2 38.5737 2 40.3938 2.70846 41.7843C3.33163 43.0073 4.32601 44.0017 5.54906 44.6249C6.93949 45.3333 8.75966 45.3333 12.4 45.3333H26.2667C29.907 45.3333 31.7272 45.3333 33.1176 44.6249C34.3407 44.0017 35.335 43.0073 35.9582 41.7843C36.6667 40.3938 36.6667 38.5737 36.6667 34.9333V15L23.6667 2Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8359 5.00065H5.5026C5.03589 5.00065 4.80254 5.00065 4.62428 4.90982C4.46748 4.82993 4.33999 4.70244 4.2601 4.54564C4.16927 4.36738 4.16927 4.13403 4.16927 3.66732V0.833984M12.5026 15.834V10.5007C12.5026 10.0339 12.5026 9.80058 12.4118 9.62233C12.3319 9.46552 12.2044 9.33804 12.0476 9.25815C11.8693 9.16732 11.636 9.16732 11.1693 9.16732H5.5026C5.03589 9.16732 4.80254 9.16732 4.62428 9.25815C4.46748 9.33804 4.33999 9.46552 4.2601 9.62233C4.16927 9.80058 4.16927 10.0339 4.16927 10.5007V15.834M15.8359 6.10522V11.834C15.8359 13.2341 15.8359 13.9342 15.5635 14.469C15.3238 14.9394 14.9413 15.3218 14.4709 15.5615C13.9361 15.834 13.2361 15.834 11.8359 15.834H4.83594C3.43581 15.834 2.73574 15.834 2.20096 15.5615C1.73056 15.3218 1.3481 14.9394 1.10842 14.469C0.835938 13.9342 0.835938 13.2341 0.835938 11.834V4.83398C0.835938 3.43385 0.835938 2.73379 1.10842 2.19901C1.3481 1.7286 1.73056 1.34615 2.20096 1.10647C2.73574 0.833984 3.43581 0.833984 4.83594 0.833984H10.5647C10.9724 0.833984 11.1762 0.833984 11.368 0.880035C11.5381 0.920862 11.7006 0.988203 11.8497 1.07958C12.0179 1.18265 12.1621 1.32678 12.4503 1.61503L15.0549 4.2196C15.3431 4.50786 15.4873 4.65198 15.5903 4.82018C15.6817 4.9693 15.7491 5.13187 15.7899 5.30193C15.8359 5.49374 15.8359 5.69757 15.8359 6.10522Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const listIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6693 9.16602H6.66927M8.33594 12.4993H6.66927M13.3359 5.83268H6.66927M16.6693 5.66602V14.3327C16.6693 15.7328 16.6693 16.4329 16.3968 16.9677C16.1571 17.4381 15.7747 17.8205 15.3042 18.0602C14.7695 18.3327 14.0694 18.3327 12.6693 18.3327H7.33594C5.93581 18.3327 5.23574 18.3327 4.70096 18.0602C4.23056 17.8205 3.8481 17.4381 3.60842 16.9677C3.33594 16.4329 3.33594 15.7328 3.33594 14.3327V5.66602C3.33594 4.26588 3.33594 3.56582 3.60842 3.03104C3.8481 2.56063 4.23056 2.17818 4.70096 1.9385C5.23574 1.66602 5.93581 1.66602 7.33594 1.66602H12.6693C14.0694 1.66602 14.7695 1.66602 15.3042 1.9385C15.7747 2.17818 16.1571 2.56063 16.3968 3.03104C16.6693 3.56582 16.6693 4.26588 16.6693 5.66602Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const handleCancel = () => {
  router.push("/test-methodology/list");
};

const handleSave = async () => {
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  console.log("Saving test methodology:", form);

  router.push("/test-methodology/list");
};

onMounted(() => {
  testMethodologyId.value = route.params.id as string;
  isEditMode.value = !!testMethodologyId.value;

  if (isEditMode.value) {
    form.nameAr = "منهجية تجريبية";
    form.nameEn = "Test Methodology";
    form.descriptionAr = "وصف المنهجية بالعربية";
    form.descriptionEn = "Methodology description in English";
    form.status = true;
  }
});
</script>

<template>
  <default-layout>
    <div class="test-methodology-form-page">
      <PageHeader :icon="testMethodologyIcon" :title-key="isEditMode ? 'تعديل منهجية الاختبار' : 'إضافة منهجية اختبار'"
        :description-key="isEditMode ? 'تعديل بيانات منهجية الاختبار' : 'إضافة منهجية اختبار جديدة'" />

      <div class="bg-gray-50 rounded-lg p-6">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSave">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              <span v-html="listIcon"></span>
            </div>
            <h2 class="text-xl font-bold text-primary-900">المعلومات العامة للمنهجية</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2">
              <LanguageTabs :languages="availableLanguages" label="الإسم">
                <template #en>
                  <TextInput v-model="form.nameEn" placeholder="ادخل الاسم" :hide-details="false"
                    :rules="[(v: string) => !!v || 'Name is required']" />
                </template>
                <template #ar>
                  <TextInput v-model="form.nameAr" placeholder="ادخل الاسم" :hide-details="false"
                    :rules="[(v: string) => !!v || 'الاسم مطلوب']" />
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
                  <RichTextEditor v-model="form.descriptionEn" placeholder="Enter description" :hide-details="true" />
                </template>
                <template #ar>
                  <RichTextEditor v-model="form.descriptionAr" placeholder="ادخل الوصف" :hide-details="true" />
                </template>
              </LanguageTabs>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
            <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48"
              custom-class="min-w-56" :prepend-icon="saveIcon" label="حفظ" @click="handleSave" />
            
            <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
              custom-class="font-semibold text-base text-primary-700 px-6 min-w-56"
              label="إغلاق" @click="handleCancel" />
          </div>
        </v-form>
      </div>
    </div>
  </default-layout>
</template>
