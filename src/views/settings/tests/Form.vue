<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface TestForm {
  testCode: string;
  nameAr: string;
  nameEn: string;
  testMethod: string | null;
  descriptionAr: string;
  descriptionEn: string;
  unitPrice: string;
  minPrice: string;
  minPriceLimit: string;
  minSampleRequirement: string;
  sampleLocation: string | null;
  sampleUnit: string | null;
  testResultUnit: string | null;
  testGroup: string | null;
  retentionDays: string;
  sampleType: string | null;
  status: boolean;
}

const formRef = ref<any | null>(null);
const isFormValid = ref(false);
const isEditMode = ref(false);
const testId = ref<string | null>(null);

const form = reactive<TestForm>({
  testCode: "",
  nameAr: "",
  nameEn: "",
  testMethod: null,
  descriptionAr: "",
  descriptionEn: "",
  unitPrice: "",
  minPrice: "",
  minPriceLimit: "",
  minSampleRequirement: "",
  sampleLocation: null,
  sampleUnit: null,
  testResultUnit: null,
  testGroup: null,
  retentionDays: "",
  sampleType: null,
  status: true,
});

const testMethodItems = ref([
  { title: "منهجية 1", value: "منهجية 1" },
  { title: "منهجية 2", value: "منهجية 2" },
  { title: "منهجية 3", value: "منهجية 3" },
]);

const testGroupItems = ref([
  { title: "مجموعة 1", value: "مجموعة 1" },
  { title: "مجموعة 2", value: "مجموعة 2" },
  { title: "مجموعة 3", value: "مجموعة 3" },
]);

const sampleUnitItems = ref([
  { title: "وحدة 1", value: "وحدة 1" },
  { title: "وحدة 2", value: "وحدة 2" },
]);

const testResultUnitItems = ref([
  { title: "وحدة 1", value: "وحدة 1" },
  { title: "وحدة 2", value: "وحدة 2" },
]);

const sampleTypeItems = ref([
  { title: "نوع 1", value: "نوع 1" },
  { title: "نوع 2", value: "نوع 2" },
]);

const testIcon = `<svg width="39" height="48" viewBox="0 0 39 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 21.5H10.6667M15 30.1667H10.6667M28 12.8333H10.6667M36.6667 12.4V34.9333C36.6667 38.5737 36.6667 40.3938 35.9582 41.7843C35.335 43.0073 34.3407 44.0017 33.1176 44.6249C31.7272 45.3333 29.907 45.3333 26.2667 45.3333H12.4C8.75966 45.3333 6.93949 45.3333 5.54906 44.6249C4.32601 44.0017 3.33163 43.0073 2.70846 41.7843C2 40.3938 2 38.5737 2 34.9333V12.4C2 8.75966 2 6.93949 2.70846 5.54906C3.33163 4.32601 4.32601 3.33163 5.54906 2.70846C6.93949 2 8.75966 2 12.4 2H26.2667C29.907 2 31.7272 2 33.1176 2.70846C34.3407 3.33163 35.335 4.32601 35.9582 5.54906C36.6667 6.93949 36.6667 8.75966 36.6667 12.4Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.08333 0.750122H10.4788C10.8864 0.750122 11.0902 0.750122 11.2821 0.796172C11.4521 0.837 11.6147 0.904341 11.7638 0.995722C11.932 1.09879 12.0761 1.24292 12.3644 1.53117L14.969 4.13574C15.2572 4.42399 15.4013 4.56812 15.5044 4.73631C15.5958 4.88543 15.6631 5.04801 15.7039 5.21807C15.75 5.40988 15.75 5.61371 15.75 6.02136V12.4168M8.66667 6.58346H5.41667C4.94996 6.58346 4.7166 6.58346 4.53834 6.49263C4.38154 6.41273 4.25406 6.28525 4.17416 6.12845C4.08333 5.95019 4.08333 5.71683 4.08333 5.25012V3.66679M9.5 15.7501V12.0835C9.5 11.6167 9.5 11.3834 9.40917 11.2051C9.32928 11.0483 9.20179 10.9208 9.04499 10.8409C8.86673 10.7501 8.63338 10.7501 8.16667 10.7501H5.41667C4.94996 10.7501 4.7166 10.7501 4.53834 10.8409C4.38154 10.9208 4.25406 11.0483 4.17416 11.2051C4.08333 11.3834 4.08333 11.6167 4.08333 12.0835V15.7501M12.8333 6.71907V13.0835C12.8333 14.0169 12.8333 14.4836 12.6517 14.8401C12.4919 15.1537 12.2369 15.4087 11.9233 15.5685C11.5668 15.7501 11.1001 15.7501 10.1667 15.7501H3.41667C2.48325 15.7501 2.01654 15.7501 1.66002 15.5685C1.34641 15.4087 1.09144 15.1537 0.931656 14.8401C0.75 14.4836 0.75 14.0169 0.75 13.0835V6.33346C0.75 5.40003 0.75 4.93332 0.931656 4.5768C1.09144 4.2632 1.34641 4.00823 1.66002 3.84844C2.01654 3.66679 2.48325 3.66679 3.41667 3.66679H9.78105C9.98487 3.66679 10.0868 3.66679 10.1827 3.68981C10.2677 3.71023 10.349 3.7439 10.4236 3.78959C10.5077 3.84112 10.5797 3.91319 10.7239 4.05731L12.4428 5.77626C12.5869 5.92039 12.659 5.99245 12.7105 6.07655C12.7562 6.15111 12.7899 6.2324 12.8103 6.31743C12.8333 6.41333 12.8333 6.51525 12.8333 6.71907Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const listIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6693 9.16602H6.66927M8.33594 12.4993H6.66927M13.3359 5.83268H6.66927M16.6693 5.66602V14.3327C16.6693 15.7328 16.6693 16.4329 16.3968 16.9677C16.1571 17.4381 15.7747 17.8205 15.3042 18.0602C14.7695 18.3327 14.0694 18.3327 12.6693 18.3327H7.33594C5.93581 18.3327 5.23574 18.3327 4.70096 18.0602C4.23056 17.8205 3.8481 17.4381 3.60842 16.9677C3.33594 16.4329 3.33594 15.7328 3.33594 14.3327V5.66602C3.33594 4.26588 3.33594 3.56582 3.60842 3.03104C3.8481 2.56063 4.23056 2.17818 4.70096 1.9385C5.23574 1.66602 5.93581 1.66602 7.33594 1.66602H12.6693C14.0694 1.66602 14.7695 1.66602 15.3042 1.9385C15.7747 2.17818 16.1571 2.56063 16.3968 3.03104C16.6693 3.56582 16.6693 4.26588 16.6693 5.66602Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const handleCancel = () => {
  router.push("/tests/list");
};

const handleSave = async () => {
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  // TODO: Implement API call to save data
  console.log("Saving test:", form);

  // Navigate back to list
  router.push("/tests/list");
};

onMounted(() => {
  testId.value = route.params.id as string;
  isEditMode.value = !!testId.value;

  if (isEditMode.value) {
    // TODO: Load test data from API
    // For now, using mock data
    form.testCode = "IM5_25565";
    form.nameAr = "اختبار تجريبي";
    form.nameEn = "Test Sample";
    form.testMethod = null;
    form.descriptionAr = "وصف الاختبار بالعربية";
    form.descriptionEn = "Test description in English";
    form.unitPrice = "100";
    form.minPrice = "50";
    form.minPriceLimit = "10";
    form.minSampleRequirement = "5";
    form.sampleLocation = null;
    form.sampleUnit = null;
    form.testResultUnit = null;
    form.testGroup = null;
    form.retentionDays = "10";
    form.sampleType = null;
    form.status = true;
  }
});
</script>

<template>
  <default-layout>
    <div class="test-form-page">
      <PageHeader :icon="testIcon" :title-key="isEditMode ? 'تعديل الاختبار' : 'إضافة اختبار'"
        :description-key="isEditMode ? 'تعديل بيانات الاختبار' : 'إضافة اختبار جديد'" />

      <div class="bg-gray-50 rounded-lg p-6">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSave">
          <!-- Section Header -->
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              <span v-html="listIcon"></span>
            </div>
            <h2 class="text-xl font-bold text-primary-900">المعلومات العامة للاختبار</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Test Code -->
            <TextInput v-model="form.testCode" placeholder="IM5_25565" label="كود الاختبار" :hide-details="false" />

            <!-- Name (Bilingual) -->
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

            <!-- Test Method -->
            <SelectWithIconInput label="منهجية الاختبار" v-model="form.testMethod" show-add-button
              :items="testMethodItems" placeholder="اختر" :hide-details="false" />

            <!-- Description (Bilingual) -->
            <div class="md:col-span-2 md:row-span-2">
              <LanguageTabs :languages="availableLanguages" label="الوصف">
                <template #en>
                  <TextareaInput v-model="form.descriptionEn" placeholder="Enter description" :hide-details="true" />
                </template>
                <template #ar>
                  <TextareaInput v-model="form.descriptionAr" placeholder="ادخل الوصف" :hide-details="true" />
                </template>
              </LanguageTabs>
            </div>

            <!-- Unit Price -->
            <TextInput v-model="form.unitPrice" placeholder="10" type="number" label="سعر الوحدة" :hide-details="false" />

            <!-- Min Price -->
            <TextInput v-model="form.minPrice" placeholder="10" type="number" label="أقل سعر وحدة" :hide-details="false" />

            <!-- Min Price Limit -->
            <TextInput v-model="form.minPriceLimit" placeholder="10" type="number" label="الحد الادنى لكمية" :hide-details="false" />

            <!-- Min Sample Requirement -->
            <TextInput v-model="form.minSampleRequirement" placeholder="5" type="number" label="الحد الادنى لمتطلبات العينة" :hide-details="false" />

            <!-- Sample Location -->
            <TextInput v-model="form.sampleLocation" placeholder="10" type="number" label="مكان النشاط العينة" :hide-details="false" />

            <!-- Sample Unit -->
            <SelectWithIconInput show-add-button v-model="form.sampleUnit" :items="sampleUnitItems" placeholder="اختر"
              label="وحدة العينة" :hide-details="false" />

            <!-- Test Result Unit -->
            <SelectWithIconInput show-add-button v-model="form.testResultUnit" :items="testResultUnitItems" placeholder="اختر"
              label="وحدة نتيجة الاختبار" :hide-details="false" />

            <!-- Test Group -->
            <SelectWithIconInput show-add-button v-model="form.testGroup" :items="testGroupItems" placeholder="اختر" 
              label="مجموعة الاختبار" :hide-details="false" />

            <!-- Retention Days -->
            <TextInput v-model="form.retentionDays" placeholder="10" type="number" label="مدة الاحتفاظ بالعينة بالايام" :hide-details="false" />

            <!-- Sample Type -->
            <SelectWithIconInput show-add-button v-model="form.sampleType" :items="sampleTypeItems" placeholder="اختر"
              label="نوع العينة" :hide-details="false" />

            <!-- Status -->
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
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center gap-5 mt-10 lg:flex-row flex-col">
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

<style scoped></style>
