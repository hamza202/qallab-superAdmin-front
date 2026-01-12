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
<path d="M23.6667 21.5H10.6667M15 30.1667H10.6667M28 12.8333H10.6667M36.6667 12.4V34.9333C36.6667 38.5737 36.6667 40.3938 35.9582 41.7843C35.335 43.0073 34.3407 44.0017 33.1176 44.6249C31.7272 45.3333 29.907 45.3333 26.2667 45.3333H12.4C8.75966 45.3333 6.93949 45.3333 5.54906 44.6249C4.32601 44.0017 3.33163 43.0073 2.70846 41.7843C2 40.3938 2 38.5737 2 34.9333V12.4C2 8.75966 2 6.93949 2.70846 5.54906C3.33163 4.32601 4.32601 3.33163 5.54906 2.70846C6.93949 2 8.75966 2 12.4 2H26.2667C29.907 2 31.7272 2 33.1176 2.70846C34.3407 3.33163 35.335 4.32601 35.9582 5.54906C36.6667 6.93949 36.6667 8.75966 36.6667 12.4Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const listIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6693 9.16602H6.66927M8.33594 12.4993H6.66927M13.3359 5.83268H6.66927M16.6693 5.66602V14.3327C16.6693 15.7328 16.6693 16.4329 16.3968 16.9677C16.1571 17.4381 15.7747 17.8205 15.3042 18.0602C14.7695 18.3327 14.0694 18.3327 12.6693 18.3327H7.33594C5.93581 18.3327 5.23574 18.3327 4.70096 18.0602C4.23056 17.8205 3.8481 17.4381 3.60842 16.9677C3.33594 16.4329 3.33594 15.7328 3.33594 14.3327V5.66602C3.33594 4.26588 3.33594 3.56582 3.60842 3.03104C3.8481 2.56063 4.23056 2.17818 4.70096 1.9385C5.23574 1.66602 5.93581 1.66602 7.33594 1.66602H12.6693C14.0694 1.66602 14.7695 1.66602 15.3042 1.9385C15.7747 2.17818 16.1571 2.56063 16.3968 3.03104C16.6693 3.56582 16.6693 4.26588 16.6693 5.66602Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

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
      <PageHeader
        :icon="testMethodologyIcon"
        :title-key="isEditMode ? 'تعديل منهجية الاختبار' : 'إضافة منهجية اختبار'"
        :description-key="isEditMode ? 'تعديل بيانات منهجية الاختبار' : 'إضافة منهجية اختبار جديدة'"
      />

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

          <!-- Action Buttons -->
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
